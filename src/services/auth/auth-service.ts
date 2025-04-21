import { supabase } from "../api/supabase-client";
import { PostgrestError } from "@supabase/supabase-js";
import {
  SupabaseResponse,
  SupabaseErrorResponse,
} from "../api/supabase-service";

/**
 * Formatează erorile pentru a fi mai ușor de înțeles
 * @param error Eroarea de formatat
 * @returns Eroarea formatată
 */
const formatError = (
  error: PostgrestError | Error | unknown
): SupabaseErrorResponse => {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: "client_error",
    };
  }

  // Verificăm dacă este o eroare PostgrestError
  const pgError = error as PostgrestError;
  if (pgError && pgError.code) {
    return {
      message: pgError.message,
      details: pgError.details,
      hint: pgError.hint,
      code: pgError.code,
    };
  }

  // Eroare generică
  return {
    message: "An unknown error occurred",
    code: "unknown_error",
  };
};

/**
 * Gestionează răspunsurile de la Supabase Auth
 * @param data Datele din răspuns
 * @param error Eroarea din răspuns
 * @returns Răspunsul formatat
 */
const handleResponse = <T>(
  data: T,
  error: PostgrestError | null
): SupabaseResponse<T> => {
  if (error) {
    return {
      data: null,
      error: formatError(error),
      status: "error",
    };
  }

  return {
    data,
    error: null,
    status: "success",
  };
};

/**
 * Serviciu pentru autentificare
 * Oferă metode pentru autentificare, înregistrare și gestionarea sesiunilor
 */
