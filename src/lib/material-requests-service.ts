import { supabase } from "./supabase";
import { errorHandler } from "./error-handler";
import { enhancedSupabaseService } from "./enhanced-supabase-service";
import type { SupabaseResponse } from "../services/api/supabase-service";
import {
  MaterialRequest,
  MaterialRequestWithDetails,
  MaterialRequestItem,
  MaterialRequestItemWithDetails,
  MaterialRequestApproval,
  CreateMaterialRequestInput,
  UpdateMaterialRequestInput,
  ApproveMaterialRequestInput,
  RequestStatus,
  RequestPriority
} from "../models/material-request.model";

/**
 * Serviciu pentru gestionarea cererilor de materiale
 */
export const materialRequestsService = {
  /**
   * Obține toate cererile de materiale
   * @param options - Opțiuni pentru filtrare și ordonare
   * @returns Lista de cereri sau eroare
   */
  async getRequests(options?: {
    projectId?: string;
    requesterId?: string;
    status?: RequestStatus;
    priority?: RequestPriority;
    dateFrom?: string;
    dateTo?: string;
    orderBy?: { column: string; ascending?: boolean };
    page?: number;
    pageSize?: number;
  }): Promise<SupabaseResponse<MaterialRequestWithDetails[]>> {
    try {
      // Construim filtrele
      const filters: Record<string, any> = {};

      if (options?.projectId) {
        filters.project_id = options.projectId;
      }

      if (options?.requesterId) {
        filters.requester_id = options.requesterId;
      }

      if (options?.status) {
        filters.status = options.status;
      }

      if (options?.priority) {
        filters.priority = options.priority;
      }

      // Pentru filtrare după dată
      let query = supabase
        .from("material_requests")
        .select(`
          *,
          projects:project_id (name),
          profiles:requester_id (full_name)
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
        project_name: item.projects?.name,
        requester_name: item.profiles?.full_name,
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
   * Obține o cerere de materiale după ID, inclusiv elementele și aprobările
   * @param id - ID-ul cererii
   * @returns Cererea sau eroare
   */
  async getRequestById(id: string): Promise<SupabaseResponse<MaterialRequestWithDetails>> {
    try {
      // Obținem cererea
      const { data: request, error: requestError } = await supabase
        .from("material_requests")
        .select(`
          *,
          projects:project_id (name),
          profiles:requester_id (full_name)
        `)
        .eq("id", id)
        .single();

      if (requestError) throw requestError;

      // Obținem elementele cererii
      const { data: items, error: itemsError } = await supabase
        .from("material_request_items")
        .select(`
          *,
          materials:material_id (name, unit, category)
        `)
        .eq("request_id", id);

      if (itemsError) throw itemsError;

      // Obținem aprobările cererii
      const { data: approvals, error: approvalsError } = await supabase
        .from("material_request_approvals")
        .select(`
          *,
          profiles:approver_id (full_name)
        `)
        .eq("request_id", id);

      if (approvalsError) throw approvalsError;

      // Transformăm datele pentru a avea structura dorită
      const transformedItems = items.map((item: any) => ({
        ...item,
        material_name: item.materials?.name,
        material_unit: item.materials?.unit,
        material_category: item.materials?.category,
      }));

      const transformedApprovals = approvals.map((approval: any) => ({
        ...approval,
        approver_name: approval.profiles?.full_name,
      }));

      const transformedRequest = {
        ...request,
        project_name: request.projects?.name,
        requester_name: request.profiles?.full_name,
        items: transformedItems,
        approvals: transformedApprovals,
      };

      return {
        data: transformedRequest,
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
   * Creează o cerere de materiale
   * @param request - Datele cererii
   * @returns Cererea creată sau eroare
   */
  async createRequest(
    request: CreateMaterialRequestInput
  ): Promise<SupabaseResponse<MaterialRequestWithDetails>> {
    try {
      // Începem o tranzacție pentru a crea cererea și elementele sale
      const { data, error } = await supabase.rpc("create_material_request", {
        p_project_id: request.project_id,
        p_priority: request.priority,
        p_needed_by_date: request.needed_by_date,
        p_notes: request.notes,
        p_items: request.items,
      });

      if (error) throw error;

      // Obținem cererea creată cu toate detaliile
      return this.getRequestById(data.id);
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
   * Actualizează o cerere de materiale
   * @param id - ID-ul cererii
   * @param request - Datele actualizate
   * @returns Cererea actualizată sau eroare
   */
  async updateRequest(
    id: string,
    request: UpdateMaterialRequestInput
  ): Promise<SupabaseResponse<MaterialRequest>> {
    try {
      const { data, error } = await supabase
        .from("material_requests")
        .update({
          priority: request.priority,
          needed_by_date: request.needed_by_date,
          notes: request.notes,
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
   * Aprobă sau respinge o cerere de materiale
   * @param id - ID-ul cererii
   * @param approval - Datele aprobării
   * @returns Aprobarea creată sau eroare
   */
  async approveRequest(
    id: string,
    approval: ApproveMaterialRequestInput
  ): Promise<SupabaseResponse<MaterialRequestApproval>> {
    try {
      // Începem o tranzacție pentru a crea aprobarea și a actualiza elementele cererii
      const { data, error } = await supabase.rpc("approve_material_request", {
        p_request_id: id,
        p_status: approval.status,
        p_notes: approval.notes,
        p_items: approval.items,
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
   * Marchează o cerere de materiale ca finalizată
   * @param id - ID-ul cererii
   * @returns Cererea actualizată sau eroare
   */
  async completeRequest(id: string): Promise<SupabaseResponse<MaterialRequest>> {
    try {
      const { data, error } = await supabase
        .from("material_requests")
        .update({
          status: "completed",
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
   * Șterge o cerere de materiale
   * @param id - ID-ul cererii
   * @returns Succes sau eroare
   */
  async deleteRequest(id: string): Promise<SupabaseResponse<null>> {
    try {
      const { error } = await supabase
        .from("material_requests")
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
   * Obține statistici pentru cererile de materiale
   * @param projectId - ID-ul proiectului (opțional)
   * @returns Statistici sau eroare
   */
  async getRequestStats(projectId?: string): Promise<SupabaseResponse<any>> {
    try {
      let query = supabase.rpc("get_material_request_stats");

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
   * Exportă cererile de materiale în format Excel sau CSV
   * @param format - Formatul exportului (excel sau csv)
   * @param options - Opțiuni pentru filtrare
   * @returns Blob cu datele exportate sau eroare
   */
  async exportRequests(
    format: "excel" | "csv" = "excel",
    options?: {
      projectId?: string;
      status?: RequestStatus;
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

      if (options?.status) {
        filters.status = options.status;
      }

      // Exportăm datele
      return enhancedSupabaseService.export<MaterialRequest>("material_requests", format, {
        filters,
        columns: [
          "id",
          "project_id",
          "requester_id",
          "status",
          "priority",
          "needed_by_date",
          "notes",
          "created_at",
        ],
        fileName: `material-requests-export-${new Date().toISOString().split("T")[0]}`,
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
   * Abonează la schimbări în cererile de materiale
   * @param callback - Funcția de callback apelată la schimbări
   * @param options - Opțiuni pentru filtrare
   * @returns Obiectul de abonament
   */
  subscribeToRequestChanges(
    callback: (payload: any) => void,
    options?: {
      projectId?: string;
      requesterId?: string;
      event?: "INSERT" | "UPDATE" | "DELETE" | "*";
    }
  ) {
    try {
      // Construim filtrele
      const filters: Record<string, any> = {};

      if (options?.projectId) {
        filters.project_id = options.projectId;
      }

      if (options?.requesterId) {
        filters.requester_id = options.requesterId;
      }

      // Creăm abonamentul
      return enhancedSupabaseService.subscribe<MaterialRequest>(
        "material_requests",
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
   * @param subscription - Obiectul de abonament returnat de metoda subscribeToRequestChanges
   */
  unsubscribeFromRequestChanges(subscription: any) {
    enhancedSupabaseService.unsubscribe(subscription);
  },
};

export default materialRequestsService;
