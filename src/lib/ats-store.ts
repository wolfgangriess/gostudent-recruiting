import { create } from "zustand";
import { Job, Candidate, PipelineStage } from "./types";
import { initialJobs, initialCandidates, initialStages } from "./mock-data";

interface ATSStore {
  jobs: Job[];
  candidates: Candidate[];
  stages: PipelineStage[];
  addJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  moveCandidateToStage: (candidateId: string, newStageId: string) => void;
  getCandidatesForStage: (stageId: string) => Candidate[];
  getNewCandidatesCount: (jobId: string) => number;
  getTotalCandidatesCount: (jobId: string) => number;
  addStage: (jobId: string, name: string) => void;
  removeStage: (stageId: string) => void;
  renameStage: (stageId: string, name: string) => void;
  reorderStages: (jobId: string, orderedIds: string[]) => void;
}

export const useATSStore = create<ATSStore>((set, get) => ({
  jobs: initialJobs,
  candidates: initialCandidates,
  stages: initialStages,
  addJob: (job) => set((s) => ({ jobs: [...s.jobs, job] })),
  updateJob: (id, updates) =>
    set((s) => ({
      jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...updates } : j)),
    })),
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
  addStage: (jobId, name) =>
    set((s) => {
      const jobStages = s.stages.filter((st) => st.jobId === jobId);
      const maxOrder = jobStages.length > 0 ? Math.max(...jobStages.map((st) => st.order)) : -1;
      const newStage: PipelineStage = {
        id: `${jobId}-stage-${Date.now()}`,
        name,
        jobId,
        order: maxOrder + 1,
      };
      return { stages: [...s.stages, newStage] };
    }),
  removeStage: (stageId) =>
    set((s) => ({
      stages: s.stages.filter((st) => st.id !== stageId),
      candidates: s.candidates.map((c) =>
        c.currentStageId === stageId ? { ...c, currentStageId: "" } : c
      ),
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
}));
