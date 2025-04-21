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
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  Mail,
  Info as InfoIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";

/**
 * Pagină combinată pentru autentificare și înregistrare
 */
const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signIn, signUp, authService, user } = useAuth();

  // Dacă utilizatorul este deja autentificat, îl redirectăm către dashboard
  React.useEffect(() => {
    // Verificăm dacă suntem în proces de redirecționare pentru a evita bucla
    const isRedirecting = sessionStorage.getItem("redirecting_to_login");

    if (user) {
      navigate("/dashboard", { replace: true });
    } else if (!isRedirecting) {
      // Ștergem doar anumite date de autentificare pentru a preveni problemele, dar nu toate
      // pentru a evita bucla de reîncărcare
      localStorage.removeItem("auth-storage");
      sessionStorage.removeItem("auth-storage");

      // Nu mai ștergem toate cheile pentru a evita problemele de reîncărcare continuă
    }
  }, [user, navigate]);

  // State pentru retrimiterea email-ului de confirmare
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [showResendForm, setShowResendForm] = useState(false);
  const [showResendOption, setShowResendOption] = useState(false);
  const [registrationTime, setRegistrationTime] = useState<number | null>(null);

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
    setResendError(null);
    setResendSuccess(null);
    setShowResendForm(false);

    // Schimbăm modul
    setIsLogin(!isLogin);

    // Actualizăm URL-ul fără a reîncărca pagina
    navigate(isLogin ? "/register" : "/login", { replace: true });
  };

  // Gestionăm retrimiterea email-ului de confirmare
  const handleResendConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendError(null);
    setResendSuccess(null);
    setResendLoading(true);

    try {
      // Doar în dezvoltare, nu în producție
      if (process.env.NODE_ENV !== "production") {
        // Removed console statement
      }

      try {
        const { error } = await authService.resendConfirmationEmail(
          resendEmail
        );
      } catch (error) {
        // Handle error appropriately
      }

      if (error) {
        throw new Error(
          error.message || "Nu am putut retrimite email-ul de confirmare"
        );
      }

      setResendSuccess(
        "Email-ul de confirmare a fost retrimis. Vă rugăm să verificați căsuța de email, inclusiv folderul de spam."
      );

      // Resetăm formularul după 5 secunde
      setTimeout(() => {
        setShowResendForm(false);
        setResendEmail("");
      }, 5000);
    } catch (err: any) {
      // Doar în dezvoltare, nu în producție
      if (process.env.NODE_ENV !== "production") {
        // Removed console statement
      }
      setResendError(
        err.message || "A apărut o eroare la retrimiterea email-ului"
      );
    } finally {
      setResendLoading(false);
    }
  };

  // Funcție pentru a afișa/ascunde formularul de retrimitere email
  const toggleResendForm = () => {
    setShowResendForm(!showResendForm);
    setResendError(null);
    setResendSuccess(null);
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
        // Removed console statement
      }

      try {
        const { data, error } = await signIn(loginEmail, loginPassword);
      } catch (error) {
        // Handle error appropriately
      }

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
        // Removed console statement
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
        // Removed console statement
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
          // Setez email-ul pentru retrimitere/recuperare
          setResendEmail(registerEmail);

          // Afișăm un mesaj de eroare cu opțiuni
          setRegisterError(
            "Există deja un cont cu această adresă de email. Puteți să vă autentificați sau să folosiți opțiunile de mai jos."
          );

          // Afișăm opțiunile pentru utilizatorul existent
          setShowResendOption(true);

          // Nu aruncăm eroare pentru a permite utilizatorului să vadă opțiunile
          return;
        } else {
          throw new Error(error.message || "Înregistrare eșuată");
        }
      }

      // Setăm timpul de înregistrare pentru a afișa butonul de retrimitere după 1 minut
      setRegistrationTime(Date.now());
      setResendEmail(registerEmail); // Pre-completăm email-ul pentru retrimitere

      // Setăm un timer pentru a afișa opțiunea de retrimitere după 1 minut
      setTimeout(() => {
        setShowResendOption(true);
      }, 60000); // 1 minut = 60000 ms

      // Verificăm dacă avem date și dacă email-ul a fost trimis
      if (data && data.user) {
        // Verificăm dacă email-ul de confirmare a fost trimis
        if (data.user.email_confirmed_at) {
          // Email-ul este deja confirmat (rar, dar posibil)
          const successMessage =
            "Cont creat cu succes! Email-ul dvs. este deja confirmat.";
          setRegisterSuccess(successMessage);

          // Redirecționăm către login după un timp mai lung
          setTimeout(() => {
            setIsLogin(true);
            navigate("/login", {
              replace: true,
              state: { message: successMessage },
            });
          }, 120000); // 2 minute pentru a da timp utilizatorului să vadă opțiunea de retrimitere
        } else if (data.user.confirmation_sent_at) {
          // Email-ul de confirmare a fost trimis
          const successMessage =
            "Cont creat cu succes! Vă rugăm să verificați email-ul pentru a confirma contul. Verificați și folderul de spam dacă nu găsiți email-ul. După 1 minut veți putea retrimite email-ul de confirmare dacă nu l-ați primit.";
          setRegisterSuccess(successMessage);

          // Nu mai redirecționăm automat către login pentru a permite utilizatorului să folosească opțiunea de retrimitere
        } else {
          // Email-ul de confirmare nu a fost trimis (posibilă problemă de configurare)
          const successMessage =
            "Cont creat cu succes! Însă nu am putut trimite email-ul de confirmare. După 1 minut veți putea încerca să retrimiteți email-ul de confirmare.";
          setRegisterSuccess(successMessage);

          // Nu mai redirecționăm automat către login pentru a permite utilizatorului să folosească opțiunea de retrimitere
        }
      } else {
        // Nu avem date despre utilizator, dar nu avem nici eroare (situație ciudată)
        const successMessage =
          "Cont creat cu succes! Verificați email-ul pentru a confirma contul. După 1 minut veți putea retrimite email-ul de confirmare dacă nu l-ați primit.";
        setRegisterSuccess(successMessage);

        // Nu mai redirecționăm automat către login pentru a permite utilizatorului să folosească opțiunea de retrimitere
      }
    } catch (err: any) {
      // Doar în dezvoltare, nu în producție
      if (process.env.NODE_ENV !== "production") {
        // Removed console statement
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

                {/* Mesaj informativ despre conexiune */}
                <Alert className="bg-blue-900/30 border-blue-800">
                  <InfoIcon className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-200">
                    Notă: Autentificarea poate dura până la 60 de secunde în
                    funcție de viteza conexiunii. Vă rugăm să aveți răbdare.
                  </AlertDescription>
                </Alert>

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
                            Se procesează... (poate dura până la 60 secunde)
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
                            Se creează contul... (poate dura până la 60 secunde)
                          </>
                        ) : (
                          "Creează cont"
                        )}
                      </Button>

                      {/* Secțiune pentru retrimiterea email-ului de confirmare - apare după 1 minut sau în caz de email existent */}
                      {showResendOption &&
                        (registerSuccess || registerError) && (
                          <div className="mt-6">
                            <Separator className="my-4" />

                            {!showResendForm ? (
                              <div className="text-center">
                                <p className="text-sm text-slate-400 mb-2">
                                  {registerError
                                    ? "Alegeți una din opțiunile de mai jos pentru a continua:"
                                    : "Nu ați primit email-ul de confirmare? Puteți retrimite acum."}
                                </p>

                                <div className="flex flex-col space-y-2">
                                  {registerError && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setIsLogin(true);
                                        navigate("/login");
                                      }}
                                      className="text-indigo-400 border-indigo-800 hover:bg-indigo-900/50"
                                    >
                                      Autentificare cu contul existent
                                    </Button>
                                  )}

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleResendForm}
                                    className="text-indigo-400 border-indigo-800 hover:bg-indigo-900/50"
                                  >
                                    <Mail className="mr-2 h-4 w-4" />
                                    {registerError
                                      ? "Recuperare parolă"
                                      : "Retrimite email de confirmare"}
                                  </Button>

                                  {registerError && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setRegisterEmail("");
                                        setRegisterError(null);
                                        setShowResendOption(false);
                                      }}
                                      className="text-slate-400 border-slate-600 hover:bg-slate-700/50 mt-2"
                                    >
                                      Folosiți altă adresă de email
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <h3 className="text-sm font-medium text-slate-300 text-center">
                                  {registerError
                                    ? "Recuperare parolă"
                                    : "Retrimite email-ul de confirmare"}
                                </h3>

                                {resendError && (
                                  <Alert
                                    variant="destructive"
                                    className="bg-red-900/50 border-red-800"
                                  >
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-red-200">
                                      {resendError}
                                    </AlertDescription>
                                  </Alert>
                                )}

                                {resendSuccess && (
                                  <Alert className="bg-green-900/50 border-green-800">
                                    <CheckCircle className="h-4 w-4 text-green-400" />
                                    <AlertDescription className="text-green-200">
                                      {resendSuccess}
                                    </AlertDescription>
                                  </Alert>
                                )}

                                <form
                                  onSubmit={handleResendConfirmation}
                                  className="space-y-4"
                                >
                                  <div className="space-y-2">
                                    <Label
                                      htmlFor="resendEmail"
                                      className="text-slate-300"
                                    >
                                      Email
                                    </Label>
                                    <Input
                                      id="resendEmail"
                                      type="email"
                                      value={resendEmail}
                                      onChange={(e) =>
                                        setResendEmail(e.target.value)
                                      }
                                      placeholder="nume@exemplu.com"
                                      required
                                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                                    />
                                  </div>

                                  <div className="flex space-x-2">
                                    <Button
                                      type="submit"
                                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white"
                                      disabled={resendLoading}
                                      size="sm"
                                    >
                                      {resendLoading ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Se trimite...
                                        </>
                                      ) : (
                                        "Trimite"
                                      )}
                                    </Button>

                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                      onClick={toggleResendForm}
                                      size="sm"
                                    >
                                      Anulare
                                    </Button>
                                  </div>
                                </form>
                              </div>
                            )}
                          </div>
                        )}
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
