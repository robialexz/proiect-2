import { supabase } from "./supabase";
import { errorHandler } from "./error-handler";
import { enhancedSupabaseService } from "./enhanced-supabase-service";
import type { SupabaseResponse } from "../services/api/supabase-service";
import {
  MaterialOperation,
  MaterialOperationWithDetails,
  CreateMaterialOperationInput,
  UpdateMaterialOperationInput,
  MaterialOperationFilter,
  OperationType
} from "../models/material-operation.model";

/**
 * Serviciu pentru gestionarea operațiunilor de materiale
 */
export const materialOperationsService = {
  /**
   * Obține toate operațiunile de materiale
   * @param options - Opțiuni pentru filtrare și ordonare
   * @returns Lista de operațiuni sau eroare
   */
  async getOperations(options?: {
    projectId?: string;
    materialId?: string;
    operationType?: OperationType;
    dateFrom?: string;
    dateTo?: string;
    orderBy?: { column: string; ascending?: boolean };
    page?: number;
    pageSize?: number;
  }): Promise<SupabaseResponse<MaterialOperationWithDetails[]>> {
    try {
      // Construim filtrele
      const filters: Record<string, any> = {};

      if (options?.projectId) {
        filters.project_id = options.projectId;
      }

      if (options?.materialId) {
        filters.material_id = options.materialId;
      }

      if (options?.operationType) {
        filters.operation_type = options.operationType;
      }

      // Pentru filtrare după dată
      let query = supabase
        .from("material_operations")
        .select(`
          *,
          materials:material_id (name, unit),
          projects:project_id (name),
          profiles:created_by (full_name)
        `);

      // Aplicăm filtrele
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      // Filtrare după interval de date
      if (options?.dateFrom) {
        query = query.gte("created_at", options.dateFrom);
      }

      if (options?.dateTo) {
        query = query.lte("created_at", options.dateTo);
      }

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
        project_name: item.projects?.name,
        created_by_name: item.profiles?.full_name,
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
   * Obține o operațiune de materiale după ID
   * @param id - ID-ul operațiunii
   * @returns Operațiunea sau eroare
   */
  async getOperationById(id: string): Promise<SupabaseResponse<MaterialOperationWithDetails>> {
    try {
      const { data, error } = await supabase
        .from("material_operations")
        .select(`
          *,
          materials:material_id (name, unit),
          projects:project_id (name),
          profiles:created_by (full_name)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      // Transformăm datele pentru a avea structura dorită
      const transformedData = {
        ...data,
        material_name: data.materials?.name,
        material_unit: data.materials?.unit,
        project_name: data.projects?.name,
        created_by_name: data.profiles?.full_name,
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
   * Creează o operațiune de materiale
   * @param operation - Datele operațiunii
   * @returns Operațiunea creată sau eroare
   */
  async createOperation(
    operation: CreateMaterialOperationInput
  ): Promise<SupabaseResponse<MaterialOperation>> {
    try {
      // Verificăm dacă materialul există
      const { data: material, error: materialError } = await supabase
        .from("materials")
        .select("id, quantity")
        .eq("id", operation.material_id)
        .single();

      if (materialError) throw materialError;
      if (!material) throw new Error("Material not found");

      // Începem o tranzacție pentru a actualiza și cantitatea materialului
      const { data, error } = await supabase.rpc("create_material_operation", {
        p_material_id: operation.material_id,
        p_project_id: operation.project_id,
        p_operation_type: operation.operation_type,
        p_quantity: operation.quantity,
        p_unit_price: operation.unit_price,
        p_location: operation.location,
        p_notes: operation.notes,
        p_qr_code: operation.qr_code,
      });

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
   * Actualizează o operațiune de materiale
   * @param id - ID-ul operațiunii
   * @param operation - Datele actualizate
   * @returns Operațiunea actualizată sau eroare
   */
  async updateOperation(
    id: string,
    operation: UpdateMaterialOperationInput
  ): Promise<SupabaseResponse<MaterialOperation>> {
    try {
      // Obținem operațiunea curentă
      const { data: currentOperation, error: getError } = await supabase
        .from("material_operations")
        .select("*")
        .eq("id", id)
        .single();

      if (getError) throw getError;
      if (!currentOperation) throw new Error("Operation not found");

      // Actualizăm operațiunea și cantitatea materialului într-o tranzacție
      const { data, error } = await supabase.rpc("update_material_operation", {
        p_operation_id: id,
        p_quantity: operation.quantity,
        p_unit_price: operation.unit_price,
        p_location: operation.location,
        p_notes: operation.notes,
        p_qr_code: operation.qr_code,
      });

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
   * Șterge o operațiune de materiale
   * @param id - ID-ul operațiunii
   * @returns Succes sau eroare
   */
  async deleteOperation(id: string): Promise<SupabaseResponse<null>> {
    try {
      // Ștergem operațiunea și actualizăm cantitatea materialului într-o tranzacție
      const { error } = await supabase.rpc("delete_material_operation", {
        p_operation_id: id,
      });

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
   * Obține statistici pentru operațiunile de materiale
   * @param projectId - ID-ul proiectului (opțional)
   * @returns Statistici sau eroare
   */
  async getOperationStats(projectId?: string): Promise<SupabaseResponse<any>> {
    try {
      let query = supabase.rpc("get_material_operation_stats");

      if (projectId) {
        query = query.eq("p_project_id", projectId);
      }

      const { data, error } = await query;

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
   * Exportă operațiunile de materiale în format Excel sau CSV
   * @param format - Formatul exportului (excel sau csv)
   * @param options - Opțiuni pentru filtrare
   * @returns Blob cu datele exportate sau eroare
   */
  async exportOperations(
    format: "excel" | "csv" = "excel",
    options?: {
      projectId?: string;
      materialId?: string;
      operationType?: OperationType;
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<SupabaseResponse<Blob>> {
    try {
      // Construim filtrele
      const filters: Record<string, any> = {};

      if (options?.projectId) {
        filters.project_id = options.projectId;
      }

      if (options?.materialId) {
        filters.material_id = options.materialId;
      }

      if (options?.operationType) {
        filters.operation_type = options.operationType;
      }

      // Exportăm datele
      return enhancedSupabaseService.export<MaterialOperation>("material_operations", format, {
        filters,
        columns: [
          "id",
          "material_id",
          "project_id",
          "operation_type",
          "quantity",
          "unit_price",
          "location",
          "notes",
          "qr_code",
          "created_by",
          "created_at",
        ],
        fileName: `material-operations-export-${new Date().toISOString().split("T")[0]}`,
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
   * Abonează la schimbări în operațiunile de materiale
   * @param callback - Funcția de callback apelată la schimbări
   * @param options - Opțiuni pentru filtrare
   * @returns Obiectul de abonament
   */
  subscribeToOperationChanges(
    callback: (payload: any) => void,
    options?: {
      projectId?: string;
      materialId?: string;
      event?: "INSERT" | "UPDATE" | "DELETE" | "*";
    }
  ) {
    try {
      // Construim filtrele
      const filters: Record<string, any> = {};

      if (options?.projectId) {
        filters.project_id = options.projectId;
      }

      if (options?.materialId) {
        filters.material_id = options.materialId;
      }

      // Creăm abonamentul
      return enhancedSupabaseService.subscribe<MaterialOperation>(
        "material_operations",
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
   * @param subscription - Obiectul de abonament returnat de metoda subscribeToOperationChanges
   */
  unsubscribeFromOperationChanges(subscription: any) {
    enhancedSupabaseService.unsubscribe(subscription);
  },
};

export default materialOperationsService;
