import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Candidate } from "@/lib/types";
import { useJobs } from "@/hooks/useJobs";
import { useStages } from "@/hooks/useStages";
import { CalendarClock } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: Candidate[];
}

const INTERVIEW_TYPES = [
  "TL - 30min - Practical assessment",
  "Team Lead's Call (45 min)",
  "Role Play - Dominik - 30 min",
  "Technical screening - 45 min",
  "Culture fit - 30 min",
];

export const CandidatesToScheduleDialog = ({ open, onOpenChange, candidates }: Props) => {
  const { data: jobs = [] } = useJobs();
  const { data: stages = [] } = useStages();

  const getJobName = (jobId: string) => jobs.find((j) => j.id === jobId)?.name ?? "—";
  const getStageName = (stageId: string) => stages.find((s) => s.id === stageId)?.name ?? "—";

  const getInterviewType = (c: Candidate) => {
    const hash = c.id.charCodeAt(c.id.length - 1);
    return INTERVIEW_TYPES[hash % INTERVIEW_TYPES.length];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            Candidates to Schedule
            <Badge variant="secondary" className="ml-1">{candidates.length}</Badge>
          </DialogTitle>
        </DialogHeader>

        {candidates.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No candidates to schedule.</p>
        ) : (
          <div className="divide-y divide-border">
            {candidates.map((c) => {
              const stageName = getStageName(c.currentStageId);
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
                          {getJobName(c.jobId)} · {stageName}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0 border-destructive/50 text-destructive">
                      Not Requested
                    </Badge>
                  </div>

                  {/* Interview + actions */}
                  <div className="ml-12 rounded-lg border border-border px-3 py-2.5 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{interviewType}</span>
                    <div className="flex items-center gap-2">
                      <button
                        className="text-xs text-primary font-medium hover:underline"
                        onClick={() => toast.info("Manual scheduling opened")}
                      >
                        Schedule manually
                      </button>
                      <span className="text-muted-foreground text-xs">|</span>
                      <button
                        className="text-xs text-secondary font-medium hover:underline"
                        onClick={() => toast.info("Automated scheduling started")}
                      >
                        Automated
                      </button>
                    </div>
                  </div>

                  {/* Request availability */}
                  <div className="ml-12">
                    <button
                      className="text-xs text-primary font-medium hover:underline"
                      onClick={() => toast.success(`Availability requested for ${c.firstName} ${c.lastName}`)}
                    >
                      Request Availability →
                    </button>
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
