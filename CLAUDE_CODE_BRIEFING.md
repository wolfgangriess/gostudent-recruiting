# GoStudent Recruiting ATS — Claude Code Briefing
# Copy-paste each PROMPT block directly into Claude Code, in order.
# Do NOT skip steps. Each builds on the previous.

---

## BEFORE YOU START — Run these two commands in your terminal

```bash
cd gostudent-recruiting    # or wherever you cloned it
npm install                # make sure dependencies are fresh
claude                     # open Claude Code in this directory
```

---

## CONTEXT (read this yourself — don't paste into Claude Code)

**What this project is:**
A full ATS (Applicant Tracking System) built in React + TypeScript + Vite + Tailwind + shadcn/ui + Supabase.
649KB of source across 124 files. Lovable-generated, synced to GitHub.

**The core problem:**
The entire UI runs off `useATSStore` — an in-memory mock data store in `src/lib/ats-store.ts`.
Supabase is configured (client, types, 3 migrations, auth with RLS) but ZERO pages query live data.
Every page shows hardcoded fake candidates, jobs, and stages.

**Auth:**
- `src/hooks/useAuth.tsx` — Supabase auth, works correctly
- `src/pages/LoginPage.tsx` — SSO + Google login buttons exist but SSO not fully wired
- `CURRENT_USER_ID = "user-1"` hardcoded in MyOverviewPage.tsx — critical bug

**Google Calendar:**
Already has 3 Supabase Edge Functions:
- `supabase/functions/google-calendar-auth/index.ts` (2634b)
- `supabase/functions/google-calendar-callback/index.ts` (3589b)
- `supabase/functions/google-calendar-api/index.ts` (7635b)
And a hook: `src/hooks/useGoogleCalendarIntegration.ts`
These exist but are NOT connected to the UI yet.

**Supabase:**
- `src/integrations/supabase/client.ts` — client configured
- `src/integrations/supabase/types.ts` (10KB) — full DB schema types exist
- 3 migrations in `supabase/migrations/`

**Files using useATSStore (replace ALL of these with Supabase queries):**
- src/pages/MyOverviewPage.tsx (22KB) — also has CURRENT_USER_ID bug
- src/pages/CandidatesPage.tsx (6KB) — also has slice(0,50) pagination bug
- src/pages/ReportsPage.tsx (11KB)
- src/components/CandidateDetailDialog.tsx (12KB)
- src/components/PipelineBoard.tsx (2KB)
- src/components/PipelineColumn.tsx (2KB)
- src/components/JobsList.tsx (8KB)
- src/components/JobDetail.tsx (7KB)
- src/components/CandidateStagesTab.tsx (10KB)
- src/components/InterviewsTab.tsx (11KB)
- src/components/CreateOfferDialog.tsx (13KB) — also has mocked salary
- src/components/AddCandidateDialog.tsx (12KB)
- src/components/AddJobDialog.tsx (16KB)
- src/components/ScheduleInterviewDialog.tsx (14KB)

---

## SPRINT 1 — Bug Fixes
## Paste this as your FIRST message to Claude Code:

---
PROMPT 1 — Read everything first
---

```
Please read the entire codebase thoroughly before doing anything. Start with:
1. src/lib/ats-store.ts — understand the mock data structure
2. src/lib/types.ts — understand all type definitions
3. src/hooks/useAuth.tsx — understand auth
4. src/integrations/supabase/client.ts and types.ts — understand Supabase setup
5. All 3 files in supabase/migrations/ — understand the DB schema
6. src/pages/MyOverviewPage.tsx — the most complex page
7. src/pages/CandidatesPage.tsx
8. src/components/TopNav.tsx

Then give me a summary of:
- Exactly what tables exist in Supabase (from migrations)
- How useATSStore is structured (what mock data it holds)
- Whether the Supabase types match the app types in lib/types.ts
- Any other bugs or issues you notice beyond what I've mentioned

Do NOT make any changes yet. Just read and report.
```

---
PROMPT 2 — Fix all 7 bugs (after Claude Code confirms it has read everything)
---

