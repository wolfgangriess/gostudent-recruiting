import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Linkedin, Globe, GraduationCap, Briefcase, Award, Star, Download } from "lucide-react";
import { Candidate, Job } from "@/lib/types";
import { useRef } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate;
  job?: Job;
}

const ResumePreviewDialog = ({ open, onOpenChange, candidate, job }: Props) => {
  const fullName = `${candidate.firstName} ${candidate.lastName}`;
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow || !contentRef.current) return;
    printWindow.document.write(`
      <html><head><title>Resume - ${fullName}</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 40px; color: #1a1a1a; }
        * { box-sizing: border-box; }
      </style>
      </head><body>${contentRef.current.innerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className="bg-card">
          {/* Header */}
          <div className="bg-primary/5 border-b border-border px-8 py-6">
            <DialogHeader className="mb-0">
              <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
                {fullName}
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mt-0.5">
              {job?.department ?? "Professional"} · {job?.location ?? "Location not specified"}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" /> {candidate.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" /> {candidate.phone}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {job?.location ?? "Remote"}
              </span>
              <span className="flex items-center gap-1">
                <Linkedin className="h-3 w-3" /> linkedin.com/in/{candidate.firstName.toLowerCase()}-{candidate.lastName.toLowerCase()}
              </span>
            </div>
          </div>

          <div className="px-8 py-6 space-y-6">
            {/* Summary */}
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Professional Summary</h3>
              <p className="text-sm text-foreground leading-relaxed">
                Results-driven {job?.department ?? "industry"} professional with a proven track record of delivering
                impactful solutions. Passionate about innovation, collaboration, and continuous improvement.
                Seeking to leverage expertise in {job?.name ? `a ${job.name} role` : "a new opportunity"} to
                drive organizational success.
              </p>
            </section>

            <Separator />

            {/* Experience */}
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" /> Work Experience
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Senior {job?.department ?? "General"} Specialist</p>
                      <p className="text-xs text-primary font-medium">TechCorp International</p>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0">Jan 2022 – Present</span>
                  </div>
                  <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground list-disc pl-4">
                    <li>Led cross-functional team of 8 to deliver key initiatives, improving efficiency by 35%</li>
                    <li>Designed and implemented scalable solutions adopted across 3 regional offices</li>
                    <li>Mentored 4 junior team members, 2 of whom were promoted within 12 months</li>
                  </ul>
                </div>
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{job?.department ?? "General"} Associate</p>
                      <p className="text-xs text-primary font-medium">InnovateLab GmbH</p>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0">Jun 2019 – Dec 2021</span>
                  </div>
                  <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground list-disc pl-4">
                    <li>Contributed to high-priority projects generating €2M+ in revenue</li>
                    <li>Streamlined internal workflows, reducing turnaround time by 20%</li>
                    <li>Collaborated with stakeholders to define requirements and deliver on schedule</li>
                  </ul>
                </div>
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Junior Analyst</p>
                      <p className="text-xs text-primary font-medium">StartUp Ventures</p>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0">Sep 2017 – May 2019</span>
                  </div>
                  <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground list-disc pl-4">
                    <li>Supported data-driven decision making through analytical reporting</li>
                    <li>Assisted in onboarding 50+ new clients during rapid growth phase</li>
                  </ul>
                </div>
              </div>
            </section>

            <Separator />

            {/* Education */}
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" /> Education
              </h3>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">M.Sc. {job?.department ?? "Business Administration"}</p>
                    <p className="text-xs text-primary font-medium">Technical University of Munich</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">2015 – 2017</span>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">B.Sc. {job?.department ?? "Business"}</p>
                    <p className="text-xs text-primary font-medium">University of Vienna</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">2012 – 2015</span>
                </div>
              </div>
            </section>

            <Separator />

            {/* Skills */}
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5" /> Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Project Management", "Team Leadership", "Agile / Scrum",
                  "Data Analysis", "Strategic Planning", "Stakeholder Management",
                  job?.department ?? "Domain Expertise", "Communication",
                  "Problem Solving", "Cross-functional Collaboration",
                ].map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-[11px] font-medium">
                    {skill}
                  </Badge>
                ))}
              </div>
            </section>

            <Separator />

            {/* Certifications & Languages */}
            <div className="grid grid-cols-2 gap-6">
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5" /> Certifications
                </h3>
                <ul className="space-y-1 text-xs text-foreground">
                  <li>PMP – Project Management Professional</li>
                  <li>Google Analytics Certified</li>
                  <li>AWS Cloud Practitioner</li>
                </ul>
              </section>
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" /> Languages
                </h3>
                <ul className="space-y-1 text-xs text-foreground">
                  <li>English — Native</li>
                  <li>German — Fluent (C1)</li>
                  <li>French — Intermediate (B1)</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResumePreviewDialog;
