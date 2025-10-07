import { useNavigate } from "@tanstack/react-router";
import { authClient } from "@/auth-client";
import { useI18nContext } from "../i18n/i18n-react";

export const LogoutButton = () => {
  const navigate = useNavigate();
  const { LL } = useI18nContext();

  return (
    <button
      className="font-bold"
      type="button"
      onClick={async () => {
        await authClient.signOut();
        navigate({ to: "/" });
      }}
    >
      {LL.auth.logout()}
    </button>
  );
};
