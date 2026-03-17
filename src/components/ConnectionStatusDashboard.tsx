import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, RefreshCw, Calendar, Mail, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
    color: "text-blue-600",
  },
  {
    key: "gmail",
    label: "Gmail",
    description: "Send and receive candidate emails",
    icon: Mail,
    color: "text-red-500",
  },
  {
    key: "gostudent_sso",
    label: "GoStudent SSO",
    description: "Single sign-on authentication",
    icon: Shield,
    color: "text-primary",
  },
];

const ConnectionStatusDashboard = () => {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<IntegrationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIntegrations = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("integrations")
      .select("*")
      .eq("user_id", user.id);
    setIntegrations((data as IntegrationRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchIntegrations();
  }, [user]);

  const getIntegration = (provider: string) =>
    integrations.find((i) => i.provider === provider);

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-muted-foreground">
          {integrations.length} of {PROVIDERS.length} services connected
        </p>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5" onClick={fetchIntegrations}>
          <RefreshCw className="h-3 w-3" /> Refresh
        </Button>
      </div>

      {PROVIDERS.map((provider) => {
        const integration = getIntegration(provider.key);
        const connected = !!integration;
        const expired = connected && isExpired(integration.expires_at);

        return (
          <div key={provider.key} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-4 p-4">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <provider.icon className={`h-5 w-5 ${provider.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-semibold text-foreground">{provider.label}</h3>
                  {connected && !expired && (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 text-[10px] gap-1">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Connected
                    </Badge>
                  )}
                  {connected && expired && (
                    <Badge variant="destructive" className="text-[10px] gap-1">
                      <XCircle className="h-2.5 w-2.5" /> Expired
                    </Badge>
                  )}
                  {!connected && (
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      <XCircle className="h-2.5 w-2.5" /> Not Connected
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{provider.description}</p>
                {integration?.connected_email && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Connected as <span className="font-medium text-foreground">{integration.connected_email}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConnectionStatusDashboard;
