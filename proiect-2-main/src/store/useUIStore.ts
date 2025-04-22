import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Definim tipurile pentru starea UI
interface UIState {
  // Stare
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  currentPage: string;
  breadcrumbs: { label: string; path: string }[];
  notifications: {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    title?: string;
    duration?: number;
    read: boolean;
    timestamp: number;
  }[];
  
  // Acțiuni
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCurrentPage: (page: string, breadcrumbs?: { label: string; path: string }[]) => void;
  addNotification: (notification: {
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    title?: string;
    duration?: number;
  }) => string;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
}

// Creăm store-ul pentru UI
export const useUIStore = create<UIState>()(
  // Adăugăm middleware pentru persistență
  persist(
    (set, get) => ({
      // Stare inițială
      theme: 'system',
      sidebarOpen: true,
      sidebarCollapsed: false,
      currentPage: 'Dashboard',
      breadcrumbs: [{ label: 'Dashboard', path: '/' }],
      notifications: [],
      
      // Acțiuni
      setTheme: (theme) => set({ theme }),
      
      toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      toggleSidebarCollapsed: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      
      setCurrentPage: (page, breadcrumbs) => set({ 
        currentPage: page,
        breadcrumbs: breadcrumbs || [{ label: page, path: window.location.pathname }]
      }),
      
      addNotification: (notification) => {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        set(state => ({
          notifications: [
            {
              id,
              ...notification,
              read: false,
              timestamp: Date.now()
            },
            ...state.notifications
          ]
        }));
        
        // Dacă notificarea are o durată, o ștergem automat după expirare
        if (notification.duration) {
          setTimeout(() => {
            get().removeNotification(id);
          }, notification.duration);
        }
        
        return id;
      },
      
      removeNotification: (id) => set(state => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      
      markNotificationAsRead: (id) => set(state => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      })),
      
      clearNotifications: () => set({ notifications: [] })
    }),
    {
      name: 'ui-storage', // Numele pentru localStorage
      storage: createJSONStorage(() => localStorage), // Folosim localStorage pentru persistență
      partialize: (state) => ({ 
        // Salvăm doar anumite câmpuri în localStorage
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed
      })
    }
  )
);

export default useUIStore;
