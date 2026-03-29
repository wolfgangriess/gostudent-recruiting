import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Handles the OAuth redirect from Supabase after Google sign-in.
 * Supabase automatically picks up the session from the URL hash/code
 * via the onAuthStateChange listener in useAuth.tsx.
 * This page just waits briefly then redirects to home.
 */
const AuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Let Supabase process the OAuth callback params from the URL
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/", { replace: true });
      } else {
        // Session not ready yet — onAuthStateChange in AuthProvider will fire
        // and ProtectedRoutes will redirect automatically once user is set.
        // Small delay to let the auth state settle.
        const timer = setTimeout(() => navigate("/", { replace: true }), 1500);
        return () => clearTimeout(timer);
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      <p className="text-sm text-muted-foreground">Completing sign-in…</p>
    </div>
  );
};

export default AuthCallbackPage;
