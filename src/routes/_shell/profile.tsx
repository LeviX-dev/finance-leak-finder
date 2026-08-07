import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge, ToneBadge } from "@/components/common/tone-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { roleMap } from "@/constants/navigation";
import { useMockAuth } from "@/providers/mock-auth-provider";

export const Route = createFileRoute("/_shell/profile")({
  head: () => ({
    meta: [
      { title: "User Profile — AutoAudit" },
      { name: "description", content: "Your AutoAudit profile, role assignment and workspace membership." },
      { property: "og:title", content: "User Profile — AutoAudit" },
      { property: "og:description", content: "Your AutoAudit profile, role assignment and workspace membership." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useMockAuth();
  return (
    <>
      <PageHeader title="User Profile" description="Your AutoAudit profile, role assignment and workspace membership." crumbs={[{ label: "User Profile" }]} />
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="surface-card p-6 lg:col-span-1">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">{user.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <ToneBadge tone="brand">{roleMap[user.role].label}</ToneBadge>
            <StatusBadge status={user.status} />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{roleMap[user.role].description}</p>
        </section>
        <section className="surface-card p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold">Profile details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="fn">Full name</Label><Input id="fn" defaultValue={user.name} /></div>
            <div className="space-y-1.5"><Label htmlFor="em">Work email</Label><Input id="em" defaultValue={user.email} /></div>
            <div className="space-y-1.5"><Label htmlFor="dp">Department</Label><Input id="dp" defaultValue={user.department} /></div>
            <div className="space-y-1.5"><Label htmlFor="ph">Phone</Label><Input id="ph" defaultValue="+1 (617) 555-0142" /></div>
          </div>
          <Button className="mt-5">Save changes</Button>
        </section>
      </div>
    </>
  );
}
