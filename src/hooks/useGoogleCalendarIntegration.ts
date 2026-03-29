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

  // Check for callback params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("gcal_connected") === "true") {
      // Clean URL and refresh
      window.history.replaceState({}, "", window.location.pathname);
      refresh();
    }
    const gcalError = params.get("gcal_error");
    if (gcalError) {
      window.history.replaceState({}, "", window.location.pathname);
      console.error("Google Calendar connection error:", gcalError);
    }
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

    try {
      // Call edge function to get Google OAuth URL
      const { data, error } = await supabase.functions.invoke("google-calendar-auth");

      if (error) throw error;
      if (data?.url) {
        // Redirect to Google OAuth consent screen
        window.location.href = data.url;
      } else {
        throw new Error("No authorization URL returned");
      }
    } finally {
      setMutating(false);
    }
  }, [user]);

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

  /** Create a Google Calendar event via the Edge Function */
  const createCalendarEvent = useCallback(async (params: {
    summary: string;
    description?: string;
    startTime: string;
    endTime: string;
    attendees?: { email: string; name?: string }[];
    location?: string;
    createMeetLink?: boolean;
  }): Promise<{ googleEventId: string; meetingLink: string | null; htmlLink: string | null }> => {
    const { data, error } = await supabase.functions.invoke("google-calendar-api", {
      body: { action: "create_event", ...params },
    });
    if (error) throw error;
    return {
      googleEventId: data?.googleEventId ?? "",
      meetingLink: data?.meetingLink ?? null,
      htmlLink: data?.htmlLink ?? null,
    };
  }, []);

  return {
    integration,
    connected,
    expired,
    loading,
    mutating,
    connect,
    disconnect,
    refresh,
    createCalendarEvent,
  };
};
