import { Link } from "@tanstack/react-router";
import { Badge } from "@tasks/ui/components/badge";
import { Button } from "@tasks/ui/components/button";
import { ModeToggle } from "@tasks/ui/components/mode-toggle";
import { ChevronDown, ChevronRight, ClipboardList, Menu, Settings, X } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/auth-client";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { useI18nContext } from "@/i18n/i18n-react";
import { useCurrentUser } from "@/providers/SessionProvider";

export default function Header({ children }: { children?: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const { currentUser } = useCurrentUser();
  const { LL } = useI18nContext();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-950 shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              variant="ghost"
              size="icon"
              aria-label={LL.header.toggleMenu()}
              className="md:hidden"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <Link to="/todos" className="flex items-center gap-2 font-semibold">
              <span className="text-lg">{LL.app.title()}</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <LocaleSwitcher />
            <ModeToggle />
            {currentUser ? (
              <>
                <Badge variant="outline" className="hidden gap-2 sm:flex">
                  <span className="text-xs font-normal">{currentUser.email}</span>
                </Badge>
                <Button type="button" onClick={handleLogout} variant="destructive" size="sm">
                  {LL.auth.signOut()}
                </Button>
              </>
            ) : (
              <Button asChild>
                <Link to="/login">{LL.auth.signIn()}</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-16 left-0 z-30 w-64 border-r border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-950 shadow-lg transition-transform duration-300 md:relative md:inset-auto md:translate-x-0 md:shadow-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="flex flex-col gap-2 p-4">
            <NavLink
              to="/todos"
              icon={ClipboardList}
              label={LL.nav.todos()}
              onNavigate={closeSidebar}
            />

            <div className="my-4 border-t border-gray-200 dark:border-slate-800" />

            <div className="mb-2">
              <Button
                onClick={() => setSettingsExpanded((prev) => !prev)}
                variant="ghost"
                className="w-full justify-between"
              >
                <div className="flex items-center gap-3">
                  <Settings size={20} />
                  <span>{LL.nav.settings()}</span>
                </div>
                {settingsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </Button>
              {settingsExpanded && (
                <div className="ml-4 flex flex-col gap-2 mt-2">
                  <NavLink
                    to="/settings/account"
                    icon={Settings}
                    label={LL.nav.account()}
                    onNavigate={closeSidebar}
                  />
                  <NavLink
                    to="/settings/organizations"
                    icon={Settings}
                    label={LL.nav.organizations()}
                    onNavigate={closeSidebar}
                  />
                </div>
              )}
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-white dark:bg-slate-950">{children}</main>
      </div>
    </>
  );
}

function NavLink({
  to,
  icon: Icon,
  label,
  onNavigate,
}: {
  to: string;
  icon: React.ComponentType<{ size: number }>;
  label: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
      activeProps={{
        className: "flex items-center gap-3 rounded-md px-3 py-2 text-sm bg-accent font-medium",
      }}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
}
