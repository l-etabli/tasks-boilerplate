import { Link } from "@tanstack/react-router";
import { useI18nContext } from "../i18n/i18n-react";
import { useSession } from "../providers/SessionProvider";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { LoggedInAs } from "./LoggedInAs";
import { LogoutButton } from "./LogoutButton";

export default function Header() {
  const { LL } = useI18nContext();

  return (
    <header className="p-2 flex gap-2 bg-white text-black justify-between">
      <nav className="flex flex-row">
        <div className="px-2 font-bold">
          <Link to="/">{LL.nav.home()}</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to="/demo/tanstack-query">{LL.demo.tanstackQuery()}</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to="/demo/start/server-funcs">{LL.demo.serverFunctions()}</Link>
        </div>

        <div className="px-2">
          <AuthSection />
        </div>
      </nav>

      <div className="flex items-center gap-2">
        <LocaleSwitcher />
      </div>
    </header>
  );
}

const AuthSection = () => {
  const { session, isLoading } = useSession();
  const { LL } = useI18nContext();
  const currentUser = session?.user;

  if (isLoading) return <span>{LL.loading()}</span>;

  return (
    <>
      {currentUser && <LoggedInAs user={currentUser} />}
      {currentUser && <LogoutButton />}
      {!currentUser && <Link to="/login">{LL.auth.login()}</Link>}
    </>
  );
};