export const authService = {
  /**
   * Autentifică un utilizator cu email și parolă
   * @param email Email-ul utilizatorului
   * @param password Parola utilizatorului
   * @returns Sesiunea și utilizatorul sau eroarea
   */
  async signIn(
    email: string,
    password: string
  ): Promise<SupabaseResponse<{ session: any; user: any }>> {
    try {
      // Removed console statement

      // Adăugăm un timeout explicit pentru autentificare
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Creăm o promisiune care se rezolvă după 5 secunde
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              "Autentificare eșuată: Timpul de așteptare a expirat. Vă rugăm să încercați din nou."
            )
          );
        }, 15000); // 15 secunde
      });

      // Folosim Promise.race pentru a implementa timeout-ul
      try {
        const result = (await Promise.race([
          authPromise,
          timeoutPromise,
        ])) as any;
      } catch (error) {
        // Handle error appropriately
      }

      const { data, error } = result;

      // Verificăm dacă autentificarea a reușit
      if (error) {
        // Removed console statement
        return {
          data: null,
          error: formatError(error),
          status: "error",
        };
      }

      // Salvăm sesiunea în localStorage și sessionStorage pentru redundanță
      if (data?.session) {
        try {
          const sessionData = {
            currentSession: data.session,
            expiresAt: Date.now() + 3600 * 1000, // 1 oră valabilitate
          };

          localStorage.setItem(
            "supabase.auth.token",
            JSON.stringify(sessionData)
          );
          sessionStorage.setItem(
            "supabase.auth.token",
            JSON.stringify(sessionData)
          );
          // Removed console statement

          // Setăm un flag pentru a indica o nouă logare
          sessionStorage.setItem("newLoginDetected", "true");
        } catch (storageError) {
          // Removed console statement
        }
      }

      return handleResponse(data, error as unknown as PostgrestError);
    } catch (error) {
      // Removed console statement
      return {
        data: null,
        error: formatError(error),
        status: "error",
      };
    }
  },

  /**
   * Înregistrează un utilizator nou
   * @param email Email-ul utilizatorului
   * @param password Parola utilizatorului
   * @returns Sesiunea și utilizatorul sau eroarea
   */
  async signUp(
    email: string,
    password: string,
    displayName?: string
  ): Promise<SupabaseResponse<{ session: any; user: any }>> {
    try {
      // Doar în dezvoltare, nu în producție
      if (process.env.NODE_ENV !== "production") {
        // Removed console statement
      }

      // Construim URL-ul de redirecționare pentru verificarea email-ului
      const redirectUrl = `${window.location.origin}/auth/callback?type=signup`;

      // Configurăm opțiunile pentru înregistrare
      let data = null;
      let error = null;

      try {
        const response = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              // Putem adăuga date suplimentare despre utilizator aici
              display_name: displayName || email.split("@")[0],
              signup_timestamp: new Date().toISOString(),
            },
          },
        });

        data = response.data;
        error = response.error;
      } catch (err) {
        // Handle error appropriately
        error = err;
      }

      return handleResponse(data, error as unknown as PostgrestError);
    } catch (error) {
      return {
        data: null,
        error: formatError(error),
        status: "error",
      };
    }
  },

  /**
   * Retrimite email-ul de confirmare pentru un utilizator
   * @param email Email-ul utilizatorului
   * @returns Succes sau eroare
   */
  async resendConfirmationEmail(
    email: string
  ): Promise<SupabaseResponse<null>> {
    try {
      // Doar în dezvoltare, nu în producție
      if (process.env.NODE_ENV !== "production") {
        // Removed console statement
      }

      // Construim URL-ul de redirecționare pentru verificarea email-ului
      const redirectUrl = `${window.location.origin}/auth/callback?type=recovery`;

      let error = null;

      try {
        const response = await supabase.auth.resend({
          type: "signup",
          email,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        error = response.error;
      } catch (err) {
        // Handle error appropriately
        error = err;
      }

      return handleResponse(null, error as unknown as PostgrestError);
    } catch (error) {
      return {
        data: null,
        error: formatError(error),
        status: "error",
      };
    }
  },

  /**
   * Deconectează utilizatorul curent
   * @returns Succes sau eroare
   */
  async signOut(): Promise<SupabaseResponse<null>> {
    try {
      // Setăm flag-ul pentru a indica o deconectare intenționată
      sessionStorage.setItem("intentional_signout", "true");

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      // Ștergem toate datele de autentificare din localStorage și sessionStorage
      localStorage.removeItem("supabase.auth.token");
      sessionStorage.removeItem("supabase.auth.token");
      localStorage.removeItem("sb-btvpnzsmrfrlwczanbcg-auth-token");
      sessionStorage.removeItem("sb-btvpnzsmrfrlwczanbcg-auth-token");
      localStorage.removeItem("auth-storage");
      sessionStorage.removeItem("auth-storage");

      // Ștergem toate cheile care conțin "supabase" sau "auth"
      Object.keys(localStorage).forEach((key) => {
        if (key.includes("supabase") || key.includes("auth")) {
          localStorage.removeItem(key);
        }
      });

      Object.keys(sessionStorage).forEach((key) => {
        if (key.includes("supabase") || key.includes("auth")) {
          sessionStorage.removeItem(key);
        }
      });

      // Resetăm flag-ul
      sessionStorage.removeItem("intentional_signout");

      return {
        data: null,
        error: null,
        status: "success",
      };
    } catch (error) {
      return {
        data: null,
        error: formatError(error),
        status: "error",
      };
    }
  },

  /**
   * Obține sesiunea curentă
   * @returns Sesiunea curentă sau null
   */
  async getSession(): Promise<SupabaseResponse<any>> {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      return {
        data,
        error: null,
        status: "success",
      };
    } catch (error) {
      // Removed console statement
      return {
        data: { session: null },
        error: formatError(error),
        status: "error",
      };
    }
  },

  /**
   * Obține utilizatorul curent
   * @returns Utilizatorul curent sau null
   */
  async getUser(): Promise<SupabaseResponse<any>> {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      return {
        data: data.user,
        error: null,
        status: "success",
      };
    } catch (error) {
      return {
        data: null,
        error: formatError(error),
        status: "error",
      };
    }
  },

  /**
   * Trimite un email pentru resetarea parolei
   * @param email Email-ul utilizatorului
   * @returns Succes sau eroare
   */
  async resetPassword(email: string): Promise<SupabaseResponse<null>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      return {
        data: null,
        error: null,
        status: "success",
      };
    } catch (error) {
      return {
        data: null,
        error: formatError(error),
        status: "error",
      };
    }
  },

  /**
   * Actualizează parola utilizatorului
   * @param password Noua parolă
   * @returns Succes sau eroare
   */
  async updatePassword(password: string): Promise<SupabaseResponse<any>> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      return {
        data: data.user,
        error: null,
        status: "success",
      };
    } catch (error) {
      return {
        data: null,
        error: formatError(error),
        status: "error",
      };
    }
  },

  /**
   * Verifică dacă un utilizator este autentificat
   * @returns True dacă utilizatorul este autentificat, false în caz contrar
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data } = await this.getSession();
      return !!data;
    } catch (error) {
      return false;
    }
  },

  /**
   * Reîmprospătează sesiunea curentă
   * @returns Sesiunea reîmprospătată sau eroarea
   */
  async refreshSession(): Promise<SupabaseResponse<any>> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        throw error;
      }

      // Salvăm sesiunea reîmprospătată
      if (data.session) {
        try {
          const sessionData = {
            currentSession: data.session,
            expiresAt: Date.now() + 3600 * 1000, // 1 oră valabilitate
          };

          localStorage.setItem(
            "supabase.auth.token",
            JSON.stringify(sessionData)
          );
          sessionStorage.setItem(
            "supabase.auth.token",
            JSON.stringify(sessionData)
          );
          // Removed console statement
        } catch (storageError) {
          // Removed console statement
        }
      }

      return {
        data: data.session,
        error: null,
        status: "success",
      };
    } catch (error) {
      return {
        data: null,
        error: formatError(error),
        status: "error",
      };
    }
  },
};

export default authService;
