import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, Info, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { ScrollArea } from './scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { useNotification } from './notification';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function NotificationCenter() {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { addNotification } = useNotification();

  // Simulăm notificări pentru demo
  useEffect(() => {
    const demoNotifications: Notification[] = [
      {
        id: '1',
        title: 'Stoc scăzut',
        message: 'Ciment - stoc sub limita minimă (5 saci)',
        type: 'warning',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minute ago
        read: false,
      },
      {
        id: '2',
        title: 'Proiect actualizat',
        message: 'Proiectul "Renovare Apartament" a fost actualizat',
        type: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: true,
      },
      {
        id: '3',
        title: 'Comandă finalizată',
        message: 'Comanda #1234 a fost livrată cu succes',
        type: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        read: false,
        action: {
          label: 'Vezi detalii',
          onClick: () => {
            addNotification({
              type: 'info',
              title: 'Acțiune demonstrativă',
              message: 'Aici ar trebui să se deschidă detaliile comenzii',
              duration: 3000,
            });
          },
        },
      },
      {
        id: '4',
        title: 'Eroare sincronizare',
        message: 'Nu s-a putut sincroniza inventarul cu serverul',
        type: 'error',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
      },
      {
        id: '5',
        title: 'Raport generat',
        message: 'Raportul lunar a fost generat cu succes',
        type: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        read: true,
      },
    ];

    setNotifications(demoNotifications);
  }, [addNotification]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Filtrăm notificările în funcție de tab-ul activ
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    return notification.type === activeTab;
  });

  // Formatăm data pentru afișare
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minut' : 'minute'} în urmă`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'oră' : 'ore'} în urmă`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'zi' : 'zile'} în urmă`;
    } else {
      return date.toLocaleDateString('ro-RO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  // Marcăm toate notificările ca citite
  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
    addNotification({
      type: 'success',
      title: 'Notificări actualizate',
      message: 'Toate notificările au fost marcate ca citite',
      duration: 3000,
    });
  };

  // Marcăm o notificare ca citită
  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification
      )
    );
  };

  // Ștergem o notificare
  const removeNotification = (id: string) => {
    setNotifications(notifications.filter((notification) => notification.id !== id));
  };

  // Obținem iconița în funcție de tipul notificării
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  // Obținem clasa de culoare în funcție de tipul notificării
  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return 'border-l-blue-500';
      case 'success':
        return 'border-l-green-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'error':
        return 'border-l-red-500';
      default:
        return 'border-l-blue-500';
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-primary text-[10px]"
            variant="default"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute right-0 mt-2 w-80 sm:w-96 overflow-hidden rounded-md border shadow-lg z-50',
              theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            )}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-medium">Notificări</h3>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  <Check className="h-4 w-4 mr-1" />
                  <span className="text-xs">Marchează toate ca citite</span>
                </Button>
              )}
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                  <TabsTrigger
                    value="all"
                    className="rounded-none border-b-2 border-b-transparent px-4 py-2 data-[state=active]:border-b-primary data-[state=active]:bg-transparent"
                  >
                    Toate
                  </TabsTrigger>
                  <TabsTrigger
                    value="unread"
                    className="rounded-none border-b-2 border-b-transparent px-4 py-2 data-[state=active]:border-b-primary data-[state=active]:bg-transparent"
                  >
                    Necitite
                    {unreadCount > 0 && (
                      <Badge className="ml-1 bg-primary text-[10px]" variant="default">
                        {unreadCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value={activeTab} className="p-0">
                <ScrollArea className="h-[300px]">
                  {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] p-4 text-center">
                      <Bell className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
                      <p className="text-sm text-muted-foreground">Nu există notificări</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            'p-4 relative border-l-4 transition-colors',
                            getNotificationColor(notification.type),
                            !notification.read && theme === 'dark'
                              ? 'bg-slate-700/30'
                              : !notification.read && theme === 'light'
                              ? 'bg-slate-100'
                              : ''
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-medium text-sm">{notification.title}</p>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatTimestamp(notification.timestamp)}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => removeNotification(notification.id)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                              {notification.action && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="mt-2 h-auto p-0 text-xs"
                                  onClick={() => {
                                    markAsRead(notification.id);
                                    notification.action?.onClick();
                                  }}
                                >
                                  {notification.action.label}
                                </Button>
                              )}
                            </div>
                          </div>
                          {!notification.read && (
                            <div className="absolute top-2 right-2">
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1 py-0 h-auto border-primary text-primary"
                              >
                                Nou
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>

            <div className="p-2 border-t">
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setIsOpen(false)}>
                Închide
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
