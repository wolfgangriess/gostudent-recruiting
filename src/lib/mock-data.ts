import { Job, Candidate, PipelineStage, User, ScorecardTemplate } from "./types";

// ── Mock Users ──────────────────────────────────────────────────────────
export const initialUsers: User[] = [
  { id: "user-1", firstName: "Sarah", lastName: "Chen", email: "sarah@talentflow.com", role: "admin", department: "Human Resources" },
  { id: "user-2", firstName: "Alex", lastName: "Kim", email: "alex@talentflow.com", role: "admin", department: "Human Resources" },
  { id: "user-3", firstName: "Mike", lastName: "Torres", email: "mike@talentflow.com", role: "hiring_manager", department: "Design" },
  { id: "user-4", firstName: "Priya", lastName: "Patel", email: "priya@talentflow.com", role: "hiring_manager", department: "Engineering" },
  { id: "user-5", firstName: "Lisa", lastName: "Wang", email: "lisa@talentflow.com", role: "hiring_manager", department: "Marketing" },
  { id: "user-6", firstName: "Tom", lastName: "Richards", email: "tom@talentflow.com", role: "hiring_manager", department: "Sales" },
  { id: "user-7", firstName: "Jordan", lastName: "Lee", email: "jordan@talentflow.com", role: "employee", department: "Engineering" },
  { id: "user-8", firstName: "Emily", lastName: "Davis", email: "emily@talentflow.com", role: "employee", department: "Design" },
  { id: "user-9", firstName: "Carlos", lastName: "Martinez", email: "carlos@talentflow.com", role: "employee", department: "Product" },
  { id: "user-10", firstName: "Nina", lastName: "Brooks", email: "nina@talentflow.com", role: "employee", department: "Marketing" },
  { id: "user-11", firstName: "David", lastName: "Park", email: "david@talentflow.com", role: "employee", department: "Engineering" },
  { id: "user-12", firstName: "Rachel", lastName: "Green", email: "rachel@talentflow.com", role: "employee", department: "Sales" },
];

const stageNames = ["Applied", "Phone Screen", "Interview", "Offer", "Hired"];

function makeStages(jobId: string, ownerIds?: string[]): PipelineStage[] {
  return stageNames.map((name, i) => ({
    id: `${jobId}-stage-${i}`,
    name,
    jobId,
    order: i,
    ownerId: ownerIds?.[i],
  }));
}

export const initialJobs: Job[] = [
  {
    id: "job-1",
    name: "Senior Frontend Engineer",
    department: "Engineering",
    location: "San Francisco, CA",
    workplaceType: "hybrid",
    workerType: "regular",
    employmentType: "full-time",
    numberOfOpenings: 2,
    description: "We're looking for a senior frontend engineer to lead our design system.",
    requirements: "5+ years React, TypeScript, CSS-in-JS",
    hiringManager: "user-1",
    recruiters: ["user-1", "user-2"],
    hiringTeamIds: ["user-1", "user-4", "user-7"],
    visibilityIds: ["user-9", "user-11"],
    status: "open",
    createdAt: "2025-11-01T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "job-2",
    name: "Product Designer",
    department: "Design",
    location: "New York, NY",
    workplaceType: "onsite",
    workerType: "regular",
    employmentType: "full-time",
    numberOfOpenings: 1,
    description: "Join our design team to shape product experiences.",
    requirements: "3+ years product design, Figma proficiency",
    hiringManager: "user-3",
    recruiters: ["user-4"],
    hiringTeamIds: ["user-2", "user-3", "user-8"],
    visibilityIds: ["user-10"],
    status: "open",
    createdAt: "2025-12-15T00:00:00Z",
    updatedAt: "2026-02-20T00:00:00Z",
  },
  {
    id: "job-3",
    name: "DevOps Engineer",
    department: "Engineering",
    location: "Remote",
    workplaceType: "remote",
    workerType: "regular",
    employmentType: "full-time",
    numberOfOpenings: 1,
    description: "Help us build and maintain our cloud infrastructure.",
    requirements: "AWS, Kubernetes, Terraform experience",
    hiringManager: "user-1",
    recruiters: ["user-2"],
    hiringTeamIds: ["user-1", "user-4"],
    visibilityIds: ["user-7", "user-11"],
    status: "open",
    createdAt: "2026-01-10T00:00:00Z",
    updatedAt: "2026-03-05T00:00:00Z",
  },
  {
    id: "job-4",
    name: "Marketing Manager",
    department: "Marketing",
    location: "Austin, TX",
    workplaceType: "hybrid",
    workerType: "regular",
    employmentType: "full-time",
    numberOfOpenings: 1,
    description: "Lead our B2B marketing strategy and campaigns.",
    requirements: "5+ years B2B marketing, demand generation",
    hiringManager: "user-5",
    recruiters: ["user-7"],
    hiringTeamIds: ["user-2", "user-5", "user-10"],
    visibilityIds: ["user-12"],
    status: "open",
    createdAt: "2026-02-01T00:00:00Z",
    updatedAt: "2026-03-08T00:00:00Z",
  },
  {
    id: "job-5",
    name: "Sales Development Rep",
    department: "Sales",
    location: "New York, NY",
    workplaceType: "onsite",
    workerType: "freelancer",
    employmentType: "full-time",
    numberOfOpenings: 3,
    description: "Drive outbound sales pipeline growth.",
    requirements: "1+ years SDR/BDR experience, SaaS background",
    hiringManager: "user-6",
    recruiters: ["user-7"],
    hiringTeamIds: ["user-2", "user-6", "user-12"],
    visibilityIds: [],
    status: "open",
    createdAt: "2026-02-15T00:00:00Z",
    updatedAt: "2026-03-09T00:00:00Z",
  },
];

