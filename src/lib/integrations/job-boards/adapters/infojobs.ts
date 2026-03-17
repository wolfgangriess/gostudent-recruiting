import { BaseMockAdapter } from "./base-mock";
import {
  JobBoardProvider,
  PostingStatus,
  type JobPayload,
  type JobPostingResult,
  type ImportedApplication,
  type JobAnalytics,
} from "../types";

export class InfoJobsAdapter extends BaseMockAdapter {
  provider = JobBoardProvider.INFOJOBS as const;

  async publishJob(job: JobPayload, config?: Record<string, unknown>): Promise<JobPostingResult> {
    await this.delay(1100);
    const externalId = `ij_${this.randomId()}`;
    const country = (config?.country as string) || "ES";
    const domain = country === "IT" ? "infojobs.it" : "infojobs.net";
    return {
      externalId,
      postingUrl: `https://www.${domain}/oferta/${externalId}`,
      status: PostingStatus.PUBLISHED,
    };
  }

  async importApplications(_externalId: string): Promise<ImportedApplication[]> {
    await this.delay(900);
    return [
      {
        externalId: this.randomId(),
        firstName: "Carlos",
        lastName: "Martínez",
        email: "carlos.martinez@example.com",
        phone: "+34 612 345 678",
        appliedAt: new Date(),
        source: "InfoJobs",
      },
      {
        externalId: this.randomId(),
        firstName: "María",
        lastName: "García López",
        email: "maria.garcia@example.com",
        phone: "+34 654 321 987",
        resumeUrl: "https://www.infojobs.net/cv/maria-garcia.pdf",
        appliedAt: new Date(Date.now() - 43200000),
        source: "InfoJobs",
      },
    ];
  }

  async syncAnalytics(_externalId: string): Promise<JobAnalytics> {
    await this.delay(500);
    return {
      views: Math.floor(Math.random() * 600) + 60,
      applications: Math.floor(Math.random() * 30) + 4,
      clicks: Math.floor(Math.random() * 250) + 20,
    };
  }
}