```
Now fix all 7 bugs in order. After each fix, run `npx tsc --noEmit` to verify no TypeScript errors before moving to the next. Commit each fix separately with a clear message.

BUG 1 — src/pages/MyOverviewPage.tsx
Remove `const CURRENT_USER_ID = "user-1"` at the top of the component.
Replace with:
  const { user } = useAuth();
  const CURRENT_USER_ID = user?.id ?? "";
Import useAuth from "@/hooks/useAuth". Also search the entire codebase for any other hardcoded "user-1" references and fix them all.

BUG 2 — src/pages/MyOverviewPage.tsx
Fix the taskItems useMemo so each task has its own correct logic:
- "Upcoming Interviews Today": only candidates with an interview scheduled for today (use real interview.scheduledAt once available; for now filter by a new isToday helper)
- "Scorecards Due": interview-stage candidates where scorecards array is empty or missing
- "Needs Decision": interview-stage candidates whose interview was more than 2 days ago with no outcome recorded
- "New Applications to Review": Applied-stage candidates (already correct)
- "Candidates to Schedule": Phone Screen stage (already correct)
- "Offers": Offer stage (already correct)
- "Pending Approvals": Offer stage for hiring manager's jobs (already correct)

BUG 3 — src/pages/CandidatesPage.tsx
Replace `filtered.slice(0, 50)` with a paginated display:
- Add `const [visibleCount, setVisibleCount] = useState(50)`
- Show `filtered.slice(0, visibleCount)`
- Add below the table: a "Load more (N remaining)" Button that increments visibleCount by 50
- Only show the button when filtered.length > visibleCount

BUG 4 — src/pages/MyOverviewPage.tsx
Replace all `<a href="#">` Calendar links with real Google Calendar event-creation URLs.
Use this format:
  https://calendar.google.com/calendar/r/eventedit?text=TITLE&dates=START/END&details=DETAILS
Where START/END are in YYYYMMDDTHHmmss format. Use the interview date/time, candidate name, and job title.

BUG 5 — src/pages/MyOverviewPage.tsx + src/lib/types.ts
In the Approvals section, remove the hardcoded salary formula:
  `salaryMin + Math.round((salaryMax - salaryMin) * 0.7)`
Add `offeredSalary?: number` to the Candidate type in src/lib/types.ts.
Read `c.offeredSalary` directly. If undefined, fall back to the midpoint of the range with a clear TODO comment.

BUG 6 — src/pages/MyOverviewPage.tsx
In the performance chart, candidates are binned by `c.appliedAt`. This is wrong — it should be the date they reached the Offer/Hired stage.
Add `stageChangedAt?: string` to the Candidate type.
Update the trend chart computation to use `c.stageChangedAt ?? c.appliedAt` with a TODO comment explaining the field needs to be populated when stage transitions are recorded in Supabase.

BUG 7 — src/pages/MyOverviewPage.tsx
Replace the `getInterviewDateTime` hash function with a proper implementation.
Keep the hash logic as a temporary fallback but add a comment:
  // TODO: Replace with real interview.scheduledAt from Supabase interviews table
Structure it so it's easy to swap: `const interviewDt = candidate.scheduledAt ? new Date(candidate.scheduledAt) : getInterviewDateTime(candidate);`
Add `scheduledAt?: string` to the Candidate type.

After all 7 bugs are fixed and tsc passes, commit with message: "fix: resolve all 7 identified bugs in dashboard and candidates page"
```

---

## SPRINT 2 — Live Supabase Data
## Paste AFTER Sprint 1 is complete and committed

---
PROMPT 3 — Create all Supabase query hooks
---

