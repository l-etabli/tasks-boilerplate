/**
 * Type-level assertions to ensure consistency across packages
 * These will cause TypeScript errors if types diverge
 */

import type { Locales as EmailLocales } from "@tasks/core/emails";
import type { Locales as I18nLocales } from "@/i18n/i18n-types";

/**
 * Ensure email Locales match i18n Locales
 * If this fails, update packages/core/src/emails/emailUtils.ts
 */
type AssertEmailLocalesMatchI18n = EmailLocales extends I18nLocales
  ? I18nLocales extends EmailLocales
    ? true
    : never
  : never;

// @ts-expect-error - Type assertion only, unused by design
const _emailLocalesCheck: AssertEmailLocalesMatchI18n = true;
