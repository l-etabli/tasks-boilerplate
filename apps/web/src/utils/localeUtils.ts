import * as z from "zod";
import type { Locales } from "@/i18n/i18n-types";

export const availableLocales: Locales[] = ["en", "fr"];
export const fallbackLocale: Locales = "fr";

/**
 * Initialize Zod with the appropriate locale for error messages
 * This should be called whenever the user's locale changes
 */
export function initZodLocale(locale: Locales): void {
  switch (locale) {
    case "en":
      z.config(z.locales.en());
      break;
    case "fr":
      z.config(z.locales.fr());
      break;
    default:
      // Fallback to configured default locale
      initZodLocale(fallbackLocale);
  }
}
