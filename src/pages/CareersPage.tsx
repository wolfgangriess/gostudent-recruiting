import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Briefcase, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import goStudentLogo from "@/assets/gostudent-logo-full.png";

interface PublicJob {
  id: string;
  name: string;
  department: string;
  location: string;
  workplace_type: string;
  employment_type: string;
  description: string;
  created_at: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "https://nrbapwkuonkxzxuscgwv.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_wdp8HcbyOFhxfYHG94YCAA_PFiW2J_2";

function fetchPublicJobs(): Promise<PublicJob[]> {
  return fetch(`${SUPABASE_URL}/functions/v1/public-jobs`, {
    headers: { apikey: SUPABASE_KEY },
  })
    .then((r) => r.json())
    .then((data) => data.jobs ?? []);
}

const workplaceLabel = (t: string) => {
  if (t === "remote") return "Remote";
  if (t === "hybrid") return "Hybrid";
  return "In-person";
};

const employmentLabel = (t: string) => {
  if (t === "full-time") return "Full-time";
  if (t === "part-time") return "Part-time";
  if (t === "contract") return "Contract";
  if (t === "internship") return "Internship";
  return t;
};

interface ApplyForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  coverLetter: string;
  cv: File | null;
}

const defaultForm = (): ApplyForm => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  coverLetter: "",
  cv: null,
});

const CareersPage = () => {
  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ["public-jobs"],
    queryFn: fetchPublicJobs,
    staleTime: 60_000,
  });

  const [selectedJob, setSelectedJob] = useState<PublicJob | null>(null);
  const [form, setForm] = useState<ApplyForm>(defaultForm());
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const closeDialog = () => {
    setSelectedJob(null);
    setForm(defaultForm());
    setSubmitted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setSubmitting(true);

    try {
      // Convert CV to base64 if provided
      let cvBase64: string | null = null;
      let cvFilename: string | null = null;
      if (form.cv) {
        const buffer = await form.cv.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = "";
        bytes.forEach((b) => (binary += String.fromCharCode(b)));
        cvBase64 = btoa(binary);
        cvFilename = form.cv.name;
      }

      const resp = await fetch(`${SUPABASE_URL}/functions/v1/careers-apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY,
        },
        body: JSON.stringify({
          job_id: selectedJob.id,
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          phone: form.phone,
          cover_letter: form.coverLetter,
          cv_base64: cvBase64,
          cv_filename: cvFilename,
          source: "GoStudent Careers",
        }),
      });

      if (!resp.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      toast.error("Etwas ist schiefgelaufen. Bitte versuche es erneut.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary px-6 py-5">
        <div className="mx-auto max-w-4xl flex items-center gap-3">
          <img src={goStudentLogo} alt="GoStudent" className="h-7 brightness-0 invert" />
          <span className="text-primary-foreground/80 text-sm font-medium">Careers</span>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-primary/5 border-b border-border px-6 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold text-foreground mb-3">Werde Teil des Teams</h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Bei GoStudent arbeiten wir gemeinsam daran, Bildung für jeden zugänglich zu machen.
            Entdecke unsere offenen Stellen und bewirb dich noch heute.
          </p>
        </div>
      </div>

      {/* Job listings */}
      <main className="mx-auto max-w-4xl px-6 py-10">
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="text-center py-16 text-muted-foreground">
            Stellen konnten nicht geladen werden. Bitte lade die Seite neu.
          </div>
        )}

        {!isLoading && !error && jobs.length === 0 && (
          <div className="text-center py-16">
            <Briefcase className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">Aktuell sind keine offenen Stellen verfügbar.</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Schau bald wieder vorbei!</p>
          </div>
        )}

        {!isLoading && !error && jobs.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">{jobs.length} offene Stelle{jobs.length !== 1 ? "n" : ""}</p>
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-semibold text-foreground mb-1">{job.name}</h2>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {job.location}
                      </span>
                      <span className="text-border">·</span>
                      <Badge variant="secondary" className="text-xs rounded-lg">{job.department}</Badge>
                      <Badge variant="outline" className="text-xs rounded-lg">{workplaceLabel(job.workplace_type)}</Badge>
                      <Badge variant="outline" className="text-xs rounded-lg">{employmentLabel(job.employment_type)}</Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="shrink-0"
                    onClick={() => {
                      setSelectedJob(job);
                      setForm(defaultForm());
                      setSubmitted(false);
                    }}
                  >
                    Bewerben
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Apply modal */}
      <Dialog open={!!selectedJob} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {submitted ? "Bewerbung eingegangen" : `Bewerben: ${selectedJob?.name}`}
            </DialogTitle>
          </DialogHeader>

          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-primary" />
              <p className="text-lg font-semibold text-foreground">Vielen Dank! Wir melden uns bald.</p>
              <p className="text-sm text-muted-foreground">
                Deine Bewerbung für <strong>{selectedJob?.name}</strong> wurde erfolgreich übermittelt.
              </p>
              <Button variant="outline" onClick={closeDialog}>Schließen</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">Vorname *</Label>
                  <Input
                    id="firstName"
                    required
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Nachname *</Label>
                  <Input
                    id="lastName"
                    required
                    value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">E-Mail *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="coverLetter">Anschreiben</Label>
                <Textarea
                  id="coverLetter"
                  rows={4}
                  placeholder="Erzähl uns, warum du zu GoStudent passt…"
                  value={form.coverLetter}
                  onChange={(e) => setForm((f) => ({ ...f, coverLetter: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cv">Lebenslauf (PDF, DOCX)</Label>
                <Input
                  id="cv"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setForm((f) => ({ ...f, cv: e.target.files?.[0] ?? null }))}
                  className="cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Abbrechen
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Wird gesendet…
                    </>
                  ) : (
                    "Bewerbung absenden"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CareersPage;
