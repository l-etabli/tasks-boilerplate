import { authClient } from "@/auth-client";

export function LogoutButton() {
  const handleLogout = async () => {
    await authClient.signOut();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="px-4 py-2 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors"
    >
      Sign Out
    </button>
  );
}
