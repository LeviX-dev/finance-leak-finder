import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge, ToneBadge } from "@/components/common/tone-badge";
import { Button } from "@/components/ui/button";
import { users } from "@/data/mock";
import { roleMap } from "@/constants/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/_shell/users")({
  head: () => ({
    meta: [
      { title: "Users — AutoAudit" },
      { name: "description", content: "Manage the finance, procurement and audit teammates who have access to this workspace." },
      { property: "og:title", content: "Users — AutoAudit" },
      { property: "og:description", content: "Manage the finance, procurement and audit teammates who have access to this workspace." },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  return (
    <>
      <PageHeader title="Users" description="Manage the finance, procurement and audit teammates who have access to this workspace." crumbs={[{ label: "Users" }]} />
      <div className="surface-card divide-y divide-border">
        {users.map((u) => (
          <div key={u.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="size-9 shrink-0">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{u.initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{u.name}</p>
                <p className="truncate text-xs text-muted-foreground">{u.email} · {u.department}</p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              <ToneBadge tone="brand">{roleMap[u.role].label}</ToneBadge>
              <StatusBadge status={u.status} />
              <span className="hidden text-xs text-muted-foreground sm:inline">{u.lastActive}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
