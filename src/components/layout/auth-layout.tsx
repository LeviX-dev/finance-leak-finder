import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <div className="gradient-brand absolute inset-0" />
        <div className="grid-pattern absolute inset-0 opacity-20" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-white/15 backdrop-blur">
              <ShieldCheck className="size-5" />
            </div>
            <span className="text-sm font-semibold">AutoAudit</span>
          </Link>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="max-w-md text-4xl leading-tight font-semibold tracking-tight">
              Find the money your ERP already lost.
            </h2>
            <p className="mt-4 max-w-md text-sm/relaxed opacity-90">
              AutoAudit analyses every transaction, invoice and contract to surface duplicate payments,
              overcharges, tax errors and fraud — with an explanation you can act on.
            </p>
            <dl className="mt-10 grid grid-cols-2 gap-6 max-w-md">
              <div>
                <dt className="text-xs opacity-80">Recovered for customers</dt>
                <dd className="mt-1 text-2xl font-semibold">$412M+</dd>
              </div>
              <div>
                <dt className="text-xs opacity-80">Average leakage found</dt>
                <dd className="mt-1 text-2xl font-semibold">1.8% of spend</dd>
              </div>
            </dl>
          </motion.div>
          <div className="flex items-center gap-4 text-xs opacity-85">
            <span className="inline-flex items-center gap-1.5"><Sparkles className="size-3.5" /> SOC 2 Type II</span>
            <span className="inline-flex items-center gap-1.5"><TrendingUp className="size-3.5" /> ISO 27001</span>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="grid-pattern pointer-events-none absolute inset-0 opacity-40 lg:hidden" />
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md"
        >
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="gradient-brand grid size-9 place-items-center rounded-xl">
              <ShieldCheck className="size-5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">AutoAudit</span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-7">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
        </motion.div>
      </div>
    </div>
  );
}
