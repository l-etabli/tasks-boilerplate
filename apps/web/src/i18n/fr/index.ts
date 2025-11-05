import type { Translation } from "../i18n-types.js";

const fr = {
  app: {
    title: "Tâches",
  },

  common: {
    loading: "Chargement...",
    save: "Enregistrer",
    saving: "Enregistrement...",
    cancel: "Annuler",
    delete: "Supprimer",
    back: "Retour",
    confirm: "Confirmer",
    or: "ou",
  },

  auth: {
    signInTitle: "Connexion",
    signInSubtitle: "Connectez-vous pour accéder à votre compte",
    signInWithGoogle: "Se connecter avec Google",
    signIn: "Se connecter",
    signOut: "Se déconnecter",
  },

  header: {
    toggleMenu: "Basculer le menu",
    organizationSwitcher: "Changer d'organisation",
  },

  locale: {
    changeLanguage: "Changer de langue",
    en: "Anglais",
    fr: "Français",
  },

  nav: {
    todos: "Tâches",
    settings: "Paramètres",
    account: "Compte",
    organizations: "Organisations",
  },

  todos: {
    title: "Tâches",
    inputPlaceholder: "Saisissez la description de la tâche...",
    add: "Ajouter une tâche",
    adding: "Ajout...",
    listHeading: "Tâches ({count})",
    empty: "Aucune tâche pour le moment. Ajoutez-en une ci-dessus !",
    delete: "Supprimer",
  },

  settings: {
    title: "Paramètres",
    accountTab: "Compte",
    organizationsTab: "Organisations",
    account: {
      heading: "Informations du compte",
      nameLabel: "Nom",
      namePlaceholder: "Votre nom",
      nameSuccess: "Nom mis à jour avec succès",
      nameError: "Échec de la mise à jour du nom",
      emailLabel: "Adresse e-mail",
      emailPlaceholder: "votre@email.com",
      emailSuccess:
        "Mise à jour de l'e-mail lancée. Vérifiez votre boîte de réception pour la vérification.",
      emailError: "Échec de la mise à jour de l'e-mail",
      emailVerificationNote: "La modification de votre e-mail nécessitera une vérification",
      emailOAuthNote: "L'e-mail ne peut pas être modifié pour les comptes OAuth (Google, etc.)",
      overviewHeading: "Aperçu du compte",
      planLabel: "Abonnement :",
    },
    organizations: {
      heading: "Vos organisations",
      count: "{count} organisation{count|s}",
      createButton: "Créer une organisation",
      createHeading: "Créer une nouvelle organisation",
      nameLabel: "Nom de l'organisation",
      namePlaceholder: "Acme Inc",
      slugHint: "Le slug sera généré automatiquement à partir du nom",
      cancel: "Annuler",
      create: "Créer",
      creating: "Création...",
      none: "Aucune organisation pour le moment. Créez-en une ci-dessus !",
      activeBadge: "Active",
      slugLabel: "Slug :",
      roleLabel: "Rôle : {role}",
      roleUnknown: "inconnu",
      membersHeading: "Membres ({count})",
      memberUnknown: "Utilisateur inconnu",
      invitationsHeading: "Invitations en attente ({count})",
      invitedBy: "Invité par",
      expiresIn: "Expire dans",
      setActive: "Définir comme active",
      switching: "Changement...",
      successCreate: "Organisation créée avec succès",
      errorCreate: "Échec de la création de l'organisation",
      successSwitch: "Organisation changée avec succès",
      errorSwitch: "Échec du changement d'organisation",
    },
  },

  organization: {
    modalTitle: "Créez votre organisation",
    modalDescription: "Choisissez comment vous utiliserez cet espace de travail",
    personalOptionTitle: "Espace personnel",
    personalOptionDescription: "Configuration rapide pour un usage individuel",
    customOptionTitle: "Organisation personnalisée",
    customOptionDescription: "Configurez avec un nom et des paramètres personnalisés",
    customFormTitle: "Créer une organisation",
    customFormDescription: "Configurez votre espace de travail avec un nom personnalisé",
    nameLabel: "Nom de l'organisation",
    namePlaceholder: "Acme Inc",
    slugHint: "Le slug sera généré automatiquement à partir du nom",
    back: "Retour",
    create: "Créer",
    creating: "Création...",
    createFailed: "Impossible de créer l'organisation",
  },

  errors: {
    genericTitle: "Une erreur est survenue",
    genericDescription: "Une erreur inconnue s'est produite",
    goBackTodos: "Retourner aux tâches",
  },
} satisfies Translation;

export default fr;
