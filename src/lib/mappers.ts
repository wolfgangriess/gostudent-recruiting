/**
 * Mapper functions to convert Supabase snake_case rows to the camelCase
 * app types defined in lib/types.ts.
 *
 * These are used by the Supabase query hooks so that all existing UI
 * components continue to work with familiar camelCase fields.
 */

import type {
  CandidateRow,
  JobRow,
  PipelineStageRow,
  ScorecardEvaluationRow,
  OfferRow,
} from "@/integrations/supabase/app-types";
import type { Tables } from "@/integrations/supabase/types";
import type { Candidate, Job, PipelineStage, User, ScorecardEvaluation } from "@/lib/types";

type ProfileRow = Tables<"profiles">;

// ---------- Candidate ----------

export function mapCandidate(row: CandidateRow): Candidate {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    jobId: row.job_id,
    currentStageId: row.current_stage_id ?? "",
    source: row.source,
    rating: row.rating,
    appliedAt: row.applied_at,
    avatarUrl: row.avatar_url ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    offeredSalary: row.offered_salary ?? undefined,
    stageChangedAt: row.stage_changed_at ?? undefined,
    scheduledAt: row.scheduled_at ?? undefined,
  };
}

export function mapCandidates(rows: CandidateRow[]): Candidate[] {
  return rows.map(mapCandidate);
}

// ---------- Job ----------

export function mapJob(row: JobRow): Job {
  return {
    id: row.id,
    name: row.name,
    externalName: row.external_name ?? undefined,
    department: row.department,
    office: row.office ?? undefined,
    location: row.location,
    requisitionId: row.requisition_id ?? undefined,
    workplaceType: row.workplace_type,
    workerType: row.worker_type,
    employmentType: row.employment_type,
    workSchedule: row.work_schedule ?? undefined,
    numberOfOpenings: row.number_of_openings,
    reportsTo: row.reports_to ?? undefined,
    salaryCurrency: row.salary_currency ?? undefined,
    salaryMin: row.salary_min ?? undefined,
    salaryMax: row.salary_max ?? undefined,
    costCenter: row.cost_center ?? undefined,
    jobDescriptionLink: row.job_description_link ?? undefined,
    level: row.level ?? undefined,
    description: row.description,
    requirements: row.requirements,
    hiringManager: row.hiring_manager ?? "",
    recruiters: row.recruiters,
    hiringTeamIds: row.hiring_team_ids,
    visibilityIds: row.visibility_ids,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapJobs(rows: JobRow[]): Job[] {
  return rows.map(mapJob);
}

// ---------- PipelineStage ----------

export function mapStage(row: PipelineStageRow): PipelineStage {
  return {
    id: row.id,
    name: row.name,
    jobId: row.job_id,
    order: row.order,
    ownerId: row.owner_id ?? undefined,
  };
}

export function mapStages(rows: PipelineStageRow[]): PipelineStage[] {
  return rows.map(mapStage);
}

// ---------- User (from profiles) ----------

export function mapUser(profile: ProfileRow & { role?: string | null }): User {
  return {
    id: profile.id,
    firstName: profile.first_name ?? "",
    lastName: profile.last_name ?? "",
    email: profile.email ?? "",
    role: (profile.role as User["role"]) ?? "employee",
    department: "", // profiles table has no department column; TODO: add if needed
    avatarUrl: undefined,
  };
}

export function mapUsers(rows: (ProfileRow & { role?: string | null })[]): User[] {
  return rows.map(mapUser);
}

// ---------- ScorecardEvaluation ----------

export function mapEvaluation(row: ScorecardEvaluationRow): ScorecardEvaluation {
  return {
    id: row.id,
    candidateId: row.candidate_id,
    stageId: row.stage_id,
    evaluatorId: row.evaluator_id ?? "",
    scores: row.scores as Record<string, number | boolean | string>,
    feedback: row.feedback,
    completedAt: row.completed_at,
    createdAt: row.created_at,
  };
}

// ---------- Offer (pass-through, already a clean type) ----------

export { type OfferRow };
