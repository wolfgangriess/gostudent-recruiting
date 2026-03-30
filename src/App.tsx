import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import TopNav from "@/components/TopNav";
import LoginPage from "@/pages/LoginPage";
import Index from "./pages/Index.tsx";
import CandidatesPage from "./pages/CandidatesPage.tsx";
import CandidateDetailPage from "./pages/CandidateDetailPage.tsx";
import ReportsPage from "./pages/ReportsPage.tsx";
import JobPostPage from "./pages/JobPostPage.tsx";
import MyOverviewPage from "./pages/MyOverviewPage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";

import NotFound from "./pages/NotFound.tsx";
import AuthCallbackPage from "./pages/AuthCallbackPage.tsx";
import CareersPage from "./pages/CareersPage.tsx";

const queryClient = new QueryClient();

// ── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("App error boundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <p className="text-sm text-gray-600">Something went wrong. Please refresh the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Protected Routes ──────────────────────────────────────────────────────────
const ProtectedRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <ErrorBoundary>
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
        <Route path="/settings" element={<SettingsPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes — no auth required */}
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="*" element={<ProtectedRoutes />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
