import { Link } from "@tanstack/react-router";
import { Badge } from "@tasks/ui/components/badge";
import { Button } from "@tasks/ui/components/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@tasks/ui/components/sheet";
import {
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Home,
  Menu,
  Network,
  SquareFunction,
  StickyNote,
} from "lucide-react";
import { useState } from "react";
import { authClient } from "@/auth-client";
import { useCurrentUser } from "@/providers/SessionProvider";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <Button
              onClick={() => setIsOpen(true)}
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              className="lg:hidden"
            >
              <Menu size={20} />
            </Button>
            <SheetContent side="left" className="w-64">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-6">
                <NavLink to="/" icon={Home} label="Home" onNavigate={() => setIsOpen(false)} />
                <NavLink
                  to="/todos"
                  icon={ClipboardList}
                  label="Todos"
                  onNavigate={() => setIsOpen(false)}
                />

                <div className="my-4 border-t" />

                {/* Demo Links Start */}
                <NavLink
                  to="/demo/start/server-funcs"
                  icon={SquareFunction}
                  label="Start - Server Functions"
                  onNavigate={() => setIsOpen(false)}
                />
                <NavLink
                  to="/demo/start/api-request"
                  icon={Network}
                  label="Start - API Request"
                  onNavigate={() => setIsOpen(false)}
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
                        onNavigate={() => setIsOpen(false)}
                      />
                      <NavLink
                        to="/demo/start/ssr/full-ssr"
                        icon={StickyNote}
                        label="Full SSR"
                        onNavigate={() => setIsOpen(false)}
                      />
                      <NavLink
                        to="/demo/start/ssr/data-only"
                        icon={StickyNote}
                        label="Data Only"
                        onNavigate={() => setIsOpen(false)}
                      />
                    </div>
                  )}
                </div>
                {/* Demo Links End */}
              </nav>
            </SheetContent>
          </Sheet>

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
