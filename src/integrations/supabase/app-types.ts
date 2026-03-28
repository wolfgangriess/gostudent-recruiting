/**
 * TypeScript Row types for the ATS core tables added in migration
 * 20260328000000_add_ats_tables.sql.
 *
 * These supplement src/integrations/supabase/types.ts which is auto-generated
 * and only covers the tables created in the initial Lovable migrations.
 */

export type WorkplaceType = "onsite" | "remote" | "hybrid";
export type WorkerType = "regular" | "internship_trainee" | "fixed_term" | "freelancer";
export type EmploymentType = "full-time" | "part-time" | "contract" | "internship";
export type JobStatus = "open" | "closed" | "draft";
export type OfferStatus = "pending" | "approved" | "rejected";

// ---------- Jobs ----------

export interface JobRow {
  id: string;
  name: string;
  external_name: string | null;
  department: string;
  office: string | null;
  location: string;
  requisition_id: string | null;
  workplace_type: WorkplaceType;
  worker_type: WorkerType;
  employment_type: EmploymentType;
  work_schedule: string | null;
  number_of_openings: number;
  reports_to: string | null;
  salary_currency: string | null;
  salary_min: number | null;
  salary_max: number | null;
  cost_center: string | null;
  job_description_link: string | null;
  level: string | null;
  description: string;
  requirements: string;
  hiring_manager: string | null;
  recruiters: string[];
  hiring_team_ids: string[];
  visibility_ids: string[];
  status: JobStatus;
  created_at: string;
  updated_at: string;
}

export type JobInsert = Omit<JobRow, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type JobUpdate = Partial<JobInsert>;

// ---------- Pipeline Stages ----------

export interface PipelineStageRow {
  id: string;
  name: string;
  job_id: string;
  order: number;
  owner_id: string | null;
  created_at: string;
}

export type PipelineStageInsert = Omit<PipelineStageRow, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

// ---------- Candidates ----------

export interface CandidateRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  job_id: string;
  current_stage_id: string | null;
  source: string;
  rating: number;
  applied_at: string;
  avatar_url: string | null;
  offered_salary: number | null;
  stage_changed_at: string | null;
  scheduled_at: string | null;
  cv_drive_id: string | null;
  cv_url: string | null;
  created_at: string;
  updated_at: string;
}

export type CandidateInsert = Omit<CandidateRow, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type CandidateUpdate = Partial<CandidateInsert>;

/** CandidateRow enriched with joined job name and stage name */
export interface CandidateWithMeta extends CandidateRow {
  job_name?: string;
  stage_name?: string;
}

// ---------- Scorecard Templates ----------

export interface ScorecardCriterionRow {
  id: string;
  question: string;
  ratingType: "scale" | "yes_no" | "text";
  weight?: number;
}

export interface ScorecardTemplateRow {
  id: string;
  stage_id: string;
  criteria: ScorecardCriterionRow[];
  created_at: string;
  updated_at: string;
}

export type ScorecardTemplateInsert = Omit<ScorecardTemplateRow, "id" | "created_at" | "updated_at"> & {
  id?: string;
};

// ---------- Scorecard Evaluations ----------

export interface ScorecardEvaluationRow {
  id: string;
  candidate_id: string;
  stage_id: string;
  evaluator_id: string | null;
  scores: Record<string, number | boolean | string>;
  feedback: string;
  completed_at: string;
  created_at: string;
}

export type ScorecardEvaluationInsert = Omit<ScorecardEvaluationRow, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

// ---------- Offers ----------

export interface OfferRow {
  id: string;
  candidate_id: string;
  job_id: string;
  offered_salary: number;
  status: OfferStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type OfferInsert = Omit<OfferRow, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type OfferUpdate = Partial<OfferInsert>;
