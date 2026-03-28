import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PipelineStageRow, PipelineStageInsert } from "@/integrations/supabase/app-types";

// ---- Query keys ----
export const stageKeys = {
  all: ["stages"] as const,
  byJob: (jobId: string) => ["stages", "job", jobId] as const,
};

// ---- Queries ----

/** Fetch all pipeline stages ordered by job + position */
export const useStages = () =>
  useQuery({
    queryKey: stageKeys.all,
    queryFn: async (): Promise<PipelineStageRow[]> => {
      const { data, error } = await supabase
        .from("pipeline_stages")
        .select("*")
        .order("order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as PipelineStageRow[];
    },
  });

/** Fetch pipeline stages for a specific job */
export const useStagesByJob = (jobId: string) =>
  useQuery({
    queryKey: stageKeys.byJob(jobId),
    queryFn: async (): Promise<PipelineStageRow[]> => {
      const { data, error } = await supabase
        .from("pipeline_stages")
        .select("*")
        .eq("job_id", jobId)
        .order("order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as PipelineStageRow[];
    },
    enabled: !!jobId,
  });

// ---- Mutations ----

/** Create a new pipeline stage */
export const useCreateStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (stage: PipelineStageInsert): Promise<PipelineStageRow> => {
      const { data, error } = await supabase
        .from("pipeline_stages")
        .insert(stage)
        .select()
        .single();
      if (error) throw error;
      return data as PipelineStageRow;
    },
    onSuccess: (_data, stage) => {
      queryClient.invalidateQueries({ queryKey: stageKeys.all });
      queryClient.invalidateQueries({ queryKey: stageKeys.byJob(stage.job_id) });
    },
  });
};

/** Delete a pipeline stage */
export const useDeleteStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (stageId: string) => {
      const { error } = await supabase
        .from("pipeline_stages")
        .delete()
        .eq("id", stageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stageKeys.all });
    },
  });
};
