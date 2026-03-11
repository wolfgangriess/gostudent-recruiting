import { useState } from "react";
import { Search, Mail, Zap, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Candidate } from "@/lib/types";
import { useATSStore } from "@/lib/ats-store";

interface Props {
  candidate: Candidate;
}

interface ActivityItem {
  id: string;
  type: "email" | "activity";
  date: string;
  content: React.ReactNode;
}

const ActivityFeed = ({ candidate }: Props) => {
  const { jobs } = useATSStore();
  const job = jobs.find((j) => j.id === candidate.jobId);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");
  const [filterType, setFilterType] = useState("all");

  const appliedDate = new Date(candidate.appliedAt);
  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " at " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  const activities: ActivityItem[] = [
    {
      id: "email-1",
      type: "email",
      date: appliedDate.toISOString(),
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">To:</span>
            ["{candidate.email}"]
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Subject:</span>
            Thank You for Applying: {job?.name ?? "Position"} at GoStudent
          </div>
          <div className="mt-3 text-sm text-foreground space-y-3">
            <p>Hello {candidate.firstName.toUpperCase()},</p>
            <p>We're thrilled that you've taken the time to apply to join our team.</p>
            <p>
              What's up next? We'll carefully review your application and if we're excited to learn more,
              we'll be reaching out to chat further in an interview.
            </p>
            <p>
              While you're hanging tight, why not connect with us on LinkedIn (
              <a href="https://www.linkedin.com/company/gostudent-gmbh" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                https://www.linkedin.com/company/gostudent-gmbh
              </a>
              ) or discover the GoStudent Future of Education Report 2025 (
              <a href="https://www.gostudent.org/en-gb/education-report/2025/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                https://www.gostudent.org/en-gb/education-report/2025/
              </a>
              )? It's a great way to catch a glimpse of life here at GoStudent and stay in the loop with all our latest news and updates!
            </p>
          </div>
          <button className="text-xs text-primary hover:underline font-medium mt-1">Read more</button>
        </div>
      ),
    },
    {
      id: "activity-1",
      type: "activity",
      date: appliedDate.toISOString(),
      content: (
        <p className="text-sm text-foreground">
          {candidate.firstName.toUpperCase()} {candidate.lastName.toUpperCase()} applied online to the{" "}
          {job?.name ?? "Position"} job ({candidate.source}).
        </p>
      ),
    },
  ];

  const filtered = activities.filter((a) => {
    if (filterType !== "all" && a.type !== filterType) return false;
    if (search) {
      const text = JSON.stringify(a.content).toLowerCase();
      if (!text.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) =>
    sort === "recent"
      ? new Date(b.date).getTime() - new Date(a.date).getTime()
      : new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Search</label>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="h-9 text-sm"
          />
        </div>
        <div className="w-40 space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Sort</label>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-44 space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Filter by</label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All activity types</SelectItem>
              <SelectItem value="email">Emails</SelectItem>
              <SelectItem value="activity">Activities</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Activity items */}
      <div className="space-y-0">
        {sorted.map((item) => (
          <div key={item.id} className="flex gap-3 py-4 border-b border-border">
            {/* Icon */}
            <div className="mt-0.5 shrink-0">
              {item.type === "email" ? (
                <Mail className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Zap className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold text-foreground capitalize">{item.type}</span>
                <span className="text-xs text-muted-foreground">· {fmtDate(new Date(item.date))}</span>
              </div>
              {item.content}
            </div>
          </div>
        ))}

        {sorted.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No activity found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
