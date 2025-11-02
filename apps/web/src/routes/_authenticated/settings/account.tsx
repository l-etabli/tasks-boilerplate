import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/auth-client";
import { useI18nContext } from "@/i18n/i18n-react";

export const Route = createFileRoute("/_authenticated/settings/account")({
  component: AccountSettings,
});

function AccountSettings() {
  const { currentUser } = Route.useRouteContext();
  const { data: session } = authClient.useSession();
  const { LL } = useI18nContext();
  const t = LL.settings.account;

  const [name, setName] = useState(currentUser.name || "");
  const [email, setEmail] = useState(currentUser.email);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Disable email change for OAuth users (Google, etc)
  // OAuth users have accounts with providers like 'google'
  // Email/password users would need to be detected differently
  // For now, disable if email is verified (typically OAuth)
  const canChangeEmail = !session?.user?.emailVerified;

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    try {
      await authClient.updateUser({
        name,
      });
      setMessage({ type: "success", text: t.nameSuccess() });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : t.nameError(),
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    try {
      await authClient.changeEmail({
        newEmail: email,
      });
      setMessage({
        type: "success",
        text: t.emailSuccess(),
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : t.emailError(),
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">{t.heading()}</h2>

        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                : "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Name Update */}
          <form id="form-update-name" onSubmit={handleUpdateName} className="space-y-3">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                {t.nameLabel()}
              </label>
              <div className="flex gap-2">
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePlaceholder()}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isUpdating}
                />
                <button
                  id="btn-save-name"
                  type="submit"
                  disabled={isUpdating || !name.trim() || name === currentUser.name}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? LL.common.saving() : LL.common.save()}
                </button>
              </div>
            </div>
          </form>

          {/* Email Update - Only for email/password users */}
          {canChangeEmail ? (
            <form id="form-update-email" onSubmit={handleUpdateEmail} className="space-y-3">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  {t.emailLabel()}
                </label>
                <div className="flex gap-2">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder()}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isUpdating}
                    required
                  />
                  <button
                    id="btn-save-email"
                    type="submit"
                    disabled={isUpdating || !email.trim() || email === currentUser.email}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? LL.common.saving() : LL.common.save()}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t.emailVerificationNote()}
                </p>
              </div>
            </form>
          ) : (
            <div>
              <div className="text-sm font-medium mb-1">{t.emailLabel()}</div>
              <div className="px-3 py-2 border border-gray-200 dark:border-slate-800 rounded bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-gray-300">
                {currentUser.email}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.emailOAuthNote()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
