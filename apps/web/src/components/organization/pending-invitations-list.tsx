import { useRouter } from "@tanstack/react-router";
import type { OrganizationInvitation } from "@tasks/core";
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
import { toast } from "@tasks/ui/components/sonner";
import { useState } from "react";
import { authClient } from "@/auth-client";
import { useI18nContext } from "@/i18n/i18n-react";

type PendingInvitationsListProps = {
  invitations: OrganizationInvitation[];
  userRole: string | null;
};

export function PendingInvitationsList({ invitations, userRole }: PendingInvitationsListProps) {
  const router = useRouter();
  const { LL } = useI18nContext();
  const t = LL.settings.organizations;
  const [cancelingInvitationId, setCancelingInvitationId] = useState<string | null>(null);

  const canCancelInvitations = userRole === "owner" || userRole === "admin";

  const handleCancelInvitation = async (invitationId: string) => {
    setCancelingInvitationId(invitationId);

    try {
      await authClient.organization.cancelInvitation({ invitationId });
      toast.success(t.cancelInviteSuccess());
      router.invalidate();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t.cancelInviteError();
      toast.error(errorMessage);
    } finally {
      setCancelingInvitationId(null);
    }
  };

  if (invitations.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {t.invitationsHeading({ count: invitations.length })}
      </div>
      <div className="space-y-2">
        {invitations.map((invitation) => {
          const now = new Date();
          const expiresAt = new Date(invitation.expiresAt);
          const hoursLeft = Math.max(
            0,
            Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)),
          );

          return (
            <div key={invitation.id} className="text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">{invitation.email}</span>
                  {invitation.role && (
                    <span className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded capitalize">
                      {invitation.role}
                    </span>
                  )}
                </div>
                {canCancelInvitations && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        id={`btn-cancel-invitation-${invitation.id}`}
                        variant="ghost"
                        size="sm"
                        disabled={cancelingInvitationId === invitation.id}
                        className="h-auto py-1 px-2 text-xs"
                      >
                        {cancelingInvitationId === invitation.id
                          ? t.cancelInviteCanceling()
                          : t.cancelInviteButton()}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t.cancelInviteDialogTitle()}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t.cancelInviteDialogDescription({ email: invitation.email })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel id={`btn-keep-invitation-${invitation.id}`}>
                          {t.cancelInviteCancel()}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          id={`btn-confirm-cancel-invitation-${invitation.id}`}
                          onClick={() => handleCancelInvitation(invitation.id)}
                        >
                          {t.cancelInviteConfirm()}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                {t.invitedBy()} {invitation.inviterName || invitation.inviterEmail} ·{" "}
                {t.expiresIn()} {hoursLeft}h
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
