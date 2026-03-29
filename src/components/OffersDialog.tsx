import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Candidate } from "@/lib/types";
import { useJobs } from "@/hooks/useJobs";
import { Gift } from "lucide-react";
import { CreateOfferDialog } from "@/components/CreateOfferDialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: Candidate[];
}

const OFFER_STATUSES = [
  "Offer to be created",
  "Offer to be sent",
];

export const OffersDialog = ({ open, onOpenChange, candidates }: Props) => {
  const { data: jobs = [] } = useJobs();
  const [offerCandidate, setOfferCandidate] = useState<Candidate | null>(null);

  const getJobName = (jobId: string) => jobs.find((j) => j.id === jobId)?.name ?? "—";

  const getOfferStatus = (c: Candidate) => {
    const hash = c.id.charCodeAt(c.id.length - 1);
    return OFFER_STATUSES[hash % OFFER_STATUSES.length];
  };

  const getMockTitle = (c: Candidate) => {
    const titles = [
      "Senior Consultant at Deloitte",
      "Account Manager at Gartner",
      "Center Director at Learning Centre",
      "",
    ];
    const hash = c.id.charCodeAt(c.id.length - 1);
    return titles[hash % titles.length];
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Offers
              <Badge variant="secondary" className="ml-1">{candidates.length}</Badge>
            </DialogTitle>
          </DialogHeader>

          {/* Table header */}
          <div className="grid grid-cols-[200px_1fr] text-xs text-muted-foreground border-b border-border pb-2">
            <span>Name</span>
            <span>Job / Status</span>
          </div>

          {candidates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No offers in progress.</p>
          ) : (
            <div className="divide-y divide-border">
              {candidates.map((c) => {
                const offerStatus = getOfferStatus(c);
                const mockTitle = getMockTitle(c);

                return (
                  <div key={c.id} className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-6">
                        <div className="min-w-[160px]">
                          <p className="text-sm font-semibold text-primary">
                            {c.firstName} {c.lastName}
                          </p>
                          {mockTitle && (
                            <p className="text-xs text-muted-foreground mt-0.5">{mockTitle}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {getJobName(c.jobId)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            ↓ Offer · <span className="text-secondary">{offerStatus}</span>
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-primary text-primary hover:bg-primary hover:text-primary-foreground shrink-0"
                        onClick={() => setOfferCandidate(c)}
                      >
                        Create Offer
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {offerCandidate && (
        <CreateOfferDialog
          open={!!offerCandidate}
          onOpenChange={(o) => { if (!o) setOfferCandidate(null); }}
          candidate={offerCandidate}
        />
      )}
    </>
  );
};
