/**
 * Constante pentru aplicație
 * Acest fișier conține constante utilizate în aplicație
 */

// Constante pentru autentificare
export const AUTH_CONSTANTS = {
  // Durata sesiunii în secunde (1 zi)
  SESSION_DURATION: 86400,
  // Durata token-ului de refresh în secunde (30 zile)
  REFRESH_TOKEN_DURATION: 2592000,
  // Durata token-ului de resetare a parolei în secunde (1 oră)
  RESET_TOKEN_DURATION: 3600,
  // Durata token-ului de confirmare a emailului în secunde (1 zi)
  CONFIRMATION_TOKEN_DURATION: 86400,
  // Durata minimă a parolei
  MIN_PASSWORD_LENGTH: 8,
  // Durata de așteptare pentru retrimiterea emailului de confirmare în secunde (60 secunde)
  RESEND_CONFIRMATION_DELAY: 60,
  // Durata de așteptare pentru retrimiterea emailului de resetare a parolei în secunde (60 secunde)
  RESEND_RESET_DELAY: 60,
  // Numărul maxim de încercări de autentificare
  MAX_LOGIN_ATTEMPTS: 5,
  // Durata de blocare a contului în secunde (15 minute)
  ACCOUNT_LOCK_DURATION: 900,
};

// Constante pentru API
export const API_CONSTANTS = {
  // URL-ul API-ului
  API_URL: import.meta.env.VITE_API_URL || '{process.env.BTVPNZSMRFRLWCZANBCG_SUPABASE}',
  // Timeout-ul pentru request-uri în milisecunde (30 secunde)
  REQUEST_TIMEOUT: 30000,
  // Numărul de reîncercări pentru request-uri
  REQUEST_RETRIES: 3,
  // Durata de așteptare între reîncercări în milisecunde (1 secundă)
  REQUEST_RETRY_DELAY: 1000,
  // Durata de cache pentru request-uri în milisecunde (5 minute)
  CACHE_DURATION: 300000,
  // Dimensiunea paginii pentru request-uri paginabile
  PAGE_SIZE: 20,
};

// Constante pentru UI
export const UI_CONSTANTS = {
  // Durata animațiilor în milisecunde
  ANIMATION_DURATION: 300,
  // Durata toast-urilor în milisecunde (5 secunde)
  TOAST_DURATION: 5000,
  // Durata tooltip-urilor în milisecunde (1 secundă)
  TOOLTIP_DURATION: 1000,
  // Durata de așteptare pentru debounce în milisecunde (300 milisecunde)
  DEBOUNCE_DELAY: 300,
  // Durata de așteptare pentru throttle în milisecunde (300 milisecunde)
  THROTTLE_DELAY: 300,
  // Dimensiunea maximă a fișierelor în bytes (10 MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  // Tipurile de fișiere acceptate
  ACCEPTED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
  ],
  // Dimensiunea maximă a imaginilor în bytes (5 MB)
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,
  // Tipurile de imagini acceptate
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  // Dimensiunea maximă a documentelor în bytes (10 MB)
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024,
  // Tipurile de documente acceptate
  ACCEPTED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
  ],
  // Breakpoint-uri pentru responsive design
  BREAKPOINTS: {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
};

