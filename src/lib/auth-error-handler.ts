/**
 * Gestionarea erorilor de autentificare
 * Oferă funcții pentru detectarea și gestionarea erorilor de autentificare
 */

import { errorRecovery } from "./error-recovery";
import { supabase } from "../services/api/supabase-client";

// Tipuri de erori de autentificare
export enum AuthErrorType {
  SESSION_EXPIRED = "session_expired",
  INVALID_CREDENTIALS = "invalid_credentials",
  EMAIL_NOT_CONFIRMED = "email_not_confirmed",
  RATE_LIMITED = "rate_limited",
  INVALID_TOKEN = "invalid_token",
  UNKNOWN = "unknown",
}

// Interfață pentru erori de autentificare
export interface AuthError {
  type: AuthErrorType;
  message: string;
  code?: string;
  recoverable: boolean;
}

/**
 * Verifică dacă o eroare este o eroare de autentificare
 * @param error Eroarea de verificat
 * @returns Dacă eroarea este o eroare de autentificare
 */
export function isAuthError(error: any): boolean {
  if (!error) return false;

  // Verificăm codul de eroare
  if (error.code) {
    const authErrorCodes = [
      "PGRST301", // JWT expired
      "PGRST302", // JWT invalid
      "PGRST303", // JWT audience invalid
      "PGRST304", // JWT malformed
      "PGRST305", // JWT signature invalid
      "PGRST306", // JWT missing
      "PGRST307", // JWT role invalid
      "auth/invalid-credential",
      "auth/user-not-found",
      "auth/wrong-password",
      "auth/email-not-verified",
      "auth/too-many-requests",
      "auth/invalid-email",
      "auth/user-disabled",
      "auth/requires-recent-login",
      "auth/invalid-session",
      "auth/session-expired",
    ];

    if (authErrorCodes.some((code) => error.code.includes(code))) {
      return true;
    }
  }

  // Verificăm mesajul de eroare
  if (error.message) {
    const authErrorMessages = [
      "jwt expired",
      "jwt invalid",
      "jwt malformed",
      "jwt signature",
      "jwt missing",
      "jwt role",
      "session",
      "token",
      "auth",
      "authentication",
      "login",
      "password",
      "credential",
      "email not verified",
      "too many requests",
      "invalid email",
      "user disabled",
      "requires recent login",
    ];

    if (
      authErrorMessages.some((msg) => error.message.toLowerCase().includes(msg))
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Procesează o eroare de autentificare
 * @param error Eroarea de autentificare
 * @returns Eroarea de autentificare procesată
 */
export function processAuthError(error: any): AuthError {
  if (!error) {
    return {
      type: AuthErrorType.UNKNOWN,
      message: "Eroare de autentificare necunoscută",
      recoverable: true,
    };
  }

  // Verificăm codul de eroare
  if (error.code) {
    // Erori de sesiune expirată
    if (
      error.code.includes("PGRST301") ||
      error.code.includes("auth/session-expired") ||
      error.code.includes("auth/invalid-session")
    ) {
      return {
        type: AuthErrorType.SESSION_EXPIRED,
        message:
          "Sesiunea dumneavoastră a expirat. Vă rugăm să vă autentificați din nou.",
        code: error.code,
        recoverable: true,
      };
    }

    // Erori de credențiale invalide
    if (
      error.code.includes("auth/invalid-credential") ||
      error.code.includes("auth/user-not-found") ||
      error.code.includes("auth/wrong-password")
    ) {
      return {
        type: AuthErrorType.INVALID_CREDENTIALS,
        message:
          "Credențiale invalide. Vă rugăm să verificați email-ul și parola.",
        code: error.code,
        recoverable: true,
      };
    }

    // Erori de email neconfirmat
    if (error.code.includes("auth/email-not-verified")) {
      return {
        type: AuthErrorType.EMAIL_NOT_CONFIRMED,
        message:
          "Email-ul nu a fost confirmat. Vă rugăm să verificați email-ul pentru link-ul de confirmare.",
        code: error.code,
        recoverable: true,
      };
    }

    // Erori de rate limiting
    if (error.code.includes("auth/too-many-requests")) {
      return {
        type: AuthErrorType.RATE_LIMITED,
        message:
          "Prea multe încercări. Vă rugăm să încercați din nou mai târziu.",
        code: error.code,
        recoverable: false,
      };
    }

    // Erori de token invalid
    if (
      error.code.includes("PGRST302") ||
      error.code.includes("PGRST303") ||
      error.code.includes("PGRST304") ||
      error.code.includes("PGRST305") ||
      error.code.includes("PGRST306") ||
      error.code.includes("PGRST307")
    ) {
      return {
        type: AuthErrorType.INVALID_TOKEN,
        message:
          "Token de autentificare invalid. Vă rugăm să vă autentificați din nou.",
        code: error.code,
        recoverable: true,
      };
    }
  }

  // Verificăm mesajul de eroare
  if (error.message) {
    // Erori de sesiune expirată
    if (
      error.message.toLowerCase().includes("jwt expired") ||
      error.message.toLowerCase().includes("session expired") ||
      error.message.toLowerCase().includes("token expired")
    ) {
      return {
        type: AuthErrorType.SESSION_EXPIRED,
        message:
          "Sesiunea dumneavoastră a expirat. Vă rugăm să vă autentificați din nou.",
        code: error.code,
        recoverable: true,
      };
    }

    // Erori de token invalid
    if (
      error.message.toLowerCase().includes("jwt invalid") ||
      error.message.toLowerCase().includes("jwt malformed") ||
      error.message.toLowerCase().includes("jwt signature") ||
      error.message.toLowerCase().includes("jwt missing") ||
      error.message.toLowerCase().includes("jwt role")
    ) {
      return {
        type: AuthErrorType.INVALID_TOKEN,
        message:
          "Token de autentificare invalid. Vă rugăm să vă autentificați din nou.",
        code: error.code,
        recoverable: true,
      };
    }
  }

  // Eroare necunoscută
  return {
    type: AuthErrorType.UNKNOWN,
    message: error.message || "Eroare de autentificare necunoscută",
    code: error.code,
    recoverable: true,
  };
}

/**
 * Gestionează o eroare de autentificare
 * @param error Eroarea de autentificare
 * @returns Dacă eroarea a fost gestionată
 */
export function handleAuthError(error: any): boolean {
  // Verificăm dacă este o eroare de autentificare
  if (!isAuthError(error)) {
    return false;
  }

  // Procesăm eroarea
  const authError = processAuthError(error);

  // Logăm eroarea
  // Removed console statement

  // Gestionăm eroarea în funcție de tip
  switch (authError.type) {
    case AuthErrorType.SESSION_EXPIRED:
    case AuthErrorType.INVALID_TOKEN:
      // Deconectăm utilizatorul
      supabase.auth.signOut().then(() => {
        // Redirecționăm către pagina de login
        window.location.href = "/login?error=session_expired";
      });
      return true;

    case AuthErrorType.INVALID_CREDENTIALS:
      // Redirecționăm către pagina de login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login?error=invalid_credentials";
      }
      return true;

    case AuthErrorType.EMAIL_NOT_CONFIRMED:
      // Redirecționăm către pagina de confirmare email
      window.location.href = "/confirm-email";
      return true;

    case AuthErrorType.RATE_LIMITED:
      // Afișăm un mesaj de eroare
      errorRecovery.handleError({
        message: authError.message,
        code: authError.code,
        recoverable: false,
      });
      return true;

    default:
      // Gestionăm eroarea cu sistemul general de recuperare din erori
      errorRecovery.handleError({
        message: authError.message,
        code: authError.code,
        type: errorRecovery.ErrorType.AUTHENTICATION,
        recoverable: authError.recoverable,
      });
      return true;
  }
}

/**
 * Inițializează interceptorul pentru erorile de autentificare
 */
export function initAuthErrorInterceptor(): void {
  // Interceptăm erorile de autentificare de la Supabase
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") {
      // Verificăm dacă deconectarea a fost cauzată de o eroare de autentificare
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get("error");

      if (error === "session_expired") {
        // Afișăm un mesaj de eroare
        errorRecovery.handleError({
          message:
            "Sesiunea dumneavoastră a expirat. Vă rugăm să vă autentificați din nou.",
          code: "auth/session-expired",
          type: errorRecovery.ErrorType.AUTHENTICATION,
          recoverable: true,
        });
      }
    }
  });

  // Interceptăm erorile de rețea
  const originalFetch = window.fetch;
  window.fetch = async function (input, init) {
    try {
      const response = await originalFetch(input, init);

      // Verificăm dacă răspunsul este un răspuns de eroare de autentificare
      if (response.status === 401 || response.status === 403) {
        // Încercăm să extragem eroarea
        try {
          const clonedResponse = response.clone();
          const data = await clonedResponse.json();

          if (data.error) {
            // Gestionăm eroarea de autentificare
            handleAuthError({
              message: data.error.message || data.error,
              code: data.code || `HTTP${response.status}`,
            });
          }
        } catch (error) {
          // Nu putem extrage eroarea, gestionăm eroarea generică
          handleAuthError({
            message: `Authentication error: ${response.statusText}`,
            code: `HTTP${response.status}`,
          });
        }
      }

      return response;
    } catch (error) {
      // Verificăm dacă este o eroare de autentificare
      if (isAuthError(error)) {
        handleAuthError(error);
      }

      throw error;
    }
  };
}

// Exportăm toate funcțiile într-un singur obiect
export const authErrorHandler = {
  isAuthError,
  processAuthError,
  handleAuthError,
  initAuthErrorInterceptor,
};
