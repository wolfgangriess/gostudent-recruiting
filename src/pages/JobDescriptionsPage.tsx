import { useState } from "react";
import { Plus, Search, FileText, Sparkles, Copy, Trash2, Eye, Clock, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DEPARTMENTS } from "@/lib/types";

interface JobDescription {
  id: string;
  title: string;
  department: string;
  content: string;
  createdAt: string;
  status: "draft" | "final";
}

const sampleDescriptions: JobDescription[] = [
  {
    id: "jd-1",
    title: "Senior Frontend Engineer",
    department: "Engineering",
    content: "We are looking for a Senior Frontend Engineer to join our growing team. You will be responsible for building and maintaining our web applications using React, TypeScript, and modern frontend technologies.\n\nResponsibilities:\n• Design and implement user-facing features\n• Write clean, maintainable, and well-tested code\n• Collaborate with designers and backend engineers\n• Mentor junior developers\n\nRequirements:\n• 5+ years of experience in frontend development\n• Strong proficiency in React and TypeScript\n• Experience with modern CSS and responsive design\n• Excellent communication skills",
    createdAt: "2026-03-10T14:30:00Z",
    status: "final",
  },
  {
    id: "jd-2",
    title: "Product Marketing Manager",
    department: "Marketing",
    content: "We're seeking a Product Marketing Manager to drive go-to-market strategies for our tutoring platform. You'll work closely with product, sales, and content teams to craft compelling positioning and messaging.\n\nResponsibilities:\n• Develop product positioning and messaging\n• Create launch plans for new features\n• Conduct competitive analysis\n• Enable the sales team with materials and training\n\nRequirements:\n• 3+ years in product marketing, preferably in EdTech\n• Strong storytelling and writing skills\n• Data-driven mindset\n• Experience with B2C and B2B marketing",
    createdAt: "2026-03-08T09:15:00Z",
    status: "final",
  },
  {
    id: "jd-3",
    title: "UX Designer",
    department: "Design",
    content: "Join our design team as a UX Designer to create intuitive and delightful experiences for students and tutors worldwide.\n\nResponsibilities:\n• Conduct user research and usability testing\n• Create wireframes, prototypes, and high-fidelity designs\n• Collaborate with engineering to ensure design quality\n• Contribute to our design system\n\nRequirements:\n• 3+ years of UX design experience\n• Proficiency in Figma\n• Strong portfolio demonstrating user-centered design\n• Experience with design systems",
    createdAt: "2026-03-05T11:00:00Z",
    status: "draft",
  },
];

const JobDescriptionsPage = () => {
  const [descriptions, setDescriptions] = useState<JobDescription[]>(sampleDescriptions);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState<string>("all");
  const [generateOpen, setGenerateOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<JobDescription | null>(null);

  // Generate form state
  const [genTitle, setGenTitle] = useState("");
  const [genDept, setGenDept] = useState("");
  const [genNotes, setGenNotes] = useState("");
  const [generating, setGenerating] = useState(false);

  const filtered = descriptions.filter((d) => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase());
    const matchesDept = filterDept === "all" || d.department === filterDept;
    return matchesSearch && matchesDept;
  });

  const handleGenerate = () => {
    if (!genTitle.trim()) {
      toast.error("Please enter a job title");
      return;
    }
    setGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      const newJD: JobDescription = {
        id: `jd-${Date.now()}`,
        title: genTitle,
        department: genDept || "Engineering",
        content: `We are looking for a talented ${genTitle} to join our ${genDept || "Engineering"} team at GoStudent. This is an exciting opportunity to make a real impact on education worldwide.\n\nAbout the role:\nAs a ${genTitle}, you will play a key role in shaping the future of our platform. You'll work in a collaborative, fast-paced environment alongside passionate colleagues.\n\nResponsibilities:\n• Drive key initiatives within the ${genDept || "Engineering"} department\n• Collaborate cross-functionally with stakeholders\n• Contribute to strategic planning and execution\n• Continuously improve processes and outcomes\n\nRequirements:\n• Relevant experience in a similar role\n• Strong analytical and problem-solving skills\n• Excellent communication and teamwork abilities\n• Passion for education and technology${genNotes ? `\n\nAdditional context:\n${genNotes}` : ""}`,
        createdAt: new Date().toISOString(),
        status: "draft",
      };
      setDescriptions((prev) => [newJD, ...prev]);
      setGenerating(false);
      setGenerateOpen(false);
      setGenTitle("");
      setGenDept("");
      setGenNotes("");
      toast.success("Job description generated!");
    }, 1500);
  };

  const handleDuplicate = (jd: JobDescription) => {
    const copy: JobDescription = {
      ...jd,
      id: `jd-${Date.now()}`,
      title: `${jd.title} (Copy)`,
      createdAt: new Date().toISOString(),
      status: "draft",
    };
    setDescriptions((prev) => [copy, ...prev]);
    toast.success("Duplicated");
  };

  const handleDelete = (id: string) => {
    setDescriptions((prev) => prev.filter((d) => d.id !== id));
    toast.success("Deleted");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Job Descriptions</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-generated job descriptions library</p>
        </div>
        <Button onClick={() => setGenerateOpen(true)} className="gap-2 font-semibold">
          <Sparkles className="h-4 w-4" />
          Generate with AI
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search descriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterDept} onValueChange={setFilterDept}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No job descriptions found</p>
          <p className="text-xs text-muted-foreground mb-4">Generate your first one with AI</p>
          <Button size="sm" onClick={() => setGenerateOpen(true)} className="gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Generate
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((jd) => (
            <Card
              key={jd.id}
              className="p-5 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => setPreviewItem(jd)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">{jd.title}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      {jd.department}
                    </span>
                    <Badge variant={jd.status === "final" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                      {jd.status === "final" ? "Final" : "Draft"}
                    </Badge>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                {jd.content.slice(0, 150)}...
              </p>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(jd.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={(e) => { e.stopPropagation(); handleDuplicate(jd); }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); handleDelete(jd.id); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Generate Dialog */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generate Job Description
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Job Title *</Label>
              <Input
                placeholder="e.g. Senior Backend Engineer"
                value={genTitle}
                onChange={(e) => setGenTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={genDept} onValueChange={setGenDept}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea
                placeholder="Any specific requirements, tone, or details to include..."
                value={genNotes}
                onChange={(e) => setGenNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateOpen(false)}>Cancel</Button>
            <Button onClick={handleGenerate} disabled={generating} className="gap-2">
              {generating ? (
                <>
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          {previewItem && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={previewItem.status === "final" ? "default" : "secondary"} className="text-[10px]">
                    {previewItem.status === "final" ? "Final" : "Draft"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{previewItem.department}</span>
                </div>
                <DialogTitle>{previewItem.title}</DialogTitle>
              </DialogHeader>
              <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed py-2">
                {previewItem.content}
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => { navigator.clipboard.writeText(previewItem.content); toast.success("Copied to clipboard"); }}>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
                <Button size="sm" className="gap-2" onClick={() => { setDescriptions((prev) => prev.map((d) => d.id === previewItem.id ? { ...d, status: d.status === "draft" ? "final" : "draft" } : d)); setPreviewItem({ ...previewItem, status: previewItem.status === "draft" ? "final" : "draft" }); toast.success(previewItem.status === "draft" ? "Marked as final" : "Reverted to draft"); }}>
                  {previewItem.status === "draft" ? "Mark as Final" : "Revert to Draft"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobDescriptionsPage;
