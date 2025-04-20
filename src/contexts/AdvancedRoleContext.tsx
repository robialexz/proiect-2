import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";
import { cacheService } from "@/lib/cache-service";

// Definim tipurile de roluri disponibile în aplicație
export type UserRole =
  // Rol de administrator
  | "ADMIN"
  // Roluri de management
  | "director_general"
  | "director_executiv"
  | "manager_departament"
  | "sef_proiect"
  // Roluri operaționale
  | "inginer"
  | "tehnician"
  | "magazioner"
  | "operator_logistica"
  // Roluri administrative
  | "administrator_sistem"
  | "contabil"
  | "resurse_umane"
  | "asistent_administrativ"
  // Roluri externe
  | "client"
  | "furnizor"
  | "contractor"
  | "vizitator"
  // Rol implicit
  | "utilizator";

// Definim categoriile de roluri pentru grupare și personalizare
export type RoleCategory =
  | "management"
  | "operational"
  | "administrative"
  | "external"
  | "default";

// Definim tipurile de permisiuni disponibile în aplicație
export type Permission =
  // Permisiuni generale
  | "view_dashboard"
  | "edit_profile"
  // Permisiuni pentru proiecte
  | "view_projects"
  | "create_project"
  | "edit_project"
  | "delete_project"
  | "assign_project"
  // Permisiuni pentru inventar
  | "view_inventory"
  | "add_material"
  | "edit_material"
  | "delete_material"
  | "adjust_stock"
  | "request_material"
  | "approve_request"
  // Permisiuni pentru rapoarte
  | "view_reports"
  | "create_report"
  | "export_report"
  // Permisiuni pentru utilizatori
  | "view_users"
  | "create_user"
  | "edit_user"
  | "delete_user"
  | "assign_role"
  // Permisiuni pentru setări
  | "view_settings"
  | "edit_settings"
  // Permisiuni pentru finanțe
  | "view_finances"
  | "create_invoice"
  | "approve_payment"
  | "view_budget"
  | "edit_budget"
  // Permisiuni pentru resurse umane
  | "view_hr"
  | "manage_attendance"
  | "manage_payroll"
  | "manage_benefits";

// Definim interfața pentru contextul de roluri avansat
interface AdvancedRoleContextType {
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
}

// Creăm contextul pentru roluri avansat
const AdvancedRoleContext = createContext<AdvancedRoleContextType | undefined>(
  undefined
);

// Mapăm rolurile la categorii
const roleToCategoryMap: Record<UserRole, RoleCategory> = {
  ADMIN: "management",
  director_general: "management",
  director_executiv: "management",
  manager_departament: "management",
  sef_proiect: "management",
  inginer: "operational",
  tehnician: "operational",
  magazioner: "operational",
  operator_logistica: "operational",
  administrator_sistem: "administrative",
  contabil: "administrative",
  resurse_umane: "administrative",
  asistent_administrativ: "administrative",
  client: "external",
  furnizor: "external",
  contractor: "external",
  vizitator: "external",
  utilizator: "default",
};

