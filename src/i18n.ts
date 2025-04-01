import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
// If using HTTP backend to load translations:
// import HttpApi from 'i18next-http-backend';

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
      sidebar: {
        home: "Overview",
        dashboard: "Dashboard",
        projects: "Projects",
        inventory: "Inventory Management",
        teams: "Teams",
        suppliers: "Suppliers",
        budget: "Budget",
        reports: "Reports",
        resources: "Resources",
        settings: "Settings",
      },
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
      },
      inventory: {
        pageTitle: "Inventory Management",
        uploadExcel: "Upload Excel",
        addMaterial: "Add Material",
        searchPlaceholder: "Search materials...",
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
        },
        actions: {
          // Add keys for dropdown actions
          openMenu: "Open menu",
          copyId: "Copy Material ID",
          confirmSuplimentar: "Confirm Suplimentar",
          adjustTooltip: "Click to adjust supplementary quantity",
        },
      },
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
      sidebar: {
        home: "Acasă",
        dashboard: "Panou Control",
        projects: "Proiecte",
        inventory: "Management Inventar",
        teams: "Echipe",
        suppliers: "Furnizori",
        budget: "Buget",
        reports: "Rapoarte",
        resources: "Resurse",
        settings: "Setări",
      },
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
      },
      inventory: {
        pageTitle: "Management Inventar",
        uploadExcel: "Încarcă Excel",
        addMaterial: "Adaugă Material",
        searchPlaceholder: "Caută materiale...",
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
        },
        actions: {
          // Add keys for dropdown actions
          openMenu: "Deschide meniu",
          copyId: "Copiază ID Material",
          confirmSuplimentar: "Confirmă Suplimentar",
          adjustTooltip: "Click pentru a ajusta cantitatea suplimentară",
        },
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
      // Add French translations for inventory section (example, needs proper translation)
      inventory: {
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
      },
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
      // Add German translations for inventory section (example, needs proper translation)
      inventory: {
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
      },
    },
  },
};

i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: true, // Set to false in production
    fallbackLng: "en", // Fallback language if detection fails
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: resources,
    detection: {
      // order and from where user language should be detected
      order: ["localStorage", "navigator", "htmlTag", "path", "subdomain"],
      // keys or params to lookup language from
      lookupLocalStorage: "i18nextLng",
      // cache user language on
      caches: ["localStorage"],
      // optional htmlTag with lang attribute, the default is:
      htmlTag: document.documentElement,
    },
    // If using HttpApi backend:
    // backend: {
    //   loadPath: '/locales/{{lng}}/{{ns}}.json',
    // },
  });

export default i18n;
