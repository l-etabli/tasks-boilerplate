import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useI18nContext } from "@/i18n/i18n-react";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsLayout,
});

function SettingsLayout() {
  const { LL } = useI18nContext();

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">{LL.settings.title()}</h1>

      <div className="mb-6 border-b border-gray-200 dark:border-slate-800">
        <nav className="flex gap-4">
          <Link
            to="/settings/account"
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border-b-2 border-transparent hover:border-gray-300 dark:hover:border-slate-600 transition-colors"
            activeProps={{
              className:
                "px-4 py-2 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-semibold",
            }}
            activeOptions={{ exact: false }}
          >
            {LL.settings.accountTab()}
          </Link>
          <Link
            to="/settings/organizations"
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border-b-2 border-transparent hover:border-gray-300 dark:hover:border-slate-600 transition-colors"
            activeProps={{
              className:
                "px-4 py-2 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-semibold",
            }}
            activeOptions={{ exact: false }}
          >
            {LL.settings.organizationsTab()}
          </Link>
        </nav>
      </div>

      <Outlet />
    </div>
  );
}
