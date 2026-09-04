import { createServerFn } from "@tanstack/react-start";

export type AccountState = "unknown" | "unconfirmed" | "confirmed" | "blocked";

export interface AccountStatus {
  state: AccountState;
  email: string;
}

/**
 * Looks up the sign-in readiness of an email address so the login screen can
 * tell the user exactly what to do next.
 */
export const getAccountStatus = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string }) => ({ email: String(input.email ?? "").trim().toLowerCase() }))
  .handler(async ({ data }): Promise<AccountStatus> => {
    if (!data.email || !data.email.includes("@")) return { state: "unknown", email: data.email };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const user = list?.users?.find((u) => (u.email ?? "").toLowerCase() === data.email);
    if (!user) return { state: "unknown", email: data.email };

    if (user.banned_until && new Date(user.banned_until as string).getTime() > Date.now()) {
      return { state: "blocked", email: data.email };
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.status && profile.status !== "active") return { state: "blocked", email: data.email };

    return { state: user.email_confirmed_at ? "confirmed" : "unconfirmed", email: data.email };
  });
