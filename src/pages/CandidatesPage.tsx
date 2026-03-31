import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAllCandidates } from "@/hooks/useCandidates";
import { useJobs } from "@/hooks/useJobs";
import { useStages } from "@/hooks/useStages";

const CandidatesPage = () => {
  const { data: candidates = [], isLoading, error } = useAllCandidates();
  const { data: jobs = [] } = useJobs();
  const { data: stages = [] } = useStages();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterJob, setFilterJob] = useState("all");
  const [filterStage, setFilterStage] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  // BUG 3 FIX: paginated display instead of hard slice(0,50)
  const [visibleCount, setVisibleCount] = useState(50);

  const sources = useMemo(() => [...new Set(candidates.map((c) => c.source))].sort(), [candidates]);

  // Reset pagination when filters change
  useEffect(() => { setVisibleCount(50); }, [search, filterJob, filterStage, filterSource]);

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (filterJob !== "all" && c.jobId !== filterJob) return false;
      if (filterStage !== "all" && c.currentStageId !== filterStage) return false;
      if (filterSource !== "all" && c.source !== filterSource) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !c.firstName.toLowerCase().includes(q) &&
          !c.lastName.toLowerCase().includes(q) &&
          !c.email.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [candidates, search, filterJob, filterStage, filterSource]);

  const getJobName = (jobId: string) => jobs.find((j) => j.id === jobId)?.name ?? "—";
  const getStageName = (stageId: string) => stages.find((s) => s.id === stageId)?.name ?? "—";

  // Relative time in German: "vor X Tagen / Stunden / Minuten"
  const relativeTime = (isoDate: string): string => {
    const diff = Date.now() - new Date(isoDate).getTime();
    const minutes = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);
    if (days >= 1) return `vor ${days} Tag${days !== 1 ? "en" : ""}`;
    if (hours >= 1) return `vor ${hours} Std.`;
    return `vor ${Math.max(1, minutes)} Min.`;
  };

  // Highlight if candidate has been in same stage for more than 7 days
  const isStale = (updatedAt: string): boolean =>
    Date.now() - new Date(updatedAt).getTime() > 7 * 86_400_000;

  if (isLoading) return <div className="flex items-center justify-center p-8"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" /></div>
  if (error) return <div className="p-8 text-sm text-destructive">Something went wrong. Please refresh.</div>

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1>Candidates</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">{candidates.length} total candidates</p>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <Select value={filterJob} onValueChange={setFilterJob}>
          <SelectTrigger className="w-[180px] rounded-xl">
            <SelectValue placeholder="All Jobs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            {jobs.map((j) => (
              <SelectItem key={j.id} value={j.id}>{j.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStage} onValueChange={setFilterStage}>
          <SelectTrigger className="w-[160px] rounded-xl">
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {stages.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="w-[160px] rounded-xl">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {sources.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/50">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Job</TableHead>
              <TableHead className="font-semibold">Stage</TableHead>
              <TableHead className="font-semibold">Beworben</TableHead>
              <TableHead className="font-semibold">Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.slice(0, visibleCount).map((c) => {
              const stale = isStale(c.updatedAt);
              return (
              <TableRow
                key={c.id}
                className={`cursor-pointer transition-colors hover:bg-primary/[0.03] ${
                  stale ? "bg-amber-50 dark:bg-amber-900/10" : ""
                }`}
                onClick={() => navigate(`/candidates/${c.id}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {c.firstName[0]}{c.lastName[0]}
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">{c.firstName} {c.lastName}</span>
                      {stale && (
                        <p className="flex items-center gap-0.5 text-[10px] text-yellow-600 mt-0.5">
                          <Clock className="h-2.5 w-2.5" /> Lange in dieser Stage
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{c.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="rounded-lg bg-accent/30 text-accent-foreground border-0 text-xs">
                    {getJobName(c.jobId)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{getStageName(c.currentStageId)}</TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{relativeTime(c.appliedAt)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.source}</TableCell>
              </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No candidates found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {filtered.length > visibleCount && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => setVisibleCount((prev) => prev + 50)}>
            Load more ({filtered.length - visibleCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
};

export default CandidatesPage;
