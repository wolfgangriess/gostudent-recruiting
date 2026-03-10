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
import { GripVertical, Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { useATSStore } from "@/lib/ats-store";
import { PipelineStage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Props {
  jobId: string;
}

const SortableStageRow = ({
  stage,
  onRemove,
  onRename,
  candidateCount,
}: {
  stage: PipelineStage;
  onRemove: () => void;
  onRename: (name: string) => void;
  candidateCount: number;
}) => {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(stage.name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
              className="h-8 w-48"
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

      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
        {candidateCount} candidate{candidateCount !== 1 ? "s" : ""}
      </span>

      {!editing && (
        <button
          onClick={() => {
            setEditName(stage.name);
            setEditing(true);
          }}
          className="text-muted-foreground/50 hover:text-foreground"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}

      <button
        onClick={onRemove}
        className="text-muted-foreground/50 hover:text-destructive"
        title="Remove stage"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

const DragOverlayStage = ({ stage }: { stage: PipelineStage }) => (
  <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-card p-4 shadow-xl">
    <GripVertical className="h-5 w-5 text-muted-foreground/50" />
    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
      {stage.order + 1}
    </span>
    <span className="text-sm font-semibold text-foreground">{stage.name}</span>
  </div>
);

const InterviewPlan = ({ jobId }: Props) => {
  const { stages, candidates, addStage, removeStage, renameStage, reorderStages } =
    useATSStore();
  const [newStageName, setNewStageName] = useState("");
  const [activeStage, setActiveStage] = useState<PipelineStage | null>(null);

  const jobStages = stages
    .filter((s) => s.jobId === jobId)
    .sort((a, b) => a.order - b.order);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

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
    reorderStages(
      jobId,
      reordered.map((s) => s.id)
    );
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
            Configure the hiring stages for this position. Drag to reorder.
          </p>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={jobStages.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {jobStages.map((stage) => (
              <SortableStageRow
                key={stage.id}
                stage={stage}
                candidateCount={getCandidateCount(stage.id)}
                onRemove={() => removeStage(stage.id)}
                onRename={(name) => renameStage(stage.id, name)}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeStage ? <DragOverlayStage stage={activeStage} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Add stage */}
      <Card className="mt-4 flex items-center gap-3 rounded-xl border-dashed p-4">
        <Plus className="h-5 w-5 text-muted-foreground/50" />
        <Input
          value={newStageName}
          onChange={(e) => setNewStageName(e.target.value)}
          placeholder="New stage name…"
          className="h-9 flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddStage();
          }}
        />
        <Button size="sm" onClick={handleAddStage} disabled={!newStageName.trim()}>
          Add Stage
        </Button>
      </Card>
    </div>
  );
};

export default InterviewPlan;
