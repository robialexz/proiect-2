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
          console.log("Role loading timeout reached, forcing loading to false");
          setLoading(false);
          setUserRole("user"); // Setăm rolul implicit în caz de timeout
        }
      }, 2000); // 2 secunde timeout - redus pentru performanță mai bună

      // Verificăm dacă este un utilizator de test
      if (user.id && user.id.toString().startsWith('test-user-id')) {
        console.log('Using test user role');
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
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      clearTimeout(timeoutId);

      if (error) {
        console.error("Error fetching user role:", error);

        // Încercăm să creăm un rol implicit pentru utilizator
        try {
          await supabase
            .from("user_roles")
            .insert([{ user_id: user.id, role: "user" }]);
        } catch (insertError) {
          console.error("Error creating default user role:", insertError);
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
          console.error("Error creating default user role:", insertError);
        }

        setUserRole("user");
      }
    } catch (error) {
      console.error("Unexpected error fetching role:", error);
      setUserRole("user");
    } finally {
      setLoading(false);
    }
  };

  // Refresh role function that can be called from components
  const refreshRole = async () => {
    await fetchUserRole();
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

    if (hour >= 5 && hour < 12) {
      timeOfDay = 'dimineața';
    } else if (hour >= 12 && hour < 18) {
      timeOfDay = 'ziua';
    } else if (hour >= 18 && hour < 22) {
      timeOfDay = 'seara';
    } else {
      timeOfDay = 'noapte';
    }

    // Mesaje personalizate în funcție de rol
    const messages = {
      director: [
        `Bună ${timeOfDay}, domnule director! Tabloul de bord este actualizat și vă așteaptă.`,
        `Bună ${timeOfDay}! Toate sistemele funcționează optim și sunt pregătite pentru dumneavoastră.`,
        `Bună ${timeOfDay}! Rapoartele de management vă așteaptă pentru analiză.`,
        `Bună ${timeOfDay}, domnule director! Echipa așteaptă direcțiile dumneavoastră strategice.`
      ],
      admin: [
        `Bună ${timeOfDay}, administrator! Sistemele funcționează la parametri optimi.`,
        `Bună ${timeOfDay}! Toate modulele aplicației sunt active și funcționale.`,
        `Bună ${timeOfDay}! Nicio problemă critică de sistem raportată.`,
        `Bună ${timeOfDay}, admin! Infrastructura este stabilă și securizată.`
      ],
      manager: [
        `Bună ${timeOfDay}, manager! Echipa așteaptă instrucțiunile dumneavoastră.`,
        `Bună ${timeOfDay}! Proiectele sunt în grafic și așteaptă supervizarea dumneavoastră.`,
        `Bună ${timeOfDay}, manager! Rapoartele de progres sunt pregătite pentru evaluare.`,
        `Bună ${timeOfDay}! Echipa este pregătită pentru îndrumările dumneavoastră.`
      ],
      inginer: [
        `Salut, inginer! Sperăm că ai o zi plină de inspirație tehnică.`,
        `Bună ${timeOfDay}! Proiectele tehnice te așteaptă pentru expertiza ta.`,
        `Salut! Sistemele sunt pregătite pentru optimizările tale inginerești.`,
        `Bună ${timeOfDay}, inginer! Inovațiile tale sunt esențiale pentru succesul nostru.`
      ],
      tehnician: [
        `Salut, tehnician! O nouă zi, noi provocări tehnice de rezolvat.`,
        `Bună ${timeOfDay}! Echipamentele așteaptă expertiza ta.`,
        `Salut! Sperăm că ai o zi productivă și eficientă.`,
        `Bună ${timeOfDay}, tehnician! Abilitățile tale sunt esențiale pentru operațiunile noastre.`
      ],
      magazioner: [
        `Bună ${timeOfDay}, șefule! Depozitul te așteaptă!`,
        `Salut, magazioner! Stocurile sunt actualizate și pregătite pentru gestionare.`,
        `Bună ${timeOfDay}! Inventarul așteaptă expertiza ta de organizare.`,
        `Salut! Depozitul este pregătit pentru eficientizarea ta.`
      ],
      logistica: [
        `Salut! Rutele de livrare sunt optimizate și te așteaptă.`,
        `Bună ${timeOfDay}! Planificările logistice sunt pregătite pentru revizuire.`,
        `Salut, specialist logistică! Transporturile așteaptă coordonarea ta.`,
        `Bună ${timeOfDay}! Lanțul de aprovizionare funcționează optim sub supravegherea ta.`
      ],
      contabil: [
        `Bună ${timeOfDay}! Rapoartele financiare sunt actualizate.`,
        `Bună ${timeOfDay}, contabil! Cifrele așteaptă analiza ta expertă.`,
        `Salut! Sistemele financiare sunt pregătite pentru expertiza ta.`,
        `Bună ${timeOfDay}! Bilanțurile sunt pregătite pentru verificarea ta.`
      ],
      hr: [
        `Bună ${timeOfDay}! Echipa așteaptă feedback-ul dumneavoastră.`,
        `Bună ${timeOfDay}, specialist HR! Procesele de personal sunt optimizate.`,
        `Salut! Dezvoltarea echipei progreseză conform planului tău.`,
        `Bună ${timeOfDay}! Cultura organizațională înfloreste sub îndrumarea ta.`
      ],
      client: [
        `Bună ${timeOfDay} și bine ați revenit! Proiectele dumneavoastră progresează conform planificării.`,
        `Bună ${timeOfDay}, client valoros! Suntem aici pentru a vă asista.`,
        `Bine ați revenit! Serviciile noastre sunt optimizate pentru nevoile dumneavoastră.`,
        `Bună ${timeOfDay}! Suntem onorați să vă servim din nou.`
      ],
      furnizor: [
        `Bună ${timeOfDay}, partener de încredere! Colaborarea noastră continuă cu succes.`,
        `Bine ați revenit, furnizor valoros! Sistemele de aprovizionare funcționează optim.`,
        `Bună ${timeOfDay}! Parteneriatul nostru este esențial pentru succesul comun.`,
        `Salut! Lanțul de aprovizionare funcționează perfect datorită contribuției tale.`
      ],
      contractor: [
        `Bună ${timeOfDay}, contractor! Proiectele așteaptă expertiza ta.`,
        `Bine ai revenit! Colaborarea noastră aduce rezultate excelente.`,
        `Bună ${timeOfDay}! Suntem pregătiți pentru următoarea etapă a colaborării.`,
        `Salut! Proiectele comune progresează conform așteptărilor.`
      ],
      user: [
        `Bună ${timeOfDay}! Bine ai revenit în aplicație.`,
        `Salut! Suntem bucuroși să te revedem.`,
        `Bună ${timeOfDay}! Sistemele sunt pregătite pentru tine.`,
        `Bine ai revenit! Sperăm că ai o zi productivă.`
      ],
      vizitator: [
        `Bună ${timeOfDay}! Bine ai venit în aplicația noastră.`,
        `Salut! Explorează funcționalitățile aplicației noastre.`,
        `Bună ${timeOfDay}! Suntem aici pentru a te ajuta să descoperi aplicația.`,
        `Bine ai venit! Sperăm că vei găsi aplicația noastră utilă.`
      ]
    };

    // Alegem un mesaj aleatoriu din lista de mesaje pentru rolul utilizatorului
    const roleMessages = messages[userRole as keyof typeof messages] || messages.user;
    const randomIndex = Math.floor(Math.random() * roleMessages.length);
    return roleMessages[randomIndex];
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
