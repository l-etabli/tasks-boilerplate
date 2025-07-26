import { Link } from "@tanstack/react-router";
import { useSession } from "../providers/SessionProvider";
import { LoggedInAs } from "./LoggedInAs";
import { LogoutButton } from "./LogoutButton";

export default function Header() {
  return (
    <header className="p-2 flex gap-2 bg-white text-black justify-between">
      <nav className="flex flex-row">
        <div className="px-2 font-bold">
          <Link to="/">Home</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to="/demo/tanstack-query">TanStack Query</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to="/demo/start/server-funcs">Start - Server Functions</Link>
        </div>

        <div className="px-2">
          <AuthSection />
        </div>
      </nav>
    </header>
  );
}

const AuthSection = () => {
  const { session, isLoading } = useSession();

  if (isLoading) return <span>Loading...</span>;

  return (
    <>
      {session && <LoggedInAs user={session.user} />}
      {session && <LogoutButton />}
      {!session && <Link to="/login">Login</Link>}
    </>
  );
};
