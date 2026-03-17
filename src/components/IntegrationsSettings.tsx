import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Calendar, CheckCircle2, XCircle, Loader2, Unplug } from "lucide-react";
import { toast } from "sonner";
import { useATSStore } from "@/lib/ats-store";

const IntegrationsSettings = () => {
  const { googleCalendarConnected, googleCalendarEmail, connectGoogleCalendar, disconnectGoogleCalendar } = useATSStore();
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
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
    <div className="space-y-4">
      {/* Google Calendar */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-5 p-5">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="3" fill="#4285F4" />
              <rect x="5" y="9" width="14" height="1.5" rx="0.5" fill="white" />
              <rect x="5" y="12.5" width="14" height="1.5" rx="0.5" fill="white" />
              <rect x="5" y="16" width="8" height="1.5" rx="0.5" fill="white" />
              <rect x="5" y="3" width="14" height="4" rx="1" fill="#1967D2" />
              <circle cx="8" cy="5" r="0.8" fill="white" />
              <circle cx="16" cy="5" r="0.8" fill="white" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm font-semibold text-foreground">Google Calendar</h3>
              {googleCalendarConnected ? (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 text-[10px] gap-1">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px] gap-1">
                  <XCircle className="h-2.5 w-2.5" /> Not Connected
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Sync interview schedules, create events, send invites, and manage availability.
            </p>
            {googleCalendarConnected && googleCalendarEmail && (
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <Calendar className="h-2.5 w-2.5" />
                Connected as <span className="font-medium text-foreground">{googleCalendarEmail}</span>
              </p>
            )}
          </div>
          <div className="shrink-0">
            {googleCalendarConnected ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8 text-destructive"
                onClick={handleDisconnect}
              >
                <Unplug className="h-3.5 w-3.5 mr-1" />
                Disconnect
              </Button>
            ) : (
              <Button size="sm" className="text-xs h-8" onClick={handleConnect} disabled={connecting}>
                {connecting ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> Connecting…</>
                ) : (
                  <><Calendar className="h-3.5 w-3.5 mr-1" /> Connect</>
                )}
              </Button>
            )}
          </div>
        </div>

        {googleCalendarConnected && (
          <div className="border-t border-border px-5 py-3.5 bg-muted/30">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Auto-sync interviews", desc: "Create events automatically" },
                { label: "Send invites", desc: "Email attendees on schedule" },
                { label: "Google Meet links", desc: "Auto-generate meeting URLs" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2.5">
                  <Switch defaultChecked className="scale-75" />
                  <div>
                    <p className="text-xs font-medium text-foreground">{f.label}</p>
                    <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Coming Soon */}
      {[
        { name: "Microsoft Outlook", desc: "Sync with Outlook Calendar and Teams" },
        { name: "Zoom", desc: "Auto-create Zoom meeting links for interviews" },
        { name: "Slack", desc: "Get interview notifications and reminders in Slack" },
      ].map((item) => (
        <div key={item.name} className="rounded-xl border border-border bg-card overflow-hidden opacity-60">
          <div className="flex items-center gap-5 p-5">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <Calendar className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-sm font-semibold text-foreground">{item.name}</h3>
                <Badge variant="outline" className="text-[10px]">Coming Soon</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IntegrationsSettings;
