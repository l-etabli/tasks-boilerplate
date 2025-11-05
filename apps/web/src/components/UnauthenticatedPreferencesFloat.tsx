import { ModeToggle } from "@tasks/ui/components/mode-toggle";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { useCurrentUser } from "@/providers/SessionProvider";

/**
 * Floating preferences widget for unauthenticated users.
 * Shows locale and theme controls in the top-right corner.
 * Automatically hides when user is authenticated.
 */
export function UnauthenticatedPreferencesFloat() {
  const { currentUser, isLoading } = useCurrentUser();

  // Don't show anything while loading or if user is authenticated
  if (isLoading || currentUser) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-gray-200 bg-white/95 p-2 shadow-md backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
      <LocaleSwitcher />
      <ModeToggle />
    </div>
  );
}
