import React, { useState, useEffect, memo, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { pageTransition } from '@/lib/animation-variants';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { useNotification } from '@/components/ui/notification';
import { useMemoizedCallback } from '@/lib/performance';
import ConnectionStatus from '@/components/ui/connection-status';
import { routePreloader } from '@/lib/route-preloader';
import { OfflineIndicator } from '@/components/ui/offline-indicator';
import usePageTransition from '@/hooks/usePageTransition';
import { measurePerformance } from '@/lib/performance-optimizer';
import WelcomeOverlay from '@/components/welcome/WelcomeOverlay';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const { userRole, getWelcomeMessage } = useRole();
  const { addNotification } = useNotification();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Utilizăm hook-ul de tranziție pentru pagini
  const { isLoading: isPageLoading, transitionComplete } = usePageTransition();

  // Optimizare: Preîncărcăm rutele adiacente pentru o navigație mai rapidă
  useEffect(() => {
    // Măsurăm performanța încărcării paginii
    const endMeasurement = measurePerformance(`Page load complete: ${location.pathname}`);

    // Preîncărcăm rutele adiacente pentru a îmbunătăți performanța
    routePreloader.preloadAdjacentRoutes(location.pathname);

    // Finalizăm măsurătoarea după ce pagina s-a încărcat complet
    if (transitionComplete) {
      endMeasurement();
    }

    return () => {
      // Curățăm orice resurse necesare
    };
  }, [location.pathname, transitionComplete]);

  // Stare pentru afișarea overlay-ului de bun venit
  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState(false);

  // Afișăm un mesaj de bun venit doar la prima încărcare, nu la fiecare schimbare de pagină
  useEffect(() => {
    // Folosim localStorage pentru a verifica dacă mesajul a fost deja afișat în această sesiune
    const welcomeShown = localStorage.getItem('welcomeMessageShown');
    console.log('Welcome check - User:', user?.id, 'Loading:', loading, 'Shown:', welcomeShown);

    if (user && !loading) {
      // Forțăm afișarea mesajului de bun venit în modul de dezvoltare
      if (import.meta.env.DEV) {
        console.log('Forcing welcome overlay in development mode');
        setShowWelcomeOverlay(true);
        return;
      }

      // În producție, verificăm dacă a fost deja afișat
      if (!welcomeShown) {
        // Afișăm overlay-ul de bun venit în loc de notificare
        setShowWelcomeOverlay(true);

        // Marcăm mesajul ca afișat pentru această sesiune
        localStorage.setItem('welcomeMessageShown', 'true');

        // Resetăm flag-ul după 30 de minute pentru a permite afișarea unui nou mesaj în viitor
        setTimeout(() => {
          localStorage.removeItem('welcomeMessageShown');
        }, 30 * 60 * 1000); // 30 minute
      }
    }
  }, [user, loading]);

  // Gestionăm deschiderea/închiderea meniului pe mobil - optimizat cu memoizare
  const toggleMobileMenu = useMemoizedCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  // Închidem meniul pe mobil când se schimbă ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Verificăm dacă utilizatorul este autentificat
  // Dacă încă se încarcă, afișăm un indicator de încărcare
  // Dacă nu este autentificat, redirectăm către pagina de login
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("AppLayout: No authenticated user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

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
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
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
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              }>
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
