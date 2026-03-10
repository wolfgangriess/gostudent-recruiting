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
}));
