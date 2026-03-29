import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { JobRow, JobInsert, JobUpdate } from "@/integrations/supabase/app-types";
import { mapJob, mapJobs } from "@/lib/mappers";
import type { Job } from "@/lib/types";

// ---- Query keys ----
export const jobKeys = {
  all: ["jobs"] as const,
  detail: (id: string) => ["jobs", id] as const,
};

// ---- Queries ----

/** Fetch all jobs, returning camelCase Job[] */
export const useJobs = () =>
  useQuery({
    queryKey: jobKeys.all,
    queryFn: async (): Promise<Job[]> => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return mapJobs((data ?? []) as JobRow[]);
    },
  });

/** Fetch a single job by id, returning camelCase Job */
export const useJob = (id: string) =>
  useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: async (): Promise<Job | null> => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      const row = (data as JobRow | null) ?? null;
      return row ? mapJob(row) : null;
    },
    enabled: !!id,
  });

// ---- Mutations ----

/** Create a new job */
export const useCreateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (job: JobInsert): Promise<Job> => {
      const { data, error } = await supabase
        .from("jobs")
        .insert(job)
        .select()
        .single();
      if (error) throw error;
      return mapJob(data as JobRow);
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
