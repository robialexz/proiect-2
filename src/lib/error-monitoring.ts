import { supabase } from "./supabase";

// Error severity levels
export enum ErrorSeverity {
  CRITICAL = "critical",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

// Error sources
export enum ErrorSource {
  CLIENT = "client",
  SERVER = "server",
  DATABASE = "database",
  NETWORK = "network",
  AUTH = "auth",
  UNKNOWN = "unknown",
}

// Error data structure
export interface ErrorData {
  id?: number;
  message: string;
  source: ErrorSource;
  severity: ErrorSeverity;
  stack?: string;
  context?: Record<string, any>;
  user_id?: string;
  timestamp: string;
}

// Interface for error storage
interface ErrorStorage {
  captureError(error: ErrorData): Promise<void>;
  getErrors(limit?: number): Promise<ErrorData[]>;
  clearErrors(): Promise<void>;
}

// Local storage implementation
class LocalErrorStorage implements ErrorStorage {
  private readonly STORAGE_KEY = "app_errors";
  private readonly MAX_ERRORS = 100;

  async captureError(error: ErrorData): Promise<void> {
    try {
      const errors = this.getLocalErrors();
      
      // Add new error with timestamp
      errors.unshift({
        ...error,
        timestamp: error.timestamp || new Date().toISOString(),
      });
      
      // Limit the number of stored errors
      const limitedErrors = errors.slice(0, this.MAX_ERRORS);
      
      // Save back to local storage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedErrors));
    } catch (error) {
      // Removed console statement
    }
  }

  async getErrors(limit = 50): Promise<ErrorData[]> {
    const errors = this.getLocalErrors();
    return errors.slice(0, limit);
  }

  async clearErrors(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private getLocalErrors(): ErrorData[] {
    try {
      const storedErrors = localStorage.getItem(this.STORAGE_KEY);
      return storedErrors ? JSON.parse(storedErrors) : [];
    } catch (error) {
      // Removed console statement
      return [];
    }
  }
}

// Supabase storage implementation
class SupabaseErrorStorage implements ErrorStorage {
  private readonly TABLE_NAME = "error_logs";

  async captureError(error: ErrorData): Promise<void> {
    try {
      // Ensure timestamp is set
      const errorWithTimestamp = {
        ...error,
        timestamp: error.timestamp || new Date().toISOString(),
      };

      // Insert error into Supabase
      const { error: supabaseError } = await supabase
        .from(this.TABLE_NAME)
        .insert([errorWithTimestamp]);

      if (supabaseError) {
        // Doar logăm eroarea fără a o raporta din nou pentru a evita bucla infinită
        // Removed console statement

        // Fallback to local storage
        const localStorage = new LocalErrorStorage();
        await localStorage.captureError(error);
      }

      // Log to console in development
      if (import.meta.env.DEV) {
        // Removed console statement
      }
    } catch (storageError) {
      // Doar logăm eroarea fără a o raporta din nou pentru a evita bucla infinită
      // Removed console statement
      // Removed console statement
    }
  }

  async getErrors(limit = 50): Promise<ErrorData[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) {
        // Removed console statement

        // Fallback to local storage
        const localStorage = new LocalErrorStorage();
        return await localStorage.getErrors(limit);
      }

      return data as ErrorData[];
    } catch (error) {
      // Removed console statement
      return [];
    }
  }

  async clearErrors(): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .gte("id", 0); // Delete all records

      if (error) {
        // Removed console statement
      }
    } catch (error) {
      // Removed console statement
    }
  }
}

// Main error monitoring service
class ErrorMonitoringService {
  private storage: ErrorStorage;
  private static instance: ErrorMonitoringService;

  private constructor(useSupabase = false) {
    // Dezactivăm stocarea în Supabase
    this.storage = useSupabase
      ? new SupabaseErrorStorage()
      : new LocalErrorStorage();
    this.setupGlobalHandlers();
  }

