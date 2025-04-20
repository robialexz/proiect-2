/**
 * Utilitar pentru formatarea datelor
 * Acest fișier conține funcții pentru formatarea datelor în aplicație
 */

/**
 * Formatează o valoare monetară
 * @param value Valoarea de formatat
 * @param currency Moneda (implicit RON)
 * @returns Valoarea formatată
 */
export function formatCurrency(
  value: number | string | null | undefined,
  currency: string = 'RON'
): string {
  if (value === null || value === undefined) return '';
  
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) return '';
  
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericValue);
}

/**
 * Formatează o dată
 * @param date Data de formatat
 * @param format Formatul (implicit 'dd.MM.yyyy')
 * @returns Data formatată
 */
export function formatDate(
  date: Date | string | null | undefined,
  format: string = 'dd.MM.yyyy'
): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  // Implementare simplă pentru formatare
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  let result = format;
  result = result.replace('dd', day);
  result = result.replace('MM', month);
  result = result.replace('yyyy', String(year));
  result = result.replace('yy', String(year).slice(-2));
  
  return result;
}

/**
 * Formatează un număr
 * @param value Valoarea de formatat
 * @param decimals Numărul de zecimale (implicit 2)
 * @returns Numărul formatat
 */
export function formatNumber(
  value: number | string | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined) return '';
  
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) return '';
  
  return new Intl.NumberFormat('ro-RO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(numericValue);
}

/**
 * Formatează un procent
 * @param value Valoarea de formatat
 * @param decimals Numărul de zecimale (implicit 2)
 * @returns Procentul formatat
 */
export function formatPercent(
  value: number | string | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined) return '';
  
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) return '';
  
  return new Intl.NumberFormat('ro-RO', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(numericValue / 100);
}

/**
 * Formatează o dimensiune de fișier
 * @param bytes Dimensiunea în bytes
 * @returns Dimensiunea formatată
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formatează un număr de telefon
 * @param phone Numărul de telefon
 * @returns Numărul de telefon formatat
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Eliminăm toate caracterele non-numerice
  const cleaned = phone.replace(/\D/g, '');
  
  // Formatăm numărul de telefon pentru România
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  
  return phone;
}

/**
 * Truncheză un text la o anumită lungime
 * @param text Textul de truncheat
 * @param length Lungimea maximă (implicit 100)
 * @returns Textul truncheat
 */
export function truncateText(
  text: string | null | undefined,
  length: number = 100
): string {
  if (!text) return '';
  
  if (text.length <= length) return text;
  
  return text.substring(0, length) + '...';
}

// Exportăm toate funcțiile într-un singur obiect
export const formatters = {
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
  formatFileSize,
  formatPhoneNumber,
  truncateText
};
