import { useState } from "react";
import { Plus, X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
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
  scope: string;          // e.g. "All New Jobs", department-specific
  removable: boolean;
  jobApprovals: ApprovalStep[];
  offerApprovals: ApprovalStep[];
}

/* ── Approval Step Card ────────────────────────────────────── */
const ApprovalStepCard = ({
  step,
  users,
  onAddApprover,
  onRemoveApprover,
  onModeChange,
}: {
  step: ApprovalStep;
  users: { id: string; firstName: string; lastName: string }[];
  onAddApprover: (userId: string) => void;
  onRemoveApprover: (userId: string) => void;
  onModeChange: (mode: "all_at_once" | "sequential") => void;
}) => {
  const [addingUser, setAddingUser] = useState(false);
  const availableUsers = users.filter((u) => !step.approverIds.includes(u.id));

  return (
    <div className="rounded-lg border border-border bg-card">
      {step.approverIds.length === 0 ? (
        <div className="px-4 py-3">
          <p className="text-xs text-muted-foreground italic">No approval required</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {step.approverIds.map((uid) => {
            const user = users.find((u) => u.id === uid);
            if (!user) return null;
            return (
              <div key={uid} className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full border border-border" />
                  <span className="text-sm text-primary">{user.firstName} {user.lastName}</span>
                </div>
                <button
                  onClick={() => onRemoveApprover(uid)}
                  className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add approver */}
      <div className="border-t border-border px-4 py-2">
        {addingUser ? (
          <div className="flex items-center gap-2">
            <Select onValueChange={(v) => { onAddApprover(v); setAddingUser(false); }}>
              <SelectTrigger className="h-7 text-xs flex-1"><SelectValue placeholder="Select approver" /></SelectTrigger>
              <SelectContent>
                {availableUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id} className="text-xs">
                    {u.firstName} {u.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button onClick={() => setAddingUser(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={() => setAddingUser(true)}>
            Add approval step
          </Button>
        )}
      </div>
    </div>
  );
};

/* ── Approval Group Section ────────────────────────────────── */
const ApprovalGroupSection = ({
  group,
  users,
  onUpdate,
  onRemove,
}: {
  group: ApprovalGroup;
  users: { id: string; firstName: string; lastName: string }[];
  onUpdate: (updated: ApprovalGroup) => void;
  onRemove: () => void;
}) => {
  const jobStep = group.jobApprovals[0] || { id: `j-${Date.now()}`, approverIds: [], requiredCount: 0, mode: "all_at_once" as const };
  const offerStep = group.offerApprovals[0] || { id: `o-${Date.now()}`, approverIds: [], requiredCount: 0, mode: "all_at_once" as const };

  const updateJob = (step: ApprovalStep) => onUpdate({ ...group, jobApprovals: [step] });
  const updateOffer = (step: ApprovalStep) => onUpdate({ ...group, offerApprovals: [step] });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Default approvals required for {group.scope}
        </h3>
        {group.removable && (
          <button onClick={onRemove} className="text-xs font-medium text-destructive hover:underline">
            Remove
          </button>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job approvals */}
        <div className="space-y-2">
          <div>
            <h4 className="text-xs font-semibold text-foreground">Job approvals</h4>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              Approvals to start recruiting <HelpCircle className="h-3 w-3" />
            </p>
          </div>

          <ApprovalStepCard
            step={jobStep}
            users={users}
            onAddApprover={(uid) =>
              updateJob({ ...jobStep, approverIds: [...jobStep.approverIds, uid], requiredCount: jobStep.approverIds.length + 1 })
            }
            onRemoveApprover={(uid) =>
              updateJob({ ...jobStep, approverIds: jobStep.approverIds.filter((id) => id !== uid), requiredCount: Math.max(0, jobStep.requiredCount - 1) })
            }
            onModeChange={(mode) => updateJob({ ...jobStep, mode })}
          />

          <button className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
            Switch to 2-stage job approvals <HelpCircle className="h-3 w-3" />
          </button>
        </div>

        {/* Offer approvals */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-foreground">Offer approvals</h4>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                To extend offers to candidates <HelpCircle className="h-3 w-3" />
              </p>
            </div>
            {offerStep.approverIds.length > 0 && (
              <Select
                value={offerStep.mode}
                onValueChange={(v) => updateOffer({ ...offerStep, mode: v as "all_at_once" | "sequential" })}
              >
                <SelectTrigger className="h-7 text-[10px] w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_at_once" className="text-xs">All at on…</SelectItem>
                  <SelectItem value="sequential" className="text-xs">Sequential</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="relative">
            {offerStep.approverIds.length > 0 && (
              <div className="absolute top-2 right-3 text-[10px] text-muted-foreground">
                {offerStep.requiredCount} of {offerStep.approverIds.length} required
              </div>
            )}
            <ApprovalStepCard
              step={offerStep}
              users={users}
              onAddApprover={(uid) =>
                updateOffer({ ...offerStep, approverIds: [...offerStep.approverIds, uid], requiredCount: 1 })
              }
              onRemoveApprover={(uid) =>
                updateOffer({ ...offerStep, approverIds: offerStep.approverIds.filter((id) => id !== uid), requiredCount: Math.min(offerStep.requiredCount, offerStep.approverIds.length - 1) })
              }
              onModeChange={(mode) => updateOffer({ ...offerStep, mode })}
            />
          </div>

          <button className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
            Apply to existing jobs <HelpCircle className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Component ────────────────────────────────────────── */
const ApprovalsSettings = () => {
  const { users } = useATSStore();
  const [groups, setGroups] = useState<ApprovalGroup[]>([
    {
      id: "g-1",
      label: "All New Jobs",
      scope: "All New Jobs",
      removable: false,
      jobApprovals: [{ id: "j-1", approverIds: [], requiredCount: 0, mode: "all_at_once" }],
      offerApprovals: [{ id: "o-1", approverIds: ["user-1", "user-2", "user-4"], requiredCount: 1, mode: "all_at_once" }],
    },
    {
      id: "g-2",
      label: "Engineering",
      scope: "All New Engineering Jobs",
      removable: true,
      jobApprovals: [{ id: "j-2", approverIds: [], requiredCount: 0, mode: "all_at_once" }],
      offerApprovals: [{ id: "o-2", approverIds: ["user-3", "user-6"], requiredCount: 1, mode: "all_at_once" }],
    },
    {
      id: "g-3",
      label: "Design",
      scope: "All New Design Jobs",
      removable: true,
      jobApprovals: [{ id: "j-3", approverIds: ["user-4", "user-2", "user-3", "user-5"], requiredCount: 1, mode: "all_at_once" }],
      offerApprovals: [{ id: "o-3", approverIds: ["user-2", "user-4", "user-3", "user-5"], requiredCount: 1, mode: "all_at_once" }],
    },
  ]);

  const [addingDept, setAddingDept] = useState(false);
  const [newDept, setNewDept] = useState("");

  const usedDepts = groups.filter((g) => g.removable).map((g) => g.label);
  const availableDepts = DEPARTMENTS.filter((d) => !usedDepts.includes(d));

  const updateGroup = (id: string, updated: ApprovalGroup) => {
    setGroups((prev) => prev.map((g) => (g.id === id ? updated : g)));
  };

  const removeGroup = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
    toast.success("Approval group removed");
  };

  const addDeptGroup = () => {
    if (!newDept) return;
    setGroups((prev) => [
      ...prev,
      {
        id: `g-${Date.now()}`,
        label: newDept,
        scope: `All New ${newDept} Jobs`,
        removable: true,
        jobApprovals: [{ id: `j-${Date.now()}`, approverIds: [], requiredCount: 0, mode: "all_at_once" }],
        offerApprovals: [{ id: `o-${Date.now()}`, approverIds: [], requiredCount: 0, mode: "all_at_once" }],
      },
    ]);
    setNewDept("");
    setAddingDept(false);
    toast.success(`Approval group for ${newDept} added`);
  };

  return (
    <div className="space-y-8">
      {/* Top actions */}
      <div className="flex items-center justify-end gap-3">
        <button className="text-xs text-primary hover:underline font-medium">Configure approval reminders</button>
        <button className="text-xs text-primary hover:underline font-medium">Configure approval emails</button>
      </div>

      {/* Groups */}
      {groups.map((group) => (
        <div key={group.id}>
          <ApprovalGroupSection
            group={group}
            users={users}
            onUpdate={(updated) => updateGroup(group.id, updated)}
            onRemove={() => removeGroup(group.id)}
          />
          <div className="mt-6 border-b border-border" />
        </div>
      ))}

      {/* Add department group */}
      <div>
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
    </div>
  );
};

export default ApprovalsSettings;