export const initialStages: PipelineStage[] = [
  ...makeStages("job-1", ["user-1", "user-1", "user-1", "user-1", "user-1"]),
  ...makeStages("job-2", ["user-2", "user-3", "user-3", "user-2", "user-2"]),
  ...makeStages("job-3", ["user-1", "user-1", "user-1", "user-1", "user-1"]),
  ...makeStages("job-4", ["user-2", "user-5", "user-5", "user-2", "user-2"]),
  ...makeStages("job-5", ["user-2", "user-6", "user-6", "user-2", "user-2"]),
];

// ── Scorecard Templates ─────────────────────────────────────────────────
export const initialScorecardTemplates: ScorecardTemplate[] = [
  {
    id: "sc-1",
    stageId: "job-1-stage-2", // Interview stage for job-1
    criteria: [
      { id: "cr-1", question: "Technical Skills", ratingType: "scale", weight: 3 },
      { id: "cr-2", question: "Problem Solving", ratingType: "scale", weight: 2 },
      { id: "cr-3", question: "Communication", ratingType: "scale", weight: 1 },
      { id: "cr-4", question: "Culture Fit", ratingType: "yes_no" },
      { id: "cr-5", question: "Additional Notes", ratingType: "text" },
    ],
  },
  {
    id: "sc-2",
    stageId: "job-1-stage-1", // Phone Screen for job-1
    criteria: [
      { id: "cr-6", question: "Relevant Experience", ratingType: "scale", weight: 2 },
      { id: "cr-7", question: "Enthusiasm & Motivation", ratingType: "scale", weight: 1 },
      { id: "cr-8", question: "Salary Expectations Aligned", ratingType: "yes_no" },
    ],
  },
  {
    id: "sc-3",
    stageId: "job-2-stage-2", // Interview stage for job-2
    criteria: [
      { id: "cr-9", question: "Design Portfolio Quality", ratingType: "scale", weight: 3 },
      { id: "cr-10", question: "UX Process & Thinking", ratingType: "scale", weight: 2 },
      { id: "cr-11", question: "Collaboration Skills", ratingType: "scale", weight: 1 },
      { id: "cr-12", question: "Culture Fit", ratingType: "yes_no" },
    ],
  },
  {
    id: "sc-4",
    stageId: "job-2-stage-1", // Phone Screen for job-2
    criteria: [
      { id: "cr-13", question: "Relevant Experience", ratingType: "scale", weight: 2 },
      { id: "cr-14", question: "Communication", ratingType: "scale", weight: 1 },
    ],
  },
  {
    id: "sc-5",
    stageId: "job-3-stage-2", // Interview stage for job-3
    criteria: [
      { id: "cr-15", question: "Technical Architecture", ratingType: "scale", weight: 3 },
      { id: "cr-16", question: "System Design", ratingType: "scale", weight: 2 },
      { id: "cr-17", question: "Leadership Potential", ratingType: "scale", weight: 1 },
      { id: "cr-18", question: "Team Fit", ratingType: "yes_no" },
      { id: "cr-19", question: "Notes", ratingType: "text" },
    ],
  },
  {
    id: "sc-6",
    stageId: "job-3-stage-1",
    criteria: [
      { id: "cr-20", question: "Relevant Experience", ratingType: "scale", weight: 2 },
      { id: "cr-21", question: "Salary Expectations Aligned", ratingType: "yes_no" },
    ],
  },
  {
    id: "sc-7",
    stageId: "job-4-stage-2",
    criteria: [
      { id: "cr-22", question: "Content Strategy", ratingType: "scale", weight: 2 },
      { id: "cr-23", question: "Writing Quality", ratingType: "scale", weight: 3 },
      { id: "cr-24", question: "Brand Alignment", ratingType: "yes_no" },
    ],
  },
  {
    id: "sc-8",
    stageId: "job-4-stage-1",
    criteria: [
      { id: "cr-25", question: "Marketing Experience", ratingType: "scale", weight: 2 },
      { id: "cr-26", question: "Communication", ratingType: "scale", weight: 1 },
    ],
  },
  {
    id: "sc-9",
    stageId: "job-5-stage-2",
    criteria: [
      { id: "cr-27", question: "Sales Acumen", ratingType: "scale", weight: 3 },
      { id: "cr-28", question: "Objection Handling", ratingType: "scale", weight: 2 },
      { id: "cr-29", question: "Pipeline Management", ratingType: "scale", weight: 1 },
      { id: "cr-30", question: "Culture Fit", ratingType: "yes_no" },
    ],
  },
  {
    id: "sc-10",
    stageId: "job-5-stage-1",
    criteria: [
      { id: "cr-31", question: "Sales Experience", ratingType: "scale", weight: 2 },
      { id: "cr-32", question: "Motivation", ratingType: "scale", weight: 1 },
    ],
  },
];

