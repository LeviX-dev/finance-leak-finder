import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge, ToneBadge } from "@/components/common/tone-badge";
import { Button } from "@/components/ui/button";
import { integrations } from "@/data/mock";

export const Route = createFileRoute("/_shell/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — AutoAudit" },
      { name: "description", content: "Connect ERP, accounting, procurement and payment systems to feed the detection engine." },
      { property: "og:title", content: "Integrations — AutoAudit" },
      { property: "og:description", content: "Connect ERP, accounting, procurement and payment systems to feed the detection engine." },
    ],
  }),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  return (
    <>
      <PageHeader title="Integrations" description="Connect ERP, accounting, procurement and payment systems to feed the detection engine." crumbs={[{ label: "Integrations" }]} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {integrations.map((i) => (
          <article key={i.id} className="surface-card p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{i.name}</p>
                <p className="text-xs text-muted-foreground">{i.category}</p>
              </div>
              <StatusBadge status={i.status} />
            </div>
            <dl className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between"><dt className="text-muted-foreground">Last sync</dt><dd>{i.lastSync}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Records</dt><dd>{i.records}</dd></div>
            </dl>
            <Button variant="outline" size="sm" className="mt-4 w-full">
              {i.status === "connected" ? "Manage" : "Connect"}
            </Button>
          </article>
        ))}
      </div>
    </>
  );
}
