import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge, ToneBadge } from "@/components/common/tone-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/providers/theme-provider";

export const Route = createFileRoute("/_shell/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AutoAudit" },
      { name: "description", content: "Workspace preferences, detection thresholds, notification routing and appearance." },
      { property: "og:title", content: "Settings — AutoAudit" },
      { property: "og:description", content: "Workspace preferences, detection thresholds, notification routing and appearance." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  return (
    <>
      <PageHeader title="Settings" description="Workspace preferences, detection thresholds, notification routing and appearance." crumbs={[{ label: "Settings" }]} />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface-card p-5">
          <h2 className="text-sm font-semibold">Workspace</h2>
          <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ws-name">Organisation name</Label>
              <Input id="ws-name" defaultValue="Northgate Holdings" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ws-currency">Reporting currency</Label>
              <Input id="ws-currency" defaultValue="USD — US Dollar" />
            </div>
          </div>
        </section>
        <section className="surface-card p-5">
          <h2 className="text-sm font-semibold">Detection & alerts</h2>
          <div className="mt-4 space-y-4">
            {[
              ["Duplicate payment guardrail", "Hold suspected duplicates before ACH release"],
              ["Fraud escalation", "Notify the fraud committee for critical findings"],
              ["Weekly CFO digest", "Email a savings summary every Monday"],
            ].map(([t, d]) => (
              <div key={t} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{t}</p>
                  <p className="text-xs text-muted-foreground">{d}</p>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </section>
        <section className="surface-card p-5">
          <h2 className="text-sm font-semibold">Appearance</h2>
          <p className="mt-1 text-xs text-muted-foreground">Switch between light and dark presentation.</p>
          <Button variant="outline" className="mt-4" onClick={toggleTheme}>
            Use {theme === "dark" ? "light" : "dark"} mode
          </Button>
        </section>
      </div>
    </>
  );
}
