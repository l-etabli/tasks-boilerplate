import { Button } from "@tasks/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@tasks/ui/components/dropdown-menu";
import { Globe } from "lucide-react";
import { useCallback } from "react";
import { useI18nContext } from "@/i18n/i18n-react";
import type { Locales } from "@/i18n/i18n-types";
import { useLocaleManager } from "@/providers/I18nProvider";
import { useCurrentUser } from "@/providers/SessionProvider";
import { updateUserPreferences } from "@/server/functions/user";

export function LocaleSwitcher() {
  const { locale, setLocale, availableLocales } = useLocaleManager();
  const { LL } = useI18nContext();
  const { currentUser } = useCurrentUser();

  const handleLocaleChange = useCallback(
    async (nextLocale: Locales) => {
      if (nextLocale === locale) {
        return;
      }

      setLocale(nextLocale);

      if (currentUser) {
        try {
          await updateUserPreferences({
            data: {
              preferredLocale: nextLocale,
            },
          });
        } catch (error) {
          console.error("Failed to persist locale preference:", error);
        }
      }
    },
    [currentUser, locale, setLocale],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{LL.locale.changeLanguage()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(value) => void handleLocaleChange(value as Locales)}
        >
          {availableLocales.map((availableLocale) => (
            <DropdownMenuRadioItem key={availableLocale} value={availableLocale}>
              {LL.locale[availableLocale]()}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