// Definim permisiunile pentru fiecare rol
const rolePermissionsMap: Record<UserRole, Permission[]> = {
  ADMIN: [
    "view_dashboard",
    "edit_profile",
    "view_projects",
    "create_project",
    "edit_project",
    "delete_project",
    "assign_project",
    "view_inventory",
    "add_material",
    "edit_material",
    "delete_material",
    "adjust_stock",
    "request_material",
    "approve_request",
    "view_reports",
    "create_report",
    "export_report",
    "view_users",
    "create_user",
    "edit_user",
    "delete_user",
    "assign_role",
    "view_settings",
    "edit_settings",
    "view_finances",
    "create_invoice",
    "approve_payment",
    "view_budget",
    "edit_budget",
    "view_hr",
    "manage_attendance",
    "manage_payroll",
    "manage_benefits",
  ],
  director_general: [
    "view_dashboard",
    "edit_profile",
    "view_projects",
    "create_project",
    "edit_project",
    "delete_project",
    "assign_project",
    "view_inventory",
    "add_material",
    "edit_material",
    "delete_material",
    "adjust_stock",
    "request_material",
    "approve_request",
    "view_reports",
    "create_report",
    "export_report",
    "view_users",
    "create_user",
    "edit_user",
    "delete_user",
    "assign_role",
    "view_settings",
    "edit_settings",
    "view_finances",
    "create_invoice",
    "approve_payment",
    "view_budget",
    "edit_budget",
    "view_hr",
    "manage_attendance",
    "manage_payroll",
    "manage_benefits",
  ],
  director_executiv: [
    "view_dashboard",
    "edit_profile",
    "view_projects",
    "create_project",
    "edit_project",
    "assign_project",
    "view_inventory",
    "add_material",
    "edit_material",
    "adjust_stock",
    "approve_request",
    "view_reports",
    "create_report",
    "export_report",
    "view_users",
    "create_user",
    "edit_user",
    "view_settings",
    "view_finances",
    "create_invoice",
    "approve_payment",
    "view_budget",
    "view_hr",
    "manage_attendance",
  ],
  manager_departament: [
    "view_dashboard",
    "edit_profile",
    "view_projects",
    "create_project",
    "edit_project",
    "assign_project",
    "view_inventory",
    "add_material",
    "edit_material",
    "adjust_stock",
    "request_material",
    "view_reports",
    "create_report",
    "export_report",
    "view_users",
    "view_finances",
    "view_budget",
  ],
  sef_proiect: [
    "view_dashboard",
    "edit_profile",
    "view_projects",
    "create_project",
    "edit_project",
    "assign_project",
    "view_inventory",
    "request_material",
    "view_reports",
    "create_report",
    "view_users",
  ],
  inginer: [
    "view_dashboard",
    "edit_profile",
    "view_projects",
    "edit_project",
    "view_inventory",
    "request_material",
    "view_reports",
  ],
  tehnician: [
    "view_dashboard",
    "edit_profile",
    "view_projects",
    "view_inventory",
    "request_material",
  ],
  magazioner: [
    "view_dashboard",
    "edit_profile",
    "view_inventory",
    "add_material",
    "edit_material",
    "adjust_stock",
    "view_reports",
  ],
  operator_logistica: [
    "view_dashboard",
    "edit_profile",
    "view_inventory",
    "adjust_stock",
    "view_reports",
  ],
  administrator_sistem: [
    "view_dashboard",
    "edit_profile",
    "view_projects",
    "view_inventory",
    "view_reports",
    "view_users",
    "create_user",
    "edit_user",
    "delete_user",
    "assign_role",
    "view_settings",
    "edit_settings",
  ],
  contabil: [
    "view_dashboard",
    "edit_profile",
    "view_projects",
    "view_inventory",
    "view_reports",
    "create_report",
    "export_report",
    "view_finances",
    "create_invoice",
    "view_budget",
  ],
  resurse_umane: [
    "view_dashboard",
    "edit_profile",
    "view_users",
    "create_user",
    "edit_user",
    "view_hr",
    "manage_attendance",
    "manage_payroll",
    "manage_benefits",
  ],
  asistent_administrativ: [
    "view_dashboard",
    "edit_profile",
    "view_projects",
    "view_inventory",
    "view_reports",
  ],
  client: ["view_dashboard", "edit_profile", "view_projects"],
  furnizor: ["view_dashboard", "edit_profile", "view_inventory"],
  contractor: ["view_dashboard", "edit_profile", "view_projects"],
  vizitator: ["view_dashboard"],
  utilizator: ["view_dashboard", "edit_profile"],
};

// Mesaje de bun venit personalizate pentru fiecare categorie de rol
const welcomeMessagesMap: Record<RoleCategory, string[]> = {
  management: [
    "Bună ziua, {name}. Tabloul de bord executiv este actualizat.",
    "Bine ați revenit, {name}. Aveți {count} notificări importante în așteptare.",
    "Bun venit, {name}. Rapoartele zilnice sunt pregătite pentru analiză.",
  ],
  operational: [
    "Salut, {name}! Ai {count} sarcini active astăzi.",
    "Bună ziua, {name}! Echipa te așteaptă cu noi provocări.",
    "Ce mai faci, {name}? Proiectele tale progresează conform planului.",
  ],
  administrative: [
    "Bună ziua, {name}. Documentele de astăzi sunt pregătite pentru procesare.",
    "Bine ați revenit, {name}. Sistemele funcționează normal.",
    "Bun venit înapoi, {name}. Calendarul de astăzi este actualizat.",
  ],
  external: [
    "Bună ziua, {name}. Mulțumim pentru colaborare.",
    "Bine ați revenit, {name}. Proiectele dvs. progresează conform planului.",
    "Bun venit în platformă, {name}. Suntem aici pentru a vă ajuta.",
  ],
  default: [
    "Bine ai revenit, {name}!",
    "Salut, {name}! Ce mai faci?",
    "Bună ziua, {name}. Bine ai venit înapoi.",
  ],
};

