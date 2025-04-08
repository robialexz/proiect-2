import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { pageTransition } from '@/lib/animation-variants';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/components/ui/notification';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const { addNotification } = useNotification();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Simulăm încărcarea paginii
  useEffect(() => {
    setIsPageLoading(true);
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Afișăm un mesaj de bun venit la prima încărcare
  useEffect(() => {
    if (user && !loading) {
      addNotification({
        type: 'success',
        title: 'Bun venit!',
        message: `Salut, ${user.email?.split('@')[0] || 'utilizator'}! Bine ai revenit în aplicație.`,
        duration: 5000,
      });
    }
  }, [user, loading, addNotification]);

  // Gestionăm deschiderea/închiderea meniului pe mobil
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Închidem meniul pe mobil când se schimbă ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
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
        
        {/* Main content */}
        <main className="flex-1 overflow-auto p-4">
          <AnimatePresence mode="wait">
            {isPageLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-slate-400">Se încarcă...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={location.pathname}
                variants={pageTransition}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="h-full"
              >
                <Outlet />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
