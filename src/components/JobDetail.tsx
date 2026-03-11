import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, Users, TrendingUp, BarChart3, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditJobDialog from "@/components/EditJobDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { } from "recharts";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useATSStore } from "@/lib/ats-store";
import { getApplicationTrendData } from "@/lib/mock-data";
import PipelineBoard from "@/components/PipelineBoard";
import InterviewPlan from "@/components/InterviewPlan";
import { UserAvatar } from "@/components/UserPicker";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const JobDetail = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { jobs, candidates, stages, users } = useATSStore();
  const [editOpen, setEditOpen] = useState(false);
  const job = jobs.find((j) => j.id === jobId);

  const trendData = useMemo(
    () => (jobId ? getApplicationTrendData(jobId, candidates) : []),
    [jobId, candidates]
  );

  const jobCandidates = useMemo(
    () => candidates.filter((c) => c.jobId === jobId),
    [candidates, jobId]
  );

  const totalApps = jobCandidates.length;
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const newThisWeek = jobCandidates.filter((c) => new Date(c.appliedAt) >= weekAgo).length;
  const weeksCount = trendData.length || 1;
  const avgPerWeek = Math.round(totalApps / weeksCount);

  if (!job) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center">
        <p className="text-muted-foreground">Job not found.</p>
        <Link to="/" className="text-primary hover:underline text-sm mt-2 inline-block">Back to Jobs</Link>
      </div>
    );
  }

  const jobStages = stages.filter((s) => s.jobId === jobId).sort((a, b) => a.order - b.order);
  const hiringTeam = users.filter((u) => job.hiringTeamIds.includes(u.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors font-medium">Jobs</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-semibold">{job.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{job.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge className="rounded-lg bg-accent/30 text-accent-foreground border-0 font-medium">{job.department}</Badge>
              <span className="text-sm text-muted-foreground">{job.location}</span>
              <span className="text-sm text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground capitalize">{job.workplaceType}</span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="ml-2 gap-1.5" onClick={() => setEditOpen(true)}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
        </div>

        {/* Hiring Team Avatars */}
        {hiringTeam.length > 0 && (
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Hiring Team</span>
            <div className="flex -space-x-2">
              {hiringTeam.slice(0, 5).map((u) => (
                <UITooltip key={u.id}>
                  <TooltipTrigger asChild>
                    <div className="ring-2 ring-card rounded-full">
                      <UserAvatar user={u} size="md" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{u.firstName} {u.lastName}</p>
                  </TooltipContent>
                </UITooltip>
              ))}
              {hiringTeam.length > 5 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground ring-2 ring-card">
                  +{hiringTeam.length - 5}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Applications", value: totalApps, icon: Users, highlight: false },
          { label: "New This Week", value: newThisWeek, icon: TrendingUp, highlight: true },
          { label: "Avg per Week", value: avgPerWeek, icon: BarChart3, highlight: false },
        ].map((metric) => (
          <Card key={metric.label} className="rounded-2xl shadow-sm border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">{metric.label}</CardTitle>
              <metric.icon className={`h-5 w-5 ${metric.highlight ? "text-primary" : "text-muted-foreground/50"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-extrabold ${metric.highlight ? "text-primary" : "text-foreground"}`}>
                {metric.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trend Chart */}
      <Card className="mb-8 rounded-2xl shadow-sm border-border">
        <CardHeader>
          <CardTitle className="text-base font-bold">Application Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 12, fontFamily: 'Plus Jakarta Sans' }} stroke="hsl(var(--muted-foreground))" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fontFamily: 'Plus Jakarta Sans' }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontFamily: "Plus Jakarta Sans",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={{ fill: "hsl(var(--primary))", r: 3.5 }}
                  activeDot={{ r: 6, fill: "hsl(var(--secondary))", stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline */}
      <div className="mt-6">
        <PipelineBoard stages={jobStages} jobId={job.id} />
      </div>
      {job && <EditJobDialog open={editOpen} onOpenChange={setEditOpen} job={job} />}
    </div>
  );
};

export default JobDetail;
