import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Verificăm dacă avem un token de resetare în URL
  useEffect(() => {
    // Supabase gestionează automat token-ul din URL
    const handleHashChange = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      if (hashParams.get('type') === 'recovery') {
        // Token-ul este valid, nu trebuie să facem nimic special
        console.log("Password reset token detected in URL");
      }
    };

    handleHashChange();
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validăm parolele
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    // Adăugăm un timeout pentru operațiunea de resetare
    const resetTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError("Password reset timeout. Please try again later.");
        console.error("Password reset timeout reached");
      }
    }, 10000); // 10 secunde timeout

    try {
      // În modul de dezvoltare, simulăm o resetare de parolă reușită
      if (import.meta.env.DEV) {
        console.log("Development mode detected, simulating password reset");

        // Simulăm o mică întârziere pentru a face experiența mai realistă
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Curățăm timeout-ul
        clearTimeout(resetTimeout);

        // Afișăm mesajul de succes
        setSuccess("Your password has been reset successfully.");

        // Resetăm câmpurile
        setPassword("");
        setConfirmPassword("");

        // Redirecționăm către pagina de login după 2 secunde
        setTimeout(() => {
          navigate("/login");
        }, 2000);

        return;
      }

      // În producție, încercăm să actualizăm parola
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      // Curățăm timeout-ul
      clearTimeout(resetTimeout);

      if (error) throw error;

      // Afișăm mesajul de succes
      setSuccess("Your password has been reset successfully.");

      // Resetăm câmpurile
      setPassword("");
      setConfirmPassword("");

      // Redirecționăm către pagina de login după 2 secunde
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      // Curățăm timeout-ul în caz de eroare
      clearTimeout(resetTimeout);

      console.error("Error resetting password:", err);
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Background similar to login */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#18181c] via-[#23243a] to-[#141726]" />
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-md relative overflow-hidden"
          style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)' }}
        >
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
            <h1 className="text-3xl font-bold mb-2 text-white">Set New Password</h1>
            <p className="text-slate-400">
              Create a new password for your account
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

            {success && (
              <Alert
                className="mb-4 bg-green-600 border-green-700"
              >
                <CheckCircle className="h-4 w-4 text-white" />
                <AlertDescription className="text-white font-medium">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  New Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-700 text-center">
              <p className="text-sm text-slate-400">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Back to Login
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Need help?{" "}
              <Link to="/contact" className="text-primary hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
