import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "@/services/auth/auth-service";

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
    labelWithLink: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    forgotPassword: {
      fontSize: "0.875rem",
      color: "#94a3b8",
      textDecoration: "none"
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

        <h2 style={styles.title}>Autentificare</h2>
        
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

          <div style={styles.formGroup}>
            <div style={styles.labelWithLink}>
              <label htmlFor="password" style={styles.label}>Parolă</label>
              <Link to="/forgot-password" style={styles.forgotPassword}>
                Ai uitat parola?
              </Link>
            </div>
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

          <button 
            type="submit" 
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
            disabled={loading}
          >
            {loading ? "Se procesează..." : "Autentificare"}
          </button>

          <div style={styles.footer}>
            <p>
              Nu ai un cont?{" "}
              <Link to="/register" style={styles.link}>
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
