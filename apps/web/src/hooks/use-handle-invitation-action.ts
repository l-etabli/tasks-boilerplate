import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/auth-client";
import { useI18nContext } from "@/i18n/i18n-react";

interface UseHandleInvitationActionResult {
  accepting: boolean;
  rejecting: boolean;
  error: string | null;
  acceptInvitation: (invitationId: string, organizationName?: string) => Promise<boolean>;
  rejectInvitation: (invitationId: string) => Promise<boolean>;
}

export function useHandleInvitationAction(): UseHandleInvitationActionResult {
  const { LL } = useI18nContext();
  const t = LL.invitations.userInvitations;
  const router = useRouter();
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptInvitation = async (
    invitationId: string,
    _organizationName?: string,
  ): Promise<boolean> => {
    setAccepting(true);
    setError(null);

    try {
      const result = await authClient.organization.acceptInvitation({
        invitationId,
      });

      if (result.error) {
        setError(result.error.message || t.errorAccept());
        return false;
      }

      // Invalidate router to refresh data
      await router.invalidate();

      return true;
    } catch (err) {
      console.error("Failed to accept invitation:", err);
      setError(t.errorAccept());
      return false;
    } finally {
      setAccepting(false);
    }
  };

  const rejectInvitation = async (invitationId: string): Promise<boolean> => {
    setRejecting(true);
    setError(null);

    try {
      const result = await authClient.organization.rejectInvitation({
        invitationId,
      });

      if (result.error) {
        setError(result.error.message || t.errorReject());
        return false;
      }

      // Invalidate router to refresh data
      await router.invalidate();

      return true;
    } catch (err) {
      console.error("Failed to reject invitation:", err);
      setError(t.errorReject());
      return false;
    } finally {
      setRejecting(false);
    }
  };

  return {
    accepting,
    rejecting,
    error,
    acceptInvitation,
    rejectInvitation,
  };
}
