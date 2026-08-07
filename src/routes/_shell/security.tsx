import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge, ToneBadge } from "@/components/common/tone-badge";
import { Button } from "@/components/ui/button";
import { sessions } from "@/data/mock";

export const Route = createFileRoute("/_shell/security")({
  head: () => ({
    meta: [
      { title: "Account Security — AutoAudit" },
      { name: "description", content: "Password, multi-factor methods, recovery codes and active session management." },
      { property: "og:title", content: "Account Security — AutoAudit" },
      { property: "og:description", content: "Password, multi-factor methods, recovery codes and active session management." },
    ],
  }),
  component: SecurityPage,
});

function SecurityPage() {
  return (
    <>
      <PageHeader title="Account Security" description="Password, multi-factor methods, recovery codes and active session management." crumbs={[{ label: "Account Security" }]} />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface-card p-5">
          <h2 className="text-sm font-semibold">Multi-factor authentication</h2>
          <div className="mt-4 space-y-3">
            {[["Authenticator app", "Enabled · TOTP", true], ["SMS backup", "+1 ••• ••42", true], ["Email codes", "Not configured", false]].map(([t, d, on]) => (
              <div key={t as string} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{t as string}</p>
                  <p className="text-xs text-muted-foreground">{d as string}</p>
                </div>
                <ToneBadge tone={on ? "success" : "muted"}>{on ? "Active" : "Off"}</ToneBadge>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-4 w-full">Manage MFA methods</Button>
        </section>
        <section className="surface-card p-5">
          <h2 className="text-sm font-semibold">Active sessions</h2>
          <ul className="mt-4 space-y-3">
            {sessions.map((s) => (
              <li key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{s.device}</p>
                  <p className="truncate text-xs text-muted-foreground">{s.location} · {s.ip} · {s.lastActive}</p>
                </div>
                {s.current ? <ToneBadge tone="success">This device</ToneBadge> : <Button variant="ghost" size="sm">Revoke</Button>}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
