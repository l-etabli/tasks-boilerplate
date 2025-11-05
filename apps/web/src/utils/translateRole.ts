import type { OrganizationRole } from "@tasks/core";
import type { TranslationFunctions } from "@/i18n/i18n-types";

export const translateRole = ({
  role,
  LL,
}: {
  role: OrganizationRole;
  LL: TranslationFunctions;
}): string => {
  const t = LL.settings.organizations;
  const roleTranslations: Record<OrganizationRole, string> = {
    member: t.roleMember(),
    admin: t.roleAdmin(),
    owner: t.roleOwner(),
  };
  return roleTranslations[role];
};
