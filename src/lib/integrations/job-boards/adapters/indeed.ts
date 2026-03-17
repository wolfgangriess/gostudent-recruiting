import { BaseMockAdapter } from "./base-mock";
import {
  JobBoardProvider,
  PostingStatus,
  type JobPayload,
  type JobPostingResult,
  type ImportedApplication,
  type JobAnalytics,
} from "../types";

export class IndeedAdapter extends BaseMockAdapter {
  provider = JobBoardProvider.INDEED as const;

  async publishJob(job: JobPayload, config?: Record<string, unknown>): Promise<JobPostingResult> {
    await this.delay(1300);
    const externalId = `ind_${this.randomId()}`;
    const country = (config?.country as string) || "de";
    return {
      externalId,
      postingUrl: `https://${country}.indeed.com/viewjob?jk=${externalId}`,
      status: PostingStatus.PUBLISHED,
    };
  }

  /** Indeed sends applications via email or webhook */
  async importApplications(_externalId: string): Promise<ImportedApplication[]> {
    await this.delay(400);
    return [];
  }

  async syncAnalytics(_externalId: string): Promise<JobAnalytics> {
    await this.delay(500);
    return {
      views: Math.floor(Math.random() * 800) + 80,
      applications: Math.floor(Math.random() * 25) + 3,
      clicks: Math.floor(Math.random() * 350) + 25,
    };
  }
}
