import { useRouter } from "@tanstack/react-router";
import type { Organization, OrganizationMember } from "@tasks/core";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@tasks/ui/components/alert-dialog";
import { Button } from "@tasks/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@tasks/ui/components/tooltip";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/auth-client";
import { useI18nContext } from "@/i18n/i18n-react";
import { translateRole } from "@/utils/translateRole";
import { ChangeRoleDialog } from "./change-role-dialog";

interface User {
  id: string;
}

interface OrganizationMembersListProps {
  organization: Organization;
  currentUser: User;
}

export function OrganizationMembersList({
  organization,
  currentUser,
}: OrganizationMembersListProps) {
  const router = useRouter();
  const { LL } = useI18nContext();
  const t = LL.settings.organizations;
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [changeRoleMember, setChangeRoleMember] = useState<OrganizationMember | null>(null);

  const currentUserRole = organization.members.find(
    (member) => member.userId === currentUser.id,
  )?.role;

  if (!currentUserRole) {
    throw new Error("Current user is not a member of the organization");
  }

  const handleRemoveMember = async (memberId: string, memberEmail: string) => {
    setRemovingMemberId(memberId);
    try {
      await authClient.organization.removeMember({
        memberIdOrEmail: memberEmail,
        organizationId: organization.id,
      });
      toast.success(t.removeMemberSuccess());
      router.invalidate();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t.removeMemberError();
      toast.error(errorMessage);
    } finally {
      setRemovingMemberId(null);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
      <div className="mb-2">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t.membersHeading({ count: organization.members.length })}
        </div>
      </div>
      <div className="space-y-1">
        {organization.members.map((member) => {
          const ownerCount = organization.members.filter((m) => m.role === "owner").length;
          const isLastOwner = member.role === "owner" && ownerCount === 1;
          const isSelf = member.userId === currentUser.id;

          // Determine if current user can remove this member
          const canRemove = (() => {
            if (isSelf) return false; // Can't remove yourself
            if (isLastOwner) return false; // Can't remove last owner

            if (currentUserRole === "owner") {
              return true; // Owners can remove anyone (except last owner)
            }

            if (currentUserRole === "admin") {
              return member.role === "member"; // Admins can only remove regular members
            }

            return false;
          })();

          // Determine if current user can change this member's role
          const canChangeRole = (() => {
            if (isSelf) return false; // Can't change own role
            if (isLastOwner) return false; // Can't change last owner's role

            if (currentUserRole === "owner") {
              return true; // Owners can change anyone's role (except last owner)
            }

            if (currentUserRole === "admin") {
              // Admins can only change roles for members (not admins or owners)
              return member.role === "member" || member.role === "admin";
            }

            return false;
          })();

          return (
            <div key={member.id} className="flex items-center gap-3 text-sm">
              <span className="w-24 text-xs bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded capitalize text-center">
                {translateRole({ role: member.role, LL })}
              </span>
              <span className="flex-1 text-gray-600 dark:text-gray-400">
                {member.name || member.email}
                {isSelf && <span className="text-gray-500 dark:text-gray-500"> (vous)</span>}
              </span>
              <div className="flex items-center gap-1">
                {canChangeRole && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                        onClick={() => setChangeRoleMember(member)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">{t.editRole()}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t.editRole()}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {canRemove && (
                  <AlertDialog>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            disabled={removingMemberId === member.id}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">{t.removeMember()}</span>
                          </Button>
                        </AlertDialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t.removeMember()}</p>
                      </TooltipContent>
                    </Tooltip>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t.removeMemberDialogTitle()}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t.removeMemberDialogDescription({
                            memberName: member.name || member.email,
                            organizationName: organization.name,
                          })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t.removeMemberCancel()}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveMember(member.id, member.email)}
                          className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                        >
                          {t.removeMemberConfirm()}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {changeRoleMember && (
        <ChangeRoleDialog
          open={changeRoleMember !== null}
          onOpenChange={(open) => {
            if (!open) setChangeRoleMember(null);
          }}
          member={changeRoleMember}
          organization={organization}
          currentUserRole={currentUserRole}
        />
      )}
    </div>
  );
}