```
Now create real TanStack Query hooks for every entity. These will replace useATSStore across the entire app.

Create these files in src/hooks/:

1. src/hooks/useCandidates.ts
   - useAllCandidates(): fetch all candidates with job name and stage name via join
   - useCanddidate(id): fetch single candidate with full details
   - useUpdateCandidateStage(): mutation to move candidate to a new stage, with optimistic update
   - useCreateCandidate(): mutation to insert new candidate

2. src/hooks/useJobs.ts
   - useJobs(): fetch all jobs with recruiter count and open headcount
   - useJob(id): fetch single job with full pipeline stages
   - useCreateJob(): mutation
   - useUpdateJob(): mutation

3. src/hooks/useStages.ts
   - useStages(): fetch all pipeline stages ordered by position
   - useStagesByJob(jobId): stages for a specific job

4. src/hooks/useInterviews.ts
   - useInterviews(): all interviews with candidate and interviewer details
   - useInterviewsByCandidate(candidateId): interviews for one candidate
   - useCreateInterview(): mutation — after creating, also trigger Google Calendar event (stub for now, wire in Sprint 3)
   - useCancelInterview(): mutation

5. src/hooks/useScorecards.ts
   - useScorecardsByCandidate(candidateId)
   - useSubmitScorecard(): mutation

6. src/hooks/useOffers.ts
   - useOffersByCandidate(candidateId)
   - useCreateOffer(): mutation — include offeredSalary field
   - useApproveOffer(): mutation
   - useRejectOffer(): mutation

7. src/hooks/useUsers.ts
   - useUsers(): all users with roles
   - useCurrentUser(): current authenticated user's full profile

For each hook:
- Use the Supabase client from src/integrations/supabase/client.ts
- Use queryKey arrays that match the entity name, e.g. ['candidates'], ['jobs'], ['interviews', candidateId]
- Throw on error (if (error) throw error)
- Include proper TypeScript types from src/integrations/supabase/types.ts
- For mutations, invalidate the relevant query keys on success

Run `npx tsc --noEmit` after creating all hooks. Fix any type errors.
Commit: "feat: add Supabase TanStack Query hooks for all entities"
```

---
PROMPT 4 — Replace useATSStore in every file
---

```
Now replace useATSStore with real Supabase hooks in every file that uses it.
Do them in this order (easiest to hardest):

1. src/components/JobsList.tsx → useJobs()
2. src/pages/CandidatesPage.tsx → useAllCandidates(), useJobs(), useStages()
3. src/components/PipelineBoard.tsx + PipelineColumn.tsx → useAllCandidates(), useStages(), useUpdateCandidateStage()
4. src/components/JobDetail.tsx → useJob(jobId), useStagesByJob(jobId)
5. src/components/AddCandidateDialog.tsx → useJobs(), useCreateCandidate()
6. src/components/AddJobDialog.tsx → useCreateJob()
7. src/components/CandidateDetailDialog.tsx → useCandidate(id), useScorecardsByCandidate(), useInterviewsByCandidate()
8. src/components/CandidateStagesTab.tsx → useUpdateCandidateStage(), useStages()
9. src/components/InterviewsTab.tsx → useInterviewsByCandidate()
10. src/components/ScheduleInterviewDialog.tsx → useCreateInterview(), useUsers()
11. src/components/CreateOfferDialog.tsx → useCreateOffer() — use real offeredSalary field
12. src/pages/ReportsPage.tsx → useAllCandidates(), useJobs(), useStages()
13. src/pages/MyOverviewPage.tsx → useAllCandidates(), useJobs(), useStages(), useInterviews(), useCurrentUser()

For EVERY file you change:
- Add a loading state: if (isLoading) return <div className="flex items-center justify-center p-8"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" /></div>
- Add an error state: if (error) return <div className="p-8 text-sm text-destructive">Something went wrong. Please refresh.</div>
- Remove the useATSStore import once all references are replaced
- Run tsc --noEmit after each file

After all files are done and tsc passes, verify that NO file in src/ still imports from "@/lib/ats-store".
Commit: "feat: replace all useATSStore mock data with live Supabase queries"
```

---
PROMPT 5 — Supabase Realtime for live pipeline updates
---

```
Add Supabase Realtime so multiple recruiters see pipeline changes instantly.

In src/hooks/useCandidates.ts, add a useEffect to the useAllCandidates hook that:
1. Subscribes to postgres_changes on the 'candidates' table (all events: INSERT, UPDATE, DELETE)
2. On any change, calls queryClient.invalidateQueries({ queryKey: ['candidates'] })
3. Cleans up the subscription on unmount

Do the same for the 'interviews' table in useInterviews.ts.

Also add optimistic updates to useUpdateCandidateStage:
- onMutate: immediately update the cached candidate's currentStageId in the query cache
- onError: roll back to the previous cached value
- onSettled: invalidate to sync with server

Run tsc --noEmit.
Commit: "feat: add Supabase Realtime subscriptions and optimistic stage updates"
```

