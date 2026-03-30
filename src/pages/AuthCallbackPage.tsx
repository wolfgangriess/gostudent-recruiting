import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Handles the OAuth redirect from Supabase after Google sign-in.
 * Supabase v2 automatically exchanges the code for a session (PKCE flow)
 * when detectSessionInUrl is true (the default).
 * We listen for SIGNED_IN to navigate as soon as the session is ready.
 */
const AuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for the auth state change triggered by the OAuth code exchange.
    // Supabase processes the ?code= param from the URL automatically.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_IN") {
          navigate("/overview", { replace: true });
        }
      }
    );

    // Fallback: if session was already set before this component mounted
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/overview", { replace: true });
      }
    });

    // Hard timeout fallback — ensures we never get stuck on this page
    const timer = setTimeout(() => navigate("/overview", { replace: true }), 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      <p className="text-sm text-muted-foreground">Completing sign-in…</p>
    </div>
  );
};

export default AuthCallbackPage;
