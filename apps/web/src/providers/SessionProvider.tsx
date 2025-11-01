import { createContext, type ReactNode, useContext, useMemo } from "react";
import { authClient } from "@/auth-client";

type SessionData = ReturnType<typeof authClient.useSession>["data"];

interface SessionContextType {
  session: SessionData;
  isLoading: boolean;
  error: Error | null;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession?: SessionData;
}) {
  const { data: session, isPending, error } = authClient.useSession();

  // Merge initial session (from server-side) with session data (from client hook)
  // This prevents flash by using server data immediately, then updating when client data loads
  const mergedSession = useMemo((): SessionData => {
    if (session?.user) return session;
    if (initialSession?.user) return initialSession;
    return null;
  }, [session, initialSession]);

  return (
    <SessionContext.Provider
      value={{
        session: mergedSession,
        isLoading: isPending,
        error: error || null,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
};

export const useCurrentUser = () => {
  const { session, error, isLoading } = useSession();

  return {
    currentUser: session?.user || null,
    isLoading,
    error,
  };
};