const firstNames = ["Emma", "Liam", "Olivia", "Noah", "Ava", "James", "Sophia", "William", "Isabella", "Oliver", "Mia", "Benjamin", "Charlotte", "Elijah", "Amelia", "Lucas", "Harper", "Mason", "Evelyn", "Logan"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
const sources = ["LinkedIn", "Referral", "Website", "Indeed", "Glassdoor"];

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

function generateCandidates(): Candidate[] {
  const candidates: Candidate[] = [];
  let id = 1;
  for (const job of initialJobs) {
    const stages = makeStages(job.id);
    const counts = [3, 2, 1, 1, 1];
    for (let si = 0; si < stages.length; si++) {
      for (let ci = 0; ci < counts[si]; ci++) {
        const fi = Math.floor(Math.random() * firstNames.length);
        const li = Math.floor(Math.random() * lastNames.length);
        candidates.push({
          id: `cand-${id++}`,
          firstName: firstNames[fi],
          lastName: lastNames[li],
          email: `${firstNames[fi].toLowerCase()}.${lastNames[li].toLowerCase()}${id}@example.com`,
          phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          jobId: job.id,
          currentStageId: stages[si].id,
          source: sources[Math.floor(Math.random() * sources.length)],
          rating: Math.floor(Math.random() * 5) + 1,
          appliedAt: randomDate(new Date("2025-11-01"), new Date("2026-03-10")),
          createdAt: randomDate(new Date("2025-11-01"), new Date("2026-03-10")),
          updatedAt: "2026-03-10T00:00:00Z",
        });
      }
    }
  }
  return candidates;
}

export const initialCandidates: Candidate[] = generateCandidates();

export function getApplicationTrendData(jobId: string, candidates: Candidate[]) {
  const jobCandidates = candidates.filter((c) => c.jobId === jobId);
  const weeks: { week: string; applications: number }[] = [];
  const start = new Date("2025-11-01");
  const end = new Date("2026-03-10");
  const current = new Date(start);
  while (current < end) {
    const weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const count = jobCandidates.filter((c) => {
      const d = new Date(c.appliedAt);
      return d >= current && d < weekEnd;
    }).length;
    weeks.push({
      week: current.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      applications: count,
    });
    current.setDate(current.getDate() + 7);
  }
  return weeks;
}
