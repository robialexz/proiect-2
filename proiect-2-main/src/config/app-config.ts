/**
 * Configurația aplicației
 * Acest fișier conține configurația aplicației
 */

import { APP_CONSTANTS } from '@/lib/constants';

/**
 * Configurația aplicației
 */
export const appConfig = {
  // Informații despre aplicație
  app: {
    name: APP_CONSTANTS.APP_NAME,
    version: APP_CONSTANTS.APP_VERSION,
    description: APP_CONSTANTS.APP_DESCRIPTION,
    url: APP_CONSTANTS.APP_URL,
  },
  
  // Configurația pentru API
  api: {
    url: APP_CONSTANTS.API_URL,
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
  },
  
  // Configurația pentru Supabase
  supabase: {
    url: APP_CONSTANTS.SUPABASE_URL,
    key: APP_CONSTANTS.SUPABASE_KEY,
  },
  
  // Configurația pentru autentificare
  auth: {
    sessionDuration: APP_CONSTANTS.AUTH_CONSTANTS.SESSION_DURATION,
    refreshTokenDuration: APP_CONSTANTS.AUTH_CONSTANTS.REFRESH_TOKEN_DURATION,
    resetTokenDuration: APP_CONSTANTS.AUTH_CONSTANTS.RESET_TOKEN_DURATION,
    confirmationTokenDuration: APP_CONSTANTS.AUTH_CONSTANTS.CONFIRMATION_TOKEN_DURATION,
    minPasswordLength: APP_CONSTANTS.AUTH_CONSTANTS.MIN_PASSWORD_LENGTH,
    resendConfirmationDelay: APP_CONSTANTS.AUTH_CONSTANTS.RESEND_CONFIRMATION_DELAY,
    resendResetDelay: APP_CONSTANTS.AUTH_CONSTANTS.RESEND_RESET_DELAY,
    maxLoginAttempts: APP_CONSTANTS.AUTH_CONSTANTS.MAX_LOGIN_ATTEMPTS,
    accountLockDuration: APP_CONSTANTS.AUTH_CONSTANTS.ACCOUNT_LOCK_DURATION,
  },
  
  // Configurația pentru UI
  ui: {
    animationDuration: APP_CONSTANTS.UI_CONSTANTS.ANIMATION_DURATION,
    toastDuration: APP_CONSTANTS.UI_CONSTANTS.TOAST_DURATION,
    tooltipDuration: APP_CONSTANTS.UI_CONSTANTS.TOOLTIP_DURATION,
    debounceDelay: APP_CONSTANTS.UI_CONSTANTS.DEBOUNCE_DELAY,
    throttleDelay: APP_CONSTANTS.UI_CONSTANTS.THROTTLE_DELAY,
    maxFileSize: APP_CONSTANTS.UI_CONSTANTS.MAX_FILE_SIZE,
    acceptedFileTypes: APP_CONSTANTS.UI_CONSTANTS.ACCEPTED_FILE_TYPES,
    maxImageSize: APP_CONSTANTS.UI_CONSTANTS.MAX_IMAGE_SIZE,
    acceptedImageTypes: APP_CONSTANTS.UI_CONSTANTS.ACCEPTED_IMAGE_TYPES,
    breakpoints: APP_CONSTANTS.UI_CONSTANTS.BREAKPOINTS,
  },
  
  // Configurația pentru storage
  storage: {
    buckets: {
      avatars: 'avatars',
      projects: 'projects',
      materials: 'materials',
      documents: 'documents',
    },
  },
  
  // Configurația pentru localizare
  locale: {
    defaultLanguage: 'ro',
    supportedLanguages: APP_CONSTANTS.LOCALE_CONSTANTS.LANGUAGES,
    dateFormats: APP_CONSTANTS.LOCALE_CONSTANTS.DATE_FORMATS,
    timeFormats: APP_CONSTANTS.LOCALE_CONSTANTS.TIME_FORMATS,
    numberFormats: APP_CONSTANTS.LOCALE_CONSTANTS.NUMBER_FORMATS,
    currencyFormats: APP_CONSTANTS.LOCALE_CONSTANTS.CURRENCY_FORMATS,
  },
  
  // Configurația pentru teme
  theme: {
    defaultTheme: 'system',
    themes: APP_CONSTANTS.THEME_CONSTANTS.THEMES,
    colors: APP_CONSTANTS.THEME_CONSTANTS.COLORS,
  },
  
  // Configurația pentru proiecte
  projects: {
    statuses: APP_CONSTANTS.PROJECT_CONSTANTS.PROJECT_STATUSES,
    priorities: APP_CONSTANTS.PROJECT_CONSTANTS.PROJECT_PRIORITIES,
    types: APP_CONSTANTS.PROJECT_CONSTANTS.PROJECT_TYPES,
  },
  
  // Configurația pentru inventar
  inventory: {
    materialStatuses: APP_CONSTANTS.INVENTORY_CONSTANTS.MATERIAL_STATUSES,
    measurementUnits: APP_CONSTANTS.INVENTORY_CONSTANTS.MEASUREMENT_UNITS,
    materialCategories: APP_CONSTANTS.INVENTORY_CONSTANTS.MATERIAL_CATEGORIES,
  },
  
  // Configurația pentru sarcini
  tasks: {
    statuses: APP_CONSTANTS.TASK_CONSTANTS.TASK_STATUSES,
    priorities: APP_CONSTANTS.TASK_CONSTANTS.TASK_PRIORITIES,
    types: APP_CONSTANTS.TASK_CONSTANTS.TASK_TYPES,
  },
  
  // Configurația pentru rapoarte
  reports: {
    types: APP_CONSTANTS.REPORT_CONSTANTS.REPORT_TYPES,
    formats: APP_CONSTANTS.REPORT_CONSTANTS.REPORT_FORMATS,
    periods: APP_CONSTANTS.REPORT_CONSTANTS.REPORT_PERIODS,
  },
  
  // Configurația pentru utilizatori
  users: {
    roles: APP_CONSTANTS.USER_CONSTANTS.USER_ROLES,
    statuses: APP_CONSTANTS.USER_CONSTANTS.USER_STATUSES,
  },
  
  // Configurația pentru notificări
  notifications: {
    types: APP_CONSTANTS.NOTIFICATION_CONSTANTS.NOTIFICATION_TYPES,
    priorities: APP_CONSTANTS.NOTIFICATION_CONSTANTS.NOTIFICATION_PRIORITIES,
    categories: APP_CONSTANTS.NOTIFICATION_CONSTANTS.NOTIFICATION_CATEGORIES,
  },
  
  // Configurația pentru contact
  contact: {
    email: APP_CONSTANTS.CONTACT_EMAIL,
    phone: APP_CONSTANTS.CONTACT_PHONE,
    address: APP_CONSTANTS.CONTACT_ADDRESS,
  },
  
  // Configurația pentru link-uri
  links: {
    terms: APP_CONSTANTS.TERMS_URL,
    privacy: APP_CONSTANTS.PRIVACY_URL,
    cookies: APP_CONSTANTS.COOKIES_URL,
    help: APP_CONSTANTS.HELP_URL,
    faq: APP_CONSTANTS.FAQ_URL,
    blog: APP_CONSTANTS.BLOG_URL,
    docs: APP_CONSTANTS.DOCS_URL,
  },
  
  // Configurația pentru dezvoltare
  development: {
    debug: process.env.NODE_ENV === 'development',
    environment: process.env.NODE_ENV || 'development',
  },
};

// Exportăm configurația
export default appConfig;
