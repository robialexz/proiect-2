import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
// Importăm i18n pentru funcționalitatea de traducere
import "./i18n";
import { Toaster } from "./components/ui/toaster";
import NotificationProvider from "./components/ui/notification";
import { EnhancedNotificationProvider } from "./components/ui/enhanced-notification";
import { ThemeProvider } from "./contexts/ThemeContext";
import { EnhancedThemeProvider } from "./contexts/EnhancedThemeContext";
// Importăm AuthProvider pentru autentificare
import { AuthProvider } from "./contexts/AuthContext";
import { RoleProvider } from "./contexts/RoleContext";
import { AdvancedRoleProvider } from "./contexts/AdvancedRoleContext";
import { OfflineProvider } from "./contexts/OfflineContext";
import { EnhancedOfflineProvider } from "./contexts/EnhancedOfflineContext";
import ErrorBoundary from "./components/ErrorBoundary";
// Preîncărcăm rutele frecvent accesate pentru performanță mai bună
import { routePreloader } from "./lib/route-preloader";
// Import React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Dezactivăm temporar TempoDevtools pentru a îmbunătăți performanța
// import { TempoDevtools } from "tempo-devtools";
// TempoDevtools.init();

// Preîncărcăm rutele și paginile frecvent accesate la pornirea aplicației
routePreloader.preloadFrequentRoutes();
routePreloader.preloadFrequentPages();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  // Removed StrictMode to improve performance
  <ErrorBoundary>
    <BrowserRouter basename={basename}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RoleProvider>
            <AdvancedRoleProvider>
              <EnhancedOfflineProvider>
                <EnhancedThemeProvider>
                  <EnhancedNotificationProvider>
                    <NotificationProvider>
                      <App />
                      <Toaster />
                    </NotificationProvider>
                  </EnhancedNotificationProvider>
                </EnhancedThemeProvider>
              </EnhancedOfflineProvider>
            </AdvancedRoleProvider>
          </RoleProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </ErrorBoundary>
);
