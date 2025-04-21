import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/services/api/supabase-client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface SupabaseNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  link?: string;
  read: boolean;
  created_at: string;
}

export const useSupabaseNotifications = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  // Folosim clientul Supabase direct
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<SupabaseNotification[]>(
    []
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Funcție pentru încărcarea notificărilor
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.read).length || 0);
    } catch (error: any) {
      console.error("Error loading notifications:", error);
      setError(
        error.message || "An error occurred while loading notifications"
      );
      toast({
        title: t("notifications.loadError", "Error"),
        description: t(
          "notifications.loadErrorDescription",
          "An error occurred while loading notifications."
        ),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, user, toast, t]);

  // Funcție pentru marcarea unei notificări ca citită
  const markAsRead = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      // Actualizăm starea locală
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      return { success: true };
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      toast({
        title: t("notifications.markReadError", "Error"),
        description: t(
          "notifications.markReadErrorDescription",
          "An error occurred while marking the notification as read."
        ),
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Funcție pentru marcarea tuturor notificărilor ca citite
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) {
        throw error;
      }

      // Actualizăm starea locală
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);

      return { success: true };
    } catch (error: any) {
      console.error("Error marking all notifications as read:", error);
      toast({
        title: t("notifications.markAllReadError", "Error"),
        description: t(
          "notifications.markAllReadErrorDescription",
          "An error occurred while marking all notifications as read."
        ),
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Funcție pentru ștergerea unei notificări
  const deleteNotification = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      // Actualizăm starea locală
      const deletedNotification = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      return { success: true };
    } catch (error: any) {
      console.error("Error deleting notification:", error);
      toast({
        title: t("notifications.deleteError", "Error"),
        description: t(
          "notifications.deleteErrorDescription",
          "An error occurred while deleting the notification."
        ),
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Funcție pentru ștergerea tuturor notificărilor
  const deleteAllNotifications = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      // Actualizăm starea locală
      setNotifications([]);
      setUnreadCount(0);

      return { success: true };
    } catch (error: any) {
      console.error("Error deleting all notifications:", error);
      toast({
        title: t("notifications.deleteAllError", "Error"),
        description: t(
          "notifications.deleteAllErrorDescription",
          "An error occurred while deleting all notifications."
        ),
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Funcție pentru crearea unei notificări
  const createNotification = async (data: {
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    link?: string;
    user_id?: string;
  }) => {
    try {
      const { error } = await supabase.from("notifications").insert({
        user_id: data.user_id || user?.id,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link,
        read: false,
      });

      if (error) {
        throw error;
      }

      // Reîncărcăm notificările dacă notificarea este pentru utilizatorul curent
      if (!data.user_id || data.user_id === user?.id) {
        await loadNotifications();
      }

      return { success: true };
    } catch (error: any) {
      console.error("Error creating notification:", error);
      toast({
        title: t("notifications.createError", "Error"),
        description: t(
          "notifications.createErrorDescription",
          "An error occurred while creating the notification."
        ),
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Configurăm un canal de timp real pentru notificări
  useEffect(() => {
    if (!user) return;

    // Încărcăm notificările inițiale
    loadNotifications();

    // Configurăm canalul de timp real
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Reîncărcăm notificările când se schimbă ceva
          loadNotifications();

          // Afișăm un toast pentru notificările noi
          if (payload.eventType === "INSERT") {
            const notification = payload.new as SupabaseNotification;
            toast({
              title: notification.title,
              description: notification.message,
              variant:
                notification.type === "error" ? "destructive" : "default",
            });
          }
        }
      )
      .subscribe();

    // Curățăm canalul la demontare
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    createNotification,
  };
};
