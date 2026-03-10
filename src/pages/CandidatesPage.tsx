import { useMemo, useState } from "react";
import { Search, Star, ClipboardList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useATSStore } from "@/lib/ats-store";
import { Candidate, ScorecardCriterion, RatingType } from "@/lib/types";
import { UserAvatar } from "@/components/UserPicker";

const CandidatesPage = () => {
  const { candidates, jobs, stages, users, getScorecardTemplate, evaluations, addEvaluation, getEvaluationsForCandidate } = useATSStore();
  const [search, setSearch] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const filtered = useMemo(() => {
    if (!search) return candidates;
    const q = search.toLowerCase();
    return candidates.filter(
      (c) =>
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [candidates, search]);

  const getJobName = (jobId: string) => jobs.find((j) => j.id === jobId)?.name ?? "—";
  const getStageName = (stageId: string) => stages.find((s) => s.id === stageId)?.name ?? "—";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Candidates</h1>
        <p className="mt-1 text-sm text-muted-foreground">{candidates.length} total candidates</p>
      </div>

      <div className="mb-5 relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search candidates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-xl"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/50">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Job</TableHead>
              <TableHead className="font-semibold">Stage</TableHead>
              <TableHead className="font-semibold">Source</TableHead>
              <TableHead className="font-semibold text-center">Rating</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.slice(0, 50).map((c) => (
              <TableRow
                key={c.id}
                className="cursor-pointer transition-colors hover:bg-primary/[0.03]"
                onClick={() => setSelectedCandidate(c)}
              >
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {c.firstName[0]}{c.lastName[0]}
                    </div>
                    <span className="font-semibold text-foreground">{c.firstName} {c.lastName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{c.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="rounded-lg bg-accent/30 text-accent-foreground border-0 text-xs">
                    {getJobName(c.jobId)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{getStageName(c.currentStageId)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.source}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < c.rating ? "fill-secondary text-secondary" : "text-muted-foreground/20"}`}
                      />
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No candidates found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedCandidate && (
        <CandidateDetailDialog
          candidate={selectedCandidate}
          open={!!selectedCandidate}
          onOpenChange={(open) => { if (!open) setSelectedCandidate(null); }}
        />
      )}
    </div>
  );
};

// ── Candidate Detail Dialog ────────────────────────────────────────────
interface DetailProps {
  candidate: Candidate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CandidateDetailDialog = ({ candidate, open, onOpenChange }: DetailProps) => {
  const { jobs, stages, getScorecardTemplate, getEvaluationsForCandidate, addEvaluation, users } = useATSStore();
  const job = jobs.find((j) => j.id === candidate.jobId);
  const currentStage = stages.find((s) => s.id === candidate.currentStageId);
  const template = currentStage ? getScorecardTemplate(currentStage.id) : undefined;
  const existingEvals = getEvaluationsForCandidate(candidate.id, currentStage?.id);

  const [scores, setScores] = useState<Record<string, number | boolean | string>>({});
  const [feedback, setFeedback] = useState("");

  const handleSubmitEval = () => {
    if (!currentStage) return;
    addEvaluation({
      id: `eval-${Date.now()}`,
      candidateId: candidate.id,
      stageId: currentStage.id,
      evaluatorId: "user-1", // Mock current user
      scores,
      feedback,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    setScores({});
    setFeedback("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {candidate.firstName[0]}{candidate.lastName[0]}
            </div>
            {candidate.firstName} {candidate.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-muted-foreground">Email</span>
              <p className="font-medium text-foreground">{candidate.email}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Phone</span>
              <p className="font-medium text-foreground">{candidate.phone}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Job</span>
              <p className="font-medium text-foreground">{job?.name ?? "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Current Stage</span>
              <p className="font-medium text-foreground">{currentStage?.name ?? "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Source</span>
              <p className="font-medium text-foreground">{candidate.source}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Applied</span>
              <p className="font-medium text-foreground">
                {new Date(candidate.appliedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Existing evaluations */}
        {existingEvals.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4" />
              Completed Evaluations ({existingEvals.length})
            </h3>
            {existingEvals.map((ev) => {
              const evaluator = users.find((u) => u.id === ev.evaluatorId);
              return (
                <div key={ev.id} className="mb-2 rounded-lg border border-border bg-muted/30 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    {evaluator && <UserAvatar user={evaluator} size="sm" />}
                    <span className="text-xs font-medium text-foreground">
                      {evaluator ? `${evaluator.firstName} ${evaluator.lastName}` : "Unknown"}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(ev.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {ev.feedback && <p className="text-xs text-muted-foreground mt-1">{ev.feedback}</p>}
                </div>
              );
            })}
          </div>
        )}

        {/* Scorecard Form */}
        {template && template.criteria.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-primary" />
              Scorecard — {currentStage?.name}
            </h3>
            <div className="space-y-3">
              {template.criteria.map((cr) => (
                <ScorecardInput
                  key={cr.id}
                  criterion={cr}
                  value={scores[cr.id]}
                  onChange={(val) => setScores({ ...scores, [cr.id]: val })}
                />
              ))}
            </div>
            <div className="mt-3">
              <Label className="text-xs">Additional Feedback</Label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={2}
                placeholder="Any additional notes…"
                className="mt-1"
              />
            </div>
            <Button className="mt-3 w-full" size="sm" onClick={handleSubmitEval}>
              Submit Evaluation
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ── Scorecard Input ────────────────────────────────────────────────────
const ScorecardInput = ({
  criterion,
  value,
  onChange,
}: {
  criterion: ScorecardCriterion;
  value: number | boolean | string | undefined;
  onChange: (val: number | boolean | string) => void;
}) => {
  if (criterion.ratingType === "scale") {
    const rating = typeof value === "number" ? value : 0;
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{criterion.question}</span>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className="p-0.5"
            >
              <Star
                className={`h-5 w-5 transition-colors ${
                  n <= rating ? "fill-secondary text-secondary" : "text-muted-foreground/20 hover:text-secondary/50"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (criterion.ratingType === "yes_no") {
    const selected = typeof value === "boolean" ? value : undefined;
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{criterion.question}</span>
        <div className="flex gap-1.5">
          <Button
            type="button"
            variant={selected === true ? "default" : "outline"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => onChange(true)}
          >
            Yes
          </Button>
          <Button
            type="button"
            variant={selected === false ? "destructive" : "outline"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => onChange(false)}
          >
            No
          </Button>
        </div>
      </div>
    );
  }

  // Text
  return (
    <div>
      <Label className="text-sm font-medium text-foreground">{criterion.question}</Label>
      <Textarea
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="mt-1"
        placeholder="Your feedback…"
      />
    </div>
  );
};

export default CandidatesPage;
