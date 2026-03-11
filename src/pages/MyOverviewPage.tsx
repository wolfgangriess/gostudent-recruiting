import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, ClipboardList, ChevronRight, Star, TrendingUp, Clock, FileText, Linkedin, ExternalLink } from "lucide-react";
import { useATSStore } from "@/lib/ats-store";
import { Candidate } from "@/lib/types";
import { format, addDays, setHours, setMinutes } from "date-fns";
import { CandidateDetailDialog } from "@/components/CandidateDetailDialog";
import { UpcomingInterviewsDialog } from "@/components/UpcomingInterviewsDialog";
import { ScorecardsDialog } from "@/components/ScorecardsDialog";
import { NewApplicationsDialog } from "@/components/NewApplicationsDialog";
import { NeedsDecisionDialog } from "@/components/NeedsDecisionDialog";
import { CandidatesToScheduleDialog } from "@/components/CandidatesToScheduleDialog";
import { OffersDialog } from "@/components/OffersDialog";
import { PendingApprovalsDialog } from "@/components/PendingApprovalsDialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const CURRENT_USER_ID = "user-1";

const TIME_PERIODS = [
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "180", label: "Last 6 months" },
  { value: "365", label: "Last 12 months" },
];

const MyOverviewPage = () => {
  const { candidates, jobs, stages, users } = useATSStore();
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showInterviewsDialog, setShowInterviewsDialog] = useState(false);
  const [showScorecardsDialog, setShowScorecardsDialog] = useState(false);
  const [interviewDialogCandidates, setInterviewDialogCandidates] = useState<Candidate[]>([]);
  const [scorecardDialogCandidates, setScorecardDialogCandidates] = useState<Candidate[]>([]);
  const [showApplicationsDialog, setShowApplicationsDialog] = useState(false);
  const [applicationDialogCandidates, setApplicationDialogCandidates] = useState<Candidate[]>([]);
  const [showDecisionDialog, setShowDecisionDialog] = useState(false);
  const [decisionDialogCandidates, setDecisionDialogCandidates] = useState<Candidate[]>([]);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduleDialogCandidates, setScheduleDialogCandidates] = useState<Candidate[]>([]);
  const [showOffersDialog, setShowOffersDialog] = useState(false);
  const [offersDialogCandidates, setOffersDialogCandidates] = useState<Candidate[]>([]);
  const [showPendingApprovalsDialog, setShowPendingApprovalsDialog] = useState(false);
  const [pendingApprovalsDialogCandidates, setPendingApprovalsDialogCandidates] = useState<Candidate[]>([]);
  const [perfPeriod, setPerfPeriod] = useState("90");
  const [perfJob, setPerfJob] = useState("all");

  const currentUser = users.find((u) => u.id === CURRENT_USER_ID);
  const isRecruiter = jobs.some((j) => j.recruiters.includes(CURRENT_USER_ID));

  const myInterviews = useMemo(() => {
    const myStageIds = stages
      .filter((s) => s.ownerId === CURRENT_USER_ID && (s.name === "Interview" || s.name === "Phone Screen"))
      .map((s) => s.id);
    return candidates.filter((c) => myStageIds.includes(c.currentStageId));
  }, [candidates, stages]);

  const myApprovals = useMemo(() => {
    const myJobIds = jobs.filter((j) => j.hiringManager === CURRENT_USER_ID).map((j) => j.id);
    const offerStageIds = stages.filter((s) => s.name === "Offer").map((s) => s.id);
    return candidates.filter((c) => myJobIds.includes(c.jobId) && offerStageIds.includes(c.currentStageId));
  }, [candidates, jobs, stages]);

  const taskItems = useMemo(() => {
    const myJobIds = jobs.filter((j) => j.hiringManager === CURRENT_USER_ID || j.recruiters.includes(CURRENT_USER_ID)).map((j) => j.id);
    const myCandidates = candidates.filter((c) => myJobIds.includes(c.jobId));

    const byStage = (name: string) => myCandidates.filter((c) => {
      const stage = stages.find((s) => s.id === c.currentStageId);
      return stage?.name === name;
    });

    const interviewCandidates = byStage("Interview");
    const phoneScreenCandidates = byStage("Phone Screen");
    const appliedCandidates = byStage("Applied");
    const offerCandidates = byStage("Offer");

    return [
      { label: "Upcoming Interviews Today", candidates: interviewCandidates },
      { label: "Scorecards Due", candidates: interviewCandidates },
      { label: "New Applications to Review", candidates: appliedCandidates },
      
      { label: "Needs Decision", candidates: interviewCandidates },
      { label: "Candidates to Schedule", candidates: phoneScreenCandidates },
      { label: "Offers", candidates: offerCandidates },
      { label: "Pending Approvals", candidates: offerCandidates },
    ];
  }, [candidates, jobs, stages]);

  const myRecruiterJobs = useMemo(
    () => jobs.filter((j) => j.recruiters.includes(CURRENT_USER_ID)),
    [jobs]
  );

  // Performance data (recruiter only)
  const performanceData = useMemo(() => {
    if (!isRecruiter) return null;
    const periodDays = parseInt(perfPeriod);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - periodDays);

    const myJobIds = perfJob === "all"
      ? myRecruiterJobs.map((j) => j.id)
      : [perfJob];

    const myCandidates = candidates.filter((c) =>
      myJobIds.includes(c.jobId) && new Date(c.appliedAt) >= cutoff
    );

    const applications = myCandidates.length;

    const screened = myCandidates.filter((c) => {
      const stage = stages.find((s) => s.id === c.currentStageId);
      return stage && stage.name !== "Applied";
    }).length;

    const offerStageIds = stages.filter((s) => s.name === "Offer" || s.name === "Hired").map((s) => s.id);
    const offersCreated = myCandidates.filter((c) => offerStageIds.includes(c.currentStageId)).length;

    const hiredStageIds = stages.filter((s) => s.name === "Hired").map((s) => s.id);
    const offersAccepted = myCandidates.filter((c) => hiredStageIds.includes(c.currentStageId)).length;

    const weeksCount = Math.ceil(periodDays / 7);
    const weeks: { week: string; offers: number; accepted: number }[] = [];
    const now = new Date();
    for (let i = weeksCount - 1; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const weekOffers = myCandidates.filter((c) => {
        const d = new Date(c.appliedAt);
        return offerStageIds.includes(c.currentStageId) && d >= weekStart && d < weekEnd;
      }).length;
      const weekAccepted = myCandidates.filter((c) => {
        const d = new Date(c.appliedAt);
        return hiredStageIds.includes(c.currentStageId) && d >= weekStart && d < weekEnd;
      }).length;
      weeks.push({
        week: weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        offers: weekOffers,
        accepted: weekAccepted,
      });
    }

    return { applications, screened, offersCreated, offersAccepted, trendData: weeks };
  }, [isRecruiter, candidates, jobs, stages, perfPeriod, perfJob, myRecruiterJobs]);

  const getJobName = (jobId: string) => jobs.find((j) => j.id === jobId)?.name ?? "—";
  const getStageName = (stageId: string) => stages.find((s) => s.id === stageId)?.name ?? "—";

  const getInterviewDateTime = (candidate: Candidate) => {
    const hash = candidate.id.charCodeAt(candidate.id.length - 1) % 5;
    const today = new Date();
    const day = addDays(today, hash);
    const hours = [9, 10, 11, 13, 14, 15, 16][hash % 7];
    const mins = [0, 15, 30, 45][hash % 4];
    return setMinutes(setHours(day, hours), mins);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-6">My Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Interviews */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-5 pb-5 px-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-primary" />
              <h2>My Interviews</h2>
              <Badge variant="secondary" className="ml-1 text-[11px] h-5 px-1.5">{myInterviews.length}</Badge>
            </div>
            {myInterviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">You have no upcoming interviews.</p>
            ) : (
              <div className="divide-y divide-border">
                {myInterviews.map((c) => {
                  const interviewDt = getInterviewDateTime(c);
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCandidate(c)}
                      className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {c.firstName[0]}{c.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{c.firstName} {c.lastName}</p>
                          <p className="text-xs text-muted-foreground">{getJobName(c.jobId)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <a href="#" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-0.5 text-[11px] text-primary hover:underline">
                              <Calendar className="h-3 w-3" /> Calendar
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{format(interviewDt, "MMM d")}</span>
                          <span className="font-medium text-foreground">{format(interviewDt, "h:mm a")}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">{getStageName(c.currentStageId)}</Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Tasks */}
        <Card>
          <CardContent className="pt-0 pb-4 px-0">
            <div className="flex items-center gap-2 px-5 pt-5 pb-3">
              <ClipboardList className="h-4 w-4 text-primary" />
              <h2>My Tasks</h2>
            </div>
            <div className="divide-y divide-border">
              {taskItems.map((task) => (
                <div
                  key={task.label}
                  onClick={() => {
                    if (task.candidates.length > 0) {
                      if (task.label === "Upcoming Interviews Today") {
                        setInterviewDialogCandidates(task.candidates);
                        setShowInterviewsDialog(true);
                      } else if (task.label === "Scorecards Due") {
                        setScorecardDialogCandidates(task.candidates);
                        setShowScorecardsDialog(true);
                      } else if (task.label === "New Applications to Review") {
                        setApplicationDialogCandidates(task.candidates);
                        setShowApplicationsDialog(true);
                      } else if (task.label === "Needs Decision") {
                        setDecisionDialogCandidates(task.candidates);
                        setShowDecisionDialog(true);
                      } else if (task.label === "Candidates to Schedule") {
                        setScheduleDialogCandidates(task.candidates);
                        setShowScheduleDialog(true);
                      } else if (task.label === "Offers") {
                        setOffersDialogCandidates(task.candidates);
                        setShowOffersDialog(true);
                      } else if (task.label === "Pending Approvals") {
                        setPendingApprovalsDialogCandidates(task.candidates);
                        setShowPendingApprovalsDialog(true);
                      } else {
                        setSelectedCandidate(task.candidates[0]);
                      }
                    }
                  }}
                  className={`flex items-center justify-between px-5 py-2.5 ${
                    task.candidates.length > 0 ? "cursor-pointer hover:bg-muted/50" : ""
                  }`}
                >
                  <span className={`text-sm ${task.candidates.length > 0 ? "text-primary font-medium" : "text-foreground"}`}>
                    {task.label}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {task.candidates.length > 0 ? task.candidates.length : "-"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* My Approvals */}
        <Card className="lg:col-span-3">
          <CardContent className="pt-5 pb-5 px-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <h2>My Approvals</h2>
              <Badge variant="secondary" className="ml-1 text-[11px] h-5 px-1.5">{myApprovals.length}</Badge>
            </div>
            {myApprovals.length === 0 ? (
              <p className="text-sm text-muted-foreground">You have no jobs or offers to approve.</p>
            ) : (
              <div className="divide-y divide-border">
                {myApprovals.map((c) => {
                  const approvalJob = jobs.find((j) => j.id === c.jobId);
                  const salaryMin = approvalJob?.salaryMin ?? 0;
                  const salaryMax = approvalJob?.salaryMax ?? 0;
                  const currency = approvalJob?.salaryCurrency ?? "USD";
                  // Mock offered salary within range
                  const offeredSalary = salaryMin + Math.round((salaryMax - salaryMin) * 0.7);
                  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency, maximumFractionDigits: 0 });

                  return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCandidate(c)}
                    className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {c.firstName[0]}{c.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{c.firstName} {c.lastName}</p>
                        <p className="text-xs text-muted-foreground">{getJobName(c.jobId)} — Offer pending approval</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Salary</p>
                        <p className="text-sm font-semibold text-foreground">{fmt(offeredSalary)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Pay Band</p>
                        <p className="text-xs font-medium text-foreground">{fmt(salaryMin)} – {fmt(salaryMax)}</p>
                      </div>
                      <Badge variant="outline" className="text-xs border-secondary text-secondary">Offer</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>


        {/* My Performance - Recruiters only */}
        {isRecruiter && performanceData && (
          <Card className="lg:col-span-3">
            <CardContent className="pt-5 pb-5 px-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4.5 w-4.5 text-primary" />
                  <h2 className="text-base font-bold text-foreground">My Performance</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={perfPeriod} onValueChange={setPerfPeriod}>
                    <SelectTrigger className="w-[150px] h-8 text-xs rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_PERIODS.map((tp) => (
                        <SelectItem key={tp.value} value={tp.value}>{tp.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={perfJob} onValueChange={setPerfJob}>
                    <SelectTrigger className="w-[180px] h-8 text-xs rounded-lg">
                      <SelectValue placeholder="All Jobs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Jobs</SelectItem>
                      {myRecruiterJobs.map((j) => (
                        <SelectItem key={j.id} value={j.id}>{j.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Metric cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="rounded-xl border border-border p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Applications</p>
                  <p className="text-2xl font-bold text-foreground">{performanceData.applications}</p>
                </div>
                <div className="rounded-xl border border-border p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Candidates Screened</p>
                  <p className="text-2xl font-bold text-foreground">{performanceData.screened}</p>
                </div>
                <div className="rounded-xl border border-border p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Offers Created</p>
                  <p className="text-2xl font-bold text-foreground">{performanceData.offersCreated}</p>
                </div>
                <div className="rounded-xl border border-border p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Offers Accepted</p>
                  <p className="text-2xl font-bold text-foreground">{performanceData.offersAccepted}</p>
                </div>
              </div>

              {/* Chart */}
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData.trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Line type="monotone" dataKey="offers" name="Offers Created" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="accepted" name="Offers Accepted" stroke="hsl(var(--secondary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedCandidate && (
        <CandidateDetailDialog
          candidate={selectedCandidate}
          open={!!selectedCandidate}
          onOpenChange={(open) => { if (!open) setSelectedCandidate(null); }}
        />
      )}

      <UpcomingInterviewsDialog
        open={showInterviewsDialog}
        onOpenChange={setShowInterviewsDialog}
        candidates={interviewDialogCandidates}
      />

      <ScorecardsDialog
        open={showScorecardsDialog}
        onOpenChange={setShowScorecardsDialog}
        candidates={scorecardDialogCandidates}
      />
      <NewApplicationsDialog
        open={showApplicationsDialog}
        onOpenChange={setShowApplicationsDialog}
        candidates={applicationDialogCandidates}
      />
      <NeedsDecisionDialog
        open={showDecisionDialog}
        onOpenChange={setShowDecisionDialog}
        candidates={decisionDialogCandidates}
      />
      <CandidatesToScheduleDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        candidates={scheduleDialogCandidates}
      />
      <OffersDialog
        open={showOffersDialog}
        onOpenChange={setShowOffersDialog}
        candidates={offersDialogCandidates}
      />
      <PendingApprovalsDialog
        open={showPendingApprovalsDialog}
        onOpenChange={setShowPendingApprovalsDialog}
        candidates={pendingApprovalsDialogCandidates}
      />
    </div>
  );
};

export default MyOverviewPage;
