import type { User } from "better-auth";

export const LoggedInAs = ({ user }: { user: User }) => (
  <span className="text-sm">(Logged in as {user.name})</span>
);
