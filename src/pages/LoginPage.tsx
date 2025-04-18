import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Lock, Mail, CheckCircle } from "lucide-react";
import { authService } from "@/services/auth/auth-service";

/**
 * Pagină de autentificare
 * Permite utilizatorilor să se autentifice în aplicație
 */
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Verificăm dacă există un mesaj de succes în state-ul locației
  useEffect(() => {
    if (location.state && location.state.message) {
      setSuccessMessage(location.state.message);
      // Resetăm state-ul locației pentru a nu afișa mesajul la fiecare render
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const { data, error } = await authService.signIn(email, password);

      if (error) {
        throw new Error(error.message || "Autentificare eșuată");
      }

      if (data?.session) {
        // Autentificare reușită, redirecționăm către dashboard
        navigate("/dashboard");
      } else {
        throw new Error("Nu s-a putut obține sesiunea");
      }
    } catch (err: any) {
      console.error("Eroare la autentificare:", err);
      setError(err.message || "A apărut o eroare la autentificare");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-6">
          <Link to="/" className="inline-block">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">IM</span>
              </div>
              <span className="font-bold text-2xl text-white">
                InventoryMaster
              </span>
            </div>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-100 mt-4">
            Autentificare
          </h1>
          <p className="text-slate-400 mt-2">
            Introduceți datele pentru a vă autentifica
          </p>
        </div>

        {error && (
          <Alert
            variant="destructive"
            className="mb-6 bg-red-900/50 border-red-800"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 bg-green-900/50 border-green-800">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-200">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="nume@exemplu.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-800/50 border-slate-700 pl-10 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-slate-300">
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
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-800/50 border-slate-700 pl-10 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-semibold mt-6"
            size="lg"
            disabled={loading}
          >
            {loading ? "Se procesează..." : "Autentificare"}
          </Button>

          <div className="text-center">
            <p className="text-sm text-slate-300 mt-4">
              Nu aveți un cont?{" "}
              <Link
                to="/register"
                className="text-indigo-300 hover:underline font-medium"
              >
                Înregistrare
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
