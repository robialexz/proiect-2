/**
 * Utilități pentru date
 * Acest fișier conține funcții pentru lucrul cu date
 */

/**
 * Formatează o dată
 * @param date Data de formatat
 * @param format Formatul dorit
 * @returns Data formatată
 */
export function formatDate(
  date: Date | string | number,
  format: string = 'dd.MM.yyyy'
): string {
  if (!date) {
    return '';
  }
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const seconds = dateObj.getSeconds().toString().padStart(2, '0');
  
  return format
    .replace('dd', day)
    .replace('MM', month)
    .replace('yyyy', year.toString())
    .replace('yy', year.toString().slice(-2))
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * Formatează o dată și oră
 * @param date Data și ora de formatat
 * @param format Formatul dorit
 * @returns Data și ora formatate
 */
export function formatDateTime(
  date: Date | string | number,
  format: string = 'dd.MM.yyyy HH:mm'
): string {
  return formatDate(date, format);
}

/**
 * Formatează o dată pentru input
 * @param date Data de formatat
 * @returns Data formatată pentru input
 */
export function formatDateForInput(date: Date | string | number): string {
  if (!date) {
    return '';
  }
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Formatează o dată și oră pentru input
 * @param date Data și ora de formatat
 * @returns Data și ora formatate pentru input
 */
export function formatDateTimeForInput(date: Date | string | number): string {
  if (!date) {
    return '';
  }
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Parsează o dată
 * @param date Data de parsat
 * @param format Formatul datei
 * @returns Data parsată
 */
export function parseDate(date: string, format: string = 'dd.MM.yyyy'): Date {
  if (!date) {
    return new Date(NaN);
  }
  
  // Înlocuim separatorii cu un caracter unic
  const normalizedFormat = format
    .replace(/[.\/\-\s]/g, '-')
    .replace('dd', '##')
    .replace('MM', '@@')
    .replace('yyyy', '$$$$')
    .replace('yy', '$$');
  
  const normalizedDate = date.replace(/[.\/\-\s]/g, '-');
  
  // Obținem pozițiile pentru zi, lună și an
  const dayPos = normalizedFormat.indexOf('##');
  const monthPos = normalizedFormat.indexOf('@@');
  const yearPos = normalizedFormat.indexOf('$$');
  
  // Împărțim data în componente
  const parts = normalizedDate.split('-');
  
  // Obținem ziua, luna și anul
  const positions = [
    { pos: dayPos, value: 'day' },
    { pos: monthPos, value: 'month' },
    { pos: yearPos, value: 'year' },
  ].sort((a, b) => a.pos - b.pos);
  
  const day = parseInt(parts[positions.findIndex((p) => p.value === 'day')], 10);
  const month = parseInt(parts[positions.findIndex((p) => p.value === 'month')], 10) - 1;
  const year = parseInt(parts[positions.findIndex((p) => p.value === 'year')], 10);
  
  // Creăm data
  return new Date(year, month, day);
}

/**
 * Parsează o dată și oră
 * @param date Data și ora de parsat
 * @param format Formatul datei și orei
 * @returns Data și ora parsate
 */
export function parseDateTime(date: string, format: string = 'dd.MM.yyyy HH:mm'): Date {
  if (!date) {
    return new Date(NaN);
  }
  
  // Împărțim data și ora
  const [datePart, timePart] = date.split(' ');
  const [formatDatePart, formatTimePart] = format.split(' ');
  
  // Parsăm data
  const dateObj = parseDate(datePart, formatDatePart);
  
  if (isNaN(dateObj.getTime()) || !timePart) {
    return dateObj;
  }
  
  // Parsăm ora
  const [hours, minutes, seconds] = timePart.split(':').map((part) => parseInt(part, 10));
  
  // Setăm ora, minutele și secundele
  dateObj.setHours(hours || 0);
  dateObj.setMinutes(minutes || 0);
  dateObj.setSeconds(seconds || 0);
  
  return dateObj;
}

/**
 * Adaugă zile la o dată
 * @param date Data
 * @param days Numărul de zile
 * @returns Data rezultată
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Adaugă luni la o dată
 * @param date Data
 * @param months Numărul de luni
 * @returns Data rezultată
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Adaugă ani la o dată
 * @param date Data
 * @param years Numărul de ani
 * @returns Data rezultată
 */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * Adaugă ore la o dată
 * @param date Data
 * @param hours Numărul de ore
 * @returns Data rezultată
 */
export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * Adaugă minute la o dată
 * @param date Data
 * @param minutes Numărul de minute
 * @returns Data rezultată
 */
export function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

/**
 * Adaugă secunde la o dată
 * @param date Data
 * @param seconds Numărul de secunde
 * @returns Data rezultată
 */
export function addSeconds(date: Date, seconds: number): Date {
  const result = new Date(date);
  result.setSeconds(result.getSeconds() + seconds);
  return result;
}

/**
 * Obține diferența în zile între două date
 * @param date1 Prima dată
 * @param date2 A doua dată
 * @returns Diferența în zile
 */
export function diffInDays(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Obține diferența în luni între două date
 * @param date1 Prima dată
 * @param date2 A doua dată
 * @returns Diferența în luni
 */
export function diffInMonths(date1: Date, date2: Date): number {
  const months1 = date1.getFullYear() * 12 + date1.getMonth();
  const months2 = date2.getFullYear() * 12 + date2.getMonth();
  return Math.abs(months2 - months1);
}

/**
 * Obține diferența în ani între două date
 * @param date1 Prima dată
 * @param date2 A doua dată
 * @returns Diferența în ani
 */
export function diffInYears(date1: Date, date2: Date): number {
  return Math.abs(date2.getFullYear() - date1.getFullYear());
}

/**
 * Obține diferența în ore între două date
 * @param date1 Prima dată
 * @param date2 A doua dată
 * @returns Diferența în ore
 */
export function diffInHours(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60));
}

/**
 * Obține diferența în minute între două date
 * @param date1 Prima dată
 * @param date2 A doua dată
 * @returns Diferența în minute
 */
export function diffInMinutes(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffTime / (1000 * 60));
}

/**
 * Obține diferența în secunde între două date
 * @param date1 Prima dată
 * @param date2 A doua dată
 * @returns Diferența în secunde
 */
export function diffInSeconds(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffTime / 1000);
}

