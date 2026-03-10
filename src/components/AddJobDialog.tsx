import { useForm } from "react-hook-form";
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
import { Label } from "@/components/ui/label";
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
import { useATSStore } from "@/lib/ats-store";
import { DEPARTMENTS, LOCATIONS } from "@/lib/types";

const jobSchema = z.object({
  name: z.string().trim().min(1, "Job name is required").max(100),
  department: z.string().min(1, "Department is required"),
  location: z.string().min(1, "Location is required"),
  workplaceType: z.enum(["onsite", "remote", "hybrid"]),
  employmentType: z.enum(["full-time", "part-time", "contract", "internship"]),
  numberOfOpenings: z.coerce.number().int().min(1),
  description: z.string().max(2000),
  requirements: z.string().max(2000),
  hiringManager: z.string().max(100).default(""),
});

type JobFormValues = z.infer<typeof jobSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddJobDialog = ({ open, onOpenChange }: Props) => {
  const addJob = useATSStore((s) => s.addJob);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      name: "",
      department: "",
      location: "",
      workplaceType: "onsite",
      employmentType: "full-time",
      numberOfOpenings: 1,
      description: "",
      requirements: "",
      hiringManager: "",
    },
  });

  const onSubmit = (values: JobFormValues) => {
    const now = new Date().toISOString();
    addJob({
      id: `job-${Date.now()}`,
      ...values,
      recruiters: [],
      status: "open",
      createdAt: now,
      updatedAt: now,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Job</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DEPARTMENTS.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
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
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LOCATIONS.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="workplaceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workplace</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
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
                name="employmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
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
            <FormField
              control={form.control}
              name="hiringManager"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hiring Manager</FormLabel>
                  <FormControl><Input placeholder="Name" {...field} /></FormControl>
                </FormItem>
              )}
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
