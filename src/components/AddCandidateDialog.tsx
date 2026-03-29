import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { LOCATIONS } from "@/lib/types";
import { toast } from "sonner";
import { useJobs } from "@/hooks/useJobs";
import { useStages } from "@/hooks/useStages";
import { useUsers } from "@/hooks/useUsers";
import { useCreateCandidate, useUpdateCandidate } from "@/hooks/useCandidates";
import { useGoogleDrive } from "@/hooks/useGoogleDrive";
import type { CandidateInsert } from "@/integrations/supabase/app-types";

const SOURCES = [
  "LinkedIn", "Indeed", "Referral", "Company Website", "Job Board", "Recruiter", "Other",
];

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Berlin", "Europe/Paris", "Asia/Tokyo", "Asia/Shanghai",
  "Australia/Sydney",
];

const schema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  preferredName: z.string().trim().max(100).optional().or(z.literal("")),
  currentCompany: z.string().trim().max(200).optional().or(z.literal("")),
  currentTitle: z.string().trim().max(200).optional().or(z.literal("")),
  jobId: z.string().min(1, "Job is required"),
  initialStageId: z.string().optional(),
  source: z.string().min(1, "Source is required"),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  timezone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddCandidateDialog = ({ open, onOpenChange }: Props) => {
  const { data: jobs = [] } = useJobs();
  const { data: stages = [] } = useStages();
  const { data: users = [] } = useUsers();
  const createCandidate = useCreateCandidate();
  const updateCandidate = useUpdateCandidate();
  const { uploadCV } = useGoogleDrive();
  const [candidateType, setCandidateType] = useState<"candidate" | "prospect">("candidate");
  const [cvFile, setCvFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "", lastName: "", email: "", phone: "", preferredName: "",
      currentCompany: "", currentTitle: "", jobId: "", initialStageId: "",
      source: "", notes: "", timezone: "",
    },
  });

  const selectedJobId = form.watch("jobId");
  const jobStages = useMemo(
    () => stages.filter((s) => s.jobId === selectedJobId).sort((a, b) => a.order - b.order),
    [stages, selectedJobId]
  );

  const onSubmit = (values: FormValues) => {
    const stageId = values.initialStageId || jobStages[0]?.id;
    if (!stageId) {
      toast.error("No stages found for this job");
      return;
    }

    createCandidate.mutate({
      first_name: values.firstName,
      last_name: values.lastName,
      email: values.email,
      phone: values.phone || "",
      job_id: values.jobId,
      current_stage_id: stageId,
      source: values.source,
      rating: 0,
      applied_at: new Date().toISOString(),
    } as CandidateInsert, {
      onSuccess: async (newCandidate) => {
        // Upload CV to Google Drive if a file was attached
        if (cvFile) {
          try {
            const { driveFileId, viewUrl } = await uploadCV(
              cvFile,
              `${values.firstName} ${values.lastName}`
            );
            updateCandidate.mutate({
              id: newCandidate.id,
              updates: { cv_drive_id: driveFileId, cv_url: viewUrl },
            });
          } catch (err) {
            // Non-fatal — candidate is created, just warn about Drive
            console.warn("CV upload failed:", err);
            toast.warning("Candidate added but CV upload to Drive failed.");
          }
        }
        toast.success(`${values.firstName} ${values.lastName} added as a candidate`);
        form.reset();
        setCvFile(null);
        onOpenChange(false);
      },
      onError: () => {
        toast.error("Failed to add candidate. Please try again.");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a Candidate</DialogTitle>
        </DialogHeader>

        {/* Candidate / Prospect toggle */}
        <div className="flex border-b border-border mb-2">
          <button
            type="button"
            onClick={() => setCandidateType("candidate")}
            className={`flex-1 pb-2.5 text-sm font-semibold text-center border-b-2 transition-colors ${
              candidateType === "candidate"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Candidate for a job
          </button>
          <button
            type="button"
            onClick={() => setCandidateType("prospect")}
            className={`flex-1 pb-2.5 text-sm font-semibold text-center border-b-2 transition-colors ${
              candidateType === "prospect"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Prospect
          </button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Job selection */}
            <FormField control={form.control} name="jobId" render={({ field }) => (
              <FormItem>
                <FormLabel>Job *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a job..." /></SelectTrigger></FormControl>
                  <SelectContent>
                    {jobs.map((j) => <SelectItem key={j.id} value={j.id}>{j.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            {/* Initial stage */}
            {jobStages.length > 0 && (
              <FormField control={form.control} name="initialStageId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Stage</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {jobStages.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            <Separator />

            {/* Name & Company */}
            <h3 className="text-sm font-bold text-foreground">Name & Company</h3>

            <FormField control={form.control} name="firstName" render={({ field }) => (
              <FormItem>
                <FormLabel>First name *</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="lastName" render={({ field }) => (
              <FormItem>
                <FormLabel>Last name *</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="preferredName" render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred first name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="currentCompany" render={({ field }) => (
              <FormItem>
                <FormLabel>Current Company</FormLabel>
                <FormControl><Input {...field} /></FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="currentTitle" render={({ field }) => (
              <FormItem>
                <FormLabel>Current Title</FormLabel>
                <FormControl><Input {...field} /></FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="timezone" render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a timezone" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {TIMEZONES.map((tz) => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormItem>
            )} />

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl><Textarea rows={3} {...field} /></FormControl>
              </FormItem>
            )} />

            <Separator />

            {/* Info */}
            <h3 className="text-sm font-bold text-foreground">Info</h3>

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl><Input type="email" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl><Input type="tel" {...field} /></FormControl>
              </FormItem>
            )} />

            {/* CV Upload */}
            <div className="space-y-1.5">
              <Label className="text-sm text-foreground">CV / Resume</Label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="block w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
              />
              {cvFile && (
                <p className="text-[11px] text-muted-foreground">
                  Will upload to Google Drive: {cvFile.name}
                </p>
              )}
            </div>

            <Separator />

            {/* Details */}
            <h3 className="text-sm font-bold text-foreground">Details</h3>

            <FormField control={form.control} name="source" render={({ field }) => (
              <FormItem>
                <FormLabel>Source *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a source..." /></SelectTrigger></FormControl>
                  <SelectContent>
                    {SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <Separator />

            {/* Responsibility */}
            <h3 className="text-sm font-bold text-foreground">Who's responsible for this candidate?</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Recruiter</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Coordinator</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">* = required</p>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={createCandidate.isPending}>Add this candidate</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCandidateDialog;
