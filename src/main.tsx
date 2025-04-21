import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
// Importăm utilitar pentru gestionarea cache-ului
import "./utils/cache-buster";
// Importăm fix-ul pentru React
import "./utils/react-fix";
// Importăm utilitar pentru curățarea site-ului
import { cleanSite, isSiteCleaned } from "./utils/clean-site";

// Dezactivăm service worker-ul temporar pentru a rezolva problema de reîncărcare continuă


//     navigator.serviceWorker
//       .register("/service-worker.js")
//       .then((registration) => {
//         // Removed console statement
//
//         // Verificăm dacă există o versiune nouă a service worker-ului


//           // Removed console statement
//

//             if (
//               newWorker.state === "installed" &&
//               navigator.serviceWorker.controller
//             ) {
//               // Removed console statement

//             }
//           });
//         });
//       })
//       .catch((error) => {
//         // Removed console statement
//       });
//   });
// } else {
//   // Removed console statement
// }

// Curățăm site-ul complet pentru a șterge versiunea veche
// Dar doar dacă nu am făcut deja acest lucru în această sesiune
if (!isSiteCleaned()) {
  // Removed console statement
  // Folosim setTimeout pentru a permite încărcarea paginii înainte de curățare
  setTimeout(() => {
    cleanSite();
  }, 1000);
}
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
import { HelmetProvider } from "react-helmet-async";
import { AdvancedRoleProvider } from "./contexts/AdvancedRoleContext";
import { OfflineProvider } from "./contexts/OfflineContext";
import ErrorBoundary from "./components/ErrorBoundary";
// Importăm sistemul de gestionare a erorilor
import { errorRecovery } from "./lib/error-recovery";
import { authErrorHandler } from "./lib/auth-error-handler";
// Preîncărcăm rutele frecvent accesate pentru performanță mai bună
import { routePreloader } from "./lib/route-preloader";
// Import React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Dezactivăm temporar TempoDevtools pentru a îmbunătăți performanța



// Preîncărcăm rutele și paginile frecvent accesate la pornirea aplicației
routePreloader.preloadFrequentRoutes();
routePreloader.preloadFrequentPages();

// Inițializăm interceptorul pentru erorile de autentificare
authErrorHandler.initAuthErrorInterceptor();

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
        <HelmetProvider>
          <AuthProvider>
            <RoleProvider>
              <AdvancedRoleProvider>
                <OfflineProvider>
                  {/* Adăugăm ThemeProvider înainte de EnhancedThemeProvider pentru a rezolva eroarea */}
                  <ThemeProvider>
                    <EnhancedThemeProvider>
                      <EnhancedNotificationProvider>
                        <NotificationProvider>
                          <App />
                          <Toaster />
                        </NotificationProvider>
                      </EnhancedNotificationProvider>
                    </EnhancedThemeProvider>
                  </ThemeProvider>
                </OfflineProvider>
              </AdvancedRoleProvider>
            </RoleProvider>
          </AuthProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </ErrorBoundary>
);
