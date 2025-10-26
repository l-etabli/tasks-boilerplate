import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsLayout,
});

function SettingsLayout() {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-4">
          <Link
            to="/settings/account"
            className="px-4 py-2 text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 transition-colors"
            activeProps={{
              className: "px-4 py-2 text-blue-600 border-b-2 border-blue-600 font-semibold",
            }}
            activeOptions={{ exact: false }}
          >
            Account
          </Link>
          <Link
            to="/settings/organizations"
            className="px-4 py-2 text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 transition-colors"
            activeProps={{
              className: "px-4 py-2 text-blue-600 border-b-2 border-blue-600 font-semibold",
            }}
            activeOptions={{ exact: false }}
          >
            Organizations
          </Link>
        </nav>
      </div>

      <Outlet />
    </div>
  );
}
