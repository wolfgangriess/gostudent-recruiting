import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { JobRow, JobInsert, JobUpdate } from "@/integrations/supabase/app-types";
import { mapJob, mapJobs } from "@/lib/mappers";
import type { Job } from "@/lib/types";

export const jobKeys = {
  all: ["jobs"] as const,
  detail: (id: string) => ["jobs", id] as const,
};

export const useJobs = () =>
  useQuery({
    queryKey: jobKeys.all,
    staleTime: 30000,
    queryFn: async (): Promise<Job[]> => {
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return mapJobs((data ?? []) as JobRow[]);
      } catch (err) {
        console.error("useJobs error:", err);
        return [];
      }
    },
  });

export const useJob = (id: string) =>
  useQuery({
    queryKey: jobKeys.detail(id),
    staleTime: 30000,
    queryFn: async (): Promise<Job | null> => {
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (error) throw error;
        const row = (data as JobRow | null) ?? null;
        return row ? mapJob(row) : null;
      } catch (err) {
        console.error("useJob error:", err);
        return null;
      }
    },
    enabled: !!id,
  });

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (job: JobInsert): Promise<Job> => {
      const { data, error } = await supabase.from("jobs").insert(job).select().single();
      if (error) throw error;
      return mapJob(data as JobRow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
};

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
