import React, { createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";

// Definim un context gol pentru autentificare
// Acesta va fi implementat complet în viitor
type AuthContextType = {
  // Placeholder pentru viitoarele funcționalități
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Placeholder pentru viitoarea implementare
  const value = {};

  return (
    <AuthContext.Provider value={value as AuthContextType}>
      {children}
    </AuthContext.Provider>
  );
}
