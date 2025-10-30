import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/auth-client";

export const Route = createFileRoute("/_authenticated/settings/account")({
  component: AccountSettings,
});

function AccountSettings() {
  const { currentUser } = Route.useRouteContext();
  const { data: session } = authClient.useSession();

  const [name, setName] = useState(session?.user?.name || "");
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
      setMessage({ type: "success", text: "Name updated successfully" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update name",
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
        text: "Email update initiated. Check your inbox for verification.",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update email",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>

        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Name Update */}
          <form onSubmit={handleUpdateName} className="space-y-3">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name
              </label>
              <div className="flex gap-2">
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isUpdating}
                />
                <button
                  type="submit"
                  disabled={isUpdating || !name.trim() || name === session?.user?.name}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </form>

          {/* Email Update - Only for email/password users */}
          {canChangeEmail ? (
            <form onSubmit={handleUpdateEmail} className="space-y-3">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <div className="flex gap-2">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isUpdating}
                    required
                  />
                  <button
                    type="submit"
                    disabled={isUpdating || !email.trim() || email === currentUser.email}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? "Saving..." : "Save"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Changing your email will require verification
                </p>
              </div>
            </form>
          ) : (
            <div>
              <div className="text-sm font-medium mb-1">Email</div>
              <div className="px-3 py-2 border border-gray-200 rounded bg-gray-50 text-gray-700">
                {currentUser.email}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed for OAuth accounts (Google, etc.)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Account Overview */}
      {currentUser.activePlan && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium mb-3">Account Overview</h3>
          <div className="text-sm">
            <span className="text-gray-500">Plan: </span>
            <span className="font-semibold capitalize">{currentUser.activePlan}</span>
          </div>
        </div>
      )}
    </div>
  );
}
