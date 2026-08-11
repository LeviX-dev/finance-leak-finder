import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useMockAuth } from "@/providers/mock-auth-provider";

export const Route = createFileRoute("/_shell")({
  component: ShellLayout,
});

function ShellLayout() {
  const { session, loadingSession } = useMockAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loadingSession && !session) void navigate({ to: "/login" });
  }, [loadingSession, session, navigate]);

  if (loadingSession || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
