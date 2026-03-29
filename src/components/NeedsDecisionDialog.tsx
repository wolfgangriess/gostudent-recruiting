import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Candidate } from "@/lib/types";
import { useJobs } from "@/hooks/useJobs";
import { useStages } from "@/hooks/useStages";
import { useUpdateCandidateStage } from "@/hooks/useCandidates";
import { ThumbsUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: Candidate[];
}

const MOCK_INTERVIEWERS = [
  "Maria Pacheco Sanchez",
  "Faride Lafoz Magna",
  "Daniela Carolina Feijoa",
  "Roberto Alvarez",
  "Ana Martinez Luna",
];

const INTERVIEW_TYPES = [
  "Recruiter Call - 30 min - Get-to-know",
  "Panel Interview - 30 min - Basic topics",
  "Technical screening - 45 min",
  "Culture fit - 30 min",
  "TA Interview - 30 min",
];

const NEXT_STAGES = [
  "2nd Interview",
  "Take Home Test",
  "Technical Round",
  "Final Interview",
  "Offer Stage",
];

export const NeedsDecisionDialog = ({ open, onOpenChange, candidates }: Props) => {
  const { data: jobs = [] } = useJobs();
  const { data: stages = [] } = useStages();
  const { mutate: updateStage } = useUpdateCandidateStage();

  const getJobName = (jobId: string) => jobs.find((j) => j.id === jobId)?.name ?? "—";
  const getStageName = (stageId: string) => stages.find((s) => s.id === stageId)?.name ?? "—";

  const getInterviewer = (c: Candidate) => {
    const hash = c.id.charCodeAt(c.id.length - 1);
    return MOCK_INTERVIEWERS[hash % MOCK_INTERVIEWERS.length];
  };

  const getInterviewType = (c: Candidate) => {
    const hash = c.id.charCodeAt(c.id.length - 1);
    return INTERVIEW_TYPES[hash % INTERVIEW_TYPES.length];
  };

  const getNextStage = (c: Candidate) => {
    const hash = c.id.charCodeAt(c.id.length - 1);
    return NEXT_STAGES[hash % NEXT_STAGES.length];
  };

  const handleAdvance = (c: Candidate) => {
    const jobStages = stages.filter((s) => s.jobId === c.jobId).sort((a, b) => a.order - b.order);
    const currentIdx = jobStages.findIndex((s) => s.id === c.currentStageId);
    if (currentIdx < jobStages.length - 1) {
      const nextStage = jobStages[currentIdx + 1];
      updateStage({ candidateId: c.id, newStageId: nextStage.id });
      toast.success(`${c.firstName} ${c.lastName} advanced to ${nextStage.name}`);
    }
  };

  const handleReject = (c: Candidate) => {
    toast.info(`${c.firstName} ${c.lastName} rejected`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Needs Decision
            <Badge variant="secondary" className="ml-1">{candidates.length}</Badge>
          </DialogTitle>
        </DialogHeader>

        {candidates.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No candidates needing a decision.</p>
        ) : (
          <div className="divide-y divide-border">
            {candidates.map((c) => {
              const stageName = getStageName(c.currentStageId);
              const nextStage = getNextStage(c);
              const interviewer = getInterviewer(c);
              const interviewType = getInterviewType(c);

              return (
                <div key={c.id} className="py-5 first:pt-0 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {c.firstName[0]}{c.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {c.firstName} {c.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getJobName(c.jobId)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">{stageName}</Badge>
                  </div>

                  {/* Interview feedback */}
                  <div className="ml-12 rounded-lg border border-border px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">{interviewType}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="inline-flex items-center gap-1 font-medium text-foreground">
                        <ThumbsUp className="h-3 w-3 text-green-600" />
                        Yes
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="font-medium text-foreground">{interviewer}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">Edited</Badge>
                  </div>

                  {/* Decision */}
                  <div className="ml-12 flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">
                      Advance to {nextStage}?
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={() => handleAdvance(c)}
                    >
                      Advance
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleReject(c)}
                    >
                      ✕ Reject
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
