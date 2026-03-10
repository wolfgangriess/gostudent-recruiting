import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useATSStore } from "@/lib/ats-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOCATIONS } from "@/lib/types";
import { ArrowLeft, Sparkles, Info } from "lucide-react";
import { toast } from "sonner";

const JOB_BOARDS = [
  { id: "mygostu", name: "MyGoStudentTA", enabled: true },
  { id: "appcast", name: "Appcast", enabled: true },
  { id: "arbeitnow", name: "Arbeitnow", enabled: true },
  { id: "indeed", name: "Indeed", enabled: false },
  { id: "linkedin", name: "LinkedIn Limited", enabled: true },
  { id: "monster", name: "Monster Organic", enabled: true },
  { id: "ramped", name: "Ramped", enabled: true },
  { id: "xhiring", name: "X Hiring", enabled: true },
  { id: "ziprecruiter", name: "ZipRecruiter", enabled: true },
];

const LANGUAGES = [
  "English",
  "German",
  "French",
  "Spanish",
  "Portuguese",
  "Italian",
  "Dutch",
];

const JobPostPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { jobs } = useATSStore();
  const job = jobs.find((j) => j.id === jobId);

  const [postName, setPostName] = useState(job?.externalName || job?.name || "");
  const [postTo, setPostTo] = useState("GoStudentTA");
  const [postLocation, setPostLocation] = useState(job?.location || "");
  const [appLanguage, setAppLanguage] = useState("English");
  const [workType, setWorkType] = useState(job?.workplaceType || "onsite") as [string, (v: string) => void];
  const [description, setDescription] = useState(job?.description || "");
  const [selectedBoards, setSelectedBoards] = useState<string[]>(
    JOB_BOARDS.filter((b) => b.enabled).map((b) => b.id)
  );
  const [boardLocation, setBoardLocation] = useState(job?.location || "");

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Job not found.</p>
      </div>
    );
  }

  const toggleBoard = (boardId: string) => {
    setSelectedBoards((prev) =>
      prev.includes(boardId)
        ? prev.filter((id) => id !== boardId)
        : [...prev, boardId]
    );
  };

  const handlePublish = () => {
    toast.success(
      `Job post published to ${selectedBoards.length} job board${selectedBoards.length !== 1 ? "s" : ""}!`
    );
    navigate(`/jobs/${jobId}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 gap-1.5 text-muted-foreground"
          onClick={() => navigate(`/jobs/${jobId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Job
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Job Post</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure the job details and how candidates will apply.
        </p>
      </div>

      {/* Section 1: Post Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Post details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Job name *
            </label>
            <Input
              value={postName}
              onChange={(e) => setPostName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Post to
            </label>
            <Select value={postTo} onValueChange={setPostTo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GoStudentTA">GoStudentTA</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Location *
            </label>
            <Select value={postLocation} onValueChange={setPostLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This location will be visible to candidates on the job post.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Application language
            </label>
            <Select value={appLanguage} onValueChange={setAppLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Work type
            </label>
            <Select value={workType} onValueChange={setWorkType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="onsite">In-person</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Post Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Post description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              Custom description
              <Info className="h-3.5 w-3.5" />
            </span>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Generate job post
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
            <p className="text-sm text-foreground">
              Inclusive job descriptions motivate candidates from all
              backgrounds to apply, broadening your talent pool and making it
              more diverse. Consider:
            </p>
            <ul className="text-sm list-disc list-inside space-y-1 text-primary">
              <li>
                Listing only the qualifications that are necessary for the role
              </li>
              <li>Avoiding stereotypically masculine language</li>
              <li>
                Communicating a growth mindset by using language that emphasizes
                learning and growth over innate abilities
              </li>
              <li>
                Including benefits that appeal to a wide range of demographic
                groups
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="flex gap-1 border-b border-border pb-2 text-sm text-muted-foreground">
              <button className="px-2 py-1 font-medium text-foreground border-b-2 border-primary">
                Edit
              </button>
              <button className="px-2 py-1 hover:text-foreground">
                Insert
              </button>
              <button className="px-2 py-1 hover:text-foreground">
                Format
              </button>
              <button className="px-2 py-1 hover:text-foreground">
                Tools
              </button>
            </div>
            <Textarea
              rows={12}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write your job description here..."
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Publish to job boards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Publish to free job boards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            It can take up to 48 hours for new posts or updates to appear on
            these boards.{" "}
            <span className="text-primary underline cursor-pointer">
              Learn more.
            </span>
          </p>

          <div className="space-y-3">
            {JOB_BOARDS.map((board) => (
              <div key={board.id} className="flex items-center gap-3">
                <Checkbox
                  id={board.id}
                  checked={selectedBoards.includes(board.id)}
                  onCheckedChange={() => toggleBoard(board.id)}
                />
                <label
                  htmlFor={board.id}
                  className="text-sm font-medium cursor-pointer flex items-center gap-1.5"
                >
                  {board.name}
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </label>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Location
            </label>
            <Input
              value={boardLocation}
              onChange={(e) => setBoardLocation(e.target.value)}
              placeholder="Select location"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3 pb-8">
        <Button
          variant="outline"
          onClick={() => navigate(`/jobs/${jobId}`)}
        >
          Save as Draft
        </Button>
        <Button onClick={handlePublish}>
          Publish Job Post
        </Button>
      </div>
    </div>
  );
};

export default JobPostPage;
