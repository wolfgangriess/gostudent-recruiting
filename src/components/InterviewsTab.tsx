import { useState } from "react";
import { format, isToday } from "date-fns";
import { Calendar, Clock, Video, MapPin, Users, ExternalLink, X, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Candidate } from "@/lib/types";
import ScheduleInterviewDialog from "./ScheduleInterviewDialog";
import { toast } from "sonner";
import { useInterviewsByCandidate, useCancelInterview } from "@/hooks/useInterviews";
import { useStages } from "@/hooks/useStages";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { interviewKeys } from "@/hooks/useInterviews";

interface InterviewsTabProps {
  candidate: Candidate;
}

const statusConfig = {
  scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  completed: { label: "Completed", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
};

const InterviewsTab = ({ candidate }: InterviewsTabProps) => {
  const { data: candidateInterviews = [] } = useInterviewsByCandidate(candidate.id);
  const { data: stages = [] } = useStages();
  const { mutate: cancelInterview } = useCancelInterview();
  const queryClient = useQueryClient();
  const [showSchedule, setShowSchedule] = useState(false);

  const sorted = [...candidateInterviews].sort(
    (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
  );

  const upcoming = sorted.filter((i) => i.status === "scheduled");
  const past = sorted.filter((i) => i.status !== "scheduled");

  const handleCancel = (id: string) => {
    cancelInterview(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: interviewKeys.byCandidate(candidate.id) });
        toast.success("Interview cancelled");
      },
      onError: () => toast.error("Failed to cancel interview"),
    });
  };

  const handleComplete = async (id: string) => {
    const { error } = await supabase
      .from("interviews")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error("Failed to mark interview as completed");
    } else {
      queryClient.invalidateQueries({ queryKey: interviewKeys.byCandidate(candidate.id) });
      queryClient.invalidateQueries({ queryKey: interviewKeys.all });
      toast.success("Interview marked as completed");
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Interviews</h3>
          <Button size="sm" className="text-xs gap-1.5 h-8" onClick={() => setShowSchedule(true)}>
            <Plus className="h-3.5 w-3.5" />
            Schedule Interview
          </Button>
        </div>

        {sorted.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
            <Calendar className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">No interviews scheduled</p>
              <p className="text-xs text-muted-foreground">Schedule an interview to get started</p>
            </div>
            <Button size="sm" className="text-xs" onClick={() => setShowSchedule(true)}>
              Schedule Interview
            </Button>
          </div>
        ) : (
          <>
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Upcoming</h4>
                <div className="space-y-2">
                  {upcoming.map((interview) => {
                    const stage = stages.find((s) => s.id === interview.stage_id);
                    const startDate = new Date(interview.start_time);
                    const endDate = new Date(interview.end_time);
                    const today = isToday(startDate);

                    return (
                      <div
                        key={interview.id}
                        className={`rounded-lg border p-4 ${today ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-foreground">{interview.title}</h4>
                              {today && (
                                <Badge className="bg-primary/15 text-primary text-[10px] px-1.5 py-0">Today</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(startDate, "MMM d, yyyy")}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(startDate, "h:mm a")} – {format(endDate, "h:mm a")}
                              </span>
                              {stage && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{stage.name}</Badge>
                              )}
                            </div>
                          </div>
                          <Badge className={`text-[10px] px-1.5 py-0 font-semibold ${statusConfig.scheduled.className}`}>
                            {statusConfig.scheduled.label}
                          </Badge>
                        </div>

                        {/* Details */}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {interview.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {interview.location}
                            </span>
                          )}
                          {interview.meeting_link && (
                            <a
                              href={interview.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Video className="h-3 w-3" />
                              Join Meeting
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 gap-1 text-muted-foreground hover:text-foreground"
                            onClick={() => handleComplete(interview.id)}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Mark Completed
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 gap-1 text-destructive hover:text-destructive"
                            onClick={() => handleCancel(interview.id)}
                          >
                            <X className="h-3 w-3" />
                            Cancel
                          </Button>
                          {interview.google_event_id && (
                            <a
                              href={`https://calendar.google.com/calendar/event?eid=${interview.google_event_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-auto"
                            >
                              <Button variant="ghost" size="sm" className="text-xs h-7 gap-1 text-muted-foreground">
                                <ExternalLink className="h-3 w-3" />
                                View in Calendar
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Past */}
            {past.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Past</h4>
                <div className="space-y-2">
                  {past.map((interview) => {
                    const stage = stages.find((s) => s.id === interview.stage_id);
                    const config = statusConfig[interview.status as keyof typeof statusConfig] ?? statusConfig.cancelled;

                    return (
                      <div key={interview.id} className="rounded-lg border border-border bg-card p-4 opacity-75">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-foreground">{interview.title}</h4>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(interview.start_time), "MMM d, yyyy · h:mm a")}
                              </span>
                              {stage && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{stage.name}</Badge>
                              )}
                            </div>
                          </div>
                          <Badge className={`text-[10px] px-1.5 py-0 font-semibold ${config.className}`}>
                            {config.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ScheduleInterviewDialog
        open={showSchedule}
        onOpenChange={setShowSchedule}
        candidate={candidate}
      />
    </>
  );
};

export default InterviewsTab;
