import { Users } from "lucide-react";

const CandidatesPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-5">
        <Users className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-3xl font-extrabold text-foreground mb-2">Candidates</h1>
      <p className="text-muted-foreground max-w-md mx-auto">
        Candidate management coming soon. View candidates within each job's pipeline for now.
      </p>
    </div>
  );
};

export default CandidatesPage;
