import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import connectionService from "@/lib/connection-service";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');
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
    setError(null);
    setSuccess(null);

    // Verificăm din nou conexiunea înainte de a încerca resetarea parolei
    if (connectionStatus === 'offline') {
      setError("You appear to be offline. Please check your internet connection and try again.");
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    // Adăugăm un timeout pentru întreaga operațiune - reducem la 10 secunde
    const resetTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError("Request timeout. Please check your internet connection and try again later.");
        console.error("Password reset request timeout reached");
      }
    }, 10000); // 10 secunde timeout

    try {
      // În modul de dezvoltare, simulăm trimiterea email-ului de resetare
      if (import.meta.env.DEV) {
        console.log("Development mode detected, simulating password reset email");

        // Simulăm o mică întârziere pentru a face experiența mai realistă
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Curățăm timeout-ul
        clearTimeout(resetTimeout);

        // Afișăm mesajul de succes
        setSuccess("Password reset instructions have been sent to your email address. Please check your inbox.");

        // Resetăm câmpul de email
        setEmail("");

        return;
      }

      // În producție, trimitem email-ul de resetare a parolei
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });

      // Curățăm timeout-ul
      clearTimeout(resetTimeout);

      if (error) throw error;

      // Afișăm mesajul de succes
      setSuccess("Password reset instructions have been sent to your email address. Please check your inbox.");

      // Resetăm câmpul de email
      setEmail("");
    } catch (err: any) {
      // Curățăm timeout-ul în caz de eroare
      clearTimeout(resetTimeout);

      console.error("Error sending password reset email:", err);
      setError(err.message || "Failed to send password reset email. Please try again.");
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
          <h1 className="text-3xl font-bold mb-2 text-white">Reset Password</h1>
          <p className="text-slate-400">
            Enter your email address and we'll send you instructions to reset your password
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

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Instructions"}
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
  );
};

export default ForgotPasswordPage;
