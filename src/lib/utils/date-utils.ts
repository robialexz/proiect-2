/**
 * Utilități pentru lucrul cu date
 * Acest fișier conține funcții pentru lucrul cu date
 */

/**
 * Formatează o dată
 * @param date Data de formatat
 * @param format Formatul dorit
 * @returns Data formatată
 */
export function formatDate(date: Date | string, format: string = 'dd.MM.yyyy'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return 'Invalid date';
  }
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const seconds = d.getSeconds().toString().padStart(2, '0');
  
  return format
    .replace('dd', day)
    .replace('MM', month)
    .replace('yyyy', year.toString())
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * Formatează o dată pentru afișare
 * @param date Data de formatat
 * @returns Data formatată pentru afișare
 */
export function formatDateForDisplay(date: Date | string): string {
  return formatDate(date, 'dd.MM.yyyy');
}

/**
 * Formatează o dată și oră pentru afișare
 * @param date Data de formatat
 * @returns Data și ora formatate pentru afișare
 */
export function formatDateTimeForDisplay(date: Date | string): string {
  return formatDate(date, 'dd.MM.yyyy HH:mm');
}

/**
 * Formatează o dată pentru input
 * @param date Data de formatat
 * @returns Data formatată pentru input
 */
export function formatDateForInput(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return '';
  }
  
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Formatează o dată și oră pentru input
 * @param date Data de formatat
 * @returns Data și ora formatate pentru input
 */
export function formatDateTimeForInput(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return '';
  }
  
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Calculează diferența dintre două date
 * @param date1 Prima dată
 * @param date2 A doua dată
 * @returns Diferența dintre cele două date în milisecunde
 */
export function dateDiff(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  return d2.getTime() - d1.getTime();
}

/**
 * Calculează diferența dintre două date în zile
 * @param date1 Prima dată
 * @param date2 A doua dată
 * @returns Diferența dintre cele două date în zile
 */
export function dateDiffInDays(date1: Date | string, date2: Date | string): number {
  const diff = dateDiff(date1, date2);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Adaugă zile la o dată
 * @param date Data inițială
 * @param days Numărul de zile de adăugat
 * @returns Data rezultată
 */
export function addDays(date: Date | string, days: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Adaugă luni la o dată
 * @param date Data inițială
 * @param months Numărul de luni de adăugat
 * @returns Data rezultată
 */
export function addMonths(date: Date | string, months: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * Adaugă ani la o dată
 * @param date Data inițială
 * @param years Numărul de ani de adăugat
 * @returns Data rezultată
 */
export function addYears(date: Date | string, years: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
  d.setFullYear(d.getFullYear() + years);
  return d;
}

/**
 * Verifică dacă o dată este în trecut
 * @param date Data de verificat
 * @returns true dacă data este în trecut
 */
export function isPast(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() < Date.now();
}

/**
 * Verifică dacă o dată este în viitor
 * @param date Data de verificat
 * @returns true dacă data este în viitor
 */
export function isFuture(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() > Date.now();
}

/**
 * Verifică dacă o dată este astăzi
 * @param date Data de verificat
 * @returns true dacă data este astăzi
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Verifică dacă o dată este în această săptămână
 * @param date Data de verificat
 * @returns true dacă data este în această săptămână
 */
export function isThisWeek(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);
  
  return d >= startOfWeek && d <= endOfWeek;
}

/**
 * Verifică dacă o dată este în această lună
 * @param date Data de verificat
 * @returns true dacă data este în această lună
 */
export function isThisMonth(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return (
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Verifică dacă o dată este în acest an
 * @param date Data de verificat
 * @returns true dacă data este în acest an
 */
export function isThisYear(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return d.getFullYear() === today.getFullYear();
}

/**
 * Obține data de început a lunii
 * @param date Data de referință
 * @returns Data de început a lunii
 */
export function startOfMonth(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Obține data de sfârșit a lunii
 * @param date Data de referință
 * @returns Data de sfârșit a lunii
 */
export function endOfMonth(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Obține data de început a anului
 * @param date Data de referință
 * @returns Data de început a anului
 */
export function startOfYear(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
  d.setMonth(0);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Obține data de sfârșit a anului
 * @param date Data de referință
 * @returns Data de sfârșit a anului
 */
export function endOfYear(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
  d.setMonth(11);
  d.setDate(31);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Obține data relativă
 * @param date Data de formatat
 * @returns Data formatată relativ
 */
export function getRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);
  
  if (seconds < 60) {
    return 'acum câteva secunde';
  } else if (minutes < 60) {
    return `acum ${minutes} ${minutes === 1 ? 'minut' : 'minute'}`;
  } else if (hours < 24) {
    return `acum ${hours} ${hours === 1 ? 'oră' : 'ore'}`;
  } else if (days < 30) {
    return `acum ${days} ${days === 1 ? 'zi' : 'zile'}`;
  } else if (months < 12) {
    return `acum ${months} ${months === 1 ? 'lună' : 'luni'}`;
  } else {
    return `acum ${years} ${years === 1 ? 'an' : 'ani'}`;
  }
}

// Exportăm toate funcțiile
export default {
  formatDate,
  formatDateForDisplay,
  formatDateTimeForDisplay,
  formatDateForInput,
  formatDateTimeForInput,
  dateDiff,
  dateDiffInDays,
  addDays,
  addMonths,
  addYears,
  isPast,
  isFuture,
  isToday,
  isThisWeek,
  isThisMonth,
  isThisYear,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  getRelativeDate,
};
