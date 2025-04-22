import { supabase } from "./supabase";
import { errorHandler } from "./error-handler";
import { enhancedSupabaseService } from "./enhanced-supabase-service";
import type { SupabaseResponse } from "../services/api/supabase-service";
import {
  StockAlert,
  StockAlertWithDetails,
  CreateStockAlertInput,
  UpdateStockAlertInput,
  AlertType,
  StockAlertCheckResult
} from "../models/stock-alert.model";

/**
 * Serviciu pentru gestionarea alertelor de stoc
 */
export const stockAlertsService = {
  /**
   * Obține toate alertele de stoc
   * @param options - Opțiuni pentru filtrare și ordonare
   * @returns Lista de alerte sau eroare
   */
  async getAlerts(options?: {
    materialId?: string;
    projectId?: string;
    alertType?: AlertType;
    isActive?: boolean;
    orderBy?: { column: string; ascending?: boolean };
    page?: number;
    pageSize?: number;
  }): Promise<SupabaseResponse<StockAlertWithDetails[]>> {
    try {
      // Construim filtrele
      const filters: Record<string, any> = {};

      if (options?.materialId) {
        filters.material_id = options.materialId;
      }

      if (options?.projectId) {
        filters.project_id = options.projectId;
      }

      if (options?.alertType) {
        filters.alert_type = options.alertType;
      }

      if (options?.isActive !== undefined) {
        filters.is_active = options.isActive;
      }

      // Pentru filtrare
      let query = supabase
        .from("stock_alerts")
        .select(`
          *,
          materials:material_id (name, unit, quantity),
          projects:project_id (name)
        `);

      // Aplicăm filtrele
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      // Ordonare
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      // Paginare
      if (options?.page !== undefined && options?.pageSize !== undefined) {
        const from = (options.page - 1) * options.pageSize;
        const to = from + options.pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transformăm datele pentru a avea structura dorită
      const transformedData = data.map((item: any) => ({
        ...item,
        material_name: item.materials?.name,
        material_unit: item.materials?.unit,
        material_quantity: item.materials?.quantity,
        project_name: item.projects?.name,
      }));

      return {
        data: transformedData,
        error: null,
        status: "success",
      };
    } catch (error) {
      errorHandler.handleError(error, false);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          details: error instanceof Error ? error.stack || "" : "",
          code: "client_error",
        },
        status: "error",
      };
    }
  },

  /**
   * Obține o alertă de stoc după ID
   * @param id - ID-ul alertei
   * @returns Alerta sau eroare
   */
  async getAlertById(id: string): Promise<SupabaseResponse<StockAlertWithDetails>> {
    try {
      const { data, error } = await supabase
        .from("stock_alerts")
        .select(`
          *,
          materials:material_id (name, unit, quantity),
          projects:project_id (name)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      // Transformăm datele pentru a avea structura dorită
      const transformedData = {
        ...data,
        material_name: data.materials?.name,
        material_unit: data.materials?.unit,
        material_quantity: data.materials?.quantity,
        project_name: data.projects?.name,
      };

      return {
        data: transformedData,
        error: null,
        status: "success",
      };
    } catch (error) {
      errorHandler.handleError(error, false);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          details: error instanceof Error ? error.stack || "" : "",
          code: "client_error",
        },
        status: "error",
      };
    }
  },

  /**
   * Creează o alertă de stoc
   * @param alert - Datele alertei
   * @returns Alerta creată sau eroare
   */
  async createAlert(
    alert: CreateStockAlertInput
  ): Promise<SupabaseResponse<StockAlert>> {
    try {
      const { data, error } = await supabase
        .from("stock_alerts")
        .insert({
          material_id: alert.material_id,
          project_id: alert.project_id,
          alert_type: alert.alert_type,
          threshold: alert.threshold,
          is_active: alert.is_active !== undefined ? alert.is_active : true,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        status: "success",
      };
    } catch (error) {
      errorHandler.handleError(error, false);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          details: error instanceof Error ? error.stack || "" : "",
          code: "client_error",
        },
        status: "error",
      };
    }
  },

  /**
   * Actualizează o alertă de stoc
   * @param id - ID-ul alertei
   * @param alert - Datele actualizate
   * @returns Alerta actualizată sau eroare
   */
  async updateAlert(
    id: string,
    alert: UpdateStockAlertInput
  ): Promise<SupabaseResponse<StockAlert>> {
    try {
      const { data, error } = await supabase
        .from("stock_alerts")
        .update({
          alert_type: alert.alert_type,
          threshold: alert.threshold,
          is_active: alert.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        status: "success",
      };
    } catch (error) {
      errorHandler.handleError(error, false);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          details: error instanceof Error ? error.stack || "" : "",
          code: "client_error",
        },
        status: "error",
      };
    }
  },

  /**
   * Șterge o alertă de stoc
   * @param id - ID-ul alertei
   * @returns Succes sau eroare
   */
  async deleteAlert(id: string): Promise<SupabaseResponse<null>> {
    try {
      const { error } = await supabase
        .from("stock_alerts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      return {
        data: null,
        error: null,
        status: "success",
      };
    } catch (error) {
      errorHandler.handleError(error, false);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          details: error instanceof Error ? error.stack || "" : "",
          code: "client_error",
        },
        status: "error",
      };
    }
  },

  /**
   * Verifică alertele de stoc pentru un material sau proiect
   * @param options - Opțiuni pentru verificare
   * @returns Rezultatul verificării
   */
  async checkAlerts(options?: {
    materialId?: string;
    projectId?: string;
  }): Promise<SupabaseResponse<StockAlertCheckResult>> {
    try {
      // Construim filtrele
      const filters: Record<string, any> = {
        is_active: true,
      };

      if (options?.materialId) {
        filters.material_id = options.materialId;
      }

      if (options?.projectId) {
        filters.project_id = options.projectId;
      }

      // Obținem alertele active
      let query = supabase
        .from("stock_alerts")
        .select(`
          *,
          materials:material_id (name, unit, quantity),
          projects:project_id (name)
        `);

      // Aplicăm filtrele
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query;

      if (error) throw error;

      // Verificăm fiecare alertă
      const triggeredAlerts: StockAlertWithDetails[] = [];

      for (const alert of data) {
        const material = alert.materials;
        
        if (!material) continue;

        // Transformăm alerta pentru a avea structura dorită
        const transformedAlert = {
          ...alert,
          material_name: material.name,
          material_unit: material.unit,
          material_quantity: material.quantity,
          project_name: alert.projects?.name,
        };

        // Verificăm dacă alerta este declanșată
        let isTriggered = false;

        if (alert.alert_type === "low_stock" && alert.threshold !== null) {
          isTriggered = material.quantity <= alert.threshold;
        } else if (alert.alert_type === "out_of_stock") {
          isTriggered = material.quantity <= 0;
        }

        if (isTriggered) {
          // Actualizăm data ultimei declanșări
          await supabase
            .from("stock_alerts")
            .update({
              last_triggered_at: new Date().toISOString(),
            })
            .eq("id", alert.id);

          triggeredAlerts.push(transformedAlert);
        }
      }

      return {
        data: {
          triggered: triggeredAlerts.length > 0,
          alerts: triggeredAlerts,
        },
        error: null,
        status: "success",
      };
    } catch (error) {
      errorHandler.handleError(error, false);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          details: error instanceof Error ? error.stack || "" : "",
          code: "client_error",
        },
        status: "error",
      };
    }
  },

  /**
   * Activează sau dezactivează o alertă de stoc
   * @param id - ID-ul alertei
   * @param isActive - Starea activă
   * @returns Alerta actualizată sau eroare
   */
  async toggleAlert(
    id: string,
    isActive: boolean
  ): Promise<SupabaseResponse<StockAlert>> {
    try {
      const { data, error } = await supabase
        .from("stock_alerts")
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        status: "success",
      };
    } catch (error) {
      errorHandler.handleError(error, false);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          details: error instanceof Error ? error.stack || "" : "",
          code: "client_error",
        },
        status: "error",
      };
    }
  },

  /**
   * Creează alerte de stoc pentru toate materialele dintr-un proiect
   * @param projectId - ID-ul proiectului
   * @param threshold - Pragul pentru alerte (procent din cantitatea maximă)
   * @returns Alertele create sau eroare
   */
  async createAlertsForProject(
    projectId: string,
    threshold: number = 20
  ): Promise<SupabaseResponse<StockAlert[]>> {
    try {
      // Obținem toate materialele din proiect
      const { data: materials, error: materialsError } = await supabase
        .from("materials")
        .select("id, max_stock_level")
        .eq("project_id", projectId)
        .not("max_stock_level", "is", null);

      if (materialsError) throw materialsError;

      // Creăm alerte pentru fiecare material
      const alerts = materials.map((material) => ({
        material_id: material.id,
        project_id: projectId,
        alert_type: "low_stock" as AlertType,
        threshold: Math.round((material.max_stock_level * threshold) / 100),
        is_active: true,
      }));

      // Inserăm alertele în baza de date
      const { data, error } = await supabase
        .from("stock_alerts")
        .insert(alerts)
        .select();

      if (error) throw error;

      return {
        data,
        error: null,
        status: "success",
      };
    } catch (error) {
      errorHandler.handleError(error, false);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          details: error instanceof Error ? error.stack || "" : "",
          code: "client_error",
        },
        status: "error",
      };
    }
  },

  /**
   * Exportă alertele de stoc în format Excel sau CSV
   * @param format - Formatul exportului (excel sau csv)
   * @param options - Opțiuni pentru filtrare
   * @returns Blob cu datele exportate sau eroare
   */
  async exportAlerts(
    format: "excel" | "csv" = "excel",
    options?: {
      materialId?: string;
      projectId?: string;
      alertType?: AlertType;
      isActive?: boolean;
    }
  ): Promise<SupabaseResponse<Blob>> {
    try {
      // Construim filtrele
      const filters: Record<string, any> = {};

      if (options?.materialId) {
        filters.material_id = options.materialId;
      }

      if (options?.projectId) {
        filters.project_id = options.projectId;
      }

      if (options?.alertType) {
        filters.alert_type = options.alertType;
      }

      if (options?.isActive !== undefined) {
        filters.is_active = options.isActive;
      }

      // Exportăm datele
      return enhancedSupabaseService.export<StockAlert>("stock_alerts", format, {
        filters,
        columns: [
          "id",
          "material_id",
          "project_id",
          "alert_type",
          "threshold",
          "is_active",
          "last_triggered_at",
          "created_at",
        ],
        fileName: `stock-alerts-export-${new Date().toISOString().split("T")[0]}`,
      });
    } catch (error) {
      errorHandler.handleError(error, false);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          details: error instanceof Error ? error.stack || "" : "",
          code: "client_error",
        },
        status: "error",
      };
    }
  },

  /**
   * Abonează la schimbări în alertele de stoc
   * @param callback - Funcția de callback apelată la schimbări
   * @param options - Opțiuni pentru filtrare
   * @returns Obiectul de abonament
   */
  subscribeToAlertChanges(
    callback: (payload: any) => void,
    options?: {
      materialId?: string;
      projectId?: string;
      event?: "INSERT" | "UPDATE" | "DELETE" | "*";
    }
  ) {
    try {
      // Construim filtrele
      const filters: Record<string, any> = {};

      if (options?.materialId) {
        filters.material_id = options.materialId;
      }

      if (options?.projectId) {
        filters.project_id = options.projectId;
      }

      // Creăm abonamentul
      return enhancedSupabaseService.subscribe<StockAlert>(
        "stock_alerts",
        options?.event || "*",
        callback,
        filters
      );
    } catch (error) {
      errorHandler.handleError(error, false);
      // Returnăm un obiect de abonament fals pentru a evita erorile
      return {
        unsubscribe: () => {},
      };
    }
  },

  /**
   * Dezabonează de la un abonament
   * @param subscription - Obiectul de abonament returnat de metoda subscribeToAlertChanges
   */
  unsubscribeFromAlertChanges(subscription: any) {
    enhancedSupabaseService.unsubscribe(subscription);
  },
};

export default stockAlertsService;
