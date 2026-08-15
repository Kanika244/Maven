import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_app/onboarding")({
  component: LegacyOnboardingRedirect,
});

function LegacyOnboardingRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    sessionStorage.setItem("maven_onboarding_mode", "1");
    navigate({ to: "/register", replace: true });
  }, [navigate]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
      Opening onboarding…
    </div>
  );
}
