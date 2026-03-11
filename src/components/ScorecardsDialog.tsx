import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Candidate, ScorecardTemplate } from "@/lib/types";
import { useATSStore } from "@/lib/ats-store";
import { format } from "date-fns";
import { ClipboardList, Star, CheckCircle, MessageSquare, ChevronRight } from "lucide-react";
import { useState } from "react";
import { CandidateDetailDialog } from "@/components/CandidateDetailDialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: Candidate[];
}

export const ScorecardsDialog = ({ open, onOpenChange, candidates }: Props) => {
  const { jobs, stages, scorecardTemplates, evaluations, users } = useATSStore();
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const getJobName = (jobId: string) => jobs.find((j) => j.id === jobId)?.name ?? "—";
  const getStageName = (stageId: string) => stages.find((s) => s.id === stageId)?.name ?? "—";

  const getScorecardForStage = (stageId: string): ScorecardTemplate | undefined => {
    return scorecardTemplates.find((t) => t.stageId === stageId);
  };

  const hasCompletedScorecard = (candidateId: string, stageId: string) => {
    return evaluations.some((e) => e.candidateId === candidateId && e.stageId === stageId);
  };

  const ratingTypeIcon = (type: string) => {
    switch (type) {
      case "scale": return <Star className="h-3 w-3 text-secondary" />;
      case "yes_no": return <CheckCircle className="h-3 w-3 text-green-500" />;
      case "text": return <MessageSquare className="h-3 w-3 text-primary" />;
      default: return null;
    }
  };

  const ratingTypeLabel = (type: string) => {
    switch (type) {
      case "scale": return "1–5 Scale";
      case "yes_no": return "Yes / No";
      case "text": return "Text";
      default: return type;
    }
  };

  // Build scorecard items: each candidate + their stage's scorecard template
  const scorecardItems = candidates.map((c) => {
    const template = getScorecardForStage(c.currentStageId);
    const completed = hasCompletedScorecard(c.id, c.currentStageId);
    return { candidate: c, template, completed };
  });

  const pendingItems = scorecardItems.filter((item) => !item.completed);
  const completedItems = scorecardItems.filter((item) => item.completed);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Scorecards Due
              <Badge variant="secondary" className="ml-1">{pendingItems.length} pending</Badge>
            </DialogTitle>
          </DialogHeader>

          {pendingItems.length === 0 && completedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No scorecards to complete.</p>
          ) : (
            <div className="space-y-1">
              {/* Pending scorecards */}
              {pendingItems.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Pending ({pendingItems.length})
                  </p>
                  <div className="divide-y divide-border">
                    {pendingItems.map(({ candidate: c, template }) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors"
                        onClick={() => setSelectedCandidate(c)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-xs font-bold text-destructive">
                            {c.firstName[0]}{c.lastName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {c.firstName} {c.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {getJobName(c.jobId)} · {getStageName(c.currentStageId)}
                            </p>
                            {template && (
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {template.criteria.map((cr) => (
                                  <span key={cr.id} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                    {ratingTypeIcon(cr.ratingType)}
                                    {cr.question.length > 30 ? cr.question.slice(0, 30) + "…" : cr.question}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs border-destructive/50 text-destructive">
                            Due
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed scorecards */}
              {completedItems.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Completed ({completedItems.length})
                  </p>
                  <div className="divide-y divide-border">
                    {completedItems.map(({ candidate: c }) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors opacity-60"
                        onClick={() => setSelectedCandidate(c)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                            {c.firstName[0]}{c.lastName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {c.firstName} {c.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {getJobName(c.jobId)} · {getStageName(c.currentStageId)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs border-green-500/50 text-green-600">
                            Done
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {selectedCandidate && (
        <CandidateDetailDialog
          candidate={selectedCandidate}
          open={!!selectedCandidate}
          onOpenChange={(o) => { if (!o) setSelectedCandidate(null); }}
        />
      )}
    </>
  );
};
