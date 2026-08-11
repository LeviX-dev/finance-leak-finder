// Server-only: OAuth config + token exchange for each accounting provider.
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

export function oauthConfig(provider: string): OAuthConfig | null {
  switch (provider) {
    case "xero": {
      const clientId = env("XERO_CLIENT_ID");
      const clientSecret = env("XERO_CLIENT_SECRET");
      if (!clientId || !clientSecret) return null;
      return {
        clientId,
        clientSecret,
        authorizeUrl: "https://login.xero.com/identity/connect/authorize",
        tokenUrl: "https://identity.xero.com/connect/token",
        scope:
          "openid profile email offline_access accounting.transactions.read accounting.contacts.read accounting.settings.read",
      };
    }
    case "quickbooks": {
      const clientId = env("QUICKBOOKS_CLIENT_ID");
      const clientSecret = env("QUICKBOOKS_CLIENT_SECRET");
      if (!clientId || !clientSecret) return null;
      return {
        clientId,
        clientSecret,
        authorizeUrl: "https://appcenter.intuit.com/connect/oauth2",
        tokenUrl: "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
        scope: "com.intuit.quickbooks.accounting",
      };
    }
    case "zoho_books": {
      const clientId = env("ZOHO_BOOKS_CLIENT_ID");
      const clientSecret = env("ZOHO_BOOKS_CLIENT_SECRET");
      if (!clientId || !clientSecret) return null;
      const dc = env("ZOHO_BOOKS_DC") ?? "com";
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

export function providerConfigured(provider: string): boolean {
  return oauthConfig(provider) !== null;
}

export function redirectUri(origin: string): string {
  return `${origin}/api/public/erp/callback`;
}

export function buildAuthorizeUrl(provider: string, state: string, origin: string): string {
  const cfg = oauthConfig(provider);
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
  const cfg = oauthConfig(provider);
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
  const cfg = oauthConfig(provider);
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
