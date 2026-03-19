

## Fix: Google Calendar OAuth 403 Error

### Root Cause

The `google-calendar-callback` edge function is failing with 403 because it requires JWT verification by default. When Google redirects back to the callback URL, there is no Authorization header — it's a plain browser redirect with query parameters. The function rejects the request before any code runs.

### Fix

Add `verify_jwt = false` for the callback function in `supabase/config.toml`:

```toml
project_id = "ovlxdqxxupgqomgegecy"

[functions.google-calendar-callback]
verify_jwt = false
```

This is safe because the callback validates the `state` parameter (which contains the user ID) and only exchanges a one-time authorization code — no sensitive data is accepted directly.

### Files Changed

| Action | File |
|--------|------|
| Edit | `supabase/config.toml` — add `verify_jwt = false` for callback function |

One-line fix, no other changes needed.

