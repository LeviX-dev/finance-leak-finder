// Server-only: pulls real data from a connected accounting/ERP account and
// stores it against the owning user.
import type { StoredTokens } from "./oauth.server";
import { validTokens } from "./oauth.server";

export interface NormalizedVendor {
  external_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
  raw: unknown;
}
export interface NormalizedInvoice {
  external_id: string;
  invoice_number?: string | null;
  vendor_name?: string | null;
  vendor_external_id?: string | null;
  issue_date?: string | null;
  due_date?: string | null;
  amount?: number | null;
  tax_amount?: number | null;
  amount_paid?: number | null;
  currency?: string | null;
  status?: string | null;
  type?: string | null;
  raw: unknown;
}
export interface NormalizedPayment {
  external_id: string;
  reference?: string | null;
  invoice_external_id?: string | null;
  vendor_name?: string | null;
  paid_date?: string | null;
  amount?: number | null;
  currency?: string | null;
  method?: string | null;
  status?: string | null;
  raw: unknown;
}
export interface PulledData {
  accountName: string | null;
  vendors: NormalizedVendor[];
  invoices: NormalizedInvoice[];
  payments: NormalizedPayment[];
  tokens: StoredTokens;
}

async function getJson(url: string, headers: Record<string, string>) {
  const res = await fetch(url, { headers: { Accept: "application/json", ...headers } });
  const text = await res.text();
  if (!res.ok) throw new Error(`Provider request failed [${res.status}] ${url}: ${text.slice(0, 400)}`);
  return JSON.parse(text) as Record<string, any>;
}

