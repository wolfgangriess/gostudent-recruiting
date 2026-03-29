export type WorkplaceType = "onsite" | "remote" | "hybrid";
export type EmploymentType = "full-time" | "part-time" | "contract" | "internship";
export type WorkerType = "regular" | "internship_trainee" | "fixed_term" | "freelancer";
export type JobStatus = "open" | "closed" | "draft";
export type UserRole = "admin" | "hiring_manager" | "employee";
export type RatingType = "scale" | "yes_no" | "text";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
}

export interface ScorecardCriterion {
  id: string;
  question: string;
  ratingType: RatingType;
  weight?: number;
}

export interface ScorecardTemplate {
  id: string;
  stageId: string;
  criteria: ScorecardCriterion[];
}

export interface ScorecardEvaluation {
  id: string;
  candidateId: string;
  stageId: string;
  evaluatorId: string;
  scores: Record<string, number | boolean | string>; // criterionId -> value
  feedback: string;
  completedAt: string;
  createdAt: string;
}

export interface Job {
  id: string;
  name: string;
  externalName?: string;
  department: string;
  office?: string;
  location: string;
  requisitionId?: string;
  workplaceType: WorkplaceType;
  workerType: WorkerType;
  employmentType: EmploymentType;
  workSchedule?: string;
  numberOfOpenings: number;
  reportsTo?: string;
  salaryCurrency?: string;
  salaryMin?: number;
  salaryMax?: number;
  costCenter?: string;
  jobDescriptionLink?: string;
  level?: string;
  description: string;
  requirements: string;
  hiringManager: string;
  recruiters: string[];
  hiringTeamIds: string[];
  visibilityIds: string[];
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
  /** Actual salary offered to this candidate. If undefined, falls back to midpoint. */
  offeredSalary?: number;
  /**
   * ISO datetime when the candidate last changed pipeline stage.
   * TODO: Populate this field when stage transitions are recorded in Supabase.
   * Used for performance trend chart binning (falls back to appliedAt until populated).
   */
  stageChangedAt?: string;
  /**
   * ISO datetime of the candidate's next scheduled interview.
   * TODO: Replace getInterviewDateTime hash fallback with this field once
   * interviews are stored in the Supabase interviews table.
   */
  scheduledAt?: string;
  /** Google Drive file ID of the uploaded CV */
  cvDriveId?: string;
  /** Public view URL for the CV in Google Drive */
  cvUrl?: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  jobId: string;
  order: number;
  ownerId?: string;
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
