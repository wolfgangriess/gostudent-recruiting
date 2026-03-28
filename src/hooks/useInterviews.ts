import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type InterviewRow = Tables<"interviews">;
type InterviewInsert = TablesInsert<"interviews">;

// ---- Query keys ----
export const interviewKeys = {
  all: ["interviews"] as const,
  byCandidate: (candidateId: string) => ["interviews", "candidate", candidateId] as const,
};

// ---- Queries ----

/** Fetch all interviews ordered by start time descending */
export const useInterviews = () =>
  useQuery({
    queryKey: interviewKeys.all,
    queryFn: async (): Promise<InterviewRow[]> => {
      const { data, error } = await supabase
        .from("interviews")
        .select("*")
        .order("start_time", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

/** Fetch interviews for a specific candidate */
export const useInterviewsByCandidate = (candidateId: string) =>
  useQuery({
    queryKey: interviewKeys.byCandidate(candidateId),
    queryFn: async (): Promise<InterviewRow[]> => {
      const { data, error } = await supabase
        .from("interviews")
        .select("*")
        .eq("candidate_id", candidateId)
        .order("start_time", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!candidateId,
  });

// ---- Mutations ----

/** Schedule a new interview.
 *  After creating the record, callers should also trigger a Google Calendar
 *  event via useGoogleCalendarIntegration (wired in Sprint 3, PROMPT 7).
 */
export const useCreateInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (interview: InterviewInsert): Promise<InterviewRow> => {
      const { data, error } = await supabase
        .from("interviews")
        .insert(interview)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, interview) => {
      queryClient.invalidateQueries({ queryKey: interviewKeys.all });
      if (interview.candidate_id) {
        queryClient.invalidateQueries({
          queryKey: interviewKeys.byCandidate(interview.candidate_id),
        });
      }
    },
  });
};

/** Cancel an interview (set status to 'cancelled') */
export const useCancelInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (interviewId: string) => {
      const { error } = await supabase
        .from("interviews")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", interviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: interviewKeys.all });
    },
  });
};

/**
 * Hook that sets up a Supabase Realtime subscription on the interviews table.
 * Call once at the app root level (e.g., inside a provider or layout component).
 * Invalidates the interviews query cache on any INSERT/UPDATE/DELETE.
 * (Subscription logic is also inlined in useInterviews for convenience —
 *  see PROMPT 5 in CLAUDE_CODE_BRIEFING.md.)
 */
export const useInterviewsRealtime = () => {
  const queryClient = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("interviews-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "interviews" },
        () => {
          queryClient.invalidateQueries({ queryKey: interviewKeys.all });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
