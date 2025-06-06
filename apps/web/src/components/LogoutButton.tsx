import { authClient } from "@/auth-client";
import { useNavigate } from "@tanstack/react-router";

export const LogoutButton = () => {
  const navigate = useNavigate();

  return (
    <button
      className="font-bold"
      type="button"
      onClick={async () => {
        await authClient.signOut();
        navigate({ to: "/" });
      }}
    >
      Logout
    </button>
  );
};
