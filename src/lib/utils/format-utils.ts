/**
 * Utilități pentru formatare
 * Acest fișier conține funcții pentru formatarea datelor
 */

/**
 * Formatează un număr
 * @param value Numărul de formatat
 * @param decimals Numărul de zecimale
 * @param decimalSeparator Separatorul pentru zecimale
 * @param thousandsSeparator Separatorul pentru mii
 * @returns Numărul formatat
 */
export function formatNumber(
  value: number,
  decimals: number = 2,
  decimalSeparator: string = ',',
  thousandsSeparator: string = '.'
): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '';
  }
  
  const parts = value.toFixed(decimals).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
  
  return parts.join(decimalSeparator);
}

/**
 * Formatează o sumă de bani
 * @param value Suma de formatat
 * @param currency Moneda
 * @param decimals Numărul de zecimale
 * @param decimalSeparator Separatorul pentru zecimale
 * @param thousandsSeparator Separatorul pentru mii
 * @returns Suma formatată
 */
export function formatMoney(
  value: number,
  currency: string = 'RON',
  decimals: number = 2,
  decimalSeparator: string = ',',
  thousandsSeparator: string = '.'
): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '';
  }
  
  const formattedNumber = formatNumber(
    value,
    decimals,
    decimalSeparator,
    thousandsSeparator
  );
  
  return `${formattedNumber} ${currency}`;
}

/**
 * Formatează un procent
 * @param value Procentul de formatat
 * @param decimals Numărul de zecimale
 * @param decimalSeparator Separatorul pentru zecimale
 * @param thousandsSeparator Separatorul pentru mii
 * @returns Procentul formatat
 */
export function formatPercent(
  value: number,
  decimals: number = 2,
  decimalSeparator: string = ',',
  thousandsSeparator: string = '.'
): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '';
  }
  
  const formattedNumber = formatNumber(
    value,
    decimals,
    decimalSeparator,
    thousandsSeparator
  );
  
  return `${formattedNumber}%`;
}

/**
 * Formatează o dată
 * @param value Data de formatat
 * @param format Formatul dorit
 * @returns Data formatată
 */
export function formatDate(
  value: Date | string | number,
  format: string = 'dd.MM.yyyy'
): string {
  if (!value) {
    return '';
  }
  
  const date = value instanceof Date ? value : new Date(value);
  
  if (isNaN(date.getTime())) {
    return '';
  }
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
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
 * @param value Data și ora de formatat
 * @param format Formatul dorit
 * @returns Data și ora formatate
 */
export function formatDateTime(
  value: Date | string | number,
  format: string = 'dd.MM.yyyy HH:mm'
): string {
  return formatDate(value, format);
}

/**
 * Formatează o dată pentru input
 * @param value Data de formatat
 * @returns Data formatată pentru input
 */
export function formatDateForInput(value: Date | string | number): string {
  if (!value) {
    return '';
  }
  
  const date = value instanceof Date ? value : new Date(value);
  
  if (isNaN(date.getTime())) {
    return '';
  }
  
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Formatează o dată și oră pentru input
 * @param value Data și ora de formatat
 * @returns Data și ora formatate pentru input
 */
export function formatDateTimeForInput(value: Date | string | number): string {
  if (!value) {
    return '';
  }
  
  const date = value instanceof Date ? value : new Date(value);
  
  if (isNaN(date.getTime())) {
    return '';
  }
  
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Formatează o durată
 * @param seconds Durata în secunde
 * @returns Durata formatată
 */
export function formatDuration(seconds: number): string {
  if (seconds === undefined || seconds === null || isNaN(seconds)) {
    return '';
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  
  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? 'oră' : 'ore'}`);
  }
  
  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? 'minut' : 'minute'}`);
  }
  
  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs} ${secs === 1 ? 'secundă' : 'secunde'}`);
  }
  
  return parts.join(' ');
}

/**
 * Formatează o dimensiune de fișier
 * @param bytes Dimensiunea în bytes
 * @param decimals Numărul de zecimale
 * @returns Dimensiunea formatată
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) {
    return '0 Bytes';
  }
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Formatează un număr de telefon
 * @param value Numărul de telefon
 * @param format Formatul dorit
 * @returns Numărul de telefon formatat
 */
export function formatPhoneNumber(
  value: string,
  format: string = 'xxxx xxx xxx'
): string {
  if (!value) {
    return '';
  }
  
  // Eliminăm toate caracterele non-numerice
  const cleaned = value.replace(/\D/g, '');
  
  // Verificăm dacă numărul are lungimea corectă
  if (cleaned.length !== format.replace(/[^x]/g, '').length) {
    return value;
  }
  
  // Formatăm numărul
  let result = format;
  let index = 0;
  
  for (let i = 0; i < format.length; i++) {
    if (format[i] === 'x') {
      result = result.substring(0, i) + cleaned[index++] + result.substring(i + 1);
    }
  }
  
  return result;
}

/**
 * Formatează un CNP
 * @param value CNP-ul
 * @returns CNP-ul formatat
 */
export function formatCNP(value: string): string {
  if (!value) {
    return '';
  }
  
  // Eliminăm toate caracterele non-numerice
  const cleaned = value.replace(/\D/g, '');
  
  // Verificăm dacă CNP-ul are lungimea corectă
  if (cleaned.length !== 13) {
    return value;
  }
  
  // Formatăm CNP-ul
  return `${cleaned.slice(0, 1)} ${cleaned.slice(1, 7)} ${cleaned.slice(7)}`;
}

/**
 * Formatează un CUI
 * @param value CUI-ul
 * @returns CUI-ul formatat
 */
export function formatCUI(value: string): string {
  if (!value) {
    return '';
  }
  
  // Eliminăm toate caracterele non-numerice
  const cleaned = value.replace(/\D/g, '');
  
  // Verificăm dacă CUI-ul are lungimea corectă
  if (cleaned.length < 2 || cleaned.length > 10) {
    return value;
  }
  
  // Formatăm CUI-ul
  return `RO${cleaned}`;
}

/**
 * Formatează un IBAN
 * @param value IBAN-ul
 * @returns IBAN-ul formatat
 */
export function formatIBAN(value: string): string {
  if (!value) {
    return '';
  }
  
  // Eliminăm toate spațiile
  const cleaned = value.replace(/\s/g, '').toUpperCase();
  
  // Formatăm IBAN-ul
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Formatează un număr de card
 * @param value Numărul de card
 * @returns Numărul de card formatat
 */
export function formatCardNumber(value: string): string {
  if (!value) {
    return '';
  }
  
  // Eliminăm toate caracterele non-numerice
  const cleaned = value.replace(/\D/g, '');
  
  // Verificăm dacă numărul are lungimea corectă
  if (cleaned.length !== 16) {
    return value;
  }
  
  // Formatăm numărul
  return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8, 12)} ${cleaned.slice(12)}`;
}

