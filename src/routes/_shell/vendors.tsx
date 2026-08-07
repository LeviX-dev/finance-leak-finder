import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { DataTable, type Column } from "@/components/common/data-table";
import { StatusBadge, ToneBadge } from "@/components/common/tone-badge";
import { Button } from "@/components/ui/button";
import { vendors } from "@/data/mock";
import type { Vendor } from "@/types";
import { currency, dateLong } from "@/lib/format";

export const Route = createFileRoute("/_shell/vendors")({
  head: () => ({
    meta: [
      { title: "Vendors — AutoAudit" },
      { name: "description", content: "Vendor spend, leak history and AI risk scoring to focus recovery efforts where exposure is highest." },
      { property: "og:title", content: "Vendors — AutoAudit" },
      { property: "og:description", content: "Vendor spend, leak history and AI risk scoring to focus recovery efforts where exposure is highest." },
    ],
  }),
  component: VendorsPage,
});

function VendorsPage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const columns: Column<Vendor>[] = [
    { key: "name", header: "Vendor", render: (r) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-xs font-semibold text-primary">
            {r.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{r.name}</p>
            <p className="text-xs text-muted-foreground">{r.category} · {r.country}</p>
          </div>
        </div>
      ) },
    { key: "leaks", header: "Open leaks", render: (r) => <ToneBadge tone={r.leaks > 8 ? "danger" : "muted"}>{r.leaks}</ToneBadge> },
    { key: "risk", header: "Risk score", render: (r) => <ToneBadge tone={r.riskScore >= 80 ? "danger" : r.riskScore >= 50 ? "warning" : "success"}>{r.riskScore}</ToneBadge> },
    { key: "contract", header: "Contract", render: (r) => <StatusBadge status={r.contractStatus} /> },
    { key: "spend", header: "Spend YTD", align: "right", render: (r) => <span className="text-sm font-semibold tabular-nums">{currency(r.spendYtd)}</span> },
  ];

  return (
    <>
      <PageHeader
        title="Vendors"
        description="Vendor spend, leak history and AI risk scoring to focus recovery efforts where exposure is highest."
        crumbs={[{ label: "Vendors" }]}
        actions={
          <Button variant="outline" className="gap-2">
            <Download className="size-4" /> Export
          </Button>
        }
      />
      <DataTable
        data={vendors}
        columns={columns}
        loading={loading}
        rowKey={(r) => r.id}
        searchKeys={["name", "category", "country"]}
        searchPlaceholder="Search vendors…"
      />
    </>
  );
}
