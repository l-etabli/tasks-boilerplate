import { useRouter } from "@tanstack/react-router";
import type { User } from "@tasks/core";
import { useId, useState } from "react";
import { authClient } from "@/auth-client";

type CreateOrganizationModalProps = {
  user: User;
};

export function CreateOrganizationModal({ user }: CreateOrganizationModalProps) {
  const router = useRouter();
  const nameId = useId();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [orgName, setOrgName] = useState("");

  const createPersonalOrganization = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const name = user.email.split("@")[0];
      const slug = `personal-${user.id.slice(0, 8)}`;

      await authClient.organization.create({
        name,
        slug,
        metadata: { type: "personal" },
      });

      router.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create organization");
    } finally {
      setIsCreating(false);
    }
  };

  const createCustomOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      const slug = orgName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      await authClient.organization.create({
        name: orgName,
        slug,
      });

      router.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create organization");
    } finally {
      setIsCreating(false);
    }
  };

  if (showCustomForm) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Create your organization</h2>
            <p className="text-gray-600">Set up your workspace</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={createCustomOrganization} className="space-y-4">
            <div>
              <label htmlFor={nameId} className="block text-sm font-medium mb-1">
                Organization name
              </label>
              <input
                id={nameId}
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Acme Inc"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isCreating}
              />
              <p className="text-xs text-gray-500 mt-1">
                Slug will be auto-generated from the name
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                disabled={isCreating}
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={isCreating || !orgName.trim()}
              >
                {isCreating ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Create your organization</h2>
          <p className="text-gray-600">Choose how you'll use this workspace</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            type="button"
            onClick={createPersonalOrganization}
            disabled={isCreating}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Personal workspace</div>
                <div className="text-sm text-gray-600">Quick setup for individual use</div>
              </div>
              <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Fastest</div>
            </div>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCustomForm(true)}
            disabled={isCreating}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left disabled:opacity-50"
          >
            <div className="font-semibold">Custom organization</div>
            <div className="text-sm text-gray-600">Set up with custom name and settings</div>
          </button>
        </div>
      </div>
    </div>
  );
}
