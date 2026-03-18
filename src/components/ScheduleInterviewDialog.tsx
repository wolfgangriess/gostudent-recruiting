import { useState, useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, MapPin, Users, Video, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useATSStore } from "@/lib/ats-store";
import { Candidate } from "@/lib/types";
import { useGoogleCalendarIntegration } from "@/hooks/useGoogleCalendarIntegration";
import { toast } from "sonner";

const DURATION_OPTIONS = [
  { value: "30", label: "30 min" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
];

const TIME_SLOTS = Array.from({ length: 20 }, (_, i) => {
  const h = Math.floor(i / 2) + 8;
  const m = i % 2 === 0 ? "00" : "30";
  const label = `${h > 12 ? h - 12 : h}:${m} ${h >= 12 ? "PM" : "AM"}`;
  return { value: `${String(h).padStart(2, "0")}:${m}`, label };
});

interface ScheduleInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate;
}

const ScheduleInterviewDialog = ({ open, onOpenChange, candidate }: ScheduleInterviewDialogProps) => {
  const { jobs, stages, users, addInterview } = useATSStore();
  const { connected: googleCalendarConnected } = useGoogleCalendarIntegration();
  const job = jobs.find((j) => j.id === candidate.jobId);
  const jobStages = stages.filter((s) => s.jobId === candidate.jobId).sort((a, b) => a.order - b.order);
  const currentStage = stages.find((s) => s.id === candidate.currentStageId);

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("10:00");
  const [duration, setDuration] = useState("60");
  const [stageId, setStageId] = useState(candidate.currentStageId);
  const [title, setTitle] = useState(
    `Interview with ${candidate.firstName} ${candidate.lastName} - ${job?.name ?? ""}`
  );
  const [location, setLocation] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [description, setDescription] = useState("");
  const [addToCalendar, setAddToCalendar] = useState(true);
  const [addMeetLink, setAddMeetLink] = useState(true);
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>(() => {
    const stageOwner = currentStage?.ownerId;
    return stageOwner ? [stageOwner] : [];
  });
  const [saving, setSaving] = useState(false);

  const availableAttendees = useMemo(() => {
    const hiringTeamIds = job?.hiringTeamIds ?? [];
    const recruiterIds = job?.recruiters ?? [];
    const allIds = [...new Set([...hiringTeamIds, ...recruiterIds, job?.hiringManager ?? ""])].filter(Boolean);
    return users.filter((u) => allIds.includes(u.id));
  }, [job, users]);

  const toggleAttendee = (userId: string) => {
    setSelectedAttendees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const endTime = useMemo(() => {
    if (!startTime) return "";
    const [h, m] = startTime.split(":").map(Number);
    const totalMins = h * 60 + m + parseInt(duration);
    const endH = Math.floor(totalMins / 60) % 24;
    const endM = totalMins % 60;
    return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
  }, [startTime, duration]);

  const handleSubmit = async () => {
    if (!date) {
      toast.error("Please select a date");
      return;
    }

    setSaving(true);

    const [sh, sm] = startTime.split(":").map(Number);
    const startDate = new Date(date);
    startDate.setHours(sh, sm, 0, 0);

    const [eh, em] = endTime.split(":").map(Number);
    const endDate = new Date(date);
    endDate.setHours(eh, em, 0, 0);

    const attendeesList = selectedAttendees.map((id) => {
      const u = users.find((u) => u.id === id);
      return { email: u?.email ?? "", name: u ? `${u.firstName} ${u.lastName}` : "" };
    });

    let googleEventId: string | undefined;
    let finalMeetingLink = meetingLink;

    // If Google Calendar is connected and user wants calendar event
    if (addToCalendar && googleCalendarConnected) {
      try {
        const { data, error } = await supabase.functions.invoke("google-calendar-api", {
          body: {
            action: "create_event",
            summary: title,
            description,
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
            attendees: attendeesList,
            location,
            createMeetLink: addMeetLink,
          },
        });

        if (error) throw error;
        googleEventId = data?.googleEventId;
        if (data?.meetingLink) finalMeetingLink = data.meetingLink;
      } catch (err) {
        console.error("Failed to create Google Calendar event:", err);
        toast.error("Could not create calendar event, but interview will still be saved.");
      }
    }

    addInterview({
      id: `interview-${Date.now()}`,
      candidateId: candidate.id,
      jobId: candidate.jobId,
      stageId,
      title,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      location,
      meetingLink: finalMeetingLink,
      description,
      status: "scheduled",
      attendees: attendeesList,
      googleEventId,
      createdAt: new Date().toISOString(),
    });

    setSaving(false);
    toast.success("Interview scheduled!", {
      description: googleEventId
        ? "Calendar event created and invites sent."
        : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Schedule Interview</DialogTitle>
          <p className="text-xs text-muted-foreground">
            {candidate.firstName} {candidate.lastName} · {job?.name}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Interview Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Interview Stage</Label>
            <Select value={stageId} onValueChange={setStageId}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {jobStages.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full h-9 justify-start text-left text-sm font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                    {date ? format(date, "MMM d, yyyy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Start Time</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Attendees
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {availableAttendees.map((u) => {
                const selected = selectedAttendees.includes(u.id);
                return (
                  <Badge
                    key={u.id}
                    variant={selected ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer text-xs py-1 px-2.5 transition-all",
                      selected ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    )}
                    onClick={() => toggleAttendee(u.id)}
                  >
                    {u.firstName} {u.lastName}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Location
            </Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Office, room, or address"
              className="text-sm h-9"
            />
          </div>

          {!googleCalendarConnected && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <Video className="h-3.5 w-3.5" />
                Meeting Link
              </Label>
              <Input
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="text-sm h-9"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Notes / Description
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Interview agenda, preparation notes…"
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          {googleCalendarConnected && (
            <div className="rounded-lg border border-border p-3 space-y-3 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium text-foreground">Add to Google Calendar</span>
                </div>
                <Switch checked={addToCalendar} onCheckedChange={setAddToCalendar} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium text-foreground">Generate Google Meet link</span>
                </div>
                <Switch checked={addMeetLink} onCheckedChange={setAddMeetLink} />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={saving || !date}>
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                Scheduling…
              </>
            ) : (
              "Schedule Interview"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleInterviewDialog;
