import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Bell,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationsPanelProps {
  className?: string;
}

const NotificationsPanel = ({ className = "" }: NotificationsPanelProps) => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Simulate fetching notifications from an API
  useEffect(() => {
    // In a real app, this would be an API call
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "warning",
        title: t("Low Stock Alert"),
        message: t("Several materials are running low on stock"),
        time: "5 min ago",
        read: false,
      },
      {
        id: "2",
        type: "info",
        title: t("System Update"),
        message: t("The system will be updated tonight at 2 AM"),
        time: "1 hour ago",
        read: false,
      },
      {
        id: "3",
        type: "success",
        title: t("Order Completed"),
        message: t("Order #5678 has been successfully processed"),
        time: "3 hours ago",
        read: true,
      },
      {
        id: "4",
        type: "error",
        title: t("Delivery Delayed"),
        message: t("Delivery from Supplier ABC has been delayed"),
        time: "Yesterday",
        read: true,
      },
    ];

    setNotifications(mockNotifications);
  }, [t]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return <Info className="h-5 w-5 text-info" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Info className="h-5 w-5 text-info" />;
    }
  };

  const getBackgroundColor = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return "bg-info/10";
      case "warning":
        return "bg-warning/10";
      case "success":
        return "bg-success/10";
      case "error":
        return "bg-destructive/10";
      default:
        return "bg-info/10";
    }
  };

  return (
    <div className={`${className} relative`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t("Notifications")}</h2>
        <Button
          variant="outline"
          size="sm"
          className="relative"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-primary text-white"
              variant="default"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-14 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50"
          >
            <div className="p-3 border-b border-slate-700 flex justify-between items-center">
              <h3 className="font-medium">{t("Notifications")}</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-slate-400 hover:text-white"
                onClick={markAllAsRead}
              >
                {t("Mark all as read")}
              </Button>
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-slate-700 ${!notification.read ? "bg-slate-700/30" : ""}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-2">
                        <div
                          className={`p-1.5 rounded-full ${getBackgroundColor(notification.type)}`}
                        >
                          {getIcon(notification.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">
                            {notification.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400">
                  <p>{t("No notifications")}</p>
                </div>
              )}
            </div>

            <div className="p-2 border-t border-slate-700">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs justify-between"
              >
                {t("View all notifications")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {notifications
          .filter((_, index) => index < 3)
          .map((notification, index) => (
            <motion.div
              key={notification.id}
              className={`p-3 rounded-lg ${getBackgroundColor(notification.type)} flex items-start gap-3`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="p-1.5 rounded-full bg-slate-800/50">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-sm">{notification.title}</h3>
                  <span className="text-xs text-slate-400">
                    {notification.time}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {notification.message}
                </p>
              </div>
            </motion.div>
          ))}

        {notifications.length > 3 && (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-sm justify-center mt-2"
            onClick={() => setIsOpen(true)}
          >
            {t("View all {{count}} notifications", {
              count: notifications.length,
            })}
          </Button>
        )}

        {notifications.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <p>{t("No notifications")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;
