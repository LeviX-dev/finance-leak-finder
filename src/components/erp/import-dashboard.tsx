import { motion } from "motion/react";
import { Activity, FileText, Receipt, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ToneBadge } from "@/components/common/tone-badge";
import { providerMeta, type ErpConnectionView } from "@/lib/erp/providers";
import type { ConnectionCounts } from "@/lib/erp/activity.server";

interface Props {
  connections: ErpConnectionView[];
  counts: ConnectionCounts[];
  importing: boolean;
}

const METRICS = [
  { key: "invoices", label: "Invoices", Icon: FileText },
  { key: "payments", label: "Payments", Icon: Receipt },
  { key: "vendors", label: "Vendors", Icon: Users },
] as const;

export function ImportDashboard({ connections, counts, importing }: Props) {
  if (!connections.length) return null;

  const totals = counts.reduce(
    (acc, c) => ({
      invoices: acc.invoices + c.invoices,
      payments: acc.payments + c.payments,
      vendors: acc.vendors + c.vendors,
    }),
    { invoices: 0, payments: 0, vendors: 0 },
  );
  const grand = totals.invoices + totals.payments + totals.vendors || 1;

  return (
    <section className="surface-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className={`size-4 text-primary ${importing ? "animate-pulse" : ""}`} />
          <h2 className="text-sm font-semibold">Live import</h2>
        </div>
        <ToneBadge tone={importing ? "brand" : "muted"} size="sm" dot>
          {importing ? "Pulling data…" : "Idle"}
        </ToneBadge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {METRICS.map(({ key, label, Icon }) => {
          const value = totals[key];
          const pct = Math.round((value / grand) * 100);
          return (
            <div key={key} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Icon className="size-3.5" /> {label}
                </span>
                <span>{pct}%</span>
              </div>
              <motion.p
                key={value}
                initial={{ opacity: 0.4, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-2xl font-semibold tabular-nums"
              >
                {value.toLocaleString()}
              </motion.p>
              <Progress value={importing && value === 0 ? 8 : pct} className="mt-2 h-1.5" />
            </div>
          );
        })}
      </div>

      <ul className="mt-4 space-y-2">
        {connections.map((c) => {
          const cc = counts.find((x) => x.connectionId === c.id);
          const active = importing && c.status !== "error";
          return (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/40 px-3 py-2 text-xs"
            >
              <span className="font-medium">{providerMeta(c.provider)?.name ?? c.provider}</span>
              <span className="text-muted-foreground">
                {cc?.invoices ?? 0} inv · {cc?.payments ?? 0} pay · {cc?.vendors ?? 0} ven · {cc?.contracts ?? 0} con
              </span>
              <span className="text-muted-foreground">
                {active ? "syncing…" : c.lastSyncAt ? `synced ${new Date(c.lastSyncAt).toLocaleTimeString()}` : "never synced"}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
