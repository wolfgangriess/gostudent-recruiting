import { Users } from "lucide-react";

const CandidatesPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 text-center">
      <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
      <h1 className="text-2xl font-bold text-foreground mb-2">Candidates</h1>
      <p className="text-muted-foreground">
        Candidate management coming soon. View candidates within each job's pipeline for now.
      </p>
    </div>
  );
};

export default CandidatesPage;
