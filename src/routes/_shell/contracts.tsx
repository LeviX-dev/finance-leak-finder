import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { DataTable, type Column } from "@/components/common/data-table";
import { StatusBadge, ToneBadge } from "@/components/common/tone-badge";
import { Button } from "@/components/ui/button";
import { contracts } from "@/data/mock";
import type { Contract } from "@/types";
import { currency, dateLong } from "@/lib/format";

export const Route = createFileRoute("/_shell/contracts")({
  head: () => ({
    meta: [
      { title: "Contracts — AutoAudit" },
      { name: "description", content: "Contract terms, rate cards and SLA clauses continuously compared against what vendors actually bill." },
      { property: "og:title", content: "Contracts — AutoAudit" },
      { property: "og:description", content: "Contract terms, rate cards and SLA clauses continuously compared against what vendors actually bill." },
    ],
  }),
  component: ContractsPage,
});

function ContractsPage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const columns: Column<Contract>[] = [
    { key: "id", header: "Contract", render: (r) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{r.title}</p>
          <p className="text-xs text-muted-foreground">{r.id}</p>
        </div>
      ) },
    { key: "vendor", header: "Vendor", render: (r) => <span className="text-sm">{r.vendor}</span> },
    { key: "term", header: "Term", render: (r) => <span className="text-sm text-muted-foreground">{dateLong(r.startDate)} – {dateLong(r.endDate)}</span> },
    { key: "violations", header: "Violations", render: (r) => r.violations > 0 ? <ToneBadge tone="danger">{r.violations}</ToneBadge> : <ToneBadge tone="success">None</ToneBadge> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "value", header: "Value", align: "right", render: (r) => <span className="text-sm font-semibold tabular-nums">{currency(r.value)}</span> },
  ];

  return (
    <>
      <PageHeader
        title="Contracts"
        description="Contract terms, rate cards and SLA clauses continuously compared against what vendors actually bill."
        crumbs={[{ label: "Contracts" }]}
        actions={
          <Button variant="outline" className="gap-2">
            <Download className="size-4" /> Export
          </Button>
        }
      />
      <DataTable
        data={contracts}
        columns={columns}
        loading={loading}
        rowKey={(r) => r.id}
        searchKeys={["title", "vendor", "id"]}
        searchPlaceholder="Search contracts…"
      />
    </>
  );
}
