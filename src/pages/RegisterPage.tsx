import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "@/services/auth/auth-service";

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

  // Stiluri inline pentru a evita probleme cu importul CSS
  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #1e293b, #0f172a)",
      padding: "1rem"
    },
    card: {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "1rem",
      padding: "2rem",
      width: "100%",
      maxWidth: "450px",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)"
    },
    logo: {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      marginBottom: "1.5rem"
    },
    logoCircle: {
      width: "3.5rem",
      height: "3.5rem",
      backgroundColor: "#6366f1",
      borderRadius: "50%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontWeight: "bold",
      fontSize: "1.5rem",
      color: "white",
      marginBottom: "0.5rem",
      boxShadow: "0 0 15px rgba(99, 102, 241, 0.5)"
    },
    logoText: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      color: "white",
      margin: 0
    },
    title: {
      fontSize: "1.75rem",
      fontWeight: "bold",
      color: "white",
      textAlign: "center" as const,
      marginBottom: "1rem"
    },
    error: {
      backgroundColor: "rgba(239, 68, 68, 0.15)",
      border: "1px solid rgba(239, 68, 68, 0.3)",
      color: "#fca5a5",
      padding: "0.75rem",
      borderRadius: "0.5rem",
      marginBottom: "1rem"
    },
    form: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "1.25rem"
    },
    formRow: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "1rem"
    },
    formGroup: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "0.5rem"
    },
    label: {
      color: "#e2e8f0",
      fontSize: "0.875rem",
      fontWeight: "500"
    },
    input: {
      width: "100%",
      padding: "0.75rem",
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "0.5rem",
      color: "white",
      fontSize: "0.875rem",
      outline: "none"
    },
    checkboxContainer: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      marginTop: "0.5rem"
    },
    checkbox: {
      width: "1.25rem",
      height: "1.25rem",
      backgroundColor: agreedToTerms ? "#6366f1" : "rgba(255, 255, 255, 0.05)",
      border: agreedToTerms ? "1px solid #6366f1" : "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: "0.25rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
      flexShrink: 0
    },
    checkboxLabel: {
      color: "#94a3b8",
      fontSize: "0.875rem"
    },
    button: {
      backgroundColor: "#6366f1",
      color: "white",
      fontWeight: "600",
      padding: "0.75rem",
      borderRadius: "0.5rem",
      border: "none",
      cursor: "pointer",
      fontSize: "0.875rem",
      marginTop: "0.5rem"
    },
    buttonDisabled: {
      opacity: 0.7,
      cursor: "not-allowed"
    },
    footer: {
      textAlign: "center" as const,
      marginTop: "1rem",
      color: "#94a3b8",
      fontSize: "0.875rem"
    },
    link: {
      color: "#6366f1",
      textDecoration: "none",
      fontWeight: "500"
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoCircle}>IM</div>
          <h1 style={styles.logoText}>InventoryMaster</h1>
        </div>

        <h2 style={styles.title}>Înregistrare</h2>
        
        {error && (
          <div style={styles.error}>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label htmlFor="firstName" style={styles.label}>Prenume</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Prenume"
                required
                style={styles.input}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label htmlFor="lastName" style={styles.label}>Nume</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Nume"
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nume@exemplu.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="company" style={styles.label}>Companie (opțional)</label>
            <input
              id="company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Numele companiei"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>Parolă</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.checkboxContainer} onClick={() => setAgreedToTerms(!agreedToTerms)}>
            <div style={styles.checkbox}>
              {agreedToTerms && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span style={styles.checkboxLabel}>
              Sunt de acord cu{" "}
              <Link to="/terms" style={styles.link}>
                Termenii și Condițiile
              </Link>{" "}
              și{" "}
              <Link to="/privacy" style={styles.link}>
                Politica de Confidențialitate
              </Link>
            </span>
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
            disabled={loading}
          >
            {loading ? "Se creează contul..." : "Creează cont"}
          </button>

          <div style={styles.footer}>
            <p>
              Ai deja un cont?{" "}
              <Link to="/login" style={styles.link}>
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
