import { useMemo } from "react";
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { useJobs } from "@/hooks/useJobs";
import { useStages } from "@/hooks/useStages";
import { useCreateCandidate } from "@/hooks/useCandidates";
import { DEPARTMENTS, LOCATIONS } from "@/lib/types";
import { toast } from "sonner";

const RELATIONSHIPS = [
  "Former colleague", "Current colleague", "Friend", "Former classmate", "Manager", "Other",
];
const WORK_HISTORY = [
  "Less than 1 year", "1-2 years", "3-5 years", "5+ years", "Never worked together",
];
const RATINGS = [
  "Strong recommend", "Recommend", "Neutral", "Would not recommend",
];
const REACH_OUT_OPTIONS = [
  "As soon as possible", "Within a week", "Within a month", "No preference",
];
const KNOWS_REFERRED = ["Yes", "No", "Not sure"];

const schema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  preferredName: z.string().trim().max(100).optional().or(z.literal("")),
  currentCompany: z.string().trim().max(200).optional().or(z.literal("")),
  currentTitle: z.string().trim().max(200).optional().or(z.literal("")),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  office: z.string().optional(),
  department: z.string().optional(),
  jobId: z.string().min(1, "Job is required"),
  relationship: z.string().optional(),
  workHistory: z.string().optional(),
  rating: z.string().optional(),
  reachOut: z.string().optional(),
  knowsReferred: z.string().optional(),
  referralNotes: z.string().trim().max(2000).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddReferralDialog = ({ open, onOpenChange }: Props) => {
  const { data: jobs = [] } = useJobs();
  const { data: stages = [] } = useStages();
  const createCandidate = useCreateCandidate();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "", lastName: "", preferredName: "", currentCompany: "",
      currentTitle: "", email: "", phone: "", office: "", department: "",
      jobId: "", relationship: "", workHistory: "", rating: "",
      reachOut: "", knowsReferred: "", referralNotes: "",
    },
  });

  const selectedOffice = form.watch("office");
  const selectedDept = form.watch("department");

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (selectedOffice && j.location !== selectedOffice) return false;
      if (selectedDept && j.department !== selectedDept) return false;
      return true;
    });
  }, [jobs, selectedOffice, selectedDept]);

  const onSubmit = (values: FormValues) => {
    const jobStages = stages.filter((s) => s.jobId === values.jobId).sort((a, b) => a.order - b.order);
    const stageId = jobStages[0]?.id;
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
      source: "Referral",
      rating: 0,
      applied_at: new Date().toISOString(),
    });

    toast.success(`Referral for ${values.firstName} ${values.lastName} submitted!`);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a Referral</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Select a Job */}
            <div>
              <h3 className="text-sm font-bold text-foreground mb-1">Select a Job</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Not sure which job? Pick the closest option and make sure to leave a note for the hiring team!
              </p>
            </div>

            <FormField control={form.control} name="office" render={({ field }) => (
              <FormItem>
                <FormLabel>Office</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Filter jobs by office..." /></SelectTrigger></FormControl>
                  <SelectContent>
                    {LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormItem>
            )} />

            <FormField control={form.control} name="department" render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Filter jobs by department..." /></SelectTrigger></FormControl>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormItem>
            )} />

            <FormField control={form.control} name="jobId" render={({ field }) => (
              <FormItem>
                <FormLabel>Job *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a job..." /></SelectTrigger></FormControl>
                  <SelectContent>
                    {filteredJobs.map((j) => <SelectItem key={j.id} value={j.id}>{j.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

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

            <Separator />

            {/* Details */}
            <h3 className="text-sm font-bold text-foreground">Details</h3>

            <FormField control={form.control} name="relationship" render={({ field }) => (
              <FormItem>
                <FormLabel>Relationship</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="How do you know this person?" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {RELATIONSHIPS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormItem>
            )} />

            <FormField control={form.control} name="workHistory" render={({ field }) => (
              <FormItem>
                <FormLabel>Work History</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="How long have you worked with them?" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {WORK_HISTORY.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormItem>
            )} />

            <FormField control={form.control} name="rating" render={({ field }) => (
              <FormItem>
                <FormLabel>Rating</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="How would you rate this person?" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {RATINGS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormItem>
            )} />

            <FormField control={form.control} name="reachOut" render={({ field }) => (
              <FormItem>
                <FormLabel>When we reach out</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select an Option" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {REACH_OUT_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormItem>
            )} />

            <FormField control={form.control} name="knowsReferred" render={({ field }) => (
              <FormItem>
                <FormLabel>They know they're being referred</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Choose..." /></SelectTrigger></FormControl>
                  <SelectContent>
                    {KNOWS_REFERRED.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormItem>
            )} />

            <FormField control={form.control} name="referralNotes" render={({ field }) => (
              <FormItem>
                <FormLabel>Referral Notes</FormLabel>
                <FormControl>
                  <Textarea rows={4} placeholder="Anything else we should know about this referral?" {...field} />
                </FormControl>
              </FormItem>
            )} />

            <p className="text-xs text-muted-foreground">* = required</p>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Add this referral</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddReferralDialog;