// Constante pentru proiecte
export const PROJECT_CONSTANTS = {
  // Statusurile proiectelor
  PROJECT_STATUSES: [
    { value: 'not_started', label: 'Neînceput' },
    { value: 'in_progress', label: 'În progres' },
    { value: 'on_hold', label: 'În așteptare' },
    { value: 'completed', label: 'Finalizat' },
    { value: 'cancelled', label: 'Anulat' },
  ],
  // Prioritățile proiectelor
  PROJECT_PRIORITIES: [
    { value: 'low', label: 'Scăzută' },
    { value: 'medium', label: 'Medie' },
    { value: 'high', label: 'Ridicată' },
    { value: 'urgent', label: 'Urgentă' },
  ],
  // Tipurile de proiecte
  PROJECT_TYPES: [
    { value: 'residential', label: 'Rezidențial' },
    { value: 'commercial', label: 'Comercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'infrastructure', label: 'Infrastructură' },
    { value: 'other', label: 'Altele' },
  ],
};

// Constante pentru inventar
export const INVENTORY_CONSTANTS = {
  // Statusurile materialelor
  MATERIAL_STATUSES: [
    { value: 'in_stock', label: 'În stoc' },
    { value: 'low_stock', label: 'Stoc redus' },
    { value: 'out_of_stock', label: 'Stoc epuizat' },
    { value: 'ordered', label: 'Comandat' },
  ],
  // Unitățile de măsură
  MEASUREMENT_UNITS: [
    { value: 'piece', label: 'Bucată' },
    { value: 'kg', label: 'Kilogram' },
    { value: 'g', label: 'Gram' },
    { value: 'l', label: 'Litru' },
    { value: 'ml', label: 'Mililitru' },
    { value: 'm', label: 'Metru' },
    { value: 'cm', label: 'Centimetru' },
    { value: 'mm', label: 'Milimetru' },
    { value: 'm2', label: 'Metru pătrat' },
    { value: 'm3', label: 'Metru cub' },
    { value: 'set', label: 'Set' },
    { value: 'pack', label: 'Pachet' },
    { value: 'box', label: 'Cutie' },
    { value: 'pallet', label: 'Palet' },
    { value: 'roll', label: 'Rolă' },
    { value: 'sheet', label: 'Foaie' },
    { value: 'pair', label: 'Pereche' },
    { value: 'other', label: 'Altele' },
  ],
  // Categoriile de materiale
  MATERIAL_CATEGORIES: [
    { value: 'construction', label: 'Construcții' },
    { value: 'electrical', label: 'Electrice' },
    { value: 'plumbing', label: 'Sanitare' },
    { value: 'hvac', label: 'HVAC' },
    { value: 'tools', label: 'Unelte' },
    { value: 'hardware', label: 'Hardware' },
    { value: 'paint', label: 'Vopsea' },
    { value: 'lumber', label: 'Cherestea' },
    { value: 'flooring', label: 'Pardoseală' },
    { value: 'roofing', label: 'Acoperiș' },
    { value: 'insulation', label: 'Izolație' },
    { value: 'drywall', label: 'Gips-carton' },
    { value: 'concrete', label: 'Beton' },
    { value: 'masonry', label: 'Zidărie' },
    { value: 'doors', label: 'Uși' },
    { value: 'windows', label: 'Ferestre' },
    { value: 'lighting', label: 'Iluminat' },
    { value: 'safety', label: 'Siguranță' },
    { value: 'other', label: 'Altele' },
  ],
};

// Constante pentru sarcini
export const TASK_CONSTANTS = {
  // Statusurile sarcinilor
  TASK_STATUSES: [
    { value: 'todo', label: 'De făcut' },
    { value: 'in_progress', label: 'În progres' },
    { value: 'done', label: 'Finalizat' },
    { value: 'blocked', label: 'Blocat' },
  ],
  // Prioritățile sarcinilor
  TASK_PRIORITIES: [
    { value: 'low', label: 'Scăzută' },
    { value: 'medium', label: 'Medie' },
    { value: 'high', label: 'Ridicată' },
    { value: 'urgent', label: 'Urgentă' },
  ],
  // Tipurile de sarcini
  TASK_TYPES: [
    { value: 'feature', label: 'Funcționalitate' },
    { value: 'bug', label: 'Bug' },
    { value: 'improvement', label: 'Îmbunătățire' },
    { value: 'documentation', label: 'Documentație' },
    { value: 'other', label: 'Altele' },
  ],
};

// Constante pentru rapoarte
export const REPORT_CONSTANTS = {
  // Tipurile de rapoarte
  REPORT_TYPES: [
    { value: 'project', label: 'Proiect' },
    { value: 'inventory', label: 'Inventar' },
    { value: 'financial', label: 'Financiar' },
    { value: 'custom', label: 'Personalizat' },
  ],
  // Formatele de rapoarte
  REPORT_FORMATS: [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'csv', label: 'CSV' },
    { value: 'json', label: 'JSON' },
  ],
  // Perioadele de rapoarte
  REPORT_PERIODS: [
    { value: 'day', label: 'Zi' },
    { value: 'week', label: 'Săptămână' },
    { value: 'month', label: 'Lună' },
    { value: 'quarter', label: 'Trimestru' },
    { value: 'year', label: 'An' },
    { value: 'custom', label: 'Personalizat' },
  ],
};

