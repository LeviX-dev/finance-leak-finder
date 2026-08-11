import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — AutoAudit" },
      { name: "description", content: "Create an AutoAudit workspace account for your finance and audit team." },
      { property: "og:title", content: "Create account — AutoAudit" },
      { property: "og:description", content: "Create an AutoAudit workspace account for your finance and audit team." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ first: "", last: "", email: "", org: "", password: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: `${form.first} ${form.last}`.trim(), organisation: form.org },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) {
      void navigate({ to: "/" });
    } else {
      toast.success("Check your inbox to confirm your email, then sign in.");
      void navigate({ to: "/login" });
    }
  };

  return (
    <AuthLayout
      title="Create your workspace account"
      subtitle="Tell us who you are and we will provision your audit workspace."
      footer={<>Already onboarded? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label htmlFor="first">First name</Label><Input id="first" value={form.first} onChange={set("first")} required /></div>
          <div className="space-y-1.5"><Label htmlFor="last">Last name</Label><Input id="last" value={form.last} onChange={set("last")} required /></div>
        </div>
        <div className="space-y-1.5"><Label htmlFor="cemail">Work email</Label><Input id="cemail" type="email" value={form.email} onChange={set("email")} required /></div>
        <div className="space-y-1.5"><Label htmlFor="org">Organisation</Label><Input id="org" value={form.org} onChange={set("org")} required /></div>
        <div className="space-y-1.5"><Label htmlFor="pw">Password</Label><Input id="pw" type="password" autoComplete="new-password" minLength={8} value={form.password} onChange={set("password")} required /></div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating…" : "Create account"}</Button>
      </form>
    </AuthLayout>
  );
}
