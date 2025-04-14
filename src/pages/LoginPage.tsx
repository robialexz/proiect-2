import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import connectionService from "@/lib/connection-service";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  // Verificăm conexiunea la internet și la Supabase
  React.useEffect(() => {
    const checkConnections = async () => {
      setConnectionStatus('checking');

      // Verificăm mai întâi conexiunea la internet
      const hasInternet = await connectionService.checkInternetConnection();

      if (!hasInternet) {
        setConnectionStatus('offline');
        return;
      }

      // Apoi verificăm conexiunea la Supabase
      const hasSupabaseConnection = await connectionService.checkConnection();

      setConnectionStatus(hasSupabaseConnection ? 'online' : 'offline');
    };

    checkConnections();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("LoginPage: Form submitted");
    setError(null);

    // Verifică dacă email-ul și parola sunt completate
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    // Verificăm din nou conexiunea înainte de a încerca autentificarea
    if (connectionStatus === 'offline') {
      setError("You appear to be offline. Please check your internet connection and try again.");
      return;
    }

    setLoading(true);

    // Adăugăm un timeout pentru întreaga operațiune de login - mărim la 20 secunde pentru a da mai mult timp
    const loginTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError("Login timeout. Please check your internet connection and try again later.");
        console.error("Login timeout reached");
      }
    }, 20000); // 20 secunde timeout

    try {
      console.log("LoginPage: Calling signIn function with email:", email);

      // Adăugăm un eveniment pentru a asculta actualizările de sesiune
      const sessionUpdateHandler = (event: any) => {
        console.log("LoginPage: Received session update event");
        if (event.detail?.session) {
          console.log("LoginPage: Session update detected, navigating to overview");
          // Curățăm timeout-ul
          clearTimeout(loginTimeout);
          // Eliminăm listener-ul
          window.removeEventListener('supabase-session-update', sessionUpdateHandler);
          window.removeEventListener('force-session-refresh', sessionUpdateHandler);
          // Navigăm către pagina principală
          navigate("/overview");
        }
      };

      // Adăugăm listener pentru ambele evenimente
      window.addEventListener('supabase-session-update', sessionUpdateHandler);
      window.addEventListener('force-session-refresh', sessionUpdateHandler);

      // Autentificare normală
      const { data: sessionData, error: signInError } = await signIn(email, password);
      console.log("LoginPage: signIn function returned:", {
        success: !!sessionData,
        error: signInError ? signInError.message : null,
        redirecting: signInError ? false : true
      });

      // Curățăm timeout-ul deoarece am primit un răspuns
      clearTimeout(loginTimeout);

      if (signInError) {
        console.log("signIn returned an error, throwing...");
        // Eliminăm listener-ul în caz de eroare
        window.removeEventListener('supabase-session-update', sessionUpdateHandler);
        window.removeEventListener('force-session-refresh', sessionUpdateHandler);
        throw signInError;
      }

      // Verificăm dacă avem date de sesiune
      if (sessionData) {
        console.log("LoginPage: Authentication successful, navigating to overview");
        // Navigație directă către pagina principală
        navigate("/overview");
      } else {
        // Așteptăm evenimentul de actualizare a sesiunii
        console.log("LoginPage: No session data returned, waiting for session update event");
        // Adăugăm un timeout suplimentar pentru a aștepta evenimentul
        setTimeout(() => {
          // Verificăm dacă încă mai suntem pe pagina de login
          if (window.location.pathname.includes('login')) {
            console.log("LoginPage: No session update event received, navigating to overview anyway");
            // Eliminăm listener-ul
            window.removeEventListener('supabase-session-update', sessionUpdateHandler);
            window.removeEventListener('force-session-refresh', sessionUpdateHandler);
            // Navigăm către pagina principală
            navigate("/overview");
          }
        }, 2000); // 2 secunde de așteptare
      }
    } catch (err: any) {
      // Curățăm timeout-ul în caz de eroare
      clearTimeout(loginTimeout);

      console.log("Caught error during login:", err);
      // Gestionăm mai bine mesajele de eroare cu mesaje mai prietenoase și în limba română
      let errorMessage = "A apărut o eroare la autentificare. Vă rugăm să încercați din nou.";

      if (err instanceof Error) {
        if (err.message.includes('timeout')) {
          errorMessage = "Timpul de așteptare a expirat. Vă rugăm să verificați conexiunea la internet și să încercați din nou.";
        } else if (err.message.includes('Invalid login') || err.message.includes('Invalid email')) {
          errorMessage = "Email sau parolă incorecte. Vă rugăm să verificați datele introduse.";
        } else if (err.message.includes('Email not confirmed')) {
          errorMessage = "Adresa de email nu a fost confirmată. Vă rugăm să verificați căsuța de email.";
        } else if (err.message.includes('network')) {
          errorMessage = "Eroare de rețea. Vă rugăm să verificați conexiunea la internet.";
        } else if (err.message.includes('too many requests') || err.message.includes('rate limit')) {
          errorMessage = "Prea multe încercări de autentificare. Vă rugăm să așteptați câteva minute și să încercați din nou.";
        } else if (err.message.includes('User not found')) {
          errorMessage = "Utilizatorul nu există. Vă rugăm să verificați adresa de email sau să vă înregistrați.";
        } else {
          // Pentru alte erori, păstrăm mesajul original dar îl traducem dacă este unul comun
          if (err.message.includes('Authentication')) {
            errorMessage = "Autentificare eșuată. Vă rugăm să încercați din nou.";
          } else {
            errorMessage = err.message;
          }
        }
      }

      setError(errorMessage);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Elemente de fundal animate pentru un efect vizual mai plăcut */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 20, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -10, 0],
            y: [0, 10, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full relative z-10"
      >
        {/* Indicator de stare a conexiunii */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {connectionStatus === 'checking' && (
            <motion.div
              className="flex items-center justify-center space-x-2 text-amber-400 mb-4"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Wifi className="animate-pulse h-5 w-5" />
              <span className="text-sm">Verificare conexiune...</span>
            </motion.div>
          )}

          {connectionStatus === 'offline' && (
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Alert variant="destructive" className="mb-4 bg-red-600/90 border-red-700">
                <WifiOff className="h-4 w-4 mr-2" />
                <AlertDescription>
                  Nu există conexiune la internet sau la server. Vă rugăm să verificați conexiunea și să încercați din nou.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {connectionStatus === 'online' && (
            <motion.div
              className="flex items-center justify-center space-x-2 text-green-400 mb-4"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Wifi className="h-5 w-5" />
              <span className="text-sm">Conexiune stabilită</span>
            </motion.div>
          )}
        </motion.div>

        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <motion.div
              className="flex items-center justify-center gap-2 mb-6"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="h-10 w-10 rounded-full bg-primary flex items-center justify-center"
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <span className="text-primary-foreground font-bold text-xl">
                  IM
                </span>
              </motion.div>
              <motion.span
                className="font-bold text-2xl text-white"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                InventoryMaster
              </motion.span>
            </motion.div>
          </Link>
          <motion.h1
            className="text-3xl font-bold mb-2 text-white"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Bine ați revenit!
          </motion.h1>
          <motion.p
            className="text-slate-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Introduceți datele de autentificare pentru a accesa contul dumneavoastră
          </motion.p>
        </div>

        <motion.div
          className="bg-slate-900 border border-slate-700 rounded-lg p-6 shadow-lg backdrop-blur-sm bg-opacity-80"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {error && (
            <Alert
              variant="destructive"
              className="mb-4 bg-red-600 border-red-700"
            >
              <AlertCircle className="h-4 w-4 text-white" />
              <AlertDescription className="text-white font-medium">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Adresa de email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-300">
                  Parolă
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Ați uitat parola?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label
                htmlFor="remember"
                className="text-sm font-normal cursor-pointer text-slate-300"
              >
                Ține-mă minte pentru 30 de zile
              </Label>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <motion.span
                      className="mr-2 h-4 w-4 rounded-full bg-white inline-block"
                      animate={{ scale: [1, 0.8, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                    Autentificare...
                  </span>
                ) : (
                  "Autentificare"
                )}
              </Button>
            </motion.div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <p className="text-sm text-slate-400">
              Nu aveți un cont?{" "}
              <Link
                to="/register"
                className="text-primary hover:underline font-medium"
              >
                Înregistrare
              </Link>
            </p>
          </div>
        </motion.div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Prin autentificare, sunteți de acord cu{" "}
            <Link to="/terms" className="text-primary hover:underline">
              Termenii și Condițiile
            </Link>{" "}
            și{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Politica de Confidențialitate
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
