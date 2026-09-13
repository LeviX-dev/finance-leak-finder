import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Brain, RefreshCw, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ToneBadge } from "@/components/common/tone-badge";
import { NoImportedData } from "@/components/common/no-data";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ChartCard, RecoveryLineChart } from "@/components/dashboard/charts";
import { useErpOverview } from "@/hooks/use-erp";
import { currencyIn, percent } from "@/lib/format";

export const Route = createFileRoute("/_shell/ai-insights")({
  head: () => ({
    meta: [
      { title: "AI Insights — AutoAudit" },
      {
        name: "description",
        content: "Plain-language explanations and prioritised actions generated from the findings in your imported financial records.",
      },
      { property: "og:title", content: "AI Insights — AutoAudit" },
      { property: "og:description", content: "Explainable findings across your imported financial records." },
    ],
  }),
  component: AiInsightsPage,
});

function AiInsightsPage() {
  const { data, isLoading, isFetching, refetch } = useErpOverview();
  const code = data?.currencyCode;
  const insights = data?.insights ?? [];
  const leaks = data?.leaks ?? [];

  if (!isLoading && !data?.connected) {
    return (
      <>
        <PageHeader title="AI insights" description="Explanations generated from your imported records." crumbs={[{ label: "AI Insights" }]} />
        <NoImportedData />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="AI insights"
        description="Every finding is explained in plain language with the records the analysis used."
        crumbs={[{ label: "AI Insights" }]}
        actions={
          <Button className="gap-2" disabled={isFetching} onClick={() => void refetch()}>
            <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} /> Re-analyse
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="surface-card space-y-3 p-5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-8 w-40" />
              </div>
            ))
          ) : insights.length === 0 ? (
            <div className="surface-card p-8 text-center text-sm text-muted-foreground">
              No issues found in the imported records — nothing to explain right now.
            </div>
          ) : (
            insights.map((insight, i) => (
              <motion.article
                key={insight.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="surface-card p-5"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet/10 text-violet">
                      <Sparkles className="size-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold">{insight.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {insight.category} · {insight.count} {insight.count === 1 ? "finding" : "findings"}
                      </p>
                    </div>
                  </div>
                  <ToneBadge tone="success">{currencyIn(insight.impact, code)}</ToneBadge>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{insight.summary}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Detection confidence</span>
                  <span>{percent(insight.confidence)}</span>
                </div>
                <Progress value={insight.confidence * 100} className="mt-1.5 h-1.5" />
              </motion.article>
            ))
          )}
        </div>

        <div className="space-y-4">
          <ChartCard title="Exposure over time" description="Invoiced vs detected exposure by month">
            <RecoveryLineChart data={data?.detectedByMonth ?? []} />
          </ChartCard>
          <div className="surface-card p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Brain className="size-4 text-primary" /> Analysis coverage
            </h3>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Invoices analysed", (data?.totals.invoices ?? 0).toLocaleString()],
                ["Payments analysed", (data?.totals.payments ?? 0).toLocaleString()],
                ["Vendors analysed", (data?.totals.vendors ?? 0).toLocaleString()],
                ["Findings raised", leaks.length.toLocaleString()],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="surface-card p-5">
            <h3 className="text-sm font-semibold">Largest findings</h3>
            <ul className="mt-3 space-y-3">
              {leaks.slice(0, 5).map((l) => (
                <li key={l.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{l.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{l.vendor}</p>
                  </div>
                  <ToneBadge tone="brand" size="sm">
                    {currencyIn(l.amount, l.currency || code)}
                  </ToneBadge>
                </li>
              ))}
              {leaks.length === 0 && <li className="text-sm text-muted-foreground">Nothing flagged.</li>}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
