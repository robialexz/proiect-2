import React, { useState, useEffect, memo, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { pageTransition } from "@/lib/animation-variants";
import { useNotification } from "@/components/ui/notification";
import { useMemoizedCallback } from "@/lib/performance";
import ConnectionStatus from "@/components/ui/connection-status";
import { routePreloader } from "@/lib/route-preloader";
import { OfflineIndicator } from "@/components/ui/offline-indicator";
import { measurePageLoad } from "@/lib/performance-optimizer";
import WelcomeOverlay from "@/components/welcome/WelcomeOverlay";

// Importăm hook-uri personalizate
import { useAuth } from "@/contexts/AuthContext"; // Corrected import path
import { useUI } from "@/store"; // Assuming useUI is still correct
import { useMediaQuery, useDebounce } from "@/hooks";

const AppLayout: React.FC = () => {
  const location = useLocation();
  // Use state from the new AuthContext: user, loading (for initial session check)
  // profile is available if needed, but not directly used for guarding here.
  const { user, loading } = useAuth();
  const { addNotification } = useNotification(); // Keep if used elsewhere
  const { sidebarOpen, setSidebarOpen, theme } = useUI(); // Keep UI store usage
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Verificăm dacă suntem pe mobil
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Folosim debounce pentru a evita re-render-uri frecvente
  const debouncedIsMobile = useDebounce(isMobile, 100);

  // Utilizăm tranziția pentru pagini
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [transitionComplete, setTransitionComplete] = useState(false);

  // Funcție pentru a marca tranziția ca finalizată
  const completeTransition = useCallback(() => {
    setTransitionComplete(true);
    setIsPageLoading(false);
  }, []);

  // Optimizare: Preîncărcăm rutele adiacente pentru o navigație mai rapidă
  useEffect(() => {
    // Măsurăm performanța încărcării paginii
    const endMeasurement = measurePageLoad(location.pathname);

    // Preîncărcăm rutele adiacente pentru a îmbunătăți performanța
    routePreloader.preloadAdjacentRoutes(location.pathname);

    // Finalizăm măsurătoarea după ce pagina s-a încărcat complet
    if (transitionComplete) {
      endMeasurement();
    }

    return () => {
      // Curățăm orice resurse necesare
    };
  }, [location.pathname, transitionComplete]); // Keep performance/preloading logic

  // Stare pentru afișarea overlay-ului de bun venit
  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState(false);

  // Afișăm un mesaj de bun venit doar la prima logare
  // This logic relies on sessionStorage flags set during login
  useEffect(() => {
    // Folosim sessionStorage pentru a verifica dacă mesajul a fost deja afișat în această sesiune
    // Folosim sessionStorage în loc de localStorage pentru a reseta la închiderea browserului
    const welcomeShown = sessionStorage.getItem("welcomeMessageShown");
    const isNewLogin = sessionStorage.getItem("newLoginDetected");

    if (user && !loading) {
      // Verificăm dacă este o nouă logare și nu am afișat deja mesajul
      if (isNewLogin === "true" && !welcomeShown) {
        console.log("Showing welcome overlay for new login");
        setShowWelcomeOverlay(true);

        // Marcăm mesajul ca afișat pentru această sesiune
        sessionStorage.setItem("welcomeMessageShown", "true");
        // Resetăm flag-ul de nouă logare
        sessionStorage.removeItem("newLoginDetected");
      }
    }
    // Depends on the new 'loading' state which indicates initial session load is complete
  }, [user, loading]);

  // Gestionăm deschiderea/închiderea meniului pe mobil - optimizat cu memoizare
  const toggleMobileMenu = useMemoizedCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen, setSidebarOpen]);

  // Închidem meniul pe mobil când se schimbă ruta
  useEffect(() => {
    if (debouncedIsMobile) {
      setIsMobileMenuOpen(false);
      setSidebarOpen(false);
    }
  }, [location.pathname, debouncedIsMobile, setSidebarOpen]); // Keep mobile menu logic

  // Auth Guard Logic:
  // Use the 'loading' state from the new AuthContext which indicates
  // if the initial session check is complete.
  if (loading) {
    // Show loading indicator while the initial session is being checked
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400">Se încarcă sesiunea...</p>
        </div>
      </div>
    );
  }

  // REMOVED: Complex session restoration logic useEffects.
  // AuthContext now handles session state via onAuthStateChange.

  // If loading is finished and there's still no user, redirect to login.
  if (!user) {
    console.log("AppLayout: No authenticated user, redirecting to login.");
    return <Navigate to="/login" replace />;
  }

  // If loading is finished and there IS a user, render the layout.

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      {/* Overlay de bun venit - afișat doar la prima încărcare */}
      {showWelcomeOverlay && (
        <WelcomeOverlay onComplete={() => setShowWelcomeOverlay(false)} />
      )}

      {/* Componenta de stare a conexiunii */}
      <ConnectionStatus />
      {/* Sidebar - ascuns pe mobil când este închis */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <Sidebar />
      </div>

      {/* Overlay pentru închiderea meniului pe mobil */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      <div className="flex flex-col flex-1 w-full md:w-auto overflow-hidden">
        {/* Navbar */}
        <Navbar onMenuToggle={toggleMobileMenu} />

        {/* Main content - optimizat pentru performanță */}
        <main className="flex-1 overflow-auto p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageTransition}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="h-full"
            >
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                }
              >
                <Outlet />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Indicator de stare offline */}
        <OfflineIndicator />
      </div>
    </div>
  );
};

// Folosim memo pentru a preveni re-renderizări inutile
export default memo(AppLayout);
