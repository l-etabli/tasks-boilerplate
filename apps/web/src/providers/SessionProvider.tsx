import { createContext, type ReactNode, useContext } from "react";
import { authClient } from "@/auth-client";

interface SessionContextType {
  session: ReturnType<typeof authClient.useSession>["data"];
  isLoading: boolean;
  error: Error | null;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending, error } = authClient.useSession();

  return (
    <SessionContext.Provider
      value={{
        session: session || null,
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