/**
 * Formatează un text pentru afișare
 * @param value Textul de formatat
 * @param maxLength Lungimea maximă
 * @param suffix Sufixul de adăugat
 * @returns Textul formatat
 */
export function formatText(
  value: string,
  maxLength: number = 100,
  suffix: string = '...'
): string {
  if (!value) {
    return '';
  }
  
  if (value.length <= maxLength) {
    return value;
  }
  
  return value.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Formatează un text pentru URL
 * @param value Textul de formatat
 * @returns Textul formatat pentru URL
 */
export function formatSlug(value: string): string {
  if (!value) {
    return '';
  }
  
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Formatează un text pentru căutare
 * @param value Textul de formatat
 * @returns Textul formatat pentru căutare
 */
export function formatSearchText(value: string): string {
  if (!value) {
    return '';
  }
  
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Formatează un text pentru afișare în HTML
 * @param value Textul de formatat
 * @returns Textul formatat pentru HTML
 */
export function formatHTML(value: string): string {
  if (!value) {
    return '';
  }
  
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Formatează un text pentru afișare în HTML cu păstrarea newline-urilor
 * @param value Textul de formatat
 * @returns Textul formatat pentru HTML
 */
export function formatHTMLWithNewlines(value: string): string {
  if (!value) {
    return '';
  }
  
  return formatHTML(value).replace(/\n/g, '<br>');
}

/**
 * Formatează un text pentru afișare în HTML cu păstrarea newline-urilor și link-urilor
 * @param value Textul de formatat
 * @returns Textul formatat pentru HTML
 */
export function formatHTMLWithLinks(value: string): string {
  if (!value) {
    return '';
  }
  
  return formatHTMLWithNewlines(value).replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );
}

// Exportăm toate funcțiile
export default {
  formatNumber,
  formatMoney,
  formatPercent,
  formatDate,
  formatDateTime,
  formatDateForInput,
  formatDateTimeForInput,
  formatDuration,
  formatFileSize,
  formatPhoneNumber,
  formatCNP,
  formatCUI,
  formatIBAN,
  formatCardNumber,
  formatText,
  formatSlug,
  formatSearchText,
  formatHTML,
  formatHTMLWithNewlines,
  formatHTMLWithLinks,
};
