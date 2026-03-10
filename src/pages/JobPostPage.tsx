import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useATSStore } from "@/lib/ats-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOCATIONS } from "@/lib/types";
import { ArrowLeft, Sparkles, Info, Pencil, Trash2, Plus } from "lucide-react";
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
  "English", "German", "French", "Spanish", "Portuguese", "Italian", "Dutch",
];

type FieldVisibility = "hide" | "optional" | "required";

interface PersonalField {
  id: string;
  label: string;
  visibility: FieldVisibility;
  locked?: boolean; // always required, can't change
}


interface CustomQuestion {
  id: string;
  question: string;
  required: boolean;
  mapping?: string;
}

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

  // Basic application info state
  const [personalFields, setPersonalFields] = useState<PersonalField[]>([
    { id: "first_name", label: "First name", visibility: "required", locked: true },
    { id: "last_name", label: "Last name", visibility: "required", locked: true },
    { id: "preferred_name", label: "Preferred first name", visibility: "hide" },
    { id: "email", label: "Email", visibility: "required", locked: true },
    { id: "phone", label: "Phone number", visibility: "optional" },
    { id: "resume", label: "Resume", visibility: "optional" },
    { id: "cover_letter", label: "Cover letter", visibility: "optional" },
  ]);


  // Custom questions state
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([
    { id: "cq-1", question: "What is your current place of residence?", required: true },
    { id: "cq-2", question: "Are you legally authorized to work in the country you are applying for?", required: true, mapping: "Are you legally authorized to work in the country you are applying?" },
    { id: "cq-3", question: "What is your expected annual gross (base fixed) salary in Euros (EUR)?", required: true, mapping: "SALES - Base Salary Expectations (EUR)" },
    { id: "cq-4", question: "Please indicate your preferred ideal work arrangement.", required: true, mapping: "Way of working" },
    { id: "cq-5", question: "What is your current notice period?", required: false },
  ]);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestionText, setEditingQuestionText] = useState("");

  // Settings state
  const [sendConfirmationEmail, setSendConfirmationEmail] = useState(false);
  const [autoPublish, setAutoPublish] = useState(false);
  const [confirmationPage, setConfirmationPage] = useState<"default" | "customize">("default");

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Job not found.</p>
      </div>
    );
  }

  const toggleBoard = (boardId: string) => {
    setSelectedBoards((prev) =>
      prev.includes(boardId) ? prev.filter((id) => id !== boardId) : [...prev, boardId]
    );
  };

  const updatePersonalField = (id: string, visibility: FieldVisibility) => {
    setPersonalFields((prev) => prev.map((f) => (f.id === id ? { ...f, visibility } : f)));
  };


  const deleteQuestion = (id: string) => {
    setCustomQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const startEditQuestion = (q: CustomQuestion) => {
    setEditingQuestionId(q.id);
    setEditingQuestionText(q.question);
  };

  const saveEditQuestion = () => {
    if (!editingQuestionId || !editingQuestionText.trim()) return;
    setCustomQuestions((prev) =>
      prev.map((q) => (q.id === editingQuestionId ? { ...q, question: editingQuestionText.trim() } : q))
    );
    setEditingQuestionId(null);
    setEditingQuestionText("");
  };

  const addCustomQuestion = () => {
    const newQ: CustomQuestion = {
      id: `cq-${Date.now()}`,
      question: "New question",
      required: false,
    };
    setCustomQuestions((prev) => [...prev, newQ]);
    startEditQuestion(newQ);
  };

  const handlePublish = () => {
    toast.success(
      `Job post published to ${selectedBoards.length} job board${selectedBoards.length !== 1 ? "s" : ""}!`
    );
    navigate(`/jobs/${jobId}`);
  };

  const VisibilityRadio = ({
    value,
    onChange,
    locked,
    showHide = true,
  }: {
    value: FieldVisibility;
    onChange: (v: FieldVisibility) => void;
    locked?: boolean;
    showHide?: boolean;
  }) => (
    <div className="flex items-center gap-6">
      {showHide && (
        <button
          type="button"
          disabled={locked}
          onClick={() => onChange("hide")}
          className={`h-4 w-4 rounded-full border-2 transition-colors ${
            value === "hide" ? "border-primary bg-primary" : "border-muted-foreground/40"
          } ${locked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
        />
      )}
      <button
        type="button"
        disabled={locked}
        onClick={() => onChange("optional")}
        className={`h-4 w-4 rounded-full border-2 transition-colors ${
          value === "optional" ? "border-primary bg-primary" : "border-muted-foreground/40"
        } ${locked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
      />
      <button
        type="button"
        disabled={locked}
        onClick={() => onChange("required")}
        className={`h-4 w-4 rounded-full border-2 transition-colors ${
          value === "required" ? "border-primary bg-primary" : "border-muted-foreground/40"
        } ${locked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
      />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" className="mb-4 gap-1.5 text-muted-foreground" onClick={() => navigate(`/jobs/${jobId}`)}>
          <ArrowLeft className="h-4 w-4" /> Back to Job
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Job Post</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure the job details and how candidates will apply.</p>
      </div>

      {/* Section 1: Post Details */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Post details</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Job name *</label>
            <Input value={postName} onChange={(e) => setPostName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Post to</label>
            <Select value={postTo} onValueChange={setPostTo}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="GoStudentTA">GoStudentTA</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Location *</label>
            <Select value={postLocation} onValueChange={setPostLocation}>
              <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
              <SelectContent>{LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">This location will be visible to candidates on the job post.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Application language</label>
            <Select value={appLanguage} onValueChange={setAppLanguage}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Work type</label>
            <Select value={workType} onValueChange={setWorkType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
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
        <CardHeader><CardTitle className="text-lg">Post description</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">Custom description <Info className="h-3.5 w-3.5" /></span>
            <Button variant="outline" size="sm" className="gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Generate job post</Button>
          </div>
          <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
            <p className="text-sm text-foreground">Inclusive job descriptions motivate candidates from all backgrounds to apply, broadening your talent pool and making it more diverse. Consider:</p>
            <ul className="text-sm list-disc list-inside space-y-1 text-primary">
              <li>Listing only the qualifications that are necessary for the role</li>
              <li>Avoiding stereotypically masculine language</li>
              <li>Communicating a growth mindset by using language that emphasizes learning and growth over innate abilities</li>
              <li>Including benefits that appeal to a wide range of demographic groups</li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="flex gap-1 border-b border-border pb-2 text-sm text-muted-foreground">
              <button className="px-2 py-1 font-medium text-foreground border-b-2 border-primary">Edit</button>
              <button className="px-2 py-1 hover:text-foreground">Insert</button>
              <button className="px-2 py-1 hover:text-foreground">Format</button>
              <button className="px-2 py-1 hover:text-foreground">Tools</button>
            </div>
            <Textarea rows={12} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Write your job description here..." className="font-mono text-sm" />
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Publish to job boards */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Publish to free job boards</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">It can take up to 48 hours for new posts or updates to appear on these boards. <span className="text-primary underline cursor-pointer">Learn more.</span></p>
          <div className="space-y-3">
            {JOB_BOARDS.map((board) => (
              <div key={board.id} className="flex items-center gap-3">
                <Checkbox id={board.id} checked={selectedBoards.includes(board.id)} onCheckedChange={() => toggleBoard(board.id)} />
                <label htmlFor={board.id} className="text-sm font-medium cursor-pointer flex items-center gap-1.5">{board.name} <Info className="h-3.5 w-3.5 text-muted-foreground" /></label>
              </div>
            ))}
          </div>
          <Separator />
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Location</label>
            <Input value={boardLocation} onChange={(e) => setBoardLocation(e.target.value)} placeholder="Select location" />
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Basic Application Information */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Basic application information</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          {/* Personal information */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Personal information</h3>
              <div className="flex items-center gap-6 text-xs font-medium text-muted-foreground pr-1">
                <span className="w-8 text-center">Hide</span>
                <span className="w-8 text-center">Optional</span>
                <span className="w-8 text-center">Required</span>
              </div>
            </div>
            <div className="space-y-0">
              {personalFields.map((field) => (
                <div key={field.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg border border-border mb-1.5">
                  <span className="text-sm text-primary font-medium">{field.label}</span>
                  {field.locked ? (
                    <div className="flex items-center gap-6 pr-1">
                      <span className="w-8" />
                      <span className="w-8" />
                      <div className="w-8 flex justify-center">
                        <div className="h-4 w-4 rounded-full border-2 border-primary bg-primary" />
                      </div>
                    </div>
                  ) : (
                    <VisibilityRadio value={field.visibility} onChange={(v) => updatePersonalField(field.id, v)} />
                  )}
                </div>
              ))}
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Section 5: Custom Application Questions */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Custom application questions</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {customQuestions.map((q, idx) => (
            <div key={q.id} className="flex items-start gap-3 py-3 px-3 rounded-lg border border-border">
              <span className="text-xs font-medium text-muted-foreground mt-1 shrink-0">{idx + 1}.</span>
              <div className="flex-1 min-w-0">
                {editingQuestionId === q.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editingQuestionText}
                      onChange={(e) => setEditingQuestionText(e.target.value)}
                      rows={2}
                      className="text-sm"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`req-${q.id}`}
                        checked={q.required}
                        onCheckedChange={(checked) =>
                          setCustomQuestions((prev) =>
                            prev.map((cq) => (cq.id === q.id ? { ...cq, required: !!checked } : cq))
                          )
                        }
                      />
                      <Label htmlFor={`req-${q.id}`} className="text-xs">Required</Label>
                      <div className="flex-1" />
                      <Button size="sm" variant="ghost" onClick={() => { setEditingQuestionId(null); setEditingQuestionText(""); }}>Cancel</Button>
                      <Button size="sm" onClick={saveEditQuestion}>Save</Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-primary font-medium">
                      {q.question} {q.required && <span className="text-muted-foreground text-xs">(Required)</span>}
                    </p>
                    {q.mapping && (
                      <p className="text-xs text-muted-foreground mt-0.5">↪ {q.mapping}</p>
                    )}
                  </div>
                )}
              </div>
              {editingQuestionId !== q.id && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEditQuestion(q)}>
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteQuestion(q.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={addCustomQuestion}>
              <Plus className="h-3.5 w-3.5" /> Add custom question
            </Button>
            <Button variant="outline" size="sm">Copy from another job</Button>
          </div>
        </CardContent>
      </Card>

      {/* Section 6: Settings */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Settings</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-start gap-3">
            <Checkbox id="confirmation-email" checked={sendConfirmationEmail} onCheckedChange={(c) => setSendConfirmationEmail(!!c)} />
            <Label htmlFor="confirmation-email" className="text-sm cursor-pointer leading-relaxed">Send confirmation email to candidates.</Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox id="auto-publish" checked={autoPublish} onCheckedChange={(c) => setAutoPublish(!!c)} />
            <Label htmlFor="auto-publish" className="text-sm cursor-pointer leading-relaxed">Automatically publish or unpublish the job post at a specific date and time.</Label>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Application confirmation page</p>
            <RadioGroup value={confirmationPage} onValueChange={(v) => setConfirmationPage(v as "default" | "customize")}>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="default" id="confirm-default" />
                <Label htmlFor="confirm-default" className="text-sm cursor-pointer">Default</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="customize" id="confirm-custom" />
                <Label htmlFor="confirm-custom" className="text-sm cursor-pointer">Customize</Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3 pb-8">
        <Button variant="outline" onClick={() => navigate(`/jobs/${jobId}`)}>Save as Draft</Button>
        <Button onClick={handlePublish}>Publish Job Post</Button>
      </div>
    </div>
  );
};

export default JobPostPage;
