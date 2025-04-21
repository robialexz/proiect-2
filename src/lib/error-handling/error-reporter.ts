/**
 * Sistem de raportare a erorilor
 * Acest fișier conține funcționalitatea pentru raportarea erorilor
 */

import { supabase } from '@/lib/supabase';
import { 
  AppError, 
  ErrorSeverity, 
  ErrorSource, 
  ErrorType,
  shouldReportError,
  normalizeError
} from './error-types';

// Interfața pentru raportul de eroare
interface ErrorReport {
  id?: string;
  message: string;
  code?: string;
  source: ErrorSource;
  type: ErrorType;
  severity: ErrorSeverity;
  timestamp: string;
  user_id?: string;
  session_id?: string;
  url?: string;
  user_agent?: string;
  context?: Record<string, any>;
  stack_trace?: string;
  resolved?: boolean;
  resolution_notes?: string;
}

// Configurația pentru raportarea erorilor
interface ErrorReporterConfig {
  enabled: boolean;
  logToConsole: boolean;
  reportToServer: boolean;
  reportToSupabase: boolean;
  includeContext: boolean;
  includeStackTrace: boolean;
  errorSamplingRate: number; // 0-1, procent din erori care sunt raportate
  minSeverityToReport: ErrorSeverity;
}

// Configurația implicită
const defaultConfig: ErrorReporterConfig = {
  enabled: true,
  logToConsole: true,
  reportToServer: false,
  reportToSupabase: true,
  includeContext: true,
  includeStackTrace: true,
  errorSamplingRate: 1.0, // Raportăm toate erorile
  minSeverityToReport: ErrorSeverity.ERROR,
};

// Clasa pentru raportarea erorilor
export class ErrorReporter {
  private config: ErrorReporterConfig;
  private sessionId: string;
  private userId: string | null = null;
  private errorQueue: ErrorReport[] = [];
  private isProcessingQueue = false;
  private flushInterval: number | null = null;

  constructor(config: Partial<ErrorReporterConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.sessionId = this.generateSessionId();
    
    // Inițializăm intervalul pentru trimiterea erorilor
    if (this.config.enabled && this.config.reportToSupabase) {
      this.flushInterval = window.setInterval(() => this.flushErrorQueue(), 30000);
    }
    
    // Adăugăm handler pentru erori globale
    if (this.config.enabled) {
      this.setupGlobalErrorHandlers();
    }
  }
  
  // Generăm un ID de sesiune unic
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
  
  // Setăm ID-ul utilizatorului
  public setUserId(userId: string | null): void {
    this.userId = userId;
  }
  
  // Configurăm handlerii pentru erori globale
  private setupGlobalErrorHandlers(): void {
    // Handler pentru erori negestionate
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message || 'Eroare JavaScript negestionate',
        source: ErrorSource.CLIENT,
        type: ErrorType.CLIENT_ERROR,
        severity: ErrorSeverity.ERROR,
        timestamp: new Date().toISOString(),
        context: {
          fileName: event.filename,
          lineNumber: event.lineno,
          columnNumber: event.colno,
        },
        stack_trace: event.error?.stack,
      });
      
      // Nu oprim propagarea evenimentului
      return false;
    });
    
    // Handler pentru promisiuni respinse negestionate
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason;
      
      this.reportError({
        message: error?.message || 'Promisiune respinsă negestionate',
        source: ErrorSource.CLIENT,
        type: ErrorType.CLIENT_ERROR,
        severity: ErrorSeverity.ERROR,
        timestamp: new Date().toISOString(),
        context: {
          reason: error,
        },
        stack_trace: error?.stack,
      });
      
      // Nu oprim propagarea evenimentului
      return false;
    });
  }
  
  // Raportăm o eroare
  public reportError(error: AppError | Error | string): void {
    if (!this.config.enabled) return;
    
    // Normalizăm eroarea
    const appError = typeof error === 'string' 
      ? { 
          message: error, 
          source: ErrorSource.CLIENT, 
          type: ErrorType.UNKNOWN, 
          severity: ErrorSeverity.ERROR, 
          timestamp: new Date().toISOString() 
        } 
      : (error instanceof Error ? normalizeError(error) : error);
    
    // Verificăm dacă ar trebui să raportăm eroarea
    if (!shouldReportError(appError)) return;
    
    // Verificăm rata de eșantionare
    if (Math.random() > this.config.errorSamplingRate) return;
    
    // Verificăm severitatea minimă
    const severityLevels = Object.values(ErrorSeverity);
    const minSeverityIndex = severityLevels.indexOf(this.config.minSeverityToReport);
    const errorSeverityIndex = severityLevels.indexOf(appError.severity);
    
    if (errorSeverityIndex < minSeverityIndex) return;
    
    // Logăm eroarea în consolă
    if (this.config.logToConsole) {
      // Removed console statement
    }
    
    // Creăm raportul de eroare
    const errorReport: ErrorReport = {
      message: appError.message,
      code: appError.code,
      source: appError.source,
      type: appError.type,
      severity: appError.severity,
      timestamp: appError.timestamp,
      user_id: this.userId || undefined,
      session_id: this.sessionId,
      url: window.location.href,
      user_agent: navigator.userAgent,
      context: this.config.includeContext ? appError.context : undefined,
      stack_trace: this.config.includeStackTrace ? appError.originalError?.stack : undefined,
      resolved: false,
    };
    
    // Adăugăm eroarea în coadă
    this.errorQueue.push(errorReport);
    
    // Trimitem eroarea imediat dacă este critică
    if (appError.severity === ErrorSeverity.CRITICAL) {
      this.flushErrorQueue();
    }
  }
  
  // Trimitem erorile din coadă
  private async flushErrorQueue(): Promise<void> {
    if (!this.config.enabled || !this.config.reportToSupabase || this.errorQueue.length === 0 || this.isProcessingQueue) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    try {
      // Copiem coada și o golim
      const errors = [...this.errorQueue];
      this.errorQueue = [];
      
      // Trimitem erorile la Supabase
      if (this.config.reportToSupabase) {
        const { error } = await supabase
          .from('error_reports')
          .insert(errors);
        
        if (error) {
          // Removed console statement
          
          // Readăugăm erorile în coadă
          this.errorQueue.push(...errors);
        }
      }
    } catch (error) {
      // Removed console statement
      
      // Readăugăm erorile în coadă în caz de eroare
      this.errorQueue.push(...this.errorQueue);
    } finally {
      this.isProcessingQueue = false;
    }
  }
  
  // Oprim raportarea erorilor
  public dispose(): void {
    if (this.flushInterval !== null) {
      window.clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    
    // Trimitem erorile rămase
    this.flushErrorQueue();
  }
}

// Instanța globală pentru raportarea erorilor
export const errorReporter = new ErrorReporter();

export default errorReporter;
