import { type ReactNode, createContext, useContext, useEffect, useState } from "react";
import { navigatorDetector } from "typesafe-i18n/detectors";
import TypesafeI18n from "../i18n/i18n-react";
import type { Locales } from "../i18n/i18n-types";
import { detectLocale } from "../i18n/i18n-util";
import { loadLocale } from "../i18n/i18n-util.sync";

interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: Locales;
}

const availableLocales: Locales[] = ["en", "fr"];
const fallbackLocale: Locales = "en";

// Context for sharing locale state across components
interface LocaleContextType {
  locale: Locales;
  setLocale: (locale: Locales) => void;
  availableLocales: Locales[];
}

const LocaleContext = createContext<LocaleContextType | null>(null);

function getClientLocale(): Locales {
  // Check localStorage first
  if (typeof window !== "undefined") {
    const storedLocale = localStorage.getItem("locale") as Locales;
    if (storedLocale && availableLocales.includes(storedLocale)) {
      return storedLocale;
    }
  }

  // Use browser detection
  return detectLocale(navigatorDetector);
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  // Start with the provided initialLocale (from server/user preferences) or fallback
  const [locale, setLocaleState] = useState<Locales>(initialLocale || fallbackLocale);

  // Load the initial locale synchronously
  loadLocale(locale);

  useEffect(() => {
    // Only run client-side locale detection if no initialLocale was provided
    // This means we're dealing with an anonymous user or fallback scenario
    if (!initialLocale) {
      const clientLocale = getClientLocale();
      if (clientLocale !== locale) {
        loadLocale(clientLocale);
        setLocaleState(clientLocale);
      }
    }
  }, [initialLocale, locale]);

  const setLocale = (newLocale: Locales) => {
    try {
      // Load the new locale synchronously
      loadLocale(newLocale);

      // Update React state
      setLocaleState(newLocale);

      // Persist to localStorage for anonymous users
      if (typeof window !== "undefined") {
        localStorage.setItem("locale", newLocale);
      }
    } catch (error) {
      console.error("Failed to switch locale:", error);
    }
  };

  const localeContextValue: LocaleContextType = {
    locale,
    setLocale,
    availableLocales,
  };

  return (
    <LocaleContext.Provider value={localeContextValue}>
      <TypesafeI18n key={locale} locale={locale}>
        {children}
      </TypesafeI18n>
    </LocaleContext.Provider>
  );
}

// Custom hook to manage locale switching with persistence
export function useLocaleManager() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocaleManager must be used within an I18nProvider");
  }

  return context;
}
