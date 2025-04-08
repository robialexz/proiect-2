import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login form submitted.");
    setError(null);
    setLoading(true);

    try {
      console.log("Calling signIn function with email:", email);
      const { data: sessionData, error: signInError } = await signIn(email, password);
      console.log("signIn function returned:", {
        success: !!sessionData,
        error: signInError ? signInError.message : null
      });

      if (signInError) {
        console.log("signIn returned an error, throwing...");
        throw signInError;
      }

      // Adăugăm o mică întârziere pentru a permite actualizarea stării
      console.log("signIn successful, navigating to / after short delay");
      setTimeout(() => {
        navigate("/overview");
      }, 500);
    } catch (err: any) {
      console.log("Caught error during login:", err);
      const errorMessage =
        err.message || "Invalid email or password. Please try again.";
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

