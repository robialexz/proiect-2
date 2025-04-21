import { supabase } from "./supabase";

// Define error severity levels
export enum ErrorSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

// Define error source types
export enum ErrorSource {
  CLIENT = "client",
  SERVER = "server",
  DATABASE = "database",
  NETWORK = "network",
  AUTH = "auth",
  UNKNOWN = "unknown",
}

// Define error data structure
export interface ErrorData {
  message: string;
  source: ErrorSource;
  severity: ErrorSeverity;
  stack?: string;
  context?: Record<string, any>;
  user_id?: string;
  timestamp?: string;
}

// Define error storage interface
export interface ErrorStorage {
  captureError(error: ErrorData): Promise<void>;
  getErrors(limit?: number): Promise<ErrorData[]>;
  clearErrors(): Promise<void>;
}

// Local storage implementation for error storage
class LocalErrorStorage implements ErrorStorage {
  private readonly STORAGE_KEY = "app_error_logs";

  async captureError(error: ErrorData): Promise<void> {
    try {
      // Add timestamp if not provided
      if (!error.timestamp) {
        error.timestamp = new Date().toISOString();
      }

      // Get existing errors
      const existingErrorsJson = localStorage.getItem(this.STORAGE_KEY);
      const existingErrors: ErrorData[] = existingErrorsJson
        ? JSON.parse(existingErrorsJson)
        : [];

      // Add new error
      existingErrors.unshift(error);

      // Limit to 100 errors to prevent storage issues
      const limitedErrors = existingErrors.slice(0, 100);

      // Save back to storage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedErrors));

      // Log to console in development
      if (import.meta.env.DEV) {
        // Removed console statement
      }
    } catch (storageError) {
      // Fallback to console if localStorage fails
      // Removed console statement
      // Removed console statement
    }
  }

  async getErrors(limit = 50): Promise<ErrorData[]> {
    const errorsJson = localStorage.getItem(this.STORAGE_KEY);
    if (!errorsJson) return [];

    const errors: ErrorData[] = JSON.parse(errorsJson);
    return errors.slice(0, limit);
  }

  async clearErrors(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Supabase implementation for error storage
class SupabaseErrorStorage implements ErrorStorage {
  private readonly TABLE_NAME = "error_logs";

  async captureError(error: ErrorData): Promise<void> {
    try {
      // Add timestamp if not provided
      if (!error.timestamp) {
        error.timestamp = new Date().toISOString();
      }

      // Insert error into Supabase
      try {
      const { error: supabaseError } = await supabase
      } catch (error) {
        // Handle error appropriately
      }
        .from(this.TABLE_NAME)
        .insert([error]);

      if (supabaseError) {
        // Doar logăm eroarea fără a o raporta din nou pentru a evita bucla infinită
        // Removed console statement

        // Fallback to local storage
        const localStorage = new LocalErrorStorage();
        try {
        await localStorage.captureError(error);
        } catch (error) {
          // Handle error appropriately
        }
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
        try {
        return await localStorage.getErrors(limit);
        } catch (error) {
          // Handle error appropriately
        }
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
    
    
    //   // Call original console.error
    

    //   // Capture the error
    //   const errorMessage = args
    //     .map((arg) =>
    //       typeof arg === "object" ? JSON.stringify(arg) : String(arg)
    //     )
    //     .join(" ");

    
    `,
    //     source: ErrorSource.CLIENT,
    //     severity: ErrorSeverity.WARNING,
    
    //       type: "console.error",
    //       args: args.map((arg) => String(arg)),
    //     },
    //   });
    // };
  }

  public async captureError(error: ErrorData): Promise<void> {
    try {
    await this.storage.captureError(error);
    } catch (error) {
      // Handle error appropriately
    }
  }

  public async captureException(
    error: Error,
    source = ErrorSource.CLIENT,
    severity = ErrorSeverity.ERROR,
    context?: Record<string, any>,
    userId?: string
  ): Promise<void> {
    try {
    await this.storage.captureError({
    } catch (error) {
      // Handle error appropriately
    }
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
    try {
    return await this.storage.getErrors(limit);
    } catch (error) {
      // Handle error appropriately
    }
  }

  public async clearErrors(): Promise<void> {
    try {
    await this.storage.clearErrors();
    } catch (error) {
      // Handle error appropriately
    }
  }

  public async generateErrorReport(): Promise<Blob> {
    try {
    const errors = await this.getErrors(1000);
    } catch (error) {
      // Handle error appropriately
    }
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
