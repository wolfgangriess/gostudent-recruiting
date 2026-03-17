import { BaseMockAdapter } from "./base-mock";
import {
  JobBoardProvider,
  PostingStatus,
  type JobPayload,
  type JobPostingResult,
  type ImportedApplication,
  type JobAnalytics,
} from "../types";

export class LinkedInAdapter extends BaseMockAdapter {
  provider = JobBoardProvider.LINKEDIN as const;

  async publishJob(job: JobPayload, _config?: Record<string, unknown>): Promise<JobPostingResult> {
    await this.delay(1500);
    const externalId = `li_${this.randomId()}`;
    return {
      externalId,
      postingUrl: `https://www.linkedin.com/jobs/view/${externalId}`,
      status: PostingStatus.PUBLISHED,
    };
  }

  /** LinkedIn doesn't support in-place updates – must close & republish */
  async updateJob(_externalId: string, _job: JobPayload): Promise<JobPostingResult> {
    throw new Error("LinkedIn does not support in-place job updates. Close and republish instead.");
  }

  /** LinkedIn Easy Apply sends applications via webhook, not pull API */
  async importApplications(_externalId: string): Promise<ImportedApplication[]> {
    await this.delay(400);
    return [];
  }

  async syncAnalytics(_externalId: string): Promise<JobAnalytics> {
    await this.delay(600);
    return {
      views: Math.floor(Math.random() * 1200) + 100,
      applications: Math.floor(Math.random() * 40) + 5,
      clicks: Math.floor(Math.random() * 400) + 30,
    };
  }
}
