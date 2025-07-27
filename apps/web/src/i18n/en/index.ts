import type { BaseTranslation } from "../i18n-types.js";

const en = {
  // Common
  loading: "Loading...",
  save: "Save",
  cancel: "Cancel",
  delete: "Delete",
  edit: "Edit",
  add: "Add",
  confirm: "Confirm",

  // Authentication
  auth: {
    login: "Login",
    logout: "Logout",
    loginWithGoogle: "Login with Google",
    loggedInAs: "Logged in as {name}",
    loginRequired: "Please login to continue",
  },

  // Tasks
  tasks: {
    title: "Tasks",
    addTask: "Add Task",
    newTask: "New Task",
    noTasks: "No tasks yet. Create your first task!",
    taskPlaceholder: "Enter task description...",
    markComplete: "Mark as complete",
    markIncomplete: "Mark as incomplete",
    deleteTask: "Delete task",
    editTask: "Edit task",
    taskCount: "{count} task{count|s}",
  },

  // Navigation
  nav: {
    home: "Home",
    tasks: "Tasks",
    profile: "Profile",
    settings: "Settings",
  },

  // Subscription
  subscription: {
    premium: "Premium",
    premiumFeature: "Premium Feature",
    subscriptionRequired: "This feature requires a premium subscription",
    upgrade: "Upgrade to Premium",
  },

  // Demo
  demo: {
    title: "Demo Features",
    serverFunctions: "Server Functions Demo",
    tanstackQuery: "TanStack Query Demo",
    forms: "Forms Demo",
  },
} satisfies BaseTranslation;

export default en;
