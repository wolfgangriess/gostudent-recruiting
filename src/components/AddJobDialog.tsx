import { useState } from "react";
import { useForm } from "react-hook-form";
import { useATSStore } from "@/lib/ats-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useATSStore } from "@/lib/ats-store";
import { DEPARTMENTS, LOCATIONS, PIPELINE_STAGES } from "@/lib/types";
import UserPicker from "@/components/UserPicker";
import StageConfigurator from "@/components/StageConfigurator";

const jobSchema = z.object({
  name: z.string().trim().min(1, "Job name is required").max(100),
  department: z.string().min(1, "Department is required"),
  location: z.string().min(1, "Location is required"),
  workplaceType: z.enum(["onsite", "remote", "hybrid"]),
  workerType: z.enum(["regular", "internship_trainee", "fixed_term", "freelancer"]),
  employmentType: z.enum(["full-time", "part-time", "contract", "internship"]),
  numberOfOpenings: z.coerce.number().int().min(1),
  reportsTo: z.string().optional(),
  salaryMin: z.coerce.number().min(0).optional().or(z.literal("")),
  salaryMax: z.coerce.number().min(0).optional().or(z.literal("")),
  description: z.string().max(2000),
  requirements: z.string().max(2000),
});

type JobFormValues = z.infer<typeof jobSchema>;

export interface StageConfig {
  tempId: string;
  name: string;
  ownerId?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultStages: StageConfig[] = PIPELINE_STAGES.map((name, i) => ({
  tempId: `new-stage-${i}`,
  name,
}));

const AddJobDialog = ({ open, onOpenChange }: Props) => {
  const { addJob, addStage, setStageOwner } = useATSStore();
  const [hiringTeamIds, setHiringTeamIds] = useState<string[]>([]);
  const [visibilityIds, setVisibilityIds] = useState<string[]>([]);
  const [stageConfigs, setStageConfigs] = useState<StageConfig[]>(defaultStages);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      name: "",
      department: "",
      location: "",
      workplaceType: "onsite",
      workerType: "regular",
      employmentType: "full-time",
      numberOfOpenings: 1,
      description: "",
      requirements: "",
    },
  });

  const onSubmit = (values: JobFormValues) => {
    const now = new Date().toISOString();
    const jobId = `job-${Date.now()}`;

    addJob({
      id: jobId,
      name: values.name,
      department: values.department,
      location: values.location,
      workplaceType: values.workplaceType,
      workerType: values.workerType,
      employmentType: values.employmentType,
      numberOfOpenings: values.numberOfOpenings,
      description: values.description,
      requirements: values.requirements,
      hiringManager: "",
      recruiters: [],
      hiringTeamIds,
      visibilityIds,
      status: "open",
      createdAt: now,
      updatedAt: now,
    });

    // Create stages
    stageConfigs.forEach((sc) => {
      addStage(jobId, sc.name, sc.ownerId);
    });

    form.reset();
    setHiringTeamIds([]);
    setVisibilityIds([]);
    setStageConfigs(defaultStages);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Job</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Basic Info */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Name *</FormLabel>
                  <FormControl><Input placeholder="e.g. Senior Frontend Engineer" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="workplaceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workplace</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="onsite">Onsite</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="workerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Worker Type</FormLabel>
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
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="employmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
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
              <FormField
                control={form.control}
                name="numberOfOpenings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Openings</FormLabel>
                    <FormControl><Input type="number" min={1} {...field} /></FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea rows={3} placeholder="Job description..." {...field} /></FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirements</FormLabel>
                  <FormControl><Textarea rows={2} placeholder="Job requirements..." {...field} /></FormControl>
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

            <Separator />

            {/* Recruiting Stages */}
            <StageConfigurator
              stages={stageConfigs}
              onChange={setStageConfigs}
              hiringTeamIds={hiringTeamIds}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Job</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddJobDialog;
