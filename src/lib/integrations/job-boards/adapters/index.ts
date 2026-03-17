import { BaseMockAdapter } from "./base-mock";
import { JobBoardProvider } from "../types";

export class GoStudentCareersAdapter extends BaseMockAdapter {
  provider = JobBoardProvider.GOSTUDENT_CAREERS as const;
}

export class LinkedInAdapter extends BaseMockAdapter {
  provider = JobBoardProvider.LINKEDIN as const;
}

export class IndeedAdapter extends BaseMockAdapter {
  provider = JobBoardProvider.INDEED as const;
}

export class InfoJobsAdapter extends BaseMockAdapter {
  provider = JobBoardProvider.INFOJOBS as const;
}

export class StepStoneAdapter extends BaseMockAdapter {
  provider = JobBoardProvider.STEPSTONE as const;
}

export class KarriereAtAdapter extends BaseMockAdapter {
  provider = JobBoardProvider.KARRIERE_AT as const;
}

export class KariyerAdapter extends BaseMockAdapter {
  provider = JobBoardProvider.KARIYER as const;
}
