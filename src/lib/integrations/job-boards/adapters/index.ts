import { BaseMockAdapter } from "./base-mock";
import {
  JobBoardProvider,
  PostingStatus,
  type JobPayload,
  type JobPostingResult,
  type ImportedApplication,
  type JobAnalytics,
} from "../types";

// ─────────────────────────────────────────────────────────────────
// A. GoStudent Careers – internal careers page
// ─────────────────────────────────────────────────────────────────

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
}

// ─────────────────────────────────────────────────────────────────
// B. LinkedIn – professional network
// ─────────────────────────────────────────────────────────────────

export class LinkedInAdapter extends BaseMockAdapter {
  provider = JobBoardProvider.LINKEDIN as const;

  async publishJob(job: JobPayload, config?: Record<string, unknown>): Promise<JobPostingResult> {
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
    // Applications arrive via LinkedIn Easy Apply webhook
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

// ─────────────────────────────────────────────────────────────────
// C. Indeed – world's largest job site
// ─────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────
// D. InfoJobs – Spain & Italy
// ─────────────────────────────────────────────────────────────────

export class InfoJobsAdapter extends BaseMockAdapter {
  provider = JobBoardProvider.INFOJOBS as const;

  async publishJob(job: JobPayload, _config?: Record<string, unknown>): Promise<JobPostingResult> {
    await this.delay(1100);
    const externalId = `ij_${this.randomId()}`;
    return {
      externalId,
      postingUrl: `https://www.infojobs.net/oferta/${externalId}`,
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
    ];
  }
}

// ─────────────────────────────────────────────────────────────────
// E. StepStone – Germany & Northern Europe
// ─────────────────────────────────────────────────────────────────

export class StepStoneAdapter extends BaseMockAdapter {
  provider = JobBoardProvider.STEPSTONE as const;

  async publishJob(job: JobPayload, _config?: Record<string, unknown>): Promise<JobPostingResult> {
    await this.delay(1200);
    const externalId = `ss_${this.randomId()}`;
    return {
      externalId,
      postingUrl: `https://www.stepstone.de/stellenangebote--${externalId}`,
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
    ];
  }
}

// ─────────────────────────────────────────────────────────────────
// F. Karriere.at – Austria
// ─────────────────────────────────────────────────────────────────

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
    ];
  }
}

// ─────────────────────────────────────────────────────────────────
// G. Kariyer.net – Turkey
// ─────────────────────────────────────────────────────────────────

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
    ];
  }
}
