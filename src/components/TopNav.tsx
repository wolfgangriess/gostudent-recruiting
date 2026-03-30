import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Briefcase, Users, BarChart3, ChevronDown, UserPlus, Share2, LayoutDashboard, Settings, LogOut, Bell } from "lucide-react";
import gostudentIcon from "@/assets/recruiting-logo.png";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import AddJobDialog from "@/components/AddJobDialog";
import AddCandidateDialog from "@/components/AddCandidateDialog";
import AddReferralDialog from "@/components/AddReferralDialog";
import { useAllCandidates } from "@/hooks/useCandidates";
import { useJobs } from "@/hooks/useJobs";
import { useStages } from "@/hooks/useStages";

const navItems = [
  { to: "/overview", label: "My Overview", icon: LayoutDashboard },
  { to: "/jobs", label: "Jobs", icon: Briefcase },
  { to: "/candidates", label: "Candidates", icon: Users },
  { to: "/reports", label: "Reports", icon: BarChart3 },
];

const TopNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [addJobOpen, setAddJobOpen] = useState(false);
  const [addCandidateOpen, setAddCandidateOpen] = useState(false);
  const [addReferralOpen, setAddReferralOpen] = useState(false);

  const { data: candidates = [] } = useAllCandidates();
  const { data: jobs = [] } = useJobs();
  const { data: stages = [] } = useStages();

  const notificationCount = useMemo(() => {
    const userId = user?.id ?? "";
    const myJobIds = jobs
      .filter((j) => j.hiringManager === userId || j.recruiters.includes(userId))
      .map((j) => j.id);
    const myCandidates = candidates.filter((c) => myJobIds.includes(c.jobId));

    const byStage = (name: string) =>
      myCandidates.filter((c) => stages.find((s) => s.id === c.currentStageId)?.name === name);

    // scorecards due = candidates in Interview stage
    const scorecardsDue = byStage("Interview").length;
    // needs decision = candidates in Interview stage whose interview was >2 days ago
    const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
    const needsDecision = byStage("Interview").filter((c) => {
      const dt = c.scheduledAt ? new Date(c.scheduledAt).getTime() : new Date(c.updatedAt).getTime();
      return dt < twoDaysAgo;
    }).length;
    // pending approvals = candidates in Offer stage for jobs where user is hiring manager
    const hiringManagerJobIds = jobs.filter((j) => j.hiringManager === userId).map((j) => j.id);
    const pendingApprovals = candidates.filter(
      (c) =>
        hiringManagerJobIds.includes(c.jobId) &&
        stages.find((s) => s.id === c.currentStageId)?.name === "Offer"
    ).length;

    return scorecardsDue + needsDecision + pendingApprovals;
  }, [candidates, jobs, stages, user]);

  const userMeta = user?.user_metadata;
  const avatarUrl = userMeta?.avatar_url || userMeta?.picture;
  const fullName = userMeta?.full_name || userMeta?.name || user?.email || "";
  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-primary/10 bg-primary">
        <div className="mx-auto flex h-12 max-w-7xl items-center gap-8 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={gostudentIcon} alt="GoStudent" className="h-9 w-9 brightness-0 invert" />
            <span className="text-[13px] font-semibold text-primary-foreground">GoStudent Recruiting</span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all ${
                    active
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "text-primary-foreground/65 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            {/* Notification bell */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 text-primary-foreground/65 hover:text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate("/overview")}
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white leading-none">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="gap-1 rounded-lg font-medium text-[13px] h-8 px-3">
                  Add
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setAddJobOpen(true)} className="gap-2 cursor-pointer">
                  <Briefcase className="h-4 w-4" />
                  Add a Role
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAddCandidateOpen(true)} className="gap-2 cursor-pointer">
                  <UserPlus className="h-4 w-4" />
                  Add a Candidate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAddReferralOpen(true)} className="gap-2 cursor-pointer">
                  <Share2 className="h-4 w-4" />
                  Add a Referral
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full p-0">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={avatarUrl} alt={fullName} />
                    <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-[11px] font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-1.5 border-b border-border mb-1">
                  <p className="text-sm font-medium text-foreground truncate">{fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuItem onClick={handleSignOut} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground/65 hover:text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate("/settings")}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <AddJobDialog open={addJobOpen} onOpenChange={setAddJobOpen} />
      <AddCandidateDialog open={addCandidateOpen} onOpenChange={setAddCandidateOpen} />
      <AddReferralDialog open={addReferralOpen} onOpenChange={setAddReferralOpen} />
    </>
  );
};

export default TopNav;
