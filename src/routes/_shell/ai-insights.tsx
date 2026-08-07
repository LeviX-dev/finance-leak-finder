import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Brain, RefreshCw, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ToneBadge } from "@/components/common/tone-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ChartCard, RecoveryLineChart } from "@/components/dashboard/charts";
import { aiInsights, financialLeaks } from "@/data/mock";
import { currency, percent } from "@/lib/format";

export const Route = createFileRoute("/_shell/ai-insights")({
  head: () => ({
    meta: [
      { title: "AI Insights — AutoAudit" },
      {
        name: "description",
        content:
          "Model-generated explanations, root-cause narratives and prioritised recovery actions for detected financial leakage.",
      },
      { property: "og:title", content: "AI Insights — AutoAudit" },
      { property: "og:description", content: "Explainable AI findings across your finance stack." },
    ],
  }),
  component: AiInsightsPage,
});

function AiInsightsPage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <PageHeader
        title="AI insights"
        description="Every finding is explained in plain language with the evidence the model used."
        crumbs={[{ label: "AI Insights" }]}
        actions={
          <Button className="gap-2">
            <RefreshCw className="size-4" /> Regenerate insights
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="surface-card space-y-3 p-5">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-8 w-40" />
                </div>
              ))
            : aiInsights.map((insight, i) => (
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
                          {insight.id} · {insight.category}
                        </p>
                      </div>
                    </div>
                    <ToneBadge tone="success">{currency(insight.impact)}</ToneBadge>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{insight.summary}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Model confidence</span>
                    <span>{percent(insight.confidence)}</span>
                  </div>
                  <Progress value={insight.confidence * 100} className="mt-1.5 h-1.5" />
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {insight.actions.map((a) => (
                      <Button key={a} size="sm" variant="outline" className="h-8 text-xs">
                        {a}
                      </Button>
                    ))}
                    <div className="ml-auto flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="size-8" aria-label="Helpful">
                        <ThumbsUp className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8" aria-label="Not helpful">
                        <ThumbsDown className="size-4" />
                      </Button>
                    </div>
                  </div>
                </motion.article>
              ))}
        </div>

        <div className="space-y-4">
          <ChartCard title="Recovery velocity" description="Recovered vs detected, USD thousands">
            <RecoveryLineChart />
          </ChartCard>
          <div className="surface-card p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Brain className="size-4 text-primary" /> Model coverage
            </h3>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Transactions analysed", "1,842,665"],
                ["Detection models active", "12"],
                ["False-positive rate", "3.4%"],
                ["Avg. explanation latency", "1.2s"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="surface-card p-5">
            <h3 className="text-sm font-semibold">Highest-confidence findings</h3>
            <ul className="mt-3 space-y-3">
              {financialLeaks
                .slice()
                .sort((a, b) => b.confidence - a.confidence)
                .slice(0, 4)
                .map((l) => (
                  <li key={l.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{l.title}</p>
                      <p className="text-xs text-muted-foreground">{l.vendor}</p>
                    </div>
                    <ToneBadge tone="brand" size="sm">
                      {percent(l.confidence)}
                    </ToneBadge>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
