import { useState } from "react";
import { Star, ClipboardList, FileText, Linkedin, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useATSStore } from "@/lib/ats-store";
import { Candidate, ScorecardCriterion } from "@/lib/types";
import { UserAvatar } from "@/components/UserPicker";
import { toast } from "sonner";

interface DetailProps {
  candidate: Candidate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CandidateDetailDialog = ({ candidate, open, onOpenChange }: DetailProps) => {
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
      evaluatorId: "user-1",
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

        {/* Quick links */}
        <div className="flex items-center gap-3 -mt-1">
          <a href="#" className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
            <FileText className="h-3.5 w-3.5" /> CV
          </a>
          <a href={`https://linkedin.com/in/${candidate.firstName.toLowerCase()}-${candidate.lastName.toLowerCase()}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
            <Linkedin className="h-3.5 w-3.5" /> LinkedIn
          </a>
          <a href="#" className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
            <ExternalLink className="h-3.5 w-3.5" /> Application
          </a>
        </div>

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

const ScorecardInput = ({
  criterion, value, onChange,
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
            <button key={n} type="button" onClick={() => onChange(n)} className="p-0.5">
              <Star className={`h-5 w-5 transition-colors ${n <= rating ? "fill-secondary text-secondary" : "text-muted-foreground/20 hover:text-secondary/50"}`} />
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
          <Button type="button" variant={selected === true ? "default" : "outline"} size="sm" className="h-7 px-3 text-xs" onClick={() => onChange(true)}>Yes</Button>
          <Button type="button" variant={selected === false ? "destructive" : "outline"} size="sm" className="h-7 px-3 text-xs" onClick={() => onChange(false)}>No</Button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <Label className="text-sm font-medium text-foreground">{criterion.question}</Label>
      <Textarea value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value)} rows={2} className="mt-1" placeholder="Your feedback…" />
    </div>
  );
};

export default CandidateDetailDialog;
