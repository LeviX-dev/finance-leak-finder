import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/tone-badge";
import { Button } from "@/components/ui/button";
import { ERP_PROVIDERS } from "@/lib/erp/providers";
import { disconnectErp, getErpStatus, startErpConnect, syncErpConnection } from "@/lib/erp.functions";

export const Route = createFileRoute("/_shell/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — AutoAudit" },
      { name: "description", content: "Connect your real accounting and ERP accounts so AutoAudit can analyse live financial data." },
      { property: "og:title", content: "Integrations — AutoAudit" },
      { property: "og:description", content: "Connect your real accounting and ERP accounts so AutoAudit can analyse live financial data." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    connect: typeof s["connect"] === "string" ? (s["connect"] as string) : undefined,
    message: typeof s["message"] === "string" ? (s["message"] as string) : undefined,
  }),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const search = useSearch({ from: "/_shell/integrations" });
  const qc = useQueryClient();
  const fetchStatus = useServerFn(getErpStatus);
  const connectFn = useServerFn(startErpConnect);
  const syncFn = useServerFn(syncErpConnection);
  const disconnectFn = useServerFn(disconnectErp);
  const [busy, setBusy] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["erp-status"], queryFn: () => fetchStatus({}) });

  useEffect(() => {
    if (search.connect === "success") toast.success("Account connected — importing your data now.");
    if (search.connect === "error") toast.error(search.message ?? "Connection failed");
  }, [search.connect, search.message]);

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["erp-status"] });
    void qc.invalidateQueries({ queryKey: ["erp-financials"] });
    void qc.invalidateQueries({ queryKey: ["erp-overview"] });
  };

  const sync = useMutation({
    mutationFn: (connectionId: string) => syncFn({ data: { connectionId } }),
    onSuccess: (r) => {
      toast.success(`Imported ${r.invoices} invoices, ${r.payments} payments, ${r.vendors} vendors.`);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (connectionId: string) => disconnectFn({ data: { connectionId } }),
    onSuccess: () => {
      toast.success("Account disconnected.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const connect = async (provider: string) => {
    setBusy(provider);
    try {
      const { url } = await connectFn({ data: { provider } });
      window.location.href = url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start the connection");
      setBusy(null);
    }
  };

  const connections = data?.connections ?? [];
  const configured = data?.configured ?? [];

  return (
    <>
      <PageHeader
        title="Integrations"
        description="Connect your real accounting or ERP account. AutoAudit imports invoices, payments and vendors directly from the source system."
        crumbs={[{ label: "Integrations" }]}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ERP_PROVIDERS.map((p) => {
          const conn = connections.find((c) => c.provider === p.id);
          const ready = configured.includes(p.id);
          return (
            <article key={p.id} className="surface-card flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category}</p>
                </div>
                <StatusBadge status={conn ? (conn.status === "error" ? "error" : "connected") : "disconnected"} />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{p.blurb}</p>

              <dl className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Account</dt>
                  <dd className="truncate">{conn?.accountName ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Last sync</dt>
                  <dd>{conn?.lastSyncAt ? new Date(conn.lastSyncAt).toLocaleString() : "Never"}</dd>
                </div>
              </dl>

              {conn?.lastError ? (
                <p className="mt-3 rounded-md bg-destructive/10 p-2 text-xs text-destructive">{conn.lastError}</p>
              ) : null}

              {!p.oauth ? (
                <p className="mt-4 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
                  Enterprise onboarding required — your administrator provisions this connection.
                </p>
              ) : !ready ? (
                <p className="mt-4 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
                  Add your {p.name} developer app credentials to enable one-click connection.
                </p>
              ) : null}

              <div className="mt-auto flex gap-2 pt-4">
                {conn ? (
                  <>
                    <Button
                      size="sm"
                      className="flex-1"
                      disabled={sync.isPending}
                      onClick={() => sync.mutate(conn.id)}
                    >
                      {sync.isPending ? "Syncing…" : "Sync now"}
                    </Button>
                    <Button size="sm" variant="outline" disabled={remove.isPending} onClick={() => remove.mutate(conn.id)}>
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    disabled={!p.oauth || !ready || isLoading || busy === p.id}
                    onClick={() => connect(p.id)}
                  >
                    {busy === p.id ? "Redirecting…" : `Connect ${p.name}`}
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
