import { useState } from "react";
import {
  Plus, Search, Pencil, MoreHorizontal, Trash2, Copy,
  CheckCircle2, FileText, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

/* ── Token Data ────────────────────────────────────────────── */
const GENERAL_TOKENS = [
  "APPLIED_DATE", "CANDIDATE_EMAIL_ADDRESS", "CANDIDATE_FIRST_NAME",
  "CANDIDATE_LAST_NAME", "CANDIDATE_MAILING_ADDRESS", "CANDIDATE_NAME",
  "CANDIDATE_PHONE", "COMPANY", "COORDINATOR", "INTERNAL_JOB_NAME",
  "JOB_NAME", "JOB_POST_URL", "MY_EMAIL_ADDRESS", "MY_FIRST_NAME",
  "MY_FULL_NAME", "MY_JOB_TITLE", "MY_SIGNATURE", "OFFICE",
  "PREFERRED_FIRST_NAME", "PREFERRED_FULL_NAME", "RECRUITER",
  "SOURCE", "START_DATE", "TODAY_DATE",
];
const JOB_TOKENS = ["ANNUAL_SALARY_RANGE", "REPORTS_TO", "WORKER_TYPES", "WORK_SCHEDULE"];
const OFFER_TOKENS = ["CONTRACT_TYPE", "REPORTING_MANAGER", "SIGN_ON_BONUS", "STARTING_SALARY"];
const APP_TOKENS = ["LOCATION_OF_HIRE"];

/* ── Types ─────────────────────────────────────────────────── */
interface OfferTemplate {
  id: string;
  name: string;
  lastUpdated: string;
  verified: boolean;
}

const initialTemplates: OfferTemplate[] = [
  { id: "ot-1", name: "Offer Letter Italy - Updated 2024", lastUpdated: "May 22, 2024", verified: true },
  { id: "ot-2", name: "Offer Letter Spain - Updated 2024", lastUpdated: "May 9, 2024", verified: true },
  { id: "ot-3", name: "Offer Letter Germany - Updated 2024", lastUpdated: "May 8, 2024", verified: true },
  { id: "ot-4", name: "Offer Letter Turkey - Updated 2024", lastUpdated: "Apr 30, 2024", verified: true },
  { id: "ot-5", name: "Offer Letter Greece - Updated 2024", lastUpdated: "Apr 4, 2024", verified: true },
];

/* ── Token Badge ───────────────────────────────────────────── */
const TokenList = ({ tokens }: { tokens: string[] }) => (
  <span className="leading-relaxed">
    {tokens.map((t, i) => (
      <span key={t}>
        <code className="text-[11px] font-mono text-primary/90">{`{{${t}}}`}</code>
        {i < tokens.length - 1 && <span className="text-muted-foreground">, </span>}
      </span>
    ))}
  </span>
);

/* ── Component ─────────────────────────────────────────────── */
const DocumentTemplatesSettings = () => {
  const [templates, setTemplates] = useState<OfferTemplate[]>(initialTemplates);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const filtered = templates.filter((t) => {
    if (!search.trim()) return true;
    return t.name.toLowerCase().includes(search.toLowerCase());
  });

  const addTemplate = () => {
    if (!newName.trim()) {
      toast.error("Template name is required");
      return;
    }
    setTemplates((prev) => [
      {
        id: `ot-${Date.now()}`,
        name: newName.trim(),
        lastUpdated: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        verified: false,
      },
      ...prev,
    ]);
    setNewName("");
    setAddOpen(false);
    toast.success("Template added");
  };

  const duplicate = (tpl: OfferTemplate) => {
    setTemplates((prev) => [
      {
        ...tpl,
        id: `ot-${Date.now()}`,
        name: `${tpl.name} (Copy)`,
        lastUpdated: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        verified: false,
      },
      ...prev,
    ]);
    toast.success("Template duplicated");
  };

  const remove = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast.success("Template deleted");
  };

  return (
    <div className="space-y-6">
      {/* Header description */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Offer Templates</h2>
        <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
          <p>
            Upload standardized offer templates as a Word doc that can be automatically customized for each candidate and job offer.
          </p>
          <p>
            When you're creating the template in Word (needs to be .docx file), just use a token for each part of the offer document you'd like to customize.
            The list of available tokens is below — be sure to use the double brackets i.e. <code className="text-primary/80 font-mono">{"{{YOUR_TOKEN}}"}</code> around every token to identify what parts of the offer document you want to customize.
          </p>
          <p>
            Once all of a candidate's offer document(s) have been created, there will be a "Generate Offer" link. This link will allow you to generate customized offer document(s) based on your chosen template and attach it to the candidate's current offer.
          </p>
        </div>
      </div>

      {/* Tokens reference */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">All Available Tokens</h3>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">General Tokens</p>
            <TokenList tokens={GENERAL_TOKENS} />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">Available Job Tokens</p>
            <TokenList tokens={JOB_TOKENS} />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">Available Offer Tokens</p>
            <TokenList tokens={OFFER_TOKENS} />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">Available Application Tokens</p>
            <TokenList tokens={APP_TOKENS} />
          </div>
        </div>

        <div className="border-t border-border pt-3">
          <h4 className="text-xs font-semibold text-foreground mb-1">All Offer Sections</h4>
          <p className="text-xs text-muted-foreground">
            Create conditional offer sections to customize your offer templates.{" "}
            <button className="text-primary hover:underline font-medium">Learn More</button>
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates…"
            className="pl-8 h-8 text-xs"
          />
        </div>
        <Button size="sm" variant="outline" className="text-xs h-8 gap-1" onClick={() => setAddOpen(true)}>
          <Plus className="h-3 w-3" /> Add template
        </Button>
      </div>

      {/* Template table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_140px_100px_40px] items-center gap-2 px-5 py-2.5 bg-muted/30 border-b border-border">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Template Name</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Last Updated</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide text-center">Status</span>
          <span />
        </div>

        {/* Rows */}
        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <FileText className="h-7 w-7 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No templates found</p>
            </div>
          ) : (
            filtered.map((tpl) => (
              <div
                key={tpl.id}
                className="grid grid-cols-[1fr_140px_100px_40px] items-center gap-2 px-5 py-3 hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-primary truncate">{tpl.name}</span>
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                    onClick={() => toast.info("Rename coming soon")}
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                </div>
                <span className="text-xs text-muted-foreground">{tpl.lastUpdated}</span>
                <div className="flex justify-center">
                  {tpl.verified ? (
                    <Badge variant="secondary" className="gap-1 text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">Draft</Badge>
                  )}
                </div>
                <div className="flex justify-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem className="text-xs gap-2" onClick={() => toast.info("Download coming soon")}>
                        <Upload className="h-3.5 w-3.5 rotate-180" /> Download
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-xs gap-2" onClick={() => duplicate(tpl)}>
                        <Copy className="h-3.5 w-3.5" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-xs gap-2 text-destructive" onClick={() => remove(tpl.id)}>
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add template dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Add Offer Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Template Name *</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Offer Letter France - 2024"
                className="h-9 text-sm"
              />
            </div>
            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
              <Upload className="h-6 w-6 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                Drag & drop your .docx template here, or{" "}
                <button className="text-primary hover:underline font-medium">browse</button>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button size="sm" className="text-xs" onClick={addTemplate}>Add template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentTemplatesSettings;
