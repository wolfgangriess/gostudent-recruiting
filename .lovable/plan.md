

## Google Calendar Connection — Current State & Steps Forward

### What exists today

The `useGoogleCalendarIntegration` hook currently does a **mock connect** — it inserts a row into the `integrations` table with the user's email but no real OAuth tokens. This means the "Connected" badge appears, but no actual Google Calendar API calls can be made (no access token, no refresh token).

### What's needed for a real connection

A real Google Calendar integration requires a **server-side OAuth 2.0 flow** since Google requires a client secret that cannot be exposed in the browser. Here is the plan:

---

### Step 1: Add Google OAuth secrets

Two secrets are needed in the project:
- `GOOGLE_CLIENT_ID` — from Google Cloud Console
- `GOOGLE_CLIENT_SECRET` — from Google Cloud Console

You'll need to:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable the **Google Calendar API**
4. Go to **Credentials → Create OAuth Client ID** (Web application)
5. Add the redirect URI: `https://ovlxdqxxupgqomgegecy.supabase.co/functions/v1/google-calendar-callback`
6. Copy the Client ID and Client Secret

I'll then store these as project secrets.

### Step 2: Create `google-calendar-auth` Edge Function

An edge function that generates the Google OAuth authorization URL with these scopes:
- `https://www.googleapis.com/auth/calendar.events`
- `https://www.googleapis.com/auth/calendar.readonly`

It redirects the user to Google's consent screen.

### Step 3: Create `google-calendar-callback` Edge Function

Handles the OAuth callback:
1. Exchanges the authorization `code` for `access_token` + `refresh_token`
2. Upserts the `integrations` row with real encrypted tokens and `expires_at`
3. Redirects the user back to `/settings` in the app

### Step 4: Create `google-calendar-api` Edge Function

A proxy function for calendar operations:
- **Create event** — used by Schedule Interview dialog
- **Check availability** (freebusy query)
- **Cancel/update events**

Handles token refresh automatically when `expires_at` has passed.

### Step 5: Update frontend

- **ConnectionStatusDashboard**: Change the "Connect" button to redirect to the `google-calendar-auth` edge function URL instead of doing a mock insert
- **ScheduleInterviewDialog**: Call the `google-calendar-api` edge function to create real calendar events with Google Meet links
- **useGoogleCalendarIntegration**: The `connect()` method opens the OAuth URL; `connected` checks for a valid, non-expired token row

### Summary of files

| Action | File |
|--------|------|
| Create | `supabase/functions/google-calendar-auth/index.ts` |
| Create | `supabase/functions/google-calendar-callback/index.ts` |
| Create | `supabase/functions/google-calendar-api/index.ts` |
| Edit | `src/hooks/useGoogleCalendarIntegration.ts` |
| Edit | `src/components/ConnectionStatusDashboard.tsx` |
| Edit | `src/components/ScheduleInterviewDialog.tsx` |
| Edit | `supabase/config.toml` (verify_jwt settings) |

### Prerequisites before I can implement

I need you to provide the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` values. Once you confirm you have them ready, I'll request them as secrets and build the full flow.

