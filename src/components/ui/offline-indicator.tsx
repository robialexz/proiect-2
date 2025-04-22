import React from 'react';
import { useOffline } from '@/contexts/OfflineContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const { t } = useTranslation();
  const { isOnline, isOfflineMode, pendingOperationsCount, toggleOfflineMode, syncData } = useOffline();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg shadow-lg p-2',
          isOnline && !isOfflineMode ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20',
          className
        )}
      >
        {isOnline ? (
          isOfflineMode ? (
            <>
              <CloudOff size={16} />
              <span className="text-sm font-medium">{t('offline.offlineMode', 'Offline Mode')}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={toggleOfflineMode}
              >
                {t('offline.goOnline', 'Go Online')}
              </Button>
              {pendingOperationsCount > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-xs bg-red-500/20 px-1.5 py-0.5 rounded-full">
                    {pendingOperationsCount}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={syncData}
                    title={t('offline.sync', 'Sync')}
                  >
                    <RefreshCw size={12} />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              <Wifi size={16} />
              <span className="text-sm font-medium">{t('offline.online', 'Online')}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={toggleOfflineMode}
              >
                {t('offline.goOffline', 'Go Offline')}
              </Button>
            </>
          )
        ) : (
          <>
            <WifiOff size={16} />
            <span className="text-sm font-medium">{t('offline.offline', 'Offline')}</span>
            {pendingOperationsCount > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs bg-red-500/20 px-1.5 py-0.5 rounded-full">
                  {pendingOperationsCount}
                </span>
              </div>
            )}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
