import { BaseMockAdapter } from "./base-mock";
import {
  JobBoardProvider,
  PostingStatus,
  type JobPayload,
  type JobPostingResult,
  type ImportedApplication,
  type JobAnalytics,
} from "../types";

export class KariyerAdapter extends BaseMockAdapter {
  provider = JobBoardProvider.KARIYER as const;

  async publishJob(job: JobPayload, _config?: Record<string, unknown>): Promise<JobPostingResult> {
    await this.delay(1100);
    const externalId = `kr_${this.randomId()}`;
    return {
      externalId,
      postingUrl: `https://www.kariyer.net/is-ilani/${externalId}`,
      status: PostingStatus.PUBLISHED,
    };
  }

  async importApplications(_externalId: string): Promise<ImportedApplication[]> {
    await this.delay(900);
    return [
      {
        externalId: this.randomId(),
        firstName: "Elif",
        lastName: "Yılmaz",
        email: "elif.yilmaz@example.com",
        phone: "+90 532 123 4567",
        appliedAt: new Date(),
        source: "Kariyer.net",
      },
      {
        externalId: this.randomId(),
        firstName: "Ahmet",
        lastName: "Demir",
        email: "ahmet.demir@example.com",
        linkedinUrl: "https://linkedin.com/in/ahmet-demir",
        appliedAt: new Date(Date.now() - 129600000),
        source: "Kariyer.net",
      },
    ];
  }

  async syncAnalytics(_externalId: string): Promise<JobAnalytics> {
    await this.delay(500);
    return {
      views: Math.floor(Math.random() * 700) + 70,
      applications: Math.floor(Math.random() * 20) + 3,
      clicks: Math.floor(Math.random() * 300) + 20,
    };
  }
}
