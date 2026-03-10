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
import { GripVertical, Plus, Trash2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useATSStore } from "@/lib/ats-store";
import { UserAvatar } from "@/components/UserPicker";
import ScorecardBuilder from "@/components/ScorecardBuilder";
import type { StageConfig } from "@/components/AddJobDialog";

interface Props {
  stages: StageConfig[];
  onChange: (stages: StageConfig[]) => void;
  hiringTeamIds: string[];
  /** If provided, this is an existing job — show scorecard config */
  jobId?: string;
}

const SortableStageItem = ({
  stage,
  index,
  onRemove,
  onUpdate,
  eligibleUsers,
  jobId,
}: {
  stage: StageConfig;
  index: number;
  onRemove: () => void;
  onUpdate: (updates: Partial<StageConfig>) => void;
  eligibleUsers: { id: string; firstName: string; lastName: string; role: string; department: string }[];
  jobId?: string;
}) => {
  const [scorecardOpen, setScorecardOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: stage.tempId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { getScorecardTemplate } = useATSStore();

  // For existing jobs, check if scorecard exists
  const stageId = jobId
    ? useATSStore.getState().stages.find(
        (s) => s.jobId === jobId && s.name === stage.name && s.order === index
      )?.id
    : undefined;
  const hasScorecard = stageId ? !!getScorecardTemplate(stageId) : false;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-center gap-2 rounded-xl border bg-card p-3 transition-shadow ${
          isDragging ? "opacity-50 shadow-lg" : "shadow-sm"
        }`}
      >
        <button
          {...attributes}
          {...listeners}
          type="button"
          className="cursor-grab touch-none text-muted-foreground/40 hover:text-muted-foreground"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
          {index + 1}
        </span>

        <Input
          value={stage.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="h-8 flex-1"
          placeholder="Stage name"
        />

        <Select
          value={stage.ownerId || "none"}
          onValueChange={(v) => onUpdate({ ownerId: v === "none" ? undefined : v })}
        >
          <SelectTrigger className="h-8 w-40 text-xs">
            <SelectValue placeholder="Owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none" className="text-xs">No Owner</SelectItem>
            {eligibleUsers.map((u) => (
              <SelectItem key={u.id} value={u.id} className="text-xs">
                <span className="flex items-center gap-1.5">
                  <UserAvatar user={u as any} size="sm" />
                  {u.firstName} {u.lastName}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {stageId && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-8 gap-1 text-xs ${hasScorecard ? "text-primary" : "text-muted-foreground"}`}
            onClick={() => setScorecardOpen(true)}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            {hasScorecard ? "Edit" : "Scorecard"}
          </Button>
        )}

        <button
          type="button"
          onClick={onRemove}
          className="text-muted-foreground/40 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {stageId && (
        <ScorecardBuilder
          stageId={stageId}
          stageName={stage.name}
          open={scorecardOpen}
          onOpenChange={setScorecardOpen}
        />
      )}
    </>
  );
};

const StageConfigurator = ({ stages, onChange, hiringTeamIds, jobId }: Props) => {
  const { users } = useATSStore();
  const [activeStage, setActiveStage] = useState<StageConfig | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Eligible owners: admins + hiring team members
  const eligibleUsers = users.filter(
    (u) => u.role === "admin" || u.role === "hiring_manager" || hiringTeamIds.includes(u.id)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const s = stages.find((st) => st.tempId === event.active.id);
    if (s) setActiveStage(s);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveStage(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = stages.findIndex((s) => s.tempId === active.id);
    const newIdx = stages.findIndex((s) => s.tempId === over.id);
    onChange(arrayMove(stages, oldIdx, newIdx));
  };

  const addStage = () => {
    onChange([
      ...stages,
      { tempId: `new-stage-${Date.now()}`, name: "", ownerId: undefined },
    ]);
  };

  const removeStage = (tempId: string) => {
    onChange(stages.filter((s) => s.tempId !== tempId));
  };

  const updateStage = (tempId: string, updates: Partial<StageConfig>) => {
    onChange(stages.map((s) => (s.tempId === tempId ? { ...s, ...updates } : s)));
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        Recruiting Stages
      </label>
      <p className="text-xs text-muted-foreground mb-3">
        Drag to reorder. Assign an owner and configure scorecards per stage.
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={stages.map((s) => s.tempId)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {stages.map((stage, i) => (
              <SortableStageItem
                key={stage.tempId}
                stage={stage}
                index={i}
                onRemove={() => removeStage(stage.tempId)}
                onUpdate={(updates) => updateStage(stage.tempId, updates)}
                eligibleUsers={eligibleUsers}
                jobId={jobId}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeStage ? (
            <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-card p-3 shadow-xl">
              <GripVertical className="h-4 w-4 text-muted-foreground/40" />
              <span className="text-sm font-semibold text-foreground">{activeStage.name}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3 gap-1.5 rounded-lg"
        onClick={addStage}
      >
        <Plus className="h-3.5 w-3.5" /> Add Stage
      </Button>
    </div>
  );
};

export default StageConfigurator;
