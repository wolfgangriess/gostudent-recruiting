import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Candidate } from "@/lib/types";
import { useJobs } from "@/hooks/useJobs";
import { useStages } from "@/hooks/useStages";
import { format, addDays, setHours, setMinutes } from "date-fns";
import { Calendar, ChevronRight, Video } from "lucide-react";
import { toast } from "sonner";
import { CandidateDetailDialog } from "@/components/CandidateDetailDialog";
import { useState } from "react";

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

const INTERVIEW_TYPES = [
  "Practical assessment",
  "Basic requirements",
  "TA Interview",
  "Technical screening",
  "Culture fit",
];

export const UpcomingInterviewsDialog = ({ open, onOpenChange, candidates }: Props) => {
  const { data: jobs = [] } = useJobs();
  const { data: stages = [] } = useStages();
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Interviews Today
              <Badge variant="secondary" className="ml-1">{candidates.length}</Badge>
            </DialogTitle>
          </DialogHeader>

          {candidates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No upcoming interviews today.</p>
          ) : (
            <div className="divide-y divide-border">
              {candidates.map((c) => {
                const interviewDt = getInterviewDateTime(c);
                const stageName = getStageName(c.currentStageId);
                const interviewerCount = (c.id.charCodeAt(c.id.length - 1) % 2) + 1;

                return (
                  <div key={c.id} className="py-4 first:pt-0">
                    {/* Candidate row */}
                    <div
                      className="flex items-center justify-between cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                      onClick={() => setSelectedCandidate(c)}
                    >
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
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs font-medium text-foreground">
                            {format(interviewDt, "h:mm a")}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {format(interviewDt, "MMM d")}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    {/* Interview details */}
                    <div className="ml-12 mt-2 space-y-2">
                      {Array.from({ length: interviewerCount }).map((_, idx) => {
                        const interviewer = getInterviewerForCandidate(c, idx);
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                                {interviewer.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-foreground">{interviewer}</p>
                                {idx === 0 && (
                                  <p className="text-[11px] text-muted-foreground">{getInterviewType(c)} · 30 min</p>
                                )}
                              </div>
                            </div>
                            <button
                              className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/20 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText("https://meet.google.com/abc-defg-hij");
                                toast.success("Meeting link copied!");
                              }}
                            >
                              <Video className="h-3 w-3" />
                              Copy link
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
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
