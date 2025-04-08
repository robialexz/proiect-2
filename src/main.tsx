import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
// Importăm i18n pentru funcționalitatea de traducere
import "./i18n";
import { Toaster } from "./components/ui/toaster";
import NotificationProvider from "./components/ui/notification";
import { ThemeProvider } from "./contexts/ThemeContext";
// Preîncărcăm rutele frecvent accesate pentru performanță mai bună
import { routePreloader } from "./lib/route-preloader";

// Dezactivăm temporar TempoDevtools pentru a îmbunătăți performanța
// import { TempoDevtools } from "tempo-devtools";
// TempoDevtools.init();

// Preîncărcăm rutele frecvent accesate la pornirea aplicației
routePreloader.preloadFrequentRoutes();

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  // Removed StrictMode to improve performance
  <BrowserRouter basename={basename}>
    <ThemeProvider>
      <NotificationProvider>
        <App />
        <Toaster />
      </NotificationProvider>
    </ThemeProvider>
  </BrowserRouter>
);
