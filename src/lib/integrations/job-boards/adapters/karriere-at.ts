import { BaseMockAdapter } from "./base-mock";
import {
  JobBoardProvider,
  PostingStatus,
  type JobPayload,
  type JobPostingResult,
  type ImportedApplication,
  type JobAnalytics,
} from "../types";

export class KarriereAtAdapter extends BaseMockAdapter {
  provider = JobBoardProvider.KARRIERE_AT as const;

  async publishJob(job: JobPayload, _config?: Record<string, unknown>): Promise<JobPostingResult> {
    await this.delay(1000);
    const externalId = `ka_${this.randomId()}`;
    const slug = job.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    return {
      externalId,
      postingUrl: `https://www.karriere.at/jobs/${slug}-${externalId}`,
      status: PostingStatus.PUBLISHED,
    };
  }

  async importApplications(_externalId: string): Promise<ImportedApplication[]> {
    await this.delay(800);
    return [
      {
        externalId: this.randomId(),
        firstName: "Elisabeth",
        lastName: "Huber",
        email: "elisabeth.huber@example.com",
        phone: "+43 664 9876543",
        appliedAt: new Date(),
        source: "Karriere.at",
      },
      {
        externalId: this.randomId(),
        firstName: "Maximilian",
        lastName: "Gruber",
        email: "maximilian.gruber@example.com",
        resumeUrl: "https://karriere.at/cv/maximilian-gruber.pdf",
        appliedAt: new Date(Date.now() - 86400000),
        source: "Karriere.at",
      },
    ];
  }

  async syncAnalytics(_externalId: string): Promise<JobAnalytics> {
    await this.delay(500);
    return {
      views: Math.floor(Math.random() * 400) + 40,
      applications: Math.floor(Math.random() * 15) + 2,
      clicks: Math.floor(Math.random() * 150) + 10,
    };
  }
}
