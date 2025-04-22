import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/services/api/supabase-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

/**
 * Pagină de callback pentru autentificare
 * Procesează token-ul de verificare email și alte callback-uri de autentificare
 */
const AuthCallbackPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Funcție pentru procesarea parametrilor din URL
    const handleAuthCallback = async () => {
      try {
        setLoading(true);
        // Removed console statement

        // Obținem parametrii din URL
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const queryParams = new URLSearchParams(window.location.search);

        // Verificăm dacă avem un token de acces în hash (OAuth) sau un token de verificare în query
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = queryParams.get("type");

        // Removed console statement

        // Verificăm dacă avem parametrul de tip în query
        if (type) {
          // Removed console statement

          // Verificăm tipul de callback
          if (type === "recovery") {
            // Callback pentru resetare parolă
            setSuccess(
              "Link de resetare parolă valid. Veți fi redirecționat către pagina de resetare parolă..."
            );
            setTimeout(() => navigate("/reset-password"), 2000);
            return;
          }

          if (type === "signup" || type === "magiclink") {
            // Callback pentru verificare email la înregistrare sau magic link
            setSuccess(
              "Email verificat cu succes! Veți fi redirecționat în curând..."
            );
            setTimeout(() => navigate("/login"), 2000);
            return;
          }
        }

        // Dacă avem un token de acces în hash, încercăm să-l setăm în sesiune
        if (accessToken && refreshToken) {
          // Removed console statement
          try {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              throw new Error(error.message);
            }

            setSuccess(
              "Autentificare reușită! Veți fi redirecționat în curând..."
            );
            setTimeout(() => navigate("/dashboard"), 2000);
            return;
          } catch (sessionError) {
            // Removed console statement
            // Continuăm cu alte metode de autentificare
          }
        }

        // Folosim metoda getSession pentru a verifica dacă avem o sesiune validă
        // Removed console statement
        try {
        const { data: sessionData } = await supabase.auth.getSession();
        } catch (error) {
          // Handle error appropriately
        }

        if (sessionData?.session) {
          // Removed console statement

          setSuccess(
            "Autentificare reușită! Veți fi redirecționat în curând..."
          );
          setTimeout(() => navigate("/dashboard"), 2000);
          return;
        }

        // Dacă nu avem o sesiune validă, redirecționăm către pagina de login
        // Removed console statement
        setError(
          "Sesiune invalidă sau expirată. Vă rugăm să vă autentificați din nou."
        );
        setTimeout(() => navigate("/login"), 3000);
      } catch (err: any) {
        // Removed console statement
        setError(
          err.message ||
            "A apărut o eroare la procesarea callback-ului de autentificare"
        );
        setTimeout(() => navigate("/login"), 3000);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md">
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-white">
              Procesare autentificare
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 flex flex-col items-center">
            {loading && (
              <div className="flex flex-col items-center space-y-4 py-8">
                <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
                <p className="text-slate-300">Se procesează...</p>
              </div>
            )}

            {error && !loading && (
              <Alert
                variant="destructive"
                className="bg-red-900/50 border-red-800"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && !loading && (
              <Alert className="bg-green-900/50 border-green-800">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-200">
                  {success}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
