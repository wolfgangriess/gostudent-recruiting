# GoStudent Recruiting ATS — Development Standards
# Save this file as SKILL.md in C:\Users\WolfgangRiess\GoStudent Recruiting\
# Start every Claude Code session with: "Read SKILL.md before doing anything."

---

## PROJECT OVERVIEW

- **App:** GoStudent Recruiting ATS
- **Stack:** React + TypeScript + Vite + Tailwind + shadcn/ui + Supabase + TanStack Query
- **Repo:** https://github.com/wolfgangriess/gostudent-recruiting
- **Live preview:** https://id-preview--121fd063-a92f-4d86-8cfb-3dcc89c43dd6.lovable.app
- **Supabase project:** nrbapwkuonkxzxuscgwv (EU Frankfurt region)
- **Auth:** Google OAuth, restricted to @gostudent.org domain

---

## LANGUAGE RULES — ALWAYS GERMAN

Every user-facing string must be in German. No exceptions.

| Context | German |
|---|---|
| Save button | Speichern |
| Cancel button | Abbrechen |
| Delete button | Löschen |
| Submit button | Absenden |
| Apply button | Jetzt bewerben |
| Loading state | Wird geladen... |
| Error state | Etwas ist schiefgelaufen. Bitte versuche es erneut. |
| Success state | Erfolgreich gespeichert! |
| Empty state | Keine Daten vorhanden. |
| No jobs | Aktuell sind keine offenen Stellen verfügbar. |
| Confirm delete | Bist du sicher? Diese Aktion kann nicht rückgängig gemacht werden. |
| Reject candidate | Kandidat ablehnen? |
| Dashboard greeting | Guten Morgen / Guten Nachmittag / Guten Abend, [Vorname]! |

---

## COMPONENT STANDARDS — EVERY PAGE MUST HAVE

### 1. Loading state
```tsx
if (isLoading) return (
  <div className="flex items-center justify-center p-12">
    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
  </div>
);
```

### 2. Error state
```tsx
if (error) return (
  <div className="flex items-center justify-center p-12">
    <p className="text-sm text-muted-foreground">
      Etwas ist schiefgelaufen. Bitte lade die Seite neu.
    </p>
  </div>
);
```

### 3. Empty state
```tsx
if (!data || data.length === 0) return (
  <div className="flex flex-col items-center justify-center p-12 text-center">
    <p className="text-sm text-muted-foreground">Keine Daten vorhanden.</p>
  </div>
);
```

### 4. Safe data access — ALWAYS optional chaining
```tsx
// NEVER do this:
data.map(...)
candidates.length

// ALWAYS do this:
data?.map(...)
candidates?.length ?? 0
```

### 5. Confirmation before destructive actions
Every delete or reject action must use shadcn AlertDialog:
```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Löschen</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Bist du sicher?</AlertDialogTitle>
      <AlertDialogDescription>
        Diese Aktion kann nicht rückgängig gemacht werden.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Abbrechen</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Löschen</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## DATA FETCHING RULES

### Always use TanStack Query hooks from src/hooks/
```tsx
// CORRECT:
const { data: candidates, isLoading, error } = useCandidates();

// NEVER:
const { candidates } = useATSStore(); // ← BANNED — mock data store
```

### Every useQuery must have staleTime
```tsx
useQuery({
  queryKey: ['candidates'],
  queryFn: async () => { ... },
  staleTime: 30000, // always add this
})
```

### Every queryFn must handle errors gracefully
```tsx
queryFn: async () => {
  try {
    const { data, error } = await supabase.from('candidates').select('*');
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error('Failed to fetch candidates:', err);
    return []; // return empty array, never crash
  }
}
```

### Mutations must invalidate the right query keys
```tsx
useMutation({
  mutationFn: async (update) => { ... },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['candidates'] });
  }
})
```

---

## SUPABASE RULES

### Never bypass RLS in frontend code
- All frontend queries use the publishable/anon key
- Service role key is only for Edge Functions and migrations
- Never hardcode the service role key in src/ files

### Always upsert, never blind insert (for candidate ingestion)
```sql
INSERT INTO candidates (email, job_id, ...)
VALUES (...)
ON CONFLICT (email, job_id) DO UPDATE SET updated_at = now();
```

### Always log important events to activities table
After stage changes, offer creation, interview scheduling:
```tsx
await supabase.from('activities').insert({
  candidate_id: candidateId,
  user_id: currentUser.id,
  type: 'stage_changed', // or 'offer_created', 'interview_scheduled'
  description: `Kandidat verschoben nach ${newStageName}`,
});
```

### Supabase client fallback config
```tsx
// In src/integrations/supabase/client.ts always use:
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL 
  ?? "https://nrbapwkuonkxzxuscgwv.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY 
  ?? "sb_publishable_wdp8HcbyOFhxfYHG94YCAA_PFiW2J_2";
