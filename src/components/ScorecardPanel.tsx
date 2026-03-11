import { useState } from "react";
import { Star, CheckCircle, MessageSquare, ChevronDown, Send, Edit2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useATSStore } from "@/lib/ats-store";
import { PipelineStage, ScorecardCriterion, RatingType } from "@/lib/types";
import { toast } from "sonner";
import ScorecardBuilder from "@/components/ScorecardBuilder";

interface Props {
  candidateId: string;
  jobId: string;
}

const ratingLabels: Record<RatingType, string> = {
  scale: "1–5 Scale",
  yes_no: "Yes / No",
  text: "Text",
};

const ratingIcons: Record<RatingType, React.ReactNode> = {
  scale: <Star className="h-3 w-3" />,
  yes_no: <CheckCircle className="h-3 w-3" />,
  text: <MessageSquare className="h-3 w-3" />,
};


/* ── Scale rating component ──────────────────────────────────────── */
const ScaleInput = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        className={`h-7 w-7 rounded-md text-xs font-semibold transition-colors ${
          n <= value
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
      >
        {n}
      </button>
    ))}
  </div>
);

/* ── Yes/No input ────────────────────────────────────────────────── */
const YesNoInput = ({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) => (
  <div className="flex gap-1">
    {[
      { label: "Yes", val: true },
      { label: "No", val: false },
    ].map((opt) => (
      <button
        key={opt.label}
        type="button"
        onClick={() => onChange(opt.val)}
        className={`h-7 rounded-md px-3 text-xs font-semibold transition-colors ${
          value === opt.val
            ? opt.val
              ? "bg-green-600 text-white"
              : "bg-destructive text-white"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

/* ── Main Panel ──────────────────────────────────────────────────── */
const ScorecardPanel = ({ candidateId, jobId }: Props) => {
  const { stages, getScorecardTemplate, addEvaluation, getEvaluationsForCandidate, getUserById, users } = useATSStore();
  const jobStages = stages.filter((s) => s.jobId === jobId).sort((a, b) => a.order - b.order);

  // Builder state
  const [builderStage, setBuilderStage] = useState<PipelineStage | null>(null);

  // Evaluation form state per stage
  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number | boolean | string>>({});
  const [feedback, setFeedback] = useState("");

  const startEvaluation = (stageId: string, criteria: ScorecardCriterion[]) => {
    setActiveStageId(stageId);
    const init: Record<string, number | boolean | string> = {};
    criteria.forEach((c) => {
      if (c.ratingType === "scale") init[c.id] = 0;
      else if (c.ratingType === "yes_no") init[c.id] = "";
      else init[c.id] = "";
    });
    setScores(init);
    setFeedback("");
  };

  const submitEvaluation = (stageId: string) => {
    addEvaluation({
      id: `eval-${Date.now()}`,
      candidateId,
      stageId,
      evaluatorId: "user-1", // current user mock
      scores,
      feedback,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    setActiveStageId(null);
    setScores({});
    setFeedback("");
    toast.success("Scorecard submitted");
  };

  const existingEvals = getEvaluationsForCandidate(candidateId);

  return (
    <div className="space-y-4">

      {/* Per-stage scorecards */}
      {jobStages.map((stage) => {
        const template = getScorecardTemplate(stage.id);
        const stageEvals = existingEvals.filter((e) => e.stageId === stage.id);
        const isEvaluating = activeStageId === stage.id;

        return (
          <div key={stage.id} className="rounded-xl border border-border bg-card">
            {/* Stage header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                  {stage.order + 1}
                </span>
                <span className="text-sm font-semibold text-foreground">{stage.name}</span>
                {template && (
                  <Badge variant="outline" className="text-[10px]">
                    {template.criteria.length} criteria
                  </Badge>
                )}
                {stageEvals.length > 0 && (
                  <Badge className="bg-green-600/10 text-green-700 border-green-600/20 text-[10px]">
                    {stageEvals.length} submitted
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1 text-muted-foreground"
                  onClick={() => setBuilderStage(stage)}
                >
                  <Edit2 className="h-3 w-3" />
                  {template ? "Edit" : "Setup"}
                </Button>
                {template && !isEvaluating && (
                  <Button
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => startEvaluation(stage.id, template.criteria)}
                  >
                    <Plus className="h-3 w-3" /> Evaluate
                  </Button>
                )}
              </div>
            </div>

            {/* Template preview (when not evaluating) */}
            {template && !isEvaluating && stageEvals.length === 0 && (
              <div className="px-4 py-3 space-y-1.5">
                {template.criteria.map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-xs">
                    <span className="text-foreground">{c.question}</span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      {ratingIcons[c.ratingType]} {ratingLabels[c.ratingType]}
                      {c.weight && <span className="ml-1 text-[10px]">×{c.weight}</span>}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* No template */}
            {!template && (
              <div className="px-4 py-5 text-center">
                <p className="text-xs text-muted-foreground">No scorecard configured for this stage</p>
              </div>
            )}

            {/* Evaluation form */}
            {isEvaluating && template && (
              <div className="px-4 py-4 space-y-4 border-t border-border bg-muted/10">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Fill Scorecard
                </p>
                {template.criteria.map((c) => (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{c.question}</span>
                      {c.weight && (
                        <span className="text-[10px] text-muted-foreground">weight ×{c.weight}</span>
                      )}
                    </div>
                    {c.ratingType === "scale" && (
                      <ScaleInput
                        value={(scores[c.id] as number) || 0}
                        onChange={(v) => setScores((prev) => ({ ...prev, [c.id]: v }))}
                      />
                    )}
                    {c.ratingType === "yes_no" && (
                      <YesNoInput
                        value={scores[c.id] === "" ? null : (scores[c.id] as boolean)}
                        onChange={(v) => setScores((prev) => ({ ...prev, [c.id]: v }))}
                      />
                    )}
                    {c.ratingType === "text" && (
                      <Textarea
                        value={(scores[c.id] as string) || ""}
                        onChange={(e) => setScores((prev) => ({ ...prev, [c.id]: e.target.value }))}
                        placeholder="Enter feedback…"
                        rows={2}
                        className="text-sm"
                      />
                    )}
                  </div>
                ))}

                <div className="space-y-1.5">
                  <span className="text-sm font-medium text-foreground">Overall Feedback</span>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Summary remarks…"
                    rows={2}
                    className="text-sm"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setActiveStageId(null)}>
                    Cancel
                  </Button>
                  <Button size="sm" className="h-7 text-xs gap-1" onClick={() => submitEvaluation(stage.id)}>
                    <Send className="h-3 w-3" /> Submit
                  </Button>
                </div>
              </div>
            )}

            {/* Existing evaluations */}
            {stageEvals.length > 0 && !isEvaluating && (
              <div className="px-4 py-3 space-y-3">
                {stageEvals.map((ev) => {
                  const evaluator = getUserById(ev.evaluatorId);
                  return (
                    <div key={ev.id} className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">
                          {evaluator ? `${evaluator.firstName} ${evaluator.lastName}` : "Unknown"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(ev.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {template?.criteria.map((c) => {
                          const val = ev.scores[c.id];
                          return (
                            <div key={c.id} className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{c.question}</span>
                              <span className="font-medium text-foreground">
                                {c.ratingType === "scale" && (
                                  <span className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((n) => (
                                      <span
                                        key={n}
                                        className={`h-4 w-4 rounded text-center text-[10px] leading-4 ${
                                          n <= (val as number)
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground"
                                        }`}
                                      >
                                        {n}
                                      </span>
                                    ))}
                                  </span>
                                )}
                                {c.ratingType === "yes_no" && (
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] ${
                                      val === true
                                        ? "border-green-600/30 text-green-700"
                                        : "border-destructive/30 text-destructive"
                                    }`}
                                  >
                                    {val === true ? "Yes" : "No"}
                                  </Badge>
                                )}
                                {c.ratingType === "text" && (
                                  <span className="text-muted-foreground italic">{val as string || "—"}</span>
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      {ev.feedback && (
                        <p className="text-xs text-muted-foreground italic border-t border-border pt-2">
                          "{ev.feedback}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Scorecard Builder Dialog */}
      {builderStage && (
        <ScorecardBuilder
          stageId={builderStage.id}
          stageName={builderStage.name}
          open={!!builderStage}
          onOpenChange={(open) => !open && setBuilderStage(null)}
        />
      )}
    </div>
  );
};

export default ScorecardPanel;
