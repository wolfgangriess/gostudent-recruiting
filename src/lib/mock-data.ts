import { Job, Candidate, PipelineStage } from "./types";

const stageNames = ["Applied", "Phone Screen", "Interview", "Offer", "Hired"];

function makeStages(jobId: string): PipelineStage[] {
  return stageNames.map((name, i) => ({
    id: `${jobId}-stage-${i}`,
    name,
    jobId,
    order: i,
  }));
}

export const initialJobs: Job[] = [
  {
    id: "job-1",
    name: "Senior Frontend Engineer",
    department: "Engineering",
    location: "San Francisco, CA",
    workplaceType: "hybrid",
    employmentType: "full-time",
    numberOfOpenings: 2,
    description: "We're looking for a senior frontend engineer to lead our design system.",
    requirements: "5+ years React, TypeScript, CSS-in-JS",
    hiringManager: "Sarah Chen",
    recruiters: ["Alex Kim"],
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
    employmentType: "full-time",
    numberOfOpenings: 1,
    description: "Join our design team to shape product experiences.",
    requirements: "3+ years product design, Figma proficiency",
    hiringManager: "Mike Torres",
    recruiters: ["Priya Patel"],
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
    employmentType: "full-time",
    numberOfOpenings: 1,
    description: "Help us build and maintain our cloud infrastructure.",
    requirements: "AWS, Kubernetes, Terraform experience",
    hiringManager: "Sarah Chen",
    recruiters: ["Alex Kim"],
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
    employmentType: "full-time",
    numberOfOpenings: 1,
    description: "Lead our B2B marketing strategy and campaigns.",
    requirements: "5+ years B2B marketing, demand generation",
    hiringManager: "Lisa Wang",
    recruiters: ["Jordan Lee"],
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
    employmentType: "full-time",
    numberOfOpenings: 3,
    description: "Drive outbound sales pipeline growth.",
    requirements: "1+ years SDR/BDR experience, SaaS background",
    hiringManager: "Tom Richards",
    recruiters: ["Jordan Lee"],
    status: "open",
    createdAt: "2026-02-15T00:00:00Z",
    updatedAt: "2026-03-09T00:00:00Z",
  },
];

export const initialStages: PipelineStage[] = initialJobs.flatMap((j) => makeStages(j.id));

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
    const counts = [8, 5, 3, 2, 1]; // distribution across stages
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

// Chart data - weekly applications for each job
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
