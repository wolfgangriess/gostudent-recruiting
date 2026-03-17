import { BaseMockAdapter } from "./base-mock";
import {
  JobBoardProvider,
  PostingStatus,
  type JobPayload,
  type JobPostingResult,
  type ImportedApplication,
  type JobAnalytics,
} from "../types";

export class GoStudentCareersAdapter extends BaseMockAdapter {
  provider = JobBoardProvider.GOSTUDENT_CAREERS as const;

  async publishJob(job: JobPayload, config?: Record<string, unknown>): Promise<JobPostingResult> {
    await this.delay(1000);
    const slug = job.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const externalId = this.randomId();
    const language = (config?.language as string) || "de";
    const country = (config?.country as string) || "DE";
    return {
      externalId,
      postingUrl: `https://www.gostudent.org/${language}-${country.toLowerCase()}/alle-jobs/${slug}-${externalId}`,
      status: PostingStatus.PUBLISHED,
    };
  }

  async importApplications(_externalId: string): Promise<ImportedApplication[]> {
    await this.delay(1000);
    return [
      {
        externalId: this.randomId(),
        firstName: "Anna",
        lastName: "Schneider",
        email: "anna.schneider@example.com",
        phone: "+43 660 1234567",
        resumeUrl: "https://careers.gostudent.com/resumes/anna-schneider.pdf",
        appliedAt: new Date(),
        source: "GoStudent Careers",
      },
      {
        externalId: this.randomId(),
        firstName: "Luca",
        lastName: "Bianchi",
        email: "luca.bianchi@example.com",
        linkedinUrl: "https://linkedin.com/in/lucabianchi",
        appliedAt: new Date(Date.now() - 86400000),
        source: "GoStudent Careers",
      },
    ];
  }

  async syncAnalytics(_externalId: string): Promise<JobAnalytics> {
    await this.delay(500);
    return {
      views: Math.floor(Math.random() * 500) + 50,
      applications: Math.floor(Math.random() * 20) + 2,
      clicks: Math.floor(Math.random() * 200) + 15,
    };
  }
}
