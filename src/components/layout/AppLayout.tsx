import React, { useState, useEffect, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
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

const AppLayout: React.FC = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const { userRole, getWelcomeMessage } = useRole();
  const { addNotification } = useNotification();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Optimizare: Preîncărcăm rutele adiacente și eliminăm întârzierea artificială
  useEffect(() => {
    // Setarea isPageLoading la false imediat, fără întârziere
    setIsPageLoading(false);

    // Preîncărcăm rutele adiacente pentru a îmbunătăți performanța la navigare
    routePreloader.preloadAdjacentRoutes(location.pathname);
  }, [location.pathname]);

  // Afișăm un mesaj de bun venit doar la prima încărcare, nu la fiecare schimbare de pagină
  useEffect(() => {
    // Folosim localStorage pentru a verifica dacă mesajul a fost deja afișat în această sesiune
    const welcomeShown = localStorage.getItem('welcomeMessageShown');

    if (user && !loading && !welcomeShown) {
      addNotification({
        type: 'success',
        title: 'Bun venit!',
        message: getWelcomeMessage(),
        duration: 5000,
      });

      // Marcăm mesajul ca afișat pentru această sesiune
      localStorage.setItem('welcomeMessageShown', 'true');

      // Resetăm flag-ul după 30 de minute pentru a permite afișarea unui nou mesaj în viitor
      setTimeout(() => {
        localStorage.removeItem('welcomeMessageShown');
      }, 30 * 60 * 1000); // 30 minute
    }
  }, [user, loading, addNotification]);

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
      {/* Componenta de stare a conexiunii */}
      <ConnectionStatus />
      {/* Sidebar - ascuns pe mobil când este închis */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <Sidebar />
      </div>

      {/* Overlay pentru închiderea meniului pe mobil */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      <div className="flex flex-col flex-1 w-full md:w-auto overflow-hidden">
        {/* Navbar */}
        <Navbar onMenuToggle={toggleMobileMenu} />

        {/* Main content - optimizat pentru performanță */}
        <main className="flex-1 overflow-auto p-4">
          {/* Eliminăm AnimatePresence pentru a reduce complexitatea render-ului */}
          <motion.div
            key={location.pathname}
            variants={pageTransition}
            initial="hidden"
            animate="visible"
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>

        {/* Indicator de stare offline */}
        <OfflineIndicator />
      </div>
    </div>
  );
};

// Folosim memo pentru a preveni re-renderizări inutile
export default memo(AppLayout);
