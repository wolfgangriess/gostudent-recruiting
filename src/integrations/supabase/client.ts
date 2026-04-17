import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// ── Canonical project values (source of truth) ───────────────────────────────
// Project: ovlxdqxxupgqomgegecy  ← NEVER change this to nrbapwkuonkxzxuscgwv
// If env vars are missing (e.g. local dev without .env), these fallbacks keep
// the app running. Lovable injects the real values at runtime anyway.
const CORRECT_PROJECT_ID = "ovlxdqxxupgqomgegecy";
const FALLBACK_URL = `https://${CORRECT_PROJECT_ID}.supabase.co`;
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92bHhkcXh4dXBncW9tZ2VnZWN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NTQ2NTgsImV4cCI6MjA4OTIzMDY1OH0.aB2tCcC7FuvDcsmmoj4F3XaNSmrp1qn1vDhzXVS3xdM";

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
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  }
});
