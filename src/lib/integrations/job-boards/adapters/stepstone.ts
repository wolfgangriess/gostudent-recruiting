import { BaseMockAdapter } from "./base-mock";
import {
  JobBoardProvider,
  PostingStatus,
  type JobPayload,
  type JobPostingResult,
  type ImportedApplication,
  type JobAnalytics,
} from "../types";

export class StepStoneAdapter extends BaseMockAdapter {
  provider = JobBoardProvider.STEPSTONE as const;

  async publishJob(job: JobPayload, config?: Record<string, unknown>): Promise<JobPostingResult> {
    await this.delay(1200);
    const externalId = `ss_${this.randomId()}`;
    const country = (config?.country as string) || "de";
    const domain = country === "at" ? "stepstone.at" : country === "be" ? "stepstone.be" : "stepstone.de";
    return {
      externalId,
      postingUrl: `https://www.${domain}/stellenangebote--${externalId}`,
      status: PostingStatus.PUBLISHED,
    };
  }

  async importApplications(_externalId: string): Promise<ImportedApplication[]> {
    await this.delay(900);
    return [
      {
        externalId: this.randomId(),
        firstName: "Stefan",
        lastName: "Müller",
        email: "stefan.mueller@example.com",
        phone: "+49 170 1234567",
        resumeUrl: "https://stepstone.de/resumes/stefan-mueller.pdf",
        appliedAt: new Date(),
        source: "StepStone",
      },
      {
        externalId: this.randomId(),
        firstName: "Katharina",
        lastName: "Weber",
        email: "katharina.weber@example.com",
        linkedinUrl: "https://linkedin.com/in/katharina-weber",
        appliedAt: new Date(Date.now() - 172800000),
        source: "StepStone",
      },
    ];
  }

  async syncAnalytics(_externalId: string): Promise<JobAnalytics> {
    await this.delay(600);
    return {
      views: Math.floor(Math.random() * 900) + 90,
      applications: Math.floor(Math.random() * 30) + 5,
      clicks: Math.floor(Math.random() * 400) + 30,
    };
  }
}
