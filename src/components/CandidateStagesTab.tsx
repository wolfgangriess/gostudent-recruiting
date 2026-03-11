import { useState, useMemo } from "react";
import { ChevronDown, Plus, MoreHorizontal, Zap, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Candidate, PipelineStage } from "@/lib/types";

/* Mock interview configs per stage name */
const stageInterviewConfig: Record<string, { type: string; duration: string }[]> = {
  "Phone Screen": [{ type: "HR Call", duration: "30 minutes" }],
  "Interview": [{ type: "Team Lead's Call", duration: "45 minutes" }],
  "1st Interview": [{ type: "HR Call", duration: "30 minutes" }],
  "2nd Interview": [{ type: "Team Lead's Call", duration: "45 minutes" }],
  "3rd Interview": [{ type: "HM Interview", duration: "60 minutes" }],
};

interface Props {
  candidate: Candidate;
  jobStages: PipelineStage[];
  currentStageIdx: number;
  onCreateOffer: () => void;
}

const CandidateStagesTab = ({ candidate, jobStages, currentStageIdx, onCreateOffer }: Props) => {
  // Only current stage is open by default
  const defaultClosed = useMemo(() => {
    const set = new Set<string>();
    jobStages.forEach((s, idx) => {
      if (idx !== currentStageIdx) set.add(s.id);
    });
    return set;
  }, [jobStages, currentStageIdx]);

  const [closedStages, setClosedStages] = useState<Set<string>>(defaultClosed);

  const toggleStage = (stageId: string) => {
    setClosedStages((prev) => {
      const next = new Set(prev);
      if (next.has(stageId)) next.delete(stageId);
      else next.add(stageId);
      return next;
    });
  };

  const timeSinceApplied = () => {
    const diff = Date.now() - new Date(candidate.appliedAt).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

  const isLastStage = (idx: number) => idx === jobStages.length - 1;

  return (
    <div className="space-y-1">
      {/* Stage progress bar */}
      <div className="flex items-center gap-1 mb-5">
        {jobStages.map((stage, idx) => {
          const isCurrent = idx === currentStageIdx;
          const isPast = idx < currentStageIdx;
          const isFuture = idx > currentStageIdx;
          return (
            <div key={stage.id} className="flex items-center gap-1 flex-1">
              <div
                className={`h-1.5 rounded-full flex-1 transition-colors ${
                  isPast ? "bg-primary" : isCurrent ? "bg-primary" : "bg-muted"
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Stage labels under progress */}
      <div className="flex items-center gap-1 mb-6">
        {jobStages.map((stage, idx) => {
          const isCurrent = idx === currentStageIdx;
          const isPast = idx < currentStageIdx;
          return (
            <div key={stage.id} className="flex-1 text-center">
              <span className={`text-[10px] font-medium ${
                isCurrent ? "text-primary" : isPast ? "text-foreground" : "text-muted-foreground"
              }`}>
                {stage.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Stage details */}
      <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
        {jobStages.map((stage, idx) => {
          const isCurrent = stage.id === candidate.currentStageId;
          const isPast = idx < currentStageIdx;
          const isOpen = !closedStages.has(stage.id);
          const isOffer = isLastStage(idx);
          const interviews = stageInterviewConfig[stage.name];
          const isReviewStage = idx === 0;

          return (
            <Collapsible
              key={stage.id}
              open={isOpen}
              onOpenChange={() => toggleStage(stage.id)}
            >
              <CollapsibleTrigger className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors">
                {/* Status indicator */}
                {isPast ? (
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                ) : isCurrent ? (
                  <div className="h-4 w-4 rounded-full border-2 border-primary bg-primary/20 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                )}

                <span className={`text-sm font-medium ${
                  isCurrent ? "text-foreground font-semibold" : isPast ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {stage.name}
                </span>

                {isCurrent && (
                  <Badge className="bg-primary/10 text-primary border-0 text-[10px] px-2 py-0 font-semibold">
                    Current · {timeSinceApplied()}
                  </Badge>
                )}
                {isPast && (
                  <span className="text-[10px] text-muted-foreground">Completed</span>
                )}

                <ChevronDown className={`h-3.5 w-3.5 ml-auto shrink-0 text-muted-foreground transition-transform ${!isOpen ? "-rotate-90" : ""}`} />
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="px-4 pb-4 pt-1 pl-11 space-y-3">
                  {/* Application Review */}
                  {isReviewStage && (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-foreground">Reviewers</span>
                          <button className="text-muted-foreground hover:text-foreground">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <a href="#" className="text-[11px] text-primary hover:underline font-medium">Interview kit</a>
                      </div>
                      <p className="text-xs text-muted-foreground">{isPast ? "Review completed" : "No feedback submitted"}</p>
                    </>
                  )}

                  {/* Interview stages */}
                  {interviews && !isOffer && (
                    <>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-foreground">Interviews</span>
                        <button className="text-muted-foreground hover:text-foreground">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      {interviews.map((iv, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                          <div>
                            <span className="text-xs font-medium text-foreground">{iv.type}</span>
                            <span className="text-[11px] text-muted-foreground ml-2">{iv.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {!isPast && (
                              <>
                                <button className="text-[11px] text-primary hover:underline font-medium">Schedule</button>
                                <span className="text-muted-foreground/30">|</span>
                                <button className="text-[11px] text-primary hover:underline font-medium">Auto-schedule</button>
                              </>
                            )}
                            {isPast && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Done</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Non-interview, non-review, non-offer stages */}
                  {!isReviewStage && !interviews && !isOffer && (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-foreground">Reviewers</span>
                          <button className="text-muted-foreground hover:text-foreground">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <a href="#" className="text-[11px] text-primary hover:underline font-medium">Interview kit</a>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isPast ? "Completed" : "No feedback submitted"}
                      </p>
                    </>
                  )}

                  {/* Offer stage */}
                  {isOffer && (
                    <div className="text-center py-4 space-y-2">
                      <p className="text-xs text-muted-foreground">No offers created yet</p>
                      <Button size="sm" variant="outline" className="font-semibold text-xs" onClick={onCreateOffer}>
                        Create offer
                      </Button>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};

export default CandidateStagesTab;
