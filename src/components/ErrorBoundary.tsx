import React from "react";
import { Button } from "@/components/ui/button";
import goStudentLogo from "@/assets/gostudent-logo-full.png";

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
          <div className="text-center max-w-sm space-y-5">
            <img
              src={goStudentLogo}
              alt="GoStudent"
              className="h-8 mx-auto"
            />
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-foreground">
                Etwas ist schiefgelaufen.
              </h1>
              <p className="text-sm text-muted-foreground">
                Ein unerwarteter Fehler ist aufgetreten. Bitte lade die Seite neu.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={() => window.location.reload()}>
                Seite neu laden
              </Button>
              <a
                href="mailto:wolfgang.riess@gostudent.org"
                className="text-sm text-primary hover:underline"
              >
                Support kontaktieren
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
