import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { DataTable, type Column } from "@/components/common/data-table";
import { StatusBadge, ToneBadge } from "@/components/common/tone-badge";
import { Button } from "@/components/ui/button";
import { transactions } from "@/data/mock";
import { currency, dateLong } from "@/lib/format";
import type { Transaction } from "@/types";

export const Route = createFileRoute("/_shell/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — AutoAudit" },
      {
        name: "description",
        content: "Every ERP transaction scored for duplicate, anomaly and fraud risk in one auditable ledger view.",
      },
      { property: "og:title", content: "Transactions — AutoAudit" },
      { property: "og:description", content: "Risk-scored transaction ledger across connected ERP systems." },
    ],
  }),
  component: TransactionsPage,
});

function riskTone(score: number) {
  if (score >= 80) return "danger" as const;
  if (score >= 50) return "warning" as const;
  return "success" as const;
}

function TransactionsPage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const columns: Column<Transaction>[] = [
    {
      key: "id",
      header: "Transaction",
      render: (r) => (
        <div className="min-w-0">
          <p className="text-sm font-medium">{r.id}</p>
          <p className="truncate text-xs text-muted-foreground">{r.description}</p>
        </div>
      ),
    },
    { key: "date", header: "Date", render: (r) => <span className="text-sm">{dateLong(r.date)}</span> },
    { key: "vendor", header: "Vendor", render: (r) => <span className="text-sm">{r.vendor}</span> },
    { key: "account", header: "GL account", render: (r) => <span className="text-sm text-muted-foreground">{r.account}</span> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "risk",
      header: "Risk",
      render: (r) => <ToneBadge tone={riskTone(r.riskScore)}>{r.riskScore}</ToneBadge>,
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (r) => <span className="text-sm font-semibold tabular-nums">{currency(r.amount)}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Transactions"
        description="1,842,665 records ingested this cycle and continuously scored by the detection models."
        crumbs={[{ label: "Transactions" }]}
        actions={
          <>
            <Button variant="outline" className="gap-2">
              <Download className="size-4" /> Export CSV
            </Button>
            <Button className="gap-2">
              <Plus className="size-4" /> New rule
            </Button>
          </>
        }
      />
      <DataTable
        data={transactions}
        columns={columns}
        loading={loading}
        rowKey={(r) => r.id}
        searchKeys={["id", "vendor", "description", "account"]}
        searchPlaceholder="Search transactions…"
      />
    </>
  );
}
