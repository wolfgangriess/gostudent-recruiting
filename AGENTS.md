# GoStudent Recruiting — Agent rules

Read this before changing anything. The project is built in Lovable and synced to GitHub both ways.

## Stack
- React 18 + Vite + TypeScript + Tailwind + shadcn/ui. Not Next.js — no NextAuth, Prisma or API routes (they will not run).
- Backend: Lovable Cloud (Supabase project `ovlxdqxxupgqomgegecy`). Server code lives only in `supabase/functions/*` (Deno edge functions).

## Never edit (auto-generated; edits break the app)
- `src/integrations/supabase/client.ts`, `src/integrations/supabase/types.ts`, `.env`, `src/integrations/lovable/index.ts` — a hardcoded wrong project ID here once caused a blank app.
- `supabase/config.toml` project settings (per-function `verify_jwt` entries are fine).

## Rules
- Sign-in uses `lovable.auth.signInWithOAuth("google", …)` from `@/integrations/lovable` — direct `supabase.auth.signInWithOAuth` fails with "missing OAuth secret".
- Schema changes go through Lovable (ask the Lovable agent); every new public table needs GRANTs + RLS policies, or the app gets permission errors.
- ATS tables (jobs, pipeline_stages, candidates, scorecard_templates, scorecard_evaluations, offers) are accessed via `@/integrations/supabase/untyped-client`; row types live in `src/integrations/supabase/app-types.ts`.
- Google Calendar uses its own OAuth via edge functions `google-calendar-auth` / `google-calendar-callback` / `google-calendar-api`; tokens are stored in the `integrations` table. Secrets `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are set in Lovable Cloud, never in code.
- Always reuse existing components (shadcn ui, existing dialogs/cards) instead of creating new ones.

## Status
- Working: Google sign-in, ATS database tables (start out empty), Google Calendar connect (needs the Google Cloud consent screen to be published or the user added as a test user).
- `CLAUDE_CODE_BRIEFING.md` is an older plan and partly outdated (e.g. the mock store notes); this file takes precedence.
- `.env` must stay committed and must not be listed in `.gitignore` — it only holds public keys, and removing it breaks the app with "supabaseUrl is required".
