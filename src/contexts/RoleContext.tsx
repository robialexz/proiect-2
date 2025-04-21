import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";

// Definim tipurile de roluri disponibile
export type UserRole =
  | 'director'
  | 'manager'
  | 'inginer'
  | 'tehnician'
  | 'magazioner'
  | 'logistica'
  | 'admin'
  | 'contabil'
  | 'hr'
  | 'asistent'
  | 'client'
  | 'furnizor'
  | 'contractor'
  | 'vizitator'
  | 'user'; // Păstrăm 'user' pentru compatibilitate

type RoleContextType = {
  userRole: UserRole;
  isManager: boolean;
  isAdmin: boolean;
  isOperational: boolean;
  loading: boolean;
  refreshRole: () => Promise<void>;
  getWelcomeMessage: () => string;
  getRoleColor: () => string;
  canAccessModule: (module: string) => boolean;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>("user");
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async () => {
    if (!user) {
      setUserRole("vizitator");
      setLoading(false);
      return;
    }

    try {
      // Adăugăm un timeout pentru a evita blocarea la "se încarcă..."
      const timeoutId = setTimeout(() => {
        if (loading) {
          setLoading(false);
          setUserRole("user"); // Setăm rolul implicit în caz de timeout
        }
      }, 2000); // 2 secunde timeout - redus pentru performanță mai bună

      // Verificăm dacă este un utilizator de test
      if (user.id && user.id.toString().startsWith('test-user-id')) {
        // Pentru utilizatorii de test, setăm rolul de director pentru a asigura acces complet
        setUserRole('director');
        clearTimeout(timeoutId);
        setLoading(false);
        return;
      }

      // În modul de dezvoltare, putem seta roluri bazate pe email pentru testare
      if (import.meta.env.DEV) {
        const email = user.email?.toLowerCase() || '';

        if (email.includes('director') || email.includes('admin')) {
          setUserRole('director');
        } else if (email.includes('manager')) {
          setUserRole('manager');
        } else if (email.includes('inginer')) {
          setUserRole('inginer');
        } else if (email.includes('magazioner') || email.includes('depozit')) {
          setUserRole('magazioner');
        } else if (email.includes('contabil') || email.includes('financiar')) {
          setUserRole('contabil');
        } else if (email.includes('hr')) {
          setUserRole('hr');
        } else if (email.includes('client')) {
          setUserRole('client');
        } else if (email.includes('test')) {
          // Pentru contul de test, setăm rolul de director
          setUserRole('director');
        } else {
          // Rol implicit pentru dezvoltare
          setUserRole('tehnician');
        }

        clearTimeout(timeoutId);
        setLoading(false);
        return;
      }

      // Fetch user role from the database
      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        clearTimeout(timeoutId);

        if (error) {
          // Încercăm să creăm un rol implicit pentru utilizator
          try {
            await supabase
              .from("user_roles")
              .insert([{ user_id: user.id, role: "user" }]);
          } catch (insertError) {
            // Eroare la inserare
          }

          setUserRole("user"); // Default to user role if there's an error
        } else if (data) {
          setUserRole(data.role as UserRole);
        } else {
          // If no role is found, create and default to user
          try {
            await supabase
              .from("user_roles")
              .insert([{ user_id: user.id, role: "user" }]);
          } catch (insertError) {
            // Eroare la inserare
          }

          setUserRole("user");
        }
      } catch (error) {
        // Eroare la interogare
        setUserRole("user");
      } finally {
        setLoading(false);
      }
    } catch (error) {
      // Eroare generală
      setUserRole("user");
      setLoading(false);
    }
  };

  // Refresh role function that can be called from components
  const refreshRole = async () => {
    try {
      await fetchUserRole();
    } catch (error) {
      // Handle error appropriately
    }
  };

  // Effect to fetch role when user changes
  useEffect(() => {
    fetchUserRole();
  }, [user]);

  // Verificăm dacă utilizatorul face parte din management
  const isManager = ['director', 'manager', 'admin'].includes(userRole);

  // Verificăm dacă utilizatorul are rol de administrator
  const isAdmin = userRole === 'admin' || userRole === 'director';

  // Verificăm dacă utilizatorul are rol operațional
  const isOperational = ['inginer', 'tehnician', 'magazioner', 'logistica'].includes(userRole);

  // Verificăm dacă utilizatorul poate accesa un anumit modul
  const canAccessModule = (module: string): boolean => {
    // Definim accesul la module în funcție de rol
    const moduleAccess: Record<string, UserRole[]> = {
      'dashboard': ['director', 'manager', 'admin', 'inginer', 'tehnician', 'magazioner', 'logistica', 'contabil', 'hr', 'user'],
      'projects': ['director', 'manager', 'admin', 'inginer', 'tehnician', 'client', 'user'],
      'inventory': ['director', 'manager', 'admin', 'magazioner', 'logistica', 'inginer', 'user'],
      'reports': ['director', 'manager', 'admin', 'contabil', 'user'],
      'users': ['director', 'admin', 'hr'],
      'settings': ['director', 'admin'],
      'finance': ['director', 'admin', 'contabil'],
      'hr': ['director', 'admin', 'hr'],
    };

    // Verificăm dacă rolul utilizatorului are acces la modul
    return moduleAccess[module]?.includes(userRole) || false;
  };

  // Generăm un mesaj de bun venit personalizat în funcție de rol și momentul zilei
  const getWelcomeMessage = (): string => {
    const hour = new Date().getHours();
    let timeOfDay = '';

    if (hour < 12) {
      timeOfDay = 'dimineața';
    } else if (hour < 18) {
      timeOfDay = 'ziua';
    } else {
      timeOfDay = 'seara';
    }

    // Mesaje personalizate în funcție de rol
    switch(userRole) {
      case 'director':
      case 'admin':
        return `Bună ${timeOfDay}, domnule director. Tabloul de bord este actualizat și vă așteaptă.`;
      case 'manager':
        return `Bună ${timeOfDay}, manager. Echipa așteaptă instrucțiunile dumneavoastră.`;
      case 'inginer':
      case 'tehnician':
        return `Salut! Sperăm că ai o zi plină de inspirație tehnică.`;
      case 'magazioner':
        return `Bună ziua, șefule! Depozitul te așteaptă!`;
      case 'logistica':
        return `Salut! Rutele de livrare sunt optimizate și te așteaptă.`;
      case 'contabil':
        return `Bună ${timeOfDay}. Rapoartele financiare sunt actualizate.`;
      case 'hr':
        return `Bună ${timeOfDay}. Echipa așteaptă feedback-ul dumneavoastră.`;
      case 'client':
        return `Bună ${timeOfDay} și bine ați revenit! Proiectele dumneavoastră progresează conform planificării.`;
      case 'user':
      default:
        return `Bună ${timeOfDay}! Bine ai revenit în aplicație.`;
    }
  };

  // Obținem culoarea asociată rolului
  const getRoleColor = (): string => {
    const roleColors: Record<string, string> = {
      'director': 'text-purple-500',
      'manager': 'text-blue-500',
      'inginer': 'text-cyan-500',
      'tehnician': 'text-teal-500',
      'magazioner': 'text-green-500',
      'logistica': 'text-lime-500',
      'admin': 'text-red-500',
      'contabil': 'text-amber-500',
      'hr': 'text-pink-500',
      'asistent': 'text-indigo-500',
      'client': 'text-orange-500',
      'furnizor': 'text-yellow-500',
      'contractor': 'text-emerald-500',
      'user': 'text-blue-500',
      'vizitator': 'text-gray-500'
    };

    return roleColors[userRole] || 'text-gray-500';
  };

  const value = {
    userRole,
    isManager,
    isAdmin,
    isOperational,
    loading,
    refreshRole,
    getWelcomeMessage,
    getRoleColor,
    canAccessModule
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
