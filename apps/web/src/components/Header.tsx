import { Link } from "@tanstack/react-router";
import { Badge } from "@tasks/ui/components/badge";
import { Button } from "@tasks/ui/components/button";
import {
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Home,
  Menu,
  Network,
  SquareFunction,
  StickyNote,
  X,
} from "lucide-react";
import { useState } from "react";
import { authClient } from "@/auth-client";
import { useCurrentUser } from "@/providers/SessionProvider";

export default function Header({ children }: { children?: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [groupedExpanded, setGroupedExpanded] = useState<Record<string, boolean>>({});
  const { currentUser } = useCurrentUser();

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
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              variant="ghost"
              size="icon"
              aria-label="Toggle menu"
              className="md:hidden"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <img src="/tanstack-word-logo-white.svg" alt="TanStack Logo" className="h-8" />
              <span className="hidden text-lg sm:inline">Tasks</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {currentUser ? (
              <>
                <Badge variant="outline" className="hidden gap-2 sm:flex">
                  <span className="text-xs font-normal">{currentUser.email}</span>
                </Badge>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/settings">Settings</Link>
                </Button>
                <Button type="button" onClick={handleLogout} variant="destructive" size="sm">
                  Sign Out
                </Button>
              </>
            ) : (
              <Button asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-16 left-0 z-30 w-64 border-r border-gray-200 bg-white shadow-lg transition-transform duration-300 md:relative md:inset-auto md:translate-x-0 md:shadow-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="flex flex-col gap-2 p-4">
            <NavLink to="/" icon={Home} label="Home" onNavigate={closeSidebar} />
            <NavLink to="/todos" icon={ClipboardList} label="Todos" onNavigate={closeSidebar} />

            <div className="my-4 border-t" />

            {/* Demo Links Start */}
            <NavLink
              to="/demo/start/server-funcs"
              icon={SquareFunction}
              label="Start - Server Functions"
              onNavigate={closeSidebar}
            />
            <NavLink
              to="/demo/start/api-request"
              icon={Network}
              label="Start - API Request"
              onNavigate={closeSidebar}
            />

            <div className="mb-2">
              <Button
                onClick={() =>
                  setGroupedExpanded((prev) => ({
                    ...prev,
                    StartSSRDemo: !prev.StartSSRDemo,
                  }))
                }
                variant="ghost"
                className="w-full justify-between"
              >
                <div className="flex items-center gap-3">
                  <StickyNote size={20} />
                  <span>Start - SSR Demos</span>
                </div>
                {groupedExpanded.StartSSRDemo ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </Button>
              {groupedExpanded.StartSSRDemo && (
                <div className="ml-4 flex flex-col gap-2 mt-2">
                  <NavLink
                    to="/demo/start/ssr/spa-mode"
                    icon={StickyNote}
                    label="SPA Mode"
                    onNavigate={closeSidebar}
                  />
                  <NavLink
                    to="/demo/start/ssr/full-ssr"
                    icon={StickyNote}
                    label="Full SSR"
                    onNavigate={closeSidebar}
                  />
                  <NavLink
                    to="/demo/start/ssr/data-only"
                    icon={StickyNote}
                    label="Data Only"
                    onNavigate={closeSidebar}
                  />
                </div>
              )}
            </div>
            {/* Demo Links End */}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">{children}</main>
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
