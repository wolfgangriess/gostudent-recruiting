import { useMemo, useState } from "react";
import { Search, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useATSStore } from "@/lib/ats-store";
import { Candidate } from "@/lib/types";
import { CandidateDetailDialog } from "@/components/CandidateDetailDialog";

const CandidatesPage = () => {
  const { candidates, jobs, stages, users, getScorecardTemplate, evaluations, addEvaluation, getEvaluationsForCandidate } = useATSStore();
  const [search, setSearch] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [filterJob, setFilterJob] = useState("all");
  const [filterStage, setFilterStage] = useState("all");
  const [filterSource, setFilterSource] = useState("all");

  const sources = useMemo(() => [...new Set(candidates.map((c) => c.source))].sort(), [candidates]);

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Candidates</h1>
        <p className="mt-1 text-sm text-muted-foreground">{candidates.length} total candidates</p>
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
              <TableHead className="font-semibold">Source</TableHead>
              <TableHead className="font-semibold text-center">Rating</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.slice(0, 50).map((c) => (
              <TableRow
                key={c.id}
                className="cursor-pointer transition-colors hover:bg-primary/[0.03]"
                onClick={() => setSelectedCandidate(c)}
              >
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {c.firstName[0]}{c.lastName[0]}
                    </div>
                    <span className="font-semibold text-foreground">{c.firstName} {c.lastName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{c.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="rounded-lg bg-accent/30 text-accent-foreground border-0 text-xs">
                    {getJobName(c.jobId)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{getStageName(c.currentStageId)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.source}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < c.rating ? "fill-secondary text-secondary" : "text-muted-foreground/20"}`}
                      />
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
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


export default CandidatesPage;
