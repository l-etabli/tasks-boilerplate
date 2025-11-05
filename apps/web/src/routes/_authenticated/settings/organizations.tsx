import { useForm } from "@tanstack/react-form";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { sanitizeSlug } from "@tasks/core";
import { Button } from "@tasks/ui/components/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@tasks/ui/components/field";
import { Input } from "@tasks/ui/components/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@tasks/ui/components/tooltip";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { authClient } from "@/auth-client";
import { EditOrganizationDialog } from "@/components/organization/edit-organization-dialog";
import { InviteMemberDialog } from "@/components/organization/invite-member-dialog";
import { OrganizationMembersList } from "@/components/organization/organization-members-list";
import { PendingInvitationsList } from "@/components/organization/pending-invitations-list";
import { UserInvitationsCard } from "@/components/organization/user-invitations-card";
import { useI18nContext } from "@/i18n/i18n-react";
import { getCurrentUserInvitations } from "@/server/functions/user";

const organizationSchema = z.object({
  name: z.string().min(1).max(100),
});

export const Route = createFileRoute("/_authenticated/settings/organizations")({
  component: OrganizationsSettings,
  loader: async () => {
    const userInvitations = await getCurrentUserInvitations();
    return { userInvitations };
  },
});

function OrganizationsSettings() {
  const router = useRouter();
  const { organizations, currentUser } = Route.useRouteContext();
  const { userInvitations } = Route.useLoaderData();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const selectedOrganization =
    selectedOrgId && organizations.find((org) => org.id === selectedOrgId);

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
        const slug = sanitizeSlug(value.name);
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

  const handleOpenInviteDialog = (orgId: string) => {
    setSelectedOrgId(orgId);
    setInviteDialogOpen(true);
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

      {/* User Pending Invitations */}
      <UserInvitationsCard invitations={userInvitations} />

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
          organizations.map((org) => {
            const currentUserRoleInOrg = org.members.find(
              (member) => member.userId === currentUser.id,
            )?.role;

            if (!currentUserRoleInOrg)
              throw new Error("Current user is not a member of the organization");

            return (
              <div
                key={org.id}
                className="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{org.name}</h3>
                    <div className="flex items-center gap-1">
                      {["owner", "admin"].includes(currentUserRoleInOrg) && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleOpenInviteDialog(org.id)}
                            >
                              <UserPlus className="h-4 w-4" />
                              <span className="sr-only">{t.inviteButton()}</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t.inviteButton()}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {currentUserRoleInOrg === "owner" && (
                        <EditOrganizationDialog organization={org} />
                      )}
                    </div>
                  </div>

                  {/* Members list */}
                  {org.members && org.members.length > 0 && (
                    <OrganizationMembersList organization={org} currentUser={currentUser} />
                  )}

                  {/* Pending Invitations list */}
                  <PendingInvitationsList
                    invitations={org.invitations}
                    userRole={
                      org.members.find((member) => member.userId === currentUser.id)?.role ?? null
                    }
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Invite Member Dialog */}
      {selectedOrganization && (
        <InviteMemberDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          organization={selectedOrganization}
        />
      )}
    </div>
  );
}
