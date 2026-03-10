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
  department: string;
  location: string;
  workplaceType: WorkplaceType;
  employmentType: EmploymentType;
  numberOfOpenings: number;
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
