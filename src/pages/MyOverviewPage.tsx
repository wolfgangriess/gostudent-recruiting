import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, ClipboardList, ChevronRight, Star, TrendingUp, ArrowUp } from "lucide-react";
import { useATSStore } from "@/lib/ats-store";
import { Candidate } from "@/lib/types";
import { CandidateDetailDialog } from "@/components/CandidateDetailDialog";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const CURRENT_USER_ID = "user-1";

const MyOverviewPage = () => {
  const { candidates, jobs, stages, users } = useATSStore();
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

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

  const taskCounts = useMemo(() => {
    const myJobIds = jobs.filter((j) => j.hiringManager === CURRENT_USER_ID || j.recruiters.includes(CURRENT_USER_ID)).map((j) => j.id);
    const myCandidates = candidates.filter((c) => myJobIds.includes(c.jobId));

    const needsDecision = myCandidates.filter((c) => {
      const stage = stages.find((s) => s.id === c.currentStageId);
      return stage?.name === "Interview";
    }).length;

    const toSchedule = myCandidates.filter((c) => {
      const stage = stages.find((s) => s.id === c.currentStageId);
      return stage?.name === "Phone Screen";
    }).length;

    const offers = myCandidates.filter((c) => {
      const stage = stages.find((s) => s.id === c.currentStageId);
      return stage?.name === "Offer";
    }).length;

    return [
      { label: "Needs Decision", count: needsDecision },
      { label: "Candidates to Schedule", count: toSchedule },
      { label: "Offers", count: offers },
      { label: "Forms To Send", count: 0 },
      { label: "Take Home Tests to Send", count: 0 },
    ];
  }, [candidates, jobs, stages]);

  // Performance data (recruiter only)
  const performanceData = useMemo(() => {
    if (!isRecruiter) return null;
    const myJobIds = jobs.filter((j) => j.recruiters.includes(CURRENT_USER_ID)).map((j) => j.id);
    const myCandidates = candidates.filter((c) => myJobIds.includes(c.jobId));

    const screened = myCandidates.filter((c) => {
      const stage = stages.find((s) => s.id === c.currentStageId);
      return stage && stage.name !== "Applied";
    }).length;

    const offerStageIds = stages.filter((s) => s.name === "Offer" || s.name === "Hired").map((s) => s.id);
    const offersCreated = myCandidates.filter((c) => offerStageIds.includes(c.currentStageId)).length;

    const hiredStageIds = stages.filter((s) => s.name === "Hired").map((s) => s.id);
    const offersAccepted = myCandidates.filter((c) => hiredStageIds.includes(c.currentStageId)).length;

    // Generate weekly trend data
    const weeks: { week: string; offers: number; accepted: number }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
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

    return { screened, offersCreated, offersAccepted, trendData: weeks };
  }, [isRecruiter, candidates, jobs, stages]);

  const getJobName = (jobId: string) => jobs.find((j) => j.id === jobId)?.name ?? "—";
  const getStageName = (stageId: string) => stages.find((s) => s.id === stageId)?.name ?? "—";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-6">My Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Interviews */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-5 pb-5 px-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-4.5 w-4.5 text-primary" />
              <h2 className="text-base font-bold text-foreground">My Interviews</h2>
              <Badge variant="secondary" className="ml-1 text-xs">{myInterviews.length}</Badge>
            </div>
            {myInterviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">You have no upcoming interviews.</p>
            ) : (
              <div className="divide-y divide-border">
                {myInterviews.map((c) => (
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
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">{getStageName(c.currentStageId)}</Badge>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < c.rating ? "fill-secondary text-secondary" : "text-muted-foreground/20"}`} />
                        ))}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Tasks */}
        <Card>
          <CardContent className="pt-0 pb-4 px-0">
            <div className="flex items-center gap-2 px-5 pt-5 pb-3">
              <ClipboardList className="h-4.5 w-4.5 text-primary" />
              <h2 className="text-base font-bold text-foreground">My Tasks</h2>
            </div>
            <div className="divide-y divide-border">
              {taskCounts.map((task) => (
                <div key={task.label} className="flex items-center justify-between px-5 py-2.5">
                  <span className="text-sm text-foreground">{task.label}</span>
                  <Badge variant={task.count > 0 ? "default" : "secondary"} className="text-xs min-w-[24px] justify-center">
                    {task.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* My Approvals */}
        <Card className="lg:col-span-3">
          <CardContent className="pt-5 pb-5 px-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-4.5 w-4.5 text-primary" />
              <h2 className="text-base font-bold text-foreground">My Approvals</h2>
              <Badge variant="secondary" className="ml-1 text-xs">{myApprovals.length}</Badge>
            </div>
            {myApprovals.length === 0 ? (
              <p className="text-sm text-muted-foreground">You have no jobs or offers to approve.</p>
            ) : (
              <div className="divide-y divide-border">
                {myApprovals.map((c) => (
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
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-secondary text-secondary">Offer</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>


        {/* My Performance - Recruiters only */}
        {isRecruiter && performanceData && (
          <Card className="lg:col-span-3">
            <CardContent className="pt-5 pb-5 px-5">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="h-4.5 w-4.5 text-primary" />
                <h2 className="text-base font-bold text-foreground">My Performance</h2>
              </div>

              {/* Metric cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
    </div>
  );
};

export default MyOverviewPage;
