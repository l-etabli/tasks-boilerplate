import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Alert, AlertDescription, AlertTitle } from "@tasks/ui/components/alert";
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
import { AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/auth-client";
import { useHandleInvitationAction } from "@/hooks/use-handle-invitation-action";
import { useI18nContext } from "@/i18n/i18n-react";

export const Route = createFileRoute("/accept-invitation/$invitationId")({
  loader: async ({ params }) => {
    try {
      const result = await authClient.organization.getInvitation({
        invitationId: params.invitationId,
      });

      if (result.error) {
        return {
          error: result.error.message || "Failed to load invitation",
          invitation: null,
        };
      }

      return {
        error: null,
        invitation: result.data
          ? {
              ...result.data,
              expiresAt: new Date(result.data.expiresAt),
            }
          : null,
      };
    } catch (err) {
      console.error("Failed to load invitation:", err);
      return {
        error: "Failed to load invitation",
        invitation: null,
      };
    }
  },
  component: AcceptInvitationPage,
  pendingComponent: LoadingPage,
  errorComponent: ErrorPage,
});

function LoadingPage() {
  const { LL } = useI18nContext();
  const t = LL.invitations.acceptPage;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <div className="space-y-6 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="text-2xl font-bold">{t.title()}</h1>
        <div className="space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

function ErrorPage() {
  const { LL } = useI18nContext();
  const t = LL.invitations.acceptPage;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>{t.invalidTitle()}</AlertTitle>
        <AlertDescription>{t.invalidDescription()}</AlertDescription>
      </Alert>
    </div>
  );
}

function AcceptInvitationPage() {
  const { LL } = useI18nContext();
  const t = LL.invitations.acceptPage;
  const { invitationId } = Route.useParams();
  const { error, invitation } = Route.useLoaderData();
  const router = useRouter();
  const routeContext = Route.useRouteContext();
  const isAuthenticated = !!routeContext.currentUser;

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { accepting, rejecting, acceptInvitation, rejectInvitation } = useHandleInvitationAction();

  if (error || !invitation) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>{t.invalidTitle()}</AlertTitle>
          <AlertDescription>{error || t.invalidDescription()}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isExpired = invitation.expiresAt.getTime() <= Date.now();

  if (isExpired) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>{t.expiredTitle()}</AlertTitle>
          <AlertDescription>{t.expiredDescription()}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleAccept = async () => {
    const success = await acceptInvitation(invitationId, invitation.organizationName);

    if (success) {
      setSuccessMessage(t.successAccept({ organization: invitation.organizationName }));
      // Redirect to organizations settings after 2 seconds
      setTimeout(() => {
        router.navigate({ to: "/settings/organizations" });
      }, 2000);
    } else {
      setErrorMessage(t.errorAccept());
    }
  };

  const handleRejectConfirm = async () => {
    setRejectDialogOpen(false);

    const success = await rejectInvitation(invitationId);

    if (success) {
      setSuccessMessage(t.successReject());
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.navigate({ to: "/" });
      }, 2000);
    } else {
      setErrorMessage(t.errorReject());
    }
  };

  if (successMessage) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <Alert>
          <CheckCircle className="size-4" />
          <AlertTitle>{t.title()}</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
        <div className="mt-6 text-center">
          <Button onClick={() => router.navigate({ to: "/" })}>{t.goToDashboard()}</Button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <div className="space-y-6 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h1 className="text-2xl font-bold">{t.title()}</h1>

          <div className="space-y-3 rounded-lg bg-muted p-4">
            <p className="font-medium">
              {t.summaryOrganization({ name: invitation.organizationName })}
            </p>
            <p className="text-sm text-muted-foreground">
              {t.summaryInviter({ inviter: invitation.inviterEmail })}
            </p>
            <p className="text-sm">
              <Badge variant="outline">
                {LL.invitations.roles[invitation.role as keyof typeof LL.invitations.roles]?.() ||
                  invitation.role}
              </Badge>
            </p>
          </div>

          <Alert>
            <AlertCircle className="size-4" />
            <AlertTitle>{t.unauthenticatedTitle()}</AlertTitle>
            <AlertDescription>{t.unauthenticatedDescription()}</AlertDescription>
          </Alert>

          <Button
            id="btn-sign-in-to-accept"
            className="w-full"
            onClick={() => {
              router.navigate({
                to: "/login",
                search: { redirect: `/accept-invitation/${invitationId}` },
              });
            }}
          >
            {t.unauthenticatedButton()}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <div className="space-y-6 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="text-2xl font-bold">{t.title()}</h1>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3 rounded-lg bg-muted p-4">
          <p className="font-medium">
            {t.summaryOrganization({ name: invitation.organizationName })}
          </p>
          <p className="text-sm text-muted-foreground">
            {t.summaryInviter({ inviter: invitation.inviterEmail })}
          </p>
          <p className="text-sm">
            {t.summaryRole({
              role:
                LL.invitations.roles[invitation.role as keyof typeof LL.invitations.roles]?.() ||
                invitation.role,
            })}
          </p>
          <p className="text-sm text-muted-foreground">
            {t.summaryExpires({ date: invitation.expiresAt.toLocaleDateString() })}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            id="btn-reject-invitation"
            variant="outline"
            className="flex-1"
            onClick={() => setRejectDialogOpen(true)}
            disabled={accepting || rejecting}
          >
            {rejecting ? t.rejecting() : t.rejectButton()}
          </Button>
          <Button
            id="btn-accept-invitation"
            className="flex-1"
            onClick={handleAccept}
            disabled={accepting || rejecting}
          >
            {accepting ? t.accepting() : t.acceptButton()}
          </Button>
        </div>
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.rejectDialogTitle()}</DialogTitle>
            <DialogDescription>
              {t.rejectDialogDescription({ organization: invitation.organizationName })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              id="btn-reject-dialog-cancel"
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              {t.rejectDialogCancel()}
            </Button>
            <Button
              id="btn-reject-dialog-confirm"
              variant="destructive"
              onClick={handleRejectConfirm}
            >
              {t.rejectDialogConfirm()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
