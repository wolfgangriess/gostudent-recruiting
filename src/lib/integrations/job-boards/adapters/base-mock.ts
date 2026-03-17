import {
  type JobBoardAdapter,
  type JobPayload,
  type JobPostingResult,
  type ImportedApplication,
  type JobAnalytics,
  type JobBoardProvider,
  PostingStatus,
} from "../types";

/**
 * Base mock adapter – simulates a job board API with realistic delays.
 * Each concrete provider extends this and can override behaviour.
 */
export abstract class BaseMockAdapter implements JobBoardAdapter {
  abstract provider: JobBoardProvider;

  protected delay(ms = 800): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  protected randomId(): string {
    return `ext_${Math.random().toString(36).slice(2, 10)}`;
  }

  async publishJob(job: JobPayload, _config?: Record<string, unknown>): Promise<JobPostingResult> {
    await this.delay(1200);
    const externalId = this.randomId();
    return {
      externalId,
      postingUrl: `https://${this.provider}.example.com/jobs/${externalId}`,
      status: PostingStatus.PUBLISHED,
    };
  }

  async updateJob(externalId: string, _job: JobPayload): Promise<JobPostingResult> {
    await this.delay(800);
    return {
      externalId,
      postingUrl: `https://${this.provider}.example.com/jobs/${externalId}`,
      status: PostingStatus.PUBLISHED,
    };
  }

  async closeJob(_externalId: string): Promise<void> {
    await this.delay(600);
  }

  async importApplications(_externalId: string): Promise<ImportedApplication[]> {
    await this.delay(1000);
    return [
      {
        externalId: this.randomId(),
        firstName: "Maria",
        lastName: "García",
        email: "maria.garcia@example.com",
        appliedAt: new Date(),
        source: this.provider,
      },
      {
        externalId: this.randomId(),
        firstName: "Stefan",
        lastName: "Müller",
        email: "stefan.mueller@example.com",
        phone: "+49 170 1234567",
        linkedinUrl: "https://linkedin.com/in/stefanmueller",
        appliedAt: new Date(Date.now() - 86400000),
        source: this.provider,
      },
    ];
  }

  async syncAnalytics(_externalId: string): Promise<JobAnalytics> {
    await this.delay(500);
    return {
      views: Math.floor(Math.random() * 500) + 50,
      applications: Math.floor(Math.random() * 30) + 2,
      clicks: Math.floor(Math.random() * 200) + 20,
    };
  }

  async validateCredentials(): Promise<boolean> {
    await this.delay(400);
    return true;
  }
}
