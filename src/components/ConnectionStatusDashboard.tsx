import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, RefreshCw, Calendar, Mail, Shield, Unplug } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGoogleCalendarIntegration } from "@/hooks/useGoogleCalendarIntegration";
import { toast } from "sonner";

interface IntegrationRow {
  id: string;
  provider: string;
  connected_email: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

const PROVIDERS = [
  {
    key: "google_calendar",
    label: "Google Calendar",
    description: "Sync interview schedules, create events, send invites",
    icon: Calendar,
  },
  {
    key: "gmail",
    label: "Gmail",
    description: "Send and receive candidate emails",
    icon: Mail,
  },
  {
    key: "gostudent_sso",
    label: "GoStudent SSO",
    description: "Single sign-on authentication",
    icon: Shield,
  },
];

const ConnectionStatusDashboard = () => {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<IntegrationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const googleCalendar = useGoogleCalendarIntegration();

  const fetchIntegrations = useCallback(async () => {
    if (!user) {
      setIntegrations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("integrations")
      .select("id, provider, connected_email, expires_at, created_at, updated_at")
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to load connected services.");
      setIntegrations([]);
    } else {
      setIntegrations((data as IntegrationRow[]) || []);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const getIntegration = (provider: string) => {
    if (provider === "google_calendar") {
      return googleCalendar.integration;
    }

    return integrations.find((integration) => integration.provider === provider) ?? null;
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const handleConnectCalendar = async () => {
    try {
      await googleCalendar.connect();
      await fetchIntegrations();
      toast.success("Google Calendar connected successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to connect Google Calendar.");
    }
  };

  const handleDisconnectCalendar = async () => {
    try {
      await googleCalendar.disconnect();
      await fetchIntegrations();
      toast.success("Google Calendar disconnected.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to disconnect Google Calendar.");
    }
  };

  if (loading || googleCalendar.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {PROVIDERS.filter((provider) => !!getIntegration(provider.key)).length} of {PROVIDERS.length} services connected
        </p>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => {
          void fetchIntegrations();
          void googleCalendar.refresh();
        }}>
          <RefreshCw className="h-3 w-3" /> Refresh
        </Button>
      </div>

      {PROVIDERS.map((provider) => {
        const integration = getIntegration(provider.key);
        const connected = !!integration;
        const expired = connected && isExpired(integration.expires_at);
        const Icon = provider.icon;

        return (
          <div key={provider.key} className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{provider.label}</h3>
                  {connected && !expired && (
                    <Badge variant="secondary" className="gap-1 text-[10px]">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Connected
                    </Badge>
                  )}
                  {connected && expired && (
                    <Badge variant="destructive" className="gap-1 text-[10px]">
                      <XCircle className="h-2.5 w-2.5" /> Expired
                    </Badge>
                  )}
                  {!connected && (
                    <Badge variant="secondary" className="gap-1 text-[10px]">
                      <XCircle className="h-2.5 w-2.5" /> Not Connected
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{provider.description}</p>
                {integration?.connected_email && (
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Connected as <span className="font-medium text-foreground">{integration.connected_email}</span>
                  </p>
                )}
              </div>
              {provider.key === "google_calendar" && (
                <div className="shrink-0">
                  {googleCalendar.connected ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-destructive"
                      onClick={() => void handleDisconnectCalendar()}
                      disabled={googleCalendar.mutating}
                    >
                      {googleCalendar.mutating ? (
                        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Unplug className="mr-1 h-3.5 w-3.5" />
                      )}
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => void handleConnectCalendar()}
                      disabled={googleCalendar.mutating}
                    >
                      {googleCalendar.mutating ? (
                        <>
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> Connecting…
                        </>
                      ) : (
                        <>
                          <Calendar className="mr-1 h-3.5 w-3.5" /> Connect
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConnectionStatusDashboard;