// Constante pentru utilizatori
export const USER_CONSTANTS = {
  // Rolurile utilizatorilor
  USER_ROLES: [
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Manager' },
    { value: 'user', label: 'Utilizator' },
    { value: 'guest', label: 'Oaspete' },
  ],
  // Statusurile utilizatorilor
  USER_STATUSES: [
    { value: 'active', label: 'Activ' },
    { value: 'inactive', label: 'Inactiv' },
    { value: 'pending', label: 'În așteptare' },
    { value: 'blocked', label: 'Blocat' },
  ],
};

// Constante pentru notificări
export const NOTIFICATION_CONSTANTS = {
  // Tipurile de notificări
  NOTIFICATION_TYPES: [
    { value: 'info', label: 'Informație' },
    { value: 'success', label: 'Succes' },
    { value: 'warning', label: 'Avertisment' },
    { value: 'error', label: 'Eroare' },
  ],
  // Prioritățile notificărilor
  NOTIFICATION_PRIORITIES: [
    { value: 'low', label: 'Scăzută' },
    { value: 'medium', label: 'Medie' },
    { value: 'high', label: 'Ridicată' },
    { value: 'urgent', label: 'Urgentă' },
  ],
  // Categoriile de notificări
  NOTIFICATION_CATEGORIES: [
    { value: 'system', label: 'Sistem' },
    { value: 'auth', label: 'Autentificare' },
    { value: 'project', label: 'Proiect' },
    { value: 'inventory', label: 'Inventar' },
    { value: 'task', label: 'Sarcină' },
    { value: 'user', label: 'Utilizator' },
    { value: 'report', label: 'Raport' },
    { value: 'other', label: 'Altele' },
  ],
};

// Constante pentru teme
export const THEME_CONSTANTS = {
  // Temele disponibile
  THEMES: [
    { value: 'light', label: 'Luminos' },
    { value: 'dark', label: 'Întunecat' },
    { value: 'system', label: 'Sistem' },
  ],
  // Culorile disponibile
  COLORS: [
    { value: 'slate', label: 'Slate' },
    { value: 'gray', label: 'Gray' },
    { value: 'zinc', label: 'Zinc' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'stone', label: 'Stone' },
    { value: 'red', label: 'Red' },
    { value: 'orange', label: 'Orange' },
    { value: 'amber', label: 'Amber' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'lime', label: 'Lime' },
    { value: 'green', label: 'Green' },
    { value: 'emerald', label: 'Emerald' },
    { value: 'teal', label: 'Teal' },
    { value: 'cyan', label: 'Cyan' },
    { value: 'sky', label: 'Sky' },
    { value: 'blue', label: 'Blue' },
    { value: 'indigo', label: 'Indigo' },
    { value: 'violet', label: 'Violet' },
    { value: 'purple', label: 'Purple' },
    { value: 'fuchsia', label: 'Fuchsia' },
    { value: 'pink', label: 'Pink' },
    { value: 'rose', label: 'Rose' },
  ],
};

