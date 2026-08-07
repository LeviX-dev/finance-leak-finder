import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge, ToneBadge } from "@/components/common/tone-badge";
import { Button } from "@/components/ui/button";
import { alerts } from "@/data/mock";
import { SeverityBadge } from "@/components/common/tone-badge";

export const Route = createFileRoute("/_shell/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — AutoAudit" },
      { name: "description", content: "Every alert raised by the detection engine, ranked by severity and recency." },
      { property: "og:title", content: "Notifications — AutoAudit" },
      { property: "og:description", content: "Every alert raised by the detection engine, ranked by severity and recency." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  return (
    <>
      <PageHeader title="Notifications" description="Every alert raised by the detection engine, ranked by severity and recency." crumbs={[{ label: "Notifications" }]} />
      <ul className="surface-card divide-y divide-border">
        {alerts.map((a) => (
          <li key={a.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 p-4">
            <div className="min-w-0">
              <p className="text-sm font-medium">{a.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{a.time} · {a.category}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <SeverityBadge severity={a.severity} />
              {!a.read && <ToneBadge tone="brand" size="sm">Unread</ToneBadge>}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
