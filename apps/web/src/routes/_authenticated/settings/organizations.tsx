import { useForm } from "@tanstack/react-form";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Button } from "@tasks/ui/components/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@tasks/ui/components/field";
import { Input } from "@tasks/ui/components/input";
import { useState } from "react";
import { z } from "zod";
import { authClient } from "@/auth-client";
import { useI18nContext } from "@/i18n/i18n-react";

const organizationSchema = z.object({
  name: z.string().min(1).max(100),
});

export const Route = createFileRoute("/_authenticated/settings/organizations")({
  component: OrganizationsSettings,
});

function OrganizationsSettings() {
  const router = useRouter();
  const { organizations, activeOrganizationId } = Route.useRouteContext();
  const [isSwitching, setIsSwitching] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const { LL } = useI18nContext();
  const t = LL.settings.organizations;

  const form = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onChange: organizationSchema,
    },
    onSubmit: async ({ value }) => {
      setMessage(null);
      try {
        const slug = value.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
        await authClient.organization.create({
          name: value.name,
          slug,
        });

        setMessage({ type: "success", text: t.successCreate() });
        setShowCreateForm(false);
        form.reset();
        router.invalidate();
      } catch (err) {
        setMessage({
          type: "error",
          text: err instanceof Error ? err.message : t.errorCreate(),
        });
      }
    },
  });

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
          <Button
            id="btn-show-create-org-form"
            type="button"
            onClick={() => setShowCreateForm(true)}
          >
            {t.createButton()}
          </Button>
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
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-3"
          >
            <form.Field name="name">
              {(field) => (
                <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                  <FieldLabel htmlFor="orgName">{t.nameLabel()}</FieldLabel>
                  <Input
                    id="orgName"
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder={t.namePlaceholder()}
                    aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                  />
                  <FieldDescription>{t.slugHint()}</FieldDescription>
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              )}
            </form.Field>

            <div className="flex gap-2 pt-2">
              <Button
                id="btn-cancel-create-org"
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  form.reset();
                }}
                variant="outline"
                className="flex-1"
              >
                {t.cancel()}
              </Button>
              <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                  <Button
                    id="btn-submit-create-org"
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? t.creating() : t.create()}
                  </Button>
                )}
              </form.Subscribe>
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
                  <Button
                    id="btn-set-active-org"
                    data-org-id={org.id}
                    type="button"
                    onClick={() => handleSetActive(org.id)}
                    disabled={isSwitching}
                    variant="outline"
                  >
                    {isSwitching ? t.switching() : t.setActive()}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
