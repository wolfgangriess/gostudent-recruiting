import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Mail, Shield, Calendar, Link2, Plus, X,
  Check, ExternalLink, Users as UsersIcon, Clock, Video,
  KeyRound, FileText, CheckSquare, Code, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useATSStore } from "@/lib/ats-store";
import { toast } from "sonner";
import EmailTemplatesSettings from "@/components/EmailTemplatesSettings";
import DocumentTemplatesSettings from "@/components/DocumentTemplatesSettings";

type PermissionLevel = "basic" | "hiring_manager" | "hiring_manager_visibility" | "site_admin";

interface UserPermission {
  userId: string;
  permissions: PermissionLevel[];
}

const PERMISSION_LABELS: { key: PermissionLevel; label: string; description: string }[] = [
  { key: "basic", label: "Basic", description: "View jobs & candidates" },
  { key: "hiring_manager", label: "Hiring Manager", description: "Manage assigned jobs" },
  { key: "hiring_manager_visibility", label: "HM Visibility", description: "See all HM data" },
  { key: "site_admin", label: "Site Admin", description: "Full system access" },
];

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
  const [userSearch, setUserSearch] = useState("");
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>(() =>
    users.map((u) => ({
      userId: u.id,
      permissions: u.role === "admin" ? ["basic", "site_admin"] : u.role === "hiring_manager" ? ["basic", "hiring_manager"] : ["basic"],
    }))
  );

  const filteredSettingsUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.toLowerCase();
    return users.filter(
      (u) =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  const toggleUserPermission = (userId: string, perm: PermissionLevel) => {
    setUserPermissions((prev) =>
      prev.map((up) => {
        if (up.userId !== userId) return up;
        const has = up.permissions.includes(perm);
        const updated = has ? up.permissions.filter((p) => p !== perm) : [...up.permissions, perm];
        return { ...up, permissions: updated };
      })
    );
    toast.success("Permission updated");
  };

  const getUserPermissions = (userId: string) =>
    userPermissions.find((up) => up.userId === userId)?.permissions || [];
  const [activeSection, setActiveSection] = useState<SectionId>("menu");

  // Permission policies state
  const [policySettings, setPolicySettings] = useState({
    candidates_rejection_reason_required: true,
    candidates_private_on_hire: true,
    candidates_resume_required: true,
    candidates_source_required: true,
    candidates_credit_required: false,
    referrals_email_required: true,
    referrals_phone_required: false,
    referrals_social_required: false,
    referrals_resume_required: true,
    referrals_internal_name: false,
    scheduling_self_reschedule: true,
    scheduling_calendar_events: false,
    jobs_reapproval: true,
    jobs_talent_filter: true,
    jobs_talent_filter_threshold: 250,
    jobs_office_required: true,
    jobs_department_required: true,
    jobs_requisition_required: true,
    jobs_opening_required: true,
    jobs_allow_empty_required: false,
    jobs_close_reason_required: true,
    users_coordinator_notify: true,
  });

  const togglePolicy = (key: keyof typeof policySettings) => {
    setPolicySettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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

          {/* Search */}
          <div className="border-b border-border px-5 py-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name, email, or department…"
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[1fr_90px_90px_90px_90px] items-center gap-1 px-5 py-2.5 bg-muted/30 border-b border-border">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Employee</span>
            {PERMISSION_LABELS.map((p) => (
              <span key={p.key} className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide text-center" title={p.description}>
                {p.label}
              </span>
            ))}
          </div>

          {/* User rows */}
          <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
            {filteredSettingsUsers.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <UsersIcon className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No employees match your search</p>
              </div>
            ) : (
              filteredSettingsUsers.map((u) => {
                const perms = getUserPermissions(u.id);
                return (
                  <div key={u.id} className="grid grid-cols-[1fr_90px_90px_90px_90px] items-center gap-1 px-5 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                        {u.firstName[0]}{u.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{u.firstName} {u.lastName}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                      </div>
                    </div>
                    {PERMISSION_LABELS.map((p) => (
                      <div key={p.key} className="flex justify-center">
                        <Checkbox
                          checked={perms.includes(p.key)}
                          onCheckedChange={() => toggleUserPermission(u.id, p.key)}
                        />
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-border px-5 py-2.5 bg-muted/20">
            <p className="text-[10px] text-muted-foreground">{filteredSettingsUsers.length} of {users.length} employees shown</p>
          </div>
        </div>
      )}

      {activeSection === "permissions" && (
        <div className="space-y-6">
          {/* Candidates */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Candidates</h3>
            <div className="space-y-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox checked={policySettings.candidates_rejection_reason_required} onCheckedChange={() => togglePolicy("candidates_rejection_reason_required")} />
                <span className="text-sm text-foreground">When rejecting a candidate, make "Rejection Reason" a required field</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox checked={policySettings.candidates_private_on_hire} onCheckedChange={() => togglePolicy("candidates_private_on_hire")} />
                <span className="text-sm text-foreground">When hiring, make candidates private by default</span>
              </label>
            </div>
            <p className="text-xs text-muted-foreground mt-3 mb-1.5">When creating a candidate…</p>
            <div className="space-y-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox checked={policySettings.candidates_resume_required} onCheckedChange={() => togglePolicy("candidates_resume_required")} />
                <span className="text-sm text-foreground">Make "Resume" a required field</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox checked={policySettings.candidates_source_required} onCheckedChange={() => togglePolicy("candidates_source_required")} />
                <span className="text-sm text-foreground">Make "Source" a required field</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox checked={policySettings.candidates_credit_required} onCheckedChange={() => togglePolicy("candidates_credit_required")} />
                <span className="text-sm text-foreground">Make "Who Gets Credit" a required field</span>
              </label>
            </div>
          </div>

          <hr className="border-border" />

          {/* Referrals */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1.5">Referrals</h3>
            <p className="text-xs text-muted-foreground mb-2.5">When submitting a referral…</p>
            <div className="space-y-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox checked={policySettings.referrals_email_required} onCheckedChange={() => togglePolicy("referrals_email_required")} />
                <span className="text-sm text-foreground">Make "Email" a required field</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox checked={policySettings.referrals_phone_required} onCheckedChange={() => togglePolicy("referrals_phone_required")} />
                <span className="text-sm text-foreground">Make "Phone Number" a required field</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox checked={policySettings.referrals_social_required} onCheckedChange={() => togglePolicy("referrals_social_required")} />
                <span className="text-sm text-foreground">Make "Social Media" a required field</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox checked={policySettings.referrals_resume_required} onCheckedChange={() => togglePolicy("referrals_resume_required")} />
                <span className="text-sm text-foreground">Make "Resume" a required field</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox checked={policySettings.referrals_internal_name} onCheckedChange={() => togglePolicy("referrals_internal_name")} />
                <span className="text-sm text-foreground">Display the internal job name instead of the primary job post name</span>
              </label>
            </div>
          </div>

          <hr className="border-border" />

          {/* Scheduling */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Scheduling</h3>
            <div className="space-y-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox checked={policySettings.scheduling_self_reschedule} onCheckedChange={() => togglePolicy("scheduling_self_reschedule")} />
                <span className="text-sm text-foreground">Allow candidates to reschedule self-scheduled interviews</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox checked={policySettings.scheduling_calendar_events} onCheckedChange={() => togglePolicy("scheduling_calendar_events")} />
                <span className="text-sm text-foreground">Send candidate calendar events via connected calendar integration</span>
              </label>
            </div>
          </div>

          <hr className="border-border" />

          {/* Jobs */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Jobs</h3>
            <div className="space-y-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox checked={policySettings.jobs_reapproval} onCheckedChange={() => togglePolicy("jobs_reapproval")} />
                <span className="text-sm text-foreground">Reopening a job with approvals should require reapproval</span>
              </label>
              <div className="flex items-center gap-2.5">
                <Checkbox checked={policySettings.jobs_talent_filter} onCheckedChange={() => togglePolicy("jobs_talent_filter")} />
                <span className="text-sm text-foreground">
                  Display the talent filtering step during application review when the number of candidates meets or exceeds{" "}
                  <Input
                    type="number"
                    value={policySettings.jobs_talent_filter_threshold}
                    onChange={(e) => setPolicySettings((prev) => ({ ...prev, jobs_talent_filter_threshold: Number(e.target.value) }))}
                    className="inline-block w-16 h-6 text-xs px-1.5 mx-1"
                  />
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 mb-1.5">When creating a job…</p>
            <div className="space-y-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox checked={policySettings.jobs_office_required} onCheckedChange={() => togglePolicy("jobs_office_required")} />
                <span className="text-sm text-foreground">Make "Office" a required field</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox checked={policySettings.jobs_department_required} onCheckedChange={() => togglePolicy("jobs_department_required")} />
                <span className="text-sm text-foreground">Make "Department" a required field</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox checked={policySettings.jobs_requisition_required} onCheckedChange={() => togglePolicy("jobs_requisition_required")} />
                <span className="text-sm text-foreground">Make "Requisition ID" a required field</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox checked={policySettings.jobs_opening_required} onCheckedChange={() => togglePolicy("jobs_opening_required")} />
                <span className="text-sm text-foreground">Make "Opening ID" a required field</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox checked={policySettings.jobs_allow_empty_required} onCheckedChange={() => togglePolicy("jobs_allow_empty_required")} />
                <span className="text-sm text-foreground">Allow empty required fields in template jobs</span>
              </label>
            </div>
            <p className="text-xs text-muted-foreground mt-3 mb-1.5">When closing a job…</p>
            <div className="space-y-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox checked={policySettings.jobs_close_reason_required} onCheckedChange={() => togglePolicy("jobs_close_reason_required")} />
                <span className="text-sm text-foreground">Make "Close Reason" a required field on jobs and openings</span>
              </label>
            </div>
          </div>

          <hr className="border-border" />

          {/* Users */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Users</h3>
            <div className="space-y-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox checked={policySettings.users_coordinator_notify} onCheckedChange={() => togglePolicy("users_coordinator_notify")} />
                <span className="text-sm text-foreground">Coordinators should be notified when their candidates submit interview availability</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {activeSection === "email-templates" && (
        <EmailTemplatesSettings />
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
