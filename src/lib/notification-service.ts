/**
 * Serviciu pentru gestionarea notificărilor push
 * Folosește Notification API din browser pentru a afișa notificări desktop
 */

interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  silent?: boolean;
  onClick?: () => void;
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

class NotificationService {
  private permission: NotificationPermission = "default";
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = 'Notification' in window;
    if (this.isSupported) {
      this.permission = Notification.permission;
    }
  }

  /**
   * Verifică dacă notificările sunt suportate de browser
   */
  public areNotificationsSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Verifică dacă utilizatorul a acordat permisiunea pentru notificări
   */
  public hasPermission(): boolean {
    return this.permission === "granted";
  }

  /**
   * Solicită permisiunea pentru notificări
   * @returns Promise<boolean> - true dacă permisiunea a fost acordată
   */
  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      // Removed console statement
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === "granted";
    } catch (error) {
      // Removed console statement
      return false;
    }
  }

  /**
   * Afișează o notificare
   * @param options - Opțiunile notificării
   * @returns Notification | null - Obiectul notificării sau null dacă notificările nu sunt suportate/permise
   */
  public async showNotification(options: NotificationOptions): Promise<Notification | null> {
    if (!this.isSupported) {
      // Removed console statement
      return null;
    }

    if (this.permission !== "granted") {
      try {
      const granted = await this.requestPermission();
      } catch (error) {
        // Handle error appropriately
      }
      if (!granted) {
        // Removed console statement
        return null;
      }
    }

    try {
      const { title, onClick, ...notificationOptions } = options;
      const notification = new Notification(title, notificationOptions);

      if (onClick) {
        notification.onclick = onClick;
      }

      return notification;
    } catch (error) {
      // Removed console statement
      return null;
    }
  }

  /**
   * Afișează o notificare de succes
   * @param title - Titlul notificării
   * @param message - Mesajul notificării
   * @param onClick - Funcția apelată la click pe notificare
   */
  public async showSuccess(title: string, message?: string, onClick?: () => void): Promise<Notification | null> {
    return this.showNotification({
      title,
      body: message,
      icon: "/icons/success.png", // Asigură-te că acest fișier există
      requireInteraction: false,
      silent: false,
      onClick
    });
  }

  /**
   * Afișează o notificare de eroare
   * @param title - Titlul notificării
   * @param message - Mesajul notificării
   * @param onClick - Funcția apelată la click pe notificare
   */
  public async showError(title: string, message?: string, onClick?: () => void): Promise<Notification | null> {
    return this.showNotification({
      title,
      body: message,
      icon: "/icons/error.png", // Asigură-te că acest fișier există
      requireInteraction: true,
      silent: false,
      onClick
    });
  }

  /**
   * Afișează o notificare informativă
   * @param title - Titlul notificării
   * @param message - Mesajul notificării
   * @param onClick - Funcția apelată la click pe notificare
   */
  public async showInfo(title: string, message?: string, onClick?: () => void): Promise<Notification | null> {
    return this.showNotification({
      title,
      body: message,
      icon: "/icons/info.png", // Asigură-te că acest fișier există
      requireInteraction: false,
      silent: true,
      onClick
    });
  }
}

// Exportăm o instanță singleton a serviciului
export const notificationService = new NotificationService();
