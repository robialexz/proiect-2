/**
 * Sistem de logging pentru aplicație
 * Acest fișier conține funcționalitatea pentru logging
 */

// Nivelurile de logging
export enum LogLevel {
  TRACE = "trace",
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  FATAL = "fatal",
}

// Interfața pentru configurația logger-ului
interface LoggerConfig {
  level: LogLevel;
  enabled: boolean;
  prefix?: string;
  includeTimestamp: boolean;
  includeLevel: boolean;
  includePrefix: boolean;
  logToConsole: boolean;
  logToServer: boolean;
  serverEndpoint?: string;
  batchSize: number;
  batchInterval: number;
}

// Configurația implicită
const defaultConfig: LoggerConfig = {
  level: LogLevel.INFO,
  enabled: true,
  includeTimestamp: true,
  includeLevel: true,
  includePrefix: true,
  logToConsole: true,
  logToServer: false,
  batchSize: 10,
  batchInterval: 5000,
};

// Interfața pentru un log
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  prefix?: string;
  data?: any;
}

/**
 * Clasa pentru logging
 */
export class Logger {
  private config: LoggerConfig;
  private logQueue: LogEntry[] = [];
  private flushInterval: number | null = null;

  /**
   * Constructor pentru logger
   * @param config Configurația logger-ului
   */
  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };

    // Inițializăm intervalul pentru trimiterea logurilor
    if (this.config.enabled && this.config.logToServer) {
      this.flushInterval = window.setInterval(
        () => this.flushLogQueue(),
        this.config.batchInterval
      );
    }
  }

  /**
   * Setează configurația logger-ului
   * @param config Configurația logger-ului
   */
  public setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };

    // Actualizăm intervalul pentru trimiterea logurilor
    if (this.flushInterval !== null) {
      window.clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    if (this.config.enabled && this.config.logToServer) {
      this.flushInterval = window.setInterval(
        () => this.flushLogQueue(),
        this.config.batchInterval
      );
    }
  }

  /**
   * Creează un nou logger cu un prefix
   * @param prefix Prefixul pentru logger
   * @returns Un nou logger cu prefixul specificat
   */
  public createLogger(prefix: string): Logger {
    return new Logger({
      ...this.config,
      prefix,
    });
  }

  /**
   * Verifică dacă un nivel de logging este activat
   * @param level Nivelul de logging
   * @returns true dacă nivelul de logging este activat
   */
  private isLevelEnabled(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    const configLevelIndex = levels.indexOf(this.config.level);
    const logLevelIndex = levels.indexOf(level);

    return logLevelIndex >= configLevelIndex;
  }

  /**
   * Formatează un mesaj de log
   * @param level Nivelul de logging
   * @param message Mesajul de log
   * @param data Datele suplimentare
   * @returns Mesajul formatat
   */
  private formatLogMessage(
    level: LogLevel,
    message: string,
    data?: any
  ): string {
    const parts: string[] = [];

    // Adăugăm timestamp-ul
    if (this.config.includeTimestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    // Adăugăm nivelul
    if (this.config.includeLevel) {
      parts.push(`[${level.toUpperCase()}]`);
    }

    // Adăugăm prefixul
    if (this.config.includePrefix && this.config.prefix) {
      parts.push(`[${this.config.prefix}]`);
    }

    // Adăugăm mesajul
    parts.push(message);

    return parts.join(" ");
  }

  /**
   * Adaugă un log în coadă
   * @param level Nivelul de logging
   * @param message Mesajul de log
   * @param data Datele suplimentare
   */
  private addToQueue(level: LogLevel, message: string, data?: any): void {
    // Adăugăm log-ul în coadă
    this.logQueue.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      prefix: this.config.prefix,
      data,
    });

    // Verificăm dacă trebuie să trimitem log-urile
    if (this.logQueue.length >= this.config.batchSize) {
      this.flushLogQueue();
    }
  }

  /**
   * Trimite log-urile din coadă
   */
  private flushLogQueue(): void {
    if (
      !this.config.enabled ||
      !this.config.logToServer ||
      this.logQueue.length === 0
    ) {
      return;
    }

    // Copiem coada și o golim
    const logs = [...this.logQueue];
    this.logQueue = [];

    // Verificăm dacă avem un endpoint pentru trimiterea log-urilor
    if (!this.config.serverEndpoint) {
      return;
    }

    // Folosim un try-catch pentru a gestiona erorile
    try {
      // Trimitem log-urile la server folosind fetch
      fetch(this.config.serverEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logs),
      })
        .then((response) => {
          if (!response.ok) {
            // Readăugăm log-urile în coadă în caz de eroare
            this.logQueue.push(...logs);
          }
        })
        .catch(() => {
          // Readăugăm log-urile în coadă în caz de eroare
          this.logQueue.push(...logs);
        });
    } catch (error) {
      // Readăugăm log-urile în coadă în caz de eroare
      this.logQueue.push(...logs);
    }
  }

  /**
   * Logează un mesaj
   * @param level Nivelul de logging
   * @param message Mesajul de log
   * @param data Datele suplimentare
   */
  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.config.enabled || !this.isLevelEnabled(level)) {
      return;
    }

    // Formatăm mesajul
    const formattedMessage = this.formatLogMessage(level, message, data);

    // Logăm în consolă
    if (this.config.logToConsole) {
      // Implementare sigură pentru logging în consolă
      // Folosim un wrapper pentru a evita erorile în producție
      const logToConsole = (method: string, args: any[]) => {
        if (
          typeof window !== "undefined" &&
          window.console &&
          window.console[method]
        ) {
          // Folosim Function.prototype.apply pentru a evita erorile
          Function.prototype.apply.call(
            window.console[method],
            window.console,
            args
          );
        }
      };

      switch (level) {
        case LogLevel.TRACE:
        case LogLevel.DEBUG:
          logToConsole("debug", [formattedMessage, data]);
          break;
        case LogLevel.INFO:
          logToConsole("info", [formattedMessage, data]);
          break;
        case LogLevel.WARN:
          logToConsole("warn", [formattedMessage, data]);
          break;
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          logToConsole("error", [formattedMessage, data]);
          break;
      }
    }

    // Adăugăm log-ul în coadă pentru trimitere la server
    if (this.config.logToServer) {
      this.addToQueue(level, message, data);
    }
  }

  /**
   * Logează un mesaj de nivel TRACE
   * @param message Mesajul de log
   * @param data Datele suplimentare
   */
  public trace(message: string, data?: any): void {
    this.log(LogLevel.TRACE, message, data);
  }

  /**
   * Logează un mesaj de nivel DEBUG
   * @param message Mesajul de log
   * @param data Datele suplimentare
   */
  public debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Logează un mesaj de nivel INFO
   * @param message Mesajul de log
   * @param data Datele suplimentare
   */
  public info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Logează un mesaj de nivel WARN
   * @param message Mesajul de log
   * @param data Datele suplimentare
   */
  public warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Logează un mesaj de nivel ERROR
   * @param message Mesajul de log
   * @param data Datele suplimentare
   */
  public error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * Logează un mesaj de nivel FATAL
   * @param message Mesajul de log
   * @param data Datele suplimentare
   */
  public fatal(message: string, data?: any): void {
    this.log(LogLevel.FATAL, message, data);
  }

  /**
   * Oprește logger-ul
   */
  public dispose(): void {
    if (this.flushInterval !== null) {
      window.clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    // Trimitem log-urile rămase dacă există
    if (this.logQueue.length > 0) {
      this.flushLogQueue();
    }
  }
}

// Creăm logger-ul global
export const logger = new Logger();

// Creăm logger-uri pentru diferite module
export const authLogger = logger.createLogger("Auth");
export const apiLogger = logger.createLogger("API");
export const routerLogger = logger.createLogger("Router");
export const storeLogger = logger.createLogger("Store");
export const uiLogger = logger.createLogger("UI");

// Exportăm logger-ul
export default logger;
