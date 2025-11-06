import type { InvitationDetails } from "@tasks/core";
import { Alert, AlertDescription, AlertTitle } from "@tasks/ui/components/alert";
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
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { useI18nContext } from "@/i18n/i18n-react";
import { translateRole } from "@/utils/translateRole";

type InvitationAcceptanceCardProps = {
  invitation: InvitationDetails | null;
  invitationId: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  onAccept: () => Promise<void>;
  onReject: () => Promise<void>;
  onSignOut: () => void;
  onAcceptAnyway: () => Promise<void>;
  successMessage?: string;
  currentUserEmail?: string;
  showMismatchConfirmation: boolean;
  emailsMatch?: boolean;
};

export function InvitationAcceptanceCard({
  invitation,
  invitationId,
  isAuthenticated,
  isLoading,
  error,
  onAccept,
  onReject,
  onSignOut,
  onAcceptAnyway,
  successMessage,
  currentUserEmail,
  showMismatchConfirmation,
}: InvitationAcceptanceCardProps) {
  const { LL } = useI18nContext();
  const t = LL.invitation;
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAccept();
    } finally {
      setIsAccepting(false);
    }
  };

  const handleAcceptAnyway = async () => {
    setIsAccepting(true);
    try {
      await onAcceptAnyway();
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      await onReject();
    } finally {
      setIsRejecting(false);
    }
  };

  // Calculate hours until expiration
  const getHoursUntilExpiration = (expiresAt: Date) => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t.pageTitle()}</h1>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-1/2" />
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="flex items-start gap-3 rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-400">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        {/* Error State */}
        {error && !successMessage && (
          <div className="flex items-start gap-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Invitation Details */}
        {invitation && !successMessage && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.youveBeenInvited()}</p>
              <p className="text-2xl font-semibold">{invitation.organizationName}</p>
              {invitation.role && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.asRole({ role: translateRole({ role: invitation.role, LL }) })}
                </p>
              )}
            </div>

            {/* Show invitation email */}
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.invitationFor({ email: invitation.email })}
              </p>
            </div>

            <div className="border-t border-gray-200 dark:border-slate-700 pt-4 space-y-2">
              <div className="text-sm">
                <span className="text-gray-600 dark:text-gray-400">{t.invitedBy()}: </span>
                <span className="font-medium">
                  {invitation.inviterName || invitation.inviterEmail}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {t.expiresIn({ hours: getHoursUntilExpiration(invitation.expiresAt) })}
              </div>
            </div>

            {/* Action Buttons */}
            {!isAuthenticated ? (
              <div className="space-y-3">
                <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                  {t.signInToAccept()}
                </p>
                <AuthForm callbackURL={`/accept-invitation/${invitationId}`} />
              </div>
            ) : showMismatchConfirmation ? (
              // Show email mismatch confirmation dialog
              <div className="space-y-4">
                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{t.emailMismatchTitle()}</AlertTitle>
                  <AlertDescription>
                    {t.emailMismatchDescription({
                      invitedEmail: invitation.email,
                      currentEmail: currentUserEmail || "",
                    })}
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Button
                    id="btn-accept-anyway"
                    onClick={handleAcceptAnyway}
                    disabled={isAccepting || isRejecting}
                    className="w-full"
                    size="lg"
                  >
                    {isAccepting ? t.accepting() : t.acceptAnyway()}
                  </Button>
                  <Button
                    id="btn-sign-out-mismatch"
                    onClick={onSignOut}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    {t.signOutAndRetry()}
                  </Button>
                </div>
              </div>
            ) : (
              // Authenticated - show accept/reject buttons
              <div className="space-y-2">
                <Button
                  id="btn-accept-invitation"
                  onClick={handleAccept}
                  disabled={isAccepting || isRejecting}
                  className="w-full"
                  size="lg"
                >
                  {isAccepting ? t.accepting() : t.acceptButton()}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      id="btn-reject-invitation"
                      variant="outline"
                      disabled={isAccepting || isRejecting}
                      className="w-full"
                    >
                      {isRejecting ? t.rejecting() : t.rejectButton()}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t.rejectConfirmTitle()}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t.rejectConfirmDescription({ orgName: invitation.organizationName })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel id="btn-cancel-reject-invitation">
                        {t.rejectCancelButton()}
                      </AlertDialogCancel>
                      <AlertDialogAction id="btn-confirm-reject-invitation" onClick={handleReject}>
                        {t.rejectConfirmButton()}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
