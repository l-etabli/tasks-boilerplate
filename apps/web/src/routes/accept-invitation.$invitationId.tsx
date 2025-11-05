import { createFileRoute, useRouter } from "@tanstack/react-router";
import { toast } from "@tasks/ui/components/sonner";
import { useState } from "react";
import { authClient } from "@/auth-client";
import { InvitationAcceptanceCard } from "@/components/organization/invitation-acceptance-card";
import { useI18nContext } from "@/i18n/i18n-react";
import { getInvitationDetails } from "@/server/functions/user";

export const Route = createFileRoute("/accept-invitation/$invitationId")({
  loader: async ({ params }) => {
    const result = await getInvitationDetails({ data: { invitationId: params.invitationId } });
    return result;
  },
  component: AcceptInvitationPage,
});

function AcceptInvitationPage() {
  const { invitationId } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { LL } = useI18nContext();
  const t = LL.invitation;

  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isAuthenticated = !!session?.user;

  // Determine error message from loader data or action error
  const getErrorMessage = () => {
    if (actionError) return actionError;
    if (!loaderData.error) return null;

    switch (loaderData.error) {
      case "not_found":
        return t.errorNotFound();
      case "expired":
        return t.errorExpired();
      case "server_error":
        return t.errorServerError();
      default:
        return t.errorUnknown();
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    // After sign out, user will see the "Sign In to Accept" button
  };

  const handleAccept = async () => {
    setActionError(null);

    try {
      const { error } = await authClient.organization.acceptInvitation({
        invitationId,
      });

      if (error) {
        // Handle specific Better Auth errors by status code
        let errorMsg: string;

        // Check status code first (most reliable)
        if (error.status === 403) {
          errorMsg = t.errorEmailMismatch({
            currentEmail: session?.user?.email || "unknown",
            invitedEmail: loaderData.invitation?.email || "unknown",
          });
        } else if (String(error.message || "").includes("already a member")) {
          errorMsg = t.errorAlreadyMember();
        } else if (String(error.message || "").includes("already accepted")) {
          errorMsg = t.errorAlreadyAccepted();
        } else {
          errorMsg = t.errorUnknown();
        }

        setActionError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Success
      setSuccessMessage(t.acceptSuccess());
      toast.success(t.acceptSuccess());

      // Redirect to organization settings after a brief delay
      setTimeout(() => {
        router.navigate({ to: "/settings/organizations" });
      }, 1500);
    } catch (err) {
      console.error("Error accepting invitation:", err);
      const errorMsg = err instanceof Error ? err.message : t.errorUnknown();
      setActionError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleReject = async () => {
    setActionError(null);

    try {
      const { error } = await authClient.organization.rejectInvitation({
        invitationId,
      });

      if (error) {
        // Handle specific Better Auth errors by status code (mirror handleAccept pattern)
        let errorMsg: string;

        // Check status code first (most reliable)
        if (error.status === 403) {
          errorMsg = t.errorEmailMismatch({
            currentEmail: session?.user?.email || "unknown",
            invitedEmail: loaderData.invitation?.email || "unknown",
          });
        } else if (String(error.message || "").includes("already rejected")) {
          errorMsg = t.errorAlreadyRejected();
        } else if (String(error.message || "").includes("already a member")) {
          errorMsg = t.errorAlreadyMember();
        } else {
          errorMsg = t.errorUnknown();
        }

        setActionError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Success
      setSuccessMessage(t.rejectSuccess());
      toast.success(t.rejectSuccess());

      // Redirect to home after a brief delay
      setTimeout(() => {
        router.navigate({ to: "/" });
      }, 1500);
    } catch (err) {
      console.error("Error rejecting invitation:", err);
      const errorMsg = err instanceof Error ? err.message : t.errorUnknown();
      setActionError(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <InvitationAcceptanceCard
      invitation={loaderData.invitation}
      invitationId={invitationId}
      isAuthenticated={isAuthenticated}
      isLoading={false}
      error={getErrorMessage() || null}
      onAccept={handleAccept}
      onReject={handleReject}
      onSignOut={handleSignOut}
      successMessage={successMessage || undefined}
      currentUserEmail={session?.user?.email}
    />
  );
}