  public static getInstance(useSupabase = false): ErrorMonitoringService {
    // Dezactivăm stocarea în Supabase
    if (!ErrorMonitoringService.instance) {
      ErrorMonitoringService.instance = new ErrorMonitoringService(useSupabase);
    }
    return ErrorMonitoringService.instance;
  }

  private setupGlobalHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.captureError({
        message: `Unhandled Promise Rejection: ${
          event.reason?.message || "Unknown error"
        }`,
        source: ErrorSource.CLIENT,
        severity: ErrorSeverity.ERROR,
        stack: event.reason?.stack,
        context: {
          type: "unhandledrejection",
          reason: event.reason?.toString(),
        },
      });
    });

    // Handle uncaught exceptions
    window.addEventListener("error", (event) => {
      this.captureError({
        message: `Uncaught Exception: ${event.message || "Unknown error"}`,
        source: ErrorSource.CLIENT,
        severity: ErrorSeverity.ERROR,
        stack: event.error?.stack,
        context: {
          type: "uncaughtexception",
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Dezactivăm override-ul console.error pentru a evita bucla infinită
    // Cod comentat pentru a evita erori
  }

  public async captureError(error: ErrorData): Promise<void> {
    await this.storage.captureError(error);
  }

  public async captureException(
    error: Error,
    source = ErrorSource.CLIENT,
    severity = ErrorSeverity.ERROR,
    context?: Record<string, any>,
    userId?: string
  ): Promise<void> {
    await this.storage.captureError({
      message: error.message || "Unknown error",
      source,
      severity,
      stack: error.stack,
      context,
      user_id: userId,
      timestamp: new Date().toISOString(),
    });
  }

  public async getErrors(limit?: number): Promise<ErrorData[]> {
    return await this.storage.getErrors(limit);
  }

  public async clearErrors(): Promise<void> {
    await this.storage.clearErrors();
  }

  public async generateErrorReport(): Promise<Blob> {
    const errors = await this.getErrors(1000);
    const report = {
      generated_at: new Date().toISOString(),
      total_errors: errors.length,
      errors_by_severity: {
        critical: errors.filter((e) => e.severity === ErrorSeverity.CRITICAL)
          .length,
        error: errors.filter((e) => e.severity === ErrorSeverity.ERROR).length,
        warning: errors.filter((e) => e.severity === ErrorSeverity.WARNING)
          .length,
        info: errors.filter((e) => e.severity === ErrorSeverity.INFO).length,
      },
      errors_by_source: {
        client: errors.filter((e) => e.source === ErrorSource.CLIENT).length,
        server: errors.filter((e) => e.source === ErrorSource.SERVER).length,
        database: errors.filter((e) => e.source === ErrorSource.DATABASE)
          .length,
        network: errors.filter((e) => e.source === ErrorSource.NETWORK).length,
        auth: errors.filter((e) => e.source === ErrorSource.AUTH).length,
        unknown: errors.filter((e) => e.source === ErrorSource.UNKNOWN).length,
      },
      errors: errors,
    };

    return new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
  }
}

// Export singleton instance
export const errorMonitoring = ErrorMonitoringService.getInstance();

// Export helper functions
export function captureError(
  message: string,
  source = ErrorSource.CLIENT,
  severity = ErrorSeverity.ERROR,
  context?: Record<string, any>,
  userId?: string
): void {
  errorMonitoring.captureError({
    message,
    source,
    severity,
    context,
    user_id: userId,
    timestamp: new Date().toISOString(),
  });
}

export function captureException(
  error: Error,
  source = ErrorSource.CLIENT,
  severity = ErrorSeverity.ERROR,
  context?: Record<string, any>,
  userId?: string
): void {
  errorMonitoring.captureException(error, source, severity, context, userId);
}

// Import ErrorBoundary from components
export { ErrorBoundary } from "@/components/ErrorBoundary";

export default errorMonitoring;
