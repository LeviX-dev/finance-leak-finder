import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Request access — AutoAudit" },
      { name: "description", content: "Create an AutoAudit workspace account for your finance and audit team." },
      { property: "og:title", content: "Request access — AutoAudit" },
      { property: "og:description", content: "Create an AutoAudit workspace account for your finance and audit team." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate({ to: "/" }), 900);
  };
  return (
    <AuthLayout
      title="Request workspace access"
      subtitle="Tell us who you are and we will provision your audit workspace."
      footer={<>Already onboarded? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label htmlFor="first">First name</Label><Input id="first" required /></div>
          <div className="space-y-1.5"><Label htmlFor="last">Last name</Label><Input id="last" required /></div>
        </div>
        <div className="space-y-1.5"><Label htmlFor="cemail">Work email</Label><Input id="cemail" type="email" required /></div>
        <div className="space-y-1.5"><Label htmlFor="org">Organisation</Label><Input id="org" required /></div>
        <div className="space-y-1.5"><Label htmlFor="pw">Password</Label><Input id="pw" type="password" required /></div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating…" : "Create account"}</Button>
      </form>
    </AuthLayout>
  );
}
