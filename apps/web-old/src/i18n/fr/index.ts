import type { Translation } from "../i18n-types.js";

const fr = {
  // Common
  loading: "Chargement...",
  save: "Enregistrer",
  cancel: "Annuler",
  delete: "Supprimer",
  edit: "Modifier",
  add: "Ajouter",
  confirm: "Confirmer",

  // Authentication
  auth: {
    login: "Se connecter",
    logout: "Se déconnecter",
    loginWithGoogle: "Se connecter avec Google",
    loggedInAs: "Connecté en tant que {name}",
    loginRequired: "Veuillez vous connecter pour continuer",
  },

  // Tasks
  tasks: {
    title: "Tâches",
    addTask: "Ajouter une tâche",
    newTask: "Nouvelle tâche",
    noTasks: "Aucune tâche pour le moment. Créez votre première tâche !",
    taskPlaceholder: "Entrez la description de la tâche...",
    markComplete: "Marquer comme terminé",
    markIncomplete: "Marquer comme non terminé",
    deleteTask: "Supprimer la tâche",
    editTask: "Modifier la tâche",
    taskCount: "{count} tâche{count|s}",
  },

  // Navigation
  nav: {
    home: "Accueil",
    tasks: "Tâches",
    profile: "Profil",
    settings: "Paramètres",
  },

  // Subscription
  subscription: {
    premium: "Premium",
    premiumFeature: "Fonctionnalité Premium",
    subscriptionRequired: "Cette fonctionnalité nécessite un abonnement premium",
    upgrade: "Passer à Premium",
  },

  // Demo
  demo: {
    title: "Fonctionnalités de démonstration",
    serverFunctions: "Démonstration des fonctions serveur",
    tanstackQuery: "Démonstration TanStack Query",
    forms: "Démonstration des formulaires",
  },
} satisfies Translation;

export default fr;
