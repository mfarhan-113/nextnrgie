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
      factures: 'Invoices',
      balance: 'Balance',
      salary: 'Salary',
      miscellaneous: 'Miscellaneous',
      
      // Factures
      addFacture: 'Add Invoice',
      editFacture: 'Edit Invoice',
      facturePreview: 'Invoice Preview',
      noFacturesFound: 'No invoices found',
      factureNumber: 'Invoice Number',
      invoiceDate: 'Invoice Date',
      dueDate: 'Due Date',
      totalHT: 'Total HT',
      totalTTC: 'Total TTC',
      tva: 'TVA',
      actions: 'Actions',
      view: 'View',
      edit: 'Edit',
      delete: 'Delete',
      cancel: 'Cancel',
      save: 'Save',
      update: 'Update',
      close: 'Close',
      download: 'Download',
      
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
      manage_salaries_description: 'Manage employee salaries and track payments',
      total_employees: 'Total Employees',
      total_working_days: 'Total Working Days',
      total_leaves: 'Total Leaves',
      total_payroll: 'Total Payroll',
      search_employees: 'Search employees...',
      no_salaries_match_search: 'No salaries match your search criteria.',
      no_salaries_available: 'No salary records available. Add a new salary to get started.',
      failed_to_load_salaries: 'Failed to load salaries',
      please_fill_required_fields: 'Please fill in all required fields',
      salary_added_successfully: 'Salary added successfully',
      failed_to_add_salary: 'Failed to add salary',
      salary_updated_successfully: 'Salary updated successfully',
      failed_to_update_salary: 'Failed to update salary',
      salary_deleted_successfully: 'Salary deleted successfully',
      failed_to_delete_salary: 'Failed to delete salary',
      confirm_delete_salary: 'Are you sure you want to delete this salary record? This action cannot be undone?',
      
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
      add_facture_item: 'Add Facture Item',
      facture_item: 'Facture Item',
      remaining_for_factures: 'Remaining for Factures',
      
      // Facture Form
      description: 'Description',
      quantity: 'Quantity',
      unit_price: 'Unit Price',
      total_ht: 'Total HT',
      cancel: 'Cancel',
      save_facture_item: 'Save Facture Item',
      saving: 'Saving...',
      saved_items: 'Saved Items',
      no_items_found: 'No items found',
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
      
      // Devis Page (Quotes)
      devis: 'Devis',
      created_devis: 'Created Devis',
      add_devis_item: 'Add Devis Item',
      edit_devis_item: 'Edit Devis Item',
      select_devis: 'Select Devis',
      save_in_devis: 'Save in Devis',
      error_generating_pdf: 'Failed to generate PDF',
      no_contract_for_client: 'No contract found for selected client. Create one in Contracts to add devis.',
      using_latest_contract: 'Using latest contract for this client.',
      devis_items: 'Devis Items',
      select_client_first: 'Please select a client and devis first',
    
      // Miscellaneous Page
      miscellaneous_expenses: 'Miscellaneous Expenses',
      manage_expenses_description: 'Track and manage miscellaneous business expenses',
      search_expenses: 'Search expenses...',
      refresh: 'Refresh',
      price_per_unit: 'Price per Unit',
      units: 'Units',
      total: 'Total',
      date_added: 'Date Added',
      total_expenses: 'Total Expenses',
      total_units: 'Total Units',
      total_value: 'Total Value',
      average_cost: 'Average Cost',
      no_expenses_found: 'No expenses found',
      no_expenses_match_search: 'No expenses match your search criteria.',
      no_expenses_available: 'No expense records available. Add a new expense to get started.',
      add_expense: 'Add Expense',
      adding: 'Adding...',
      add: 'Add',
      edit_expense: 'Edit Expense',
      updating: 'Updating...',
      update: 'Update',
      delete_expense: 'Delete Expense',
      confirm_delete_expense: 'Are you sure you want to delete this expense record? This action cannot be undone.',
      deleting: 'Deleting...'
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
      factures: 'Factures',
      balance: 'Solde',
      salary: 'Salaire',
      miscellaneous: 'Divers',
      
      // Miscellaneous Page
      miscellaneous_expenses: 'Dépenses diverses',
      manage_expenses_description: "Suivez et gérez les dépenses diverses de l’entreprise",
      search_expenses: 'Rechercher des dépenses...',
      refresh: 'Rafraîchir',
      price_per_unit: 'Prix par unité',
      units: 'Unités',
      total: 'Total',
      date_added: "Date d’ajout",
      total_expenses: 'Total des dépenses',
      total_units: 'Total des unités',
      total_value: 'Valeur totale',
      average_cost: 'Coût moyen',
      no_expenses_found: 'Aucune dépense trouvée',
      no_expenses_match_search: 'Aucune dépense ne correspond à vos critères de recherche.',
      no_expenses_available: 'Aucun enregistrement de dépense disponible. Ajoutez une nouvelle dépense pour commencer.',
      add_expense: 'Ajouter une dépense',
      adding: 'Ajout...',
      add: 'Ajouter',
      edit_expense: 'Modifier la dépense',
      updating: 'Mise à jour...',
      update: 'Mettre à jour',
      delete_expense: 'Supprimer la dépense',
      confirm_delete_expense: 'Êtes-vous sûr de vouloir supprimer cette dépense ? Cette action est irréversible.',
      deleting: 'Suppression...',
      
      // Salary Page
      manage_salaries_description: 'Gérez les salaires des employés et suivez les paiements',
      total_employees: 'Total Employés',
      total_working_days: 'Total Jours Travaillés',
      total_leaves: 'Total Congés',
      total_payroll: 'Masse salariale totale',
      search_employees: 'Rechercher des employés...',
      no_salaries_match_search: 'Aucun salaire ne correspond à vos critères de recherche.',
      no_salaries_available: 'Aucun enregistrement de salaire disponible. Ajoutez un nouveau salaire pour commencer.',
      failed_to_load_salaries: 'Échec du chargement des salaires',
      please_fill_required_fields: 'Veuillez remplir tous les champs obligatoires',
      salary_added_successfully: 'Salaire ajouté avec succès',
      failed_to_add_salary: "Échec de l'ajout du salaire",
      salary_updated_successfully: 'Salaire mis à jour avec succès',
      failed_to_update_salary: 'Échec de la mise à jour du salaire',
      salary_deleted_successfully: 'Salaire supprimé avec succès',
      failed_to_delete_salary: 'Échec de la suppression du salaire',
      confirm_delete_salary: 'Êtes-vous sûr de vouloir supprimer cet enregistrement de salaire ? Cette action ne peut pas être annulée.',
      
      // Factures
      addFacture: 'Ajouter une facture',
      editFacture: 'Modifier la facture',
      facturePreview: 'Aperçu de la facture',
      noFacturesFound: 'Aucune facture trouvée',
      factureNumber: 'Numéro de facture',
      invoiceDate: 'Date de facturation',
      dueDate: 'Date d\'échéance',
      totalHT: 'Total HT',
      totalTTC: 'Total TTC',
      tva: 'TVA',
      actions: 'Actions',
      view: 'Voir',
      edit: 'Modifier',
      delete: 'Supprimer',
      cancel: 'Annuler',
      save: 'Enregistrer',
      update: 'Mettre à jour',
      close: 'Fermer',
      download: 'Télécharger',
      
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
      new_contract: 'Nouveau contrat',
      create_contract: 'Créer un contrat',
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
      add_details: 'Ajouter un devis',
      view_details: 'Voir les détails',
      edit: 'Modifier',
      delete: 'Supprimer',
      
      // Contract Buttons
      save_contract: 'Enregistrer le contrat',
      update_contract: 'Mettre à jour le contrat',
      submit_contract: 'Soumettre le contrat',
      cancel_contract: 'Annuler le contrat',
      approve_contract: 'Approuver le contrat',
      reject_contract: 'Rejeter le contrat',
      sign_contract: 'Signer le contrat',
      send_for_approval: 'Envoyer pour approbation',
      request_changes: 'Demander des modifications',
      mark_as_complete: 'Marquer comme terminé',
      
      // Contract Status Actions
      set_as_draft: 'Définir comme brouillon',
      set_as_active: 'Définir comme actif',
      set_as_pending: 'Définir comme en attente',
      set_as_completed: 'Définir comme terminé',
      set_as_expired: 'Définir comme expiré',
      set_as_archived: 'Archiver',
      
      // Contract Icons
      add_icon: 'Ajouter',
      edit_icon: 'Modifier',
      delete_icon: 'Supprimer',
      view_icon: 'Voir',
      print_icon: 'Imprimer',
      email_icon: 'Email',
      download_icon: 'Télécharger',
      upload_icon: 'Téléverser',
      search_icon: 'Rechercher',
      filter_icon: 'Filtrer',
      sort_icon: 'Trier',
      more_icon: 'Plus',
      
      // Contract Messages
      contract_created: 'Contrat créé avec succès',
      contract_updated: 'Contrat mis à jour avec succès',
      contract_deleted: 'Contrat supprimé avec succès',
      contract_sent_for_approval: 'Contrat envoyé pour approbation',
      contract_approved: 'Contrat approuvé avec succès',
      contract_rejected: 'Contrat rejeté',
      contract_signed: 'Contrat signé avec succès',
      contract_cancelled: 'Contrat annulé',
      contract_archived: 'Contrat archivé avec succès',
      contract_restored: 'Contrat restauré avec succès',
      
      // Form Labels and Placeholders
      command_number_placeholder: 'Numéro de commande',
      price_placeholder: 'Prix',
      date_placeholder: 'Date',
      deadline_placeholder: 'Date limite',
      guarantee_percentage_placeholder: 'Pourcentage de garantie',
      contact_person_placeholder: 'Personne à contacter',
      contact_phone_placeholder: 'Téléphone de contact',
      contact_email_placeholder: 'Email de contact',
      contact_address_placeholder: 'Adresse de contact',
      select_client_placeholder: 'Sélectionner un client',
      
      // Form Validation Messages
      all_fields_required: 'Tous les champs sont obligatoires',
      invalid_email: 'Email invalide',
      invalid_phone: 'Numéro de téléphone invalide',
      invalid_number: 'Veuillez entrer un nombre valide',
      
      // Button Text
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      view: 'Voir',
      download: 'Télécharger',
      close: 'Fermer',
      
      // Status Messages
      loading: 'Chargement...',
      saving: 'Enregistrement en cours...',
      deleting: 'Suppression en cours...',
      success: 'Succès',
      error: 'Erreur',
      warning: 'Avertissement',
      
      // Confirmation Messages
      confirm_delete: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
      confirm_cancel: 'Êtes-vous sûr de vouloir annuler ? Toutes les modifications seront perdues.',
      
      // Table Headers
      contract_number: 'Numéro de contrat',
      client_name: 'Nom du client',
      contract_date: 'Date du contrat',
      contract_status: 'Statut du contrat',
      total_amount: 'Montant total',
      remaining_balance: 'Solde restant',
      
      // Contract Statuses
      status_draft: 'Brouillon',
      status_active: 'Actif',
      status_pending: 'En attente',
      status_completed: 'Terminé',
      status_expired: 'Expiré',
      status_archived: 'Archivé',
      
      // Document Types
      document_type_estimate: 'Devis',
      document_type_invoice: 'Facture',
      document_type_contract: 'Contrat',
      
      // Actions
      generate_document: 'Générer un document',
      view_document: 'Voir le document',
      download_document: 'Télécharger le document',
      
      // Success Messages
      document_generated: 'Document généré avec succès',
      document_saved: 'Document enregistré avec succès',
      document_deleted: 'Document supprimé avec succès',
      
      // Error Messages
      error_loading_data: 'Erreur lors du chargement des données',
      error_saving_data: 'Erreur lors de la sauvegarde des données',
      error_deleting_data: 'Erreur lors de la suppression des données',
      
      // Info Messages
      no_data_available: 'Aucune donnée disponible',
      no_results_found: 'Aucun résultat trouvé',
      select_an_option: 'Sélectionnez une option',
      
      // Détails du contrat
      contract_details: 'Détails du contrat',
      add_facture: 'Ajouter une facture',
      facture_details: 'Détails de la facture',
      facture_number: 'Numéro de facture',
      facture_date: 'Date de facturation',
      due_date: 'Date d\'échéance',
      payment_status: 'Statut de paiement',
      amount: 'Montant',
      total_amount: 'Montant total',
      paid_amount: 'Montant payé',
      remaining_amount: 'Montant restant',
      payment_date: 'Date de paiement',
      payment_method: 'Méthode de paiement',
      notes: 'Notes',
      save_facture: 'Enregistrer la facture',
      cancel: 'Annuler',
      add_item: 'Ajouter un article',
      item_description: 'Description de l\'article',
      quantity: 'Quantité',
      unit: 'Unité',
      unit_price: 'Prix unitaire',
      total: 'Total',
      subtotal: 'Sous-total',
      tax: 'Taxe',
      discount: 'Remise',
      grand_total: 'Total général',
      terms_and_conditions: 'Conditions générales',
      payment_terms: 'Conditions de paiement',
      thank_you: 'Merci pour votre confiance',
      
      // Contract Status
      draft: 'Brouillon',
      sent: 'Envoyé',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      in_progress: 'En cours',
      on_hold: 'En attente',
      cancelled: 'Annulé',
      
      // Contract Actions
      send_contract: 'Envoyer le contrat',
      approve_contract: 'Approuver le contrat',
      reject_contract: 'Rejeter le contrat',
      cancel_contract: 'Annuler le contrat',
      print_contract: 'Imprimer le contrat',
      email_contract: 'Envoyer par email',
      
      // Contract Messages
      contract_sent: 'Contrat envoyé avec succès',
      contract_approved: 'Contrat approuvé avec succès',
      contract_rejected: 'Contrat rejeté',
      contract_cancelled: 'Contrat annulé',
      contract_saved: 'Contrat enregistré avec succès',
      contract_error: 'Une erreur est survenue lors de l\'enregistrement du contrat',
      
      // Contract Types
      service_contract: 'Contrat de service',
      sales_contract: 'Contrat de vente',
      rental_contract: 'Contrat de location',
      employment_contract: 'Contrat de travail',
      nda_agreement: 'Accord de confidentialité',
      
      // Contract Fields
      contract_title: 'Titre du contrat',
      contract_type: 'Type de contrat',
      start_date: 'Date de début',
      end_date: 'Date de fin',
      contract_value: 'Valeur du contrat',
      payment_schedule: 'Échéancier de paiement',
      milestones: 'Jalons',
      deliverables: 'Livrables',
      terms: 'Conditions',
      
      // Contract Templates
      select_template: 'Sélectionner un modèle',
      create_from_template: 'Créer à partir d\'un modèle',
      save_as_template: 'Enregistrer comme modèle',
      template_name: 'Nom du modèle',
      template_description: 'Description du modèle',
      
      // Contract Signatures
      sign_contract: 'Signer le contrat',
      signer_name: 'Nom du signataire',
      signer_email: 'Email du signataire',
      signer_role: 'Rôle du signataire',
      signature: 'Signature',
      signed_on: 'Signé le',
      signature_pending: 'Signature en attente',
      
      // Contract History
      contract_history: 'Historique du contrat',
      version_history: 'Historique des versions',
      change_log: 'Journal des modifications',
      version: 'Version',
      changed_by: 'Modifié par',
      change_date: 'Date de modification',
      changes: 'Modifications',
      
      // Contract Alerts
      contract_expiring_soon: 'Contrat arrivant à expiration bientôt',
      contract_expired: 'Contrat expiré',
      renewal_required: 'Renouvellement requis',
      action_required: 'Action requise',
      
      // Contract Settings
      notification_settings: 'Paramètres de notification',
      email_notifications: 'Notifications par email',
      reminder_days: 'Jours de rappel',
      auto_renewal: 'Renouvellement automatique',
      
      // Contract Reports
      generate_report: 'Générer un rapport',
      export_contracts: 'Exporter les contrats',
      report_type: 'Type de rapport',
      date_range: 'Période',
      status_filter: 'Filtre par statut',
      
      // Contract Categories
      all_contracts: 'Tous les contrats',
      my_contracts: 'Mes contrats',
      team_contracts: 'Contrats de l\'équipe',
      expired_contracts: 'Contrats expirés',
      expiring_soon: 'Expire bientôt',
      
      // Contract Search
      search_placeholder: 'Rechercher des contrats...',
      advanced_search: 'Recherche avancée',
      filter_by: 'Filtrer par',
      sort_by: 'Trier par',
      
      // Contract Permissions
      view_contract: 'Voir le contrat',
      edit_contract: 'Modifier le contrat',
      delete_contract: 'Supprimer le contrat',
      export_contract: 'Exporter le contrat',
      share_contract: 'Partager le contrat',
      
      // Contract Sharing
      share_with: 'Partager avec',
      share_message: 'Message (optionnel)',
      share_permissions: 'Permissions',
      can_view: 'Peut voir',
      can_edit: 'Peut modifier',
      can_comment: 'Peut commenter',
      
      // Contract Comments
      add_comment: 'Ajouter un commentaire',
      comments: 'Commentaires',
      no_comments: 'Aucun commentaire',
      comment_placeholder: 'Ajoutez un commentaire...',
      post_comment: 'Publier le commentaire',
      
      // Contract Attachments
      attachments: 'Pièces jointes',
      add_attachment: 'Ajouter une pièce jointe',
      no_attachments: 'Aucune pièce jointe',
      file_name: 'Nom du fichier',
      file_size: 'Taille',
      uploaded_by: 'Téléversé par',
      upload_date: 'Date de téléversement',
      
      // Contract Templates
      my_templates: 'Mes modèles',
      team_templates: 'Modèles de l\'équipe',
      public_templates: 'Modèles publics',
      create_template: 'Créer un modèle',
      template_details: 'Détails du modèle',
      
      // Contract Workflow
      workflow: 'Workflow',
      workflow_steps: 'Étapes du workflow',
      add_step: 'Ajouter une étape',
      step_name: 'Nom de l\'étape',
      step_description: 'Description de l\'étape',
      assign_to: 'Assigner à',
      due_in_days: 'Échéance (jours)',
      
      // Contract Approvals
      approvals: 'Approbations',
      approval_required: 'Approbation requise',
      approved_by: 'Approuvé par',
      approval_date: 'Date d\'approbation',
      approval_notes: 'Notes d\'approbation',
      request_approval: 'Demander une approbation',
      approve: 'Approuver',
      reject: 'Rejeter',
      
      // Contract Notifications
      notifications: 'Notifications',
      notification_preferences: 'Préférences de notification',
      email_alerts: 'Alertes par email',
      in_app_notifications: 'Notifications dans l\'application',
      
      // Contract Integration
      integrations: 'Intégrations',
      connect_app: 'Connecter une application',
      available_integrations: 'Intégrations disponibles',
      configure: 'Configurer',
      
      // Contract Audit
      audit_log: 'Journal d\'audit',
      audit_trail: 'Piste d\'audit',
      user: 'Utilisateur',
      action: 'Action',
      timestamp: 'Horodatage',
      ip_address: 'Adresse IP',
      
      // Contract Help
      help_center: 'Centre d\'aide',
      documentation: 'Documentation',
      contact_support: 'Contacter le support',
      feedback: 'Commentaires',
      
      // Contract Dashboard
      contract_overview: 'Aperçu des contrats',
      recent_activity: 'Activité récente',
      upcoming_deadlines: 'Échéances à venir',
      contract_health: 'État des contrats',
      
      // Contract Settings
      general_settings: 'Paramètres généraux',
      security_settings: 'Paramètres de sécurité',
      user_management: 'Gestion des utilisateurs',
      team_settings: 'Paramètres de l\'équipe',
      
      // Contract API
      api_documentation: 'Documentation API',
      api_keys: 'Clés API',
      generate_api_key: 'Générer une clé API',
      revoke: 'Révoquer',
      
      // Contract Billing
      billing: 'Facturation',
      subscription: 'Abonnement',
      payment_method: 'Méthode de paiement',
      invoice_history: 'Historique des factures',
      
      // Contract Support
      support: 'Support',
      help_articles: 'Articles d\'aide',
      video_tutorials: 'Tutoriels vidéo',
      community_forum: 'Forum communautaire',
      
      // Contract Legal
      terms_of_service: 'Conditions d\'utilisation',
      privacy_policy: 'Politique de confidentialité',
      data_processing_agreement: 'Accord de traitement des données',
      
      // Contract Status Badges
      status_draft: 'Brouillon',
      status_active: 'Actif',
      status_pending: 'En attente',
      status_completed: 'Terminé',
      status_expired: 'Expiré',
      status_archived: 'Archivé',
      
      // Contract Priority
      priority: 'Priorité',
      priority_low: 'Basse',
      priority_medium: 'Moyenne',
      priority_high: 'Haute',
      priority_critical: 'Critique',
      
      // Contract Tags
      tags: 'Étiquettes',
      add_tag: 'Ajouter une étiquette',
      popular_tags: 'Étiquettes populaires',
      
      // Contract Custom Fields
      custom_fields: 'Champs personnalisés',
      add_custom_field: 'Ajouter un champ personnalisé',
      field_name: 'Nom du champ',
      field_type: 'Type de champ',
      field_value: 'Valeur du champ',
      
      // Contract Export
      export_format: 'Format d\'exportation',
      export_options: 'Options d\'exportation',
      include_attachments: 'Inclure les pièces jointes',
      include_comments: 'Inclure les commentaires',
      
      // Contract Print
      print_options: 'Options d\'impression',
      print_preview: 'Aperçu avant impression',
      page_size: 'Taille de page',
      orientation: 'Orientation',
      
      // Contract Email
      email_template: 'Modèle d\'email',
      email_subject: 'Objet de l\'email',
      email_body: 'Corps de l\'email',
      send_copy: 'M\'envoyer une copie',
      
      // Contract Reminders
      reminders: 'Rappels',
      set_reminder: 'Définir un rappel',
      reminder_date: 'Date du rappel',
      reminder_message: 'Message de rappel',
      
      // Contract Tasks
      tasks: 'Tâches',
      add_task: 'Ajouter une tâche',
      task_name: 'Nom de la tâche',
      due_date: 'Date d\'échéance',
      assignee: 'Responsable',
      
      // Contract Notes
      notes: 'Notes',
      add_note: 'Ajouter une note',
      note_title: 'Titre de la note',
      note_content: 'Contenu de la note',
      
      // Contract Calendar
      calendar: 'Calendrier',
      calendar_view: 'Vue calendrier',
      day_view: 'Vue jour',
      week_view: 'Vue semaine',
      month_view: 'Vue mois',
      
      // Contract Templates
      contract_templates: 'Modèles de contrats',
      create_contract_template: 'Créer un modèle de contrat',
      edit_contract_template: 'Modifier le modèle de contrat',
      delete_contract_template: 'Supprimer le modèle de contrat',
      
      // Contract Categories
      contract_categories: 'Catégories de contrats',
      add_category: 'Ajouter une catégorie',
      category_name: 'Nom de la catégorie',
      category_description: 'Description de la catégorie',
      
      // Contract Types
      contract_types: 'Types de contrats',
      add_contract_type: 'Ajouter un type de contrat',
      contract_type_name: 'Nom du type de contrat',
      contract_type_description: 'Description du type de contrat',
      
      // Contract Statuses
      contract_statuses: 'Statuts de contrats',
      add_status: 'Ajouter un statut',
      status_name: 'Nom du statut',
      status_description: 'Description du statut',
      
      // Contract Workflows
      contract_workflows: 'Workflows de contrats',
      create_workflow: 'Créer un workflow',
      workflow_name: 'Nom du workflow',
      workflow_description: 'Description du workflow',
      
      // Contract Approvals
      contract_approvals: 'Approbations de contrats',
      request_approval: 'Demander une approbation',
      approval_workflow: 'Workflow d\'approbation',
      approval_notes: 'Notes d\'approbation',
      
      // Contract Signatures
      contract_signatures: 'Signatures de contrats',
      request_signature: 'Demander une signature',
      sign_contract: 'Signer le contrat',
      signature_status: 'Statut de la signature',
      
      // Contract Alerts
      contract_alerts: 'Alertes de contrats',
      set_alert: 'Définir une alerte',
      alert_type: 'Type d\'alerte',
      alert_recipients: 'Destinataires de l\'alerte',
      
      // Contract Reports
      contract_reports: 'Rapports de contrats',
      generate_report: 'Générer un rapport',
      report_type: 'Type de rapport',
      report_period: 'Période du rapport',
      
      // Contract Settings
      contract_settings: 'Paramètres des contrats',
      general_settings: 'Paramètres généraux',
      notification_settings: 'Paramètres de notification',
      security_settings: 'Paramètres de sécurité',
      
      // Contract API
      contract_api: 'API des contrats',
      api_documentation: 'Documentation de l\'API',
      api_keys: 'Clés API',
      api_usage: 'Utilisation de l\'API',
      
      // Contract Help
      contract_help: 'Aide sur les contrats',
      help_center: 'Centre d\'aide',
      contact_support: 'Contacter le support',
      video_tutorials: 'Tutoriels vidéo',
      
      // Contact Information
      contact_information: 'Informations de contact',
      contact_person: 'Personne à contacter',
      contact_name: 'Nom du contact',
      contact_email: 'Email du contact',
      contact_phone: 'Téléphone du contact',
      contact_mobile: 'Mobile du contact',
      contact_fax: 'Fax du contact',
      contact_position: 'Poste du contact',
      contact_department: 'Département du contact',
      
      // Address Information
      address: 'Adresse',
      street_address: 'Adresse',
      address_line1: 'Ligne d\'adresse 1',
      address_line2: 'Ligne d\'adresse 2',
      city: 'Ville',
      state_province: 'État/Province',
      postal_code: 'Code postal',
      country: 'Pays',
      
      // Phone Numbers
      phone_number: 'Numéro de téléphone',
      phone: 'Téléphone',
      mobile: 'Mobile',
      fax: 'Fax',
      telephone: 'Téléphone',
      extension: 'Poste',
      
      // Email
      email: 'Email',
      email_address: 'Adresse email',
      primary_email: 'Email principal',
      secondary_email: 'Email secondaire',
      billing_email: 'Email de facturation',
      
      // Additional Contact Fields
      website: 'Site web',
      company_name: 'Nom de l\'entreprise',
      company_registration: 'Immatriculation',
      vat_number: 'Numéro de TVA',
      tax_identification: 'Numéro d\'identification fiscale',
      
      // Social Media
      social_media: 'Réseaux sociaux',
      linkedin: 'LinkedIn',
      twitter: 'Twitter',
      facebook: 'Facebook',
      instagram: 'Instagram',
      
      // Legal
      contract_legal: 'Mentions légales',
      terms_of_service: 'Conditions d\'utilisation',
      privacy_policy: 'Politique de confidentialité',
      cookie_policy: 'Politique relative aux cookies',
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
