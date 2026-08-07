import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { DataTable, type Column } from "@/components/common/data-table";
import { StatusBadge, ToneBadge } from "@/components/common/tone-badge";
import { Button } from "@/components/ui/button";
import { invoices } from "@/data/mock";
import type { Invoice } from "@/types";
import { currency, dateLong } from "@/lib/format";

export const Route = createFileRoute("/_shell/invoices")({
  head: () => ({
    meta: [
      { title: "Invoices — AutoAudit" },
      { name: "description", content: "Invoice register with duplicate detection, tax validation and approval status across every connected system." },
      { property: "og:title", content: "Invoices — AutoAudit" },
      { property: "og:description", content: "Invoice register with duplicate detection, tax validation and approval status across every connected system." },
    ],
  }),
  component: InvoicesPage,
});

function InvoicesPage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const columns: Column<Invoice>[] = [
    {
      key: "id",
      header: "Invoice",
      render: (r) => (
        <div className="min-w-0">
          <p className="text-sm font-medium">{r.id}</p>
          {r.duplicateOf && (
            <p className="text-xs text-destructive">Possible duplicate of {r.duplicateOf}</p>
          )}
        </div>
      ),
    },
    { key: "vendor", header: "Vendor", render: (r) => <span className="text-sm">{r.vendor}</span> },
    { key: "issued", header: "Issued", render: (r) => <span className="text-sm">{dateLong(r.issued)}</span> },
    { key: "due", header: "Due", render: (r) => <span className="text-sm">{dateLong(r.due)}</span> },
    { key: "tax", header: "Tax", align: "right", render: (r) => <span className="text-sm tabular-nums">{currency(r.tax)}</span> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "amount", header: "Amount", align: "right", render: (r) => <span className="text-sm font-semibold tabular-nums">{currency(r.amount)}</span> },
  ];

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Invoice register with duplicate detection, tax validation and approval status across every connected system."
        crumbs={[{ label: "Invoices" }]}
        actions={
          <Button variant="outline" className="gap-2">
            <Download className="size-4" /> Export
          </Button>
        }
      />
      <DataTable
        data={invoices}
        columns={columns}
        loading={loading}
        rowKey={(r) => r.id}
        searchKeys={["id", "vendor", "status"]}
        searchPlaceholder="Search invoices…"
      />
    </>
  );
}