---

## SPRINT 3 — GoStudent SSO + Google Suite
## Paste AFTER Sprint 2 is complete

---
PROMPT 6 — GoStudent SSO
---

```
Wire up GoStudent SSO in LoginPage.tsx.

Read src/pages/LoginPage.tsx and src/hooks/useAuth.tsx first.

The "Sign in with GoStudent SSO" button needs to call:
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      hd: 'gostudent.org',
      redirectTo: window.location.origin + '/auth/callback',
      scopes: 'email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/drive.file',
    }
  })

The scopes request Calendar + Gmail + Drive permissions at login time so users only need to auth once.

The "Sign in with Google" (external accounts) button should use the same call but WITHOUT the hd restriction.

In useAuth.tsx, ensure the auth callback route is handled — when Supabase redirects back to /auth/callback, the session should be picked up automatically by the existing onAuthStateChange listener.

Add a proper loading spinner while OAuth redirect is in progress.

NOTE for Wolfgang: Before this works, you must:
1. Go to Supabase Dashboard → Authentication → Providers → Google → enable it
2. Add your Google OAuth client ID and secret (from Google Cloud Console)
3. Add https://[your-supabase-project].supabase.co/auth/v1/callback as an authorised redirect URI in Google Cloud Console
4. Add your production domain to authorised origins

Run tsc --noEmit.
Commit: "feat: wire GoStudent SSO with Google OAuth including Calendar/Gmail/Drive scopes"
```

---
PROMPT 7 — Google Calendar integration
---

```
Wire the existing Google Calendar Edge Functions to the ScheduleInterviewDialog.

First read:
- supabase/functions/google-calendar-auth/index.ts
- supabase/functions/google-calendar-callback/index.ts
- supabase/functions/google-calendar-api/index.ts
- src/hooks/useGoogleCalendarIntegration.ts
- src/components/ScheduleInterviewDialog.tsx

Understand what each Edge Function does, then:

1. In src/hooks/useGoogleCalendarIntegration.ts, add a createCalendarEvent function that:
   - Calls the google-calendar-api Edge Function via supabase.functions.invoke()
   - Passes: candidate name, job title, interviewers (as attendees), scheduledAt datetime, duration
   - Requests a Google Meet link (conferenceDataVersion=1)
   - Returns the created event ID and Meet link
   - Stores the Meet link on the interview record in Supabase

2. In src/components/ScheduleInterviewDialog.tsx, after successfully creating the interview in Supabase:
   - Call createCalendarEvent with all the interview details
   - Show the Google Meet link in a success toast: "Interview scheduled — Meet link: [link]"
   - Store the googleCalendarEventId and meetLink on the interview record

3. In src/components/InterviewsTab.tsx, show the Meet link as a button next to each interview if meetLink exists.

4. In src/pages/MyOverviewPage.tsx, replace the static Calendar link in the interviews list with the real Google Calendar event link (use interview.googleCalendarEventId to construct the link).

Run tsc --noEmit.
Commit: "feat: connect Google Calendar Edge Functions to interview scheduling"
```

---
PROMPT 8 — Gmail integration
---

```
Create a Gmail integration for sending templated emails to candidates.

Read src/components/EmailTemplatesSettings.tsx first to understand how email templates are stored.

1. Create src/hooks/useGmail.ts with a useSendEmail mutation that:
   - Takes: to (email), templateId, and a variables object (candidateName, jobTitle, interviewDate, recruiterName, meetLink, offerSalary)
   - Fetches the template from Supabase email_templates table
   - Replaces all {{variable}} placeholders in subject and body
   - Sends via Gmail API using the user's provider_token from supabase.auth.getSession()
   - Logs the sent email to the candidate's activity feed in Supabase

2. Wire useSendEmail to these components:
   - ScheduleInterviewDialog: send interview confirmation after scheduling (include Meet link)
   - NeedsDecisionDialog: send rejection or advance email based on decision
   - CreateOfferDialog: send offer letter email after creating offer
   - NewApplicationsDialog: send "application received" confirmation

3. For each send, show a success toast and log to ActivityFeed with: sender, recipient, template name, timestamp.

NOTE for Wolfgang: This requires the user's Google account to have granted gmail.send scope — which is handled in Prompt 6's OAuth scopes. No additional setup needed.

Run tsc --noEmit.
Commit: "feat: Gmail integration for templated candidate emails"
```

