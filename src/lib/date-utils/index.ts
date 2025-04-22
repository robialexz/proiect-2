/**
 * Exportă utilitarele pentru date
 */

// Exportăm utilitarele pentru date
export {
  formatDate,
  formatDateTime,
  formatDateForInput,
  formatDateTimeForInput,
  parseDate,
  parseDateTime,
  addDays,
  addMonths,
  addYears,
  addHours,
  addMinutes,
  addSeconds,
  diffInDays,
  diffInMonths,
  diffInYears,
  diffInHours,
  diffInMinutes,
  diffInSeconds,
  isBefore,
  isAfter,
  isSameDay,
  isSameMonth,
  isSameYear,
  isValidDate,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfWeek,
  endOfWeek,
  getDayOfWeek,
  getDayName,
  getDayShortName,
  getMonthName,
  getMonthShortName,
  getDaysInMonth,
  getDaysInYear,
  isLeapYear,
  getRelativeTime,
} from './date-utils';
export { default as dateUtils } from './date-utils';

// Export implicit pentru compatibilitate
export default {
  dateUtils,
};
