import { useCallback } from "react";
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCenter,
} from "@dnd-kit/core";
import { useState } from "react";
import { PipelineStage, Candidate } from "@/lib/types";
import PipelineColumn from "@/components/PipelineColumn";
import CandidateCard from "@/components/CandidateCard";
import { useAllCandidates } from "@/hooks/useCandidates";
import { useUpdateCandidateStage } from "@/hooks/useCandidates";

interface Props {
  stages: PipelineStage[];
  jobId: string;
}

const PipelineBoard = ({ stages, jobId }: Props) => {
  const { data: allCandidates = [] } = useAllCandidates();
  const { mutate: updateStage } = useUpdateCandidateStage();
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const cand = allCandidates.find((c) => c.id === event.active.id);
      if (cand) setActiveCandidate(cand);
    },
    [allCandidates]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveCandidate(null);
      const { active, over } = event;
      if (!over) return;
      const candidateId = active.id as string;
      const targetStageId = over.id as string;
      const candidate = allCandidates.find((c) => c.id === candidateId);
      if (candidate && candidate.currentStageId !== targetStageId) {
        updateStage({ candidateId, newStageId: targetStageId });
      }
    },
    [allCandidates, updateStage]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageCandidates = allCandidates.filter(
            (c) => c.jobId === jobId && c.currentStageId === stage.id
          );
          return (
            <PipelineColumn key={stage.id} stage={stage} candidates={stageCandidates} />
          );
        })}
      </div>
      <DragOverlay>
        {activeCandidate ? <CandidateCard candidate={activeCandidate} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default PipelineBoard;
