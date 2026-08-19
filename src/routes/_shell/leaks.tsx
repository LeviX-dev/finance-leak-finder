import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "motion/react";
import { Download, Plug, RefreshCw, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { DataTable, type Column } from "@/components/common/data-table";
import { SeverityBadge, ToneBadge } from "@/components/common/tone-badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getErpOverview } from "@/lib/erp.functions";
import type { DetectedLeak } from "@/lib/erp/data.server";
import { currency } from "@/lib/format";

export const Route = createFileRoute("/_shell/leaks")({
  head: () => ({
    meta: [
      { title: "Financial Leaks Register — AutoAudit" },
      {
        name: "description",
        content:
          "Triage every detected financial leak from your imported ERP data: duplicate invoices, duplicate payments, overpayments and overdue liabilities.",
      },
      { property: "og:title", content: "Financial Leaks Register — AutoAudit" },
      { property: "og:description", content: "Detected financial leakage from your live accounting data, ranked by recoverable impact." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LeaksPage,
});

const TABS = [
  { id: "all", label: "All" },
  { id: "Duplicate invoice", label: "Duplicate invoices" },
  { id: "Duplicate payment", label: "Duplicate payments" },
  { id: "Overpayment", label: "Overpayments" },
  { id: "Overdue liability", label: "Overdue" },
] as const;

function money(amount: number, code: string) {
  if (!code) return currency(amount);
  try {
    return currency(amount, { currency: code });
  } catch {
    return `${code} ${Math.round(amount).toLocaleString()}`;
  }
}

function LeaksPage() {
  const fetchOverview = useServerFn(getErpOverview);
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["erp-overview"],
    queryFn: () => fetchOverview({}),
  });

  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [selected, setSelected] = useState<DetectedLeak | null>(null);

  const leaks = useMemo(() => data?.leaks ?? [], [data]);
  const rows = useMemo(
    () => (tab === "all" ? leaks : leaks.filter((l) => l.type === tab)),
    [leaks, tab],
  );

  const columns: Column<DetectedLeak>[] = [
    {
      key: "leak",
      header: "Finding",
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{r.title}</p>
          <p className="truncate text-xs text-muted-foreground">{r.detail}</p>
        </div>
      ),
    },
    { key: "type", header: "Category", render: (r) => <ToneBadge tone="brand">{r.type}</ToneBadge> },
    { key: "vendor", header: "Vendor", render: (r) => <span className="text-sm">{r.vendor}</span> },
    { key: "severity", header: "Severity", render: (r) => <SeverityBadge severity={r.severity} /> },
    {
      key: "amount",
      header: "Exposure",
      align: "right",
      render: (r) => (
        <span className="text-sm font-semibold tabular-nums">{money(r.amount, r.currency)}</span>
      ),
    },
  ];

  const total = leaks.reduce((s, l) => s + l.amount, 0);
  const connected = data?.connected ?? false;

  return (
    <>
      <PageHeader
        title="Financial leaks"
        description={
          connected
            ? `${leaks.length} findings across ${data?.totals.invoices ?? 0} imported invoices and ${data?.totals.payments ?? 0} payments — ${currency(total)} of recoverable exposure.`
            : "Connect an accounting or ERP account to detect leaks in your real invoices, payments and vendors."
        }
        crumbs={[{ label: "Financial Leaks" }]}
        actions={
          <>
            <Button variant="outline" className="gap-2" onClick={() => void refetch()} disabled={isFetching}>
              <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} /> Re-analyze
            </Button>
            <Button className="gap-2" disabled={!leaks.length}>
              <Download className="size-4" /> Export register
            </Button>
          </>
        }
      />

      {!isLoading && !connected ? (
        <section className="surface-card flex flex-col items-center gap-3 p-10 text-center">
          <Plug className="size-6 text-primary" />
          <h2 className="text-base font-semibold">No imported financial data yet</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Leak detection runs on your real invoices, payments and vendors. Connect Zoho Books, Xero or
            QuickBooks and we will analyze the imported records automatically.
          </p>
          <Button asChild>
            <Link to="/integrations">Go to integrations</Link>
          </Button>
        </section>
      ) : (
        <>
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="flex-wrap">
              {TABS.map((t) => (
                <TabsTrigger key={t.id} value={t.id}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <DataTable
            data={rows}
            columns={columns}
            loading={isLoading}
            rowKey={(r) => r.id}
            searchKeys={["title", "vendor", "type", "detail"]}
            searchPlaceholder="Search findings, vendors, categories…"
            onRowClick={setSelected}
            emptyTitle="No findings in this category"
            emptyDescription="Nothing matches the current filter. Try another category or run a fresh sync of your ERP data."
          />
        </>
      )}

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <ToneBadge tone="brand">{selected.type}</ToneBadge>
                  <SeverityBadge severity={selected.severity} />
                </div>
                <SheetTitle className="mt-2 text-left text-lg">{selected.title}</SheetTitle>
                <SheetDescription className="text-left">
                  Detected from imported records for {selected.vendor}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-5 px-4 pb-6">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-border bg-muted/40 p-4"
                >
                  <p className="text-xs text-muted-foreground">Recoverable exposure</p>
                  <p className="mt-1 text-3xl font-semibold tabular-nums">
                    {money(selected.amount, selected.currency)}
                  </p>
                </motion.div>

                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold">
                    <TrendingDown className="size-4 text-primary" /> Why this was flagged
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{selected.detail}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button className="flex-1">Open recovery case</Button>
                  <Button variant="outline" className="flex-1">
                    Assign owner
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
