import { useDraggable } from "@dnd-kit/core";
import { Candidate } from "@/lib/types";

interface Props {
  candidate: Candidate;
  isDragging?: boolean;
}

const CandidateCard = ({ candidate, isDragging }: Props) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: candidate.id,
  });

  const daysInStage = Math.max(
    1,
    Math.floor(
      (Date.now() - new Date(candidate.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  const initials = `${candidate.firstName[0]}${candidate.lastName[0]}`;

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`cursor-grab rounded-xl border border-border bg-card p-3 shadow-sm transition-all hover:shadow-md hover:border-primary/30 ${
        isDragging ? "opacity-90 shadow-lg ring-2 ring-primary/30 scale-105" : ""
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {candidate.firstName} {candidate.lastName}
          </p>
          <p className="text-xs text-muted-foreground">{daysInStage}d in stage</p>
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;
