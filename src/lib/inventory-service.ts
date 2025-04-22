import { enhancedSupabaseService } from "./enhanced-supabase-service";
import type { SupabaseResponse } from "../services/api/supabase-service";
import { errorHandler } from "./error-handler";
import { dataLoader } from "./data-loader";
import { Material, LowStockItem } from "../types";
import { supabase } from "./supabase";

/**
 * Serviciu specializat pentru gestionarea inventarului
 * Oferă metode specifice pentru operațiuni legate de materiale și inventar
 */
export const inventoryService = {
  /**
   * Obține toate materialele
   * @param options - Opțiuni pentru filtrare și ordonare
   * @returns Lista de materiale sau eroare
   */
  async getItems(options?: {
    projectId?: string;
    category?: string;
    searchTerm?: string;
    orderBy?: { column: string; ascending?: boolean };
    page?: number;
    pageSize?: number;
  }): Promise<SupabaseResponse<Material[]>> {
    try {
      // Construim filtrele
      const filters: Record<string, any> = {};

      if (options?.projectId) {
        filters.project_id = options.projectId;
      }

      if (options?.category) {
        filters.category = options.category;
      }

      // Dacă avem termen de căutare, folosim custom query
      if (options?.searchTerm) {
        return enhancedSupabaseService.custom<Material[]>((supabase) =>
          supabase
            .from("materials")
            .select("*")
            .or(
              `name.ilike.%${options.searchTerm}%,category.ilike.%${options.searchTerm}%,notes.ilike.%${options.searchTerm}%`
            )
            .order(options?.orderBy?.column || "name", {
              ascending: options?.orderBy?.ascending ?? true,
            })
        );
      }

      // Dacă avem paginare, folosim paginate
      if (options?.page !== undefined && options?.pageSize !== undefined) {
        const result = await enhancedSupabaseService.paginate<Material>(
          "materials",
          "*",
          options.page,
          options.pageSize,
          {
            filters,
            order: options?.orderBy,
          }
        );

        // Transformăm rezultatul pentru a fi compatibil cu SupabaseResponse
        return {
          data: result.data,
          error: result.error,
          status: result.status,
        };
      }

      // Altfel, folosim select normal
      return enhancedSupabaseService.select<Material[]>("materials", "*", {
        filters,
        order: options?.orderBy,
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
   * Obține un material după ID
   * @param id - ID-ul materialului
   * @returns Materialul sau eroare
   */
  async getItemById(id: string): Promise<SupabaseResponse<Material>> {
    try {
      return enhancedSupabaseService.select<Material>("materials", "*", {
        filters: { id },
        single: true,
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
   * Creează un material nou
   * @param material - Datele materialului
   * @returns Materialul creat sau eroare
   */
  async createItem(
    material: Partial<Material>
  ): Promise<SupabaseResponse<Material>> {
    try {
      return enhancedSupabaseService.insert<Material>("materials", material);
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
   * Actualizează un material existent
   * @param id - ID-ul materialului
   * @param material - Datele actualizate
   * @returns Materialul actualizat sau eroare
   */
  async updateItem(
    id: string,
    material: Partial<Material>
  ): Promise<SupabaseResponse<Material>> {
    try {
      return enhancedSupabaseService.update<Material>("materials", material, {
        id,
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
   * Șterge un material
   * @param id - ID-ul materialului
   * @returns Materialul șters sau eroare
   */
  async deleteItem(id: string): Promise<SupabaseResponse<Material>> {
    try {
      return enhancedSupabaseService.delete<Material>("materials", { id });
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
   * Obține materialele cu stoc scăzut
   * @param threshold - Pragul pentru stoc scăzut (opțional, implicit folosește min_stock_level)
   * @returns Lista de materiale cu stoc scăzut sau eroare
   */
  async getLowStockItems(
    threshold?: number
  ): Promise<SupabaseResponse<LowStockItem[]>> {
    try {
      if (threshold !== undefined) {
        // Folosim un prag specific
        return enhancedSupabaseService.custom<LowStockItem[]>((supabase) =>
          supabase
            .from("materials")
            .select("*")
            .lt("quantity", threshold)
            .order("quantity")
        );
      } else {
        // Folosim min_stock_level din fiecare material
        return enhancedSupabaseService.custom<LowStockItem[]>((supabase) =>
          supabase
            .from("materials")
            .select("*")
            .not("min_stock_level", "is", null)
            .lt("quantity", supabase.raw("min_stock_level"))
            .order("quantity")
        );
      }
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
   * Actualizează cantitatea suplimentară a unui material
   * @param id - ID-ul materialului
   * @param quantity - Noua cantitate suplimentară
   * @returns Materialul actualizat sau eroare
   */
  async updateSuplimentar(
    id: string,
    quantity: number
  ): Promise<SupabaseResponse<Material>> {
    try {
      return enhancedSupabaseService.update<Material>(
        "materials",
        { suplimentar: quantity },
        { id }
      );
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
   * Confirmă cantitatea suplimentară și o adaugă la cantitatea totală
   * @param id - ID-ul materialului
   * @returns Materialul actualizat sau eroare
   */
  async confirmSuplimentar(id: string): Promise<SupabaseResponse<Material>> {
    try {
      // Obținem materialul curent
      const { data: material, error } = await this.getItemById(id);

      if (error || !material) {
        throw new Error(error?.message || "Material not found");
      }

      // Calculăm noua cantitate
      const newQuantity =
        (material.quantity || 0) + (material.suplimentar || 0);

      // Actualizăm materialul
      return enhancedSupabaseService.update<Material>(
        "materials",
        {
          quantity: newQuantity,
          suplimentar: 0,
        },
        { id }
      );
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
   * Generează o listă de recomandări pentru reaprovizionare
   * @returns Lista de materiale recomandate pentru reaprovizionare sau eroare
   */
  async generateReorderList(): Promise<SupabaseResponse<Material[]>> {
    try {
      // Obținem materialele cu stoc scăzut
      const { data: lowStockItems, error } = await this.getLowStockItems();

      if (error) {
        throw new Error(error.message);
      }

      // Filtrăm materialele care au deja cantitate suplimentară
      const reorderItems =
        lowStockItems?.filter(
          (item) => !item.suplimentar || item.suplimentar === 0
        ) || [];

      return {
        data: reorderItems,
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
   * Exportă inventarul în format CSV sau JSON
   * @param format - Formatul de export (csv sau json)
   * @param options - Opțiuni suplimentare (filtre, etc.)
   * @returns Blob cu datele exportate sau eroare
   */
  async exportInventory(
    format: "csv" | "json" = "csv",
    options?: {
      projectId?: string;
      category?: string;
    }
  ): Promise<SupabaseResponse<Blob>> {
    try {
      // Construim filtrele
      const filters: Record<string, any> = {};

      if (options?.projectId) {
        filters.project_id = options.projectId;
      }

      if (options?.category) {
        filters.category = options.category;
      }

      // Exportăm datele
      return enhancedSupabaseService.export<Material>("materials", format, {
        filters,
        columns: [
          "id",
          "name",
          "dimension",
          "unit",
          "quantity",
          "manufacturer",
          "category",
          "cost_per_unit",
          "supplier_id",
          "location",
          "min_stock_level",
          "max_stock_level",
          "notes",
        ],
        fileName: `inventory-export-${new Date().toISOString().split("T")[0]}`,
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
   * Abonează la schimbări în timp real pentru materiale
   * @param callback - Funcția de callback apelată când se primesc date noi
   * @param options - Opțiuni suplimentare (filtre, etc.)
   * @returns Obiectul de abonament care poate fi folosit pentru dezabonare
   */
  subscribeToInventoryChanges(
    callback: (payload: {
      new: Material | null;
      old: Material | null;
      eventType: "INSERT" | "UPDATE" | "DELETE";
    }) => void,
    options?: {
      projectId?: string;
      event?: "INSERT" | "UPDATE" | "DELETE" | "*";
    }
  ) {
    try {
      // Construim filtrele
      const filters: Record<string, any> = {};

      if (options?.projectId) {
        filters.project_id = options.projectId;
      }

      // Creăm abonamentul
      return enhancedSupabaseService.subscribe<Material>(
        "materials",
        options?.event || "*",
        callback,
        filters
      );
    } catch (error) {
      errorHandler.handleError(error, false);
      // Removed console statement

      // Returnăm un obiect de abonament fals pentru a evita erorile
      return {
        unsubscribe: () => {},
      };
    }
  },

  /**
   * Dezabonează de la un abonament
   * @param subscription - Obiectul de abonament returnat de metoda subscribeToInventoryChanges
   */
  unsubscribeFromInventoryChanges(subscription: any) {
    enhancedSupabaseService.unsubscribe(subscription);
  },

  /**
   * Importă materiale din Excel sau CSV
   * @param formData - FormData cu fișierul de import
   * @returns Rezultatul importului
   */
  async importInventory(
    formData: FormData
  ): Promise<SupabaseResponse<{ imported: number; errors: any[] }>> {
    try {
      // Trimitem fișierul către edge function
      const { data, error } = await supabase.functions.invoke(
        "import-inventory",
        {
          body: formData,
        }
      );

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
   * Previzualizează importul de materiale
   * @param formData - FormData cu fișierul de import
   * @returns Previzualizarea datelor
   */
  async previewImport(formData: FormData): Promise<SupabaseResponse<any[]>> {
    try {
      // Trimitem fișierul către edge function
      const { data, error } = await supabase.functions.invoke(
        "preview-import",
        {
          body: formData,
        }
      );

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
   * Descarcă șablonul pentru import
   * @param format - Formatul șablonului (xlsx sau csv)
   */
  downloadTemplate(format: "xlsx" | "csv" = "xlsx") {
    // URL-ul către șablonul static
    const templateUrl = `/templates/inventory-template.${format}`;

    // Creăm un link și simulăm click pentru descărcare
    const a = document.createElement("a");
    a.href = templateUrl;
    a.download = `inventory-template.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },
};

export default inventoryService;
