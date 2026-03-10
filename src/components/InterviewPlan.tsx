import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, Pencil, Check, X, ClipboardList } from "lucide-react";
import { useATSStore } from "@/lib/ats-store";
import { PipelineStage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/UserPicker";
import ScorecardBuilder from "@/components/ScorecardBuilder";

interface Props {
  jobId: string;
}

const SortableStageRow = ({
  stage,
  onRemove,
  onRename,
  candidateCount,
  onSetOwner,
  ownerUser,
  eligibleUsers,
  scorecardCount,
  onOpenScorecard,
}: {
  stage: PipelineStage;
  onRemove: () => void;
  onRename: (name: string) => void;
  candidateCount: number;
  onSetOwner: (ownerId: string | undefined) => void;
  ownerUser: any;
  eligibleUsers: any[];
  scorecardCount: number;
  onOpenScorecard: () => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(stage.name);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: stage.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const handleSave = () => {
    if (editName.trim()) {
      onRename(editName.trim());
      setEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-xl border bg-card p-4 transition-shadow ${
        isDragging ? "opacity-50 shadow-lg" : "shadow-sm"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex flex-1 items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
          {stage.order + 1}
        </span>

        {editing ? (
          <div className="flex items-center gap-2">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="h-8 w-40"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") setEditing(false);
              }}
            />
            <button onClick={handleSave} className="text-primary hover:text-primary/80">
              <Check className="h-4 w-4" />
            </button>
            <button onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <span className="text-sm font-semibold text-foreground">{stage.name}</span>
        )}
      </div>

      {/* Owner */}
      <Select
        value={stage.ownerId || "none"}
        onValueChange={(v) => onSetOwner(v === "none" ? undefined : v)}
      >
        <SelectTrigger className="h-8 w-36 text-xs">
          <SelectValue placeholder="Owner" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none" className="text-xs">No Owner</SelectItem>
          {eligibleUsers.map((u: any) => (
            <SelectItem key={u.id} value={u.id} className="text-xs">
              <span className="flex items-center gap-1.5">
                <UserAvatar user={u} size="sm" />
                {u.firstName} {u.lastName}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Scorecard button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={`h-8 gap-1 text-xs ${scorecardCount > 0 ? "text-primary" : "text-muted-foreground"}`}
        onClick={onOpenScorecard}
      >
        <ClipboardList className="h-3.5 w-3.5" />
        {scorecardCount > 0 ? `${scorecardCount}` : "Scorecard"}
      </Button>

      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
        {candidateCount}
      </span>

      {!editing && (
        <button
          onClick={() => { setEditName(stage.name); setEditing(true); }}
          className="text-muted-foreground/50 hover:text-foreground"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}

      <button
        onClick={onRemove}
        className="text-muted-foreground/50 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

const InterviewPlan = ({ jobId }: Props) => {
  const { stages, candidates, users, addStage, removeStage, renameStage, reorderStages, setStageOwner, getScorecardTemplate } =
    useATSStore();
  const [newStageName, setNewStageName] = useState("");
  const [activeStage, setActiveStage] = useState<PipelineStage | null>(null);
  const [scorecardStageId, setScorecardStageId] = useState<string | null>(null);
  const [scorecardStageName, setScorecardStageName] = useState("");

  const jobStages = stages.filter((s) => s.jobId === jobId).sort((a, b) => a.order - b.order);

  const job = useATSStore((s) => s.jobs.find((j) => j.id === jobId));
  const eligibleUsers = users.filter(
    (u) => u.role === "admin" || u.role === "hiring_manager" || (job?.hiringTeamIds.includes(u.id))
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragStart = (event: DragStartEvent) => {
    const stage = jobStages.find((s) => s.id === event.active.id);
    if (stage) setActiveStage(stage);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveStage(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = jobStages.findIndex((s) => s.id === active.id);
    const newIndex = jobStages.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(jobStages, oldIndex, newIndex);
    reorderStages(jobId, reordered.map((s) => s.id));
  };

  const handleAddStage = () => {
    if (!newStageName.trim()) return;
    addStage(jobId, newStageName.trim());
    setNewStageName("");
  };

  const getCandidateCount = (stageId: string) =>
    candidates.filter((c) => c.jobId === jobId && c.currentStageId === stageId).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Interview Plan</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure stages, assign owners, and set up scorecards. Drag to reorder.
          </p>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext items={jobStages.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {jobStages.map((stage) => (
              <SortableStageRow
                key={stage.id}
                stage={stage}
                candidateCount={getCandidateCount(stage.id)}
                onRemove={() => removeStage(stage.id)}
                onRename={(name) => renameStage(stage.id, name)}
                onSetOwner={(ownerId) => setStageOwner(stage.id, ownerId)}
                ownerUser={stage.ownerId ? users.find((u) => u.id === stage.ownerId) : null}
                eligibleUsers={eligibleUsers}
                scorecardCount={getScorecardTemplate(stage.id)?.criteria.length ?? 0}
                onOpenScorecard={() => {
                  setScorecardStageId(stage.id);
                  setScorecardStageName(stage.name);
                }}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeStage ? (
            <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-card p-4 shadow-xl">
              <GripVertical className="h-5 w-5 text-muted-foreground/50" />
              <span className="text-sm font-semibold text-foreground">{activeStage.name}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Card className="mt-4 flex items-center gap-3 rounded-xl border-dashed p-4">
        <Plus className="h-5 w-5 text-muted-foreground/50" />
        <Input
          value={newStageName}
          onChange={(e) => setNewStageName(e.target.value)}
          placeholder="New stage name…"
          className="h-9 flex-1"
          onKeyDown={(e) => { if (e.key === "Enter") handleAddStage(); }}
        />
        <Button size="sm" onClick={handleAddStage} disabled={!newStageName.trim()}>
          Add Stage
        </Button>
      </Card>

      {scorecardStageId && (
        <ScorecardBuilder
          stageId={scorecardStageId}
          stageName={scorecardStageName}
          open={!!scorecardStageId}
          onOpenChange={(open) => { if (!open) setScorecardStageId(null); }}
        />
      )}
    </div>
  );
};

export default InterviewPlan;
