import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth/auth-service";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import "../styles/auth-pages.css";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { error } = await authService.resetPassword(email);

      if (error) {
        throw new Error(error.message || "Resetare parolă eșuată");
      }

      setSuccess(
        "Am trimis un email cu instrucțiuni pentru resetarea parolei. Verificați-vă căsuța de email."
      );
      setEmail("");
    } catch (err: any) {
      console.error("Eroare la resetarea parolei:", err);
      setError(err.message || "A apărut o eroare la trimiterea emailului de resetare");
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

        <h2 className="auth-title">Resetare parolă</h2>
        <p className="auth-subtitle">
          Introduceți adresa de email asociată contului dvs. și vă vom trimite un link pentru resetarea parolei.
        </p>
        
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

          <Button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
          >
            {loading ? "Se procesează..." : "Trimite link de resetare"}
            {!loading && <ArrowRight className="button-icon" />}
          </Button>

          <Link to="/login" className="back-to-login">
            <ArrowLeft className="back-icon" />
            Înapoi la autentificare
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
