import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
// If using HTTP backend to load translations:

// Import translation files
import enTeams from "./locales/en/teams.json";
import roTeams from "./locales/ro/teams.json";
import enInventory from "./locales/en/inventory.json";
import roInventory from "./locales/ro/inventory.json";
import enDebug from "./locales/en/debug.json";
import roDebug from "./locales/ro/debug.json";
import enDesktop from "./locales/en/desktop.json";
import roDesktop from "./locales/ro/desktop.json";
import enUserActivity from "./locales/en/userActivity.json";
import roUserActivity from "./locales/ro/userActivity.json";
import { enSidebar } from "./i18n/en/sidebar";
import { roSidebar } from "./i18n/ro/sidebar";

// Define resources directly for simplicity initially
// Later, you might switch to HttpApi to load from public/locales
const resources = {
  en: {
    translation: {
      // Add initial keys here
      language: "Language",
      languages: {
        en: "English",
        ro: "Romanian",
        fr: "French",
        de: "German",
      },
      sidebar: enSidebar,
      overview: {
        title: "Overview",
        projects: "Projects",
        materials: "Materials",
        deliveries: "Deliveries",
        activeProjects: "Active projects",
        materialsNeedingAttention: "Materials needing attention",
        pendingDeliveries: "Pending deliveries",
        announcements: "Announcements",
        createdOn: "Created on",
        pending: "Pending",
        viewInventory: "View Inventory",
        viewAllProjects: "View All Projects",
        materialsDescription:
          "Materials with low stock or pending supplementary quantities",
        noMaterialsNeedingAttention: "No materials currently need attention",
        quantity: "Quantity",
        supplementary: "Supplementary",
        recentAnnouncements: "Recent Supplier Announcements",
        announcementsDescription:
          "Recent delivery announcements from suppliers",
        noAnnouncements: "No recent supplier announcements",
      },
      common: {
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        confirm: "Confirm",
        add: "Add",
        edit: "Edit",
        view: "View",
        close: "Close",
        actions: "Actions",
        loading: "Loading...",
        noResults: "No results.",
        refresh: "Refresh",
        viewAll: "View All",
        error: "Error",
        retry: "Try again",
      },
      // Vechea definiție a inventarului - înlocuită cu fișierul de traducere
      /*inventory: {
        pageTitle: "Inventory Management",
        projectInventory: "Project Inventory",
        companyInventory: "Company Inventory",
        goToProjectInventory: "Go to Project Inventory",
        goToCompanyInventory: "Go to Company Inventory",
        uploadExcel: "Upload Excel",
        exportToExcel: "Export to Excel",
        exportSuccess: "Export Successful",
        exportSuccessDesc: "Inventory data has been exported to Excel.",
        exportError: "Export Failed",
        exportErrorDesc: "Failed to export inventory data.",
        addMaterial: "Add Material",
        searchPlaceholder: "Search materials...",
        selectProject: "Select Project",
        createProject: "Create Project",
        selectProjectPrompt: "Please select or create a project to view inventory.",
        noMaterials: "No materials found. Add materials to your inventory.",
        noProject: "No Project",
        allMaterials: "All Materials",
        overviewTitle: "Inventory Overview",
        tabs: {
          inventory: "Inventory",
          announcements: "Supplier Announcements",
        },
        supplierAnnouncement: {
          title: "Supplier Announcements Upload",
          listTitle: "Supplier Announcements",
          supplierName: "Supplier Name",
          supplierNamePlaceholder: "Enter supplier name",
          note: "Note",
          notePlaceholder: "Additional information about this announcement",
          files: "Upload Files",
          dragDrop: "Drag and drop files here or click to browse",
          supportedFormats: "Supported formats: Images, PDF, Excel",
          selectedFiles: "Selected Files",
          uploading: "Uploading...",
          submitAnnouncement: "Submit Announcement",
          supplier: "Supplier",
          date: "Date",
          status: "Status",
          pending: "Pending",
          confirmed: "Confirmed",
          rejected: "Rejected",
          noAnnouncements: "No supplier announcements found",
          selectProject: "Select a project to view announcements",
          viewTitle: "Supplier Announcement",
          from: "From {{supplier}} on {{date}}",
          confirm: "Confirm Delivery",
          reject: "Reject Delivery",
        },
        addDialog: {
          title: "Add New Material",
          description: "Enter details. Click save when done.",
        },
        form: {
          name: "Name",
          namePlaceholder: "Material Name",
          dimension: "Dimension",
          dimensionPlaceholder: "e.g., 100x50, DN25",
          unit: "Unit",
          unitPlaceholder: "e.g., pcs, m, kg",
          quantity: "Quantity",
          manufacturer: "Manufacturer",
          manufacturerPlaceholder: "Manufacturer Name",
          category: "Category",
          categoryPlaceholder: "e.g., HVAC, Electric",
          managerFields: "Manager Fields",
          managerFieldsDescription: "These fields are only visible to managers",
          costPerUnit: "Cost Per Unit",
          supplierId: "Supplier ID",
          supplierIdPlaceholder: "Supplier identifier",
          lastOrderDate: "Last Order Date",
          location: "Storage Location",
          locationPlaceholder: "e.g., Warehouse A, Shelf B3",
          minStockLevel: "Min Stock Level",
          maxStockLevel: "Max Stock Level",
          notes: "Notes",
          notesPlaceholder: "Additional information about this material",
        },
        deleteDialog: {
          title: "Are you absolutely sure?",
          description:
            "This action cannot be undone. This will permanently delete the material",
        },
        adjustDialog: {
          title: "Adjust Supplementary Quantity",
          description:
            "Adjust supplementary quantity for {{materialName}}. Current: {{currentValue}}",
          quantityPlaceholder: "Enter quantity",
          subtract: "Subtract",
          add: "Add",
        },
        confirmDialog: {
          title: "Confirm Supplementary Quantity",
          description:
            "Confirm procurement status for {{materialName}} (Requested: {{requestedValue}}).",
          optionFull: "Fulfilled entirely ({{value}})",
          optionPartial: "Partially fulfilled",
          optionNone: "Could not procure",
          receivedLabel: "Received:",
          quantityPlaceholder: "Quantity",
        },
        errors: {
          invalidPartialQuantity: "Invalid partial quantity entered.",
          invalidConfirmationOption: "Invalid confirmation option selected.",
          confirmFailed:
            "Failed to confirm supplementary quantity via function: {{details}}",
          confirmFunctionError:
            "Function failed to confirm quantity: {{details}}",
          unexpectedConfirmError:
            "An unexpected error occurred during confirmation: {{message}}",
          deleteFailed: "Failed to delete material via function: {{details}}",
          deleteFunctionError:
            "Function failed to delete material: {{details}}",
          unexpectedDeleteError: "An unexpected error occurred: {{message}}",
          invalidAdjustmentQuantity: "Invalid quantity entered for adjustment.",
          adjustFailed:
            "Failed to adjust supplementary quantity via function: {{details}}",
          adjustFunctionError:
            "Function failed to adjust quantity: {{details}}",
          unexpectedAdjustError:
            "An unexpected error occurred during adjustment: {{message}}",
          fetchFailed: "Failed to load materials. {{message}}",
          noFiles: "No files selected",
          noFilesDesc: "Please select at least one file to upload.",
        },
        columns: {
          // Add keys for column headers
          name: "Name",
          dimension: "Dimension",
          unit: "Unit",
          quantity: "Quantity",
          suplimentar: "Supplementary",
          manufacturer: "Manufacturer",
          category: "Category",
          project: "Project",
        },
        actions: {
          // Add keys for dropdown actions
          openMenu: "Open menu",
          copyId: "Copy Material ID",
          confirmSuplimentar: "Confirm Suplimentar",
          adjustTooltip: "Click to adjust supplementary quantity",
        },
      },*/
    },
  },
  ro: {
    translation: {
      language: "Limbă",
      languages: {
        en: "Engleză",
        ro: "Română",
        fr: "Franceză",
        de: "Germană",
      },
      sidebar: roSidebar,
      common: {
        save: "Salvează",
        cancel: "Anulează",
        delete: "Șterge",
        confirm: "Confirmă",
        add: "Adaugă",
        edit: "Editează",
        view: "Vizualizează",
        close: "Închide",
        actions: "Acțiuni",
        loading: "Se încarcă...",
        noResults: "Niciun rezultat.",
        refresh: "Reîmprospătare",
        viewAll: "Vezi toate",
        error: "Eroare",
        retry: "Încearcă din nou",
      },
      teams: roTeams,
      inventory: roInventory,
      debug: roDebug,
      desktop: roDesktop,
      userActivity: roUserActivity,
      // Vechea definiție a inventarului - înlocuită cu fișierul de traducere
      /*inventory: {
        pageTitle: "Management Inventar",
        projectInventory: "Inventar Proiect",
        companyInventory: "Inventar Companie",
        goToProjectInventory: "Mergi la Inventar Proiect",
        goToCompanyInventory: "Mergi la Inventar Companie",
        uploadExcel: "Încarcă Excel",
        exportToExcel: "Exportă în Excel",
        exportSuccess: "Export Reușit",
        exportSuccessDesc: "Datele de inventar au fost exportate în Excel.",
        exportError: "Export Eșuat",
        exportErrorDesc: "Nu s-au putut exporta datele de inventar.",
        addMaterial: "Adaugă Material",
        searchPlaceholder: "Caută materiale...",
        selectProject: "Selectează Proiect",
        createProject: "Creează Proiect",
        selectProjectPrompt: "Te rugăm să selectezi sau să creezi un proiect pentru a vizualiza inventarul.",
        noMaterials: "Nu s-au găsit materiale. Adaugă materiale în inventar.",
        noProject: "Fără Proiect",
        allMaterials: "Toate Materialele",
        overviewTitle: "Sumar Inventar",
        addDialog: {
          title: "Adaugă Material Nou",
          description: "Introduceți detalii. Apăsați salvează la final.",
        },
        form: {
          name: "Nume",
          namePlaceholder: "Nume Material",
          dimension: "Dimensiune",
          dimensionPlaceholder: "ex: 100x50, DN25",
          unit: "Unitate",
          unitPlaceholder: "ex: buc, m, kg",
          quantity: "Cantitate",
          manufacturer: "Producător",
          manufacturerPlaceholder: "Nume Producător",
          category: "Categorie",
          categoryPlaceholder: "ex: HVAC, Electric",
          managerFields: "Câmpuri pentru Manageri",
          managerFieldsDescription:
            "Aceste câmpuri sunt vizibile doar pentru manageri",
          costPerUnit: "Cost per Unitate",
          supplierId: "ID Furnizor",
          supplierIdPlaceholder: "Identificator furnizor",
          lastOrderDate: "Data Ultimei Comenzi",
          location: "Locație Depozitare",
          locationPlaceholder: "ex: Depozit A, Raft B3",
          minStockLevel: "Nivel Minim Stoc",
          maxStockLevel: "Nivel Maxim Stoc",
          notes: "Note",
          notesPlaceholder: "Informații suplimentare despre acest material",
        },
        deleteDialog: {
          title: "Sunteți absolut sigur?",
          description:
            "Această acțiune nu poate fi anulată. Va șterge permanent materialul",
        },
        adjustDialog: {
          title: "Ajustează Cantitate Suplimentară",
          description:
            "Ajustează cantitatea suplimentară pentru {{materialName}}. Curent: {{currentValue}}",
          quantityPlaceholder: "Introdu cantitatea",
          subtract: "Scade",
          add: "Adaugă",
        },
        confirmDialog: {
          title: "Confirmă Cantitate Suplimentară",
          description:
            "Confirmă statusul achiziției pentru {{materialName}} (Cerut: {{requestedValue}}).",
          optionFull: "Completat în întregime ({{value}})",
          optionPartial: "Completat parțial",
          optionNone: "Nu s-a putut procura",
          receivedLabel: "Primit:",
          quantityPlaceholder: "Cantitate",
        },
        errors: {
          invalidPartialQuantity: "Cantitate parțială invalidă introdusă.",
          invalidConfirmationOption:
            "Opțiune de confirmare invalidă selectată.",
          confirmFailed:
            "Eșec la confirmarea cantității suplimentare via funcție: {{details}}",
          confirmFunctionError:
            "Funcția a eșuat la confirmarea cantității: {{details}}",
          unexpectedConfirmError:
            "Eroare neașteptată la confirmare: {{message}}",
          deleteFailed:
            "Eșec la ștergerea materialului via funcție: {{details}}",
          deleteFunctionError:
            "Funcția a eșuat la ștergerea materialului: {{details}}",
          unexpectedDeleteError: "Eroare neașteptată la ștergere: {{message}}",
          invalidAdjustmentQuantity:
            "Cantitate invalidă introdusă pentru ajustare.",
          adjustFailed:
            "Eșec la ajustarea cantității suplimentare via funcție: {{details}}",
          adjustFunctionError:
            "Funcția a eșuat la ajustarea cantității: {{details}}",
          unexpectedAdjustError: "Eroare neașteptată la ajustare: {{message}}",
          fetchFailed: "Eșec la încărcarea materialelor. {{message}}",
        },
        columns: {
          // Add keys for column headers
          name: "Nume",
          dimension: "Dimensiune",
          unit: "Unitate",
          quantity: "Cantitate",
          suplimentar: "Suplimentar",
          manufacturer: "Producător",
          category: "Categorie",
          project: "Proiect",
        },
        actions: {
          // Add keys for dropdown actions
          openMenu: "Deschide meniu",
          copyId: "Copiază ID Material",
          confirmSuplimentar: "Confirmă Suplimentar",
          adjustTooltip: "Click pentru a ajusta cantitatea suplimentară",
        },
      },*/
      settings: {
        pageTitle: "Setări",
        title: "Setări",
        profile: "Profil",
        appearance: "Aspect",
        notifications: "Notificări",
        advanced: "Avansat",
        profileSettings: "Setări Profil",
        profileDescription:
          "Gestionează informațiile personale și setările contului",
        displayName: "Nume afișat",
        enterName: "Introduceți numele",
        email: "Adresă Email",
        enterEmail: "Introduceți adresa de email",
        emailChangeRestricted:
          "Doar administratorii pot schimba adresele de email",
        role: "Rol",
        roleDescription: "Rolul tău determină ce poți accesa în aplicație",
        appearanceSettings: "Setări Aspect",
        appearanceDescription: "Personalizează aspectul aplicației",
        theme: "Temă",
        lightTheme: "Luminos",
        darkTheme: "Întunecat",
        systemTheme: "Sistem",
        language: "Limbă",
        selectLanguage: "Selectează o limbă",
        notificationSettings: "Setări Notificări",
        notificationDescription: "Controlează cum și când primești notificări",
        enableNotifications: "Activează Notificările",
        enableNotificationsDescription:
          "Primește notificări despre actualizări importante",
        emailNotifications: "Notificări Email",
        emailNotificationsDescription: "Primește notificări prin email",
        pushNotifications: "Notificări Push",
        pushNotificationsDescription: "Primește notificări pe dispozitivul tău",
        advancedSettings: "Setări Avansate",
        advancedDescription:
          "Configurează setări avansate (doar pentru administratori)",
        autoSave: "Salvare automată",
        autoSaveDescription:
          "Salvează automat modificările pe măsură ce le faci",
        dangerZone: "Zonă Periculoasă",
        dangerZoneDescription: "Acțiuni care pot avea consecințe grave",
        resetApplication: "Resetează Aplicația",
        profileSaved: "Profil Salvat",
        profileSavedMessage: "Profilul tău a fost actualizat cu succes",
        appearanceSaved: "Aspect Salvat",
        appearanceSavedMessage: "Setările de aspect au fost actualizate",
        notificationsSaved: "Notificări Salvate",
        notificationsSavedMessage:
          "Preferințele tale de notificare au fost actualizate",
        error: "Eroare",
        errorSavingProfile: "A apărut o eroare la salvarea profilului",
        errorSavingAppearance:
          "A apărut o eroare la salvarea setărilor de aspect",
        errorSavingNotifications:
          "A apărut o eroare la salvarea setărilor de notificare",
      },
      roles: {
        director: "Director",
        manager: "Manager",
        inginer: "Inginer",
        tehnician: "Tehnician",
        magazioner: "Magazioner",
        logistica: "Logistică",
        admin: "Administrator",
        contabil: "Contabil",
        hr: "Manager HR",
        asistent: "Asistent",
        client: "Client",
        furnizor: "Furnizor",
        contractor: "Contractor",
        vizitator: "Vizitator",
        user: "Utilizator",
      },
    },
  },
  fr: {
    translation: {
      language: "Langue",
      languages: {
        en: "Anglais",
        ro: "Roumain",
        fr: "Français",
        de: "Allemand",
      },
      sidebar: {
        home: "Accueil",
        dashboard: "Tableau de Bord",
        projects: "Projets",
        inventory: "Gestion d'Inventaire",
        teams: "Équipes",
        suppliers: "Fournisseurs",
        budget: "Budget",
        reports: "Rapports",
        resources: "Ressources",
        settings: "Paramètres",
        profile: "Profil",
        logout: "Déconnexion",
        help: "Aide",
        schedule: "Calendrier",
        documents: "Documents",
        viewProfile: "Voir le profil",
        dashboardGroup: "Tableau de Bord",
        managementGroup: "Gestion",
        reportsGroup: "Rapports & Ressources",
        debug: "Debug & Développement",
      },
      common: {
        save: "Enregistrer",
        cancel: "Annuler",
        delete: "Supprimer",
        confirm: "Confirmer",
        add: "Ajouter",
        edit: "Modifier",
        view: "Voir",
        close: "Fermer",
        actions: "Actions",
        loading: "Chargement...",
        noResults: "Aucun résultat.",
      },
      // Vechea definiție a inventarului - înlocuită cu fișierul de traducere
      /*inventory: {
        pageTitle: "Gestion d'Inventaire",
        uploadExcel: "Télécharger Excel",
        addMaterial: "Ajouter Matériel",
        searchPlaceholder: "Rechercher matériel...",
        overviewTitle: "Aperçu Inventaire",
        addDialog: {
          title: "Ajouter Nouveau Matériel",
          description:
            "Entrez les détails. Cliquez sur enregistrer lorsque vous avez terminé.",
        },
        form: {
          name: "Nom",
          namePlaceholder: "Nom du Matériel",
          dimension: "Dimension",
          dimensionPlaceholder: "ex: 100x50, DN25",
          unit: "Unité",
          unitPlaceholder: "ex: pcs, m, kg",
          quantity: "Quantité",
          manufacturer: "Fabricant",
          manufacturerPlaceholder: "Nom du Fabricant",
          category: "Catégorie",
          categoryPlaceholder: "ex: CVC, Électrique",
        },
        deleteDialog: {
          title: "Êtes-vous absolument sûr?",
          description:
            "Cette action est irréversible. Cela supprimera définitivement le matériel",
        },
        adjustDialog: {
          title: "Ajuster Quantité Supplémentaire",
          description:
            "Ajuster la quantité supplémentaire pour {{materialName}}. Actuel: {{currentValue}}",
          quantityPlaceholder: "Entrez la quantité",
          subtract: "Soustraire",
          add: "Ajouter",
        },
        confirmDialog: {
          title: "Confirmer Quantité Supplémentaire",
          description:
            "Confirmer le statut d'approvisionnement pour {{materialName}} (Demandé: {{requestedValue}}).",
          optionFull: "Complété entièrement ({{value}})",
          optionPartial: "Partiellement complété",
          optionNone: "Impossible à procurer",
          receivedLabel: "Reçu:",
          quantityPlaceholder: "Quantité",
        },
        errors: {
          // Example error translations
          invalidPartialQuantity: "Quantité partielle invalide.",
          invalidConfirmationOption: "Option de confirmation invalide.",
          confirmFailed: "Échec de la confirmation via fonction: {{details}}",
          confirmFunctionError: "La fonction a échoué à confirmer: {{details}}",
          unexpectedConfirmError:
            "Erreur inattendue lors de la confirmation: {{message}}",
          deleteFailed: "Échec de la suppression via fonction: {{details}}",
          deleteFunctionError: "La fonction a échoué à supprimer: {{details}}",
          unexpectedDeleteError:
            "Erreur inattendue lors de la suppression: {{message}}",
          invalidAdjustmentQuantity: "Quantité invalide pour l'ajustement.",
          adjustFailed: "Échec de l'ajustement via fonction: {{details}}",
          adjustFunctionError: "La fonction a échoué à ajuster: {{details}}",
          unexpectedAdjustError:
            "Erreur inattendue lors de l'ajustement: {{message}}",
          fetchFailed: "Échec du chargement des matériaux. {{message}}",
        },
        columns: {
          // Add keys for column headers
          name: "Nom",
          dimension: "Dimension",
          unit: "Unité",
          quantity: "Quantité",
          suplimentar: "Supplémentaire",
          manufacturer: "Fabricant",
          category: "Catégorie",
        },
        actions: {
          // Add keys for dropdown actions
          openMenu: "Ouvrir le menu",
          copyId: "Copier ID Matériel",
          confirmSuplimentar: "Confirmer Supplémentaire",
          adjustTooltip: "Cliquer pour ajuster la quantité supplémentaire",
        },
      },*/
    },
  },
  de: {
    translation: {
      language: "Sprache",
      languages: {
        en: "Englisch",
        ro: "Rumänisch",
        fr: "Französisch",
        de: "Deutsch",
      },
      sidebar: {
        home: "Startseite",
        dashboard: "Dashboard",
        projects: "Projekte",
        inventory: "Inventarverwaltung",
        teams: "Teams",
        suppliers: "Lieferanten",
        budget: "Budget",
        reports: "Berichte",
        resources: "Ressourcen",
        settings: "Einstellungen",
        profile: "Profil",
        logout: "Abmelden",
        help: "Hilfe",
        schedule: "Zeitplan",
        documents: "Dokumente",
        viewProfile: "Profil anzeigen",
        dashboardGroup: "Dashboard",
        managementGroup: "Verwaltung",
        reportsGroup: "Berichte & Ressourcen",
        debug: "Debug & Entwicklung",
      },
      common: {
        save: "Speichern",
        cancel: "Abbrechen",
        delete: "Löschen",
        confirm: "Bestätigen",
        add: "Hinzufügen",
        edit: "Bearbeiten",
        view: "Ansehen",
        close: "Schließen",
        actions: "Aktionen",
        loading: "Wird geladen...",
        noResults: "Keine Ergebnisse.",
      },
      // Vechea definiție a inventarului - înlocuită cu fișierul de traducere
      /*inventory: {
        pageTitle: "Inventarverwaltung",
        uploadExcel: "Excel Hochladen",
        addMaterial: "Material Hinzufügen",
        searchPlaceholder: "Materialien suchen...",
        overviewTitle: "Inventarübersicht",
        addDialog: {
          title: "Neues Material Hinzufügen",
          description: "Details eingeben. Zum Abschluss speichern klicken.",
        },
        form: {
          name: "Name",
          namePlaceholder: "Materialname",
          dimension: "Abmessung",
          dimensionPlaceholder: "z.B. 100x50, DN25",
          unit: "Einheit",
          unitPlaceholder: "z.B. Stk, m, kg",
          quantity: "Menge",
          manufacturer: "Hersteller",
          manufacturerPlaceholder: "Herstellername",
          category: "Kategorie",
          categoryPlaceholder: "z.B. HLK, Elektro",
        },
        deleteDialog: {
          title: "Sind Sie absolut sicher?",
          description:
            "Diese Aktion kann nicht rückgängig gemacht werden. Das Material wird dauerhaft gelöscht",
        },
        adjustDialog: {
          title: "Zusatzmenge Anpassen",
          description:
            "Zusatzmenge für {{materialName}} anpassen. Aktuell: {{currentValue}}",
          quantityPlaceholder: "Menge eingeben",
          subtract: "Abziehen",
          add: "Hinzufügen",
        },
        confirmDialog: {
          title: "Zusatzmenge Bestätigen",
          description:
            "Beschaffungsstatus für {{materialName}} bestätigen (Angefordert: {{requestedValue}}).",
          optionFull: "Vollständig erfüllt ({{value}})",
          optionPartial: "Teilweise erfüllt",
          optionNone: "Konnte nicht beschafft werden",
          receivedLabel: "Erhalten:",
          quantityPlaceholder: "Menge",
        },
        errors: {
          // Example error translations
          invalidPartialQuantity: "Ungültige Teilmenge eingegeben.",
          invalidConfirmationOption: "Ungültige Bestätigungsoption ausgewählt.",
          confirmFailed: "Bestätigung via Funktion fehlgeschlagen: {{details}}",
          confirmFunctionError: "Funktion konnte nicht bestätigen: {{details}}",
          unexpectedConfirmError:
            "Unerwarteter Fehler bei Bestätigung: {{message}}",
          deleteFailed: "Löschen via Funktion fehlgeschlagen: {{details}}",
          deleteFunctionError: "Funktion konnte nicht löschen: {{details}}",
          unexpectedDeleteError:
            "Unerwarteter Fehler beim Löschen: {{message}}",
          invalidAdjustmentQuantity: "Ungültige Menge für Anpassung.",
          adjustFailed: "Anpassung via Funktion fehlgeschlagen: {{details}}",
          adjustFunctionError: "Funktion konnte nicht anpassen: {{details}}",
          unexpectedAdjustError:
            "Unerwarteter Fehler bei Anpassung: {{message}}",
          fetchFailed: "Materialien konnten nicht geladen werden. {{message}}",
        },
        columns: {
          // Add keys for column headers
          name: "Name",
          dimension: "Abmessung",
          unit: "Einheit",
          quantity: "Menge",
          suplimentar: "Zusätzlich",
          manufacturer: "Hersteller",
          category: "Kategorie",
        },
        actions: {
          // Add keys for dropdown actions
          openMenu: "Menü öffnen",
          copyId: "Material-ID kopieren",
          confirmSuplimentar: "Zusatzmenge bestätigen",
          adjustTooltip: "Klicken, um Zusatzmenge anzupassen",
        },
      },*/
      teams: enTeams,
      inventory: enInventory,
      debug: enDebug,
      desktop: enDesktop,
      userActivity: enUserActivity,
      settings: {
        pageTitle: "Settings",
        title: "Settings",
        profile: "Profile",
        appearance: "Appearance",
        notifications: "Notifications",
        advanced: "Advanced",
        profileSettings: "Profile Settings",
        profileDescription:
          "Manage your personal information and account settings",
        displayName: "Display Name",
        enterName: "Enter your name",
        email: "Email Address",
        enterEmail: "Enter your email address",
        emailChangeRestricted: "Only administrators can change email addresses",
        role: "Role",
        roleDescription:
          "Your role determines what you can access in the application",
        appearanceSettings: "Appearance Settings",
        appearanceDescription: "Customize the look and feel of the application",
        theme: "Theme",
        lightTheme: "Light",
        darkTheme: "Dark",
        systemTheme: "System",
        language: "Language",
        selectLanguage: "Select a language",
        notificationSettings: "Notification Settings",
        notificationDescription:
          "Control how and when you receive notifications",
        enableNotifications: "Enable Notifications",
        enableNotificationsDescription:
          "Receive notifications about important updates",
        emailNotifications: "Email Notifications",
        emailNotificationsDescription: "Receive notifications via email",
        pushNotifications: "Push Notifications",
        pushNotificationsDescription: "Receive notifications on your device",
        advancedSettings: "Advanced Settings",
        advancedDescription: "Configure advanced settings (admin only)",
        autoSave: "Auto-save",
        autoSaveDescription: "Automatically save changes as you make them",
        dangerZone: "Danger Zone",
        dangerZoneDescription: "Actions that can have serious consequences",
        resetApplication: "Reset Application",
        profileSaved: "Profile Saved",
        profileSavedMessage: "Your profile has been updated successfully",
        appearanceSaved: "Appearance Saved",
        appearanceSavedMessage: "Your appearance settings have been updated",
        notificationsSaved: "Notifications Saved",
        notificationsSavedMessage:
          "Your notification preferences have been updated",
        error: "Error",
        errorSavingProfile: "There was an error saving your profile",
        errorSavingAppearance:
          "There was an error saving your appearance settings",
        errorSavingNotifications:
          "There was an error saving your notification settings",
      },
      roles: {
        director: "Director",
        manager: "Manager",
        inginer: "Engineer",
        tehnician: "Technician",
        magazioner: "Warehouse Worker",
        logistica: "Logistics",
        admin: "Administrator",
        contabil: "Accountant",
        hr: "HR Manager",
        asistent: "Assistant",
        client: "Client",
        furnizor: "Supplier",
        contractor: "Contractor",
        vizitator: "Visitor",
        user: "User",
      },
    },
  },
};

