import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, FileText, Mail, Plus, RefreshCw,
  MoreHorizontal, Linkedin, MessageSquare, Pin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useATSStore } from "@/lib/ats-store";
import { toast } from "sonner";

const CandidateDetailPage = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const { candidates, jobs, stages, users, moveCandidateToStage, getScorecardTemplate, getEvaluationsForCandidate } = useATSStore();

  const candidate = candidates.find((c) => c.id === candidateId);
  const [activeTab, setActiveTab] = useState("stages");
  const [noteText, setNoteText] = useState("");
  const [openStageId, setOpenStageId] = useState<string | null>(null);

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
  const currentStage = stages.find((s) => s.id === candidate.currentStageId);
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

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-48 shrink-0 border-r border-border bg-card p-4">
        <nav className="space-y-0.5">
          {sidebarTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
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
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link to="/candidates" className="text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="h-4 w-4" />
                </Link>
                <h1 className="text-xl font-bold tracking-tight text-foreground uppercase">
                  {candidate.firstName} {candidate.lastName}
                </h1>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <a href={`mailto:${candidate.email}`} className="text-primary hover:underline">{candidate.email}</a>
                <span className="text-muted-foreground">·</span>
                <span className="text-primary">{candidate.phone}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
                className="border-destructive/40 text-destructive hover:bg-destructive/10 font-semibold"
                onClick={handleReject}
              >
                Reject
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold"
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

        {/* Stages Content */}
        <div className="p-6 max-w-3xl">
          {activeTab === "stages" && (
            <div className="space-y-0">
              {jobStages.map((stage, idx) => {
                const isCurrent = stage.id === candidate.currentStageId;
                const isPast = idx < currentStageIdx;
                const isOpen = openStageId === stage.id;

                return (
                  <Collapsible
                    key={stage.id}
                    open={isOpen}
                    onOpenChange={(open) => setOpenStageId(open ? stage.id : null)}
                  >
                    <CollapsibleTrigger className="flex w-full items-center gap-3 border-b border-border px-2 py-3 text-left hover:bg-muted/30 transition-colors">
                      <ChevronRight className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                      <span className="text-sm font-semibold text-foreground">
                        {idx + 1}. {stage.name}
                      </span>
                      {isCurrent && (
                        <>
                          <Badge className="bg-green-600 text-white border-0 text-[10px] px-2 py-0.5 font-semibold">
                            Current stage
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            since {new Date(candidate.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {timeSinceApplied()}
                          </span>
                        </>
                      )}
                      {stage.ownerId && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          ⚡
                        </span>
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-9 py-4 border-b border-border bg-muted/20">
                      <div className="text-sm text-muted-foreground space-y-2">
                        {isCurrent && (
                          <p>Candidate is currently in this stage.</p>
                        )}
                        {isPast && (
                          <p className="text-green-600 font-medium">✓ Completed</p>
                        )}
                        {!isCurrent && !isPast && (
                          <p>Pending — candidate has not reached this stage yet.</p>
                        )}
                        {stage.ownerId && (
                          <p className="text-xs">
                            Stage owner: {users.find((u) => u.id === stage.ownerId)?.firstName} {users.find((u) => u.id === stage.ownerId)?.lastName}
                          </p>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          )}

          {activeTab === "scorecards" && (
            <div className="text-sm text-muted-foreground py-8 text-center">
              Scorecards for each stage will appear here.
            </div>
          )}

          {activeTab === "offer" && (
            <div className="text-sm text-muted-foreground py-8 text-center">
              Offer details will appear here once an offer is created.
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
      <div className="w-80 shrink-0 border-l border-border bg-card flex flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Notes</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
              <Pin className="h-3.5 w-3.5" />
            </Button>
          </div>
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
              <SelectTrigger className="w-24 h-7 text-xs">
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
    </div>
  );
};

export default CandidateDetailPage;
