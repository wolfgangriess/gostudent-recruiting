import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useATSStore } from "@/lib/ats-store";
import { DEPARTMENTS, LOCATIONS } from "@/lib/types";
import type { Job } from "@/lib/types";
import UserPicker from "@/components/UserPicker";

const jobSchema = z.object({
  name: z.string().trim().min(1, "Job name is required").max(100),
  externalName: z.string().max(100).optional(),
  department: z.string().min(1, "Department is required"),
  office: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  requisitionId: z.string().max(20).optional(),
  workplaceType: z.enum(["onsite", "remote", "hybrid"]),
  workerType: z.enum(["regular", "internship_trainee", "fixed_term", "freelancer"]),
  employmentType: z.enum(["full-time", "part-time", "contract", "internship"]),
  workSchedule: z.enum(["full_time", "part_time"]).optional(),
  numberOfOpenings: z.coerce.number().int().min(1),
  reportsTo: z.string().optional(),
  salaryCurrency: z.string().optional(),
  salaryMin: z.coerce.number().min(0).optional().or(z.literal("")),
  salaryMax: z.coerce.number().min(0).optional().or(z.literal("")),
  costCenter: z.string().max(100).optional(),
  jobDescriptionLink: z.string().url().max(500).optional().or(z.literal("")),
  level: z.string().max(50).optional(),
  description: z.string().max(2000),
  requirements: z.string().max(2000),
});

type JobFormValues = z.infer<typeof jobSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job;
}

