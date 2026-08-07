import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge, ToneBadge } from "@/components/common/tone-badge";
import { Button } from "@/components/ui/button";
import { recoveryCases } from "@/data/mock";
import { currency } from "@/lib/format";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_shell/recovery")({
  head: () => ({
    meta: [
      { title: "Recovery Center — AutoAudit" },
      { name: "description", content: "Track every recovery claim from identification through credit issued and cash returned." },
      { property: "og:title", content: "Recovery Center — AutoAudit" },
      { property: "og:description", content: "Track every recovery claim from identification through credit issued and cash returned." },
    ],
  }),
  component: RecoveryPage,
});

function RecoveryPage() {
  return (
    <>
      <PageHeader title="Recovery Center" description="Track every recovery claim from identification through credit issued and cash returned." crumbs={[{ label: "Recovery Center" }]} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {recoveryCases.map((c) => (
          <article key={c.id} className="surface-card p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{c.vendor}</p>
              <StatusBadge status={c.stage} />
            </div>
            <p className="mt-3 text-2xl font-semibold tabular-nums">{currency(c.amount)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{c.id} · owner {c.owner}</p>
            <div className="mt-4">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Progress</span><span>{c.progress}%</span>
              </div>
              <Progress value={c.progress} className="mt-1.5 h-1.5" />
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full">Open case</Button>
          </article>
        ))}
      </div>
    </>
  );
}
