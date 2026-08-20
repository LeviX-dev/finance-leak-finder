import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "motion/react";
import { Download, FilterX, Plug, RefreshCw, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { DataTable, type Column } from "@/components/common/data-table";
import { SeverityBadge, ToneBadge } from "@/components/common/tone-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getErpOverview } from "@/lib/erp.functions";
import type { DetectedLeak, Row } from "@/lib/erp/data.server";
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

const SEVERITIES = ["critical", "high", "medium", "low"] as const;

function money(amount: number, code: string) {
  if (!code) return currency(amount);
  try {
    return currency(amount, { currency: code });
  } catch {
    return `${code} ${Math.round(amount).toLocaleString()}`;
  }
}

const FIELD_LABELS: Record<string, string> = {
  invoice_number: "Invoice #",
  external_id: "External ID",
  vendor_name: "Vendor",
  issue_date: "Issued",
  due_date: "Due",
  paid_date: "Paid",
  amount: "Amount",
  amount_paid: "Amount paid",
  tax_amount: "Tax",
  invoice_external_id: "Invoice ref",
  currency: "Currency",
  status: "Status",
  method: "Method",
  reference: "Reference",
  name: "Name",
  email: "Email",
  phone: "Phone",
  type: "Type",
};

function EvidenceTable({ title, rows, fields }: { title: string; rows: Row[]; fields: string[] }) {
  if (!rows.length) return null;
  return (
    <div className="min-w-0 flex-1">
      <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title} ({rows.length})
      </h5>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-xs">
          <thead className="bg-muted/50">
            <tr>
              {fields.map((f) => (
                <th key={f} className="whitespace-nowrap px-3 py-2 text-left font-medium text-muted-foreground">
                  {FIELD_LABELS[f] ?? f}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={String(r["id"] ?? idx)} className="border-t border-border">
                {fields.map((f) => (
                  <td key={f} className="whitespace-nowrap px-3 py-2 tabular-nums">
                    {r[f] === null || r[f] === undefined || r[f] === "" ? "—" : String(r[f])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeaksPage() {
  const fetchOverview = useServerFn(getErpOverview);
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["erp-overview"],
    queryFn: () => fetchOverview({}),
  });

  const [tab, setTab] = useState<string>("all");
  const [severity, setSeverity] = useState("all");
  const [vendor, setVendor] = useState("all");
  const [runId, setRunId] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<DetectedLeak | null>(null);

  const leaks = useMemo(() => data?.leaks ?? [], [data]);
  const vendorOptions = data?.vendorOptions ?? [];
  const syncRuns = data?.syncRuns ?? [];

  const rows = useMemo(
    () =>
      leaks.filter((l) => {
        if (tab !== "all" && l.type !== tab) return false;
        if (severity !== "all" && l.severity !== severity) return false;
        if (vendor !== "all" && l.vendor !== vendor) return false;
        if (runId !== "all" && l.syncRunId !== runId) return false;
        if (from && (!l.date || l.date < from)) return false;
        if (to && (!l.date || l.date > to)) return false;
        return true;
      }),
    [leaks, tab, severity, vendor, runId, from, to],
  );

  const filtersActive =
    tab !== "all" || severity !== "all" || vendor !== "all" || runId !== "all" || !!from || !!to;

  const resetFilters = () => {
    setTab("all");
    setSeverity("all");
    setVendor("all");
    setRunId("all");
    setFrom("");
    setTo("");
  };

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
    {
      key: "date",
      header: "Date",
      render: (r) => <span className="text-sm text-muted-foreground">{r.date ?? "—"}</span>,
    },
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

  const total = rows.reduce((s, l) => s + l.amount, 0);
  const connected = data?.connected ?? false;

  return (
    <>
      <PageHeader
        title="Financial leaks"
        description={
          connected
            ? `${rows.length} of ${leaks.length} findings shown — ${currency(total)} of recoverable exposure in the current filter.`
            : "Connect an accounting or ERP account to detect leaks in your real invoices, payments and vendors."
        }
        crumbs={[{ label: "Financial Leaks" }]}
        actions={
          <>
            <Button variant="outline" className="gap-2" onClick={() => void refetch()} disabled={isFetching}>
              <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} /> Re-analyze
            </Button>
            <Button className="gap-2" disabled={!rows.length}>
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
            <Link to="/integrations" search={{ connect: undefined, message: undefined }}>Go to integrations</Link>
          </Button>
        </section>
      ) : (
        <>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex-wrap">
              {TABS.map((t) => (
                <TabsTrigger key={t.id} value={t.id}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <section className="surface-card grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5">
              <Label className="text-xs">Severity</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All severities</SelectItem>
                  {SEVERITIES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Vendor</Label>
              <Select value={vendor} onValueChange={setVendor}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All vendors</SelectItem>
                  {vendorOptions.map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Sync run</Label>
              <Select value={runId} onValueChange={setRunId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sync runs</SelectItem>
                  {syncRuns.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.provider} · {new Date(r.startedAt).toLocaleString()} · {r.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs" htmlFor="leak-from">From date</Label>
              <Input id="leak-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs" htmlFor="leak-to">To date</Label>
              <div className="flex gap-2">
                <Input id="leak-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetFilters}
                  disabled={!filtersActive}
                  aria-label="Clear filters"
                >
                  <FilterX className="size-4" />
                </Button>
              </div>
            </div>
          </section>

          <DataTable
            data={rows}
            columns={columns}
            loading={isLoading}
            rowKey={(r) => r.id}
            searchKeys={["title", "vendor", "type", "detail"]}
            searchPlaceholder="Search findings, vendors, categories…"
            onRowClick={setSelected}
            emptyTitle="No findings match these filters"
            emptyDescription="Try widening the date range, severity or sync run, or run a fresh sync of your ERP data."
          />
        </>
      )}

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <ToneBadge tone="brand">{selected.type}</ToneBadge>
                  <SeverityBadge severity={selected.severity} />
                </div>
                <SheetTitle className="mt-2 text-left text-lg">{selected.title}</SheetTitle>
                <SheetDescription className="text-left">
                  Evidence from imported records for {selected.vendor}
                  {selected.date ? ` · ${selected.date}` : ""}
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

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold">Matched records</h4>
                  <EvidenceTable
                    title="Invoices"
                    rows={selected.evidence.invoices}
                    fields={["invoice_number", "vendor_name", "issue_date", "due_date", "amount", "amount_paid", "currency", "status"]}
                  />
                  <EvidenceTable
                    title="Payments"
                    rows={selected.evidence.payments}
                    fields={["reference", "invoice_external_id", "vendor_name", "paid_date", "amount", "currency", "method", "status"]}
                  />
                  <EvidenceTable
                    title="Vendors"
                    rows={selected.evidence.vendors}
                    fields={["name", "email", "phone", "external_id", "status"]}
                  />
                  {!selected.evidence.invoices.length &&
                    !selected.evidence.payments.length &&
                    !selected.evidence.vendors.length && (
                      <p className="text-sm text-muted-foreground">
                        No underlying records were retained for this finding.
                      </p>
                    )}
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
