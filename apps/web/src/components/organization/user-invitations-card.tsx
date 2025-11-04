import { Badge } from "@tasks/ui/components/badge";
import { Button } from "@tasks/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tasks/ui/components/dialog";
import { Skeleton } from "@tasks/ui/components/skeleton";
import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/auth-client";
import { useHandleInvitationAction } from "@/hooks/use-handle-invitation-action";
import { useI18nContext } from "@/i18n/i18n-react";

interface UserInvitation {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string | null;
  inviterEmail: string;
  role: string;
  expiresAt: Date;
  status: string;
}

interface UserInvitationsCardProps {
  refreshTrigger?: number;
}

function formatTimeRemaining(expiresAt: Date, t: any): string {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();

  if (diff <= 0) {
    return t.time.expired();
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return t.time.days({ count: days });
  }
  if (hours > 0) {
    return t.time.hours({ count: hours });
  }
  if (minutes > 0) {
    return t.time.minutes({ count: minutes });
  }

  return t.time.justNow();
}

export function UserInvitationsCard({ refreshTrigger }: UserInvitationsCardProps) {
  const { LL } = useI18nContext();
  const t = LL.invitations.userInvitations;
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<UserInvitation | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { accepting, rejecting, acceptInvitation, rejectInvitation } = useHandleInvitationAction();

  // Update time every minute for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const loadInvitations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await authClient.organization.listUserInvitations();

      if (result.error) {
        setError(result.error.message || t.errorLoad());
        return;
      }

      if (result.data) {
        setInvitations(
          result.data.map((inv: any) => ({
            ...inv,
            expiresAt: new Date(inv.expiresAt),
          })),
        );
      }
    } catch (err) {
      console.error("Failed to load user invitations:", err);
      setError(t.errorLoad());
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations, refreshTrigger]);

  const handleAccept = async (invitation: UserInvitation) => {
    // Optimistic update
    setInvitations((prev) => prev.filter((inv) => inv.id !== invitation.id));

    const success = await acceptInvitation(invitation.id, invitation.organizationName);

    if (success) {
      setSuccessMessage(t.successAccept({ organization: invitation.organizationName }));
      setTimeout(() => setSuccessMessage(null), 5000);
    } else {
      // Reload invitations on error
      await loadInvitations();
    }
  };

  const handleRejectClick = (invitation: UserInvitation) => {
    setSelectedInvitation(invitation);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedInvitation) return;

    setRejectDialogOpen(false);

    // Optimistic update
    setInvitations((prev) => prev.filter((inv) => inv.id !== selectedInvitation.id));

    const success = await rejectInvitation(selectedInvitation.id);

    if (success) {
      setSuccessMessage(t.successReject());
      setTimeout(() => setSuccessMessage(null), 5000);
    } else {
      // Reload invitations on error
      await loadInvitations();
    }

    setSelectedInvitation(null);
  };

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h3 className="mb-4 text-lg font-medium">{t.heading()}</h3>
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (invitations.length === 0 && !error && !successMessage) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
      <h3 className="mb-4 text-lg font-medium">{t.heading()}</h3>

      {successMessage && (
        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {invitations.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">{t.empty()}</p>
      )}

      <div className="space-y-4">
        {invitations.map((invitation) => {
          const isExpired = invitation.expiresAt.getTime() <= currentTime.getTime();
          const timeRemaining = formatTimeRemaining(invitation.expiresAt, LL.invitations);

          return (
            <div
              key={invitation.id}
              className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{invitation.organizationName}</span>
                  <Badge variant="outline">
                    {LL.invitations.roles[
                      invitation.role as keyof typeof LL.invitations.roles
                    ]?.() || invitation.role}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t.invitedBy({ inviter: invitation.inviterEmail })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isExpired ? (
                    <Badge variant="destructive" className="text-xs">
                      {LL.invitations.time.expired()}
                    </Badge>
                  ) : (
                    t.expires({ time: timeRemaining })
                  )}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  id={`btn-reject-invitation-${invitation.id}`}
                  variant="outline"
                  size="sm"
                  onClick={() => handleRejectClick(invitation)}
                  disabled={accepting || rejecting || isExpired}
                >
                  {rejecting ? t.rejecting() : t.rejectButton()}
                </Button>
                <Button
                  id={`btn-accept-invitation-${invitation.id}`}
                  size="sm"
                  onClick={() => handleAccept(invitation)}
                  disabled={accepting || rejecting || isExpired}
                >
                  {accepting ? t.accepting() : t.acceptButton()}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{LL.invitations.acceptPage.rejectDialogTitle()}</DialogTitle>
            <DialogDescription>
              {selectedInvitation &&
                LL.invitations.acceptPage.rejectDialogDescription({
                  organization: selectedInvitation.organizationName,
                })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              id="btn-reject-dialog-cancel"
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              {LL.invitations.acceptPage.rejectDialogCancel()}
            </Button>
            <Button
              id="btn-reject-dialog-confirm"
              variant="destructive"
              onClick={handleRejectConfirm}
            >
              {LL.invitations.acceptPage.rejectDialogConfirm()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
