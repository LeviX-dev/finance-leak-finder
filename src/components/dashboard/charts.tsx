import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { anomalyByDay, leakBreakdown, riskRadar, savingsTrend } from "@/data/mock";

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--destructive)",
];

const axisProps = {
  stroke: "var(--muted-foreground)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    color: "var(--popover-foreground)",
    fontSize: "12px",
    boxShadow: "var(--shadow-soft)",
  },
  labelStyle: { color: "var(--muted-foreground)", fontSize: "11px" },
};

export function ChartCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`surface-card p-5 ${className ?? ""}`}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </motion.section>
  );
}

export function SavingsTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={savingsTrend} margin={{ left: -18, right: 6, top: 4 }}>
        <defs>
          <linearGradient id="detectedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="recoveredFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-5)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--chart-5)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} tickFormatter={(v) => `$${v}k`} />
        <Tooltip {...tooltipStyle} formatter={(v: number) => [`$${v}k`, ""]} />
        <Area
          type="monotone"
          dataKey="detected"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#detectedFill)"
          name="Detected"
        />
        <Area
          type="monotone"
          dataKey="recovered"
          stroke="var(--chart-5)"
          strokeWidth={2}
          fill="url(#recoveredFill)"
          name="Recovered"
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function LeakBreakdownChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={leakBreakdown}
          dataKey="value"
          nameKey="name"
          innerRadius={62}
          outerRadius={98}
          paddingAngle={3}
          stroke="var(--card)"
          strokeWidth={2}
        >
          {leakBreakdown.map((entry, i) => (
            <Cell key={entry.name} fill={chartColors[i % chartColors.length]} />
          ))}
        </Pie>
        <Tooltip
          {...tooltipStyle}
          formatter={(v: number, n) => [`$${(v / 1000).toFixed(0)}k`, n as string]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function RiskRadarChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={riskRadar} outerRadius={95}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis dataKey="area" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
        <Radar
          dataKey="score"
          stroke="var(--chart-3)"
          fill="var(--chart-3)"
          fillOpacity={0.28}
          name="Risk score"
        />
        <Tooltip {...tooltipStyle} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function AnomalyBarChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={anomalyByDay} margin={{ left: -22, right: 6 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="day" {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip {...tooltipStyle} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
        <Bar dataKey="anomalies" fill="var(--chart-1)" radius={[6, 6, 0, 0]} name="Anomalies" />
        <Bar dataKey="baseline" fill="var(--chart-2)" radius={[6, 6, 0, 0]} name="Baseline" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RecoveryLineChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={savingsTrend} margin={{ left: -18, right: 6 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} tickFormatter={(v) => `$${v}k`} />
        <Tooltip {...tooltipStyle} />
        <Line
          type="monotone"
          dataKey="recovered"
          stroke="var(--chart-5)"
          strokeWidth={2.5}
          dot={false}
          name="Recovered"
        />
        <Line
          type="monotone"
          dataKey="detected"
          stroke="var(--chart-3)"
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={false}
          name="Detected"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
