import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "./components/ui/use-toast";
import { useUI } from "./store";

// Importăm hook-uri personalizate
import { useIsMobile } from "./hooks";

// Importăm rutele aplicației
import AppRoutes from "./routes";

import ChatBotWidget from "./components/ai/ChatBotWidget";
import TestRunner from "./components/TestRunner";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handler pentru evenimentul session-expired
  useEffect(() => {
    const handleSessionExpired = (event: any) => {
      console.log("Session expired event received");

      // Afișăm un mesaj de notificare utilizatorului
      toast({
        title: "Sesiune expirată",
        description:
          event.detail?.message ||
          "Sesiunea a expirat. Vă rugăm să vă autentificați din nou.",
        variant: "destructive",
      });

      // Redirecționăm către pagina de login
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    };

    window.addEventListener("session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("session-expired", handleSessionExpired);
    };
  }, [navigate, toast]);
  // Folosim store-ul UI pentru a seta pagina curentă
  const { setCurrentPage } = useUI();

  // Setăm pagina curentă în funcție de locație
  useEffect(() => {
    const path = location.pathname;
    let pageName = path.split("/").pop() || "home";
    pageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);

    // Construim breadcrumbs
    const breadcrumbs = [];

    // Adăugăm Home întotdeauna
    breadcrumbs.push({ label: "Home", path: "/" });

    // Adăugăm paginile intermediare
    const pathSegments = path.split("/").filter(Boolean);
    let currentPath = "";

    for (let i = 0; i < pathSegments.length; i++) {
      currentPath += `/${pathSegments[i]}`;
      const label =
        pathSegments[i].charAt(0).toUpperCase() + pathSegments[i].slice(1);
      breadcrumbs.push({ label, path: currentPath });
    }

    setCurrentPage(pageName, breadcrumbs);
  }, [location.pathname, setCurrentPage]);

  // Verificăm dacă suntem pe mobil
  const isMobile = useIsMobile();

  return (
    <>
      <AppRoutes />

      {/* Show chatbot only on protected routes */}
      {location.pathname.startsWith("/") &&
        ![
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
        ].includes(location.pathname) && <ChatBotWidget />}

      {/* Adăugăm TestRunner pentru a putea rula testele direct din aplicație */}
      {process.env.NODE_ENV !== "production" && <TestRunner />}
    </>
  );
}

export default App;
