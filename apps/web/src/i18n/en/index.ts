import type { BaseTranslation } from "../i18n-types.js";

const en = {
  app: {
    title: "Tasks",
  },

  common: {
    loading: "Loading...",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    delete: "Delete",
    back: "Back",
    confirm: "Confirm",
    or: "or",
  },

  auth: {
    signInTitle: "Sign In",
    signInSubtitle: "Sign in to access your account",
    signInWithGoogle: "Sign in with Google",
    signIn: "Sign In",
    signOut: "Sign Out",
  },

  header: {
    toggleMenu: "Toggle menu",
  },

  locale: {
    changeLanguage: "Change language",
    en: "English",
    fr: "Français",
  },

  nav: {
    todos: "Todos",
    settings: "Settings",
    account: "Account",
    organizations: "Organizations",
  },

  todos: {
    title: "Todos",
    inputPlaceholder: "Enter task description...",
    add: "Add Task",
    adding: "Adding...",
    listHeading: "Tasks ({count})",
    empty: "No tasks yet. Add one above!",
    delete: "Delete",
  },

  settings: {
    title: "Settings",
    accountTab: "Account",
    organizationsTab: "Organizations",
    account: {
      heading: "Account Information",
      nameLabel: "Name",
      namePlaceholder: "Your name",
      nameSuccess: "Name updated successfully",
      nameError: "Failed to update name",
      emailLabel: "Email",
      emailPlaceholder: "your@email.com",
      emailSuccess: "Email update initiated. Check your inbox for verification.",
      emailError: "Failed to update email",
      emailVerificationNote: "Changing your email will require verification",
      emailOAuthNote: "Email cannot be changed for OAuth accounts (Google, etc.)",
      overviewHeading: "Account Overview",
      planLabel: "Plan:",
    },
    organizations: {
      heading: "Your Organizations",
      count: "{count} organization{count|s}",
      createButton: "Create Organization",
      createHeading: "Create New Organization",
      nameLabel: "Organization name",
      namePlaceholder: "Acme Inc",
      slugHint: "Slug will be auto-generated from the name",
      cancel: "Cancel",
      create: "Create",
      creating: "Creating...",
      none: "No organizations yet. Create one above!",
      activeBadge: "Active",
      slugLabel: "Slug:",
      roleLabel: "Role: {role}",
      roleUnknown: "unknown",
      membersHeading: "Members ({count})",
      memberUnknown: "Unknown user",
      setActive: "Set Active",
      switching: "Switching...",
      successCreate: "Organization created successfully",
      errorCreate: "Failed to create organization",
      successSwitch: "Organization switched successfully",
      errorSwitch: "Failed to switch organization",
    },
  },

  organization: {
    modalTitle: "Create your organization",
    modalDescription: "Choose how you'll use this workspace",
    personalOptionTitle: "Personal workspace",
    personalOptionDescription: "Quick setup for individual use",
    customOptionTitle: "Custom organization",
    customOptionDescription: "Set up with custom name and settings",
    customFormTitle: "Create organization",
    customFormDescription: "Set up your workspace with a custom name",
    nameLabel: "Organization name",
    namePlaceholder: "Acme Inc",
    slugHint: "Slug will be auto-generated from the name",
    back: "Back",
    create: "Create",
    creating: "Creating...",
    createFailed: "Failed to create organization",
  },

  errors: {
    genericTitle: "Something went wrong",
    genericDescription: "An unknown error occurred",
    goBackTodos: "Go back to Todos",
  },
} satisfies BaseTranslation;

export default en;
