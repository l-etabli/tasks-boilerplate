import { Button } from "@tasks/ui/components/button";
import { authClient } from "@/auth-client";

export function LogoutButton() {
  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  return (
    <Button
      type="button"
      onClick={handleLogout}
      variant="outline"
      className="border-white/30 text-white hover:bg-white/10"
    >
      Sign Out
    </Button>
  );
}
