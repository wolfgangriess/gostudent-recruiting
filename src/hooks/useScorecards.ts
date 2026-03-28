import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  ScorecardEvaluationRow,
  ScorecardEvaluationInsert,
  ScorecardTemplateRow,
  ScorecardTemplateInsert,
} from "@/integrations/supabase/app-types";

// ---- Query keys ----
export const scorecardKeys = {
  evaluationsByCandidate: (candidateId: string) =>
    ["scorecard_evaluations", "candidate", candidateId] as const,
  templateByStage: (stageId: string) => ["scorecard_templates", "stage", stageId] as const,
};

// ---- Queries ----

/** Fetch all scorecard evaluations for a candidate */
export const useScorecardsByCandidate = (candidateId: string) =>
  useQuery({
    queryKey: scorecardKeys.evaluationsByCandidate(candidateId),
    queryFn: async (): Promise<ScorecardEvaluationRow[]> => {
      const { data, error } = await supabase
        .from("scorecard_evaluations")
        .select("*")
        .eq("candidate_id", candidateId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ScorecardEvaluationRow[];
    },
    enabled: !!candidateId,
  });

/** Fetch the scorecard template for a stage */
export const useScorecardTemplate = (stageId: string) =>
  useQuery({
    queryKey: scorecardKeys.templateByStage(stageId),
    queryFn: async (): Promise<ScorecardTemplateRow | null> => {
      const { data, error } = await supabase
        .from("scorecard_templates")
        .select("*")
        .eq("stage_id", stageId)
        .maybeSingle();
      if (error) throw error;
      return (data as ScorecardTemplateRow | null) ?? null;
    },
    enabled: !!stageId,
  });

// ---- Mutations ----

/** Submit a scorecard evaluation */
export const useSubmitScorecard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (evaluation: ScorecardEvaluationInsert): Promise<ScorecardEvaluationRow> => {
      const { data, error } = await supabase
        .from("scorecard_evaluations")
        .insert(evaluation)
        .select()
        .single();
      if (error) throw error;
      return data as ScorecardEvaluationRow;
    },
    onSuccess: (_data, evaluation) => {
      queryClient.invalidateQueries({
        queryKey: scorecardKeys.evaluationsByCandidate(evaluation.candidate_id),
      });
    },
  });
};

/** Upsert a scorecard template for a stage */
export const useUpsertScorecardTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (template: ScorecardTemplateInsert): Promise<ScorecardTemplateRow> => {
      const { data, error } = await supabase
        .from("scorecard_templates")
        .upsert(template, { onConflict: "stage_id" })
        .select()
        .single();
      if (error) throw error;
      return data as ScorecardTemplateRow;
    },
    onSuccess: (_data, template) => {
      queryClient.invalidateQueries({
        queryKey: scorecardKeys.templateByStage(template.stage_id),
      });
    },
  });
};
