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

  // Afișăm un mesaj de bun venit doar la prima logare, nu la fiecare schimbare de pagină
  useEffect(() => {
    // Folosim sessionStorage pentru a verifica dacă mesajul a fost deja afișat în această sesiune
    // Folosim sessionStorage în loc de localStorage pentru a reseta la închiderea browserului
    const welcomeShown = sessionStorage.getItem('welcomeMessageShown');
    const isNewLogin = sessionStorage.getItem('newLoginDetected');
    console.log('Welcome check - User:', user?.id, 'Loading:', loading, 'Shown:', welcomeShown, 'New login:', isNewLogin);

    if (user && !loading) {
      // Verificăm dacă este o nouă logare și nu am afișat deja mesajul
      if (isNewLogin === 'true' && !welcomeShown) {
        console.log('Showing welcome overlay for new login');
        setShowWelcomeOverlay(true);

        // Marcăm mesajul ca afișat pentru această sesiune
        sessionStorage.setItem('welcomeMessageShown', 'true');
        // Resetăm flag-ul de nouă logare
        sessionStorage.removeItem('newLoginDetected');
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

  // Folosim un efect pentru a verifica sesiunea din localStorage și a o restaura
  const [isRestoringSession, setIsRestoringSession] = useState(false);

  // Ascultăm evenimentul de confirmare a restaurării sesiunii
  useEffect(() => {
    const handleSessionRestored = () => {
      console.log("AppLayout: Received session-restored event");
      // Resetam flag-ul după ce sesiunea a fost restaurată
      setIsRestoringSession(false);
    };

    // Adaugăm listener pentru eveniment
    window.addEventListener('session-restored', handleSessionRestored);

    // Curățăm listener-ul la demontare
    return () => {
      window.removeEventListener('session-restored', handleSessionRestored);
    };
  }, []);

  // Verificăm și restaurăm sesiunea din localStorage
  useEffect(() => {
    // Dacă nu avem utilizator, încercăm să restaurăm sesiunea din localStorage
    if (!user && !isRestoringSession) {
      console.log("AppLayout: No authenticated user found, checking local storage");

      try {
        const localSession = localStorage.getItem('supabase.auth.token') || sessionStorage.getItem('supabase.auth.token');
        if (localSession) {
          const parsedSession = JSON.parse(localSession);
          if (parsedSession?.currentSession && parsedSession.expiresAt > Date.now()) {
            console.log("AppLayout: Found valid session in storage, attempting to restore user");

            // Încercăm să restaurăm utilizatorul din sesiune
            if (parsedSession.currentSession.user) {
              // Setăm flag-ul pentru a indica că suntem în proces de restaurare
              setIsRestoringSession(true);

              // Folosim setTimeout pentru a ne asigura că dispatchEvent nu este apelat în timpul render-ului
              setTimeout(() => {
                // Apelăm direct funcția din AuthContext pentru a restaura sesiunea
                window.dispatchEvent(new CustomEvent('force-session-refresh', {
                  detail: { session: parsedSession.currentSession }
                }));
              }, 0);

              // Adaugăm un timeout de siguranță pentru a reseta flag-ul în caz că nu primim evenimentul de confirmare
              setTimeout(() => {
                if (isRestoringSession) {
                  console.log("AppLayout: Session restoration timeout, resetting flag");
                  setIsRestoringSession(false);
                }
              }, 5000); // 5 secunde timeout

              return;
            }
          } else {
            console.log("AppLayout: Session expired or invalid");
            // Ștergem sesiunea expirată
            localStorage.removeItem('supabase.auth.token');
            sessionStorage.removeItem('supabase.auth.token');
          }
        }
      } catch (storageError) {
        console.error("Error checking session in storage:", storageError);
      }
    }
  }, [user, isRestoringSession]);

  // Dacă suntem în proces de restaurare a sesiunii, afișăm un indicator de încărcare
  if (isRestoringSession) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400">Se restaurează sesiunea...</p>
        </div>
      </div>
    );
  }

  // Dacă nu avem utilizator și nu suntem în proces de restaurare, redirectăm către login
  if (!user) {
    console.log("AppLayout: No valid session found, redirecting to login");
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
