import { useState } from "react";
import { Plus, Trash2, Star, CheckCircle, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useATSStore } from "@/lib/ats-store";
import { ScorecardCriterion, RatingType } from "@/lib/types";

interface Props {
  stageId: string;
  stageName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ratingIcons: Record<RatingType, React.ReactNode> = {
  scale: <Star className="h-3.5 w-3.5" />,
  yes_no: <CheckCircle className="h-3.5 w-3.5" />,
  text: <MessageSquare className="h-3.5 w-3.5" />,
};

const ratingLabels: Record<RatingType, string> = {
  scale: "1–5 Scale",
  yes_no: "Yes / No",
  text: "Text Feedback",
};

const ScorecardBuilder = ({ stageId, stageName, open, onOpenChange }: Props) => {
  const { getScorecardTemplate, setScorecardTemplate } = useATSStore();
  const existing = getScorecardTemplate(stageId);
  const [criteria, setCriteria] = useState<ScorecardCriterion[]>(
    existing?.criteria ?? []
  );

  const addCriterion = () => {
    setCriteria([
      ...criteria,
      {
        id: `cr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        question: "",
        ratingType: "scale",
      },
    ]);
  };

  const updateCriterion = (id: string, updates: Partial<ScorecardCriterion>) => {
    setCriteria(criteria.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const removeCriterion = (id: string) => {
    setCriteria(criteria.filter((c) => c.id !== id));
  };

  const handleSave = () => {
    const valid = criteria.filter((c) => c.question.trim());
    setScorecardTemplate(stageId, valid);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Scorecard — {stageName}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground mb-4">
          Define evaluation criteria for interviewers at this stage.
        </p>

        <div className="space-y-3">
          {criteria.map((c, i) => (
            <div
              key={c.id}
              className="flex items-start gap-2 rounded-xl border border-border bg-muted/30 p-3"
            >
              <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                {i + 1}
              </span>
              <div className="flex-1 space-y-2">
                <Input
                  value={c.question}
                  onChange={(e) => updateCriterion(c.id, { question: e.target.value })}
                  placeholder="e.g. Technical Skills, Communication…"
                  className="h-8"
                />
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground shrink-0">Rating:</Label>
                  <Select
                    value={c.ratingType}
                    onValueChange={(v) =>
                      updateCriterion(c.id, { ratingType: v as RatingType })
                    }
                  >
                    <SelectTrigger className="h-7 w-36 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ratingLabels) as RatingType[]).map((rt) => (
                        <SelectItem key={rt} value={rt} className="text-xs">
                          <span className="flex items-center gap-1.5">
                            {ratingIcons[rt]} {ratingLabels[rt]}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeCriterion(c.id)}
                className="mt-2 text-muted-foreground/50 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 gap-1.5 rounded-lg"
          onClick={addCriterion}
        >
          <Plus className="h-3.5 w-3.5" /> Add Criteria
        </Button>

        {/* Preview */}
        {criteria.filter((c) => c.question.trim()).length > 0 && (
          <div className="mt-4 rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">PREVIEW</p>
            <div className="space-y-2">
              {criteria
                .filter((c) => c.question.trim())
                .map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{c.question}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      {ratingIcons[c.ratingType]} {ratingLabels[c.ratingType]}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Scorecard</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScorecardBuilder;
