// Server-only orchestration for ERP/accounting connections.
import { randomBytes } from "node:crypto";
import { buildAuthorizeUrl, packTokens, providerConfigured, unpackTokens, type StoredTokens } from "./oauth.server";
import { pullProviderData } from "./sync.server";
import { ERP_PROVIDERS } from "./providers";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export function configuredProviders(): string[] {
  return ERP_PROVIDERS.filter((p) => p.oauth && providerConfigured(p.id)).map((p) => p.id);
}

export async function listConnectionsFor(userId: string) {
  const db = await admin();
  const { data, error } = await db
    .from("erp_connections")
    .select("id, provider, account_name, status, last_sync_at, last_error")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: r.id as string,
    provider: r.provider as string,
    accountName: (r.account_name as string | null) ?? null,
    status: r.status as string,
    lastSyncAt: (r.last_sync_at as string | null) ?? null,
    lastError: (r.last_error as string | null) ?? null,
  }));
}

export async function beginOAuth(userId: string, provider: string, origin: string) {
  if (!providerConfigured(provider)) {
    throw new Error(
      `${provider} is not configured yet. Add the developer app credentials for this provider before connecting.`,
    );
  }
  const state = randomBytes(24).toString("hex");
  const db = await admin();
  const { error } = await db.from("erp_oauth_states").insert({ state, user_id: userId, provider });
  if (error) throw new Error(error.message);
  return { url: buildAuthorizeUrl(provider, state, origin) };
}

export async function completeOAuth(params: {
  state: string;
  code: string;
  origin: string;
  realmId?: string | undefined;
  location?: string | undefined;
}) {
  const db = await admin();
  const { data: stateRow } = await db
    .from("erp_oauth_states")
    .select("state, user_id, provider, created_at")
    .eq("state", params.state)
    .maybeSingle();
  if (!stateRow) throw new Error("This connection request expired. Start the connection again.");
  await db.from("erp_oauth_states").delete().eq("state", params.state);

  const provider = stateRow.provider as string;
  const userId = stateRow.user_id as string;
  const { exchangeCode } = await import("./oauth.server");
  let tokens: StoredTokens = await exchangeCode(provider, params.code, params.origin);
  if (params.realmId) tokens = { ...tokens, realm_id: params.realmId };
  if (provider === "zoho_books" && params.location) {
    tokens = { ...tokens, api_domain: tokens.api_domain ?? "https://www.zohoapis.com" };
  }

  const { data: existing } = await db
    .from("erp_connections")
    .select("id")
    .eq("user_id", userId)
    .eq("provider", provider)
    .maybeSingle();

  let connectionId: string;
  if (existing) {
    connectionId = existing.id as string;
    await db
      .from("erp_connections")
      .update({ status: "connected", credentials_ciphertext: packTokens(tokens), last_error: null })
      .eq("id", connectionId);
  } else {
    const { data: inserted, error } = await db
      .from("erp_connections")
      .insert({
        user_id: userId,
        provider,
        status: "connected",
        credentials_ciphertext: packTokens(tokens),
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    connectionId = inserted!.id as string;
  }

  // Immediately pull the account's real data so the app is never empty.
  try {
    await syncConnectionFor(userId, connectionId);
  } catch (err) {
    await db
      .from("erp_connections")
      .update({ last_error: err instanceof Error ? err.message : String(err) })
      .eq("id", connectionId);
  }
  return { provider, connectionId };
}

export async function disconnectFor(userId: string, connectionId: string) {
  const db = await admin();
  const { error } = await db.from("erp_connections").delete().eq("id", connectionId).eq("user_id", userId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function syncConnectionFor(userId: string, connectionId: string) {
  const db = await admin();
  const { data: conn, error } = await db
    .from("erp_connections")
    .select("id, provider, credentials_ciphertext")
    .eq("id", connectionId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!conn) throw new Error("Connection not found");
  if (!conn.credentials_ciphertext) throw new Error("This connection has no stored credentials — reconnect it.");

  const { data: run } = await db
    .from("erp_sync_runs")
    .insert({ user_id: userId, connection_id: connectionId, status: "running" })
    .select("id")
    .single();

  try {
    const tokens = unpackTokens(conn.credentials_ciphertext as string);
    const { data } = await pullProviderData(conn.provider as string, tokens);

    const vendorRows = data.vendors.map((v) => ({
      user_id: userId,
      connection_id: connectionId,
      external_id: v.external_id,
      name: v.name,
      email: v.email ?? null,
      phone: v.phone ?? null,
      status: v.status ?? null,
      raw: v.raw as never,
    }));
    const invoiceRows = data.invoices.map((i) => ({
      user_id: userId,
      connection_id: connectionId,
      external_id: i.external_id,
      invoice_number: i.invoice_number ?? null,
      vendor_name: i.vendor_name ?? null,
      vendor_external_id: i.vendor_external_id ?? null,
      issue_date: i.issue_date ?? null,
      due_date: i.due_date ?? null,
      amount: i.amount ?? null,
      tax_amount: i.tax_amount ?? null,
      amount_paid: i.amount_paid ?? null,
      currency: i.currency ?? null,
      status: i.status ?? null,
      type: i.type ?? null,
      raw: i.raw as never,
    }));
    const paymentRows = data.payments.map((p) => ({
      user_id: userId,
      connection_id: connectionId,
      external_id: p.external_id,
      reference: p.reference ?? null,
      invoice_external_id: p.invoice_external_id ?? null,
      vendor_name: p.vendor_name ?? null,
      paid_date: p.paid_date ?? null,
      amount: p.amount ?? null,
      currency: p.currency ?? null,
      method: p.method ?? null,
      status: p.status ?? null,
      raw: p.raw as never,
    }));

    if (vendorRows.length) {
      const { error: e } = await db.from("erp_vendors").upsert(vendorRows, { onConflict: "connection_id,external_id" });
      if (e) throw new Error(e.message);
    }
    if (invoiceRows.length) {
      const { error: e } = await db.from("erp_invoices").upsert(invoiceRows, { onConflict: "connection_id,external_id" });
      if (e) throw new Error(e.message);
    }
    if (paymentRows.length) {
      const { error: e } = await db.from("erp_payments").upsert(paymentRows, { onConflict: "connection_id,external_id" });
      if (e) throw new Error(e.message);
    }

    await db
      .from("erp_connections")
      .update({
        status: "connected",
        account_name: data.accountName,
        last_sync_at: new Date().toISOString(),
        last_error: null,
        credentials_ciphertext: packTokens(data.tokens),
      })
      .eq("id", connectionId);

    if (run) {
      await db
        .from("erp_sync_runs")
        .update({
          status: "success",
          finished_at: new Date().toISOString(),
          vendors_synced: vendorRows.length,
          invoices_synced: invoiceRows.length,
          payments_synced: paymentRows.length,
        })
        .eq("id", run.id);
    }

    return {
      vendors: vendorRows.length,
      invoices: invoiceRows.length,
      payments: paymentRows.length,
      accountName: data.accountName,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db.from("erp_connections").update({ status: "error", last_error: message }).eq("id", connectionId);
    if (run) {
      await db
        .from("erp_sync_runs")
        .update({ status: "failed", finished_at: new Date().toISOString(), error: message })
        .eq("id", run.id);
    }
    throw new Error(message);
  }
}
