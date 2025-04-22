import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";
import { cacheService } from "@/lib/cache-service";

// Tipuri pentru roluri și permisiuni
export type UserRole =
  | "director"
  | "manager"
  | "inginer"
  | "tehnician"
  | "magazioner"
  | "logistica"
  | "admin"
  | "contabil"
  | "hr"
  | "asistent"
  | "client"
  | "furnizor"
  | "contractor"
  | "utilizator";

export type RoleCategory =
  | "management"
  | "operational"
  | "administrative"
  | "external"
  | "basic";

export type Permission =
  | "view_dashboard"
  | "manage_projects"
  | "view_projects"
  | "manage_inventory"
  | "view_inventory"
  | "manage_users"
  | "view_users"
  | "manage_settings"
  | "view_settings"
  | "manage_finances"
  | "view_finances"
  | "manage_reports"
  | "view_reports"
  | "export_data"
  | "import_data"
  | "delete_data"
  | "approve_requests";

// Mapare roluri la categorii
const roleToCategoryMap: Record<UserRole, RoleCategory> = {
  director: "management",
  manager: "management",
  admin: "management",
  inginer: "operational",
  tehnician: "operational",
  magazioner: "operational",
  logistica: "operational",
  contabil: "administrative",
  hr: "administrative",
  asistent: "administrative",
  client: "external",
  furnizor: "external",
  contractor: "external",
  utilizator: "basic",
};

// Permisiuni pentru fiecare rol
const rolePermissionsMap: Record<UserRole, Permission[]> = {
  director: [
    "view_dashboard",
    "manage_projects",
    "view_projects",
    "manage_inventory",
    "view_inventory",
    "manage_users",
    "view_users",
    "manage_settings",
    "view_settings",
    "manage_finances",
    "view_finances",
    "manage_reports",
    "view_reports",
    "export_data",
    "import_data",
    "delete_data",
    "approve_requests",
  ],
  admin: [
    "view_dashboard",
    "manage_projects",
    "view_projects",
    "manage_inventory",
    "view_inventory",
    "manage_users",
    "view_users",
    "manage_settings",
    "view_settings",
    "manage_finances",
    "view_finances",
    "manage_reports",
    "view_reports",
    "export_data",
    "import_data",
    "delete_data",
    "approve_requests",
  ],
  manager: [
    "view_dashboard",
    "manage_projects",
    "view_projects",
    "view_inventory",
    "view_users",
    "view_settings",
    "view_finances",
    "manage_reports",
    "view_reports",
    "export_data",
    "approve_requests",
  ],
  inginer: [
    "view_dashboard",
    "view_projects",
    "view_inventory",
    "view_reports",
    "export_data",
  ],
  tehnician: [
    "view_dashboard",
    "view_projects",
    "view_inventory",
    "view_reports",
    "export_data",
  ],
  magazioner: [
    "view_dashboard",
    "view_projects",
    "manage_inventory",
    "view_inventory",
    "view_reports",
    "export_data",
    "import_data",
  ],
  logistica: [
    "view_dashboard",
    "view_projects",
    "view_inventory",
    "view_reports",
    "export_data",
  ],
  contabil: [
    "view_dashboard",
    "view_projects",
    "view_inventory",
    "manage_finances",
    "view_finances",
    "manage_reports",
    "view_reports",
    "export_data",
    "import_data",
  ],
  hr: [
    "view_dashboard",
    "view_projects",
    "manage_users",
    "view_users",
    "view_reports",
    "export_data",
  ],
  asistent: ["view_dashboard", "view_projects", "view_inventory", "view_reports"],
  client: ["view_dashboard", "view_projects"],
  furnizor: ["view_dashboard", "view_inventory"],
  contractor: ["view_dashboard", "view_projects"],
  utilizator: ["view_dashboard", "view_projects", "view_inventory"],
};

// Preferințe de temă pentru fiecare categorie de rol
const themePreferencesMap: Record<RoleCategory, "dark" | "light"> = {
  management: "light",
  operational: "dark",
  administrative: "light",
  external: "light",
  basic: "light",
};

// Preferințe UI pentru fiecare categorie de rol
const uiPreferencesMap: Record<RoleCategory, Record<string, any>> = {
  management: {
    showDetailedStats: true,
    compactView: false,
    showNotifications: true,
    showFinancialData: true,
  },
  operational: {
    showDetailedStats: true,
    compactView: true,
    showNotifications: true,
    showFinancialData: false,
  },
  administrative: {
    showDetailedStats: true,
    compactView: false,
    showNotifications: true,
    showFinancialData: true,
  },
  external: {
    showDetailedStats: false,
    compactView: true,
    showNotifications: false,
    showFinancialData: false,
  },
  basic: {
    showDetailedStats: false,
    compactView: true,
    showNotifications: true,
    showFinancialData: false,
  },
};

