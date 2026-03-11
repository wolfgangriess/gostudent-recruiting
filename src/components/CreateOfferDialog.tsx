import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Candidate, Job } from "@/lib/types";
import { useATSStore } from "@/lib/ats-store";
import { toast } from "sonner";
import { HelpCircle } from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate;
}

const CONTRACT_TYPES = ["Permanent", "Fixed Term", "Freelancer", "Internship"];
const WORK_SCHEDULES = ["Full Time", "Part Time"];
const CURRENCIES = ["EUR", "USD", "GBP", "CHF"];
const LOCATIONS = ["San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA", "London, UK", "Berlin, DE", "Remote"];

const FieldLabel = ({ label, required, tooltip }: { label: string; required?: boolean; tooltip?: string }) => (
  <div className="flex items-center gap-1">
    <Label className="text-xs text-foreground">{label}</Label>
    {tooltip && (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-3 w-3 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent><p className="text-xs">{tooltip}</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )}
    {required && <span className="text-destructive text-xs">*</span>}
  </div>
);

export const CreateOfferDialog = ({ open, onOpenChange, candidate }: Props) => {
  const { jobs, users } = useATSStore();
  const job = jobs.find((j) => j.id === candidate.jobId);

  const [form, setForm] = useState({
    opening: job?.id ?? "",
    startDate: "",
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    dob: "",
    street: "",
    postCode: "",
    city: "",
    country: "",
    contractType: "",
    workSchedule: "Full Time",
    partTimeHours: "",
    salaryCurrency: job?.salaryCurrency ?? "EUR",
    salary: "",
    signOnBonus: "",
    equityCurrency: "USD",
    equity: "",
    location: job?.location ?? "",
    reportingManager: "",
    notesCover: "",
    notesApprover: "",
    recruiter: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!form.firstName || !form.lastName || !form.startDate || !form.contractType || !form.salary || !form.location || !form.reportingManager || !form.notesApprover) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success(`Offer created for ${form.firstName} ${form.lastName}`);
    onOpenChange(false);
  };

  const salaryMin = job?.salaryMin ?? 0;
  const salaryMax = job?.salaryMax ?? 0;
  const currency = job?.salaryCurrency ?? "EUR";
  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency, maximumFractionDigits: 2 });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Offer</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Opening */}
          <div className="space-y-1.5">
            <FieldLabel label="Opening" />
            <Select value={form.opening} onValueChange={(v) => update("opening", v)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {jobs.filter((j) => j.status === "open").map((j) => (
                  <SelectItem key={j.id} value={j.id}>{j.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <FieldLabel label="Start Date" required />
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) => update("startDate", e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          {/* Name fields */}
          <div className="space-y-1.5">
            <FieldLabel label="Candidates First Name" required tooltip="As it appears on official documents" />
            <Input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel label="Candidates Surname" required tooltip="As it appears on official documents" />
            <Input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} className="h-9 text-sm" />
          </div>

          {/* DOB */}
          <div className="space-y-1.5">
            <FieldLabel label="Date of Birth (DD/MM/YYYY)" tooltip="Required for contract generation" />
            <Input placeholder="DD/MM/YYYY" value={form.dob} onChange={(e) => update("dob", e.target.value)} className="h-9 text-sm" />
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <FieldLabel label="Address: Street Name & Number" />
            <Input value={form.street} onChange={(e) => update("street", e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel label="Address: Post Code (PLZ/Zip Code)" />
            <Input value={form.postCode} onChange={(e) => update("postCode", e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel label="Address: City" />
            <Input value={form.city} onChange={(e) => update("city", e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel label="Address: Country" />
            <Input value={form.country} onChange={(e) => update("country", e.target.value)} className="h-9 text-sm" />
          </div>

          {/* Contract Type */}
          <div className="space-y-1.5">
            <FieldLabel label="Contract Type" required />
            <Select value={form.contractType} onValueChange={(v) => update("contractType", v)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {CONTRACT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Work Schedule */}
          <div className="space-y-1.5">
            <FieldLabel label="Work Schedule" />
            <Select value={form.workSchedule} onValueChange={(v) => update("workSchedule", v)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WORK_SCHEDULES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Part Time Hours */}
          {form.workSchedule === "Part Time" && (
            <div className="space-y-1.5">
              <FieldLabel label="Part Time Hours" tooltip="Weekly hours" />
              <Input value={form.partTimeHours} onChange={(e) => update("partTimeHours", e.target.value)} className="h-9 text-sm" />
            </div>
          )}

          <hr className="border-border" />

          {/* Salary */}
          <div className="space-y-1.5">
            <FieldLabel label="Annual Gross Salary (Numbers Only)" required tooltip="Enter the annual gross salary" />
            <div className="flex gap-2">
              <Select value={form.salaryCurrency} onValueChange={(v) => update("salaryCurrency", v)}>
                <SelectTrigger className="w-[80px] h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input value={form.salary} onChange={(e) => update("salary", e.target.value)} className="h-9 text-sm" placeholder="0" />
            </div>
            {salaryMin > 0 && salaryMax > 0 && (
              <p className="text-xs text-muted-foreground">
                Approved range: {fmt(salaryMin)} - {fmt(salaryMax)}
              </p>
            )}
          </div>

          {/* Sign on Bonus */}
          <div className="space-y-1.5">
            <FieldLabel label="Sign on Bonus" />
            <Input value={form.signOnBonus} onChange={(e) => update("signOnBonus", e.target.value)} className="h-9 text-sm" />
          </div>

          {/* Equity */}
          <div className="space-y-1.5">
            <FieldLabel label="Equity" tooltip="Stock options or equity grant value" />
            <div className="flex gap-2">
              <Select value={form.equityCurrency} onValueChange={(v) => update("equityCurrency", v)}>
                <SelectTrigger className="w-[80px] h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input value={form.equity} onChange={(e) => update("equity", e.target.value)} className="h-9 text-sm" placeholder="0" />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <FieldLabel label="Location" required />
            <Select value={form.location} onValueChange={(v) => update("location", v)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reporting Manager */}
          <div className="space-y-1.5">
            <FieldLabel label="Reporting Manager" required />
            <Select value={form.reportingManager} onValueChange={(v) => update("reportingManager", v)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select a user..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <FieldLabel label="Notes for cover" tooltip="Will appear on the offer letter" />
            <Textarea value={form.notesCover} onChange={(e) => update("notesCover", e.target.value)} rows={2} className="text-sm" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel label="Notes for Approver" required />
            <Textarea value={form.notesApprover} onChange={(e) => update("notesApprover", e.target.value)} rows={2} className="text-sm" />
          </div>

          {/* Recruiter */}
          <div className="space-y-1.5">
            <FieldLabel label="Recruiter" />
            <Select value={form.recruiter} onValueChange={(v) => update("recruiter", v)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-muted-foreground italic">
            Changing any of these fields will trigger a new offer version.
          </p>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
