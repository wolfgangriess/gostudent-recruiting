import { useParams } from "react-router-dom";
import JobsList from "@/components/JobsList";
import JobDetail from "@/components/JobDetail";

const Index = () => {
  const { jobId } = useParams<{ jobId: string }>();

  if (jobId) {
    return <JobDetail />;
  }

  return <JobsList />;
};

export default Index;
