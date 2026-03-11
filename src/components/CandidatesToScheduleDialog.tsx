import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Candidate } from "@/lib/types";
import { useATSStore } from "@/lib/ats-store";
import { CalendarClock, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: Candidate[];
}

const INTERVIEW_TYPES = [
  "TL - 30min - Google Meet - Practical assessment of competences",
  "Team Lead's Call (45 minutes)",
  "Role Play - Dominik - 30 min",
  "Technical screening - 45min - Google Meet",
  "Culture fit - 30min - Google Meet",
];

export const CandidatesToScheduleDialog = ({ open, onOpenChange, candidates }: Props) => {
  const { jobs, stages } = useATSStore();

  const getJobName = (jobId: string) => jobs.find((j) => j.id === jobId)?.name ?? "—";
  const getStageName = (stageId: string) => stages.find((s) => s.id === stageId)?.name ?? "—";

  const getInterviewType = (c: Candidate) => {
    const hash = c.id.charCodeAt(c.id.length - 1);
    return INTERVIEW_TYPES[hash % INTERVIEW_TYPES.length];
  };

  const getTodos = (c: Candidate) => {
    const hash = c.id.charCodeAt(c.id.length - 1) % 3;
    return hash + 1;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            Candidates to Schedule
            <Badge variant="secondary" className="ml-1">{candidates.length}</Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Table header */}
        <div className="grid grid-cols-[180px_1fr] text-xs text-muted-foreground border-b border-border pb-2">
          <span>Name</span>
          <span>Job / Status</span>
        </div>

        {candidates.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No candidates to schedule.</p>
        ) : (
          <div className="divide-y divide-border">
            {candidates.map((c) => {
              const stageName = getStageName(c.currentStageId);
              const interviewType = getInterviewType(c);
              const todos = getTodos(c);

              return (
                <div key={c.id} className="py-4">
                  {/* Candidate header */}
                  <div className="grid grid-cols-[180px_1fr] items-start gap-2">
                    <div>
                      <p className="text-sm font-semibold text-primary">
                        {c.firstName} {c.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {getJobName(c.jobId)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ↑ {stageName} · {todos} to-do{todos > 1 ? "s" : ""} for {stageName}
                        {" · "}
                        <span className="text-primary">Interview to schedule for {stageName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Availability row */}
                  <div className="grid grid-cols-[180px_1fr] items-center mt-3">
                    <div className="text-xs">
                      <span className="text-muted-foreground">Availability </span>
                      <span className="text-destructive font-medium">Not Requested</span>
                    </div>
                    <div>
                      <button
                        className="text-xs text-primary font-medium hover:underline"
                        onClick={() => toast.success(`Availability requested for ${c.firstName} ${c.lastName}`)}
                      >
                        Request Availability
                      </button>
                    </div>
                  </div>

                  {/* Interviews section */}
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-primary mb-2">Interviews</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-muted-foreground">{interviewType}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        className="text-xs text-primary font-medium hover:underline"
                        onClick={() => toast.info("Manual scheduling opened")}
                      >
                        Schedule manually
                      </button>
                      <span className="text-muted-foreground">|</span>
                      <button
                        className="text-xs text-secondary font-medium hover:underline"
                        onClick={() => toast.info("Automated scheduling started")}
                      >
                        Automated scheduling
                      </button>
                      <span className="text-muted-foreground">|</span>
                      <span className="text-muted-foreground cursor-pointer hover:text-foreground">•••</span>
                    </div>
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