// Mesaje de bun venit specifice pentru rolul de magazioner (mai amuzante)
const warehouseKeeperMessages = [
  "Bună ziua, șefule {name}! Depozitul te așteaptă!",
  "Salut, {name}! Azi avem {count} livrări programate și un inventar care nu se va număra singur. Cafea?",
  "Ce faci, {name}? Materialele nu se vor mișca singure! Hai la treabă!",
  "Bună dimineața, {name}! Soarele strălucește, păsările cântă, iar paleții te așteaptă să-i sortezi!",
  "Hei, {name}! Ghici ce? Exact, mai multe cutii de numărat! Ziua ta preferată!",
];

// Preferințe de temă pentru fiecare categorie de rol
const themePreferencesMap: Record<RoleCategory, "dark" | "light"> = {
  management: "dark", // Temă întunecată pentru management - aspect profesional
  operational: "dark", // Temă întunecată pentru operațional - mai puțin obositor pentru ochi
  administrative: "light", // Temă luminoasă pentru administrativ - mai bună pentru lucrul cu documente
  external: "light", // Temă luminoasă pentru externi - aspect mai prietenos
  default: "dark", // Temă întunecată implicit
};

// Preferințe UI pentru fiecare categorie de rol
const uiPreferencesMap: Record<RoleCategory, Record<string, any>> = {
  management: {
    dashboardLayout: "analytics",
    showFinancialMetrics: true,
    defaultView: "overview",
    menuCollapsed: false,
  },
  operational: {
    dashboardLayout: "tasks",
    showFinancialMetrics: false,
    defaultView: "projects",
    menuCollapsed: true,
  },
  administrative: {
    dashboardLayout: "calendar",
    showFinancialMetrics: true,
    defaultView: "documents",
    menuCollapsed: false,
  },
  external: {
    dashboardLayout: "projects",
    showFinancialMetrics: false,
    defaultView: "status",
    menuCollapsed: true,
  },
  default: {
    dashboardLayout: "standard",
    showFinancialMetrics: false,
    defaultView: "dashboard",
    menuCollapsed: false,
  },
};

// Culorile asociate fiecărui rol
const roleColorsMap: Record<UserRole, string> = {
  ADMIN: "text-red-600",
  director_general: "text-purple-600",
  director_executiv: "text-purple-500",
  manager_departament: "text-blue-500",
  sef_proiect: "text-blue-400",
  inginer: "text-cyan-500",
  tehnician: "text-teal-500",
  magazioner: "text-green-500",
  operator_logistica: "text-lime-500",
  administrator_sistem: "text-red-500",
  contabil: "text-amber-500",
  resurse_umane: "text-pink-500",
  asistent_administrativ: "text-indigo-500",
  client: "text-orange-500",
  furnizor: "text-yellow-500",
  contractor: "text-emerald-500",
  utilizator: "text-blue-500",
  vizitator: "text-gray-500",
};

