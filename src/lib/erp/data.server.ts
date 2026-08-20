// Server-only reads of the user's ingested real ERP data, plus leakage analysis
// computed from those real records.

type Cell = string | number | boolean | null;
export type Row = Record<string, Cell>;

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export interface FinancialsPayload {
  connected: boolean;
  invoices: Row[];
  payments: Row[];
  vendors: Row[];
}

export async function loadFinancials(userId: string): Promise<FinancialsPayload> {
  const db = await admin();
  const [invoices, payments, vendors] = await Promise.all([
    db
      .from("erp_invoices")
      .select("id, connection_id, created_at, external_id, invoice_number, vendor_name, issue_date, due_date, amount, tax_amount, amount_paid, currency, status, type")
      .eq("user_id", userId)
      .order("issue_date", { ascending: false })
      .limit(1000),
    db
      .from("erp_payments")
      .select("id, connection_id, created_at, external_id, reference, invoice_external_id, vendor_name, paid_date, amount, currency, method, status")
      .eq("user_id", userId)
      .order("paid_date", { ascending: false })
      .limit(1000),
    db
      .from("erp_vendors")
      .select("id, connection_id, created_at, external_id, name, email, phone, status")
      .eq("user_id", userId)
      .order("name", { ascending: true })
      .limit(1000),
  ]);

  return {
    connected: (invoices.data?.length ?? 0) + (payments.data?.length ?? 0) + (vendors.data?.length ?? 0) > 0,
    invoices: (invoices.data ?? []) as Row[],
    payments: (payments.data ?? []) as Row[],
    vendors: (vendors.data ?? []) as Row[],
  };
}


export interface DetectedLeak {
  id: string;
  type: string;
  title: string;
  vendor: string;
  amount: number;
  currency: string;
  severity: "critical" | "high" | "medium" | "low";
  detail: string;
}

export interface OverviewPayload {
  connected: boolean;
  totals: {
    invoices: number;
    payments: number;
    vendors: number;
    spend: number;
    outstanding: number;
    atRisk: number;
  };
  spendByMonth: Array<{ month: string; spend: number }>;
  topVendors: Array<{ vendor: string; spend: number }>;
  leaks: DetectedLeak[];
}

function money(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function loadOverview(userId: string): Promise<OverviewPayload> {
  const { invoices, payments, vendors, connected } = await loadFinancials(userId);

  const spend = invoices.reduce((s, i) => s + money(i["amount"]), 0);
  const outstanding = invoices.reduce((s, i) => s + Math.max(money(i["amount"]) - money(i["amount_paid"]), 0), 0);

  const byMonth = new Map<string, number>();
  for (const i of invoices) {
    const d = String(i["issue_date"] ?? "").slice(0, 7);
    if (!d) continue;
    byMonth.set(d, (byMonth.get(d) ?? 0) + money(i["amount"]));
  }
  const spendByMonth = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, s]) => ({ month, spend: Math.round(s) }));

  const byVendor = new Map<string, number>();
  for (const i of invoices) {
    const v = String(i["vendor_name"] ?? "Unknown");
    byVendor.set(v, (byVendor.get(v) ?? 0) + money(i["amount"]));
  }
  const topVendors = [...byVendor.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([vendor, s]) => ({ vendor, spend: Math.round(s) }));

  const leaks: DetectedLeak[] = [];

  // 1. Duplicate invoices: same vendor + same amount + same date.
  const dupKey = new Map<string, Row[]>();
  for (const i of invoices) {
    const key = `${i["vendor_name"]}|${money(i["amount"]).toFixed(2)}|${i["issue_date"]}`;
    dupKey.set(key, [...(dupKey.get(key) ?? []), i]);
  }
  for (const [key, group] of dupKey) {
    if (group.length < 2) continue;
    const first = group[0]!;
    leaks.push({
      id: `dup-${key}`,
      type: "Duplicate invoice",
      title: `${group.length} identical invoices from ${first["vendor_name"] ?? "vendor"}`,
      vendor: String(first["vendor_name"] ?? "Unknown"),
      amount: money(first["amount"]) * (group.length - 1),
      currency: String(first["currency"] ?? ""),
      severity: "critical",
      detail: `Invoices ${group.map((g) => g["invoice_number"] ?? g["external_id"]).join(", ")} share the same vendor, amount and date.`,
    });
  }

  // 2. Overpayments: paid more than the invoice total.
  const invoiceByExternal = new Map(invoices.map((i) => [String(i["external_id"]), i]));
  const paidByInvoice = new Map<string, number>();
  for (const p of payments) {
    const ref = String(p["invoice_external_id"] ?? "");
    if (!ref) continue;
    paidByInvoice.set(ref, (paidByInvoice.get(ref) ?? 0) + money(p["amount"]));
  }
  for (const [ref, paid] of paidByInvoice) {
    const inv = invoiceByExternal.get(ref);
    if (!inv) continue;
    const total = money(inv["amount"]);
    if (total > 0 && paid - total > 0.5) {
      leaks.push({
        id: `over-${ref}`,
        type: "Overpayment",
        title: `Overpaid invoice ${inv["invoice_number"] ?? ref}`,
        vendor: String(inv["vendor_name"] ?? "Unknown"),
        amount: paid - total,
        currency: String(inv["currency"] ?? ""),
        severity: "high",
        detail: `Payments total ${paid.toFixed(2)} against an invoice of ${total.toFixed(2)}.`,
      });
    }
  }

  // 3. Duplicate payments: same vendor, amount and date.
  const payKey = new Map<string, Row[]>();
  for (const p of payments) {
    const key = `${p["vendor_name"]}|${money(p["amount"]).toFixed(2)}|${p["paid_date"]}`;
    payKey.set(key, [...(payKey.get(key) ?? []), p]);
  }
  for (const [key, group] of payKey) {
    if (group.length < 2) continue;
    const first = group[0]!;
    leaks.push({
      id: `dpay-${key}`,
      type: "Duplicate payment",
      title: `${group.length} identical payments to ${first["vendor_name"] ?? "vendor"}`,
      vendor: String(first["vendor_name"] ?? "Unknown"),
      amount: money(first["amount"]) * (group.length - 1),
      currency: String(first["currency"] ?? ""),
      severity: "critical",
      detail: `Same vendor, amount and payment date recorded ${group.length} times.`,
    });
  }

  // 4. Overdue unpaid invoices — cash and penalty exposure.
  const today = new Date().toISOString().slice(0, 10);
  for (const i of invoices) {
    const due = String(i["due_date"] ?? "");
    const balance = money(i["amount"]) - money(i["amount_paid"]);
    if (due && due < today && balance > 0.5) {
      leaks.push({
        id: `late-${i["external_id"]}`,
        type: "Overdue liability",
        title: `Invoice ${i["invoice_number"] ?? i["external_id"]} past due`,
        vendor: String(i["vendor_name"] ?? "Unknown"),
        amount: balance,
        currency: String(i["currency"] ?? ""),
        severity: "medium",
        detail: `Due ${due} with ${balance.toFixed(2)} still outstanding.`,
      });
    }
  }

  leaks.sort((a, b) => b.amount - a.amount);
  const atRisk = leaks.reduce((s, l) => s + l.amount, 0);

  return {
    connected,
    totals: {
      invoices: invoices.length,
      payments: payments.length,
      vendors: vendors.length,
      spend: Math.round(spend),
      outstanding: Math.round(outstanding),
      atRisk: Math.round(atRisk),
    },
    spendByMonth,
    topVendors,
    leaks: leaks.slice(0, 100),
  };
}
