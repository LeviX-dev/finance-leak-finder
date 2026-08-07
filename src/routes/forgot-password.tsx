import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset password — AutoAudit" },
      { name: "description", content: "Request a password reset link for your AutoAudit account." },
      { property: "og:title", content: "Reset password — AutoAudit" },
      { property: "og:description", content: "Request a password reset link for your AutoAudit account." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate({ to: "/" }), 900);
  };
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We will email a secure reset link to your work address."
      footer={<Link to="/login" className="font-medium text-primary hover:underline">Back to sign in</Link>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5"><Label htmlFor="remail">Work email</Label><Input id="remail" type="email" required /></div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Sending…" : "Send reset link"}</Button>
      </form>
    </AuthLayout>
  );
}