---
PROMPT 9 — Google Drive for CV storage
---

```
Add Google Drive CV storage.

1. Create src/hooks/useGoogleDrive.ts with:
   - uploadCV(file, candidateId, candidateName): uploads file to Google Drive folder "GoStudent Recruiting/[candidateName]", returns { driveFileId, viewUrl }
   - getFileUrl(driveFileId): returns a viewable URL

2. In src/components/AddCandidateDialog.tsx:
   - After creating the candidate in Supabase, if a CV file is attached, call uploadCV
   - Save the driveFileId and viewUrl to the candidate record (add these fields to the candidates table via a new Supabase migration if they don't exist)

3. In src/components/CandidateDetailDialog.tsx and src/components/ResumePreviewDialog.tsx:
   - Load CV from candidate.cvUrl (Google Drive view URL) instead of any placeholder
   - Show an "Open in Drive" button that links to the Drive URL

NOTE for Wolfgang: Requires drive.file scope — already included in Prompt 6's OAuth scopes.

Run tsc --noEmit.
Commit: "feat: Google Drive CV upload and storage"
```

---

## SPRINT 4 — Job Board Integrations
## Paste AFTER Sprint 3 is complete

---
PROMPT 10 — Shared job board ingest architecture
---

```
Create the shared infrastructure for receiving applications from all job boards.

1. Create supabase/functions/ingest-application/index.ts:
   - Accepts POST requests with a JSON body
   - Required fields: firstName, lastName, email, jobId (or jobExternalId), source, cvUrl (optional)
   - Maps jobExternalId to internal job ID using a job_external_ids table (create migration for this)
   - Upserts to candidates table: ON CONFLICT (email, job_id) DO UPDATE SET updated_at = now(), source = EXCLUDED.source
   - Returns 200 with { candidateId } on success, 400 on missing fields
   - Logs every ingest to a new application_log table (create migration)
   - Sends a Slack notification stub (TODO: implement in Prompt 13)

2. Create supabase/migrations for:
   - job_external_ids table: (job_id uuid references jobs, platform text, external_id text, unique(platform, external_id))
   - application_log table: (id, candidate_id, platform, raw_payload jsonb, ingested_at timestamp)
   - Add cv_drive_id text and cv_url text columns to candidates if not already present

3. Create supabase/functions/post-job/index.ts:
   - Accepts POST with { jobId, platforms: string[] }
   - For now, returns a stub response per platform: { platform, status: 'pending', message: 'API credentials required' }
   - This is the single function all job board posting will call

4. In src/pages/JobPostPage.tsx, add a "Distribute Job" section with toggles for:
   LinkedIn, Indeed, StepStone, karriere.at, InfoJobs, GoStudent Careers
   Each toggle calls the post-job function. Show status per platform.

Run tsc --noEmit.
Commit: "feat: shared job board ingest function and JobPostPage distribution UI"
```

---
PROMPT 11 — GoStudent Careers Page integration
---

```
Create the public-facing jobs API and application form.

1. Create supabase/functions/public-jobs/index.ts:
   - GET request: returns all jobs where status = 'published'
   - Fields: id, title, department, location, employment_type, description, salary_range
   - Include CORS headers: Access-Control-Allow-Origin: * (public API)
   - No auth required

2. Create supabase/functions/careers-apply/index.ts:
   - POST with: firstName, lastName, email, phone, jobId, coverLetter, cvUrl
   - Calls ingest-application with source: 'GoStudent Careers'
   - Returns { success: true, candidateId }

3. Create src/pages/CareersPage.tsx (public, no auth required):
   - Add route /careers in App.tsx OUTSIDE the ProtectedRoutes wrapper
   - Fetches from /public-jobs Edge Function
   - Shows job listings with filter by department/location
   - Each job has an "Apply" button that opens an application modal
   - Modal collects: name, email, phone, cover letter, CV upload
   - On submit, calls careers-apply Edge Function
   - Success state: "Application submitted! We'll be in touch."

NOTE for Wolfgang: To embed on gostudent.org/careers, point that page to your Supabase public-jobs URL or iframe the /careers route from your deployed app.

Run tsc --noEmit.
Commit: "feat: public careers page and application form with Supabase Edge Functions"
```

