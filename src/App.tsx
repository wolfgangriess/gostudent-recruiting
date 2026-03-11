import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import TopNav from "@/components/TopNav";
import Index from "./pages/Index.tsx";
import CandidatesPage from "./pages/CandidatesPage.tsx";
import CandidateDetailPage from "./pages/CandidateDetailPage.tsx";
import ReportsPage from "./pages/ReportsPage.tsx";
import JobPostPage from "./pages/JobPostPage.tsx";
import MyOverviewPage from "./pages/MyOverviewPage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TopNav />
        <Routes>
          <Route path="/" element={<MyOverviewPage />} />
          <Route path="/overview" element={<MyOverviewPage />} />
          <Route path="/jobs" element={<Index />} />
          <Route path="/jobs/:jobId" element={<Index />} />
          <Route path="/jobs/:jobId/post" element={<JobPostPage />} />
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/candidates/:candidateId" element={<CandidateDetailPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
