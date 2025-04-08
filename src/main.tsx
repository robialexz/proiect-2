import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
// Importăm i18n doar când este necesar pentru a reduce timpul de încărcare inițial
// import "./i18n";
import { Toaster } from "./components/ui/toaster";
import NotificationProvider from "./components/ui/notification";
import { ThemeProvider } from "./contexts/ThemeContext";

// Dezactivăm temporar TempoDevtools pentru a îmbunătăți performanța
// import { TempoDevtools } from "tempo-devtools";
// TempoDevtools.init();

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
