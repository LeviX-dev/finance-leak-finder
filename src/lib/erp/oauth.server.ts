// Server-only: OAuth config + token exchange for each accounting provider.
// Credentials are read from the database first (entered by the admin via the
// app UI), then fall back to environment variables.
import { decryptJson, encryptJson } from "./crypto.server";

export interface OAuthConfig {
  authorizeUrl: string;
  tokenUrl: string;
  scope: string;
  clientId: string;
  clientSecret: string;
  extraAuthParams?: Record<string, string>;
}

export interface StoredTokens {
  access_token: string;
  refresh_token?: string | undefined;
  expires_at: number;
  api_domain?: string | undefined;
  realm_id?: string | undefined;
  tenant_id?: string | undefined;
  organization_id?: string | undefined;
}

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

/**
 * Build an OAuthConfig from explicit credentials (DB-stored or env).
 * `extra` holds provider-specific options such as Zoho's data center.
 */
function buildConfig(
  provider: string,
  clientId: string,
  clientSecret: string,
  extra: Record<string, string> = {},
): OAuthConfig | null {
  switch (provider) {
    case "xero":
      return {
        clientId,
        clientSecret,
        authorizeUrl: "https://login.xero.com/identity/connect/authorize",
        tokenUrl: "https://identity.xero.com/connect/token",
        scope:
          "openid profile email offline_access accounting.transactions.read accounting.contacts.read accounting.settings.read",
      };
    case "quickbooks":
      return {
        clientId,
        clientSecret,
        authorizeUrl: "https://appcenter.intuit.com/connect/oauth2",
        tokenUrl: "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
        scope: "com.intuit.quickbooks.accounting",
      };
    case "zoho_books": {
      const dc = extra["dc"] ?? "com";
      return {
        clientId,
        clientSecret,
        authorizeUrl: `https://accounts.zoho.${dc}/oauth/v2/auth`,
        tokenUrl: `https://accounts.zoho.${dc}/oauth/v2/token`,
        scope: "ZohoBooks.fullaccess.READ",
        extraAuthParams: { access_type: "offline", prompt: "consent" },
      };
    }
    default:
      return null;
  }
}

/** Synchronous env-var-only config — used as a fallback when no DB credentials exist. */
function envConfig(provider: string): OAuthConfig | null {
  switch (provider) {
    case "xero": {
      const clientId = env("XERO_CLIENT_ID");
      const clientSecret = env("XERO_CLIENT_SECRET");
      if (!clientId || !clientSecret) return null;
      return buildConfig(provider, clientId, clientSecret);
    }
    case "quickbooks": {
      const clientId = env("QUICKBOOKS_CLIENT_ID");
      const clientSecret = env("QUICKBOOKS_CLIENT_SECRET");
      if (!clientId || !clientSecret) return null;
      return buildConfig(provider, clientId, clientSecret);
    }
    case "zoho_books": {
      const clientId = env("ZOHO_BOOKS_CLIENT_ID");
      const clientSecret = env("ZOHO_BOOKS_CLIENT_SECRET");
      if (!clientId || !clientSecret) return null;
      return buildConfig(provider, clientId, clientSecret, { dc: env("ZOHO_BOOKS_DC") ?? "com" });
    }
    default:
      return null;
  }
}

export function envProviderConfigured(provider: string): boolean {
  return envConfig(provider) !== null;
}

/** Read a single provider's credentials from the database (encrypted). */
async function dbConfig(provider: string): Promise<OAuthConfig | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("erp_provider_config")
    .select("client_id, client_secret_ciphertext, extra_config")
    .eq("provider", provider)
    .maybeSingle();
  if (!data) return null;
  const clientId = data.client_id as string;
  const clientSecret = decryptJson<string>(data.client_secret_ciphertext as string);
  const extra = (data.extra_config as Record<string, string> | null) ?? {};
  return buildConfig(provider, clientId, clientSecret, extra);
}

/** Return all provider IDs that have credentials stored in the database. */
export async function dbConfiguredProviderIds(): Promise<string[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("erp_provider_config").select("provider");
  return (data ?? []).map((r) => r.provider as string);
}

/** Save a provider's OAuth credentials to the database (encrypted). */
export async function saveDbConfig(
  provider: string,
  clientId: string,
  clientSecret: string,
  extra: Record<string, string> = {},
  configuredBy?: string,
): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("erp_provider_config").upsert(
    {
      provider,
      client_id: clientId,
      client_secret_ciphertext: encryptJson(clientSecret),
      extra_config: extra,
      configured_by: configuredBy ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "provider" },
  );
  if (error) throw new Error(error.message);
}

export async function oauthConfig(provider: string): Promise<OAuthConfig | null> {
  return (await dbConfig(provider)) ?? envConfig(provider);
}

export async function providerConfigured(provider: string): Promise<boolean> {
  return (await oauthConfig(provider)) !== null;
}

export function redirectUri(origin: string): string {
  return `${origin}/api/public/erp/callback`;
}

export async function buildAuthorizeUrl(provider: string, state: string, origin: string): Promise<string> {
  const cfg = await oauthConfig(provider);
  if (!cfg) throw new Error(`${provider} is not configured`);
  const url = new URL(cfg.authorizeUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", cfg.clientId);
  url.searchParams.set("redirect_uri", redirectUri(origin));
  url.searchParams.set("scope", cfg.scope);
  url.searchParams.set("state", state);
  for (const [k, v] of Object.entries(cfg.extraAuthParams ?? {})) url.searchParams.set(k, v);
  return url.toString();
}

async function postToken(cfg: OAuthConfig, body: URLSearchParams): Promise<Record<string, unknown>> {
  const res = await fetch(cfg.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      Authorization: `Basic ${Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`).toString("base64")}`,
    },
    body,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Token request failed [${res.status}]: ${text}`);
  return JSON.parse(text) as Record<string, unknown>;
}

function toStored(raw: Record<string, unknown>, previous?: StoredTokens): StoredTokens {
  const expiresIn = Number(raw["expires_in"] ?? 3600);
  return {
    access_token: String(raw["access_token"]),
    refresh_token: (raw["refresh_token"] as string | undefined) ?? previous?.refresh_token,
    expires_at: Date.now() + (expiresIn - 60) * 1000,
    api_domain: (raw["api_domain"] as string | undefined) ?? previous?.api_domain,
    realm_id: previous?.realm_id,
    tenant_id: previous?.tenant_id,
    organization_id: previous?.organization_id,
  };
}

export async function exchangeCode(provider: string, code: string, origin: string): Promise<StoredTokens> {
  const cfg = await oauthConfig(provider);
  if (!cfg) throw new Error(`${provider} is not configured`);
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri(origin),
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
  });
  return toStored(await postToken(cfg, body));
}

export async function refreshTokens(provider: string, tokens: StoredTokens): Promise<StoredTokens> {
  const cfg = await oauthConfig(provider);
  if (!cfg) throw new Error(`${provider} is not configured`);
  if (!tokens.refresh_token) throw new Error("No refresh token stored — reconnect the account");
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: tokens.refresh_token,
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
  });
  return toStored(await postToken(cfg, body), tokens);
}

export async function validTokens(provider: string, tokens: StoredTokens) {
  if (tokens.expires_at > Date.now()) return { tokens, refreshed: false as const };
  return { tokens: await refreshTokens(provider, tokens), refreshed: true as const };
}

export const packTokens = encryptJson;
export function unpackTokens(cipher: string): StoredTokens {
  return decryptJson<StoredTokens>(cipher);
}
