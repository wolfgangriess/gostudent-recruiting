import { useState } from "react";
import { Plus, X, HelpCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useATSStore } from "@/lib/ats-store";
import { toast } from "sonner";
import { DEPARTMENTS } from "@/lib/types";

/* ── Types ─────────────────────────────────────────────────── */
interface ApprovalStep {
  id: string;
  approverIds: string[];
  requiredCount: number;
  mode: "all_at_once" | "sequential";
}

interface ApprovalGroup {
  id: string;
  label: string;
  scope: string;
  removable: boolean;
  jobApprovals: ApprovalStep[];
  offerApprovals: ApprovalStep[];
}

/* ── Approver List ─────────────────────────────────────────── */
const ApproverList = ({
  step,
  users,
  onAdd,
  onRemove,
}: {
  step: ApprovalStep;
  users: { id: string; firstName: string; lastName: string }[];
  onAdd: (uid: string) => void;
  onRemove: (uid: string) => void;
}) => {
  const [adding, setAdding] = useState(false);
  const available = users.filter((u) => !step.approverIds.includes(u.id));

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {step.approverIds.length === 0 ? (
        <div className="px-4 py-3">
          <p className="text-xs text-muted-foreground italic">No approval required</p>
        </div>
      ) : (
        <div>
          {step.approverIds.map((uid, i) => {
            const user = users.find((u) => u.id === uid);
            if (!user) return null;
            return (
              <div
                key={uid}
                className={`flex items-center justify-between px-4 py-2.5 group hover:bg-muted/30 transition-colors ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <span className="text-xs font-medium text-foreground">{user.firstName} {user.lastName}</span>
                </div>
                <button
                  onClick={() => onRemove(uid)}
                  className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="border-t border-border px-3 py-2 bg-muted/20">
        {adding ? (
          <div className="flex items-center gap-2">
            <Select onValueChange={(v) => { onAdd(v); setAdding(false); }}>
              <SelectTrigger className="h-7 text-xs flex-1"><SelectValue placeholder="Select approver…" /></SelectTrigger>
              <SelectContent>
                {available.map((u) => (
                  <SelectItem key={u.id} value={u.id} className="text-xs">
                    {u.firstName} {u.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button onClick={() => setAdding(false)} className="text-[11px] text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1"
          >
            <Plus className="h-3 w-3" /> Add approver
          </button>
        )}
      </div>
    </div>
  );
};

/* ── Approval Panel (Job or Offer) ─────────────────────────── */
const ApprovalPanel = ({
  title,
  subtitle,
  step,
  users,
  onUpdate,
  showMode,
  footerLink,
}: {
  title: string;
  subtitle: string;
  step: ApprovalStep;
  users: { id: string; firstName: string; lastName: string }[];
  onUpdate: (step: ApprovalStep) => void;
  showMode?: boolean;
  footerLink?: { label: string };
}) => (
  <div className="space-y-2.5">
    <div className="flex items-center justify-between">
      <div>
        <h4 className="text-xs font-semibold text-foreground">{title}</h4>
        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
          {subtitle} <HelpCircle className="h-3 w-3 opacity-50" />
        </p>
      </div>
      {showMode && step.approverIds.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            {step.requiredCount} of {step.approverIds.length} required
          </span>
          <Select
            value={step.mode}
            onValueChange={(v) => onUpdate({ ...step, mode: v as "all_at_once" | "sequential" })}
          >
            <SelectTrigger className="h-6 text-[10px] w-[90px] gap-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all_at_once" className="text-xs">All at once</SelectItem>
              <SelectItem value="sequential" className="text-xs">Sequential</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>

    <ApproverList
      step={step}
      users={users}
      onAdd={(uid) =>
        onUpdate({ ...step, approverIds: [...step.approverIds, uid], requiredCount: Math.max(1, step.requiredCount) })
      }
      onRemove={(uid) =>
        onUpdate({
          ...step,
          approverIds: step.approverIds.filter((id) => id !== uid),
          requiredCount: Math.max(0, Math.min(step.requiredCount, step.approverIds.length - 1)),
        })
      }
    />

    {footerLink && (
      <button className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1">
        {footerLink.label} <HelpCircle className="h-3 w-3 opacity-50" />
      </button>
    )}
  </div>
);

/* ── Collapsible Group ─────────────────────────────────────── */
const ApprovalGroupCard = ({
  group,
  users,
  onUpdate,
  onRemove,
  defaultOpen,
}: {
  group: ApprovalGroup;
  users: { id: string; firstName: string; lastName: string }[];
  onUpdate: (updated: ApprovalGroup) => void;
  onRemove: () => void;
  defaultOpen: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const jobStep = group.jobApprovals[0] || { id: `j-${Date.now()}`, approverIds: [], requiredCount: 0, mode: "all_at_once" as const };
  const offerStep = group.offerApprovals[0] || { id: `o-${Date.now()}`, approverIds: [], requiredCount: 0, mode: "all_at_once" as const };

  const totalApprovers = jobStep.approverIds.length + offerStep.approverIds.length;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="flex items-center justify-between w-full px-5 py-3.5 hover:bg-muted/30 transition-colors text-left">
            <div className="flex items-center gap-3">
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "" : "-rotate-90"}`} />
              <div>
                <h3 className="text-sm font-semibold text-foreground">{group.scope}</h3>
                <p className="text-[11px] text-muted-foreground">
                  {totalApprovers === 0 ? "No approvers configured" : `${totalApprovers} approver${totalApprovers > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
            {group.removable && (
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="text-[11px] font-medium text-destructive hover:underline px-2 py-1"
              >
                Remove
              </button>
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-border px-5 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ApprovalPanel
                title="Job approvals"
                subtitle="Approvals to start recruiting"
                step={jobStep}
                users={users}
                onUpdate={(s) => onUpdate({ ...group, jobApprovals: [s] })}
                footerLink={{ label: "Switch to 2-stage job approvals" }}
              />
              <ApprovalPanel
                title="Offer approvals"
                subtitle="To extend offers to candidates"
                step={offerStep}
                users={users}
                onUpdate={(s) => onUpdate({ ...group, offerApprovals: [s] })}
                showMode
                footerLink={{ label: "Apply to existing jobs" }}
              />
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

/* ── Main ──────────────────────────────────────────────────── */
const ApprovalsSettings = () => {
  const { users } = useATSStore();
  const [groups, setGroups] = useState<ApprovalGroup[]>([
    {
      id: "g-1", label: "All New Jobs", scope: "All New Jobs", removable: false,
      jobApprovals: [{ id: "j-1", approverIds: [], requiredCount: 0, mode: "all_at_once" }],
      offerApprovals: [{ id: "o-1", approverIds: ["user-1", "user-2", "user-4"], requiredCount: 1, mode: "all_at_once" }],
    },
    {
      id: "g-2", label: "Engineering", scope: "All New Engineering Jobs", removable: true,
      jobApprovals: [{ id: "j-2", approverIds: [], requiredCount: 0, mode: "all_at_once" }],
      offerApprovals: [{ id: "o-2", approverIds: ["user-3", "user-6"], requiredCount: 1, mode: "all_at_once" }],
    },
    {
      id: "g-3", label: "Design", scope: "All New Design Jobs", removable: true,
      jobApprovals: [{ id: "j-3", approverIds: ["user-4", "user-2", "user-3", "user-5"], requiredCount: 1, mode: "all_at_once" }],
      offerApprovals: [{ id: "o-3", approverIds: ["user-2", "user-4", "user-3", "user-5"], requiredCount: 1, mode: "all_at_once" }],
    },
  ]);

  const [addingDept, setAddingDept] = useState(false);
  const [newDept, setNewDept] = useState("");
  const usedDepts = groups.filter((g) => g.removable).map((g) => g.label);
  const availableDepts = DEPARTMENTS.filter((d) => !usedDepts.includes(d));

  const updateGroup = (id: string, updated: ApprovalGroup) =>
    setGroups((prev) => prev.map((g) => (g.id === id ? updated : g)));

  const removeGroup = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
    toast.success("Approval group removed");
  };

  const addDeptGroup = () => {
    if (!newDept) return;
    setGroups((prev) => [
      ...prev,
      {
        id: `g-${Date.now()}`, label: newDept, scope: `All New ${newDept} Jobs`, removable: true,
        jobApprovals: [{ id: `j-${Date.now()}`, approverIds: [], requiredCount: 0, mode: "all_at_once" }],
        offerApprovals: [{ id: `o-${Date.now()}`, approverIds: [], requiredCount: 0, mode: "all_at_once" }],
      },
    ]);
    setNewDept("");
    setAddingDept(false);
    toast.success(`Approval group for ${newDept} added`);
  };

  return (
    <div className="space-y-4">
      {/* Top actions */}
      <div className="flex items-center justify-end gap-4">
        <button className="text-[11px] text-primary hover:underline font-medium">Configure approval reminders</button>
        <button className="text-[11px] text-primary hover:underline font-medium">Configure approval emails</button>
      </div>

      {/* Groups */}
      {groups.map((group, i) => (
        <ApprovalGroupCard
          key={group.id}
          group={group}
          users={users}
          onUpdate={(updated) => updateGroup(group.id, updated)}
          onRemove={() => removeGroup(group.id)}
          defaultOpen={i === 0}
        />
      ))}

      {/* Add department */}
      {addingDept ? (
        <div className="flex items-center gap-3">
          <Select value={newDept} onValueChange={setNewDept}>
            <SelectTrigger className="h-8 text-xs w-48"><SelectValue placeholder="Select department" /></SelectTrigger>
            <SelectContent>
              {availableDepts.map((d) => (
                <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" className="text-xs h-8" onClick={addDeptGroup} disabled={!newDept}>Add</Button>
          <Button size="sm" variant="ghost" className="text-xs h-8" onClick={() => setAddingDept(false)}>Cancel</Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" className="text-xs h-8 gap-1" onClick={() => setAddingDept(true)}>
          <Plus className="h-3 w-3" /> Add department-specific approvals
        </Button>
      )}
    </div>
  );
};

export default ApprovalsSettings;