// Culori pentru fiecare rol
const roleColorsMap: Record<UserRole, string> = {
  director: "text-purple-600 dark:text-purple-400",
  admin: "text-red-600 dark:text-red-400",
  manager: "text-blue-600 dark:text-blue-400",
  inginer: "text-cyan-600 dark:text-cyan-400",
  tehnician: "text-teal-600 dark:text-teal-400",
  magazioner: "text-green-600 dark:text-green-400",
  logistica: "text-lime-600 dark:text-lime-400",
  contabil: "text-amber-600 dark:text-amber-400",
  hr: "text-pink-600 dark:text-pink-400",
  asistent: "text-indigo-600 dark:text-indigo-400",
  client: "text-orange-600 dark:text-orange-400",
  furnizor: "text-yellow-600 dark:text-yellow-400",
  contractor: "text-emerald-600 dark:text-emerald-400",
  utilizator: "text-gray-600 dark:text-gray-400",
};

// Mesaje de bun venit pentru fiecare categorie de rol
const welcomeMessagesMap: Record<RoleCategory, string[]> = {
  management: [
    "Bine ați revenit, {name}! Tabloul de bord este actualizat și vă așteaptă.",
    "Salut, {name}! Astăzi avem {count} proiecte active care necesită atenția dumneavoastră.",
    "Bună ziua! Rapoartele financiare sunt pregătite pentru revizuire.",
  ],
  operational: [
    "Salut, {name}! Ai {count} sarcini atribuite pentru astăzi.",
    "Bine ai revenit! Materialele pentru proiectele tale sunt pregătite.",
    "Bună ziua! Echipa așteaptă instrucțiunile tale pentru continuarea lucrărilor.",
  ],
  administrative: [
    "Bună ziua, {name}! Ai {count} documente care așteaptă aprobarea ta.",
    "Bine ai revenit! Rapoartele lunare sunt gata pentru revizuire.",
    "Salut! Avem {count} cereri noi de la echipă care necesită atenția ta.",
  ],
  external: [
    "Bine ați revenit! Proiectele dumneavoastră progresează conform planificării.",
    "Salut, {name}! Avem vești bune despre proiectele tale.",
    "Bună ziua! Suntem bucuroși să vă revedem pe platformă.",
  ],
  basic: [
    "Bine ai revenit în aplicație, {name}!",
    "Salut! Sperăm că ai o zi productivă.",
    "Bună ziua! Suntem aici să te ajutăm cu tot ce ai nevoie.",
  ],
};

// Mesaje speciale pentru magazioneri
const warehouseKeeperMessages = [
  "Bună ziua, șefule! Depozitul te așteaptă!",
  "Salut, {name}! Avem {count} materiale noi în stoc astăzi.",
  "Bine ai revenit! Inventarul te așteaptă pentru verificare.",
  "Salut! Avem livrări programate pentru astăzi. Ești pregătit?",
];

// Tipul pentru contextul de roluri avansat
type AdvancedRoleContextType = {
  userRole: UserRole;
  roleCategory: RoleCategory;
  permissions: Permission[];
  isLoading: boolean;
  hasPermission: (permission: Permission) => boolean;
  getWelcomeMessage: () => string;
  getThemePreference: () => "dark" | "light";
  getUIPreferences: () => Record<string, any>;
  getRoleColor: () => string;
  refreshRole: () => Promise<void>;
};

// Creăm contextul
const AdvancedRoleContext = createContext<AdvancedRoleContextType | undefined>(
  undefined
);

