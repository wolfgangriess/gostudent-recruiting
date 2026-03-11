import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Candidate } from "@/lib/types";
import { useATSStore } from "@/lib/ats-store";
import { Bell } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: Candidate[];
}

const APPROVAL_TYPES = [
  { id: "start-recruiting", label: "Approvals to start recruiting" },
  { id: "official-job", label: "Official job approval" },
  { id: "extend-offers", label: "To extend offers to candidates" },
];

export const PendingApprovalsDialog = ({ open, onOpenChange, candidates }: Props) => {
  const { jobs } = useATSStore();
  const [showOnlyMine, setShowOnlyMine] = useState(true);
  const [activeTypes, setActiveTypes] = useState<Set<string>>(
    new Set(APPROVAL_TYPES.map((t) => t.id))
  );

  const toggleType = (id: string) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getJobName = (jobId: string) => jobs.find((j) => j.id === jobId)?.name ?? "—";

  const getApprovalType = (c: Candidate) => {
    const hash = c.id.charCodeAt(c.id.length - 1);
    return APPROVAL_TYPES[hash % APPROVAL_TYPES.length];
  };

  const filteredCandidates = candidates.filter((c) => {
    const type = getApprovalType(c);
    return activeTypes.has(type.id);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Approvals</DialogTitle>
        </DialogHeader>

        {/* Subheader */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-primary">
            Pending Approvals ({filteredCandidates.length})
          </p>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <Checkbox
              checked={showOnlyMine}
              onCheckedChange={(v) => setShowOnlyMine(!!v)}
              className="h-3.5 w-3.5"
            />
            <span className="text-xs text-primary font-medium">Show only my due approvals</span>
          </label>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-4 bg-muted/50 rounded-lg px-4 py-2.5">
          {APPROVAL_TYPES.map((type) => (
            <label key={type.id} className="flex items-center gap-1.5 cursor-pointer">
              <Checkbox
                checked={activeTypes.has(type.id)}
                onCheckedChange={() => toggleType(type.id)}
                className="h-3.5 w-3.5"
              />
              <span className="text-xs text-foreground">{type.label}</span>
            </label>
          ))}
        </div>

        {/* Results */}
        {filteredCandidates.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No pending approvals.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredCandidates.map((c) => {
              const approvalType = getApprovalType(c);
              return (
                <div key={c.id} className="py-3 grid grid-cols-[200px_1fr] items-start gap-2">
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      {c.firstName} {c.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {getJobName(c.jobId)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {approvalType.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
