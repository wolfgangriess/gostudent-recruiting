import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Mail, Shield, Calendar, Link2, Plus, X,
  Check, ExternalLink, Users as UsersIcon, Clock, Video,
  KeyRound, FileText, CheckSquare, Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useATSStore } from "@/lib/ats-store";
import { toast } from "sonner";

/* ── Types ────────────────────────────────────────────────────────── */
interface EmailPermission {
  userId: string;
  canSendOffers: boolean;
  canSendRejections: boolean;
  canSendScheduling: boolean;
}

type SectionId =
  | "menu"
  | "users"
  | "permissions"
  | "email-templates"
  | "documents"
  | "approvals"
  | "dev-center"
  | "email"
  | "availability"
  | "meetings";

const settingsMenu: { id: SectionId; label: string; description: string; icon: React.ElementType }[] = [
  { id: "users", label: "Users", description: "Manage your team members, or invite new users", icon: UsersIcon },
  { id: "permissions", label: "Permission Policies", description: "Manage permission policies for your entire organization", icon: KeyRound },
  { id: "email", label: "Email Permissions", description: "Control who can send emails to candidates", icon: Mail },
  { id: "email-templates", label: "Email Templates", description: "Configure your email templates", icon: Mail },
  { id: "documents", label: "Documents", description: "Configure offer templates and e-signature agreements", icon: FileText },
  { id: "availability", label: "Interview Availability", description: "Connect Google Calendar and set interview availability", icon: Clock },
  { id: "meetings", label: "Meeting Links", description: "Generate shareable meeting links for interviews", icon: Video },
  { id: "approvals", label: "Approvals", description: "Manage default approval workflows", icon: CheckSquare },
  { id: "dev-center", label: "Dev Center", description: "Configure your job board, development resources", icon: Code },
];

