import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { navigatorDetector } from "typesafe-i18n/detectors";
import TypesafeI18n from "@/i18n/i18n-react";
import type { Locales } from "@/i18n/i18n-types";
import { detectLocale } from "@/i18n/i18n-util";
import { loadLocale } from "@/i18n/i18n-util.sync";
import { setClientPreferences } from "@/utils/preferences";

interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: Locales | null;
  onLocaleChange?: (locale: Locales) => void;
}

type LocaleContextValue = {
  availableLocales: Locales[];
  locale: Locales;
  setLocale: (locale: Locales) => void;
};

const availableLocales: Locales[] = ["en", "fr"];
const fallbackLocale: Locales = "en";

const LocaleContext = createContext<LocaleContextValue | null>(null);

function getClientLocale(): Locales {
  return detectLocale(navigatorDetector);
}

function normalizeInitialLocale(locale?: Locales | null): Locales {
  if (locale && availableLocales.includes(locale)) {
    return locale;
  }

  return fallbackLocale;
}

export function I18nProvider({ children, initialLocale, onLocaleChange }: I18nProviderProps) {
  const normalizedInitialLocale = useMemo(
    () => normalizeInitialLocale(initialLocale),
    [initialLocale],
  );

  const [locale, setLocaleState] = useState<Locales>(normalizedInitialLocale);
  const [hasManualSelection, setHasManualSelection] = useState(false);

  loadLocale(locale);

  useEffect(() => {
    if (!initialLocale && !hasManualSelection) {
      const clientLocale = getClientLocale();
      if (clientLocale !== locale) {
        loadLocale(clientLocale);
        setLocaleState(clientLocale);
      }
    }
  }, [initialLocale, locale, hasManualSelection]);

  useEffect(() => {
    if (
      initialLocale &&
      availableLocales.includes(initialLocale) &&
      !hasManualSelection &&
      initialLocale !== locale
    ) {
      loadLocale(initialLocale);
      setLocaleState(initialLocale);
    }
  }, [initialLocale, locale, hasManualSelection]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback(
    (newLocale: Locales) => {
      if (availableLocales.includes(newLocale) && newLocale !== locale) {
        loadLocale(newLocale);
        setLocaleState(newLocale);
        setHasManualSelection(true);
        setClientPreferences({ locale: newLocale });
        onLocaleChange?.(newLocale);
      }
    },
    [locale, onLocaleChange],
  );

  const value: LocaleContextValue = useMemo(
    () => ({
      availableLocales,
      locale,
      setLocale,
    }),
    [locale, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>
      <TypesafeI18n key={locale} locale={locale}>
        {children}
      </TypesafeI18n>
    </LocaleContext.Provider>
  );
}

export function useLocaleManager() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocaleManager must be used within an I18nProvider");
  }
  return context;
}