const EditJobDialog = ({ open, onOpenChange, job }: Props) => {
  const { updateJob, users } = useATSStore();
  const [hiringTeamIds, setHiringTeamIds] = useState<string[]>(job.hiringTeamIds);
  const [visibilityIds, setVisibilityIds] = useState<string[]>(job.visibilityIds);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      name: job.name,
      externalName: job.externalName || "",
      department: job.department,
      office: job.office || "",
      location: job.location,
      requisitionId: job.requisitionId || "",
      workplaceType: job.workplaceType,
      workerType: job.workerType,
      employmentType: job.employmentType,
      workSchedule: (job.workSchedule as "full_time" | "part_time") || "full_time",
      numberOfOpenings: job.numberOfOpenings,
      reportsTo: job.reportsTo || "",
      salaryCurrency: job.salaryCurrency || "EUR",
      salaryMin: job.salaryMin ?? ("" as any),
      salaryMax: job.salaryMax ?? ("" as any),
      costCenter: job.costCenter || "",
      jobDescriptionLink: job.jobDescriptionLink || "",
      level: job.level || "",
      description: job.description,
      requirements: job.requirements,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: job.name,
        externalName: job.externalName || "",
        department: job.department,
        office: job.office || "",
        location: job.location,
        requisitionId: job.requisitionId || "",
        workplaceType: job.workplaceType,
        workerType: job.workerType,
        employmentType: job.employmentType,
        workSchedule: (job.workSchedule as "full_time" | "part_time") || "full_time",
        numberOfOpenings: job.numberOfOpenings,
        reportsTo: job.reportsTo || "",
        salaryCurrency: job.salaryCurrency || "EUR",
        salaryMin: job.salaryMin ?? ("" as any),
        salaryMax: job.salaryMax ?? ("" as any),
        costCenter: job.costCenter || "",
        jobDescriptionLink: job.jobDescriptionLink || "",
        level: job.level || "",
        description: job.description,
        requirements: job.requirements,
      });
      setHiringTeamIds(job.hiringTeamIds);
      setVisibilityIds(job.visibilityIds);
    }
  }, [open, job]);

  const onSubmit = (values: JobFormValues) => {
    updateJob(job.id, {
      name: values.name,
      externalName: values.externalName || undefined,
      department: values.department,
      office: values.office || undefined,
      location: values.location,
      requisitionId: values.requisitionId || undefined,
      workplaceType: values.workplaceType,
      workerType: values.workerType,
      employmentType: values.employmentType,
      workSchedule: values.workSchedule || undefined,
      numberOfOpenings: values.numberOfOpenings,
      reportsTo: values.reportsTo || undefined,
      salaryCurrency: values.salaryCurrency || "EUR",
      salaryMin: typeof values.salaryMin === "number" ? values.salaryMin : undefined,
      salaryMax: typeof values.salaryMax === "number" ? values.salaryMax : undefined,
      costCenter: values.costCenter || undefined,
      jobDescriptionLink: values.jobDescriptionLink || undefined,
      level: values.level || undefined,
      description: values.description,
      requirements: values.requirements,
      hiringTeamIds,
      visibilityIds,
      updatedAt: new Date().toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Job</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Internal Job Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal Job Name *</FormLabel>
                  <FormControl><Input placeholder="e.g. Senior Frontend Engineer" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* External Job Name */}
            <FormField
              control={form.control}
              name="externalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>External Job Name (appears on job boards)</FormLabel>
                  <FormControl><Input placeholder="e.g. Senior Frontend Engineer (all genders)" {...field} /></FormControl>
                </FormItem>
              )}
            />
            {/* Department */}
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Office */}
            <FormField
              control={form.control}
              name="office"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Office</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select office" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            {/* Requisition ID */}
            <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
              <FormField
                control={form.control}
                name="requisitionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requisition ID</FormLabel>
                    <FormControl><Input placeholder="" {...field} /></FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                className="h-10"
                onClick={() => form.setValue("requisitionId", `REQ-${Date.now().toString().slice(-6)}`)}
              >
                Generate Requisition ID
              </Button>
            </div>
            {/* Worker Type */}
            <FormField
              control={form.control}
              name="workerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Worker Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="internship_trainee">Internship/Trainee</SelectItem>
                      <SelectItem value="fixed_term">Fixed Term</SelectItem>
                      <SelectItem value="freelancer">Freelancer</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            {/* Employment Type */}
            <FormField
              control={form.control}
              name="employmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            {/* Work Schedule */}
            <FormField
              control={form.control}
              name="workSchedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Schedule *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || "full_time"}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            {/* Number of Openings */}
            <FormField
              control={form.control}
              name="numberOfOpenings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Openings *</FormLabel>
                  <FormControl><Input type="number" min={1} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Workplace Type */}
            <FormField
              control={form.control}
              name="workplaceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workplace Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Reports To */}
            <FormField
              control={form.control}
              name="reportsTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reports To *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            {/* Gross Annual Salary Range */}
            <FormItem>
              <FormLabel>Gross Annual Salary Range</FormLabel>
              <div className="grid grid-cols-[100px_1fr_auto_1fr] gap-2 items-center">
                <FormField
                  control={form.control}
                  name="salaryCurrency"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || "EUR"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CHF">CHF</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salaryMin"
                  render={({ field }) => (
                    <FormControl><Input type="number" min={0} placeholder="20000.0" {...field} /></FormControl>
                  )}
                />
                <span className="text-muted-foreground">–</span>
                <FormField
                  control={form.control}
                  name="salaryMax"
                  render={({ field }) => (
                    <FormControl><Input type="number" min={0} placeholder="30000.0" {...field} /></FormControl>
                  )}
                />
              </div>
            </FormItem>
            {/* Cost Center */}
            <FormField
              control={form.control}
              name="costCenter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost Center</FormLabel>
                  <FormControl><Input placeholder="e.g. 2100 Account Mgmt" {...field} /></FormControl>
                </FormItem>
              )}
            />
            {/* Link to Job Description */}
            <FormField
              control={form.control}
              name="jobDescriptionLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link to Job Description</FormLabel>
                  <FormControl><Textarea rows={2} placeholder="https://docs.google.com/..." {...field} /></FormControl>
                </FormItem>
              )}
            />
            {/* Level */}
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid">Mid</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="principal">Principal</SelectItem>
                      <SelectItem value="director">Director</SelectItem>
                      <SelectItem value="vp">VP</SelectItem>
                      <SelectItem value="c_level">C-Level</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description *</FormLabel>
                  <FormControl><Textarea rows={4} placeholder="Describe the role..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Requirements */}
            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirements *</FormLabel>
                  <FormControl><Textarea rows={4} placeholder="List the requirements..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Hiring Team */}
            <UserPicker
              selectedIds={hiringTeamIds}
              onChange={setHiringTeamIds}
              label="Hiring Team (Full Access)"
              placeholder="Search team members…"
            />

            {/* Visibility */}
            <UserPicker
              selectedIds={visibilityIds}
              onChange={setVisibilityIds}
              label="Job Visibility (Read-only)"
              placeholder="Add employees for visibility…"
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditJobDialog;
