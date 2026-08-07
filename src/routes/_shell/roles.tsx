import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ToneBadge } from "@/components/common/tone-badge";
import { Checkbox } from "@/components/ui/checkbox";
import { permissionColumns, roles } from "@/constants/navigation";

export const Route = createFileRoute("/_shell/roles")({
  head: () => ({
    meta: [
      { title: "Roles & Permissions — AutoAudit" },
      { name: "description", content: "Role definitions and a full permission matrix for finance, procurement and audit teams." },
      { property: "og:title", content: "Roles & Permissions — AutoAudit" },
      { property: "og:description", content: "Enterprise role and permission design for AutoAudit workspaces." },
    ],
  }),
  component: RolesPage,
});

function RolesPage() {
  return (
    <>
      <PageHeader
        title="Roles & permissions"
        description="Seven role archetypes covering executive oversight, day-to-day finance operations and read-only audit access."
        crumbs={[{ label: "Roles & Permissions" }]}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((role, i) => (
          <motion.article
            key={role.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -3 }}
            className="surface-card p-5 transition-shadow hover:shadow-lifted"
          >
            <div className="flex items-center gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <role.icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{role.label}</p>
                <ToneBadge tone={role.tone} size="sm">{role.permissions.length} permissions</ToneBadge>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{role.description}</p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {role.permissions.map((p) => (
                <li key={p} className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                  <Check className="size-3 text-success" /> {p}
                </li>
              ))}
            </ul>
          </motion.article>
        ))}
      </div>

      <section className="surface-card overflow-hidden">
        <div className="border-b border-border p-4">
          <h2 className="text-sm font-semibold">Permission matrix</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Presentation only — no policies are enforced in this prototype.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">Role</th>
                {permissionColumns.map((c) => (
                  <th key={c} scope="col" className="px-3 py-3 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="border-b border-border/70 last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <role.icon className="size-4 text-muted-foreground" />
                      <span className="font-medium">{role.label}</span>
                    </div>
                  </td>
                  {permissionColumns.map((c) => (
                    <td key={c} className="px-3 py-3 text-center">
                      <Checkbox
                        defaultChecked={role.permissions.includes(c)}
                        aria-label={`${role.label} can ${c}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
