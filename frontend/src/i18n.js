import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English translations
const resources = {
  en: {
    translation: {
      // Balance Page
      total_invoices: 'Total Invoices',
      total_amount: 'Total Amount',
      total_paid: 'Total Paid',
      outstanding: 'Outstanding',
      invoice_number: 'Invoice Number',
      paid_amount: 'Paid Amount',
      balance: 'Balance',
      due_date: 'Due Date',
      status: 'Status',
      all_statuses: 'All Statuses',
      paid: 'Paid',
      partial: 'Partial',
      unpaid: 'Unpaid',
      overdue: 'Overdue',
      search_invoice_client: 'Search invoice/client...',
      no_invoices: 'No invoices found',
      delete_confirm_invoice: 'Delete this invoice?',
      mark_as_paid: 'Mark as Paid',
      mark_as_unpaid: 'Mark as Unpaid',
      mark_as_partial: 'Mark as Partial',
      mark_as_paid_confirm: 'mark this invoice as PAID',
      mark_as_unpaid_confirm: 'mark this invoice as UNPAID',
      mark_as_partial_confirm: 'mark this invoice as PARTIALLY PAID',
      are_you_sure: 'Are you sure you want to',
      successfully_updated_invoice_status_to_paid: 'Successfully marked invoice as paid',
      successfully_updated_invoice_status_to_unpaid: 'Successfully marked invoice as unpaid',
      successfully_updated_invoice_status_to_partial: 'Successfully marked invoice as partially paid',
      failed_to_update_invoice_status: 'Failed to update invoice status',
      page: 'Page',
      of: 'of',
      invoices: 'Invoices',
      // App
      app_name: 'NR-GIE',
      
      // Navigation
      dashboard: 'Dashboard',
      clients: 'Clients',
      contracts: 'Contracts',
      balance: 'Balance',
      salary: 'Salary',
      miscellaneous: 'Miscellaneous',
      
      // User Menu
      view_profile: 'View Profile',
      settings: 'Settings',
      logout: 'Logout',
      my_profile: 'My Profile',
      edit_account: 'Edit Account',
      
      // Profile Dialog
      profile: 'Profile',
      personal_information: 'Personal Information',
      display_name: 'Display Name',
      email_address: 'Email Address',
      phone_number: 'Phone Number',
      position: 'Position',
      bio: 'Bio',
      
      // Settings
      change_password: 'Change Password',
      current_password: 'Current Password',
      new_password: 'New Password',
      confirm_new_password: 'Confirm New Password',
      dark_mode: 'Dark Mode',
      notifications: 'Enable Notifications',
      email_alerts: 'Email Alerts',
      language: 'Language',
      english: 'English',
      french: 'French',
      
      // Common
      save: 'Save',
      cancel: 'Cancel',
      loading: 'Loading...',
      
      // Login Page
      sign_in_to: 'Sign In to',
      sign_in: 'Sign In',
      sign_up: 'Sign Up',
      sign_in_with_google: 'Sign in with Google',
      email: 'Email',
      password: 'Password',
      remember_me: 'Remember me',
      forgot_password: 'Forgot Password?',
      dont_have_account: 'Don\'t have an account?',
      or: 'OR',
      enter_email: 'Enter your email',
      enter_password: 'Enter your password',
      invalid_email: 'Invalid email address',
      email_required: 'Email is required',
      password_required: 'Password is required',
      password_min_length: 'Password must be at least 6 characters',
      login_failed: 'Failed to login. Please try again.',
      google_login_failed: 'Failed to login with Google. Please try again.',
      user: 'User',
      welcome_back: 'Welcome back',
      welcome_to_dashboard: 'Welcome to the Company Dashboard',
      track_your_metrics: 'Track all your business metrics, contracts, and clients in one place',
      quick_stats: 'Quick Stats',
      no_contract_growth_data: 'No contract growth data found',
      recent_activity: 'Recent Activity',
      recent_activities: 'Recent Activities',
      activity_distribution: 'Activity Distribution',
      no_recent_activity: 'No recent activity found',
      no_activity_data: 'No activity data available',
      no_activity_found: 'No Activities Found',
      no_activity_description: 'There are no recent activities to display',
      loading_activities: 'Loading activities...',
      total_activities: 'Total Activities',
      count_activities: '{{count}} activities',
      
      // Activity types
      activity: {
        login: 'Login',
        upload: 'File Upload',
        download: 'File Download',
        share: 'Shared File',
        client: 'New Client',
        contract: 'New Contract',
        recent: 'Recent Update',
        alert: 'Alert',
        important: 'Important',
        trending: 'Trending',
        global: 'Global Update',
        project: 'Project Update'
      },
      
      // Dashboard
      total_clients: 'Total Clients',
      total_contracts: 'Total Contracts',
      invoices_due: 'Invoices Due',
      employees_tracked: 'Employees Tracked',
      recent_activity: 'Recent Activity',
      contract_growth: 'Contract Growth',
      
      // Clients Page
      add_client: 'Add Client',
      edit_client: 'Edit Client',
      client_number: 'Client Number',
      client_name: 'Client Name',
      email: 'Email',
      phone: 'Phone',
      tva_number: 'TVA Number',
      actions: 'Actions',
      search_clients: 'Search clients...',
      no_clients: 'No clients found',
      delete_client: 'Delete Client',
      delete_confirm: 'Are you sure you want to delete this client?',
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving...',
      deleting: 'Deleting...',
      client_added: 'Client added successfully',
      client_updated: 'Client updated successfully',
      client_deleted: 'Client deleted successfully',
      error_occurred: 'An error occurred',
      required_field: 'This field is required',
      invalid_email: 'Please enter a valid email',
      search_placeholder: 'Search by client number or email',
      no_results: 'No clients found matching your search',
      page_of: 'Page {{current}} of {{total}}',
      add_new_client: 'Add New Client',
      email_address: 'Email Address',
      phone_number: 'Phone Number',
      save_changes: 'Save Changes',
      edit: 'Edit',
      delete: 'Delete',
      confirm_delete: 'Are you sure you want to delete client',
      this_action_cannot_be_undone: 'This action cannot be undone',
      password_mismatch: 'Passwords do not match',
      
      // Salary Page
      salaries: 'Salaries',
      add_salary: 'Add Salary',
      edit_salary: 'Edit Salary',
      add_new_salary: 'Add New Salary',
      update_salary: 'Update Salary',
      delete_salary: 'Delete Salary',
      employee_name: 'Employee Name',
      working_days: 'Working Days',
      leaves: 'Leaves',
      salary_per_day: 'Salary Per Day',
      total_salary: 'Total Salary',
      search_salaries: 'Search salaries...',
      search_by_employee: 'Search by employee name...',
      no_salaries_found: 'No salaries found',
      are_you_sure_delete: 'Are you sure you want to delete this salary?',
      delete_salary_confirm: 'Are you sure you want to delete the salary of',
      salary_deleted: 'Salary deleted successfully!',
      salary_updated: 'Salary updated successfully!',
      salary_added: 'Salary added successfully!',
      error_adding_salary: 'Error adding salary',
      error_updating_salary: 'Error updating salary',
      error_deleting_salary: 'Error deleting salary',
      employee: 'Employee',
      actions: 'Actions',
      saving: 'Saving...',
      previous: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of',
      
      // Success Messages
      changes_saved: 'Changes saved successfully',
      operation_success: 'Operation completed successfully',
      
      // Error Messages
      error_occurred: 'An error occurred',
      try_again: 'Please try again',
      
      // Empty States
      no_data: 'No data available',
      no_results: 'No results found',
      
      // Months
      january: 'January',
      february: 'February',
      march: 'March',
      april: 'April',
      may: 'May',
      june: 'June',
      july: 'July',
      august: 'August',
      september: 'September',
      october: 'October',
      november: 'November',
      december: 'December',
      
      // Contract Details Form
      add_contract_details: 'Add Contract Details',
      description: 'Description',
      quantity: 'Quantity',
      qty: 'Qty',
      unit_price: 'Unit Price',
      tva_percent: 'TVA (%)',
      total_ht: 'Total HT',
      existing_details: 'Existing Details',
      save_details: 'Save Details',
      saving: 'Saving',
      actions: 'Actions',
      cancel: 'Cancel',
    }
  },
  fr: {
    translation: {
      // Balance Page
      total_invoices: 'Total des Factures',
      total_amount: 'Montant Total',
      total_paid: 'Total Payé',
      outstanding: 'En Attente',
      invoice_number: 'Numéro de Facture',
      paid_amount: 'Montant Payé',
      balance: 'Solde',
      due_date: "Date d'Échéance",
      status: 'Statut',
      all_statuses: 'Tous les Statuts',
      paid: 'Payé',
      partial: 'Partiel',
      unpaid: 'Impayé',
      overdue: 'En Retard',
      search_invoice_client: 'Rechercher une facture/client...',
      no_invoices: 'Aucune facture trouvée',
      delete_confirm_invoice: 'Supprimer cette facture ?',
      mark_as_paid: 'Marquer comme Payé',
      mark_as_unpaid: 'Marquer comme Impayé',
      mark_as_partial: 'Marquer comme Partiellement Payé',
      mark_as_paid_confirm: 'marquer cette facture comme PAYÉE',
      mark_as_unpaid_confirm: 'marquer cette facture comme IMPAYÉE',
      mark_as_partial_confirm: 'marquer cette facture comme PARTIELLEMENT PAYÉE',
      are_you_sure: 'Êtes-vous sûr de vouloir',
      successfully_updated_invoice_status_to_paid: 'Facture marquée comme payée avec succès',
      successfully_updated_invoice_status_to_unpaid: 'Facture marquée comme impayée avec succès',
      successfully_updated_invoice_status_to_partial: 'Facture marquée comme partiellement payée avec succès',
      failed_to_update_invoice_status: 'Échec de la mise à jour du statut de la facture',
      page: 'Page',
      of: 'sur',
      invoices: 'Factures',
      // App
      app_name: 'NR-GIE',
      
      // Navigation
      dashboard: 'Tableau de bord',
      clients: 'Clients',
      contracts: 'Contrats',
      balance: 'Solde',
      salary: 'Salaire',
      miscellaneous: 'Divers',
      
      // User Menu
      view_profile: 'Voir le profil',
      settings: 'Paramètres',
      logout: 'Se déconnecter',
      my_profile: 'Mon Profil',
      edit_account: 'Modifier le compte',
      
      // Profile Dialog
      profile: 'Profil',
      personal_information: 'Informations personnelles',
      display_name: 'Nom d\'affichage',
      email_address: 'Adresse e-mail',
      phone_number: 'Numéro de téléphone',
      position: 'Poste',
      bio: 'Biographie',
      
      // Settings
      change_password: 'Changer le mot de passe',
      current_password: 'Mot de passe actuel',
      new_password: 'Nouveau mot de passe',
      confirm_new_password: 'Confirmer le nouveau mot de passe',
      dark_mode: 'Mode sombre',
      notifications: 'Activer les notifications',
      email_alerts: 'Alertes par e-mail',
      language: 'Langue',
      english: 'Anglais',
      french: 'Français',
      
      // Common
      save: 'Enregistrer',
      cancel: 'Annuler',
      loading: 'Chargement...',
      
      // Login Page
      sign_in_to: 'Connectez-vous à',
      sign_in: 'Se connecter',
      sign_up: 'S\'inscrire',
      sign_in_with_google: 'Se connecter avec Google',
      email: 'E-mail',
      password: 'Mot de passe',
      remember_me: 'Se souvenir de moi',
      forgot_password: 'Mot de passe oublié ?',
      dont_have_account: 'Vous n\'avez pas de compte ?',
      or: 'OU',
      enter_email: 'Entrez votre e-mail',
      enter_password: 'Entrez votre mot de passe',
      invalid_email: 'Adresse e-mail invalide',
      email_required: 'L\'e-mail est requis',
      password_required: 'Le mot de passe est requis',
      password_min_length: 'Le mot de passe doit contenir au moins 6 caractères',
      login_failed: 'Échec de la connexion. Veuillez réessayer.',
      google_login_failed: 'Échec de la connexion avec Google. Veuillez réessayer.',
      
      // Contracts Page
      add_contract: 'Ajouter un contrat',
      edit_contract: 'Modifier le contrat',
      command_number: 'Numéro de commande',
      client: 'Client',
      client_name: 'Nom du client',
      price: 'Prix',
      date: 'Date',
      deadline: 'Date limite',
      guarantee_percentage: 'Pourcentage de garantie',
      contact_person: 'Personne à contacter',
      select_client: 'Sélectionner un client',
      add_contract_btn: 'Ajouter un contrat',
      save_changes: 'Enregistrer les modifications',
      saving: 'Enregistrement...',
      contract_added: 'Contrat ajouté avec succès',
      contract_updated: 'Contrat mis à jour avec succès',
      contract_deleted: 'Contrat supprimé',
      delete_contract: 'Supprimer le contrat',
      delete_confirm: 'Êtes-vous sûr de vouloir supprimer ce contrat ?',
      active: 'Actif',
      inactive: 'Inactif',
      pending: 'En attente',
      completed: 'Terminé',
      view_pdf: 'Voir le PDF',
      download_pdf: 'Télécharger le PDF',
      download_estimate: 'Télécharger le devis',
      download_invoice: 'Télécharger la facture',
      generate_invoice: 'Générer une facture',
      add_contract_details: 'Ajouter les détails du contrat',
      description: 'Description',
      quantity: 'Quantité',
      qty: 'Qté',
      unit_price: 'Prix unitaire',
      tva_percent: 'TVA (%)',
      total_ht: 'Total HT',
      existing_details: 'Détails existants',
      no_contracts: 'Aucun contrat trouvé',
      no_contracts_found: 'Aucun contrat trouvé correspondant à votre recherche.',
      search_contracts: 'Rechercher des contrats...',
      page_of: 'Page {current} sur {total}',
      loading_pdf: 'Chargement du PDF...',
      close: 'Fermer',
      download: 'Télécharger',
      expired: 'Expiré',
      actions: 'Actions',
      guarantee: 'Garantie',
      add_details: 'Ajouter des détails',
      view_details: 'Voir les détails',
      edit: 'Modifier',
      delete: 'Supprimer',
      deleting: 'Suppression...',
      action_cannot_be_undone: 'Cette action ne peut pas être annulée',
      
      // Salary Page
      salaries: 'Salaires',
      add_salary: 'Ajouter un salaire',
      edit_salary: 'Modifier le salaire',
      add_new_salary: 'Ajouter un nouveau salaire',
      update_salary: 'Mettre à jour le salaire',
      delete_salary: 'Supprimer le salaire',
      employee_name: 'Nom de l\'employé',
      working_days: 'Jours travaillés',
      leaves: 'Jours de congé',
      salary_per_day: 'Salaire journalier',
      total_salary: 'Salaire total',
      search_salaries: 'Rechercher des salaires...',
      search_by_employee: 'Rechercher par nom d\'employé...',
      no_salaries_found: 'Aucun salaire trouvé',
      are_you_sure_delete: 'Êtes-vous sûr de vouloir supprimer ce salaire ?',
      delete_salary_confirm: 'Êtes-vous sûr de vouloir supprimer le salaire de',
      salary_deleted: 'Salaire supprimé avec succès !',
      salary_updated: 'Salaire mis à jour avec succès !',
      salary_added: 'Salaire ajouté avec succès !',
      error_adding_salary: 'Erreur lors de l\'ajout du salaire',
      error_updating_salary: 'Erreur lors de la mise à jour du salaire',
      error_deleting_salary: 'Erreur lors de la suppression du salaire',
      employee: 'Employé',
      actions: 'Actions',
      saving: 'Enregistrement...',
      previous: 'Précédent',
      next: 'Suivant',
      page: 'Page',
      of: 'sur',
      
      // Miscellaneous Page
      miscellaneous_expenses: 'Dépenses diverses',
      add_new_expense: 'Ajouter une dépense',
      edit_expense: 'Modifier la dépense',
      description: 'Description',
      price_per_unit: 'Prix unitaire',
      units: 'Unités',
      total: 'Total',
      date_added: 'Date d\'ajout',
      saving: 'Enregistrement...',
      update_expense: 'Mettre à jour la dépense',
      add_expense: 'Ajouter une dépense',
      cancel: 'Annuler',
      search_by_description: 'Rechercher par description...',
      no_expenses_found: 'Aucune dépense trouvée',
      are_you_sure_delete: 'Êtes-vous sûr de vouloir supprimer cette dépense ?',
      expense_deleted: 'Dépense supprimée avec succès !',
      expense_updated: 'Dépense mise à jour avec succès !',
      expense_added: 'Dépense ajoutée avec succès !',
      error_adding_expense: 'Erreur lors de l\'ajout de la dépense',
      error_updating_expense: 'Erreur lors de la mise à jour de la dépense',
      error_deleting_expense: 'Erreur lors de la suppression de la dépense',
      fill_all_fields: 'Veuillez remplir tous les champs avec des valeurs valides.',
      user: 'Utilisateur',
      welcome_back: 'Bienvenue',
      welcome_to_dashboard: 'Bienvenue sur le Tableau de Bord',
      track_your_metrics: 'Suivez toutes vos métriques, contrats et clients au même endroit',
      quick_stats: 'Statistiques Rapides',
      no_contract_growth_data: 'Aucune donnée de croissance de contrat trouvée',
      recent_activity: 'Activité récente',
      recent_activities: 'Activités récentes',
      activity_distribution: 'Répartition des activités',
      no_recent_activity: 'Aucune activité récente trouvée',
      no_activity_data: 'Aucune donnée d\'activité disponible',
      no_activity_found: 'Aucune activité trouvée',
      no_activity_description: 'Aucune activité récente à afficher',
      loading_activities: 'Chargement des activités...',
      total_activities: 'Total des activités',
      count_activities: '{{count}} activités',
      
      // Activity types
      activity: {
        login: 'Connexion',
        upload: 'Téléversement',
        download: 'Téléchargement',
        share: 'Fichier partagé',
        client: 'Nouveau client',
        contract: 'Nouveau contrat',
        recent: 'Mise à jour récente',
        alert: 'Alerte',
        important: 'Important',
        trending: 'Tendance',
        global: 'Mise à jour globale',
        project: 'Mise à jour du projet'
      },
      
      // Dashboard
      total_clients: 'Total Clients',
      total_contracts: 'Contrats Totaux',
      invoices_due: 'Factures en Attente',
      employees_tracked: 'Employés Suivis',
      recent_activity: 'Activité Récente',
      contract_growth: 'Croissance des Contrats',
      
      // Clients Page
      add_client: 'Ajouter un Client',
      edit_client: 'Modifier le Client',
      client_number: 'Numéro de Client',
      client_name: 'Nom du Client',
      email: 'E-mail',
      phone: 'Téléphone',
      tva_number: 'Numéro de TVA',
      actions: 'Actions',
      search_clients: 'Rechercher des clients...',
      no_clients: 'Aucun client trouvé',
      delete_client: 'Supprimer le Client',
      delete_confirm: 'Êtes-vous sûr de vouloir supprimer ce client ?',
      cancel: 'Annuler',
      save: 'Enregistrer',
      saving: 'Enregistrement...',
      deleting: 'Suppression...',
      client_added: 'Client ajouté avec succès',
      client_updated: 'Client mis à jour avec succès',
      client_deleted: 'Client supprimé avec succès',
      error_occurred: 'Une erreur est survenue',
      required_field: 'Ce champ est obligatoire',
      invalid_email: 'Veuillez entrer un email valide',
      search_placeholder: 'Rechercher par numéro de client ou email',
      no_results: 'Aucun client ne correspond à votre recherche',
      page_of: 'Page {{current}} sur {{total}}',
      add_new_client: 'Ajouter un Nouveau Client',
      email_address: 'Adresse E-mail',
      phone_number: 'Numéro de Téléphone',
      save_changes: 'Enregistrer les modifications',
      edit: 'Modifier',
      delete: 'Supprimer',
      confirm_delete: 'Êtes-vous sûr de vouloir supprimer le client',
      this_action_cannot_be_undone: 'Cette action ne peut pas être annulée',
      password_mismatch: 'Les mots de passe ne correspondent pas',
      
      // Success Messages
      changes_saved: 'Modifications enregistrées avec succès',
      operation_success: 'Opération réussie',
      
      // Error Messages
      error_occurred: 'Une erreur est survenue',
      try_again: 'Veuillez réessayer',
      
      // Empty States
      no_data: 'Aucune donnée disponible',
      no_results: 'Aucun résultat trouvé',
      
      // Months
      january: 'Janvier',
      february: 'Février',
      march: 'Mars',
      april: 'Avril',
      may: 'Mai',
      june: 'Juin',
      july: 'Juillet',
      august: 'Août',
      september: 'Septembre',
      october: 'Octobre',
      november: 'Novembre',
      december: 'Décembre'
    }
  }
};

// Configure language detection
const languageDetector = new LanguageDetector();
languageDetector.addDetector({
  name: 'customLocalStorageDetector',
  lookup() {
    const savedLang = localStorage.getItem('i18nextLng');
    return savedLang || null;
  },
  cacheUserLanguage(lng) {
    localStorage.setItem('i18nextLng', lng);
  }
});

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    detection: {
      order: ['customLocalStorageDetector', 'navigator'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false,
    },
    parseMissingKeyHandler: (key) => {
      // Replace underscores with spaces and capitalize first letter of each word
      return key
        .replace(/_/g, ' ')
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    },
    saveMissing: true, // Enable missing key logging in development
    saveMissingTo: 'all', // Log missing keys for all languages
    missingKeyHandler: (lngs, namespace, key, fallbackValue) => {
      console.warn(`Missing translation: ${key}`);
    },
  });

// Listen for language changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
  document.documentElement.lang = lng;
});

export default i18n;