```

---

## EDGE FUNCTION RULES

### Every Edge Function must handle CORS
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Always handle OPTIONS preflight:
if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders });
}

// Always include corsHeaders in all responses:
return new Response(JSON.stringify(data), {
  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
});
```

### Never crash — always return a response
```typescript
try {
  // main logic
} catch (err) {
  console.error(err);
  return new Response(JSON.stringify({ error: 'Internal error' }), {
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
```

### Slack notifications are fire-and-forget
```typescript
// Never await Slack — don't fail if Slack is down
fetch(Deno.env.get('SLACK_WEBHOOK_URL') ?? '', {
  method: 'POST',
  body: JSON.stringify({ text: message })
}).catch(() => {}); // silently ignore errors
```

---

## STYLING RULES

### shadcn/ui + Tailwind only — no inline styles
```tsx
// NEVER:
<div style={{ color: 'red', marginTop: 8 }}>

// ALWAYS:
<div className="text-destructive mt-2">
```

### Use existing color variables
```
text-primary, text-muted-foreground, text-destructive
bg-background, bg-card, bg-muted
border-border
```

### Pipeline board stage badge colors
- > 14 days in stage → `variant="destructive"` (red)
- 7–14 days → `className="bg-amber-100 text-amber-800"` (yellow)
- < 7 days → `variant="outline"` (default)

---

## SECURITY RULES

### Never commit .env to git
- .env is in .gitignore — keep it there
- Never run `git add .env`
- Credentials go in Supabase secrets for Edge Functions

### Google OAuth domain restriction — always enforce
```tsx
options: {
  hd: 'gostudent.org', // ← NEVER remove this line
}
```

### OAuth redirect URL for live preview
```
https://id-preview--121fd063-a92f-4d86-8cfb-3dcc89c43dd6.lovable.app/auth/callback
```

---

## BEFORE EVERY COMMIT CHECKLIST

```bash
# 1. TypeScript must compile clean — zero errors
npx tsc --noEmit

# 2. Build must succeed
npm run build

# 3. No mock data store remaining
grep -r "useATSStore" src/
# Must return: no results

# 4. No hardcoded user IDs
grep -r '"user-1"' src/
# Must return: no results

# 5. All text is German (spot check)
grep -r '"Save"' src/
grep -r '"Cancel"' src/
grep -r '"Error"' src/
# Must return: no results
```

---

## INTEGRATION CREDENTIALS (for reference)

| Service | Where to find credentials |
|---|---|
| Supabase | supabase.com → project nrbapwkuonkxzxuscgwv |
| Google OAuth | console.cloud.google.com → GoStudent Recruiting project |
| Google Calendar API | Enabled in Google Cloud Console |
| Gmail API | Enabled in Google Cloud Console |
| Google Drive API | Enabled in Google Cloud Console |
| Slack | Set SLACK_WEBHOOK_URL in Supabase secrets |
| karriere.at | Register at karriere.at/partner |
| LinkedIn | developer.linkedin.com (requires Recruiter contract) |
| Indeed | publishers.indeed.com |
| StepStone | Contact partner@stepstone.com |

---

## KEY FILE LOCATIONS

```
src/
  pages/
    MyOverviewPage.tsx     ← Main dashboard
    CandidatesPage.tsx     ← Candidate list
    CareersPage.tsx        ← Public careers page (no auth)
    LoginPage.tsx          ← SSO + Google login
    ReportsPage.tsx        ← Analytics
    SettingsPage.tsx       ← Integrations config
  components/
    TopNav.tsx             ← Navigation + notification bell
    PipelineBoard.tsx      ← Kanban board
    CandidateCard.tsx      ← Pipeline card
    ErrorBoundary.tsx      ← Global error handler
  hooks/
    useAuth.tsx            ← Supabase auth
    useCandidates.ts       ← Candidate queries
    useJobs.ts             ← Job queries
    useInterviews.ts       ← Interview queries
    useGmail.ts            ← Gmail send
    useGoogleCalendarIntegration.ts
    useGoogleDrive.ts
  integrations/supabase/
    client.ts              ← Supabase client
    types.ts               ← Auto-generated DB types
    app-types.ts           ← Manual app types
  lib/
    mappers.ts             ← DB row → app type conversion
supabase/
  functions/
    ingest-application/    ← Receives all job board applications
    public-jobs/           ← Public API for careers page
    careers-apply/         ← Careers page form submission
    google-calendar-*/     ← Calendar OAuth + API
    slack-notify/          ← Slack notifications
    karriere-webhook/      ← karriere.at applications
    indeed-webhook/        ← Indeed applications
    stepstone-webhook/     ← StepStone applications
    linkedin-webhook/      ← LinkedIn applications
```
