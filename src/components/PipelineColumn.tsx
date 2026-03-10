import { useDroppable } from "@dnd-kit/core";
import { PipelineStage, Candidate } from "@/lib/types";
import CandidateCard from "@/components/CandidateCard";

interface Props {
  stage: PipelineStage;
  candidates: Candidate[];
}

const stageColors: Record<string, string> = {
  Applied: "bg-muted",
  "Phone Screen": "bg-blue-50",
  Interview: "bg-amber-50",
  Offer: "bg-emerald-50",
  Hired: "bg-primary/10",
};

const PipelineColumn = ({ stage, candidates }: Props) => {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[400px] w-64 shrink-0 flex-col rounded-lg border border-border p-3 transition-colors ${
        isOver ? "border-primary bg-primary/5" : "bg-card"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              stageColors[stage.name] ?? "bg-muted"
            }`}
            style={
              stage.name === "Hired"
                ? { backgroundColor: "hsl(var(--primary))" }
                : undefined
            }
          />
          <span className="text-sm font-semibold text-foreground">{stage.name}</span>
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {candidates.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {candidates.map((c) => (
          <CandidateCard key={c.id} candidate={c} />
        ))}
      </div>
    </div>
  );
};

export default PipelineColumn;
