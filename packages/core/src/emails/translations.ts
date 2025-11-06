import type { Locales } from "./emailUtils.js";

/**
 * Helper type for email translations using Record pattern
 * This ensures all locales must provide translations
 */
export type EmailTranslations<T> = Record<Locales, T>;

/**
 * Get translation for a specific locale
 * Uses Record lookup - type-safe and works with any number of locales
 */
export function getTranslation<T>(translations: EmailTranslations<T>, locale: Locales): T {
  return translations[locale];
}
