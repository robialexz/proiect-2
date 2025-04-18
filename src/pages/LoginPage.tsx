import React, { useState, useEffect, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import connectionService from "@/lib/connection-service";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

// Fundal animat cu glassmorphism subtil și particule soft
const GlassAnimatedBackground = () => (
  <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#18181c] via-[#23243a] to-[#141726]">
    {/* Efect glassmorphism subtil */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-blue-300/10 to-purple-400/10 backdrop-blur-2xl" />
    {/* Particule animate SVG foarte subtile */}
    <svg className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" width="100%" height="100%">
      <circle cx="15%" cy="30%" r="60" fill="#7dd3fc" fillOpacity="0.15">
        <animate attributeName="cy" values="30%;40%;30%" dur="8s" repeatCount="indefinite" />
      </circle>
      <circle cx="80%" cy="70%" r="70" fill="#818cf8" fillOpacity="0.12">
        <animate attributeName="cy" values="70%;60%;70%" dur="10s" repeatCount="indefinite" />
      </circle>
      <circle cx="50%" cy="10%" r="40" fill="#f472b6" fillOpacity="0.10">
        <animate attributeName="cy" values="10%;20%;10%" dur="12s" repeatCount="indefinite" />
      </circle>
    </svg>
  </div>
);

const GlassCard = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    className="glass-card bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-md relative overflow-hidden"
    style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)' }}
  >
    {children}
  </motion.div>
);

const AnimatedInput = ({ ...props }) => (
  <motion.input
    {...props}
    whileFocus={{ boxShadow: "0 0 0 3px #818cf8" }}
    transition={{ type: "spring", stiffness: 400, damping: 20 }}
    className={
      "bg-white/20 border border-white/30 text-slate-100 placeholder:text-slate-400 px-3 py-2 rounded w-full outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200 " +
      (props.className || "")
    }
  />
);

