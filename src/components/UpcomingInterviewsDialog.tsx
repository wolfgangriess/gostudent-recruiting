import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Candidate } from "@/lib/types";
import { useATSStore } from "@/lib/ats-store";
import { format, addDays, setHours, setMinutes } from "date-fns";
import { Calendar, Copy, ChevronDown, ChevronRight, Link2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: Candidate[];
}

const getInterviewDateTime = (candidate: Candidate) => {
  const hash = candidate.id.charCodeAt(candidate.id.length - 1) % 5;
  const today = new Date();
  const day = addDays(today, hash);
  const hours = [9, 10, 11, 13, 14, 15, 16][hash % 7];
  const mins = [0, 15, 30, 45][hash % 4];
  return setMinutes(setHours(day, hours), mins);
};

const MOCK_INTERVIEWERS = [
  "Maria Pacheco Sanchez",
  "Faride Lafoz Magna",
  "Daniela Carolina Feijoa",
  "Roberto Alvarez",
  "Ana Martinez Luna",
];

export const UpcomingInterviewsDialog = ({ open, onOpenChange, candidates }: Props) => {
  const { jobs, stages, users } = useATSStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getJobName = (jobId: string) => jobs.find((j) => j.id === jobId)?.name ?? "—";
  const getStageName = (stageId: string) => stages.find((s) => s.id === stageId)?.name ?? "—";

  const getInterviewerForCandidate = (c: Candidate, index: number) => {
    const hash = c.id.charCodeAt(c.id.length - 1);
    return MOCK_INTERVIEWERS[(hash + index) % MOCK_INTERVIEWERS.length];
  };

  const getInterviewType = (c: Candidate) => {
    const types = [
      "TL - 30min - Google Meet - Practical assessment",
      "Recruiter - 30min - Google Meet - Basic requirements",
      "TA Interview",
      "Technical screening - 45min",
      "Culture fit - 30min - Google Meet",
    ];
    const hash = c.id.charCodeAt(c.id.length - 1);
    return types[hash % types.length];
  };

  const getDaysAgo = (c: Candidate) => {
    const hash = c.id.charCodeAt(c.id.length - 1) % 7;
    return hash + 1;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upcoming Interviews Today</DialogTitle>
        </DialogHeader>

        {/* Table header */}
        <div className="grid grid-cols-[200px_1fr] text-xs text-muted-foreground border-b border-border pb-2">
          <span>Name</span>
          <span>Job / Status</span>
        </div>

        <div className="divide-y divide-border">
          {candidates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No upcoming interviews today.</p>
          ) : (
            candidates.map((c) => {
              const interviewDt = getInterviewDateTime(c);
              const stageName = getStageName(c.currentStageId);
              const isExpanded = expandedId === c.id;
              const daysAgo = getDaysAgo(c);
              const interviewerCount = (c.id.charCodeAt(c.id.length - 1) % 2) + 1;

              return (
                <div key={c.id} className="py-4">
                  {/* Candidate header */}
                  <div className="grid grid-cols-[200px_1fr] items-start gap-2">
                    <div>
                      <p className="text-sm font-semibold text-primary cursor-pointer hover:underline">
                        {c.firstName} {c.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {getJobName(c.jobId)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ↑ {stageName} · 1st Interview on {format(interviewDt, "MMM d")}
                      </p>
                    </div>
                  </div>

                  {/* Availability row */}
                  <div className="grid grid-cols-[200px_1fr] items-center mt-3">
                    <div
                      className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground"
                      onClick={() => setExpandedId(isExpanded ? null : c.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                      <span>Availability</span>
                      <span className="text-primary font-medium">Confirmation Sent</span>
                      <span className="text-muted-foreground ml-1">{daysAgo} days ago</span>
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
                  <div className="mt-3 ml-0">
                    <p className="text-xs font-semibold text-primary mb-2">Interviews</p>
                    <div className="grid grid-cols-[200px_1fr] gap-y-3">
                      {Array.from({ length: interviewerCount }).map((_, idx) => {
                        const interviewer = getInterviewerForCandidate(c, idx);
                        return (
                          <div key={idx} className="contents">
                            <div className="text-xs text-muted-foreground pr-4">
                              {idx === 0 && getInterviewType(c)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <div className="h-3 w-3 rounded-full border border-muted-foreground/30" />
                                <span className="text-xs font-medium text-foreground">{interviewer}</span>
                              </div>
                              <p className="text-xs text-muted-foreground ml-[18px] mt-0.5">
                                {format(interviewDt, "MMM d, yyyy h:mma")}
                              </p>
                              <button
                                className="flex items-center gap-1 text-xs text-primary font-medium hover:underline ml-[18px] mt-0.5"
                                onClick={() => {
                                  navigator.clipboard.writeText("https://meet.google.com/abc-defg-hij");
                                  toast.success("Meeting link copied!");
                                }}
                              >
                                <Calendar className="h-3 w-3" />
                                <span>Copy meeting link</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
