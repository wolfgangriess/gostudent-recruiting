import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CandidateRow, CandidateInsert, CandidateUpdate } from "@/integrations/supabase/app-types";
import { mapCandidate, mapCandidates } from "@/lib/mappers";
import type { Candidate } from "@/lib/types";

export const candidateKeys = {
  all: ["candidates"] as const,
  detail: (id: string) => ["candidates", id] as const,
};

export const useAllCandidates = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("candidates-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "candidates" }, () => {
        queryClient.invalidateQueries({ queryKey: candidateKeys.all });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return useQuery({
    queryKey: candidateKeys.all,
    staleTime: 30000,
    queryFn: async (): Promise<Candidate[]> => {
      try {
        const { data, error } = await supabase
          .from("candidates")
          .select("*")
          .order("applied_at", { ascending: false });
        if (error) throw error;
        return mapCandidates((data ?? []) as CandidateRow[]);
      } catch (err) {
        console.error("useAllCandidates error:", err);
        return [];
      }
    },
  });
};

export const useCandidate = (id: string) =>
  useQuery({
    queryKey: candidateKeys.detail(id),
    staleTime: 30000,
    queryFn: async (): Promise<Candidate | null> => {
      try {
        const { data, error } = await supabase
          .from("candidates")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (error) throw error;
        const row = (data as CandidateRow | null) ?? null;
        return row ? mapCandidate(row) : null;
      } catch (err) {
        console.error("useCandidate error:", err);
        return null;
      }
    },
    enabled: !!id,
  });

export const useCreateCandidate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (candidate: CandidateInsert): Promise<Candidate> => {
      const { data, error } = await supabase
        .from("candidates")
        .insert(candidate)
        .select()
        .single();
      if (error) throw error;
      return mapCandidate(data as CandidateRow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.all });
    },
  });
};

export const useUpdateCandidateStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ candidateId, newStageId }: { candidateId: string; newStageId: string }) => {
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
      await queryClient.cancelQueries({ queryKey: candidateKeys.all });
      const previous = queryClient.getQueryData<Candidate[]>(candidateKeys.all);
      queryClient.setQueryData<Candidate[]>(candidateKeys.all, (old) =>
        (old ?? []).map((c) =>
          c.id === candidateId
            ? { ...c, currentStageId: newStageId, stageChangedAt: new Date().toISOString() }
            : c
        )
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(candidateKeys.all, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.all });
    },
  });
};

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
