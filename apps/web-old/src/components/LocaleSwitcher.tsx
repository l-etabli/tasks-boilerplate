import { useMutation } from "@tanstack/react-query";
import { Globe } from "lucide-react";
import { updateUserPreferences } from "@/server/functions/user";
import { useI18nContext } from "../i18n/i18n-react";
import { useLocaleManager } from "../providers/I18nProvider";
import { useSession } from "../providers/SessionProvider";

const localeNames = {
  en: "English",
  fr: "Français",
} as const;

export function LocaleSwitcher() {
  const { locale } = useI18nContext();
  const { setLocale, availableLocales } = useLocaleManager();
  const { session } = useSession();

  const updatePreferencesMutation = useMutation({
    mutationFn: updateUserPreferences,
  });

  const handleLocaleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = event.target.value;
    setLocale(newLocale as any);

    // Only save preference to database if user is authenticated
    if (session?.user) {
      updatePreferencesMutation.mutate({
        data: {
          preferredLocale: newLocale as "en" | "fr",
        },
      });
    }
  };

  return (
    <div className="relative">
      <select
        value={locale}
        onChange={handleLocaleChange}
        className="appearance-none bg-transparent border-none pl-8 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md hover:bg-gray-100 transition-colors cursor-pointer text-sm"
        aria-label="Change language"
      >
        {availableLocales.map((loc) => (
          <option key={loc} value={loc}>
            {localeNames[loc]}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
        <Globe size={16} className="text-gray-600" />
      </div>
    </div>
  );
}
