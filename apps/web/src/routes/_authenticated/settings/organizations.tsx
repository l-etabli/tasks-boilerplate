import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/auth-client";

export const Route = createFileRoute("/_authenticated/settings/organizations")({
  component: OrganizationsSettings,
});

function OrganizationsSettings() {
  const router = useRouter();
  const { organizations, activeOrganizationId } = Route.useRouteContext();
  const [isCreating, setIsCreating] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSetActive = async (orgId: string) => {
    setIsSwitching(true);
    setMessage(null);

    try {
      await authClient.organization.setActive({ organizationId: orgId });
      setMessage({ type: "success", text: "Organization switched successfully" });
      router.invalidate();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to switch organization",
      });
    } finally {
      setIsSwitching(false);
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setMessage(null);

    try {
      const slug = orgName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      await authClient.organization.create({
        name: orgName,
        slug,
      });

      setMessage({ type: "success", text: "Organization created successfully" });
      setShowCreateForm(false);
      setOrgName("");
      router.invalidate();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to create organization",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Your Organizations</h2>
          <p className="text-sm text-gray-500 mt-1">
            {organizations.length} {organizations.length === 1 ? "organization" : "organizations"}
          </p>
        </div>
        {!showCreateForm && (
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create Organization
          </button>
        )}
      </div>

      {message && (
        <div
          className={`p-3 rounded ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Create Organization Form */}
      {showCreateForm && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="font-semibold mb-3">Create New Organization</h3>
          <form onSubmit={handleCreateOrganization} className="space-y-3">
            <div>
              <label htmlFor={"orgName"} className="block text-sm font-medium mb-1">
                Organization name
              </label>
              <input
                id={"orgName"}
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

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setOrgName("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                disabled={isCreating}
              >
                Cancel
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
      )}

      {/* Organizations List */}
      <div className="space-y-3">
        {organizations.length === 0 ? (
          <p className="text-gray-500">No organizations yet. Create one above!</p>
        ) : (
          organizations.map((org) => (
            <div
              key={org.id}
              className={`border rounded-lg p-4 ${
                org.id === activeOrganizationId
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{org.name}</h3>
                    {org.id === activeOrganizationId && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    {org.slug && <span>Slug: {org.slug}</span>}
                    <span className="text-gray-700 font-medium capitalize">
                      Role: {org.role || "unknown"}
                    </span>
                  </div>

                  {/* Members list */}
                  {org.members && org.members.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Members ({org.members.length})
                      </div>
                      <div className="space-y-1">
                        {org.members.map((member: any) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-600">
                              {member.user?.name || member.user?.email || "Unknown user"}
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded capitalize">
                              {member.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {org.id !== activeOrganizationId && (
                  <button
                    type="button"
                    onClick={() => handleSetActive(org.id)}
                    disabled={isSwitching}
                    className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 disabled:opacity-50"
                  >
                    {isSwitching ? "Switching..." : "Set Active"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
