import { useState } from "react";
import {
  Plus, X, Search, ChevronLeft, Pencil, Copy, Trash2, Mail,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Code, Link2, Image, Braces, Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

/* ── Types ─────────────────────────────────────────────────── */
interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  fromAddress: string;
  ccRecruiter: boolean;
  ccCoordinator: boolean;
  subject: string;
  body: string;
  updatedAt: string;
}

const TEMPLATE_TYPES = [
  "Candidate Rejection",
  "Candidate Offer",
  "Interview Scheduling",
  "Interview Reminder",
  "Application Received",
  "Referral Acknowledgement",
  "Custom",
];

const PLACEHOLDERS = [
  "CANDIDATE_FIRST_NAME", "CANDIDATE_LAST_NAME", "CANDIDATE_NAME",
  "PREFERRED_FULL_NAME", "PREFERRED_FIRST_NAME", "JOB_NAME",
  "SOURCE", "OFFICE", "TODAY_DATE", "RECRUITER", "COORDINATOR",
  "COMPANY", "MY_EMAIL_ADDRESS", "MY_FULL_NAME", "MY_FIRST_NAME",
  "MY_JOB_TITLE", "MY_SIGNATURE",
];

const JOB_TOKENS = ["WORK_SCHEDULE", "REPORTS_TO", "WORKER_TYPES"];
const APP_TOKENS = ["LOCATION_OF_HIRE"];

const initialTemplates: EmailTemplate[] = [
  {
    id: "tpl-1",
    name: "Candidate Rejection - After CV Screening",
    type: "Candidate Rejection",
    description: "This template is sent to candidates when you reject them from a job.",
    fromAddress: "{{MY_EMAIL_ADDRESS}}",
    ccRecruiter: false,
    ccCoordinator: false,
    subject: "GoStudent | Your Application Update",
    body: `Hi {{CANDIDATE_FIRST_NAME}},

I hope this email finds you well.

Thank you for taking the time to apply for the role {{JOB_NAME}}.

After carefully reviewing all applicants in conjunction with our hiring team, while we were impressed with your qualifications and experience, we regret to inform you that we have decided to proceed with other candidates whose profiles more closely align with our current requirements.

However, we want to be clear that this isn't a firm 'no' – it's merely a 'not now'. We will certainly have other opportunities in the future that could be a match for your skills and experience.

We wish you well with your future endeavors and look forward to hearing from you again in the future.

Best Regards,
Your GoStudent Recruiting Team`,
    updatedAt: "2024-05-15",
  },
  {
    id: "tpl-2",
    name: "Interview Invitation",
    type: "Interview Scheduling",
    description: "Sent when scheduling an interview with a candidate.",
    fromAddress: "{{MY_EMAIL_ADDRESS}}",
    ccRecruiter: true,
    ccCoordinator: false,
    subject: "GoStudent | Interview Invitation for {{JOB_NAME}}",
    body: `Hi {{CANDIDATE_FIRST_NAME}},

We are excited to invite you for an interview for the {{JOB_NAME}} position at {{COMPANY}}.

Please let us know your availability and we will schedule a time that works best.

Best Regards,
{{MY_FULL_NAME}}`,
    updatedAt: "2024-06-01",
  },
  {
    id: "tpl-3",
    name: "Application Received Confirmation",
    type: "Application Received",
    description: "Auto-sent when a candidate applies to acknowledge receipt.",
    fromAddress: "recruiting@gostudent.com",
    ccRecruiter: false,
    ccCoordinator: false,
    subject: "GoStudent | We received your application",
    body: `Hi {{CANDIDATE_FIRST_NAME}},

Thank you for your interest in {{JOB_NAME}} at {{COMPANY}}. We have received your application and our team is reviewing it.

We will be in touch soon with next steps.

Best Regards,
The GoStudent Recruiting Team`,
    updatedAt: "2024-04-20",
  },
];

