import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth/auth-service";
import { Mail, Lock, ArrowRight } from "lucide-react";
import "../styles/auth-pages.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Verificăm dacă există un mesaj de succes în state-ul locației
  useEffect(() => {
    if (location.state && location.state.message) {
      setSuccess(location.state.message);
      // Resetăm state-ul locației pentru a nu afișa mesajul la fiecare render
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
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
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-circle">IM</div>
          <h1 className="logo-text">InventoryMaster</h1>
        </div>

        <h2 className="auth-title">Autentificare</h2>
        
        {error && (
          <div className="auth-error">
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="auth-success">
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <Label htmlFor="email">Email</Label>
            <div className="input-with-icon">
              <Mail className="input-icon" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nume@exemplu.com"
                required
                className="auth-input"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-with-link">
              <Label htmlFor="password">Parolă</Label>
              <Link to="/forgot-password" className="forgot-password">
                Ai uitat parola?
              </Link>
            </div>
            <div className="input-with-icon">
              <Lock className="input-icon" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="auth-input"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
          >
            {loading ? "Se procesează..." : "Autentificare"}
            {!loading && <ArrowRight className="button-icon" />}
          </Button>

          <div className="auth-footer">
            <p>
              Nu ai un cont?{" "}
              <Link to="/register" className="auth-link">
                Înregistrează-te
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
