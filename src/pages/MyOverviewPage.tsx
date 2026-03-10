import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { HelpCircle, ChevronRight } from "lucide-react";

const TASKS_MY = [
  { label: "Needs Decision", count: "-" },
  { label: "Forms To Send", count: "-" },
  { label: "Candidates to Schedule", count: "-" },
  { label: "Take Home Tests to Send", count: "-" },
  { label: "Offers", count: "-" },
  { label: "Kickoff Form Tasks", count: "-" },
  { label: "Interviewer training to review", count: "-" },
];

const MyOverviewPage = () => {
  const dateRange = "Feb 23 - Mar 9, 2026";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-6">My Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* Company goals */}
          <Card>
            <CardContent className="pt-5 pb-5 px-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-bold text-foreground">Company goals</h2>
                <button className="text-sm font-medium text-primary hover:underline">See goal dashboard</button>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Your averages and attainments from {dateRange}</p>

              <Card className="border border-border shadow-none">
                <CardContent className="pt-4 pb-4 px-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-sm font-medium text-foreground">Time to submit scorecards</span>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-foreground">Target: 24 hrs</p>
                    <p className="text-muted-foreground">My average: -</p>
                    <p className="text-muted-foreground">My attainment: -</p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* My goals */}
          <Card>
            <CardContent className="pt-5 pb-5 px-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-bold text-foreground">My goals</h2>
                <button className="text-sm font-medium text-primary hover:underline flex items-center gap-0.5">
                  Create goal <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground">You have no individual goals.</p>
              <p className="text-xs text-muted-foreground">Goals are used to track progress on an activity.</p>
            </CardContent>
          </Card>

          {/* My interviews */}
          <Card>
            <CardContent className="pt-5 pb-5 px-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-bold text-foreground">My interviews</h2>
                <button className="text-sm font-medium text-primary hover:underline flex items-center gap-0.5">
                  See past interviews <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground">You have no upcoming interviews.</p>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* My Tasks */}
          <Card>
            <CardContent className="pt-0 pb-4 px-0">
              <div className="flex border-b border-border">
                <button className="flex-1 py-3 text-sm font-semibold text-foreground border-b-2 border-primary text-center">
                  My Tasks
                </button>
                <button className="flex-1 py-3 text-sm font-semibold text-muted-foreground text-center hover:text-foreground">
                  All Tasks
                </button>
              </div>
              <div className="divide-y divide-border">
                {TASKS_MY.map((task) => (
                  <div key={task.label} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-primary font-medium">{task.label}</span>
                    <span className="text-sm text-muted-foreground">{task.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* My approvals */}
          <Card>
            <CardContent className="pt-5 pb-5 px-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground">My approvals</h2>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">You have no jobs or offers to approve.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MyOverviewPage;
