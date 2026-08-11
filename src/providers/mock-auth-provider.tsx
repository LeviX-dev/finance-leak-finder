import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { currentUser, workspaces } from "@/data/mock";
import type { AppUser, RoleId } from "@/types";

interface AuthContextValue {
  user: AppUser;
  role: RoleId;
  setRole: (role: RoleId) => void;
  workspace: (typeof workspaces)[number];
  setWorkspaceId: (id: string) => void;
  workspaces: typeof workspaces;
  /** Real Supabase session — null when signed out. */
  session: Session | null;
  loadingSession: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<RoleId>(currentUser.role);
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]!.id);
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoadingSession(false);
    });
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingSession(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const meta = (session?.user.user_metadata ?? {}) as Record<string, string | undefined>;
    const email = session?.user.email ?? currentUser.email;
    const name = meta["full_name"] ?? (session ? email.split("@")[0]! : currentUser.name);
    return {
      user: { ...currentUser, role, name, email },
      role,
      setRole,
      workspace: workspaces.find((w) => w.id === workspaceId) ?? workspaces[0]!,
      setWorkspaceId,
      workspaces,
      session,
      loadingSession,
      signOut,
    };
  }, [role, workspaceId, session, loadingSession, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMockAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useMockAuth must be used inside MockAuthProvider");
  return ctx;
}
