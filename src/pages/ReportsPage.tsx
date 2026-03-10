import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, ArrowDown, ArrowUp } from "lucide-react";
import { useATSStore } from "@/lib/ats-store";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from "recharts";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const FILTERS = [
  "All offices",
  "All departments",
  "Last 90 days",
  "All primary recruiters",
  "All hiring managers",
  "Job custom fields",
];

// Generate mock time-series data
function generateTimeData(months: number, baseValue: number, variance: number) {
  const data = [];
  const now = new Date();
  for (let i = months; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7);
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: Math.max(0, Math.round(baseValue + (Math.random() - 0.4) * variance)),
    });
  }
  return data;
}

const DECLINE_REASONS = [
  { reason: "Accepted another offer", count: 10 },
  { reason: "Compensation Package", count: 5 },
  { reason: "Role & Responsibilities", count: 4 },
  { reason: "Other", count: 2 },
  { reason: "Wasn't interested", count: 2 },
  { reason: "Working hours/days", count: 2 },
];

const MetricCard = ({
  title,
  value,
  change,
  positive,
}: {
  title: string;
  value: string;
  change: string;
  positive: boolean;
}) => (
  <Card>
    <CardContent className="pt-5 pb-5 px-5">
      <div className="flex items-center gap-1.5 mb-4">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <UITooltip>
          <TooltipTrigger>
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>{title} over the selected period</TooltipContent>
        </UITooltip>
      </div>
      <div className="text-center">
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <div className={`flex items-center justify-center gap-1 mt-1 text-sm font-medium ${positive ? "text-primary" : "text-destructive"}`}>
          {positive ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
          {change}
        </div>
      </div>
    </CardContent>
  </Card>
);

const ReportsPage = () => {
  const { candidates, jobs, stages } = useATSStore();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const offersCreatedData = useMemo(() => generateTimeData(12, 5, 8), []);
  const offersAcceptedData = useMemo(() => generateTimeData(12, 4, 6), []);

  const toggleFilter = (f: string) => {
    setActiveFilters((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  // Compute some metrics from store data
  const totalOffers = candidates.filter((c) => {
    const stage = stages.find((s) => s.id === c.currentStageId);
    return stage?.name === "Offer" || stage?.name === "Hired";
  }).length;

  const hiredCount = candidates.filter((c) => {
    const stage = stages.find((s) => s.id === c.currentStageId);
    return stage?.name === "Hired";
  }).length;

  const acceptanceRate = totalOffers > 0 ? Math.round((hiredCount / totalOffers) * 100) : 0;

  const now = new Date();
  const avgTimeToFill = useMemo(() => {
    const hired = candidates.filter((c) => {
      const stage = stages.find((s) => s.id === c.currentStageId);
      return stage?.name === "Hired";
    });
    if (hired.length === 0) return 38;
    const totalDays = hired.reduce((sum, c) => {
      const applied = new Date(c.appliedAt);
      return sum + Math.round((now.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);
    return Math.round(totalDays / hired.length);
  }, [candidates, stages]);

  const dateRange = `Dec 10, 2025 - Mar 10, 2026`;
  const compareRange = `Sep 11 - Dec 9, 2025`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Offers and hiring</h1>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => toggleFilter(f)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeFilters.includes(f)
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {dateRange} <span className="text-muted-foreground/60">compared to</span> {compareRange}
      </p>

      {/* Top metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Offer acceptance rate" value={`${acceptanceRate}%`} change="20%" positive={false} />
        <MetricCard title="Average time to fill" value={`${avgTimeToFill} days`} change="3%" positive={true} />
        <MetricCard title="Average time to hire" value="29 days" change="53%" positive={true} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Offers created over time */}
        <Card>
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-foreground">Offers created over time</span>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-foreground">{totalOffers || 64}</span>
              <span className="text-sm font-medium text-primary flex items-center gap-0.5">
                <ArrowUp className="h-3.5 w-3.5" /> 113%
              </span>
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={offersCreatedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Offers accepted */}
        <Card>
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-foreground">Offers accepted</span>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-foreground">{hiredCount || 41}</span>
              <span className="text-sm font-medium text-primary flex items-center gap-0.5">
                <ArrowUp className="h-3.5 w-3.5" /> 71%
              </span>
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={offersAcceptedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top offer decline reasons */}
      <Card>
        <CardContent className="pt-5 pb-5 px-5">
          <div className="flex items-center gap-1.5 mb-5">
            <span className="text-sm font-medium text-foreground">Top offer decline reasons</span>
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DECLINE_REASONS} layout="vertical" margin={{ left: 120, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="reason"
                  type="category"
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                  tickLine={false}
                  axisLine={false}
                  width={110}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
