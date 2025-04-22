/**
 * Model pentru coduri QR
 */

export type QRCodeType = "material" | "equipment" | "pallet" | "location";

export interface QRCode {
  id: string;
  code: string;
  type: QRCodeType;
  reference_id: string;
  data?: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

/**
 * Model pentru coduri QR cu informații suplimentare
 */
export interface QRCodeWithDetails extends QRCode {
  reference_name?: string;
  reference_type?: string;
}

/**
 * Input pentru crearea unui cod QR
 */
export interface CreateQRCodeInput {
  type: QRCodeType;
  reference_id: string;
  data?: Record<string, any>;
  code?: string; // Opțional, se generează automat dacă nu este furnizat
}

/**
 * Input pentru actualizarea unui cod QR
 */
export interface UpdateQRCodeInput {
  data?: Record<string, any>;
}

/**
 * Filtre pentru coduri QR
 */
export interface QRCodeFilter {
  type?: QRCodeType;
  reference_id?: string;
  code?: string;
}

/**
 * Sortare pentru coduri QR
 */
export interface QRCodeSort {
  field: keyof QRCode;
  direction: "asc" | "desc";
}

/**
 * Paginare pentru coduri QR
 */
export interface QRCodePagination {
  page: number;
  limit: number;
  total?: number;
}

/**
 * Model pentru opțiuni de generare a imaginii QR
 */
export interface QRCodeImageOptions {
  size?: number;
  color?: string;
  backgroundColor?: string;
  margin?: number;
  format?: "png" | "svg" | "jpeg";
}

/**
 * Rezultat scanare cod QR
 */
export interface QRScanResult {
  code: string;
  found: boolean;
  qrCode?: QRCodeWithDetails;
  error?: string;
}
