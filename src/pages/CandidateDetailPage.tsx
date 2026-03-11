import { useState } from "react";
import { CreateOfferDialog } from "@/components/CreateOfferDialog";
import ScorecardPanel from "@/components/ScorecardPanel";
import ActivityFeed from "@/components/ActivityFeed";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronDown, FileText, Mail, Plus, RefreshCw,
  MoreHorizontal, Linkedin, MessageSquare, Pin, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useATSStore } from "@/lib/ats-store";
import { toast } from "sonner";

/* Mock interview configs per stage name for demo purposes */
const stageInterviewConfig: Record<string, { type: string; duration: string }[]> = {
  "Phone Screen": [{ type: "HR Call", duration: "30 minutes" }],
  "Interview": [{ type: "Team Lead's Call", duration: "45 minutes" }],
  "1st Interview": [{ type: "HR Call", duration: "30 minutes" }],
  "2nd Interview": [{ type: "Team Lead's Call", duration: "45 minutes" }],
  "3rd Interview": [{ type: "HM Interview", duration: "60 minutes" }],
};

const CandidateDetailPage = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const { candidates, jobs, stages, users, moveCandidateToStage } = useATSStore();

  const candidate = candidates.find((c) => c.id === candidateId);
  const [activeTab, setActiveTab] = useState("stages");
  const [noteText, setNoteText] = useState("");
  const [closedStages, setClosedStages] = useState<Set<string>>(new Set());
  const [showOfferDialog, setShowOfferDialog] = useState(false);

  if (!candidate) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center">
        <p className="text-muted-foreground">Candidate not found.</p>
        <Link to="/candidates" className="text-primary hover:underline text-sm mt-2 inline-block">Back to Candidates</Link>
      </div>
    );
  }

  const job = jobs.find((j) => j.id === candidate.jobId);
  const jobStages = stages.filter((s) => s.jobId === candidate.jobId).sort((a, b) => a.order - b.order);
  const currentStageIdx = jobStages.findIndex((s) => s.id === candidate.currentStageId);

  const timeSinceApplied = () => {
    const diff = Date.now() - new Date(candidate.appliedAt).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "less than a day";
    if (days === 1) return "1 day";
    return `${days} days`;
  };

  const sidebarTabs = [
    { id: "stages", label: "Stages" },
    { id: "scorecards", label: "Scorecards" },
    { id: "offer", label: "Offer details" },
    { id: "activity", label: "Activity feed" },
    { id: "linkedin", label: "LinkedIn" },
  ];

  const toggleStage = (stageId: string) => {
    setClosedStages((prev) => {
      const next = new Set(prev);
      if (next.has(stageId)) next.delete(stageId);
      else next.add(stageId);
      return next;
    });
  };

  const handleMoveStage = () => {
    const nextStage = jobStages[currentStageIdx + 1];
    if (nextStage) {
      moveCandidateToStage(candidate.id, nextStage.id);
      toast.success(`${candidate.firstName} advanced to ${nextStage.name}`);
    } else {
      toast.info("Candidate is already at the final stage");
    }
  };

  const handleReject = () => {
    const appliedStage = jobStages[0];
    if (appliedStage) {
      moveCandidateToStage(candidate.id, appliedStage.id);
      toast.success(`${candidate.firstName} has been rejected`);
      navigate("/candidates");
    }
  };

  const isLastStage = (idx: number) => idx === jobStages.length - 1;

  return (
    <div className="flex h-[calc(100vh-48px)] overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-44 shrink-0 border-r border-border bg-card p-4">
        <nav className="space-y-0.5">
          {sidebarTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Center Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Link to="/candidates" className="text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="h-4 w-4" />
                </Link>
                <h1 className="text-lg font-bold tracking-tight text-foreground uppercase">
                  {candidate.firstName} {candidate.lastName}
                </h1>
              </div>
              <div className="flex items-center gap-2 text-xs pl-6">
                <a href={`mailto:${candidate.email}`} className="text-primary hover:underline">{candidate.email}</a>
                <span className="text-muted-foreground">·</span>
                <span className="text-primary">{candidate.phone}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <FileText className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <Mail className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/40 text-destructive hover:bg-destructive/10 font-semibold text-xs h-8"
                onClick={handleReject}
              >
                Reject
              </Button>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8"
                onClick={handleMoveStage}
              >
                Move stage
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 max-w-3xl mx-auto">
          {activeTab === "stages" && (
            <div>
              {jobStages.map((stage, idx) => {
                const isCurrent = stage.id === candidate.currentStageId;
                const isPast = idx < currentStageIdx;
                const isOpen = !closedStages.has(stage.id);
                const isOffer = isLastStage(idx);
                const interviews = stageInterviewConfig[stage.name];
                const isReviewStage = idx === 0;

                return (
                  <Collapsible
                    key={stage.id}
                    open={isOpen}
                    onOpenChange={() => toggleStage(stage.id)}
                  >
                    <CollapsibleTrigger className="flex w-full items-center gap-2.5 border-b border-border px-1 py-3 text-left hover:bg-muted/20 transition-colors">
                      <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${!isOpen ? "-rotate-90" : ""}`} />
                      <span className="text-sm font-semibold text-foreground">
                        {idx + 1}. {stage.name}
                      </span>
                      {stage.ownerId && (
                        <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      {isCurrent && (
                        <>
                          <Badge className="bg-primary text-primary-foreground border-0 text-[10px] px-2 py-0.5 font-semibold">
                            Current stage
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">
                            since {new Date(candidate.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {timeSinceApplied()}
                          </span>
                        </>
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="border-b border-border">
                      <div className="px-8 py-4 space-y-4">
                        {/* Application Review / first stage */}
                        {isReviewStage && (
                          <>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-semibold text-foreground">Reviewers</span>
                                <button className="text-muted-foreground hover:text-foreground">
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <a href="#" className="text-xs text-primary hover:underline font-medium">Go to interview kit</a>
                            </div>
                            <p className="text-xs text-muted-foreground">No feedback submitted</p>
                          </>
                        )}

                        {/* Interview stages */}
                        {interviews && !isOffer && (
                          <>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-foreground">Interviews</span>
                              <button className="text-muted-foreground hover:text-foreground">
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {isPast ? "Completed" : "Unscheduled"}
                            </p>
                            {interviews.map((iv, i) => (
                              <div key={i} className="flex items-center justify-between py-1.5 border-t border-border">
                                <a href="#" className="text-xs text-primary hover:underline font-medium">
                                  {iv.type} - {iv.duration}
                                </a>
                                <div className="flex items-center gap-3">
                                  <a href="#" className="text-[11px] text-primary hover:underline">Schedule manually</a>
                                  <a href="#" className="text-[11px] text-primary hover:underline">Automated scheduling</a>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </>
                        )}

                        {/* Non-interview, non-review, non-offer stages */}
                        {!isReviewStage && !interviews && !isOffer && (
                          <>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-semibold text-foreground">Reviewers</span>
                                <button className="text-muted-foreground hover:text-foreground">
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <a href="#" className="text-xs text-primary hover:underline font-medium">Go to interview kit</a>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {isPast ? "Completed" : "No feedback submitted"}
                            </p>
                          </>
                        )}

                        {/* Offer stage */}
                        {isOffer && (
                          <div className="text-center py-6 space-y-3">
                            <p className="text-sm text-muted-foreground">No offers have been created for this job</p>
                            <Button size="sm" className="font-semibold" onClick={() => setShowOfferDialog(true)}>
                              Create offer
                            </Button>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          )}

          {activeTab === "scorecards" && (
            <ScorecardPanel candidateId={candidate.id} jobId={candidate.jobId} />
          )}

          {activeTab === "offer" && (
            <div className="space-y-6">
              <div className="text-center py-6 space-y-3">
                <p className="text-sm text-muted-foreground">No offers have been created for this candidate</p>
                <Button size="sm" className="font-semibold" onClick={() => setShowOfferDialog(true)}>
                  Create offer
                </Button>
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="text-sm text-muted-foreground py-8 text-center">
              Activity feed — coming soon.
            </div>
          )}

          {activeTab === "linkedin" && (
            <div className="text-sm text-muted-foreground py-8 text-center">
              <a
                href={`https://linkedin.com/in/${candidate.firstName.toLowerCase()}-${candidate.lastName.toLowerCase()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1.5"
              >
                <Linkedin className="h-4 w-4" />
                View LinkedIn Profile
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar — Notes */}
      <div className="w-72 shrink-0 border-l border-border bg-card flex flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Notes</span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
            <Pin className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-sm font-semibold text-primary">There aren't any notes yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add a note to start collaborating with your team.</p>
          </div>
        </div>

        <div className="border-t border-border p-3 space-y-2">
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Tip: @mention someone"
            rows={3}
            className="text-sm resize-none"
          />
          <div className="flex items-center justify-between">
            <Select defaultValue="public">
              <SelectTrigger className="w-20 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              className="h-7 text-xs"
              disabled={!noteText.trim()}
              onClick={() => {
                toast.success("Note added");
                setNoteText("");
              }}
            >
              Send
            </Button>
          </div>
        </div>
      </div>

      {candidate && (
        <CreateOfferDialog
          open={showOfferDialog}
          onOpenChange={setShowOfferDialog}
          candidate={candidate}
        />
      )}
    </div>
  );
};

export default CandidateDetailPage;
