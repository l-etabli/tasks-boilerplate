import { authClient } from "@/auth-client";
import { Link } from "@tanstack/react-router";

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

        <div className="px-2 font-bold">
          <button
            type={"button"}
            onClick={async () => {
              const { data, error } = await authClient.signUp.email(
                {
                  email: "yolo@mail.com", // user email address
                  password: "yo123heyho", // user password -> min 8 characters by default
                  name: "Bob", // user display name
                  callbackURL: "/", // A URL to redirect to after the user verifies their email (optional)
                },
                {
                  onRequest: (_ctx) => {
                    //show loading
                  },
                  onSuccess: (_ctx) => {
                    //redirect to the dashboard or sign in page
                  },
                  onError: (ctx) => {
                    // display the error message
                    alert(ctx.error.message);
                  },
                },
              );

              console.log({
                data,
                error,
              });
            }}
          >
            Sign up
          </button>
        </div>
      </nav>
    </header>
  );
}
