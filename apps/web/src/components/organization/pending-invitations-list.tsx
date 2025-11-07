import { useRouter } from "@tanstack/react-router";
import type { OrganizationInvitation, OrganizationRole } from "@tasks/core";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@tasks/ui/components/tooltip";
import { Check, Copy, Trash2 } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/auth-client";
import { useI18nContext } from "@/i18n/i18n-react";
import { translateRole } from "@/utils/translateRole";
import { buildUrl } from "@/utils/url-builder";

type PendingInvitationsListProps = {
  invitations: OrganizationInvitation[];
  userRole: OrganizationRole | null;
};

export function PendingInvitationsList({ invitations, userRole }: PendingInvitationsListProps) {
  const router = useRouter();
  const { LL } = useI18nContext();
  const t = LL.settings.organizations;
  const [cancelingInvitationId, setCancelingInvitationId] = useState<string | null>(null);
  const [copiedInvitationId, setCopiedInvitationId] = useState<string | null>(null);

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

  const handleCopyInvitationLink = async (invitationId: string) => {
    try {
      const pathname = buildUrl("/accept-invitation/$invitationId", {
        invitationId,
      });
      const invitationUrl = `${window.location.origin}${pathname}`;

      await navigator.clipboard.writeText(invitationUrl);
      setCopiedInvitationId(invitationId);

      setTimeout(() => {
        setCopiedInvitationId(null);
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t.copyInviteLinkError();
      toast.error(errorMessage);
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
              <div className="flex items-center gap-3">
                {invitation.role && (
                  <span className="w-24 text-xs bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded capitalize text-center">
                    {translateRole({ role: invitation.role, LL })}
                  </span>
                )}
                <span className="flex-1 text-gray-600 dark:text-gray-400">{invitation.email}</span>
                {canCancelInvitations && (
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {copiedInvitationId === invitation.id ? (
                          <div className="flex items-center justify-center h-8 w-8 p-0">
                            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="sr-only">{t.copyInviteLinkTooltip()}</span>
                          </div>
                        ) : (
                          <Button
                            id={`btn-copy-invitation-link-${invitation.id}`}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleCopyInvitationLink(invitation.id)}
                          >
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">{t.copyInviteLinkTooltip()}</span>
                          </Button>
                        )}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t.copyInviteLinkTooltip()}</p>
                      </TooltipContent>
                    </Tooltip>
                    <AlertDialog>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertDialogTrigger asChild>
                            <Button
                              id={`btn-cancel-invitation-${invitation.id}`}
                              variant="ghost"
                              size="sm"
                              disabled={cancelingInvitationId === invitation.id}
                              className="h-auto py-1 px-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">{t.cancelInviteTooltip()}</span>
                            </Button>
                          </AlertDialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t.cancelInviteTooltip()}</p>
                        </TooltipContent>
                      </Tooltip>
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
                  </div>
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
