import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge, ToneBadge } from "@/components/common/tone-badge";
import { Button } from "@/components/ui/button";
import { AnomalyBarChart, ChartCard, LeakBreakdownChart, RiskRadarChart, SavingsTrendChart } from "@/components/dashboard/charts";

export const Route = createFileRoute("/_shell/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — AutoAudit" },
      { name: "description", content: "Deep-dive analytics on spend anomalies, recovery velocity and risk concentration." },
      { property: "og:title", content: "Analytics — AutoAudit" },
      { property: "og:description", content: "Deep-dive analytics on spend anomalies, recovery velocity and risk concentration." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <>
      <PageHeader title="Analytics" description="Deep-dive analytics on spend anomalies, recovery velocity and risk concentration." crumbs={[{ label: "Analytics" }]} />
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Detected vs. recovered" description="Rolling 8 months, USD thousands">
          <SavingsTrendChart />
        </ChartCard>
        <ChartCard title="Anomaly volume" description="This week vs. baseline">
          <AnomalyBarChart />
        </ChartCard>
        <ChartCard title="Risk surface" description="AI-scored exposure by domain">
          <RiskRadarChart />
        </ChartCard>
        <ChartCard title="Leakage mix" description="Share of total exposure">
          <LeakBreakdownChart />
        </ChartCard>
      </div>
    </>
  );
}
