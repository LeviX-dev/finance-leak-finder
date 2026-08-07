import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { currentUser, workspaces } from "@/data/mock";
import type { AppUser, RoleId } from "@/types";

/**
 * Fake auth context — UI only. No network calls, no tokens, no persistence.
 * Purely simulates the shape of a real session for presentation purposes.
 */
interface AuthContextValue {
  user: AppUser;
  role: RoleId;
  setRole: (role: RoleId) => void;
  workspace: (typeof workspaces)[number];
  setWorkspaceId: (id: string) => void;
  workspaces: typeof workspaces;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<RoleId>(currentUser.role);
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]!.id);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: { ...currentUser, role },
      role,
      setRole,
      workspace: workspaces.find((w) => w.id === workspaceId) ?? workspaces[0]!,
      setWorkspaceId,
      workspaces,
    }),
    [role, workspaceId],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMockAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useMockAuth must be used inside MockAuthProvider");
  return ctx;
}
