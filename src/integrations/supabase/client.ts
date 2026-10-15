import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { brokeredPreviewStorage } from './previewAuthStorage';

// ── Canonical project values (source of truth) ───────────────────────────────
// Project: ovlxdqxxupgqomgegecy  ← NEVER change this to nrbapwkuonkxzxuscgwv
// If env vars are missing (e.g. local dev without .env), these fallbacks keep
// the app running. Lovable injects the real values at runtime anyway.
const CORRECT_PROJECT_ID = "nrbapwkuonkxzxuscgwv";
const FALLBACK_URL = `https://${CORRECT_PROJECT_ID}.supabase.co`;
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYmFwd2t1b25reHp4dXNjZ3d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MDY1NzUsImV4cCI6MjA5MDM4MjU3NX0.dndfpPEnbie94g2Z8bp3a9_1z9rXBO-rnXHvzlA-Zms";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? FALLBACK_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? FALLBACK_KEY;

// Guard: catch wrong project at startup rather than showing a blank screen
if (!SUPABASE_URL.includes(CORRECT_PROJECT_ID)) {
  console.error(
    `[Supabase] Wrong project URL detected: ${SUPABASE_URL}\n` +
    `Expected project: ${CORRECT_PROJECT_ID}\n` +
    `Check your .env — VITE_SUPABASE_URL must point to ${FALLBACK_URL}`
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: brokeredPreviewStorage(),
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  }
});
