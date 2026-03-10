export type WorkplaceType = "onsite" | "remote" | "hybrid";
export type EmploymentType = "full-time" | "part-time" | "contract" | "internship";
export type JobStatus = "open" | "closed" | "draft";

export interface Job {
  id: string;
  name: string;
  department: string;
  location: string;
  workplaceType: WorkplaceType;
  employmentType: EmploymentType;
  numberOfOpenings: number;
  description: string;
  requirements: string;
  hiringManager: string;
  recruiters: string[];
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobId: string;
  currentStageId: string;
  source: string;
  rating: number;
  appliedAt: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  jobId: string;
  order: number;
}

export type StageName = "Applied" | "Phone Screen" | "Interview" | "Offer" | "Hired";

export const PIPELINE_STAGES: StageName[] = [
  "Applied",
  "Phone Screen",
  "Interview",
  "Offer",
  "Hired",
];

export const DEPARTMENTS = [
  "Engineering",
  "Design",
  "Marketing",
  "Sales",
  "Product",
  "Operations",
  "Finance",
  "Human Resources",
];

export const LOCATIONS = [
  "San Francisco, CA",
  "New York, NY",
  "Austin, TX",
  "Seattle, WA",
  "London, UK",
  "Berlin, DE",
  "Remote",
];
