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
      // Adăugăm un timeout explicit pentru autentificare - mărim la 30 secunde
      const timeoutPromise = new Promise<{ data: null; error: Error }>(
        (_, reject) => {
          setTimeout(() => {
            console.log("Authentication timeout reached after 30 seconds");
            reject(
              new Error(
                "Authentication timeout after 30 seconds. Please check your internet connection and try again."
              )
            );
          }, 30000); // 30 secunde
        }
      );

      // Promisiunea pentru autentificare
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          // Adăugăm opțiuni suplimentare pentru autentificare
          captchaToken: null,
        },
      });

      // Folosim Promise.race pentru a implementa timeout-ul
      const result = (await Promise.race([authPromise, timeoutPromise])) as any;

      // Verificăm dacă autentificarea a reușit
      if (result.error) {
        console.error("Authentication error:", result.error);
        return {
          data: null,
          error: formatError(result.error),
          status: "error",
        };
      }

      // Salvăm sesiunea în localStorage și sessionStorage pentru redundanță
      if (result.data?.session) {
        try {
          const sessionData = {
            currentSession: result.data.session,
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
          console.log("Session saved manually after successful authentication");
        } catch (storageError) {
          console.error("Error saving session to storage:", storageError);
        }
      }

      return handleResponse(
        result.data,
        result.error as unknown as PostgrestError
      );
    } catch (error) {
      console.error("Auth error caught:", error);
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
    password: string
  ): Promise<SupabaseResponse<{ session: any; user: any }>> {
    try {
      // Construim URL-ul de redirecționare pentru verificarea email-ului
      const redirectUrl = `${window.location.origin}/auth/callback?type=signup`;
      console.log(
        "URL de redirecționare pentru verificare email:",
        redirectUrl
      );

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            // Putem adăuga date suplimentare despre utilizator aici
            signup_timestamp: new Date().toISOString(),
          },
        },
      });

      // Verificăm dacă utilizatorul a fost creat cu succes
      if (data?.user) {
        console.log("Utilizator creat cu ID:", data.user.id);
        console.log(
          "Confirmare email necesară:",
          data.user.email_confirmed_at ? "Nu" : "Da"
        );
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

      // Ștergem sesiunea din localStorage și sessionStorage
      localStorage.removeItem("supabase.auth.token");
      sessionStorage.removeItem("supabase.auth.token");

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
      console.error("Error getting session:", error);
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
      // Construim URL-ul de redirecționare pentru resetarea parolei
      const redirectUrl = `${window.location.origin}/auth/callback?type=recovery`;
      console.log("URL de redirecționare pentru resetare parolă:", redirectUrl);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
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
          console.log("Session refreshed and saved to storage");
        } catch (storageError) {
          console.error(
            "Error saving refreshed session to storage:",
            storageError
          );
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
