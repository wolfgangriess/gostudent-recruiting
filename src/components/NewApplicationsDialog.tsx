import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Candidate } from "@/lib/types";
import { useJobs } from "@/hooks/useJobs";
import { format } from "date-fns";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ChevronRight, Users, Briefcase, MapPin, Clock, FileText, Linkedin, ExternalLink, Building2,
} from "lucide-react";
import { CandidateDetailDialog } from "@/components/CandidateDetailDialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: Candidate[];
}

export const NewApplicationsDialog = ({ open, onOpenChange, candidates }: Props) => {
  const { data: jobs = [] } = useJobs();
  const [selectedJobId, setSelectedJobId] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showJobDetail, setShowJobDetail] = useState<string | null>(null);

  // Unique jobs that have applicants
  const applicantJobs = useMemo(() => {
    const jobIds = [...new Set(candidates.map((c) => c.jobId))];
    return jobs.filter((j) => jobIds.includes(j.id));
  }, [candidates, jobs]);

  const filteredCandidates = useMemo(() => {
    if (selectedJobId === "all") return candidates;
    return candidates.filter((c) => c.jobId === selectedJobId);
  }, [candidates, selectedJobId]);

  const getJobName = (jobId: string) => jobs.find((j) => j.id === jobId)?.name ?? "—";
  const detailJob = showJobDetail ? jobs.find((j) => j.id === showJobDetail) : null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              New Applications to Review
              <Badge variant="secondary" className="ml-1">{filteredCandidates.length}</Badge>
            </DialogTitle>
          </DialogHeader>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filter by role:</span>
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="w-[220px] h-8 text-xs rounded-lg">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles ({candidates.length})</SelectItem>
                {applicantJobs.map((j) => {
                  const count = candidates.filter((c) => c.jobId === j.id).length;
                  return (
                    <SelectItem key={j.id} value={j.id}>
                      {j.name} ({count})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Job detail card (when a role is selected) */}
          {selectedJobId !== "all" && (() => {
            const job = jobs.find((j) => j.id === selectedJobId);
            if (!job) return null;
            return (
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">{job.name}</h3>
                  <Badge variant="outline" className="text-xs capitalize">{job.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> {job.department}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {job.location}
                  </span>
                  <span className="capitalize">{job.workplaceType}</span>
                  <span className="capitalize">{job.employmentType}</span>
                  {job.numberOfOpenings > 0 && (
                    <span>{job.numberOfOpenings} opening{job.numberOfOpenings > 1 ? "s" : ""}</span>
                  )}
                  {job.salaryMin != null && job.salaryMax != null && (
                    <span>
                      {job.salaryMin.toLocaleString("en-US", { style: "currency", currency: job.salaryCurrency ?? "USD", maximumFractionDigits: 0 })}
                      {" – "}
                      {job.salaryMax.toLocaleString("en-US", { style: "currency", currency: job.salaryCurrency ?? "USD", maximumFractionDigits: 0 })}
                    </span>
                  )}
                  {job.requisitionId && <span>Req: {job.requisitionId}</span>}
                </div>
                {job.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{job.description}</p>
                )}
              </div>
            );
          })()}

          {/* Candidates list */}
          {filteredCandidates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No new applications to review.</p>
          ) : (
            <div className="divide-y divide-border">
              {filteredCandidates.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors"
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
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                      {selectedJobId === "all" && (
                        <button
                          className="text-[11px] text-primary font-medium hover:underline mt-0.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedJobId(c.jobId);
                          }}
                        >
                          {getJobName(c.jobId)}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(c.appliedAt), "MMM d, yyyy")}
                      </p>
                      <p className="text-[11px] text-muted-foreground capitalize">{c.source}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href="#" onClick={(e) => e.stopPropagation()} className="text-primary hover:text-primary/80">
                        <FileText className="h-3.5 w-3.5" />
                      </a>
                      <a
                        href={`https://linkedin.com/in/${c.firstName.toLowerCase()}-${c.lastName.toLowerCase()}`}
                        target="_blank" rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-primary hover:text-primary/80"
                      >
                        <Linkedin className="h-3.5 w-3.5" />
                      </a>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
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
