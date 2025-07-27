import type { User } from "better-auth";
import { useI18nContext } from "../i18n/i18n-react";

export const LoggedInAs = ({ user }: { user: User }) => {
  const { LL } = useI18nContext();

  return <span className="text-sm">({LL.auth.loggedInAs({ name: user.name })})</span>;
};
