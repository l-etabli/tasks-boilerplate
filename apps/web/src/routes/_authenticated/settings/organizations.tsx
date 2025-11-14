import { createFileRoute } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@tasks/ui/components/avatar";
import { Button } from "@tasks/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@tasks/ui/components/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@tasks/ui/components/tooltip";
import { MoreVertical, Pencil, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { CreateOrganizationModal } from "@/components/organization/create-organization-modal";
import { DeleteOrganizationDialog } from "@/components/organization/delete-organization-dialog";
import { EditOrganizationDialog } from "@/components/organization/edit-organization-dialog";
import { InviteMemberDialog } from "@/components/organization/invite-member-dialog";
import { OrganizationMembersList } from "@/components/organization/organization-members-list";
import { PendingInvitationsList } from "@/components/organization/pending-invitations-list";
import { UserInvitationsCard } from "@/components/organization/user-invitations-card";
import { useI18nContext } from "@/i18n/i18n-react";
import { getCurrentUserInvitations } from "@/server/functions/user";

export const Route = createFileRoute("/_authenticated/settings/organizations")({
  component: OrganizationsSettings,
  loader: async () => {
    const userInvitations = await getCurrentUserInvitations();
    return { userInvitations };
  },
});

function OrganizationsSettings() {
  const { organizations, currentUser } = Route.useRouteContext();
  const { userInvitations } = Route.useLoaderData();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrgForAction, setSelectedOrgForAction] = useState<string | null>(null);

  const selectedOrganization =
    selectedOrgId && organizations.find((org) => org.id === selectedOrgId);

  const organizationForAction =
    selectedOrgForAction && organizations.find((org) => org.id === selectedOrgForAction);

  const { LL } = useI18nContext();
  const t = LL.settings.organizations;

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
        <Button
          id="btn-show-create-org-form"
          type="button"
          onClick={() => setCreateModalOpen(true)}
        >
          {t.createButton()}
        </Button>
      </div>

      {/* User Pending Invitations */}
      <UserInvitationsCard invitations={userInvitations} />

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
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {org.logo && <AvatarImage src={org.logo} alt={org.name} />}
                        <AvatarFallback>{org.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold">{org.name}</h3>
                    </div>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">{t.organizationActions()}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedOrgForAction(org.id);
                                setEditDialogOpen(true);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              {t.editOrganization()}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedOrgForAction(org.id);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t.deleteOrganization()}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      {/* Edit Organization Dialog */}
      {organizationForAction && (
        <EditOrganizationDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          organization={organizationForAction}
        />
      )}

      {/* Delete Organization Dialog */}
      {organizationForAction && (
        <DeleteOrganizationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          organization={organizationForAction}
        />
      )}

      {/* Create Organization Modal */}
      <CreateOrganizationModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </div>
  );
}
