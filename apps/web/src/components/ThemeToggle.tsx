import { Button } from "@tasks/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@tasks/ui/components/dropdown-menu";
import { useTheme } from "@tasks/ui/components/theme-provider";
import { Moon, Sun } from "lucide-react";
import { useCallback } from "react";
import { useI18nContext } from "@/i18n/i18n-react";
import { useCurrentUser } from "@/providers/SessionProvider";
import { updateUserPreferences } from "@/server/functions/user";

type Theme = "dark" | "light" | "system";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { LL } = useI18nContext();
  const { currentUser } = useCurrentUser();

  const handleThemeChange = useCallback(
    async (nextTheme: Theme) => {
      if (nextTheme === theme) {
        return;
      }

      setTheme(nextTheme);

      if (currentUser) {
        try {
          await updateUserPreferences({
            data: {
              theme: nextTheme,
            },
          });
        } catch (error) {
          console.error("Failed to persist theme preference:", error);
        }
      }
    },
    [currentUser, theme, setTheme],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button id="btn-theme-toggle" variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{LL.theme.toggle()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => void handleThemeChange(value as Theme)}
        >
          <DropdownMenuRadioItem id="theme-option-light" value="light">
            {LL.theme.light()}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem id="theme-option-dark" value="dark">
            {LL.theme.dark()}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem id="theme-option-system" value="system">
            {LL.theme.system()}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
