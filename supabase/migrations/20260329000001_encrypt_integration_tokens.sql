-- ============================================================
-- Encrypt access_token and refresh_token in integrations table
-- using pgcrypto (pgp_sym_encrypt) with the passphrase stored
-- in Supabase Vault.
--
-- Setup required BEFORE this migration runs in production:
--
--   1. Create the vault secret (run once as postgres / via Supabase SQL editor):
--
--      SELECT vault.create_secret(
--        'REPLACE_WITH_A_STRONG_RANDOM_PASSPHRASE',  -- min 32 chars
--        'integrations_enc_key',
--        'Symmetric passphrase for pgp_sym_encrypt on integrations tokens'
--      );
--
--      Or, if you prefer the CLI:
--        supabase secrets set INTEGRATIONS_ENC_KEY="<passphrase>"
--      and then reference it in the functions below via
--        current_setting('app.settings.INTEGRATIONS_ENC_KEY', true)
--      instead of the vault lookup (swap the implementation in
--      encrypt_token / decrypt_token accordingly).
--
--   2. Run this migration:
--        supabase db push
--      or apply it in the Supabase SQL editor.
--
-- Architecture:
--   - pgcrypto's pgp_sym_encrypt (AES-256 + integrity check) encrypts tokens.
--   - The passphrase lives only in Supabase Vault, never in application code.
--   - A BEFORE INSERT/UPDATE trigger transparently encrypts on write.
--   - A SECURITY DEFINER view (decrypted_integrations) is the ONLY way to
--     read plaintext tokens; it is restricted to service_role.
--   - Authenticated / anon clients can only see ciphertext in integrations
--     (and cannot call decrypt_token, which is also restricted).
-- ============================================================

-- ── 1. Extension ─────────────────────────────────────────────────────────────
-- pgcrypto must be in the extensions schema (Supabase default).
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ── 2. Encryption helpers ────────────────────────────────────────────────────
-- Both functions are SECURITY DEFINER so they can access vault.decrypted_secrets
-- (which requires elevated privileges). Access from client roles is revoked below.

CREATE OR REPLACE FUNCTION public.encrypt_token(plaintext text)
  RETURNS text
  LANGUAGE sql
  SECURITY DEFINER
  STABLE
  SET search_path = extensions, public, vault
AS $$
  SELECT encode(
    pgp_sym_encrypt(
      plaintext,
      (SELECT decrypted_secret
         FROM vault.decrypted_secrets
        WHERE name = 'integrations_enc_key'
        LIMIT 1)
    ),
    'base64'
  )
$$;

CREATE OR REPLACE FUNCTION public.decrypt_token(ciphertext text)
  RETURNS text
  LANGUAGE sql
  SECURITY DEFINER
  STABLE
  SET search_path = extensions, public, vault
AS $$
  SELECT pgp_sym_decrypt(
    decode(ciphertext, 'base64'),
    (SELECT decrypted_secret
       FROM vault.decrypted_secrets
      WHERE name = 'integrations_enc_key'
      LIMIT 1)
  )
$$;

-- Revoke from all client-facing roles.
-- encrypt_token is invoked only by the trigger (running as the function owner).
-- decrypt_token is granted only to service_role so Edge Functions can read plaintext.
REVOKE EXECUTE ON FUNCTION public.encrypt_token(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.decrypt_token(text) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.decrypt_token(text) TO service_role;

-- ── 3. Auto-encrypt trigger ───────────────────────────────────────────────────
-- Fires BEFORE INSERT or UPDATE *only when token columns are in the SET clause*.
-- This prevents re-encryption of already-encrypted ciphertext on unrelated UPDATEs
-- (e.g. updating only expires_at does NOT trigger this).

CREATE OR REPLACE FUNCTION public.encrypt_integration_tokens()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = extensions, public, vault
AS $$
BEGIN
  IF NEW.access_token IS NOT NULL THEN
    NEW.access_token := public.encrypt_token(NEW.access_token);
  END IF;
  IF NEW.refresh_token IS NOT NULL THEN
    NEW.refresh_token := public.encrypt_token(NEW.refresh_token);
  END IF;
  RETURN NEW;
END;
$$;

-- DROP first so re-running the migration is idempotent.
DROP TRIGGER IF EXISTS encrypt_tokens_before_write ON public.integrations;

CREATE TRIGGER encrypt_tokens_before_write
  BEFORE INSERT OR UPDATE OF access_token, refresh_token
  ON public.integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_integration_tokens();

-- ── 4. Decrypted view for Edge Functions ─────────────────────────────────────
-- Edge Functions (service_role) query this view to get plaintext tokens
-- transparently. No client role can access it.

DROP VIEW IF EXISTS public.decrypted_integrations;

CREATE VIEW public.decrypted_integrations AS
  SELECT
    id,
    user_id,
    provider,
    CASE WHEN access_token  IS NOT NULL THEN public.decrypt_token(access_token)  END AS access_token,
    CASE WHEN refresh_token IS NOT NULL THEN public.decrypt_token(refresh_token) END AS refresh_token,
    expires_at,
    connected_email,
    created_at,
    updated_at
  FROM public.integrations;

REVOKE ALL    ON public.decrypted_integrations FROM PUBLIC, anon, authenticated;
GRANT  SELECT ON public.decrypted_integrations TO service_role;

-- ── 5. Migrate existing plaintext rows ───────────────────────────────────────
-- Encrypts any tokens written before this migration.
-- Guarded: if the vault secret does not exist yet, emits a NOTICE and skips
-- (you must run the UPDATE manually after creating the secret).
-- The trigger is disabled during this block to avoid double-encryption.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM vault.decrypted_secrets WHERE name = 'integrations_enc_key'
  ) THEN
    ALTER TABLE public.integrations DISABLE TRIGGER encrypt_tokens_before_write;

    UPDATE public.integrations
    SET
      access_token  = CASE WHEN access_token  IS NOT NULL
                           THEN public.encrypt_token(access_token)  END,
      refresh_token = CASE WHEN refresh_token IS NOT NULL
                           THEN public.encrypt_token(refresh_token) END
    WHERE access_token IS NOT NULL
       OR refresh_token IS NOT NULL;

    ALTER TABLE public.integrations ENABLE TRIGGER encrypt_tokens_before_write;

    RAISE NOTICE 'Existing integration tokens encrypted successfully.';
  ELSE
    RAISE NOTICE
      'Vault secret "integrations_enc_key" not found. '
      'Existing plaintext tokens were NOT encrypted. '
      'After creating the secret, run: '
      'UPDATE public.integrations '
      'SET access_token = public.encrypt_token(access_token), '
      'refresh_token = public.encrypt_token(refresh_token);';
  END IF;
END $$;