function num(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function dateOnly(v: unknown): string | null {
  if (!v) return null;
  const s = String(v);
  const msMatch = s.match(/\/Date\((\d+)/);
  const d = msMatch ? new Date(Number(msMatch[1])) : new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

/* ------------------------------- Xero ---------------------------------- */
async function pullXero(tokens: StoredTokens): Promise<PulledData> {
  const auth = { Authorization: `Bearer ${tokens.access_token}` };
  let tenantId = tokens.tenant_id;
  let accountName: string | null = null;
  const conns = (await getJson("https://api.xero.com/connections", auth)) as unknown as any[];
  const list = Array.isArray(conns) ? conns : [];
  const chosen = list.find((c) => c.tenantId === tenantId) ?? list[0];
  if (!chosen) throw new Error("No Xero organisation is available for this login");
  tenantId = chosen.tenantId;
  accountName = chosen.tenantName ?? null;
  const h = { ...auth, "Xero-tenant-id": tenantId as string };
  const base = "https://api.xero.com/api.xro/2.0";

  const contacts = (await getJson(`${base}/Contacts?page=1`, h))["Contacts"] ?? [];
  const invoices = (await getJson(`${base}/Invoices?page=1`, h))["Invoices"] ?? [];
  const payments = (await getJson(`${base}/Payments?page=1`, h))["Payments"] ?? [];

  return {
    accountName,
    tokens: { ...tokens, tenant_id: tenantId },
    vendors: contacts.map((c: any) => ({
      external_id: c.ContactID,
      name: c.Name ?? "Unknown",
      email: c.EmailAddress ?? null,
      phone: c.Phones?.[0]?.PhoneNumber ?? null,
      status: c.ContactStatus ?? null,
      raw: c,
    })),
    invoices: invoices.map((i: any) => ({
      external_id: i.InvoiceID,
      invoice_number: i.InvoiceNumber ?? null,
      vendor_name: i.Contact?.Name ?? null,
      vendor_external_id: i.Contact?.ContactID ?? null,
      issue_date: dateOnly(i.DateString ?? i.Date),
      due_date: dateOnly(i.DueDateString ?? i.DueDate),
      amount: num(i.Total),
      tax_amount: num(i.TotalTax),
      amount_paid: num(i.AmountPaid),
      currency: i.CurrencyCode ?? null,
      status: i.Status ?? null,
      type: i.Type === "ACCPAY" ? "bill" : "invoice",
      raw: i,
    })),
    payments: payments.map((p: any) => ({
      external_id: p.PaymentID,
      reference: p.Reference ?? null,
      invoice_external_id: p.Invoice?.InvoiceID ?? null,
      vendor_name: p.Invoice?.Contact?.Name ?? null,
      paid_date: dateOnly(p.Date),
      amount: num(p.Amount),
      currency: p.CurrencyRate ? null : null,
      method: p.PaymentType ?? null,
      status: p.Status ?? null,
      raw: p,
    })),
  };
}

/* ---------------------------- QuickBooks -------------------------------- */
async function qboQuery(realmId: string, token: string, query: string) {
  const url = `https://quickbooks.api.intuit.com/v3/company/${realmId}/query?minorversion=70&query=${encodeURIComponent(query)}`;
  const json = await getJson(url, { Authorization: `Bearer ${token}` });
  return json["QueryResponse"] ?? {};
}

async function pullQuickBooks(tokens: StoredTokens): Promise<PulledData> {
  const realmId = tokens.realm_id;
  if (!realmId) throw new Error("No QuickBooks company id stored — reconnect the account");
  const t = tokens.access_token;
  const info = await getJson(
    `https://quickbooks.api.intuit.com/v3/company/${realmId}/companyinfo/${realmId}?minorversion=70`,
    { Authorization: `Bearer ${t}` },
  );
  const vendors = (await qboQuery(realmId, t, "select * from Vendor maxresults 200"))["Vendor"] ?? [];
  const bills = (await qboQuery(realmId, t, "select * from Bill maxresults 200"))["Bill"] ?? [];
  const payments = (await qboQuery(realmId, t, "select * from BillPayment maxresults 200"))["BillPayment"] ?? [];

  return {
    accountName: info["CompanyInfo"]?.CompanyName ?? "QuickBooks company",
    tokens,
    vendors: vendors.map((v: any) => ({
      external_id: String(v.Id),
      name: v.DisplayName ?? "Unknown",
      email: v.PrimaryEmailAddr?.Address ?? null,
      phone: v.PrimaryPhone?.FreeFormNumber ?? null,
      status: v.Active ? "ACTIVE" : "INACTIVE",
      raw: v,
    })),
    invoices: bills.map((b: any) => ({
      external_id: String(b.Id),
      invoice_number: b.DocNumber ?? null,
      vendor_name: b.VendorRef?.name ?? null,
      vendor_external_id: b.VendorRef?.value ?? null,
      issue_date: dateOnly(b.TxnDate),
      due_date: dateOnly(b.DueDate),
      amount: num(b.TotalAmt),
      tax_amount: num(b.TxnTaxDetail?.TotalTax),
      amount_paid: num(b.TotalAmt) !== null && num(b.Balance) !== null ? num(b.TotalAmt)! - num(b.Balance)! : null,
      currency: b.CurrencyRef?.value ?? null,
      status: num(b.Balance) === 0 ? "PAID" : "OPEN",
      type: "bill",
      raw: b,
    })),
    payments: payments.map((p: any) => ({
      external_id: String(p.Id),
      reference: p.DocNumber ?? null,
      invoice_external_id: p.Line?.[0]?.LinkedTxn?.[0]?.TxnId ?? null,
      vendor_name: p.VendorRef?.name ?? null,
      paid_date: dateOnly(p.TxnDate),
      amount: num(p.TotalAmt),
      currency: p.CurrencyRef?.value ?? null,
      method: p.PayType ?? null,
      status: null,
      raw: p,
    })),
  };
}

/* ----------------------------- Zoho Books ------------------------------- */
async function pullZohoBooks(tokens: StoredTokens): Promise<PulledData> {
  const domain = tokens.api_domain ?? "https://www.zohoapis.com";
  const h = { Authorization: `Zoho-oauthtoken ${tokens.access_token}` };
  const orgs = (await getJson(`${domain}/books/v3/organizations`, h))["organizations"] ?? [];
  const org = orgs.find((o: any) => o.organization_id === tokens.organization_id) ?? orgs[0];
  if (!org) throw new Error("No Zoho Books organisation is available for this login");
  const orgId = org.organization_id;
  const q = `organization_id=${orgId}&per_page=200`;

  const contacts = (await getJson(`${domain}/books/v3/contacts?${q}`, h))["contacts"] ?? [];
  const bills = (await getJson(`${domain}/books/v3/bills?${q}`, h))["bills"] ?? [];
  const payments = (await getJson(`${domain}/books/v3/vendorpayments?${q}`, h))["vendorpayments"] ?? [];

  return {
    accountName: org.name ?? "Zoho Books organisation",
    tokens: { ...tokens, organization_id: orgId, api_domain: domain },
    vendors: contacts.map((c: any) => ({
      external_id: String(c.contact_id),
      name: c.contact_name ?? "Unknown",
      email: c.email ?? null,
      phone: c.phone ?? null,
      status: c.status ?? null,
      raw: c,
    })),
    invoices: bills.map((b: any) => ({
      external_id: String(b.bill_id),
      invoice_number: b.bill_number ?? null,
      vendor_name: b.vendor_name ?? null,
      vendor_external_id: b.vendor_id ? String(b.vendor_id) : null,
      issue_date: dateOnly(b.date),
      due_date: dateOnly(b.due_date),
      amount: num(b.total),
      tax_amount: num(b.tax_total),
      amount_paid: num(b.payment_made),
      currency: b.currency_code ?? null,
      status: b.status ?? null,
      type: "bill",
      raw: b,
    })),
    payments: payments.map((p: any) => ({
      external_id: String(p.payment_id),
      reference: p.reference_number ?? null,
      invoice_external_id: p.bills?.[0]?.bill_id ? String(p.bills[0].bill_id) : null,
      vendor_name: p.vendor_name ?? null,
      paid_date: dateOnly(p.date),
      amount: num(p.amount),
      currency: p.currency_code ?? null,
      method: p.payment_mode ?? null,
      status: null,
      raw: p,
    })),
  };
}

export async function pullProviderData(provider: string, tokens: StoredTokens) {
  const { tokens: fresh, refreshed } = await validTokens(provider, tokens);
  let data: PulledData;
  switch (provider) {
    case "xero":
      data = await pullXero(fresh);
      break;
    case "quickbooks":
      data = await pullQuickBooks(fresh);
      break;
    case "zoho_books":
      data = await pullZohoBooks(fresh);
      break;
    default:
      throw new Error(`${provider} cannot be synced automatically yet`);
  }
  return { data, refreshed };
}
