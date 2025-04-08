import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";

// Define user roles
export type UserRole = "user" | "manager" | "admin";

type RoleContextType = {
  userRole: UserRole;
  isManager: boolean;
  isAdmin: boolean;
  loading: boolean;
  refreshRole: () => Promise<void>;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>("user");
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async () => {
    if (!user) {
      setUserRole("user");
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
      }, 3000); // 3 secunde timeout

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

  const value = {
    userRole,
    isManager: userRole === "manager" || userRole === "admin",
    isAdmin: userRole === "admin",
    loading,
    refreshRole,
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
