import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Download, Filter, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { DataTable, type Column } from "@/components/common/data-table";
import { SeverityBadge, StatusBadge, ToneBadge } from "@/components/common/tone-badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { financialLeaks } from "@/data/mock";
import { currency, dateLong, percent } from "@/lib/format";
import type { FinancialLeak } from "@/types";

export const Route = createFileRoute("/_shell/leaks")({
  head: () => ({
    meta: [
      { title: "Financial Leaks Register — AutoAudit" },
      {
        name: "description",
        content:
          "Triage every detected financial leak: duplicate payments, overcharges, tax errors and fraud indicators with AI explanations.",
      },
      { property: "og:title", content: "Financial Leaks Register — AutoAudit" },
      { property: "og:description", content: "AI-detected financial leakage, ranked by recoverable impact." },
    ],
  }),
  component: LeaksPage,
});

const tabs = ["all", "new", "investigating", "recovering", "recovered"] as const;

function LeaksPage() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<(typeof tabs)[number]>("all");
  const [selected, setSelected] = useState<FinancialLeak | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, []);

  const rows = useMemo(
    () => (tab === "all" ? financialLeaks : financialLeaks.filter((l) => l.status === tab)),
    [tab],
  );

  const columns: Column<FinancialLeak>[] = [
    {
      key: "leak",
      header: "Leak",
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{r.title}</p>
          <p className="text-xs text-muted-foreground">
            {r.id} · {r.source}
          </p>
        </div>
      ),
    },
    { key: "category", header: "Category", render: (r) => <ToneBadge tone="brand">{r.category}</ToneBadge> },
    { key: "vendor", header: "Vendor", render: (r) => <span className="text-sm">{r.vendor}</span> },
    { key: "severity", header: "Severity", render: (r) => <SeverityBadge severity={r.severity} /> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "confidence",
      header: "Confidence",
      render: (r) => (
        <div className="w-24">
          <p className="text-xs text-muted-foreground">{percent(r.confidence)}</p>
          <Progress value={r.confidence * 100} className="mt-1 h-1.5" />
        </div>
      ),
    },
    {
      key: "amount",
      header: "Exposure",
      align: "right",
      render: (r) => <span className="text-sm font-semibold tabular-nums">{currency(r.amount)}</span>,
    },
  ];

  const total = financialLeaks.reduce((s, l) => s + l.amount, 0);

  return (
    <>
      <PageHeader
        title="Financial leaks"
        description={`${financialLeaks.length} open findings representing ${currency(total)} of recoverable exposure.`}
        crumbs={[{ label: "Financial Leaks" }]}
        actions={
          <>
            <Button variant="outline" className="gap-2">
              <Filter className="size-4" /> Saved views
            </Button>
            <Button className="gap-2">
              <Download className="size-4" /> Export register
            </Button>
          </>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="flex-wrap">
          {tabs.map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <DataTable
        data={rows}
        columns={columns}
        loading={loading}
        rowKey={(r) => r.id}
        searchKeys={["title", "vendor", "category", "id"]}
        searchPlaceholder="Search leaks, vendors, IDs…"
        onRowClick={setSelected}
        emptyTitle="No leaks in this state"
        emptyDescription="Nothing matches the current filter. Try another status tab or clear your search."
      />

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <ToneBadge tone="brand">{selected.category}</ToneBadge>
                  <SeverityBadge severity={selected.severity} />
                  <StatusBadge status={selected.status} />
                </div>
                <SheetTitle className="mt-2 text-left text-lg">{selected.title}</SheetTitle>
                <SheetDescription className="text-left">
                  {selected.id} · detected {dateLong(selected.detectedAt)} via {selected.source}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-5 px-4 pb-6">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-border bg-muted/40 p-4"
                >
                  <p className="text-xs text-muted-foreground">Recoverable exposure</p>
                  <p className="mt-1 text-3xl font-semibold tabular-nums">{currency(selected.amount)}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Model confidence</span>
                    <span>{percent(selected.confidence)}</span>
                  </div>
                  <Progress value={selected.confidence * 100} className="mt-1.5 h-1.5" />
                </motion.div>

                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold">
                    <TrendingDown className="size-4 text-primary" /> AI explanation
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {selected.aiExplanation}
                  </p>
                </div>

                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <h4 className="text-sm font-semibold text-primary">Recommended action</h4>
                  <p className="mt-1.5 text-sm text-muted-foreground">{selected.recommendation}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button className="flex-1">Open recovery case</Button>
                  <Button variant="outline" className="flex-1">
                    Assign owner
                  </Button>
                  <Button variant="ghost">Dismiss</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
