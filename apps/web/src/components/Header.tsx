import { Link } from "@tanstack/react-router";
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
import { useCurrentUser } from "@/providers/SessionProvider";
import { LogoutButton } from "./LogoutButton";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [groupedExpanded, setGroupedExpanded] = useState<Record<string, boolean>>({});
  const { currentUser } = useCurrentUser();

  return (
    <>
      <header className="p-4 flex items-center justify-between bg-gray-800 text-white shadow-lg">
        <div className="flex items-center">
          <Button
            type="button"
            onClick={() => setIsOpen(true)}
            variant="ghost"
            size="icon"
            className="hover:bg-gray-700 text-white"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </Button>
          <h1 className="ml-4 text-xl font-semibold">
            <Link to="/">
              <img src="/tanstack-word-logo-white.svg" alt="TanStack Logo" className="h-10" />
            </Link>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              <span className="text-sm">{currentUser.email}</span>
              <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700" asChild>
                <Link to="/settings">Settings</Link>
              </Button>
              <LogoutButton />
            </>
          ) : (
            <Button variant="link" className="text-white" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </header>

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-gray-900 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Navigation</h2>
          <Button
            type="button"
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon"
            className="hover:bg-gray-800 text-white"
            aria-label="Close menu"
          >
            <X size={24} />
          </Button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            activeProps={{
              className:
                "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
            }}
          >
            <Home size={20} />
            <span className="font-medium">Home</span>
          </Link>

          <Link
            to="/todos"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            activeProps={{
              className:
                "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
            }}
          >
            <ClipboardList size={20} />
            <span className="font-medium">Todos</span>
          </Link>

          {/* Demo Links Start */}

          <Link
            to="/demo/start/server-funcs"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            activeProps={{
              className:
                "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
            }}
          >
            <SquareFunction size={20} />
            <span className="font-medium">Start - Server Functions</span>
          </Link>

          <Link
            to="/demo/start/api-request"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            activeProps={{
              className:
                "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
            }}
          >
            <Network size={20} />
            <span className="font-medium">Start - API Request</span>
          </Link>

          <div className="flex flex-row justify-between">
            <Link
              to="/demo/start/ssr"
              onClick={() => setIsOpen(false)}
              className="flex-1 flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
              activeProps={{
                className:
                  "flex-1 flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
              }}
            >
              <StickyNote size={20} />
              <span className="font-medium">Start - SSR Demos</span>
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hover:bg-gray-800 text-white"
              onClick={() =>
                setGroupedExpanded((prev) => ({
                  ...prev,
                  StartSSRDemo: !prev.StartSSRDemo,
                }))
              }
            >
              {groupedExpanded.StartSSRDemo ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronRight size={20} />
              )}
            </Button>
          </div>
          {groupedExpanded.StartSSRDemo && (
            <div className="flex flex-col ml-4">
              <Link
                to="/demo/start/ssr/spa-mode"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
                activeProps={{
                  className:
                    "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
                }}
              >
                <StickyNote size={20} />
                <span className="font-medium">SPA Mode</span>
              </Link>

              <Link
                to="/demo/start/ssr/full-ssr"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
                activeProps={{
                  className:
                    "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
                }}
              >
                <StickyNote size={20} />
                <span className="font-medium">Full SSR</span>
              </Link>

              <Link
                to="/demo/start/ssr/data-only"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
                activeProps={{
                  className:
                    "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
                }}
              >
                <StickyNote size={20} />
                <span className="font-medium">Data Only</span>
              </Link>
            </div>
          )}

          {/* Demo Links End */}
        </nav>
      </aside>
    </>
  );
}
