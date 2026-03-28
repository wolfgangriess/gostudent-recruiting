import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { JobRow, JobInsert, JobUpdate } from "@/integrations/supabase/app-types";

// ---- Query keys ----
export const jobKeys = {
  all: ["jobs"] as const,
  detail: (id: string) => ["jobs", id] as const,
};

// ---- Queries ----

/** Fetch all jobs ordered by creation date descending */
export const useJobs = () =>
  useQuery({
    queryKey: jobKeys.all,
    queryFn: async (): Promise<JobRow[]> => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as JobRow[];
    },
  });

/** Fetch a single job by id */
export const useJob = (id: string) =>
  useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: async (): Promise<JobRow | null> => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data as JobRow | null) ?? null;
    },
    enabled: !!id,
  });

// ---- Mutations ----

/** Create a new job */
export const useCreateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (job: JobInsert): Promise<JobRow> => {
      const { data, error } = await supabase
        .from("jobs")
        .insert(job)
        .select()
        .single();
      if (error) throw error;
      return data as JobRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
};

/** Update an existing job */
export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: JobUpdate }) => {
      const { error } = await supabase
        .from("jobs")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) });
    },
  });
};
