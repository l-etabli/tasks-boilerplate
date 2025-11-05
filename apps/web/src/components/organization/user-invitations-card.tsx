import { useRouter } from "@tanstack/react-router";
import type { InvitationDetails } from "@tasks/core";
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

type UserInvitationsCardProps = {
  invitations: InvitationDetails[];
};

export function UserInvitationsCard({ invitations }: UserInvitationsCardProps) {
  const router = useRouter();
  const { LL } = useI18nContext();
  const t = LL.settings.organizations;
  const [processingInvitationId, setProcessingInvitationId] = useState<string | null>(null);

  const handleAcceptInvitation = async (invitationId: string) => {
    setProcessingInvitationId(invitationId);

    try {
      await authClient.organization.acceptInvitation({ invitationId });
      toast.success(t.acceptInviteSuccess());
      router.invalidate();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t.acceptInviteError();
      toast.error(errorMessage);
    } finally {
      setProcessingInvitationId(null);
    }
  };

  const handleRejectInvitation = async (invitationId: string) => {
    setProcessingInvitationId(invitationId);

    try {
      await authClient.organization.rejectInvitation({ invitationId });
      toast.success(t.rejectInviteSuccess());
      router.invalidate();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t.rejectInviteError();
      toast.error(errorMessage);
    } finally {
      setProcessingInvitationId(null);
    }
  };

  if (invitations.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">
        {t.pendingInvitationsHeading({ count: invitations.length })}
      </h3>
      <div className="space-y-4">
        {invitations.map((invitation) => {
          const now = new Date();
          const expiresAt = new Date(invitation.expiresAt);
          const hoursLeft = Math.max(
            0,
            Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)),
          );

          return (
            <div
              key={invitation.id}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {invitation.organizationName}
                  </span>
                  {invitation.role && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded capitalize">
                      {invitation.role}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {t.invitedBy()} {invitation.inviterName || invitation.inviterEmail} ·{" "}
                  {t.expiresIn()} {hoursLeft}h
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  id={`btn-accept-invitation-${invitation.id}`}
                  variant="default"
                  size="sm"
                  onClick={() => handleAcceptInvitation(invitation.id)}
                  disabled={processingInvitationId === invitation.id}
                  className="h-8"
                >
                  {processingInvitationId === invitation.id
                    ? t.acceptInviteAccepting()
                    : t.acceptInviteButton()}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      id={`btn-reject-invitation-${invitation.id}`}
                      variant="ghost"
                      size="sm"
                      disabled={processingInvitationId === invitation.id}
                      className="h-8"
                    >
                      {t.rejectInviteButton()}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t.rejectInviteDialogTitle()}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t.rejectInviteDialogDescription({
                          organizationName: invitation.organizationName,
                        })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel id={`btn-keep-user-invitation-${invitation.id}`}>
                        {t.rejectInviteCancel()}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        id={`btn-confirm-reject-invitation-${invitation.id}`}
                        onClick={() => handleRejectInvitation(invitation.id)}
                      >
                        {t.rejectInviteConfirm()}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
