import { Link, useRouter } from "@tanstack/react-router";
import { Button } from "@tasks/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@tasks/ui/components/dropdown-menu";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  LogOut,
  Menu,
  Settings,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { authClient } from "@/auth-client";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useI18nContext } from "@/i18n/i18n-react";
import { useCurrentUser } from "@/providers/SessionProvider";

export default function Header({
  children,
  organizations,
  activeOrganizationId,
}: {
  children?: React.ReactNode;
  organizations?: Array<{ id: string; name: string }>;
  activeOrganizationId?: string | null;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const { currentUser } = useCurrentUser();
  const { LL } = useI18nContext();
  const router = useRouter();

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

  const handleSwitchOrganization = async (orgId: string) => {
    await authClient.organization.setActive({ organizationId: orgId });
    router.invalidate();
  };

  const activeOrg = organizations?.find((org) => org.id === activeOrganizationId);
  const displayName = currentUser?.name || currentUser?.email || "";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-950 shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              id="btn-toggle-sidebar"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              variant="ghost"
              size="icon"
              aria-label={LL.header.toggleMenu()}
              className="md:hidden"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <Link id="link-app-title" to="/todos" className="flex items-center gap-2 font-semibold">
              <span className="text-lg">{LL.app.title()}</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle />
            {currentUser ? (
              <>
                {organizations && organizations.length > 0 && activeOrg && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        id="btn-organization-switcher"
                        variant="outline"
                        size="default"
                        className="hidden h-9 gap-2 sm:flex"
                        aria-label={LL.header.organizationSwitcher()}
                      >
                        <span className="text-sm">{activeOrg.name}</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuRadioGroup
                        value={activeOrganizationId || undefined}
                        onValueChange={handleSwitchOrganization}
                      >
                        {organizations.map((org) => (
                          <DropdownMenuRadioItem
                            key={org.id}
                            value={org.id}
                            id={`org-option-${org.id}`}
                          >
                            {org.name}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {/* Mobile user menu - icon only */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      id="btn-user-menu-mobile"
                      variant="outline"
                      size="icon"
                      className="sm:hidden"
                      aria-label={displayName}
                    >
                      <User className="h-[1.2rem] w-[1.2rem]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem id="menu-item-account-mobile" asChild>
                      <Link to="/settings/account" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span>{LL.nav.account()}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem id="menu-item-organizations-mobile" asChild>
                      <Link to="/settings/organizations" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>{LL.nav.organizations()}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      id="menu-item-sign-out-mobile"
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-red-600 dark:text-red-400"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{LL.auth.signOut()}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Desktop user menu - full button with name */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      id="btn-user-menu"
                      variant="outline"
                      size="default"
                      className="hidden h-9 gap-2 sm:flex"
                    >
                      <User className="h-4 w-4" />
                      <span className="text-sm">{displayName}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem id="menu-item-account" asChild>
                      <Link to="/settings/account" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span>{LL.nav.account()}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem id="menu-item-organizations" asChild>
                      <Link to="/settings/organizations" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>{LL.nav.organizations()}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      id="menu-item-sign-out"
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-red-600 dark:text-red-400"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{LL.auth.signOut()}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button id="btn-sign-in" size="default" className="h-9" asChild>
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
              id="nav-link-todos"
              to="/todos"
              icon={ClipboardList}
              label={LL.nav.todos()}
              onNavigate={closeSidebar}
            />

            <div className="my-4 border-t border-gray-200 dark:border-slate-800" />

            <div className="mb-2">
              <Button
                id="btn-toggle-settings-submenu"
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
                    id="nav-link-account"
                    to="/settings/account"
                    icon={Settings}
                    label={LL.nav.account()}
                    onNavigate={closeSidebar}
                  />
                  <NavLink
                    id="nav-link-organizations"
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
  id,
}: {
  to: string;
  icon: React.ComponentType<{ size: number }>;
  label: string;
  onNavigate: () => void;
  id?: string;
}) {
  return (
    <Link
      id={id}
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
