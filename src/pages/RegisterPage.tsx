import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth/auth-service";
import { Mail, Lock, User, Building, ArrowRight, Check } from "lucide-react";
import "../styles/auth-pages.css";

const RegisterPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreedToTerms) {
      setError("Trebuie să fii de acord cu Termenii și Condițiile");
      return;
    }

    setLoading(true);

    try {
      const { error } = await authService.signUp(email, password);

      if (error) {
        throw new Error(error.message || "Înregistrare eșuată");
      }

      // În aplicația reală, aici am salva datele profilului utilizatorului în baza de date
      // De exemplu: await supabase.from('profiles').insert({ user_id: data.user.id, first_name: firstName, last_name: lastName, company })

      // Redirecționăm către pagina de confirmare sau login
      navigate("/login", { 
        state: { 
          message: "Cont creat cu succes! Verificați email-ul pentru a confirma contul." 
        } 
      });
    } catch (err: any) {
      console.error("Eroare la înregistrare:", err);
      setError(err.message || "A apărut o eroare la crearea contului");
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

        <h2 className="auth-title">Înregistrare</h2>
        
        {error && (
          <div className="auth-error">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <Label htmlFor="firstName">Prenume</Label>
              <div className="input-with-icon">
                <User className="input-icon" />
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Prenume"
                  required
                  className="auth-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <Label htmlFor="lastName">Nume</Label>
              <div className="input-with-icon">
                <User className="input-icon" />
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Nume"
                  required
                  className="auth-input"
                />
              </div>
            </div>
          </div>

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
            <Label htmlFor="company">Companie (opțional)</Label>
            <div className="input-with-icon">
              <Building className="input-icon" />
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Numele companiei"
                className="auth-input"
              />
            </div>
          </div>

          <div className="form-group">
            <Label htmlFor="password">Parolă</Label>
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

          <div className="terms-checkbox">
            <div 
              className={`custom-checkbox ${agreedToTerms ? 'checked' : ''}`}
              onClick={() => setAgreedToTerms(!agreedToTerms)}
            >
              {agreedToTerms && <Check className="check-icon" />}
            </div>
            <span>
              Sunt de acord cu{" "}
              <Link to="/terms" className="auth-link">
                Termenii și Condițiile
              </Link>{" "}
              și{" "}
              <Link to="/privacy" className="auth-link">
                Politica de Confidențialitate
              </Link>
            </span>
          </div>

          <Button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
          >
            {loading ? "Se creează contul..." : "Creează cont"}
            {!loading && <ArrowRight className="button-icon" />}
          </Button>

          <div className="auth-footer">
            <p>
              Ai deja un cont?{" "}
              <Link to="/login" className="auth-link">
                Autentifică-te
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