i18n
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  .init({
    debug: false, // Disable debug mode for better performance
    fallbackLng: "ro", // Set Romanian as fallback language
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
      skipOnVariables: true, // Skip interpolation when variables are undefined (performance boost)
    },
    resources: resources,
    detection: {
      // order and from where user language should be detected
      order: ["localStorage", "navigator"],
      // keys or params to lookup language from
      lookupLocalStorage: "i18nextLng",
      // cache user language on
      caches: ["localStorage"],
    },
    // Force Romanian language
    lng: "ro",
    // Performance optimizations
    load: "languageOnly", // Only load language, not country specific (e.g. 'en' instead of 'en-US')
    ns: ["translation"], // Only use the 'translation' namespace
    defaultNS: "translation",
    keySeparator: ".", // Use dot notation for keys
    nsSeparator: ":", // Use colon for namespace separation
    returnEmptyString: false, // Don't return empty strings for missing translations
    returnNull: false, // Don't return null for missing translations
    react: {
      useSuspense: false, // Disable Suspense for i18next
      bindI18n: "languageChanged loaded", // Only trigger re-render on language change and loaded
      bindI18nStore: "", // Don't trigger re-render on store changes
      transEmptyNodeValue: "", // Empty value for empty nodes
    },
  });

export default i18n;
