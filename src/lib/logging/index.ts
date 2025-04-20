/**
 * Exportă sistemul de logging
 */

// Exportăm logger-ul și nivelurile de logging
export {
  logger,
  authLogger,
  apiLogger,
  routerLogger,
  storeLogger,
  uiLogger,
  LogLevel,
  Logger,
} from "./logger";
export { default as loggerDefault } from "./logger";

// Export implicit pentru compatibilitate
export default {
  logger,
  apiLogger,
  authLogger,
  routerLogger,
  storeLogger,
  uiLogger,
};
