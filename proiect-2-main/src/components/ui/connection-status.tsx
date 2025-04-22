import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertTriangle, X } from 'lucide-react';
import { Button } from './button';
import connectionService from '@/lib/connection-service';

interface ConnectionStatusProps {
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const [connectionState, setConnectionState] = useState<{
    internet: boolean;
    supabase: boolean;
    checking: boolean;
  }>({
    internet: true,
    supabase: true,
    checking: false,
  });
  const [visible, setVisible] = useState(false);

  // Verifică conexiunea la intervale regulate
  useEffect(() => {
    const checkConnection = async () => {
      setConnectionState(prev => ({ ...prev, checking: true }));
      
      try {
        const { internet, supabase } = await connectionService.checkConnections();
        
        setConnectionState({
          internet,
          supabase,
          checking: false,
        });
        
        // Afișează notificarea doar dacă există probleme de conexiune
        setVisible(!internet || !supabase);
      } catch (error) {
        // Removed console statement
        setConnectionState({
          internet: false,
          supabase: false,
          checking: false,
        });
        setVisible(true);
      }
    };
    
    // Verifică conexiunea la încărcarea componentei
    checkConnection();
    
    // Verifică conexiunea la fiecare 30 de secunde
    const intervalId = setInterval(checkConnection, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Determină mesajul și iconița în funcție de starea conexiunii
  const getMessage = () => {
    if (!connectionState.internet) {
      return {
        title: 'Nu există conexiune la internet',
        message: 'Verificați conexiunea la internet și încercați din nou.',
        icon: <WifiOff className="h-6 w-6 text-red-500" />,
        color: 'bg-red-900/20 border-red-900/50',
      };
    }
    
    if (!connectionState.supabase) {
      return {
        title: 'Nu există conexiune la server',
        message: 'Serverul nu răspunde. Unele funcționalități ar putea fi limitate.',
        icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
        color: 'bg-yellow-900/20 border-yellow-900/50',
      };
    }
    
    return {
      title: 'Conexiune stabilită',
      message: 'Conexiunea la internet și la server este activă.',
      icon: <Wifi className="h-6 w-6 text-green-500" />,
      color: 'bg-green-900/20 border-green-900/50',
    };
  };
  
  const { title, message, icon, color } = getMessage();
  
  // Reîncearcă conexiunea
  const handleRetry = () => {
    setConnectionState(prev => ({ ...prev, checking: true }));
    connectionService.checkConnections().then(({ internet, supabase }) => {
      setConnectionState({
        internet,
        supabase,
        checking: false,
      });
      
      // Ascunde notificarea dacă conexiunea a fost restabilită
      if (internet && supabase) {
        setVisible(false);
      }
    });
  };
  
  // Ascunde notificarea
  const handleDismiss = () => {
    setVisible(false);
  };
  
  if (!visible) {
    return null;
  }
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-4 right-4 z-50 max-w-md ${className}`}
        >
          <div className={`p-4 rounded-lg border shadow-lg ${color}`}>
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                {icon}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{title}</h3>
                <p className="text-sm opacity-80">{message}</p>
                <div className="mt-3 flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRetry}
                    disabled={connectionState.checking}
                    className="text-xs"
                  >
                    {connectionState.checking ? 'Se verifică...' : 'Reîncearcă'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDismiss}
                    className="text-xs"
                  >
                    Închide
                  </Button>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="ml-2 h-6 w-6 p-0"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionStatus;