---
PROMPT 12 — karriere.at and Indeed webhook handlers
---

```
Create webhook handlers for the two highest-priority job boards.

1. Create supabase/functions/karriere-webhook/index.ts:
   - Accepts POST from karriere.at with their application payload format
   - Extract: applicant name, email, phone, CV URL, job reference number
   - Map job reference to internal job_id via job_external_ids table
   - Call ingest-application with source: 'karriere.at'
   - Respond 200 to acknowledge receipt

2. Create supabase/functions/indeed-webhook/index.ts:
   - Accepts POST from Indeed Apply with their payload format
   - Fields: applicant.name, applicant.email, jobKey, resume.url
   - Map jobKey to internal job_id
   - Call ingest-application with source: 'Indeed'

3. In supabase/functions/post-job/index.ts, implement real karriere.at posting:
   - Generate HR-XML format job posting
   - POST to karriere.at API endpoint
   - Store returned external job ID in job_external_ids table

4. Add webhook URLs to JobPostPage for each platform as a setup guide:
   "Configure this webhook URL in your [platform] dashboard: [supabase-project-url]/functions/v1/karriere-webhook"

NOTE for Wolfgang: You need API credentials from:
- karriere.at: register at karriere.at/partner
- Indeed: apply at indeed.com/publisher

Commit: "feat: karriere.at and Indeed webhook handlers and job posting"
```

---
PROMPT 13 — Slack notifications
---

```
Add Slack notifications for key recruiting events.

1. Create supabase/functions/slack-notify/index.ts:
   - Takes { event, data } where event is one of: new_application, interview_scheduled, offer_created, offer_approved, offer_rejected
   - Formats a Slack Block Kit message for each event type
   - Posts to the SLACK_WEBHOOK_URL secret (set in Supabase secrets)
   - For new_application: notifies the hiring manager's channel
   - For offer events: notifies the recruiter

2. Wire slack-notify to these triggers:
   - In ingest-application Edge Function: call slack-notify after successful candidate insert
   - In useCreateInterview mutation: call slack-notify after interview is scheduled
   - In useCreateOffer mutation: call slack-notify after offer is created
   - In useApproveOffer / useRejectOffer: call slack-notify with outcome

3. In SettingsPage.tsx, find the existing Slack integration section (it may already exist given the file is 41KB) and ensure there's a field to set the Slack webhook URL and channel preferences per event type. Save to a user_settings table in Supabase.

NOTE for Wolfgang: 
- Create a Slack app at api.slack.com/apps
- Add an Incoming Webhook
- Add the webhook URL as a Supabase secret: supabase secrets set SLACK_WEBHOOK_URL=https://hooks.slack.com/...

Commit: "feat: Slack notifications for applications, interviews, and offers"
```

---
PROMPT 14 — LinkedIn and StepStone
---

```
Add LinkedIn and StepStone job board integrations.

1. Create supabase/functions/linkedin-webhook/index.ts:
   - Handles LinkedIn Easy Apply webhook payload
   - Extracts: firstName, lastName, email, linkedInProfileUrl, resumeUrl
   - Calls ingest-application with source: 'LinkedIn'
   - Stores linkedInProfileUrl on candidate record (add column if needed)

2. In supabase/functions/post-job/index.ts, add LinkedIn job posting:
   - Uses LinkedIn Jobs API to create a job posting
   - Stores LinkedIn job ID in job_external_ids

3. Create supabase/functions/stepstone-webhook/index.ts:
   - Reuse the HR-XML parsing from karriere.at (same format)
   - Source: 'StepStone'

4. In src/components/CandidateLinkedInTab.tsx:
   - If candidate has linkedInProfileUrl, show their LinkedIn profile in an iframe or link
   - Add "View on LinkedIn" button

NOTE for Wolfgang — LinkedIn requires:
- LinkedIn Recruiter contract for Talent Solutions API
- Apply at developer.linkedin.com/product-catalog

NOTE for Wolfgang — StepStone requires:
- Enterprise API agreement, contact partner@stepstone.com

Commit: "feat: LinkedIn and StepStone job board integrations"
```