const SettingsPage = () => {
  const { users } = useATSStore();
  const [activeSection, setActiveSection] = useState<SectionId>("menu");

  // Email permissions state
  const [emailPermissions, setEmailPermissions] = useState<EmailPermission[]>([
    { userId: "user-1", canSendOffers: true, canSendRejections: true, canSendScheduling: true },
    { userId: "user-2", canSendOffers: true, canSendRejections: false, canSendScheduling: true },
  ]);
  const [addingUser, setAddingUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  // Calendar state
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState([
    { day: "Monday", start: "09:00", end: "17:00", enabled: true },
    { day: "Tuesday", start: "09:00", end: "17:00", enabled: true },
    { day: "Wednesday", start: "09:00", end: "17:00", enabled: true },
    { day: "Thursday", start: "09:00", end: "17:00", enabled: true },
    { day: "Friday", start: "09:00", end: "17:00", enabled: true },
    { day: "Saturday", start: "09:00", end: "13:00", enabled: false },
    { day: "Sunday", start: "09:00", end: "13:00", enabled: false },
  ]);

  // Meeting links state
  const [meetingCalendarConnected, setMeetingCalendarConnected] = useState(false);
  const [defaultDuration, setDefaultDuration] = useState("30");
  const [meetingLinks, setMeetingLinks] = useState<{ id: string; name: string; duration: string; link: string }[]>([]);

  const availableUsersForEmail = users.filter(
    (u) => !emailPermissions.some((ep) => ep.userId === u.id)
  );

  const addEmailPermission = () => {
    if (!selectedUserId) return;
    setEmailPermissions((prev) => [
      ...prev,
      { userId: selectedUserId, canSendOffers: false, canSendRejections: false, canSendScheduling: true },
    ]);
    setSelectedUserId("");
    setAddingUser(false);
    toast.success("User added to email permissions");
  };

  const togglePermission = (userId: string, field: keyof Omit<EmailPermission, "userId">) => {
    setEmailPermissions((prev) =>
      prev.map((ep) => (ep.userId === userId ? { ...ep, [field]: !ep[field] } : ep))
    );
  };

  const removePermission = (userId: string) => {
    setEmailPermissions((prev) => prev.filter((ep) => ep.userId !== userId));
    toast.success("Permission removed");
  };

  const handleConnectCalendar = (type: "availability" | "meetings") => {
    if (type === "availability") {
      setCalendarConnected(true);
      toast.success("Google Calendar connected for availability");
    } else {
      setMeetingCalendarConnected(true);
      toast.success("Google Calendar connected for meeting links");
    }
  };

  const generateMeetingLink = () => {
    const newLink = {
      id: `link-${Date.now()}`,
      name: `Interview - ${defaultDuration} min`,
      duration: defaultDuration,
      link: `https://meet.google.com/${Math.random().toString(36).substring(2, 10)}`,
    };
    setMeetingLinks((prev) => [...prev, newLink]);
    toast.success("Meeting link generated");
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard");
  };

  const currentMenuLabel = settingsMenu.find((m) => m.id === activeSection)?.label;

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {activeSection === "menu" ? (
          <Link to="/overview" className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <button onClick={() => setActiveSection("menu")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        <div>
          <h1 className="text-lg font-bold text-foreground">
            {activeSection === "menu" ? "Settings" : currentMenuLabel}
          </h1>
          {activeSection === "menu" && (
            <p className="text-xs text-muted-foreground">Manage your account, permissions, and integrations</p>
          )}
        </div>
      </div>

      {/* ── Settings Menu ─────────────────────────────────────────── */}
      {activeSection === "menu" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
          {settingsMenu.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className="flex items-center gap-4 w-full text-left px-5 py-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            );
          })}
        </div>
      )}

      {/* ── Placeholder sections ──────────────────────────────────── */}
      {activeSection === "users" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-5 py-3.5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Team Members</h3>
            <Button size="sm" variant="outline" className="text-xs h-8 gap-1">
              <Plus className="h-3 w-3" /> Invite user
            </Button>
          </div>
          <div className="divide-y divide-border">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                    {u.firstName[0]}{u.lastName[0]}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{u.firstName} {u.lastName}</p>
                    <p className="text-[10px] text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] capitalize">{u.role.replace("_", " ")}</Badge>
                  <span className="text-[10px] text-muted-foreground">{u.department}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === "permissions" && (
        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-3">
          <KeyRound className="h-8 w-8 text-muted-foreground/40 mx-auto" />
          <p className="text-sm font-medium text-foreground">Permission Policies</p>
          <p className="text-xs text-muted-foreground">Configure role-based access control for your organization.<br />Admin, Hiring Manager, and Employee roles are supported.</p>
        </div>
      )}

      {activeSection === "email-templates" && (
        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-3">
          <Mail className="h-8 w-8 text-muted-foreground/40 mx-auto" />
          <p className="text-sm font-medium text-foreground">Email Templates</p>
          <p className="text-xs text-muted-foreground">Configure templates for offer letters, rejections, and scheduling emails.</p>
        </div>
      )}

      {activeSection === "documents" && (
        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-3">
          <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto" />
          <p className="text-sm font-medium text-foreground">Documents</p>
          <p className="text-xs text-muted-foreground">Configure offer templates and e-signature agreements for your entire organization.</p>
        </div>
      )}

      {activeSection === "approvals" && (
        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-3">
          <CheckSquare className="h-8 w-8 text-muted-foreground/40 mx-auto" />
          <p className="text-sm font-medium text-foreground">Approvals</p>
          <p className="text-xs text-muted-foreground">Manage default approval workflows for offers and job requisitions.</p>
        </div>
      )}

      {activeSection === "dev-center" && (
        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-3">
          <Code className="h-8 w-8 text-muted-foreground/40 mx-auto" />
          <p className="text-sm font-medium text-foreground">Dev Center</p>
          <p className="text-xs text-muted-foreground">Configure your job board and development resources.</p>
        </div>
      )}

      {/* ── Email Permissions ─────────────────────────────────────── */}
      {activeSection === "email" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Email Sending Permissions</h3>
                  <p className="text-[11px] text-muted-foreground">Control who can send emails to candidates on behalf of the team</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="text-xs h-8 gap-1" onClick={() => setAddingUser(true)}>
                <Plus className="h-3 w-3" /> Add person
              </Button>
            </div>

            {addingUser && (
              <div className="flex items-center gap-3 border-b border-border bg-muted/20 px-5 py-3">
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="h-8 text-xs w-52">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsersForEmail.map((u) => (
                      <SelectItem key={u.id} value={u.id} className="text-xs">
                        {u.firstName} {u.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" className="h-8 text-xs" onClick={addEmailPermission} disabled={!selectedUserId}>Add</Button>
                <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setAddingUser(false)}>Cancel</Button>
              </div>
            )}

            <div className="divide-y divide-border">
              <div className="grid grid-cols-[1fr_100px_100px_100px_40px] items-center gap-2 px-5 py-2.5 bg-muted/30">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Person</span>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide text-center">Offers</span>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide text-center">Rejections</span>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide text-center">Scheduling</span>
                <span />
              </div>
              {emailPermissions.map((ep) => {
                const user = users.find((u) => u.id === ep.userId);
                if (!user) return null;
                return (
                  <div key={ep.userId} className="grid grid-cols-[1fr_100px_100px_100px_40px] items-center gap-2 px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">{user.firstName} {user.lastName}</p>
                        <p className="text-[10px] text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex justify-center"><Switch checked={ep.canSendOffers} onCheckedChange={() => togglePermission(ep.userId, "canSendOffers")} className="scale-75" /></div>
                    <div className="flex justify-center"><Switch checked={ep.canSendRejections} onCheckedChange={() => togglePermission(ep.userId, "canSendRejections")} className="scale-75" /></div>
                    <div className="flex justify-center"><Switch checked={ep.canSendScheduling} onCheckedChange={() => togglePermission(ep.userId, "canSendScheduling")} className="scale-75" /></div>
                    <div className="flex justify-center">
                      <button onClick={() => removePermission(ep.userId)} className="text-muted-foreground hover:text-destructive transition-colors"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                );
              })}
              {emailPermissions.length === 0 && (
                <div className="px-5 py-8 text-center">
                  <UsersIcon className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No email permissions configured yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Interview Availability ────────────────────────────────── */}
      {activeSection === "availability" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${calendarConnected ? "bg-green-600/10" : "bg-muted"}`}>
                  <Calendar className={`h-4.5 w-4.5 ${calendarConnected ? "text-green-600" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Google Calendar</h3>
                  <p className="text-[11px] text-muted-foreground">
                    {calendarConnected ? "Connected — your availability syncs automatically" : "Connect to sync your availability for interview scheduling"}
                  </p>
                </div>
              </div>
              {calendarConnected ? (
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-600/10 text-green-700 border-green-600/20 text-[10px] gap-1"><Check className="h-3 w-3" /> Connected</Badge>
                  <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground" onClick={() => setCalendarConnected(false)}>Disconnect</Button>
                </div>
              ) : (
                <Button size="sm" className="text-xs h-8 gap-1.5" onClick={() => handleConnectCalendar("availability")}>
                  <Calendar className="h-3.5 w-3.5" /> Connect Google Calendar
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border px-5 py-3.5">
              <h3 className="text-sm font-semibold text-foreground">Weekly Availability</h3>
              <p className="text-[11px] text-muted-foreground">Set your default interview availability windows</p>
            </div>
            <div className="divide-y divide-border">
              {availabilitySlots.map((slot, idx) => (
                <div key={slot.day} className="flex items-center gap-4 px-5 py-3">
                  <div className="w-24">
                    <span className={`text-xs font-medium ${slot.enabled ? "text-foreground" : "text-muted-foreground"}`}>{slot.day}</span>
                  </div>
                  <Switch checked={slot.enabled} onCheckedChange={(checked) => setAvailabilitySlots((prev) => prev.map((s, i) => (i === idx ? { ...s, enabled: checked } : s)))} className="scale-75" />
                  {slot.enabled ? (
                    <div className="flex items-center gap-2">
                      <Input type="time" value={slot.start} onChange={(e) => setAvailabilitySlots((prev) => prev.map((s, i) => (i === idx ? { ...s, start: e.target.value } : s)))} className="h-8 text-xs w-28" />
                      <span className="text-xs text-muted-foreground">to</span>
                      <Input type="time" value={slot.end} onChange={(e) => setAvailabilitySlots((prev) => prev.map((s, i) => (i === idx ? { ...s, end: e.target.value } : s)))} className="h-8 text-xs w-28" />
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">Unavailable</span>
                  )}
                </div>
              ))}
            </div>
            <div className="border-t border-border px-5 py-3 flex justify-end">
              <Button size="sm" className="text-xs h-8" onClick={() => toast.success("Availability saved")}>Save availability</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Meeting Links ─────────────────────────────────────────── */}
      {activeSection === "meetings" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${meetingCalendarConnected ? "bg-green-600/10" : "bg-muted"}`}>
                  <Video className={`h-4.5 w-4.5 ${meetingCalendarConnected ? "text-green-600" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Google Calendar for Meetings</h3>
                  <p className="text-[11px] text-muted-foreground">
                    {meetingCalendarConnected ? "Connected — you can generate Google Meet links" : "Connect to generate shareable Google Meet links for interviews"}
                  </p>
                </div>
              </div>
              {meetingCalendarConnected ? (
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-600/10 text-green-700 border-green-600/20 text-[10px] gap-1"><Check className="h-3 w-3" /> Connected</Badge>
                  <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground" onClick={() => setMeetingCalendarConnected(false)}>Disconnect</Button>
                </div>
              ) : (
                <Button size="sm" className="text-xs h-8 gap-1.5" onClick={() => handleConnectCalendar("meetings")}>
                  <Video className="h-3.5 w-3.5" /> Connect Google Calendar
                </Button>
              )}
            </div>
          </div>

          {meetingCalendarConnected && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="border-b border-border px-5 py-3.5">
                <h3 className="text-sm font-semibold text-foreground">Generate Meeting Link</h3>
                <p className="text-[11px] text-muted-foreground">Create shareable Google Meet links for interviews</p>
              </div>
              <div className="px-5 py-4 flex items-end gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Duration</label>
                  <Select value={defaultDuration} onValueChange={setDefaultDuration}>
                    <SelectTrigger className="h-8 text-xs w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button size="sm" className="text-xs h-8 gap-1.5" onClick={generateMeetingLink}>
                  <Link2 className="h-3.5 w-3.5" /> Generate link
                </Button>
              </div>
              {meetingLinks.length > 0 && (
                <div className="border-t border-border divide-y divide-border">
                  {meetingLinks.map((ml) => (
                    <div key={ml.id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Video className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs font-medium text-foreground">{ml.name}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{ml.link}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={() => copyLink(ml.link)}>
                          <Link2 className="h-3 w-3" /> Copy
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" asChild>
                          <a href={ml.link} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a>
                        </Button>
                        <button onClick={() => setMeetingLinks((prev) => prev.filter((l) => l.id !== ml.id))} className="text-muted-foreground hover:text-destructive transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!meetingCalendarConnected && (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
              <Video className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Connect Google Calendar to start generating meeting links</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
