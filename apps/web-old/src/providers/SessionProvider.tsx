import { createContext, type ReactNode, useContext } from "react";
import { authClient } from "@/auth-client";

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

/**
 * Will THROW if the user is not authenticated. Usage is fine when in _authenticated folder.
 * If you want to check if the user is authenticated, use useSession instead.
 */

export const useCurrentUser = () => {
  const { session, error } = useSession();
  if (!session) {
    throw new Error(
      "useCurrentUser must be used within a SessionProvider, and with a user. Usage should be only in _authenticated folder",
    );
  }

  if (error) {
    throw new Error("Error fetching session", { cause: error });
  }

  return { currentUser: session.user };
};
