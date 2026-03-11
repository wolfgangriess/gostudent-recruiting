import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Candidate } from "@/lib/types";
import { useATSStore } from "@/lib/ats-store";
import { format, addDays, setHours, setMinutes } from "date-fns";
import { ChevronDown, ChevronRight, Calendar, ThumbsUp, Video, AlertCircle } from "lucide-react";
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
  "Recruiter Call - 30 min - Google Meet - Get-to-know",
  "Daniela Interview - Google Meet - 30 minutes - basic topics & filter question",
  "Technical screening - 45min - Google Meet",
  "Culture fit - 30min - Google Meet",
  "TA Interview - Google Meet - 30 minutes",
];

const getInterviewDateTime = (candidate: Candidate) => {
  const hash = candidate.id.charCodeAt(candidate.id.length - 1) % 5;
  const today = new Date();
  const day = addDays(today, hash);
  const hours = [9, 10, 11, 13, 14, 15, 16][hash % 7];
  const mins = [0, 15, 30, 45][hash % 4];
  return setMinutes(setHours(day, hours), mins);
};

const NEXT_STAGES = [
  "2nd Interview",
  "Take Home Test",
  "Technical Round",
  "Final Interview",
  "Offer Stage",
];

export const NeedsDecisionDialog = ({ open, onOpenChange, candidates }: Props) => {
  const { jobs, stages, moveCandidateToStage } = useATSStore();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const getJobName = (jobId: string) => jobs.find((j) => j.id === jobId)?.name ?? "—";
  const getStageName = (stageId: string) => stages.find((s) => s.id === stageId)?.name ?? "—";

  const getInterviewerForCandidate = (c: Candidate, index: number) => {
    const hash = c.id.charCodeAt(c.id.length - 1);
    return MOCK_INTERVIEWERS[(hash + index) % MOCK_INTERVIEWERS.length];
  };

  const getInterviewType = (c: Candidate) => {
    const hash = c.id.charCodeAt(c.id.length - 1);
    return INTERVIEW_TYPES[hash % INTERVIEW_TYPES.length];
  };

  const getNextStage = (c: Candidate) => {
    const hash = c.id.charCodeAt(c.id.length - 1);
    return NEXT_STAGES[hash % NEXT_STAGES.length];
  };

  const getDaysAgo = (c: Candidate) => {
    const hash = c.id.charCodeAt(c.id.length - 1) % 7;
    return hash + 1;
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdvance = (c: Candidate) => {
    const jobStages = stages.filter((s) => s.jobId === c.jobId).sort((a, b) => a.order - b.order);
    const currentIdx = jobStages.findIndex((s) => s.id === c.currentStageId);
    if (currentIdx < jobStages.length - 1) {
      moveCandidateToStage(c.id, jobStages[currentIdx + 1].id);
      toast.success(`${c.firstName} ${c.lastName} advanced to ${jobStages[currentIdx + 1].name}`);
    }
  };

  const handleReject = (c: Candidate) => {
    toast.info(`${c.firstName} ${c.lastName} rejected`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Needs Decision
            <Badge variant="secondary" className="ml-1">{candidates.length}</Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Table header */}
        <div className="grid grid-cols-[180px_1fr] text-xs text-muted-foreground border-b border-border pb-2">
          <span>Name</span>
          <span>Job / Status</span>
        </div>

        {candidates.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No candidates needing a decision.</p>
        ) : (
          <div className="divide-y divide-border">
            {candidates.map((c) => {
              const interviewDt = getInterviewDateTime(c);
              const stageName = getStageName(c.currentStageId);
              const isExpanded = expandedIds.has(c.id);
              const daysAgo = getDaysAgo(c);
              const nextStage = getNextStage(c);
              const interviewer = getInterviewerForCandidate(c, 0);
              const interviewType = getInterviewType(c);

              return (
                <div key={c.id} className="py-4">
                  {/* Candidate header */}
                  <div className="grid grid-cols-[180px_1fr] items-start gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {c.firstName} {c.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {getJobName(c.jobId)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ↑ {stageName} · Needs decision in {stageName}
                      </p>
                    </div>
                  </div>

                  {/* Availability row */}
                  <div className="grid grid-cols-[180px_1fr] items-center mt-3">
                    <div
                      className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground"
                      onClick={() => toggleExpanded(c.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                      <span>Availability</span>
                      <span className="text-primary font-medium">Confirmation Sent</span>
                      <span className="ml-1">{daysAgo} days ago</span>
                    </div>
                    <div>
                      <button
                        className="text-xs text-primary font-medium hover:underline"
                        onClick={() => toast.info("Confirmation resent")}
                      >
                        Resend
                      </button>
                    </div>
                  </div>

                  {/* Interviews section */}
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-primary mb-2">Interviews</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground ml-1">
                      <span>{interviewType}</span>
                      <span className="inline-flex items-center gap-1 text-foreground font-medium">
                        <ThumbsUp className="h-3 w-3 text-green-600" />
                        Yes,
                      </span>
                      <span className="text-foreground font-medium">{interviewer}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">Edited</Badge>
                    </div>
                  </div>

                  {/* Decision row */}
                  <div className="mt-4 flex items-center gap-3 bg-muted/40 -mx-2 px-3 py-2.5 rounded-lg">
                    <span className="text-sm font-semibold text-foreground">
                      Advance {c.firstName} {c.lastName} to {nextStage}?
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
