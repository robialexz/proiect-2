import { supabase } from "./supabase";
import { errorHandler } from "./error-handler";
import { enhancedSupabaseService } from "./enhanced-supabase-service";
import type { SupabaseResponse } from "../services/api/supabase-service";
import {
  QRCode,
  QRCodeWithDetails,
  CreateQRCodeInput,
  UpdateQRCodeInput,
  QRCodeType,
  QRScanResult
} from "../models/qr-code.model";
import { v4 as uuidv4 } from "uuid";

/**
 * Serviciu pentru gestionarea codurilor QR
 */
export const qrCodeService = {
  /**
   * Obține toate codurile QR
   * @param options - Opțiuni pentru filtrare și ordonare
   * @returns Lista de coduri QR sau eroare
   */
  async getQRCodes(options?: {
    type?: QRCodeType;
    referenceId?: string;
    code?: string;
    orderBy?: { column: string; ascending?: boolean };
    page?: number;
    pageSize?: number;
  }): Promise<SupabaseResponse<QRCodeWithDetails[]>> {
    try {
      // Construim filtrele
      const filters: Record<string, any> = {};

      if (options?.type) {
        filters.type = options.type;
      }

      if (options?.referenceId) {
        filters.reference_id = options.referenceId;
      }

      if (options?.code) {
        filters.code = options.code;
      }

      // Pentru filtrare
      let query = supabase
        .from("qr_codes")
        .select("*");

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

      // Obținem informații suplimentare pentru fiecare cod QR
      const detailedData = await Promise.all(
        data.map(async (qrCode) => {
          let referenceName = "";
          let referenceType = "";

          // În funcție de tipul codului QR, obținem informații despre referință
          if (qrCode.type === "material") {
            const { data: material } = await supabase
              .from("materials")
              .select("name")
              .eq("id", qrCode.reference_id)
              .single();
            
            if (material) {
              referenceName = material.name;
              referenceType = "Material";
            }
          } else if (qrCode.type === "equipment") {
            const { data: equipment } = await supabase
              .from("equipment")
              .select("name")
              .eq("id", qrCode.reference_id)
              .single();
            
            if (equipment) {
              referenceName = equipment.name;
              referenceType = "Equipment";
            }
          } else if (qrCode.type === "pallet") {
            const { data: pallet } = await supabase
              .from("pallets")
              .select("code")
              .eq("id", qrCode.reference_id)
              .single();
            
            if (pallet) {
              referenceName = `Pallet ${pallet.code}`;
              referenceType = "Pallet";
            }
          } else if (qrCode.type === "location") {
            const { data: location } = await supabase
              .from("locations")
              .select("name")
              .eq("id", qrCode.reference_id)
              .single();
            
            if (location) {
              referenceName = location.name;
              referenceType = "Location";
            }
          }

          return {
            ...qrCode,
            reference_name: referenceName,
            reference_type: referenceType,
          };
        })
      );

      return {
        data: detailedData,
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
   * Obține un cod QR după ID
   * @param id - ID-ul codului QR
   * @returns Codul QR sau eroare
   */
  async getQRCodeById(id: string): Promise<SupabaseResponse<QRCodeWithDetails>> {
    try {
      const { data, error } = await supabase
        .from("qr_codes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Obținem informații suplimentare despre referință
      let referenceName = "";
      let referenceType = "";

      // În funcție de tipul codului QR, obținem informații despre referință
      if (data.type === "material") {
        const { data: material } = await supabase
          .from("materials")
          .select("name")
          .eq("id", data.reference_id)
          .single();
        
        if (material) {
          referenceName = material.name;
          referenceType = "Material";
        }
      } else if (data.type === "equipment") {
        const { data: equipment } = await supabase
          .from("equipment")
          .select("name")
          .eq("id", data.reference_id)
          .single();
        
        if (equipment) {
          referenceName = equipment.name;
          referenceType = "Equipment";
        }
      } else if (data.type === "pallet") {
        const { data: pallet } = await supabase
          .from("pallets")
          .select("code")
          .eq("id", data.reference_id)
          .single();
        
        if (pallet) {
          referenceName = `Pallet ${pallet.code}`;
          referenceType = "Pallet";
        }
      } else if (data.type === "location") {
        const { data: location } = await supabase
          .from("locations")
          .select("name")
          .eq("id", data.reference_id)
          .single();
        
        if (location) {
          referenceName = location.name;
          referenceType = "Location";
        }
      }

      return {
        data: {
          ...data,
          reference_name: referenceName,
          reference_type: referenceType,
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
   * Obține un cod QR după codul său
   * @param code - Codul QR
   * @returns Codul QR sau eroare
   */
  async getQRCodeByCode(code: string): Promise<SupabaseResponse<QRCodeWithDetails>> {
    try {
      const { data, error } = await supabase
        .from("qr_codes")
        .select("*")
        .eq("code", code)
        .single();

      if (error) throw error;

      // Obținem informații suplimentare despre referință
      let referenceName = "";
      let referenceType = "";

      // În funcție de tipul codului QR, obținem informații despre referință
      if (data.type === "material") {
        const { data: material } = await supabase
          .from("materials")
          .select("name")
          .eq("id", data.reference_id)
          .single();
        
        if (material) {
          referenceName = material.name;
          referenceType = "Material";
        }
      } else if (data.type === "equipment") {
        const { data: equipment } = await supabase
          .from("equipment")
          .select("name")
          .eq("id", data.reference_id)
          .single();
        
        if (equipment) {
          referenceName = equipment.name;
          referenceType = "Equipment";
        }
      } else if (data.type === "pallet") {
        const { data: pallet } = await supabase
          .from("pallets")
          .select("code")
          .eq("id", data.reference_id)
          .single();
        
        if (pallet) {
          referenceName = `Pallet ${pallet.code}`;
          referenceType = "Pallet";
        }
      } else if (data.type === "location") {
        const { data: location } = await supabase
          .from("locations")
          .select("name")
          .eq("id", data.reference_id)
          .single();
        
        if (location) {
          referenceName = location.name;
          referenceType = "Location";
        }
      }

      return {
        data: {
          ...data,
          reference_name: referenceName,
          reference_type: referenceType,
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
   * Creează un cod QR
   * @param qrCode - Datele codului QR
   * @returns Codul QR creat sau eroare
   */
  async createQRCode(
    qrCode: CreateQRCodeInput
  ): Promise<SupabaseResponse<QRCode>> {
    try {
      // Generăm un cod unic dacă nu este furnizat
      const code = qrCode.code || `${qrCode.type.substring(0, 3).toUpperCase()}-${uuidv4().substring(0, 8)}`;

      const { data, error } = await supabase
        .from("qr_codes")
        .insert({
          code,
          type: qrCode.type,
          reference_id: qrCode.reference_id,
          data: qrCode.data,
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
   * Actualizează un cod QR
   * @param id - ID-ul codului QR
   * @param qrCode - Datele actualizate
   * @returns Codul QR actualizat sau eroare
   */
  async updateQRCode(
    id: string,
    qrCode: UpdateQRCodeInput
  ): Promise<SupabaseResponse<QRCode>> {
    try {
      const { data, error } = await supabase
        .from("qr_codes")
        .update({
          data: qrCode.data,
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
   * Șterge un cod QR
   * @param id - ID-ul codului QR
   * @returns Succes sau eroare
   */
  async deleteQRCode(id: string): Promise<SupabaseResponse<null>> {
    try {
      const { error } = await supabase
        .from("qr_codes")
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
   * Scanează un cod QR
   * @param code - Codul QR
   * @returns Rezultatul scanării
   */
  async scanQRCode(code: string): Promise<SupabaseResponse<QRScanResult>> {
    try {
      const { data, error } = await supabase
        .from("qr_codes")
        .select("*")
        .eq("code", code)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Codul nu a fost găsit
          return {
            data: {
              code,
              found: false,
              error: "QR code not found",
            },
            error: null,
            status: "success",
          };
        }
        throw error;
      }

      // Obținem informații suplimentare despre referință
      let referenceName = "";
      let referenceType = "";

      // În funcție de tipul codului QR, obținem informații despre referință
      if (data.type === "material") {
        const { data: material } = await supabase
          .from("materials")
          .select("name")
          .eq("id", data.reference_id)
          .single();
        
        if (material) {
          referenceName = material.name;
          referenceType = "Material";
        }
      } else if (data.type === "equipment") {
        const { data: equipment } = await supabase
          .from("equipment")
          .select("name")
          .eq("id", data.reference_id)
          .single();
        
        if (equipment) {
          referenceName = equipment.name;
          referenceType = "Equipment";
        }
      } else if (data.type === "pallet") {
        const { data: pallet } = await supabase
          .from("pallets")
          .select("code")
          .eq("id", data.reference_id)
          .single();
        
        if (pallet) {
          referenceName = `Pallet ${pallet.code}`;
          referenceType = "Pallet";
        }
      } else if (data.type === "location") {
        const { data: location } = await supabase
          .from("locations")
          .select("name")
          .eq("id", data.reference_id)
          .single();
        
        if (location) {
          referenceName = location.name;
          referenceType = "Location";
        }
      }

      return {
        data: {
          code,
          found: true,
          qrCode: {
            ...data,
            reference_name: referenceName,
            reference_type: referenceType,
          },
        },
        error: null,
        status: "success",
      };
    } catch (error) {
      errorHandler.handleError(error, false);
      return {
        data: {
          code,
          found: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        error: null,
        status: "error",
      };
    }
  },

  /**
   * Generează o imagine QR pentru un cod
   * @param code - Codul QR
   * @param options - Opțiuni pentru generarea imaginii
   * @returns URL-ul imaginii sau eroare
   */
  async generateQRImage(
    code: string,
    options?: {
      size?: number;
      margin?: number;
      color?: string;
      backgroundColor?: string;
    }
  ): Promise<SupabaseResponse<string>> {
    try {
      // Construim URL-ul pentru generarea imaginii QR
      const size = options?.size || 200;
      const margin = options?.margin || 4;
      const color = options?.color || "000000";
      const backgroundColor = options?.backgroundColor || "FFFFFF";

      // Folosim un serviciu extern pentru generarea imaginii QR
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
        code
      )}&size=${size}x${size}&margin=${margin}&color=${color.replace(
        "#",
        ""
      )}&bgcolor=${backgroundColor.replace("#", "")}`;

      return {
        data: qrImageUrl,
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
   * Generează coduri QR în masă pentru materiale
   * @param materialIds - ID-urile materialelor
   * @returns Codurile QR generate sau eroare
   */
  async generateBulkQRCodes(
    materialIds: string[]
  ): Promise<SupabaseResponse<QRCode[]>> {
    try {
      // Verificăm dacă materialele există
      const { data: materials, error: materialsError } = await supabase
        .from("materials")
        .select("id")
        .in("id", materialIds);

      if (materialsError) throw materialsError;

      // Generăm coduri QR pentru fiecare material
      const qrCodes = materials.map((material) => ({
        type: "material" as QRCodeType,
        reference_id: material.id,
        code: `MAT-${uuidv4().substring(0, 8)}`,
      }));

      // Inserăm codurile QR în baza de date
      const { data, error } = await supabase
        .from("qr_codes")
        .insert(qrCodes)
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
   * Exportă codurile QR în format Excel sau CSV
   * @param format - Formatul exportului (excel sau csv)
   * @param options - Opțiuni pentru filtrare
   * @returns Blob cu datele exportate sau eroare
   */
  async exportQRCodes(
    format: "excel" | "csv" = "excel",
    options?: {
      type?: QRCodeType;
      referenceId?: string;
    }
  ): Promise<SupabaseResponse<Blob>> {
    try {
      // Construim filtrele
      const filters: Record<string, any> = {};

      if (options?.type) {
        filters.type = options.type;
      }

      if (options?.referenceId) {
        filters.reference_id = options.referenceId;
      }

      // Exportăm datele
      return enhancedSupabaseService.export<QRCode>("qr_codes", format, {
        filters,
        columns: [
          "id",
          "code",
          "type",
          "reference_id",
          "data",
          "created_at",
        ],
        fileName: `qr-codes-export-${new Date().toISOString().split("T")[0]}`,
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
};

export default qrCodeService;
