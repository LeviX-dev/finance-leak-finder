import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — AutoAudit" },
      { name: "description", content: "Sign in to AutoAudit to review detected financial leakage and recovery progress." },
      { property: "og:title", content: "Sign in — AutoAudit" },
      { property: "og:description", content: "Sign in to AutoAudit to review detected financial leakage and recovery progress." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate({ to: "/" }), 900);
  };
  return (
    <AuthLayout
      title="Sign in to AutoAudit"
      subtitle="Use your corporate credentials to access the audit workspace."
      footer={<>No account? <Link to="/register" className="font-medium text-primary hover:underline">Request access</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" defaultValue="avery.chen@northgate.com" required />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">Forgot?</Link>
          </div>
          <Input id="password" type="password" defaultValue="demo-password" required />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="remember" defaultChecked />
          <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">Keep me signed in for 30 days</Label>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
        <Button type="button" variant="outline" className="w-full" onClick={() => navigate({ to: "/mfa" })}>
          Continue with SSO
        </Button>
      </form>
    </AuthLayout>
  );
}
