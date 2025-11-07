import type { User, UserPreferences } from "@tasks/core";

const PREFERENCES_COOKIE_NAME: keyof User = "preferences";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

export const getPreferencesCookie = (cookieHeader?: string): UserPreferences => {
  const cookies = parseCookies(cookieHeader);
  const cookie = cookies[PREFERENCES_COOKIE_NAME];

  if (!cookie) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(cookie));
    return isValidPreferences(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const setPreferencesCookie = (preferences: UserPreferences): string => {
  if (!preferences) {
    return `${PREFERENCES_COOKIE_NAME}=; Path=/; Max-Age=0`;
  }

  const encoded = encodeURIComponent(JSON.stringify(preferences));
  return `${PREFERENCES_COOKIE_NAME}=${encoded}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
};

export const getClientPreferences = (): UserPreferences => {
  if (typeof window === "undefined") return null;
  return getPreferencesCookie(document.cookie);
};

export const setClientPreferences = (updates: Partial<UserPreferences>): void => {
  if (typeof window === "undefined") return;

  const current = getClientPreferences();
  const merged = mergePreferences(current, updates);

  if (!merged) {
    // biome-ignore lint/suspicious/noDocumentCookie: document.cookie needed for broad browser support
    document.cookie = setPreferencesCookie(null);
    return;
  }

  // biome-ignore lint/suspicious/noDocumentCookie: document.cookie needed for broad browser support
  document.cookie = setPreferencesCookie(merged);
};

export const syncDbPreferencesToCookie = async (): Promise<void> => {
  const { getUserPreferences } = await import("@/server/functions/user");
  const preferences = await getUserPreferences();
  if (preferences) setClientPreferences(preferences);
};

export const mergePreferences = (
  current: UserPreferences,
  updates: Partial<UserPreferences>,
): UserPreferences => {
  if (!current) {
    return updates as UserPreferences;
  }
  return { ...current, ...updates };
};

const isValidPreferences = (obj: unknown): obj is UserPreferences => {
  if (obj === null) return true;
  if (typeof obj !== "object") return false;

  const pref = obj as Record<string, unknown>;
  const locale = pref.locale;
  const theme = pref.theme;

  if (locale !== undefined && !["en", "fr"].includes(locale as string)) {
    return false;
  }
  if (theme !== undefined && !["light", "dark", "system"].includes(theme as string)) {
    return false;
  }

  return true;
};

const parseCookies = (cookieHeader?: string): Record<string, string> => {
  const cookies: Record<string, string> = {};

  if (!cookieHeader) return cookies;

  cookieHeader.split(";").forEach((cookie) => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) {
      cookies[name] = value;
    }
  });

  return cookies;
};
