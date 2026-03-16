import { create } from "zustand";
import { Job, Candidate, PipelineStage, User, ScorecardTemplate, ScorecardCriterion, ScorecardEvaluation } from "./types";
import { initialJobs, initialCandidates, initialStages, initialUsers, initialScorecardTemplates } from "./mock-data";

export interface Interview {
  id: string;
  candidateId: string;
  jobId: string;
  stageId: string;
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
  meetingLink?: string;
  description?: string;
  googleEventId?: string;
  status: "scheduled" | "completed" | "cancelled";
  attendees: { email: string; name: string }[];
  createdAt: string;
}

interface ATSStore {
  // Data
  jobs: Job[];
  candidates: Candidate[];
  stages: PipelineStage[];
  users: User[];
  scorecardTemplates: ScorecardTemplate[];
  evaluations: ScorecardEvaluation[];
  interviews: Interview[];

  // Google Calendar
  googleCalendarConnected: boolean;
  googleCalendarEmail: string | null;
  connectGoogleCalendar: (email: string) => void;
  disconnectGoogleCalendar: () => void;

  // Jobs
  addJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;

  // Candidates
  addCandidate: (candidate: Candidate) => void;
  moveCandidateToStage: (candidateId: string, newStageId: string) => void;
  getCandidatesForStage: (stageId: string) => Candidate[];
  getNewCandidatesCount: (jobId: string) => number;
  getTotalCandidatesCount: (jobId: string) => number;

  // Stages
  addStage: (jobId: string, name: string, ownerId?: string) => void;
  removeStage: (stageId: string) => void;
  renameStage: (stageId: string, name: string) => void;
  reorderStages: (jobId: string, orderedIds: string[]) => void;
  setStageOwner: (stageId: string, ownerId: string | undefined) => void;

  // Scorecards
  setScorecardTemplate: (stageId: string, criteria: ScorecardCriterion[]) => void;
  getScorecardTemplate: (stageId: string) => ScorecardTemplate | undefined;
  addEvaluation: (evaluation: ScorecardEvaluation) => void;
  getEvaluationsForCandidate: (candidateId: string, stageId?: string) => ScorecardEvaluation[];

  // Interviews
  addInterview: (interview: Interview) => void;
  updateInterviewStatus: (id: string, status: Interview["status"]) => void;
  getInterviewsForCandidate: (candidateId: string) => Interview[];

  // Users
  getUserById: (id: string) => User | undefined;
}

export const useATSStore = create<ATSStore>((set, get) => ({
  jobs: initialJobs,
  candidates: initialCandidates,
  stages: initialStages,
  users: initialUsers,
  scorecardTemplates: initialScorecardTemplates,
  evaluations: [],

  addJob: (job) => set((s) => ({ jobs: [...s.jobs, job] })),
  updateJob: (id, updates) =>
    set((s) => ({
      jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...updates } : j)),
    })),

  addCandidate: (candidate) => set((s) => ({ candidates: [...s.candidates, candidate] })),

  moveCandidateToStage: (candidateId, newStageId) =>
    set((s) => ({
      candidates: s.candidates.map((c) =>
        c.id === candidateId ? { ...c, currentStageId: newStageId, updatedAt: new Date().toISOString() } : c
      ),
    })),
  getCandidatesForStage: (stageId) => get().candidates.filter((c) => c.currentStageId === stageId),
  getNewCandidatesCount: (jobId) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return get().candidates.filter((c) => c.jobId === jobId && new Date(c.appliedAt) >= weekAgo).length;
  },
  getTotalCandidatesCount: (jobId) => get().candidates.filter((c) => c.jobId === jobId).length,

  addStage: (jobId, name, ownerId) =>
    set((s) => {
      const jobStages = s.stages.filter((st) => st.jobId === jobId);
      const maxOrder = jobStages.length > 0 ? Math.max(...jobStages.map((st) => st.order)) : -1;
      const newStage: PipelineStage = {
        id: `${jobId}-stage-${Date.now()}`,
        name,
        jobId,
        order: maxOrder + 1,
        ownerId,
      };
      return { stages: [...s.stages, newStage] };
    }),
  removeStage: (stageId) =>
    set((s) => ({
      stages: s.stages.filter((st) => st.id !== stageId),
      candidates: s.candidates.map((c) =>
        c.currentStageId === stageId ? { ...c, currentStageId: "" } : c
      ),
      scorecardTemplates: s.scorecardTemplates.filter((t) => t.stageId !== stageId),
    })),
  renameStage: (stageId, name) =>
    set((s) => ({
      stages: s.stages.map((st) => (st.id === stageId ? { ...st, name } : st)),
    })),
  reorderStages: (jobId, orderedIds) =>
    set((s) => ({
      stages: s.stages.map((st) => {
        if (st.jobId !== jobId) return st;
        const newOrder = orderedIds.indexOf(st.id);
        return newOrder >= 0 ? { ...st, order: newOrder } : st;
      }),
    })),
  setStageOwner: (stageId, ownerId) =>
    set((s) => ({
      stages: s.stages.map((st) => (st.id === stageId ? { ...st, ownerId } : st)),
    })),

  setScorecardTemplate: (stageId, criteria) =>
    set((s) => {
      const existing = s.scorecardTemplates.find((t) => t.stageId === stageId);
      if (existing) {
        return {
          scorecardTemplates: s.scorecardTemplates.map((t) =>
            t.stageId === stageId ? { ...t, criteria } : t
          ),
        };
      }
      return {
        scorecardTemplates: [
          ...s.scorecardTemplates,
          { id: `sc-${Date.now()}`, stageId, criteria },
        ],
      };
    }),
  getScorecardTemplate: (stageId) =>
    get().scorecardTemplates.find((t) => t.stageId === stageId),

  addEvaluation: (evaluation) =>
    set((s) => ({ evaluations: [...s.evaluations, evaluation] })),
  getEvaluationsForCandidate: (candidateId, stageId) => {
    const evals = get().evaluations.filter((e) => e.candidateId === candidateId);
    return stageId ? evals.filter((e) => e.stageId === stageId) : evals;
  },

  getUserById: (id) => get().users.find((u) => u.id === id),
}));
