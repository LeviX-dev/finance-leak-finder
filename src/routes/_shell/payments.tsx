import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { DataTable, type Column } from "@/components/common/data-table";
import { StatusBadge, ToneBadge } from "@/components/common/tone-badge";
import { Button } from "@/components/ui/button";
import { payments } from "@/data/mock";
import type { Payment } from "@/types";
import { currency, dateLong } from "@/lib/format";

export const Route = createFileRoute("/_shell/payments")({
  head: () => ({
    meta: [
      { title: "Payments — AutoAudit" },
      { name: "description", content: "Outgoing payments monitored for duplicates, reversals and settlement failures before money leaves the business." },
      { property: "og:title", content: "Payments — AutoAudit" },
      { property: "og:description", content: "Outgoing payments monitored for duplicates, reversals and settlement failures before money leaves the business." },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const columns: Column<Payment>[] = [
    { key: "id", header: "Payment", render: (r) => (
        <div className="min-w-0">
          <p className="text-sm font-medium">{r.id}</p>
          <p className="text-xs text-muted-foreground">{r.invoiceId}</p>
        </div>
      ) },
    { key: "vendor", header: "Vendor", render: (r) => <span className="text-sm">{r.vendor}</span> },
    { key: "method", header: "Method", render: (r) => <ToneBadge tone="muted">{r.method}</ToneBadge> },
    { key: "date", header: "Date", render: (r) => <span className="text-sm">{dateLong(r.date)}</span> },
    { key: "flagged", header: "Signal", render: (r) => r.flagged ? <ToneBadge tone="danger" dot>Flagged</ToneBadge> : <ToneBadge tone="success">Clean</ToneBadge> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "amount", header: "Amount", align: "right", render: (r) => <span className="text-sm font-semibold tabular-nums">{currency(r.amount)}</span> },
  ];

  return (
    <>
      <PageHeader
        title="Payments"
        description="Outgoing payments monitored for duplicates, reversals and settlement failures before money leaves the business."
        crumbs={[{ label: "Payments" }]}
        actions={
          <Button variant="outline" className="gap-2">
            <Download className="size-4" /> Export
          </Button>
        }
      />
      <DataTable
        data={payments}
        columns={columns}
        loading={loading}
        rowKey={(r) => r.id}
        searchKeys={["id", "vendor", "invoiceId"]}
        searchPlaceholder="Search payments…"
      />
    </>
  );
}
