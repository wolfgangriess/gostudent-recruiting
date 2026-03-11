import { useState, useMemo } from "react";
import { CreateOfferDialog } from "@/components/CreateOfferDialog";
import ScorecardPanel from "@/components/ScorecardPanel";
import ActivityFeed from "@/components/ActivityFeed";
import ResumePreviewDialog from "@/components/ResumePreviewDialog";
import CandidateLinkedInTab from "@/components/CandidateLinkedInTab";
import CandidateStagesTab from "@/components/CandidateStagesTab";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft, FileText, Mail,
  MoreHorizontal, MessageSquare, Pin,
  Briefcase, ClipboardList, Star, Activity, Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useATSStore } from "@/lib/ats-store";
import { toast } from "sonner";

const CandidateDetailPage = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const { candidates, jobs, stages, moveCandidateToStage } = useATSStore();

  const candidate = candidates.find((c) => c.id === candidateId);
  const [activeTab, setActiveTab] = useState("stages");
  const [noteText, setNoteText] = useState("");
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);

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
  const currentStageName = jobStages[currentStageIdx]?.name;

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

  const tabs = [
    { id: "stages", label: "Stages", icon: Briefcase },
    { id: "scorecards", label: "Scorecards", icon: Star },
    { id: "offer", label: "Offer", icon: ClipboardList },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  ];

  return (
    <div className="flex h-[calc(100vh-48px)] overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-3">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <Link to="/candidates" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
              {candidate.firstName[0]}{candidate.lastName[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-foreground truncate">
                  {candidate.firstName} {candidate.lastName}
                </h1>
                <span className="text-xs text-muted-foreground truncate">{job?.name ?? "No position"}</span>
                <span className="text-muted-foreground">·</span>
                {currentStageName && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium shrink-0">
                    {currentStageName}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <a href={`mailto:${candidate.email}`} className="text-primary hover:underline">{candidate.email}</a>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{candidate.phone}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setShowResumeDialog(true)}>
                <FileText className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" asChild>
                <a href={`mailto:${candidate.email}`}>
                  <Mail className="h-4 w-4" />
                </a>
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

        {/* Horizontal Tabs */}
        <div className="border-b border-border bg-card">
          <div className="max-w-4xl mx-auto px-6">
            <nav className="flex gap-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-w-4xl mx-auto">
          {activeTab === "stages" && (
            <CandidateStagesTab
              candidate={candidate}
              jobStages={jobStages}
              currentStageIdx={currentStageIdx}
              onCreateOffer={() => setShowOfferDialog(true)}
            />
          )}

          {activeTab === "scorecards" && (
            <ScorecardPanel candidateId={candidate.id} jobId={candidate.jobId} />
          )}

          {activeTab === "offer" && (
            <div className="rounded-xl border border-border bg-card p-8 text-center space-y-3">
              <ClipboardList className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">No offers have been created for this candidate</p>
              <Button size="sm" className="font-semibold" onClick={() => setShowOfferDialog(true)}>
                Create offer
              </Button>
            </div>
          )}

          {activeTab === "activity" && (
            <ActivityFeed candidate={candidate} />
          )}

          {activeTab === "linkedin" && (
            <CandidateLinkedInTab candidate={candidate} job={job} />
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
            <MessageSquare className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">No notes yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add a note to collaborate with your team.</p>
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
      {candidate && (
        <ResumePreviewDialog
          open={showResumeDialog}
          onOpenChange={setShowResumeDialog}
          candidate={candidate}
          job={job}
        />
      )}
    </div>
  );
};

export default CandidateDetailPage;