---

## SPRINT 5 — UX Polish
## Paste AFTER Sprint 4 is complete

---
PROMPT 15 — UX cleanup and polish
---

```
Now do a full UX pass across the entire app. Read every page and component, then make these improvements:

NAVIGATION:
- In TopNav.tsx, add a notification bell icon that shows count of pending tasks (scorecards due + needs decision + pending approvals). Clicking it shows a dropdown with the top 5 items.
- Add keyboard shortcut hints: Cmd+K for search, Cmd+N for new candidate/job

DASHBOARD (MyOverviewPage):
- Add a "Good morning, [first name]" greeting using the current time and user's name
- Empty states: if myInterviews is empty, show a friendly illustration with "No interviews today — enjoy the calm!"
- Make the task items in "My Tasks" show a coloured left border: red for overdue, yellow for due today, grey for upcoming
- Add a subtle animation when task counts update

CANDIDATES PAGE:
- Add column sorting (click header to sort by name, stage, applied date)
- Add a "Applied date" column showing relative time (e.g. "2 days ago")
- Highlight rows where the candidate has been in the same stage for more than 7 days (stale indicator)

PIPELINE BOARD (Jobs view):
- Show candidate count per column in the column header badge
- Add a subtle drop shadow when dragging a card
- Show time-in-stage on each card (e.g. "5d in Phone Screen")

CANDIDATE DETAIL:
- Add a timeline/activity feed as the default tab showing all events (applied, moved stages, interview scheduled, emails sent)
- Make the scorecard submission flow clearer — add a progress indicator showing which criteria have been rated

REPORTS PAGE:
- Add a date range picker at the top that filters all charts
- Add an "Export to CSV" button for the main metrics table

GENERAL:
- Ensure all loading states use a consistent skeleton component
- Add empty state illustrations (use simple SVG inline illustrations, not external images)
- Make all dialogs closeable with Escape key (verify this works everywhere)
- Add confirmation dialogs before destructive actions (reject candidate, delete job)
- Ensure the app is fully keyboard-navigable

Run tsc --noEmit after all changes.
Commit: "feat: comprehensive UX polish pass across all pages"
```

---

## FINAL STEPS — Do these yourself (require your credentials)

### 1. Supabase Dashboard
- Go to Authentication → Providers → Google → enable, add OAuth credentials
- Go to Edge Functions → deploy all functions: `supabase functions deploy`
- Go to Database → run any pending migrations: `supabase db push`
- Add secrets: `supabase secrets set SLACK_WEBHOOK_URL=...`

### 2. Google Cloud Console (console.cloud.google.com)
- Create project "GoStudent Recruiting"
- Enable: Google Calendar API, Gmail API, Google Drive API
- Create OAuth 2.0 credentials (Web application)
- Add authorised redirect URI: `https://[your-project].supabase.co/auth/v1/callback`
- Add authorised origins: your production domain

### 3. External portals (all require company registration)
- karriere.at: karriere.at/partner
- Indeed: publishers.indeed.com
- LinkedIn: developer.linkedin.com (requires Recruiter contract)
- StepStone: contact partner@stepstone.com
- InfoJobs: developer.infojobs.net
- WhatsApp Business: business.whatsapp.com
- DocuSign: developers.docusign.com

---

## How to use this document

1. Open terminal, `cd gostudent-recruiting`, run `claude`
2. Paste PROMPT 1 — let Claude Code read and confirm it understands the codebase
3. Paste PROMPT 2 — bug fixes
4. After each prompt completes and commits, paste the next one
5. Come back to Claude.ai for architectural decisions or when you're stuck
6. After each Sprint, check Lovable — changes auto-sync from GitHub and you can preview them there

Total estimated time: 3–4 weeks for one developer working through these prompts.
