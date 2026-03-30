import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { OfferRow, OfferInsert, OfferStatus } from "@/integrations/supabase/app-types";

// ---- Query keys ----
export const offerKeys = {
  all: ["offers"] as const,
  byCandidate: (candidateId: string) => ["offers", "candidate", candidateId] as const,
};

// ---- Queries ----

/** Fetch offers for a specific candidate */
export const useOffersByCandidate = (candidateId: string) =>
  useQuery({
    queryKey: offerKeys.byCandidate(candidateId),
    staleTime: 30000,
    queryFn: async (): Promise<OfferRow[]> => {
      try {
        const { data, error } = await supabase
          .from("offers")
          .select("*")
          .eq("candidate_id", candidateId)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return (data ?? []) as OfferRow[];
      } catch (err) {
        console.error("useOffersByCandidate error:", err);
        return [];
      }
    },
    enabled: !!candidateId,
  });

// ---- Mutations ----

/** Create a new offer (includes offered_salary) */
export const useCreateOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (offer: OfferInsert): Promise<OfferRow> => {
      const { data, error } = await supabase
        .from("offers")
        .insert(offer)
        .select()
        .single();
      if (error) throw error;
      // Also update the candidate's offeredSalary field
      await supabase
        .from("candidates")
        .update({
          offered_salary: offer.offered_salary,
          updated_at: new Date().toISOString(),
        })
        .eq("id", offer.candidate_id);
      return data as OfferRow;
    },
    onSuccess: (_data, offer) => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
      queryClient.invalidateQueries({ queryKey: offerKeys.byCandidate(offer.candidate_id) });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });
};

const updateOfferStatus = (status: OfferStatus) => async (offerId: string) => {
  const { error } = await supabase
    .from("offers")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", offerId);
  if (error) throw error;
};

/** Approve an offer */
export const useApproveOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateOfferStatus("approved"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
    },
  });
};

/** Reject an offer */
export const useRejectOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateOfferStatus("rejected"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
    },
  });
};
