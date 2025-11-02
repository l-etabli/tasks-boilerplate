import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/auth-client";
import { useI18nContext } from "@/i18n/i18n-react";

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
  const { LL } = useI18nContext();
  const t = LL.settings.organizations;

  const handleSetActive = async (orgId: string) => {
    setIsSwitching(true);
    setMessage(null);

    try {
      await authClient.organization.setActive({ organizationId: orgId });
      setMessage({ type: "success", text: t.successSwitch() });
      router.invalidate();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : t.errorSwitch(),
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

      setMessage({ type: "success", text: t.successCreate() });
      setShowCreateForm(false);
      setOrgName("");
      router.invalidate();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : t.errorCreate(),
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{t.heading()}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t.count({ count: organizations.length })}
          </p>
        </div>
        {!showCreateForm && (
          <button
            id="btn-show-create-org-form"
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {t.createButton()}
          </button>
        )}
      </div>

      {message && (
        <div
          className={`p-3 rounded ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
              : "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Create Organization Form */}
      {showCreateForm && (
        <div className="border border-gray-200 dark:border-slate-800 rounded-lg p-4 bg-gray-50 dark:bg-slate-900">
          <h3 className="font-semibold mb-3">{t.createHeading()}</h3>
          <form
            id="form-create-organization"
            onSubmit={handleCreateOrganization}
            className="space-y-3"
          >
            <div>
              <label htmlFor={"orgName"} className="block text-sm font-medium mb-1">
                {t.nameLabel()}
              </label>
              <input
                id={"orgName"}
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder={t.namePlaceholder()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isCreating}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.slugHint()}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                id="btn-cancel-create-org"
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setOrgName("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50"
                disabled={isCreating}
              >
                {t.cancel()}
              </button>
              <button
                id="btn-submit-create-org"
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={isCreating || !orgName.trim()}
              >
                {isCreating ? t.creating() : t.create()}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Organizations List */}
      <div className="space-y-3">
        {organizations.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">{t.none()}</p>
        ) : (
          organizations.map((org) => (
            <div
              key={org.id}
              className={`border rounded-lg p-4 ${
                org.id === activeOrganizationId
                  ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950"
                  : "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{org.name}</h3>
                    {org.id === activeOrganizationId && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                        {t.activeBadge()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {org.slug && (
                      <span>
                        {t.slugLabel()} {org.slug}
                      </span>
                    )}
                    <span className="text-gray-700 dark:text-gray-300 font-medium capitalize">
                      {t.roleLabel({ role: org.role ?? t.roleUnknown() })}
                    </span>
                  </div>

                  {/* Members list */}
                  {org.members && org.members.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t.membersHeading({ count: org.members.length })}
                      </div>
                      <div className="space-y-1">
                        {org.members.map((member: any) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-600 dark:text-gray-400">
                              {member.user?.name || member.user?.email || t.memberUnknown()}
                            </span>
                            <span className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded capitalize">
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
                    id="btn-set-active-org"
                    data-org-id={org.id}
                    type="button"
                    onClick={() => handleSetActive(org.id)}
                    disabled={isSwitching}
                    className="px-4 py-2 border border-blue-500 dark:border-blue-400 text-blue-500 dark:text-blue-400 rounded hover:bg-blue-50 dark:hover:bg-blue-950 disabled:opacity-50"
                  >
                    {isSwitching ? t.switching() : t.setActive()}
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
