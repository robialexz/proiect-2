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
      // Gestionăm mai bine mesajele de eroare
      let errorMessage = "An error occurred during login. Please try again.";

      if (err instanceof Error) {
        if (err.message.includes('timeout')) {
          errorMessage = "Login timed out. Please check your internet connection and try again.";
        } else if (err.message.includes('Invalid login')) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (err.message.includes('network')) {
          errorMessage = "Network error. Please check your internet connection.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Indicator de stare a conexiunii */}
        {connectionStatus === 'checking' && (
          <div className="flex items-center justify-center space-x-2 text-amber-400 mb-4">
            <Wifi className="animate-pulse h-5 w-5" />
            <span className="text-sm">Verificare conexiune...</span>
          </div>
        )}

        {connectionStatus === 'offline' && (
          <Alert variant="destructive" className="mb-4">
            <WifiOff className="h-4 w-4 mr-2" />
            <AlertDescription>
              Nu există conexiune la internet sau la server. Vă rugăm să verificați conexiunea și să încercați din nou.
            </AlertDescription>
          </Alert>
        )}

        {connectionStatus === 'online' && (
          <div className="flex items-center justify-center space-x-2 text-green-400 mb-4">
            <Wifi className="h-5 w-5" />
            <span className="text-sm">Conexiune stabilită</span>
          </div>
        )}

        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">
                  IM
                </span>
              </div>
              <span className="font-bold text-2xl text-white">
                InventoryMaster
              </span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold mb-2 text-white">Welcome back</h1>
          <p className="text-slate-400">
            Enter your credentials to access your account
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 shadow-lg">
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
                Email
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
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
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
                Remember me for 30 days
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <p className="text-sm text-slate-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            By signing in, you agree to our{" "}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
