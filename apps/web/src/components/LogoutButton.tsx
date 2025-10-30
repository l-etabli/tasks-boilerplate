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
      variant="secondary"
      className="bg-gray-700 text-white hover:bg-gray-600"
    >
      Sign Out
    </Button>
  );
}
