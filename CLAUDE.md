# GoStudent Recruiting — Claude Code Guidelines

## <verification_workflow>

When the stop hook triggers "Verification Required", follow these steps before finishing:

1. **Check the preview is running**
   - Call `mcp__Claude_Preview__preview_list` to confirm the dev server is up
   - If not running, start it with `mcp__Claude_Preview__preview_start` (name: "dev")

2. **Take a screenshot**
   - Call `mcp__Claude_Preview__preview_screenshot` with the server ID
   - Confirm the page renders without a blank screen or crash boundary

3. **Check console logs**
   - Call `mcp__Claude_Preview__preview_console_logs` with the server ID
   - Fail if there are any `[error]` level entries related to changed files
   - React Router future-flag `[warn]` entries are expected and can be ignored

4. **Check network requests**
   - Call `mcp__Claude_Preview__preview_network` with the server ID
   - Confirm all changed source files returned 200 OK (not 404 or 500)
   - Transient `ERR_ABORTED` on chunk files that subsequently load are acceptable

5. **Confirm TypeScript is clean**
   - Run `cmd /c "npx tsc --noEmit 2>&1"`
   - No output = pass. Any output = fix errors before finishing.

Verification passes when: screenshot shows a rendered UI, no console errors, all source files 200, and tsc is clean.

## </verification_workflow>

---

## Project overview

GoStudent Recruiting ATS — React 18 + TypeScript + Vite + Tailwind + shadcn/ui + Supabase.

- Auth: Supabase Google OAuth (SSO restricted to `gostudent.org`, external Google also supported)
- Data: TanStack Query hooks in `src/hooks/` querying Supabase
- Edge Functions: `supabase/functions/` (Deno runtime)
- Redirect URL: always `window.location.origin + "/auth/callback"` — never hardcode a host

## Key conventions

- Run `npx tsc --noEmit` after every change and fix all errors before committing
- Commit after each logical task with a clear message
- Never hardcode environment-specific URLs — use `window.location.origin` in the frontend and env vars in Edge Functions
