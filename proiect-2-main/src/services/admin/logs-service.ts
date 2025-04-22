import { supabase } from "@/lib/supabase";
import { SupabaseTables } from "@/types/supabase-tables";

// Tipul pentru jurnalul de activitate
export interface ActivityLog {
  id?: string;
  user_id: string;
  user_email?: string;
  action: string;
  resource: string;
  resource_id?: string | null;
  details?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at?: string;
  severity?: "info" | "warning" | "error" | "success";
}

// Tipul pentru filtrele de jurnal
export interface LogFilters {
  userId?: string;
  action?: string;
  resource?: string;
  severity?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
}

/**
 * Serviciu pentru gestionarea jurnalelor de activitate
 */
class LogsService {
  /**
   * Obține jurnalele de activitate cu filtrare
   * @param filters Filtrele pentru jurnale
   * @returns Jurnalele de activitate filtrate
   */
  async getLogs(filters?: LogFilters) {
    try {
      let query = supabase
        .from(SupabaseTables.USER_LOGS)
        .select(`
          *,
          profiles:${SupabaseTables.PROFILES}(email)
        `)
        .order("created_at", { ascending: false });

      // Aplicăm filtrele
      if (filters) {
        if (filters.userId) {
          query = query.eq("user_id", filters.userId);
        }

        if (filters.action) {
          query = query.eq("action", filters.action);
        }

        if (filters.resource) {
          query = query.eq("resource", filters.resource);
        }

        if (filters.severity) {
          query = query.eq("severity", filters.severity);
        }

        if (filters.dateFrom) {
          query = query.gte("created_at", filters.dateFrom.toISOString());
        }

        if (filters.dateTo) {
          // Adăugăm o zi pentru a include întreaga zi selectată
          const dateTo = new Date(filters.dateTo);
          dateTo.setDate(dateTo.getDate() + 1);
          query = query.lt("created_at", dateTo.toISOString());
        }

        if (filters.searchTerm) {
          query = query.or(
            `details.ilike.%${filters.searchTerm}%,resource.ilike.%${filters.searchTerm}%`
          );
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transformăm datele pentru a include email-ul utilizatorului
      const formattedLogs = data.map((log) => ({
        ...log,
        user_email: log.profiles?.email || "",
      }));

      return formattedLogs;
    } catch (error) {
      console.error("Error fetching logs:", error);
      throw error;
    }
  }

  /**
   * Obține jurnalele de activitate pentru un utilizator specific
   * @param userId ID-ul utilizatorului
   * @param filters Filtrele pentru jurnale
   * @returns Jurnalele de activitate ale utilizatorului
   */
  async getUserLogs(userId: string, filters?: LogFilters) {
    return this.getLogs({ ...filters, userId });
  }

  /**
   * Înregistrează o acțiune a utilizatorului
   * @param userId ID-ul utilizatorului
   * @param action Acțiunea efectuată
   * @param resource Resursa afectată
   * @param resourceId ID-ul resursei (opțional)
   * @param details Detalii suplimentare (opțional)
   * @param severity Severitatea acțiunii (opțional)
   * @returns Rezultatul operațiunii
   */
  async logUserAction(
    userId: string,
    action: string,
    resource: string,
    resourceId?: string,
    details?: string,
    severity: "info" | "warning" | "error" | "success" = "info"
  ) {
    try {
      const { data, error } = await supabase
        .from(SupabaseTables.USER_LOGS)
        .insert([
          {
            user_id: userId,
            action,
            resource,
            resource_id: resourceId,
            details,
            ip_address: "127.0.0.1", // În implementarea reală, ar trebui să obținem IP-ul real
            user_agent: navigator.userAgent,
            severity,
          },
        ])
        .select();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error logging user action:", error);
      throw error;
    }
  }

  /**
   * Exportă jurnalele de activitate în format CSV
   * @param filters Filtrele pentru jurnale
   * @returns Conținutul CSV
   */
  async exportLogs(filters?: LogFilters) {
    try {
      const logs = await this.getLogs(filters);

      // Definim anteturile CSV
      const headers = [
        "ID",
        "User",
        "Action",
        "Resource",
        "Resource ID",
        "Details",
        "IP Address",
        "User Agent",
        "Timestamp",
        "Severity",
      ];

      // Convertim jurnalele în format CSV
      const csvContent = [
        headers.join(","),
        ...logs.map((log) => [
          log.id,
          log.user_email,
          log.action,
          log.resource,
          log.resource_id || "",
          log.details ? `"${log.details.replace(/"/g, '""')}"` : "",
          log.ip_address || "",
          log.user_agent ? `"${log.user_agent.replace(/"/g, '""')}"` : "",
          log.created_at,
          log.severity,
        ].join(",")),
      ].join("\n");

      return csvContent;
    } catch (error) {
      console.error("Error exporting logs:", error);
      throw error;
    }
  }

  /**
   * Șterge jurnalele mai vechi de o anumită perioadă
   * @param days Numărul de zile pentru păstrarea jurnalelor
   * @returns Rezultatul operațiunii
   */
  async cleanupOldLogs(days: number = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data, error } = await supabase
        .from(SupabaseTables.USER_LOGS)
        .delete()
        .lt("created_at", cutoffDate.toISOString())
        .select();

      if (error) throw error;

      return { deletedCount: data?.length || 0 };
    } catch (error) {
      console.error("Error cleaning up old logs:", error);
      throw error;
    }
  }
}

export const logsService = new LogsService();