interface AnimatedCheckboxProps {
  id: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const AnimatedCheckbox = (props: AnimatedCheckboxProps) => (
  <motion.input
    type="checkbox"
    whileTap={{ scale: 1.2 }}
    transition={{ type: "spring", stiffness: 300 }}
    {...props}
    className={
      "accent-indigo-400 w-4 h-4 rounded focus:ring-2 focus:ring-indigo-400 transition-all duration-200 " +
      (props.className || "")
    }
  />
);

// Logo animat stilizat, SVG subtil
const AnimatedLogo = () => (
  <motion.svg
    width="64" height="64" viewBox="0 0 64 64"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1, rotate: [0, 10, -10, 0] }}
    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
    className="mx-auto mb-4 drop-shadow-xl"
  >
    <defs>
      <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#18181c" stopOpacity="0.1" />
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="url(#grad1)" />
    <path d="M24 36 Q32 28 40 36" stroke="#f472b6" strokeWidth="2.5" fill="none" />
    <circle cx="28" cy="28" r="2.5" fill="#7dd3fc" />
    <circle cx="36" cy="28" r="2.5" fill="#f472b6" />
  </motion.svg>
);

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Verificăm conexiunea la internet și la Supabase
  React.useEffect(() => {
    const checkConnections = async () => {
      // În modul de dezvoltare, considerăm întotdeauna că suntem online
      if (import.meta.env.DEV) {
        console.log("Development mode: assuming online connection");
        setConnectionStatus("online");
        return;
      }

      setConnectionStatus("checking");

      // Verificăm mai întâi conexiunea la internet
      const hasInternet = await connectionService.checkInternetConnection();

      if (!hasInternet) {
        setConnectionStatus("offline");
        return;
      }

      // Apoi verificăm conexiunea la Supabase
      const hasSupabaseConnection = await connectionService.checkConnection();

      setConnectionStatus(hasSupabaseConnection ? "online" : "offline");
    };

    checkConnections();
  }, []);

  // La mount, preia emailul dacă există rememberMe
  React.useEffect(() => {
    const remembered = localStorage.getItem('rememberMe');
    if (remembered) {
      setRememberMe(true);
      const rememberedEmail = localStorage.getItem('rememberedEmail');
      if (rememberedEmail) setEmail(rememberedEmail);
    }
  }, []);

  // Adaugă feedback vizual la autentificare și erori
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: error
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (loading) {
      toast({
        title: "Se autentifică...",
        description: "Vă rugăm să așteptați"
      });
    }
  }, [loading, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('rememberedEmail');
    }

    // Verifică dacă email-ul și parola sunt completate
    if (!email || !password) {
      setError("Vă rugăm să introduceți atât email-ul cât și parola.");
      return;
    }

    // În modul de dezvoltare, ignorăm verificarea conexiunii
    if (!import.meta.env.DEV && connectionStatus === "offline") {
      setError(
        "Nu există conexiune la internet sau la server. Vă rugăm să verificați conexiunea și să încercați din nou.",
      );
      return;
    }

    setLoading(true);

    // Set session flag for welcome message
    sessionStorage.setItem('newLoginDetected', 'true');

    // Adăugăm un timeout pentru întreaga operațiune de login - mărim la 20 secunde pentru a da mai mult timp
    const loginTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError(
          "Timpul de autentificare a expirat. Vă rugăm să verificați conexiunea la internet și să încercați din nou.",
        );
        console.error("Login timeout reached");
      }
    }, 20000); // 20 secunde timeout

    try {
      console.log("LoginPage: Calling signIn function with email:", email);

      // Adăugăm un eveniment pentru a asculta actualizările de sesiune
      const sessionUpdateHandler = (event: any) => {
        console.log("LoginPage: Received session update event");
        if (event.detail?.session) {
          console.log(
            "LoginPage: Session update detected, navigating to dashboard",
          );
          // Curățăm timeout-ul
          clearTimeout(loginTimeout);
          // Eliminăm listener-ul
          window.removeEventListener(
            "supabase-session-update",
            sessionUpdateHandler,
          );
          window.removeEventListener(
            "force-session-refresh",
            sessionUpdateHandler,
          );
          // Navigăm către pagina principală
          navigate("/dashboard");
        }
      };

      // Adăugăm listener pentru ambele evenimente
      window.addEventListener("supabase-session-update", sessionUpdateHandler);
      window.addEventListener("force-session-refresh", sessionUpdateHandler);

      // Autentificare normală
      const { data: sessionData, error: signInError } = await signIn(
        email,
        password,
      );
      console.log("LoginPage: signIn function returned:", {
        success: !!sessionData,
        error: signInError ? signInError.message : null,
        redirecting: signInError ? false : true,
      });

      // Curățăm timeout-ul deoarece am primit un răspuns
      clearTimeout(loginTimeout);

      if (signInError) {
        console.log("signIn returned an error, throwing...");
        // Eliminăm listener-ul în caz de eroare
        window.removeEventListener(
          "supabase-session-update",
          sessionUpdateHandler,
        );
        window.removeEventListener(
          "force-session-refresh",
          sessionUpdateHandler,
        );
        throw signInError;
      }

      // Verificăm dacă avem date de sesiune
      if (sessionData) {
        console.log(
          "LoginPage: Authentication successful, navigating to dashboard",
        );
        // Navigație directă către pagina principală
        navigate("/dashboard");
      } else {
        // Așteptăm evenimentul de actualizare a sesiunii
        console.log(
          "LoginPage: No session data returned, waiting for session update event",
        );
        // Adăugăm un timeout suplimentar pentru a aștepta evenimentul
        setTimeout(() => {
          // Verificăm dacă încă mai suntem pe pagina de login
          if (window.location.pathname.includes("login")) {
            console.log(
              "LoginPage: No session update event received, navigating to dashboard anyway",
            );
            // Eliminăm listener-ul
            window.removeEventListener(
              "supabase-session-update",
              sessionUpdateHandler,
            );
            window.removeEventListener(
              "force-session-refresh",
              sessionUpdateHandler,
            );
            // Navigăm către pagina principală
            navigate("/dashboard");
          }
        }, 2000); // 2 secunde de așteptare
      }
    } catch (err: any) {
      // Curățăm timeout-ul în caz de eroare
      clearTimeout(loginTimeout);

      console.log("Caught error during login:", err);
      // Gestionăm mai bine mesajele de eroare cu mesaje mai prietenoase și în limba română
      let errorMessage =
        "A apărut o eroare la autentificare. Vă rugăm să încercați din nou.";

      if (err instanceof Error) {
        if (err.message.includes("timeout")) {
          errorMessage =
            "Timpul de așteptare a expirat. Vă rugăm să verificați conexiunea la internet și să încercați din nou.";
        } else if (
          err.message.includes("Invalid login") ||
          err.message.includes("Invalid email")
        ) {
          errorMessage =
            "Email sau parolă incorecte. Vă rugăm să verificați datele introduse.";
        } else if (err.message.includes("Email not confirmed")) {
          errorMessage =
            "Adresa de email nu a fost confirmată. Vă rugăm să verificați căsuța de email.";
        } else if (err.message.includes("network")) {
          errorMessage =
            "Eroare de rețea. Vă rugăm să verificați conexiunea la internet.";
        } else if (
          err.message.includes("too many requests") ||
          err.message.includes("rate limit")
        ) {
          errorMessage =
            "Prea multe încercări de autentificare. Vă rugăm să așteptați câteva minute și să încercați din nou.";
        } else if (err.message.includes("User not found")) {
          errorMessage =
            "Utilizatorul nu există. Vă rugăm să verificați adresa de email sau să vă înregistrați.";
        } else {
          // Pentru alte erori, păstrăm mesajul original dar îl traducem dacă este unul comun
          if (err.message.includes("Authentication")) {
            errorMessage =
              "Autentificare eșuată. Vă rugăm să încercați din nou.";
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
    <>
      <Toaster />
      <GlassAnimatedBackground />
      <div className="min-h-screen flex flex-col justify-center items-center px-4">
        <GlassCard>
          <AnimatedLogo />
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-extrabold text-slate-100 text-center mb-6 drop-shadow-lg"
          >
            Autentificare
          </motion.h1>

          {error && (
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="mb-4"
            >
              <Alert
                variant="destructive"
                className="mb-4 bg-red-600/90 border-red-700"
              >
                <AlertCircle className="h-5 w-5 text-red-200" />
                <AlertDescription className="text-red-100">
                  {error}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">
                Adresa de email
              </Label>
              <AnimatedInput
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-200">
                  Parolă
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-indigo-300 hover:underline"
                >
                  Ați uitat parola?
                </Link>
              </div>
              <div className="relative">
                <AnimatedInput
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ascunde parola" : "Afișează parola"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-400 focus:outline-none"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <AnimatedCheckbox
                id="remember"
                checked={rememberMe}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-normal cursor-pointer text-slate-200"
              >
                Ține-mă minte pentru 30 de zile
              </Label>
            </div>

            <motion.div
              whileHover={{ scale: 1.04, boxShadow: "0px 4px 16px #818cf8aa" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Button
                type="submit"
                className="w-full relative overflow-hidden bg-indigo-500/80 hover:bg-indigo-400/90 text-white font-semibold shadow-lg shadow-indigo-900/20 border border-white/20 backdrop-blur"
                size="lg"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <motion.span
                      className="mr-2 h-4 w-4 rounded-full bg-white inline-block"
                      animate={{ scale: [1, 0.8, 1], rotate: [0, 360, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                    Autentificare...
                  </span>
                ) : (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Autentificare
                  </motion.span>
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 pt-6 border-t border-white/10 text-center"
          >
            <p className="text-sm text-slate-300">
              Nu aveți un cont?{" "}
              <Link
                to="/register"
                className="text-indigo-300 hover:underline font-medium"
              >
                Înregistrare
              </Link>
            </p>
          </motion.div>
        </GlassCard>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-slate-400">
            Prin autentificare, sunteți de acord cu{" "}
            <Link to="/terms" className="text-indigo-300 hover:underline">
              Termenii și Condițiile
            </Link>{" "}
            și{" "}
            <Link to="/privacy" className="text-indigo-300 hover:underline">
              Politica de Confidențialitate
            </Link>
          </p>
        </motion.div>
      </div>
      <style>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
          100% { transform: translateX(0); }
        }
        .glass-card {
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.25);
        }
      `}</style>
    </>
  );
};

export default LoginPage;
