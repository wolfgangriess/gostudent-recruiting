// ─────────────────────────────────────────────────────────────────
// Job Board Integration Types
// ─────────────────────────────────────────────────────────────────

export enum JobBoardProvider {
  GOSTUDENT_CAREERS = "gostudent_careers",
  LINKEDIN = "linkedin",
  INDEED = "indeed",
  INFOJOBS = "infojobs",
  STEPSTONE = "stepstone",
  KARRIERE_AT = "karriere_at",
  KARIYER = "kariyer",
}

export enum PostingStatus {
  DRAFT = "draft",
  PUBLISHING = "publishing",
  PUBLISHED = "published",
  FAILED = "failed",
  CLOSED = "closed",
  EXPIRED = "expired",
}

export enum SyncType {
  PUBLISH_JOB = "publish_job",
  UPDATE_JOB = "update_job",
  CLOSE_JOB = "close_job",
  IMPORT_APPLICATIONS = "import_applications",
  SYNC_ANALYTICS = "sync_analytics",
}

export enum SyncStatus {
  SUCCESS = "success",
  PARTIAL = "partial",
  FAILED = "failed",
}

// ─────────────────────────────────────────────────────────────────
// Core Adapter Interface (Strategy Pattern)
// ─────────────────────────────────────────────────────────────────

export interface JobPostingResult {
  externalId: string;
  postingUrl: string;
  status: PostingStatus;
}

export interface ImportedApplication {
  externalId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  appliedAt: Date;
  source: string;
}

export interface JobAnalytics {
  views: number;
  applications: number;
  clicks: number;
}

/** Minimal job shape passed to adapters */
export interface JobPayload {
  id: string;
  name: string;
  department: string;
  location: string;
  workplaceType?: string;
  employmentType?: string;
  description?: string;
  requirements?: string;
}

export interface JobBoardAdapter {
  provider: JobBoardProvider;
  publishJob(job: JobPayload, config?: Record<string, unknown>): Promise<JobPostingResult>;
  updateJob(externalId: string, job: JobPayload): Promise<JobPostingResult>;
  closeJob(externalId: string): Promise<void>;
  importApplications(externalId: string): Promise<ImportedApplication[]>;
  syncAnalytics(externalId: string): Promise<JobAnalytics>;
  validateCredentials(): Promise<boolean>;
}

// ─────────────────────────────────────────────────────────────────
// Provider metadata for UI rendering
// ─────────────────────────────────────────────────────────────────

export interface JobBoardMeta {
  provider: JobBoardProvider;
  name: string;
  description: string;
  region: string;
  logoColor: string;
  supportsEasyApply: boolean;
  supportsSponsored: boolean;
}

export const JOB_BOARD_REGISTRY: JobBoardMeta[] = [
  {
    provider: JobBoardProvider.GOSTUDENT_CAREERS,
    name: "GoStudent Careers",
    description: "GoStudent internal careers page",
    region: "Global",
    logoColor: "#6C5CE7",
    supportsEasyApply: true,
    supportsSponsored: false,
  },
  {
    provider: JobBoardProvider.LINKEDIN,
    name: "LinkedIn",
    description: "Professional networking & job postings",
    region: "Global",
    logoColor: "#0A66C2",
    supportsEasyApply: true,
    supportsSponsored: true,
  },
  {
    provider: JobBoardProvider.INDEED,
    name: "Indeed",
    description: "World's largest job site",
    region: "Global",
    logoColor: "#2164F3",
    supportsEasyApply: true,
    supportsSponsored: true,
  },
  {
    provider: JobBoardProvider.INFOJOBS,
    name: "InfoJobs",
    description: "Leading job board in Spain & Italy",
    region: "Spain / Italy",
    logoColor: "#FF6200",
    supportsEasyApply: false,
    supportsSponsored: true,
  },
  {
    provider: JobBoardProvider.STEPSTONE,
    name: "StepStone",
    description: "Major job board in Germany & Northern Europe",
    region: "Germany / EU",
    logoColor: "#009DE0",
    supportsEasyApply: false,
    supportsSponsored: true,
  },
  {
    provider: JobBoardProvider.KARRIERE_AT,
    name: "Karriere.at",
    description: "Austria's leading job portal",
    region: "Austria",
    logoColor: "#E30613",
    supportsEasyApply: false,
    supportsSponsored: true,
  },
  {
    provider: JobBoardProvider.KARIYER,
    name: "Kariyer.net",
    description: "Turkey's #1 job platform",
    region: "Turkey",
    logoColor: "#00A651",
    supportsEasyApply: false,
    supportsSponsored: false,
  },
];