// Provider pentru contextul de roluri avansat
export function AdvancedRoleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>("utilizator");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Determinăm categoria rolului
  const roleCategory = roleToCategoryMap[userRole];

  // Încărcăm rolul utilizatorului din baza de date
  const fetchUserRole = async () => {
    if (authLoading || !user) {
      return;
    }

    setIsLoading(true);

    // Folosim o variabilă pentru a ține evidența dacă componenta este montată
    let isMounted = true;

    // Referimță pentru timeout pentru a putea face cleanup
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      // Adăugăm un timeout pentru a evita blocarea la "se încarcă..."
      timeoutId = setTimeout(() => {
        if (isMounted && isLoading) {
          console.log(
            "Advanced role loading timeout reached, forcing loading to false"
          );
          setIsLoading(false);
          setUserRole("utilizator"); // Setăm rolul implicit în caz de timeout
          setPermissions(rolePermissionsMap["utilizator"]);
        }
      }, 1000); // 1 secundă timeout - redus pentru performanță mai bună

      // Verificăm mai întâi dacă rolul este în cache
      const cacheKey = `user_role_${user.id}`;
      const cachedRole = cacheService.get<UserRole>(cacheKey, {
        namespace: "roles",
      });

      if (cachedRole) {
        console.log("Using cached user role:", cachedRole);
        setUserRole(cachedRole);
        setPermissions(rolePermissionsMap[cachedRole]);
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      // În modul de dezvoltare, putem seta roluri bazate pe email pentru testare
      if (import.meta.env.DEV) {
        const email = user.email?.toLowerCase() || "";

        let devRole: UserRole = "utilizator";

        if (email.includes("director") && email.includes("general")) {
          devRole = "director_general";
        } else if (email.includes("director") || email.includes("executiv")) {
          devRole = "director_executiv";
        } else if (email.includes("manager")) {
          devRole = "manager_departament";
        } else if (email.includes("sef") && email.includes("proiect")) {
          devRole = "sef_proiect";
        } else if (email.includes("inginer")) {
          devRole = "inginer";
        } else if (email.includes("tehnician")) {
          devRole = "tehnician";
        } else if (email.includes("magazioner") || email.includes("depozit")) {
          devRole = "magazioner";
        } else if (email.includes("logistica") || email.includes("transport")) {
          devRole = "operator_logistica";
        } else if (email.includes("admin") || email.includes("sistem")) {
          devRole = "administrator_sistem";
        } else if (email.includes("contabil") || email.includes("financiar")) {
          devRole = "contabil";
        } else if (email.includes("hr") || email.includes("resurse")) {
          devRole = "resurse_umane";
        } else if (email.includes("asistent")) {
          devRole = "asistent_administrativ";
        } else if (email.includes("client")) {
          devRole = "client";
        } else if (email.includes("furnizor")) {
          devRole = "furnizor";
        } else if (email.includes("contractor")) {
          devRole = "contractor";
        } else if (email.includes("test")) {
          // Pentru contul de test, setăm rolul de director general
          devRole = "director_general";
        }

        setUserRole(devRole);
        setPermissions(rolePermissionsMap[devRole]);

        // Salvăm rolul în cache
        cacheService.set(cacheKey, devRole, {
          namespace: "roles",
          expireIn: 30 * 60 * 1000, // 30 minute
        });

        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      // Dacă nu este în cache și nu suntem în modul de dezvoltare, îl încărcăm din baza de date
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
        console.error("Error fetching user role:", error);

        // Încercăm să creăm un rol implicit pentru utilizator
        try {
          await supabase
            .from("user_roles")
            .insert([{ user_id: user.id, role: "utilizator" }]);
        } catch (insertError) {
          console.error("Error creating default user role:", insertError);
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
        console.log("No role found for user, using default role");

        // Încercăm să creăm un rol implicit pentru utilizator
        try {
          await supabase
            .from("user_roles")
            .insert([{ user_id: user.id, role: "utilizator" }]);
        } catch (insertError) {
          console.error("Error creating default user role:", insertError);
        }

        setUserRole("utilizator");
        setPermissions(rolePermissionsMap["utilizator"]);
      }
    } catch (error) {
      console.error("Unexpected error fetching role:", error);
      setUserRole("utilizator");
      setPermissions(rolePermissionsMap["utilizator"]);
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }

      // Funcție de cleanup pentru a preveni memory leaks
      return () => {
        isMounted = false;
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }
  };

  // Refresh role function that can be called from components
  const refreshRole = async () => {
    await fetchUserRole();
  };

  // Effect to fetch role when user changes
  useEffect(() => {
    let isMounted = true;
    let cleanup: (() => void) | undefined;

    const loadRole = async () => {
      if (!isMounted) return;
      cleanup = await fetchUserRole();
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
