import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Pagină combinată pentru autentificare și înregistrare
 */
const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  // Stare pentru a determina dacă afișăm formularul de login sau register
  const [isLogin, setIsLogin] = useState(location.pathname === "/login");

  // Stări pentru formularul de login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  // Stări pentru formularul de înregistrare
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  // Verificăm dacă avem un mesaj din state (de exemplu, după redirecționare)
  const stateMessage = location.state?.message;

  // Gestionăm schimbarea între login și register
  const toggleAuthMode = () => {
    // Resetăm erorile și mesajele de succes
    setLoginError(null);
    setLoginSuccess(null);
    setRegisterError(null);
    setRegisterSuccess(null);

    // Schimbăm modul
    setIsLogin(!isLogin);

    // Actualizăm URL-ul fără a reîncărca pagina
    navigate(isLogin ? "/register" : "/login", { replace: true });
  };

  // Gestionăm autentificarea
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);
    setLoginLoading(true);

    try {
      // Doar în dezvoltare, nu în producție
      if (process.env.NODE_ENV !== "production") {
        console.log("Trimit cerere de autentificare pentru:", loginEmail);
      }

      const { data, error } = await signIn(loginEmail, loginPassword);

      if (error) {
        throw new Error(error.message || "Autentificare eșuată");
      }

      setLoginSuccess(
        "Autentificare reușită! Veți fi redirecționat în curând..."
      );
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err: any) {
      // Doar în dezvoltare, nu în producție
      if (process.env.NODE_ENV !== "production") {
        console.error("Eroare la autentificare:", err);
      }
      setLoginError(err.message || "A apărut o eroare la autentificare");
    } finally {
      setLoginLoading(false);
    }
  };

  // Gestionăm înregistrarea
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    setRegisterSuccess(null);

    if (!agreedToTerms) {
      setRegisterError("Trebuie să fiți de acord cu Termenii și Condițiile");
      return;
    }

    setRegisterLoading(true);

    try {
      // Doar în dezvoltare, nu în producție
      if (process.env.NODE_ENV !== "production") {
        console.log("Trimit cerere de înregistrare pentru:", registerEmail);
      }

      const { data, error } = await signUp(
        registerEmail,
        registerPassword,
        firstName
      );

      if (error) {
        // Verificăm dacă este o eroare de utilizator existent
        if (
          (error as any).code === "user_already_registered" ||
          (error.message &&
            (error.message.toLowerCase().includes("user already registered") ||
              error.message.toLowerCase().includes("există deja un cont")))
        ) {
          throw new Error(
            "Există deja un cont cu această adresă de email. Vă rugăm să vă autentificați sau să folosiți opțiunea 'Am uitat parola'."
          );
        } else {
          throw new Error(error.message || "Înregistrare eșuată");
        }
      }

      // Afișăm mesajul de succes și redirecționăm către login
      const successMessage =
        "Cont creat cu succes! Verificați email-ul pentru a confirma contul.";
      setRegisterSuccess(successMessage);

      // Folosim un singur setTimeout pentru a reduce consumul de resurse
      setTimeout(() => {
        setIsLogin(true);
        navigate("/login", {
          replace: true,
          state: { message: successMessage },
        });
      }, 2000);
    } catch (err: any) {
      // Doar în dezvoltare, nu în producție
      if (process.env.NODE_ENV !== "production") {
        console.error("Eroare la înregistrare:", err);
      }
      setRegisterError(err.message || "A apărut o eroare la crearea contului");
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-slate-900">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? "login" : "register"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            layoutId="auth-card"
          >
            <Card className="border-slate-700 bg-slate-800 shadow-xl overflow-hidden">
              <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-2">
                  <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">IM</span>
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-white">
                  {isLogin ? "Autentificare" : "Înregistrare"}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {isLogin
                    ? "Introduceți datele pentru a vă autentifica"
                    : "Creați un cont nou pentru a accesa aplicația"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Mesaj din state (după redirecționare) */}
                {stateMessage && !loginError && !registerError && (
                  <Alert className="bg-green-900/50 border-green-800">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-200">
                      {stateMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Formular de login */}
                {isLogin && (
                  <>
                    {loginError && (
                      <Alert
                        variant="destructive"
                        className="bg-red-900/50 border-red-800"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-200">
                          {loginError}
                        </AlertDescription>
                      </Alert>
                    )}

                    {loginSuccess && (
                      <Alert className="bg-green-900/50 border-green-800">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <AlertDescription className="text-green-200">
                          {loginSuccess}
                        </AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-300">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={loginEmail}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Folosim un setTimeout pentru a evita blocarea UI-ului
                            setTimeout(() => setLoginEmail(value), 0);
                          }}
                          placeholder="nume@exemplu.com"
                          required
                          autoComplete="email"
                          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-slate-300">
                            Parolă
                          </Label>
                          <a
                            href="/forgot-password"
                            className="text-xs text-indigo-400 hover:text-indigo-300"
                          >
                            Am uitat parola
                          </a>
                        </div>
                        <Input
                          id="password"
                          type="password"
                          value={loginPassword}
                          onChange={(e) => {
                            const value = e.target.value;
                            setTimeout(() => setLoginPassword(value), 0);
                          }}
                          placeholder="••••••••"
                          required
                          autoComplete="current-password"
                          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
                        disabled={loginLoading}
                      >
                        {loginLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Se procesează...
                          </>
                        ) : (
                          "Autentificare"
                        )}
                      </Button>
                    </form>
                  </>
                )}

                {/* Formular de înregistrare */}
                {!isLogin && (
                  <>
                    {registerError && (
                      <Alert
                        variant="destructive"
                        className="bg-red-900/50 border-red-800"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-200">
                          {registerError}
                        </AlertDescription>
                      </Alert>
                    )}

                    {registerSuccess && (
                      <Alert className="bg-green-900/50 border-green-800">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <AlertDescription className="text-green-200">
                          {registerSuccess}
                        </AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-slate-300">
                            Prenume
                          </Label>
                          <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Prenume"
                            required
                            autoComplete="given-name"
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-slate-300">
                            Nume
                          </Label>
                          <Input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Nume"
                            required
                            autoComplete="family-name"
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="registerEmail"
                          className="text-slate-300"
                        >
                          Email
                        </Label>
                        <Input
                          id="registerEmail"
                          type="email"
                          value={registerEmail}
                          onChange={(e) => {
                            const value = e.target.value;
                            setTimeout(() => setRegisterEmail(value), 0);
                          }}
                          placeholder="nume@exemplu.com"
                          required
                          autoComplete="email"
                          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-slate-300">
                          Companie (opțional)
                        </Label>
                        <Input
                          id="company"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Numele companiei"
                          autoComplete="organization"
                          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="registerPassword"
                          className="text-slate-300"
                        >
                          Parolă
                        </Label>
                        <Input
                          id="registerPassword"
                          type="password"
                          value={registerPassword}
                          onChange={(e) => {
                            const value = e.target.value;
                            setTimeout(() => setRegisterPassword(value), 0);
                          }}
                          placeholder="••••••••"
                          required
                          autoComplete="new-password"
                          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="terms"
                          checked={agreedToTerms}
                          onCheckedChange={(checked) =>
                            setAgreedToTerms(checked as boolean)
                          }
                          className="data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                        />
                        <label
                          htmlFor="terms"
                          className="text-sm text-slate-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Sunt de acord cu{" "}
                          <a
                            href="/terms"
                            className="text-indigo-400 hover:text-indigo-300"
                          >
                            Termenii și Condițiile
                          </a>{" "}
                          și{" "}
                          <a
                            href="/privacy"
                            className="text-indigo-400 hover:text-indigo-300"
                          >
                            Politica de Confidențialitate
                          </a>
                        </label>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
                        disabled={registerLoading}
                      >
                        {registerLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Se creează contul...
                          </>
                        ) : (
                          "Creează cont"
                        )}
                      </Button>
                    </form>
                  </>
                )}
              </CardContent>

              <CardFooter className="flex justify-center">
                <p className="text-sm text-slate-400">
                  {isLogin ? (
                    <>
                      Nu ai cont?{" "}
                      <button
                        onClick={toggleAuthMode}
                        className="text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        Înregistrează-te
                      </button>
                    </>
                  ) : (
                    <>
                      Ai deja un cont?{" "}
                      <button
                        onClick={toggleAuthMode}
                        className="text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        Autentifică-te
                      </button>
                    </>
                  )}
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthPage;
