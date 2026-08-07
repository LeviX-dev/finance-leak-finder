import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  BadgeDollarSign,
  Bell,
  Brain,
  Download,
  Gauge,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { SeverityBadge, ToneBadge } from "@/components/common/tone-badge";
import {
  AnomalyBarChart,
  ChartCard,
  LeakBreakdownChart,
  RiskRadarChart,
  SavingsTrendChart,
} from "@/components/dashboard/charts";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { activityFeed, aiInsights, alerts, financialLeaks, kpis } from "@/data/mock";
import { compactCurrency, currency, number, percent } from "@/lib/format";

export const Route = createFileRoute("/_shell/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AutoAudit Financial Leakage Detection" },
      {
        name: "description",
        content:
          "Monitor financial health, potential savings, recovered spend and AI-detected leakage across your ERP data in one enterprise dashboard.",
      },
      { property: "og:title", content: "AutoAudit Dashboard" },
      {
        property: "og:description",
        content: "AI-powered financial leakage detection for enterprise finance teams.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <PageHeader
        title="Financial control center"
        description="Live view of leakage detection, recovery performance and AI risk signals across 14 entities."
        crumbs={[{ label: "Dashboard" }]}
        actions={
          <>
            <Button variant="outline" className="gap-2">
              <Download className="size-4" /> Export
            </Button>
            <Button className="gap-2">
              <RefreshCw className="size-4" /> Run AI scan
            </Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0}
          loading={loading}
          label="Financial health score"
          value={`${kpis.financialHealthScore}/100`}
          delta={6}
          icon={Gauge}
          tone="brand"
          hint="Up 6 points since last quarter"
        />
        <StatCard
          index={1}
          loading={loading}
          label="Potential savings identified"
          value={compactCurrency(kpis.potentialSavings)}
          delta={18}
          icon={BadgeDollarSign}
          tone="violet"
          hint={`${number(kpis.leaksDetected)} leaks across 6 categories`}
        />
        <StatCard
          index={2}
          loading={loading}
          label="Money recovered YTD"
          value={compactCurrency(kpis.moneyRecovered)}
          delta={11}
          icon={Wallet}
          tone="success"
          hint={`${kpis.recoveryRate}% recovery rate`}
        />
        <StatCard
          index={3}
          loading={loading}
          label="AI risk score"
          value={`${kpis.aiRiskScore} · Moderate`}
          delta={-4}
          icon={ShieldAlert}
          tone="warning"
          hint={`${kpis.fraudAlerts} fraud indicators open`}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title="Detected vs. recovered leakage"
          description="Rolling 8 months, in thousands USD"
          action={<ToneBadge tone="success">+18% MoM</ToneBadge>}
        >
          <SavingsTrendChart />
        </ChartCard>
        <ChartCard title="Leakage by category" description="Share of total exposure">
          <LeakBreakdownChart />
        </ChartCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-card p-5 lg:col-span-2"
        >
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="size-4 text-violet" /> AI recommendations
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Ranked by recoverable impact and model confidence
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1">
              <Link to="/ai-insights">
                All insights <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
          <ul className="mt-4 space-y-3">
            {aiInsights.map((insight, i) => (
              <motion.li
                key={insight.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="rounded-xl border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/60"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <p className="text-sm font-medium">{insight.title}</p>
                  <ToneBadge tone="violet">{percent(insight.confidence)} confidence</ToneBadge>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{insight.summary}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <ToneBadge tone="success">{currency(insight.impact)} impact</ToneBadge>
                  {insight.actions.map((a) => (
                    <Button key={a} size="sm" variant="outline" className="h-7 text-xs">
                      {a}
                    </Button>
                  ))}
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <ChartCard title="Anomaly volume" description="This week vs. baseline">
          <AnomalyBarChart />
        </ChartCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="surface-card p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Bell className="size-4 text-destructive" /> Active alerts
          </h3>
          <ul className="mt-4 space-y-3">
            {alerts.slice(0, 4).map((a) => (
              <li key={a.id} className="rounded-xl border border-border p-3">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <p className="text-sm font-medium">{a.title}</p>
                  <SeverityBadge severity={a.severity} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{a.time}</p>
              </li>
            ))}
          </ul>
        </motion.div>

        <ChartCard title="Risk surface" description="AI-scored exposure by domain">
          <RiskRadarChart />
        </ChartCard>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="surface-card p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Brain className="size-4 text-primary" /> Recent activity
          </h3>
          <ol className="mt-4 space-y-4">
            {activityFeed.map((item) => (
              <li key={item.id} className="relative pl-5 text-sm">
                <span className="absolute top-1.5 left-0 size-2 rounded-full bg-primary/60" />
                <p>
                  <span className="font-medium">{item.actor}</span>{" "}
                  <span className="text-muted-foreground">{item.action}</span>{" "}
                  <span className="font-medium">{item.target}</span>
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{item.time}</p>
              </li>
            ))}
          </ol>
        </motion.div>
      </section>

      <section className="surface-card p-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <TrendingDown className="size-4 text-destructive" /> Leak detection summary
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Top exposures awaiting triage this cycle
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1">
            <Link to="/leaks">
              Open register <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {financialLeaks.slice(0, 6).map((leak) => (
            <motion.article
              key={leak.id}
              whileHover={{ y: -3 }}
              className="rounded-xl border border-border p-4 transition-shadow hover:shadow-lifted"
            >
              <div className="flex items-center justify-between gap-2">
                <ToneBadge tone="brand" size="sm">
                  {leak.category}
                </ToneBadge>
                <SeverityBadge severity={leak.severity} />
              </div>
              <p className="mt-2.5 line-clamp-2 text-sm font-medium">{leak.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{leak.vendor}</p>
              <p className="mt-3 text-lg font-semibold tabular-nums">{currency(leak.amount)}</p>
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>AI confidence</span>
                  <span>{percent(leak.confidence)}</span>
                </div>
                <Progress value={leak.confidence * 100} className="mt-1.5 h-1.5" />
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </>
  );
}
