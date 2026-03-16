import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar, CheckCircle2, XCircle, Loader2, ExternalLink, Unplug } from "lucide-react";
import { toast } from "sonner";
import { useATSStore } from "@/lib/ats-store";

const IntegrationsPage = () => {
  const { googleCalendarConnected, googleCalendarEmail, connectGoogleCalendar, disconnectGoogleCalendar } = useATSStore();
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    // Simulate OAuth flow
    await new Promise((r) => setTimeout(r, 1500));
    connectGoogleCalendar("recruiting@gostudent.com");
    setConnecting(false);
    toast.success("Google Calendar connected successfully!");
  };

  const handleDisconnect = () => {
    disconnectGoogleCalendar();
    toast.success("Google Calendar disconnected");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-foreground tracking-tight">Integrations</h1>
        <p className="text-sm text-muted-foreground mt-1">Connect external services to streamline your hiring workflow.</p>
      </div>

      <div className="grid gap-4">
        {/* Google Calendar */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center gap-5 p-6">
              {/* Icon */}
              <div className="h-14 w-14 rounded-xl bg-[hsl(var(--primary))]/10 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="3" fill="#4285F4" />
                  <rect x="5" y="9" width="14" height="1.5" rx="0.5" fill="white" />
                  <rect x="5" y="12.5" width="14" height="1.5" rx="0.5" fill="white" />
                  <rect x="5" y="16" width="8" height="1.5" rx="0.5" fill="white" />
                  <rect x="5" y="3" width="14" height="4" rx="1" fill="#1967D2" />
                  <circle cx="8" cy="5" r="0.8" fill="white" />
                  <circle cx="16" cy="5" r="0.8" fill="white" />
                </svg>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-foreground">Google Calendar</h3>
                  {googleCalendarConnected ? (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] px-1.5 py-0 font-semibold gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium gap-1">
                      <XCircle className="h-3 w-3" />
                      Not Connected
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sync interview schedules with Google Calendar. Automatically create events, send invites, and manage availability.
                </p>
                {googleCalendarConnected && googleCalendarEmail && (
                  <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    Connected as <span className="font-medium text-foreground">{googleCalendarEmail}</span>
                  </p>
                )}
              </div>

              {/* Action */}
              <div className="shrink-0">
                {googleCalendarConnected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                    onClick={handleDisconnect}
                  >
                    <Unplug className="h-3.5 w-3.5" />
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="text-xs gap-1.5"
                    onClick={handleConnect}
                    disabled={connecting}
                  >
                    {connecting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Connecting…
                      </>
                    ) : (
                      <>
                        <Calendar className="h-3.5 w-3.5" />
                        Connect Google Calendar
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Features */}
            {googleCalendarConnected && (
              <div className="border-t border-border px-6 py-4 bg-muted/30">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <Switch defaultChecked />
                    <div>
                      <p className="text-xs font-medium text-foreground">Auto-sync interviews</p>
                      <p className="text-[11px] text-muted-foreground">Create events automatically</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch defaultChecked />
                    <div>
                      <p className="text-xs font-medium text-foreground">Send invites</p>
                      <p className="text-[11px] text-muted-foreground">Email attendees on schedule</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch defaultChecked />
                    <div>
                      <p className="text-xs font-medium text-foreground">Google Meet links</p>
                      <p className="text-[11px] text-muted-foreground">Auto-generate meeting URLs</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coming Soon cards */}
        {[
          { name: "Microsoft Outlook", desc: "Sync with Outlook Calendar and Teams" },
          { name: "Zoom", desc: "Auto-create Zoom meeting links for interviews" },
          { name: "Slack", desc: "Get interview notifications and reminders in Slack" },
        ].map((item) => (
          <Card key={item.name} className="opacity-60">
            <CardContent className="flex items-center gap-5 p-6">
              <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Calendar className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-foreground">{item.name}</h3>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium">Coming Soon</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IntegrationsPage;
