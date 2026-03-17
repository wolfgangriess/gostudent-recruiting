import {
  type JobBoardAdapter,
  type JobPayload,
  type JobPostingResult,
  type ImportedApplication,
  type JobAnalytics,
  JobBoardProvider,
} from "./types";
import {
  GoStudentCareersAdapter,
  LinkedInAdapter,
  IndeedAdapter,
  InfoJobsAdapter,
  StepStoneAdapter,
  KarriereAtAdapter,
  KariyerAdapter,
} from "./adapters";

export interface MultiPublishResult {
  provider: JobBoardProvider;
  result?: JobPostingResult;
  error?: string;
}

/**
 * Central service that routes job board operations to the correct adapter.
 * Uses the Strategy pattern – each provider has its own adapter implementation.
 */
export class JobBoardService {
  private adapters: Map<JobBoardProvider, JobBoardAdapter>;

  constructor() {
    this.adapters = new Map<JobBoardProvider, JobBoardAdapter>([
      [JobBoardProvider.GOSTUDENT_CAREERS, new GoStudentCareersAdapter()],
      [JobBoardProvider.LINKEDIN, new LinkedInAdapter()],
      [JobBoardProvider.INDEED, new IndeedAdapter()],
      [JobBoardProvider.INFOJOBS, new InfoJobsAdapter()],
      [JobBoardProvider.STEPSTONE, new StepStoneAdapter()],
      [JobBoardProvider.KARRIERE_AT, new KarriereAtAdapter()],
      [JobBoardProvider.KARIYER, new KariyerAdapter()],
    ]);
  }

  private getAdapter(provider: JobBoardProvider): JobBoardAdapter {
    const adapter = this.adapters.get(provider);
    if (!adapter) throw new Error(`No adapter registered for provider: ${provider}`);
    return adapter;
  }

  // ── Single-board operations ──────────────────────────────────

  async publishJob(
    provider: JobBoardProvider,
    job: JobPayload,
    config?: Record<string, unknown>
  ): Promise<JobPostingResult> {
    return this.getAdapter(provider).publishJob(job, config);
  }

  async updateJob(
    provider: JobBoardProvider,
    externalId: string,
    job: JobPayload
  ): Promise<JobPostingResult> {
    return this.getAdapter(provider).updateJob(externalId, job);
  }

  async closeJob(provider: JobBoardProvider, externalId: string): Promise<void> {
    return this.getAdapter(provider).closeJob(externalId);
  }

  async importApplications(
    provider: JobBoardProvider,
    externalId: string
  ): Promise<ImportedApplication[]> {
    return this.getAdapter(provider).importApplications(externalId);
  }

  async syncAnalytics(
    provider: JobBoardProvider,
    externalId: string
  ): Promise<JobAnalytics> {
    return this.getAdapter(provider).syncAnalytics(externalId);
  }

  async validateCredentials(provider: JobBoardProvider): Promise<boolean> {
    return this.getAdapter(provider).validateCredentials();
  }

  // ── Multi-board operations ───────────────────────────────────

  async publishToMultipleBoards(
    providers: JobBoardProvider[],
    job: JobPayload,
    configs?: Map<JobBoardProvider, Record<string, unknown>>
  ): Promise<MultiPublishResult[]> {
    const results = await Promise.allSettled(
      providers.map(async (provider) => {
        const result = await this.publishJob(provider, job, configs?.get(provider));
        return { provider, result } as MultiPublishResult;
      })
    );

    return results.map((settled, i) => {
      if (settled.status === "fulfilled") return settled.value;
      return {
        provider: providers[i],
        error: settled.reason instanceof Error ? settled.reason.message : String(settled.reason),
      };
    });
  }
}

/** Singleton instance */
export const jobBoardService = new JobBoardService();
