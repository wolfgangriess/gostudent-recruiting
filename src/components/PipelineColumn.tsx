import { useDroppable } from "@dnd-kit/core";
import { PipelineStage, Candidate } from "@/lib/types";
import CandidateCard from "@/components/CandidateCard";

interface Props {
  stage: PipelineStage;
  candidates: Candidate[];
}

const stageColorDots: Record<string, string> = {
  Applied: "bg-muted-foreground/40",
  "Phone Screen": "bg-blue-500",
  Interview: "bg-accent",
  Offer: "bg-primary/60",
  Hired: "bg-primary",
};

const PipelineColumn = ({ stage, candidates }: Props) => {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[420px] w-64 shrink-0 flex-col rounded-2xl border p-3.5 transition-all ${
        isOver ? "border-primary bg-primary/5 shadow-md" : "border-border bg-card"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${stageColorDots[stage.name] ?? "bg-muted-foreground/40"}`} />
          <span className="text-sm font-bold text-foreground">{stage.name}</span>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
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
