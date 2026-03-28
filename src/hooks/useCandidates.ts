import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CandidateRow, CandidateInsert, CandidateUpdate } from "@/integrations/supabase/app-types";

// ---- Query keys ----
export const candidateKeys = {
  all: ["candidates"] as const,
  detail: (id: string) => ["candidates", id] as const,
};

// ---- Queries ----

/** Fetch all candidates, joined with job name and stage name */
export const useAllCandidates = () =>
  useQuery({
    queryKey: candidateKeys.all,
    queryFn: async (): Promise<CandidateRow[]> => {
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .order("applied_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CandidateRow[];
    },
  });

/** Fetch a single candidate by id */
export const useCandidate = (id: string) =>
  useQuery({
    queryKey: candidateKeys.detail(id),
    queryFn: async (): Promise<CandidateRow | null> => {
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data as CandidateRow | null) ?? null;
    },
    enabled: !!id,
  });

// ---- Mutations ----

/** Create a new candidate */
export const useCreateCandidate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (candidate: CandidateInsert): Promise<CandidateRow> => {
      const { data, error } = await supabase
        .from("candidates")
        .insert(candidate)
        .select()
        .single();
      if (error) throw error;
      return data as CandidateRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.all });
    },
  });
};

/** Move a candidate to a new pipeline stage with optimistic update */
export const useUpdateCandidateStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      candidateId,
      newStageId,
    }: {
      candidateId: string;
      newStageId: string;
    }) => {
      const { error } = await supabase
        .from("candidates")
        .update({
          current_stage_id: newStageId,
          stage_changed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } satisfies CandidateUpdate)
        .eq("id", candidateId);
      if (error) throw error;
    },
    onMutate: async ({ candidateId, newStageId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: candidateKeys.all });

      // Snapshot previous value
      const previous = queryClient.getQueryData<CandidateRow[]>(candidateKeys.all);

      // Optimistically update the cache
      queryClient.setQueryData<CandidateRow[]>(candidateKeys.all, (old) =>
        (old ?? []).map((c) =>
          c.id === candidateId
            ? { ...c, current_stage_id: newStageId, stage_changed_at: new Date().toISOString() }
            : c
        )
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      // Roll back on error
      if (context?.previous) {
        queryClient.setQueryData(candidateKeys.all, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.all });
    },
  });
};

/** Generic candidate update */
export const useUpdateCandidate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: CandidateUpdate }) => {
      const { error } = await supabase
        .from("candidates")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.all });
      queryClient.invalidateQueries({ queryKey: candidateKeys.detail(id) });
    },
  });
};
