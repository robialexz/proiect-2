import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, Mail, ArrowLeft, Lock, KeyRound, Loader2 } from "lucide-react";
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

  // Stare pentru animații
  const [currentStep, setCurrentStep] = useState(1);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Efect pentru animația de succes
  useEffect(() => {
    if (success) {
      setCurrentStep(2);
    }
  }, [success]);

  // Variante pentru animații
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.2
      }
    }
  };

  const successVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    }
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "loop" as const
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          {/* Animated background elements */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-primary/10 rounded-full"
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [Math.random() * 100, Math.random() * -100],
                x: [Math.random() * 100, Math.random() * -100],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="flex items-center justify-center gap-2 mb-6">
              <motion.div
                className="h-10 w-10 rounded-full bg-primary flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-primary-foreground font-bold text-xl">
                  IM
                </span>
              </motion.div>
              <motion.span
                className="font-bold text-2xl text-white"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                InventoryMaster
              </motion.span>
            </div>
          </Link>

          <AnimatePresence mode="wait">
            {currentStep === 1 ? (
              <motion.div
                key="step1"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.h1
                  className="text-3xl font-bold mb-2 text-white"
                  variants={itemVariants}
                >
                  Reset Password
                </motion.h1>
                <motion.p
                  className="text-slate-400"
                  variants={itemVariants}
                >
                  Enter your email address and we'll send you instructions to reset your password
                </motion.p>
                <motion.div
                  className="mt-4 flex justify-center"
                  variants={iconVariants}
                >
                  <motion.div
                    className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center"
                    animate={pulseAnimation}
                  >
                    <KeyRound className="h-8 w-8 text-primary" />
                  </motion.div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.div
                  className="flex justify-center mb-4"
                  variants={successVariants}
                >
                  <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                  </div>
                </motion.div>
                <motion.h1
                  className="text-3xl font-bold mb-2 text-white"
                  variants={itemVariants}
                >
                  Check Your Email
                </motion.h1>
                <motion.p
                  className="text-slate-400"
                  variants={itemVariants}
                >
                  We've sent password reset instructions to your email
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg p-6 shadow-lg"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert
                  variant="destructive"
                  className="mb-4 bg-red-600/90 backdrop-blur-sm border-red-700"
                >
                  <AlertCircle className="h-4 w-4 text-white" />
                  <AlertDescription className="text-white font-medium">
                    {error}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {currentStep === 1 ? (
              <motion.form
                className="space-y-4"
                onSubmit={handleSubmit}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.div
                  className="space-y-2"
                  variants={itemVariants}
                >
                  <Label htmlFor="email" className="text-slate-300 flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-slate-800/50 backdrop-blur-sm border-slate-600 text-white"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    className="w-full relative overflow-hidden group"
                    size="lg"
                    disabled={loading}
                  >
                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center"
                        >
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Sending...
                        </motion.div>
                      ) : (
                        <motion.div
                          key="send"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center"
                        >
                          <Mail className="h-5 w-5 mr-2" />
                          Send Reset Instructions
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <motion.div
                      className="absolute inset-0 bg-primary/20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </Button>
                </motion.div>
              </motion.form>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="py-4"
              >
                <motion.div
                  className="text-center space-y-4"
                  variants={itemVariants}
                >
                  <p className="text-slate-300">
                    If you don't see the email, check your spam folder or request another reset link.
                  </p>
                  <Button
                    onClick={() => {
                      setCurrentStep(1);
                      setSuccess(null);
                    }}
                    variant="outline"
                    className="mt-4"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Reset Form
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="mt-6 pt-6 border-t border-slate-700 text-center"
            variants={itemVariants}
          >
            <p className="text-sm text-slate-400">
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium inline-flex items-center"
              >
                <ArrowLeft className="h-3 w-3 mr-1" />
                Back to Login
              </Link>
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-8 text-center"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <p className="text-sm text-slate-500">
            Need help?{" "}
            <Link to="/contact" className="text-primary hover:underline">
              Contact Support
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