/* ── Component ─────────────────────────────────────────────── */
const EmailTemplatesSettings = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialTemplates);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [isNew, setIsNew] = useState(false);

  /* filtered list */
  const filtered = templates.filter((t) => {
    if (filterType !== "all" && t.type !== filterType) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.type.toLowerCase().includes(q);
  });

  const openNew = () => {
    setEditing({
      id: `tpl-${Date.now()}`,
      name: "",
      type: "Custom",
      description: "",
      fromAddress: "{{MY_EMAIL_ADDRESS}}",
      ccRecruiter: false,
      ccCoordinator: false,
      subject: "",
      body: "",
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    setIsNew(true);
  };

  const openEdit = (tpl: EmailTemplate) => {
    setEditing({ ...tpl });
    setIsNew(false);
  };

  const duplicate = (tpl: EmailTemplate) => {
    const copy: EmailTemplate = {
      ...tpl,
      id: `tpl-${Date.now()}`,
      name: `${tpl.name} (Copy)`,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setTemplates((prev) => [copy, ...prev]);
    toast.success("Template duplicated");
  };

  const remove = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast.success("Template deleted");
  };

  const save = () => {
    if (!editing) return;
    if (!editing.name.trim() || !editing.subject.trim()) {
      toast.error("Template name and subject are required");
      return;
    }
    if (isNew) {
      setTemplates((prev) => [editing, ...prev]);
      toast.success("Template created");
    } else {
      setTemplates((prev) =>
        prev.map((t) => (t.id === editing.id ? { ...editing, updatedAt: new Date().toISOString().slice(0, 10) } : t))
      );
      toast.success("Template saved");
    }
    setEditing(null);
    setIsNew(false);
  };

  const insertToken = (token: string) => {
    if (!editing) return;
    setEditing({ ...editing, body: editing.body + `{{${token}}}` });
  };

  /* ── Editor view ─────────────────────────────────────────── */
  if (editing) {
    return (
      <div className="space-y-5">
        <button
          onClick={() => { setEditing(null); setIsNew(false); }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to templates
        </button>

        <h2 className="text-base font-semibold text-foreground">
          {isNew ? "Create Email Template" : "Edit Email Template"}
        </h2>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Form fields */}
          <div className="divide-y divide-border">
            {/* Template Name */}
            <div className="grid grid-cols-[140px_1fr] items-center px-5 py-3 gap-4">
              <label className="text-xs font-medium text-foreground">Template Name *</label>
              <Input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="e.g. Candidate Rejection - After Interview"
                className="h-8 text-xs"
              />
            </div>

            {/* Type */}
            <div className="grid grid-cols-[140px_1fr] items-center px-5 py-3 gap-4">
              <label className="text-xs font-medium text-foreground">Type *</label>
              <Select value={editing.type} onValueChange={(v) => setEditing({ ...editing, type: v })}>
                <SelectTrigger className="h-8 text-xs w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TEMPLATE_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="grid grid-cols-[140px_1fr] items-start px-5 py-3 gap-4">
              <label className="text-xs font-medium text-foreground pt-2">Description</label>
              <Input
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                placeholder="What is this template for?"
                className="h-8 text-xs"
              />
            </div>

            {/* From Address */}
            <div className="grid grid-cols-[140px_1fr] items-center px-5 py-3 gap-4">
              <label className="text-xs font-medium text-foreground">From Address *</label>
              <Select
                value={editing.fromAddress}
                onValueChange={(v) => setEditing({ ...editing, fromAddress: v })}
              >
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="{{MY_EMAIL_ADDRESS}}" className="text-xs">{"{{MY_EMAIL_ADDRESS}}"}</SelectItem>
                  <SelectItem value="recruiting@gostudent.com" className="text-xs">recruiting@gostudent.com</SelectItem>
                  <SelectItem value="noreply@gostudent.com" className="text-xs">noreply@gostudent.com</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cc */}
            <div className="grid grid-cols-[140px_1fr] items-center px-5 py-3 gap-4">
              <label className="text-xs font-medium text-foreground">Cc</label>
              <div className="flex items-center gap-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={editing.ccRecruiter}
                    onCheckedChange={(v) => setEditing({ ...editing, ccRecruiter: !!v })}
                  />
                  <span className="text-xs text-foreground">Application's recruiter</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={editing.ccCoordinator}
                    onCheckedChange={(v) => setEditing({ ...editing, ccCoordinator: !!v })}
                  />
                  <span className="text-xs text-foreground">Application's coordinator</span>
                </label>
              </div>
            </div>

            {/* Subject */}
            <div className="grid grid-cols-[140px_1fr] items-center px-5 py-3 gap-4">
              <label className="text-xs font-medium text-foreground">Email Subject *</label>
              <Input
                value={editing.subject}
                onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
                placeholder="GoStudent | Your Application Update"
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Token reference */}
          <div className="border-t border-border bg-emerald-50/50 dark:bg-emerald-950/20 px-5 py-3.5 space-y-2">
            <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400">
              Edit the copy for the email below.
            </p>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/70 leading-relaxed">
              <span className="font-medium">Available placeholders: </span>
              {PLACEHOLDERS.map((p) => (
                <code key={p} className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 rounded px-1 py-0.5 mr-1 mb-0.5 inline-block">{`{{${p}}}`}</code>
              ))}
            </p>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/70">
              <span className="font-medium">Job tokens: </span>
              {JOB_TOKENS.map((p) => (
                <code key={p} className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 rounded px-1 py-0.5 mr-1">{`{{${p}}}`}</code>
              ))}
            </p>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/70">
              <span className="font-medium">Application tokens: </span>
              {APP_TOKENS.map((p) => (
                <code key={p} className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 rounded px-1 py-0.5 mr-1">{`{{${p}}}`}</code>
              ))}
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-0.5 border-t border-border px-4 py-2 bg-muted/30 flex-wrap">
            {[Bold, Italic, Underline].map((Icon, i) => (
              <button key={i} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-border" />
            {[AlignLeft, AlignCenter, AlignRight].map((Icon, i) => (
              <button key={i} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-border" />
            {[List, ListOrdered].map((Icon, i) => (
              <button key={i} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-border" />

            {/* Insert token dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-xs">
                  <Braces className="h-3.5 w-3.5" />
                  Insert token
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-64 overflow-y-auto">
                {[...PLACEHOLDERS, ...JOB_TOKENS, ...APP_TOKENS].map((token) => (
                  <DropdownMenuItem key={token} className="text-xs font-mono" onClick={() => insertToken(token)}>
                    {`{{${token}}}`}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <span className="mx-1 h-4 w-px bg-border" />
            <button className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <Minus className="h-3.5 w-3.5" />
            </button>
            {[Link2, Image, Code].map((Icon, i) => (
              <button key={i} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>

          {/* Body */}
          <Textarea
            value={editing.body}
            onChange={(e) => setEditing({ ...editing, body: e.target.value })}
            placeholder="Write your email body here…"
            className="min-h-[280px] rounded-none border-0 border-t border-border text-sm leading-relaxed resize-y focus-visible:ring-0 focus-visible:ring-offset-0 px-5 py-4"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => { setEditing(null); setIsNew(false); }}>
            Cancel
          </Button>
          <Button size="sm" className="text-xs h-8" onClick={save}>
            Save
          </Button>
        </div>
      </div>
    );
  }

  /* ── List view ───────────────────────────────────────────── */
  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates…"
            className="pl-8 h-8 text-xs"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="h-8 text-xs w-48">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All types</SelectItem>
            {TEMPLATE_TYPES.map((t) => (
              <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" className="text-xs h-8 gap-1" onClick={openNew}>
          <Plus className="h-3 w-3" /> New template
        </Button>
      </div>

      {/* Template list */}
      <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Mail className="h-7 w-7 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No templates found</p>
          </div>
        ) : (
          filtered.map((tpl) => (
            <div
              key={tpl.id}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors group"
            >
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEdit(tpl)}>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium text-foreground truncate">{tpl.name}</p>
                  <Badge variant="secondary" className="text-[10px] shrink-0">{tpl.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{tpl.description}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                  Subject: {tpl.subject} · Updated {tpl.updatedAt}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-3">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(tpl)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => duplicate(tpl)}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(tpl.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmailTemplatesSettings;
