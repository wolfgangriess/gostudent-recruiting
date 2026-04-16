import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable";
import goStudentLogo from "@/assets/gostudent-logo-full.png";
import gostudentIcon from "@/assets/gostudent-pencil-icon.png";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const LoginPage = () => {
  const [ssoLoading, setSsoLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // GoStudent employees — routes through Lovable cloud auth (not direct Supabase OAuth)
  const handleGoStudentSSO = async () => {
    setSsoLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth/callback`,
      extraParams: { hd: "gostudent.org" },
    });
    if (result.error) {
      toast.error("Sign in failed. Please try again.");
      setSsoLoading(false);
    }
    // If redirected, browser navigates away — loading stays true intentionally
  };

  // External accounts — no domain restriction
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth/callback`,
    });
    if (result.error) {
      toast.error("Sign in failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  const anyLoading = ssoLoading || googleLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-8 py-8 flex flex-col items-center gap-3">
            <img src={goStudentLogo} alt="GoStudent" className="h-7 brightness-0 invert" />
            <p className="text-primary-foreground/70 text-xs font-medium">Recruiting Platform</p>
          </div>

          {/* Body */}
          <div className="px-8 py-8 flex flex-col gap-5">
            {/* Primary: GoStudent SSO */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">GoStudent Employees</p>
              <Button
                className="w-full gap-2.5 h-11 text-sm font-semibold"
                onClick={handleGoStudentSSO}
                disabled={anyLoading}
              >
                {ssoLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <img src={gostudentIcon} alt="" className="h-4 w-4 brightness-0 invert" />
                )}
                {ssoLoading ? "Redirecting…" : "Sign in with GoStudent SSO"}
              </Button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] text-muted-foreground font-medium">OR</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Secondary: Google (external) */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">External Accounts</p>
              <Button
                variant="outline"
                className="w-full gap-2.5 h-11 text-sm font-medium"
                onClick={handleGoogleSignIn}
                disabled={anyLoading}
              >
                {googleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                {googleLoading ? "Connecting…" : "Sign in with Google"}
              </Button>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-1.5 justify-center pt-1">
              <Shield className="h-3 w-3 text-muted-foreground/50" />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                SSO secured by GoStudent Identity
              </p>
            </div>
          </div>
        </div>

        {/* Setup note — visible only in dev */}
        {import.meta.env.DEV && (
          <p className="mt-4 text-center text-[10px] text-muted-foreground/60 leading-relaxed px-4">
            Before SSO works: enable Google provider in Supabase Dashboard → Auth → Providers,
            add OAuth credentials from Google Cloud Console, and set the redirect URI to{" "}
            <code className="font-mono">{REDIRECT_TO}</code>.
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
