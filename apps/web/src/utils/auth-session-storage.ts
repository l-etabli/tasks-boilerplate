const KEYS = {
  EMAIL: "auth:email",
  NAME: "auth:name",
  INVITATION_CALLBACK: "auth:invitationCallback",
} as const;

export const authSessionStorage = {
  saveAuthEmail(email: string) {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(KEYS.EMAIL, email);
    } catch (_error) {
      // SessionStorage might be disabled
    }
  },

  getAuthEmail(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return sessionStorage.getItem(KEYS.EMAIL);
    } catch (_error) {
      return null;
    }
  },

  saveAuthName(name: string) {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(KEYS.NAME, name);
    } catch (_error) {
      // SessionStorage might be disabled
    }
  },

  getAuthName(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return sessionStorage.getItem(KEYS.NAME);
    } catch (_error) {
      return null;
    }
  },

  saveInvitationCallback(callbackURL: string) {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(KEYS.INVITATION_CALLBACK, callbackURL);
    } catch (_error) {
      // SessionStorage might be disabled
    }
  },

  getInvitationCallback(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return sessionStorage.getItem(KEYS.INVITATION_CALLBACK);
    } catch (_error) {
      return null;
    }
  },

  clearAuthFormData() {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem(KEYS.EMAIL);
      sessionStorage.removeItem(KEYS.NAME);
    } catch (_error) {
      // SessionStorage might be disabled
    }
  },

  clearAuthData() {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem(KEYS.EMAIL);
      sessionStorage.removeItem(KEYS.NAME);
      sessionStorage.removeItem(KEYS.INVITATION_CALLBACK);
    } catch (_error) {
      // SessionStorage might be disabled
    }
  },
};
