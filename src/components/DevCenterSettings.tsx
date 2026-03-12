import { useState } from "react";
import {
  Globe, Linkedin, ExternalLink, Check, Copy, RefreshCw,
  Link2, Settings2, ChevronRight, Zap, Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

/* ── Types ─────────────────────────────────────────────────── */
interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  connected: boolean;
  url?: string;
  apiKey?: string;
  lastSync?: string;
}

const DevCenterSettings = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "career-page",
      name: "GoStudent Career Page",
      description: "Publish open roles directly to your branded career page",
      icon: Globe,
      color: "bg-primary/10 text-primary",
      connected: true,
      url: "https://careers.gostudent.com",
      lastSync: "2 min ago",
    },
    {
      id: "linkedin",
      name: "LinkedIn Jobs",
      description: "Automatically post and manage job listings on LinkedIn",
      icon: Linkedin,
      color: "bg-blue-500/10 text-blue-600",
      connected: true,
      apiKey: "lnkd_••••••••a3f2",
      lastSync: "15 min ago",
    },
    {
      id: "indeed",
      name: "Indeed",
      description: "Syndicate job postings to Indeed's job board network",
      icon: Globe,
      color: "bg-indigo-500/10 text-indigo-600",
      connected: false,
    },
    {
      id: "glassdoor",
      name: "Glassdoor",
      description: "Post jobs and manage your employer brand on Glassdoor",
      icon: Globe,
      color: "bg-emerald-500/10 text-emerald-600",
      connected: false,
    },
    {
      id: "stepstone",
      name: "StepStone",
      description: "Reach candidates across European job markets via StepStone",
      icon: Globe,
      color: "bg-orange-500/10 text-orange-600",
      connected: false,
    },
  ]);

  const [jobBoardUrl, setJobBoardUrl] = useState("https://careers.gostudent.com");
  const [autoPublish, setAutoPublish] = useState(true);
  const [xmlFeedEnabled, setXmlFeedEnabled] = useState(true);
  const xmlFeedUrl = "https://api.gostudent.com/jobs/feed.xml";

  const toggleConnection = (id: string) => {
    setIntegrations((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const newConnected = !i.connected;
        if (newConnected) {
          toast.success(`${i.name} connected`);
          return { ...i, connected: true, lastSync: "Just now" };
        } else {
          toast.success(`${i.name} disconnected`);
          return { ...i, connected: false, lastSync: undefined, apiKey: undefined };
        }
      })
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const connectedCount = integrations.filter((i) => i.connected).length;

  return (
    <div className="space-y-6">
      {/* Career page config */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Globe className="h-4.5 w-4.5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">Career Page</h3>
              <p className="text-[11px] text-muted-foreground">Configure your branded career page and job board settings</p>
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 text-[10px] gap-1">
              <Check className="h-3 w-3" /> Live
            </Badge>
          </div>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-[120px_1fr] items-center gap-3">
            <label className="text-xs font-medium text-foreground">Career Page URL</label>
            <div className="flex items-center gap-2">
              <Input value={jobBoardUrl} onChange={(e) => setJobBoardUrl(e.target.value)} className="h-8 text-xs flex-1" />
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
                <a href={jobBoardUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center gap-3">
            <label className="text-xs font-medium text-foreground">Auto-publish</label>
            <div className="flex items-center gap-2.5">
              <Switch checked={autoPublish} onCheckedChange={setAutoPublish} className="scale-75" />
              <span className="text-xs text-muted-foreground">Automatically publish new jobs to your career page</span>
            </div>
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center gap-3">
            <label className="text-xs font-medium text-foreground">XML Feed</label>
            <div className="flex items-center gap-2.5">
              <Switch checked={xmlFeedEnabled} onCheckedChange={setXmlFeedEnabled} className="scale-75" />
              <code className="text-[11px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded flex-1 truncate">{xmlFeedUrl}</code>
              <button onClick={() => copyToClipboard(xmlFeedUrl)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Talent Acquisition Channels</h3>
            <p className="text-[11px] text-muted-foreground">{connectedCount} of {integrations.length} channels connected</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <div key={integration.id} className="flex items-center gap-4 px-5 py-4">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${integration.color}`}>
                  {integration.id === "linkedin" ? (
                    <Linkedin className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-foreground">{integration.name}</p>
                    {integration.connected && (
                      <Badge variant="secondary" className="text-[10px] gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
                        <Check className="h-2.5 w-2.5" /> Connected
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{integration.description}</p>
                  {integration.connected && integration.lastSync && (
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5 flex items-center gap-1">
                      <RefreshCw className="h-2.5 w-2.5" /> Last synced {integration.lastSync}
                      {integration.apiKey && (
                        <span className="ml-2">· Key: <code className="font-mono">{integration.apiKey}</code></span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {integration.connected ? (
                    <>
                      <Button variant="ghost" size="sm" className="text-xs h-8 gap-1" onClick={() => toast.info(`${integration.name} settings`)}>
                        <Settings2 className="h-3.5 w-3.5" /> Configure
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs h-8 text-destructive" onClick={() => toggleConnection(integration.id)}>
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" className="text-xs h-8 gap-1" onClick={() => toggleConnection(integration.id)}>
                      <Zap className="h-3.5 w-3.5" /> Connect
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* API & Webhooks */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
              <Code className="h-4.5 w-4.5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">API & Webhooks</h3>
              <p className="text-[11px] text-muted-foreground">Access the API for custom integrations and webhook events</p>
            </div>
          </div>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="grid grid-cols-[120px_1fr] items-center gap-3">
            <label className="text-xs font-medium text-foreground">API Key</label>
            <div className="flex items-center gap-2">
              <code className="text-[11px] text-muted-foreground font-mono bg-muted px-2 py-1 rounded flex-1 truncate">gs_live_••••••••••••k8m2</code>
              <button onClick={() => copyToClipboard("gs_live_xxxxxxxxxxk8m2")} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center gap-3">
            <label className="text-xs font-medium text-foreground">Webhook URL</label>
            <div className="flex items-center gap-2">
              <code className="text-[11px] text-muted-foreground font-mono bg-muted px-2 py-1 rounded flex-1 truncate">https://api.gostudent.com/webhooks/ats</code>
              <button onClick={() => copyToClipboard("https://api.gostudent.com/webhooks/ats")} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="pt-1">
            <button className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
              View API documentation <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevCenterSettings;
