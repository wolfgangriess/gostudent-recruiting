import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface GoogleCalendarIntegrationRow {
  id: string;
  provider: string;
  connected_email: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useGoogleCalendarIntegration = () => {
  const { user } = useAuth();
  const [integration, setIntegration] = useState<GoogleCalendarIntegrationRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setIntegration(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("integrations")
      .select("id, provider, connected_email, expires_at, created_at, updated_at")
      .eq("user_id", user.id)
      .eq("provider", "google_calendar")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Failed to load Google Calendar integration", error);
      setIntegration(null);
    } else {
      setIntegration((data as GoogleCalendarIntegrationRow | null) ?? null);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const expired = useMemo(() => {
    if (!integration?.expires_at) return false;
    return new Date(integration.expires_at) < new Date();
  }, [integration?.expires_at]);

  const connected = !!integration && !expired;

  const connect = useCallback(async () => {
    if (!user) {
      throw new Error("You need to be signed in first.");
    }

    setMutating(true);

    if (integration?.id) {
      const { error } = await supabase
        .from("integrations")
        .update({
          connected_email: user.email ?? null,
          expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", integration.id);

      setMutating(false);
      if (error) throw error;
      await refresh();
      return;
    }

    const { error } = await supabase.from("integrations").insert({
      user_id: user.id,
      provider: "google_calendar",
      connected_email: user.email ?? null,
      expires_at: null,
    });

    setMutating(false);
    if (error) throw error;
    await refresh();
  }, [integration?.id, refresh, user]);

  const disconnect = useCallback(async () => {
    if (!user) {
      throw new Error("You need to be signed in first.");
    }

    setMutating(true);
    const { error } = await supabase
      .from("integrations")
      .delete()
      .eq("user_id", user.id)
      .eq("provider", "google_calendar");

    setMutating(false);
    if (error) throw error;
    await refresh();
  }, [refresh, user]);

  return {
    integration,
    connected,
    expired,
    loading,
    mutating,
    connect,
    disconnect,
    refresh,
  };
};
