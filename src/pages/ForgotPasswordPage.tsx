import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "@/services/auth/auth-service";

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
      marginBottom: "0.5rem"
    },
    subtitle: {
      color: "#94a3b8",
      textAlign: "center" as const,
      marginBottom: "1.5rem",
      fontSize: "0.875rem"
    },
    error: {
      backgroundColor: "rgba(239, 68, 68, 0.15)",
      border: "1px solid rgba(239, 68, 68, 0.3)",
      color: "#fca5a5",
      padding: "0.75rem",
      borderRadius: "0.5rem",
      marginBottom: "1rem"
    },
    success: {
      backgroundColor: "rgba(34, 197, 94, 0.15)",
      border: "1px solid rgba(34, 197, 94, 0.3)",
      color: "#86efac",
      padding: "0.75rem",
      borderRadius: "0.5rem",
      marginBottom: "1rem"
    },
    form: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "1.25rem"
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
    backLink: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      color: "#94a3b8",
      textDecoration: "none",
      fontSize: "0.875rem",
      marginTop: "1rem"
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

        <h2 style={styles.title}>Resetare parolă</h2>
        <p style={styles.subtitle}>
          Introduceți adresa de email asociată contului dvs. și vă vom trimite un link pentru resetarea parolei.
        </p>
        
        {error && (
          <div style={styles.error}>
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div style={styles.success}>
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
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

          <button 
            type="submit" 
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
            disabled={loading}
          >
            {loading ? "Se procesează..." : "Trimite link de resetare"}
          </button>

          <Link to="/login" style={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Înapoi la autentificare
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
