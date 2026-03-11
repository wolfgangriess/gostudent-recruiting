import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, ArrowUpDown, MapPin, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useATSStore } from "@/lib/ats-store";
import { DEPARTMENTS, LOCATIONS } from "@/lib/types";
import AddJobDialog from "@/components/AddJobDialog";

type SortKey = "name" | "department" | "location" | "newCandidates" | "totalCandidates";
type SortDir = "asc" | "desc";

const JobsList = () => {
  const { jobs, getNewCandidatesCount, getTotalCandidatesCount } = useATSStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [locFilter, setLocFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [dialogOpen, setDialogOpen] = useState(false);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    let list = [...jobs];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (j) =>
          j.name.toLowerCase().includes(q) ||
          j.department.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q)
      );
    }
    if (deptFilter !== "all") list = list.filter((j) => j.department === deptFilter);
    if (locFilter !== "all") list = list.filter((j) => j.location === locFilter);

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "department":
          cmp = a.department.localeCompare(b.department);
          break;
        case "location":
          cmp = a.location.localeCompare(b.location);
          break;
        case "newCandidates":
          cmp = getNewCandidatesCount(a.id) - getNewCandidatesCount(b.id);
          break;
        case "totalCandidates":
          cmp = getTotalCandidatesCount(a.id) - getTotalCandidatesCount(b.id);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [jobs, search, deptFilter, locFilter, sortKey, sortDir, getNewCandidatesCount, getTotalCandidatesCount]);

  const SortButton = ({ label, column }: { label: string; column: SortKey }) => (
    <button
      className="flex items-center gap-1 font-semibold hover:text-foreground transition-colors"
      onClick={() => toggleSort(column)}
    >
      {label}
      <ArrowUpDown className="h-3.5 w-3.5" />
    </button>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Jobs</h1>
          <p className="mt-1 text-sm text-muted-foreground">{jobs.length} open positions</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="lg" className="gap-2 rounded-xl font-semibold text-sm px-6">
          <Plus className="h-4 w-4" />
          Add New Job
        </Button>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl">
            <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={locFilter} onValueChange={setLocFilter}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Office" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Offices</SelectItem>
            {LOCATIONS.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/50">
              <TableHead><SortButton label="Job Name" column="name" /></TableHead>
              <TableHead><SortButton label="Department" column="department" /></TableHead>
              <TableHead><SortButton label="Office" column="location" /></TableHead>
              <TableHead className="text-center"><SortButton label="New" column="newCandidates" /></TableHead>
              <TableHead className="text-center"><SortButton label="Total" column="totalCandidates" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((job) => {
              const newCount = getNewCandidatesCount(job.id);
              const totalCount = getTotalCandidatesCount(job.id);
              return (
                <TableRow
                  key={job.id}
                  className="cursor-pointer transition-colors hover:bg-primary/[0.03]"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <TableCell className="font-semibold text-primary hover:underline">
                    {job.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="rounded-lg font-medium bg-accent/30 text-accent-foreground border-0">{job.department}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{job.location}</TableCell>
                  <TableCell className="text-center">
                    {newCount > 0 ? (
                      <Badge className="rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border-0 font-semibold">{newCount}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center font-semibold">{totalCount}</TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No jobs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AddJobDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default JobsList;
