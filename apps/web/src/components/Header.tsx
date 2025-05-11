import { authClient } from "@/auth-client";
import { Link } from "@tanstack/react-router";

export default function Header() {
  const { data: session } = authClient.useSession();
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
          {session && (
            <>
              <button className="font-bold" type="button" onClick={() => authClient.signOut()}>
                Logout
              </button>{" "}
              <span className="text-sm">(Logged in as {session.user.name})</span>
            </>
          )}
          {!session && (
            <button
              className="font-bold"
              type={"button"}
              onClick={() => authClient.signIn.social({ provider: "google" })}
            >
              Login with Google
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
