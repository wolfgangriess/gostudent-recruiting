import { Linkedin, Mail } from "lucide-react";
import { Candidate, Job } from "@/lib/types";

interface Props {
  candidate: Candidate;
  job?: Job;
}

const CandidateLinkedInTab = ({ candidate, job }: Props) => {
  return (
    <div className="space-y-4">
      {/* Profile header */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-primary/20 to-primary/5" />
        <div className="px-5 pb-5 -mt-8">
          <div className="flex items-end gap-4">
            <div className="h-16 w-16 rounded-full border-4 border-card bg-muted flex items-center justify-center text-lg font-bold text-primary">
              {candidate.firstName[0]}{candidate.lastName[0]}
            </div>
            <div className="pb-1">
              <h3 className="text-sm font-bold text-foreground">
                {candidate.firstName} {candidate.lastName}
              </h3>
              <p className="text-xs text-muted-foreground">
                {job ? `Applicant for ${job.name}` : "Professional"}
              </p>
              <p className="text-xs text-muted-foreground">{job?.location ?? "Location not specified"}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <a
              href={`https://linkedin.com/in/${candidate.firstName.toLowerCase()}-${candidate.lastName.toLowerCase()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Linkedin className="h-3.5 w-3.5" /> Open LinkedIn
            </a>
            <a
              href={`mailto:${candidate.email}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <Mail className="h-3.5 w-3.5" /> Message
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* About */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-2 col-span-2">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">About</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Passionate professional with experience in {job?.department ?? "the industry"}.
            Committed to driving results and contributing to team success. Currently exploring
            opportunities in {job?.location ?? "various locations"}.
          </p>
        </div>

        {/* Experience */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">Experience</h4>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">Co</div>
              <div>
                <p className="text-xs font-medium text-foreground">{job?.department ?? "General"} Specialist</p>
                <p className="text-[11px] text-muted-foreground">Previous Company · Full-time</p>
                <p className="text-[11px] text-muted-foreground">Jan 2023 – Present</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">AB</div>
              <div>
                <p className="text-xs font-medium text-foreground">Junior {job?.department ?? "General"} Associate</p>
                <p className="text-[11px] text-muted-foreground">Another Company · Full-time</p>
                <p className="text-[11px] text-muted-foreground">Jun 2020 – Dec 2022</p>
              </div>
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">Education</h4>
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">🎓</div>
            <div>
              <p className="text-xs font-medium text-foreground">University of Technology</p>
              <p className="text-[11px] text-muted-foreground">Bachelor's, {job?.department ?? "Business"}</p>
              <p className="text-[11px] text-muted-foreground">2016 – 2020</p>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-2 col-span-2">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">Skills</h4>
          <div className="flex flex-wrap gap-1.5">
            {["Team Leadership", "Project Management", "Communication", "Problem Solving", job?.department ?? "General Skills", "Agile", "Data Analysis"].map((skill) => (
              <span key={skill} className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateLinkedInTab;