// Provider pentru contextul de roluri avansat
export function AdvancedRoleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>("utilizator");
  const [roleCategory, setRoleCategory] = useState<RoleCategory>("basic");
  const [permissions, setPermissions] = useState<Permission[]>(
    rolePermissionsMap["utilizator"]
  );
  const [isLoading, setIsLoading] = useState(true);

  // Funcție pentru a obține rolul utilizatorului
  const fetchUserRole = async () => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      // Setăm un timeout pentru a evita blocarea la "se încarcă..."
      timeoutId = setTimeout(() => {
        if (isMounted && isLoading) {
          setIsLoading(false);
          setUserRole("utilizator");
          setRoleCategory("basic");
          setPermissions(rolePermissionsMap["utilizator"]);
        }
      }, 3000); // 3 secunde timeout

      // Dacă nu avem un utilizator, setăm rolul implicit
      if (!user) {
        if (isMounted) {
          setUserRole("utilizator");
          setRoleCategory("basic");
          setPermissions(rolePermissionsMap["utilizator"]);
          setIsLoading(false);
        }
        if (timeoutId) clearTimeout(timeoutId);
        return;
      }

      // Verificăm dacă rolul este în cache
      const cacheKey = `user_role_${user.id}`;
      const cachedRole = cacheService.get<UserRole>(cacheKey, {
        namespace: "roles",
      });

      // Dacă avem rolul în cache și nu suntem în modul de dezvoltare, îl folosim
      if (cachedRole && process.env.NODE_ENV !== "development") {
        if (isMounted) {
          setUserRole(cachedRole);
          setRoleCategory(roleToCategoryMap[cachedRole] || "basic");
          setPermissions(rolePermissionsMap[cachedRole] || []);
          setIsLoading(false);
        }
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        return;
      }

      // Dacă nu este în cache și nu suntem în modul de dezvoltare, îl încărcăm din baza de date
      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        if (error) {
          // Încercăm să creăm un rol implicit pentru utilizator
          try {
            await supabase
              .from("user_roles")
              .insert([{ user_id: user.id, role: "utilizator" }]);
          } catch (insertError) {
            // Eroare la inserare
          }

          setUserRole("utilizator");
          setPermissions(rolePermissionsMap["utilizator"]);
        } else if (data) {
          const fetchedRole = data.role as UserRole;

          // Validăm că rolul este unul dintre cele definite
          const validRole = Object.keys(roleToCategoryMap).includes(fetchedRole)
            ? fetchedRole
            : "utilizator";

          // Salvăm rolul în cache
          cacheService.set(cacheKey, validRole, {
            namespace: "roles",
            expireIn: 30 * 60 * 1000, // 30 minute
          });

          setUserRole(validRole);
          setPermissions(rolePermissionsMap[validRole]);
        } else {
          // Dacă nu găsim un rol, folosim rolul implicit
          // Încercăm să creăm un rol implicit pentru utilizator
          try {
            await supabase
              .from("user_roles")
              .insert([{ user_id: user.id, role: "utilizator" }]);
          } catch (insertError) {
            // Eroare la inserare
          }

          setUserRole("utilizator");
          setPermissions(rolePermissionsMap["utilizator"]);
        }
      } catch (error) {
        // Eroare la interogare
        setUserRole("utilizator");
        setPermissions(rolePermissionsMap["utilizator"]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    } catch (error) {
      // Eroare generală
      setUserRole("utilizator");
      setPermissions(rolePermissionsMap["utilizator"]);
      setIsLoading(false);
    }

    // Funcție de cleanup
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
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
    let isMounted = true;
    let cleanup: (() => void) | undefined;

    const loadRole = async () => {
      if (!isMounted) return;
      try {
        cleanup = await fetchUserRole();
      } catch (error) {
        // Handle error appropriately
      }
    };

    loadRole();

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
      if (cleanup) cleanup();
    };
  }, [user, authLoading]);

  // Verifică dacă utilizatorul are o anumită permisiune
  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  // Obține un mesaj de bun venit personalizat în funcție de rol
  const getWelcomeMessage = (): string => {
    let messages: string[];

    // Mesaje speciale pentru magazioneri
    if (userRole === "magazioner") {
      messages = warehouseKeeperMessages;
    } else {
      messages = welcomeMessagesMap[roleCategory];
    }

    // Alegem un mesaj aleatoriu din lista disponibilă
    const randomIndex = Math.floor(Math.random() * messages.length);
    let message = messages[randomIndex];

    // Înlocuim placeholder-urile din mesaj
    const name = user?.email?.split("@")[0] || "utilizator";
    const count = Math.floor(Math.random() * 10) + 1; // Număr aleatoriu între 1 și 10

    message = message
      .replace("{name}", name)
      .replace("{count}", count.toString());

    return message;
  };

  // Obține preferința de temă în funcție de categoria rolului
  const getThemePreference = (): "dark" | "light" => {
    return themePreferencesMap[roleCategory];
  };

  // Obține preferințele UI în funcție de categoria rolului
  const getUIPreferences = (): Record<string, any> => {
    return uiPreferencesMap[roleCategory];
  };

  // Obține culoarea asociată rolului
  const getRoleColor = (): string => {
    return roleColorsMap[userRole] || "text-gray-500";
  };

  const value = {
    userRole,
    roleCategory,
    permissions,
    isLoading,
    hasPermission,
    getWelcomeMessage,
    getThemePreference,
    getUIPreferences,
    getRoleColor,
    refreshRole,
  };

  return (
    <AdvancedRoleContext.Provider value={value}>
      {children}
    </AdvancedRoleContext.Provider>
  );
}

// Hook pentru a utiliza contextul de roluri avansat
export function useAdvancedRole() {
  const context = useContext(AdvancedRoleContext);
  if (context === undefined) {
    throw new Error(
      "useAdvancedRole must be used within an AdvancedRoleProvider"
    );
  }
  return context;
}
