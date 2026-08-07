import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { DataTable, type Column } from "@/components/common/data-table";
import { StatusBadge, ToneBadge } from "@/components/common/tone-badge";
import { Button } from "@/components/ui/button";
import { reports } from "@/data/mock";
import { currency, dateLong } from "@/lib/format";

export const Route = createFileRoute("/_shell/reports")({
  head: () => ({
    meta: [
      { title: "Reports — AutoAudit" },
      { name: "description", content: "Board-ready leakage, recovery and compliance reports generated from live audit data." },
      { property: "og:title", content: "Reports — AutoAudit" },
      { property: "og:description", content: "Board-ready leakage, recovery and compliance reports generated from live audit data." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const columns: Column<(typeof reports)[number]>[] = [
    { key: "name", header: "Report", render: (r) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.id} · {r.size}</p>
        </div>
      ) },
    { key: "type", header: "Type", render: (r) => <ToneBadge tone="brand">{r.type}</ToneBadge> },
    { key: "owner", header: "Owner", render: (r) => <span className="text-sm">{r.owner}</span> },
    { key: "generated", header: "Generated", align: "right", render: (r) => <span className="text-sm text-muted-foreground">{dateLong(r.generated)}</span> },
  ];

  return (
    <>
      <PageHeader
        title="Reports"
        description="Board-ready leakage, recovery and compliance reports generated from live audit data."
        crumbs={[{ label: "Reports" }]}
        actions={
          <Button variant="outline" className="gap-2">
            <Download className="size-4" /> Export
          </Button>
        }
      />
      <DataTable
        data={reports}
        columns={columns}
        loading={loading}
        rowKey={(r) => r.id}
        searchKeys={["name", "type", "owner"]}
        searchPlaceholder="Search reports…"
      />
    </>
  );
}
