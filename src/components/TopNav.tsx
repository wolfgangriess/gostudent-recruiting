import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Briefcase, Users, BarChart3, ChevronDown, Plus, UserPlus, Share2, LayoutDashboard } from "lucide-react";
import gostudentLogo from "@/assets/gostudent-logo.png";
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

const navItems = [
  { to: "/overview", label: "My Overview", icon: LayoutDashboard },
  { to: "/jobs", label: "Jobs", icon: Briefcase },
  { to: "/candidates", label: "Candidates", icon: Users },
  { to: "/reports", label: "Reports", icon: BarChart3 },
];

const TopNav = () => {
  const location = useLocation();
  const [addJobOpen, setAddJobOpen] = useState(false);
  const [addCandidateOpen, setAddCandidateOpen] = useState(false);
  const [addReferralOpen, setAddReferralOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-primary/10 bg-primary">
        <div className="mx-auto flex h-12 max-w-7xl items-center gap-8 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={gostudentLogo} alt="GoStudent" className="h-6 w-6 brightness-0 invert" />
            <span className="text-[13px] font-semibold text-primary-foreground">GoStudentRecruiting</span>
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

          <div className="ml-auto">
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