/**
 * Verifică dacă o dată este înainte de alta
 * @param date1 Prima dată
 * @param date2 A doua dată
 * @returns true dacă prima dată este înainte de a doua
 */
export function isBefore(date1: Date, date2: Date): boolean {
  return date1.getTime() < date2.getTime();
}

/**
 * Verifică dacă o dată este după alta
 * @param date1 Prima dată
 * @param date2 A doua dată
 * @returns true dacă prima dată este după a doua
 */
export function isAfter(date1: Date, date2: Date): boolean {
  return date1.getTime() > date2.getTime();
}

/**
 * Verifică dacă o dată este aceeași cu alta
 * @param date1 Prima dată
 * @param date2 A doua dată
 * @returns true dacă datele sunt aceleași
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

/**
 * Verifică dacă o dată este în aceeași lună cu alta
 * @param date1 Prima dată
 * @param date2 A doua dată
 * @returns true dacă datele sunt în aceeași lună
 */
export function isSameMonth(date1: Date, date2: Date): boolean {
  return (
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

/**
 * Verifică dacă o dată este în același an cu alta
 * @param date1 Prima dată
 * @param date2 A doua dată
 * @returns true dacă datele sunt în același an
 */
export function isSameYear(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear();
}

/**
 * Verifică dacă o dată este validă
 * @param date Data de verificat
 * @returns true dacă data este validă
 */
export function isValidDate(date: Date): boolean {
  return !isNaN(date.getTime());
}

/**
 * Obține prima zi a lunii
 * @param date Data
 * @returns Prima zi a lunii
 */
export function startOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Obține ultima zi a lunii
 * @param date Data
 * @returns Ultima zi a lunii
 */
export function endOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Obține prima zi a anului
 * @param date Data
 * @returns Prima zi a anului
 */
export function startOfYear(date: Date): Date {
  const result = new Date(date);
  result.setMonth(0);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Obține ultima zi a anului
 * @param date Data
 * @returns Ultima zi a anului
 */
export function endOfYear(date: Date): Date {
  const result = new Date(date);
  result.setMonth(11);
  result.setDate(31);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Obține prima zi a săptămânii
 * @param date Data
 * @param startOnMonday Dacă săptămâna începe luni
 * @returns Prima zi a săptămânii
 */
export function startOfWeek(date: Date, startOnMonday: boolean = true): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = startOnMonday
    ? day === 0
      ? 6
      : day - 1
    : day;
  result.setDate(result.getDate() - diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Obține ultima zi a săptămânii
 * @param date Data
 * @param startOnMonday Dacă săptămâna începe luni
 * @returns Ultima zi a săptămânii
 */
export function endOfWeek(date: Date, startOnMonday: boolean = true): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = startOnMonday
    ? day === 0
      ? 0
      : 7 - day
    : 6 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Obține ziua din săptămână
 * @param date Data
 * @param startOnMonday Dacă săptămâna începe luni
 * @returns Ziua din săptămână (0-6)
 */
export function getDayOfWeek(date: Date, startOnMonday: boolean = true): number {
  const day = date.getDay();
  return startOnMonday
    ? day === 0
      ? 6
      : day - 1
    : day;
}

/**
 * Obține numele zilei din săptămână
 * @param date Data
 * @param locale Localizarea
 * @returns Numele zilei din săptămână
 */
export function getDayName(date: Date, locale: string = 'ro-RO'): string {
  return date.toLocaleDateString(locale, { weekday: 'long' });
}

/**
 * Obține numele scurt al zilei din săptămână
 * @param date Data
 * @param locale Localizarea
 * @returns Numele scurt al zilei din săptămână
 */
export function getDayShortName(date: Date, locale: string = 'ro-RO'): string {
  return date.toLocaleDateString(locale, { weekday: 'short' });
}

/**
 * Obține numele lunii
 * @param date Data
 * @param locale Localizarea
 * @returns Numele lunii
 */
export function getMonthName(date: Date, locale: string = 'ro-RO'): string {
  return date.toLocaleDateString(locale, { month: 'long' });
}

/**
 * Obține numele scurt al lunii
 * @param date Data
 * @param locale Localizarea
 * @returns Numele scurt al lunii
 */
export function getMonthShortName(date: Date, locale: string = 'ro-RO'): string {
  return date.toLocaleDateString(locale, { month: 'short' });
}

/**
 * Obține numărul de zile dintr-o lună
 * @param date Data
 * @returns Numărul de zile din lună
 */
export function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * Obține numărul de zile dintr-un an
 * @param date Data
 * @returns Numărul de zile din an
 */
export function getDaysInYear(date: Date): number {
  return isLeapYear(date) ? 366 : 365;
}

/**
 * Verifică dacă un an este bisect
 * @param date Data
 * @returns true dacă anul este bisect
 */
export function isLeapYear(date: Date): boolean {
  const year = date.getFullYear();
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Obține data relativă
 * @param date Data
 * @param locale Localizarea
 * @returns Data relativă
 */
export function getRelativeTime(date: Date, locale: string = 'ro-RO'): string {
  const now = new Date();
  const diffInSeconds = diffInSeconds(now, date);
  
  if (diffInSeconds < 60) {
    return 'acum câteva secunde';
  }
  
  const diffInMinutes = diffInMinutes(now, date);
  
  if (diffInMinutes < 60) {
    return `acum ${diffInMinutes} ${diffInMinutes === 1 ? 'minut' : 'minute'}`;
  }
  
  const diffInHours = diffInHours(now, date);
  
  if (diffInHours < 24) {
    return `acum ${diffInHours} ${diffInHours === 1 ? 'oră' : 'ore'}`;
  }
  
  const diffInDays = diffInDays(now, date);
  
  if (diffInDays < 7) {
    return `acum ${diffInDays} ${diffInDays === 1 ? 'zi' : 'zile'}`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  
  if (diffInWeeks < 4) {
    return `acum ${diffInWeeks} ${diffInWeeks === 1 ? 'săptămână' : 'săptămâni'}`;
  }
  
  const diffInMonths = diffInMonths(now, date);
  
  if (diffInMonths < 12) {
    return `acum ${diffInMonths} ${diffInMonths === 1 ? 'lună' : 'luni'}`;
  }
  
  const diffInYears = diffInYears(now, date);
  
  return `acum ${diffInYears} ${diffInYears === 1 ? 'an' : 'ani'}`;
}

// Exportăm toate funcțiile
export default {
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
};
