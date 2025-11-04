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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tasks/ui/components/table";
import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/auth-client";
import { useI18nContext } from "@/i18n/i18n-react";

interface Invitation {
  id: string;
  email: string;
  role: string;
  expiresAt: Date;
  status: string;
}

interface PendingInvitationsListProps {
  organizationId: string;
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

export function PendingInvitationsList({
  organizationId,
  refreshTrigger,
}: PendingInvitationsListProps) {
  const { LL } = useI18nContext();
  const t = LL.invitations.pendingList;
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const loadInvitations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await authClient.organization.listInvitations({
        organizationId,
      });

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
      console.error("Failed to load invitations:", err);
      setError(t.errorLoad());
    } finally {
      setLoading(false);
    }
  }, [organizationId, t]);

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations, refreshTrigger]);

  const handleCancelClick = (invitation: Invitation) => {
    setSelectedInvitation(invitation);
    setDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedInvitation) return;

    setCancelingId(selectedInvitation.id);
    setDialogOpen(false);

    try {
      // Optimistic update
      setInvitations((prev) => prev.filter((inv) => inv.id !== selectedInvitation.id));

      const result = await authClient.organization.cancelInvitation({
        invitationId: selectedInvitation.id,
      });

      if (result.error) {
        // Rollback on error
        await loadInvitations();
        setError(result.error.message || t.errorCancel());
      }
    } catch (err) {
      console.error("Failed to cancel invitation:", err);
      // Rollback on error
      await loadInvitations();
      setError(t.errorCancel());
    } finally {
      setCancelingId(null);
      setSelectedInvitation(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{t.heading()}</h3>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{t.heading()}</h3>
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{t.heading()}</h3>
        <p className="text-sm text-muted-foreground">{t.empty()}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t.heading()}</h3>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.columnEmail()}</TableHead>
            <TableHead>{t.columnRole()}</TableHead>
            <TableHead>{t.columnExpires()}</TableHead>
            <TableHead className="text-right">{t.columnActions()}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => {
            const isExpired = invitation.expiresAt.getTime() <= currentTime.getTime();
            const timeRemaining = formatTimeRemaining(invitation.expiresAt, LL.invitations);

            return (
              <TableRow key={invitation.id}>
                <TableCell className="font-medium">{invitation.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {LL.invitations.roles[
                      invitation.role as keyof typeof LL.invitations.roles
                    ]?.() || invitation.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {isExpired ? (
                    <Badge variant="destructive">{t.expiredBadge()}</Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {t.expiresIn({ time: timeRemaining })}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    id={`btn-cancel-invitation-${invitation.id}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancelClick(invitation)}
                    disabled={cancelingId === invitation.id || isExpired}
                  >
                    {cancelingId === invitation.id ? t.canceling() : t.cancelButton()}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.cancelDialogTitle()}</DialogTitle>
            <DialogDescription>
              {selectedInvitation && t.cancelDialogDescription({ email: selectedInvitation.email })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              id="btn-cancel-dialog-no"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              {t.cancelDialogCancel()}
            </Button>
            <Button id="btn-cancel-dialog-yes" variant="destructive" onClick={handleCancelConfirm}>
              {t.cancelDialogConfirm()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