// Constante pentru localizare
export const LOCALE_CONSTANTS = {
  // Limbile disponibile
  LANGUAGES: [
    { value: 'ro', label: 'Română' },
    { value: 'en', label: 'Engleză' },
  ],
  // Formatele de dată
  DATE_FORMATS: [
    { value: 'dd.MM.yyyy', label: 'DD.MM.YYYY' },
    { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
    { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
  ],
  // Formatele de oră
  TIME_FORMATS: [
    { value: 'HH:mm', label: '24 ore' },
    { value: 'hh:mm a', label: '12 ore' },
  ],
  // Formatele de număr
  NUMBER_FORMATS: [
    { value: 'ro', label: '1.234,56' },
    { value: 'en', label: '1,234.56' },
  ],
  // Formatele de monedă
  CURRENCY_FORMATS: [
    { value: 'RON', label: 'RON' },
    { value: 'EUR', label: 'EUR' },
    { value: 'USD', label: 'USD' },
  ],
};

// Constante pentru aplicație
export const APP_CONSTANTS = {
  // Versiunea aplicației
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  // Numele aplicației
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Proiect 2',
  // Descrierea aplicației
  APP_DESCRIPTION:
    import.meta.env.VITE_APP_DESCRIPTION ||
    'Aplicație pentru gestionarea proiectelor și inventarului',
  // URL-ul aplicației
  APP_URL: import.meta.env.VITE_APP_URL || '{process.env.PROIECT_2_VERCEL}',
  // Email-ul de contact
  CONTACT_EMAIL: import.meta.env.VITE_CONTACT_EMAIL || 'contact@proiect-2.ro',
  // Numărul de telefon de contact
  CONTACT_PHONE: import.meta.env.VITE_CONTACT_PHONE || '+40 123 456 789',
  // Adresa de contact
  CONTACT_ADDRESS: import.meta.env.VITE_CONTACT_ADDRESS || 'București, România',
  // URL-ul pentru termeni și condiții
  TERMS_URL: import.meta.env.VITE_TERMS_URL || '/terms',
  // URL-ul pentru politica de confidențialitate
  PRIVACY_URL: import.meta.env.VITE_PRIVACY_URL || '/privacy',
  // URL-ul pentru cookie-uri
  COOKIES_URL: import.meta.env.VITE_COOKIES_URL || '/cookies',
  // URL-ul pentru ajutor
  HELP_URL: import.meta.env.VITE_HELP_URL || '/help',
  // URL-ul pentru FAQ
  FAQ_URL: import.meta.env.VITE_FAQ_URL || '/faq',
  // URL-ul pentru blog
  BLOG_URL: import.meta.env.VITE_BLOG_URL || '/blog',
  // URL-ul pentru documentație
  DOCS_URL: import.meta.env.VITE_DOCS_URL || '/docs',
  // URL-ul pentru API
  API_URL: import.meta.env.VITE_API_URL || '{process.env.BTVPNZSMRFRLWCZANBCG_SUPABASE}',
  // URL-ul pentru Supabase
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '{process.env.BTVPNZSMRFRLWCZANBCG_SUPABASE}',
  // Cheia publică pentru Supabase
  SUPABASE_KEY:
    import.meta.env.VITE_SUPABASE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0dnBuenNtcmZybHdjemFuYmNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMDQ1MjksImV4cCI6MjA2MDU4MDUyOX0.rR8jimNoXDlb032jm05TV_16F4tIisN5Ai1SkQF-JPI',
};

// Exportăm toate constantele
export default {
  AUTH_CONSTANTS,
  API_CONSTANTS,
  UI_CONSTANTS,
  PROJECT_CONSTANTS,
  INVENTORY_CONSTANTS,
  TASK_CONSTANTS,
  REPORT_CONSTANTS,
  USER_CONSTANTS,
  NOTIFICATION_CONSTANTS,
  THEME_CONSTANTS,
  LOCALE_CONSTANTS,
  APP_CONSTANTS,
};
