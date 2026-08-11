import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  beginOAuth,
  configuredProviders,
  disconnectFor,
  listConnectionsFor,
  syncConnectionFor,
} from "@/lib/erp/service.server";
import { loadFinancials, loadOverview } from "@/lib/erp/data.server";

export const getErpStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => ({
    configured: configuredProviders(),
    connections: await listConnectionsFor(context.userId),
  }));

export const startErpConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { provider: string }) => input)
  .handler(async ({ data, context }) => {
    const origin = new URL(getRequest().url).origin;
    return beginOAuth(context.userId, data.provider, origin);
  });

export const syncErpConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { connectionId: string }) => input)
  .handler(async ({ data, context }) => syncConnectionFor(context.userId, data.connectionId));

export const disconnectErp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { connectionId: string }) => input)
  .handler(async ({ data, context }) => disconnectFor(context.userId, data.connectionId));

export const getErpFinancials = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => loadFinancials(context.userId));

export const getErpOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => loadOverview(context.userId));
