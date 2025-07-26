import { authClient } from "@/auth-client";
import { type ReactNode, createContext, useContext } from "react";

interface SessionContextType {
  session: Awaited<ReturnType<typeof authClient.getSession>>["data"] | null;
  isLoading: boolean;
  error: Error | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending, error } = authClient.useSession();

  const value: SessionContextType = {
    session: session || null,
    isLoading: isPending,
    error: error || null,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }

  return context;
}
