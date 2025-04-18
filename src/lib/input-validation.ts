/**
 * Utilitar pentru validarea datelor de intrare
 * Acest fișier conține funcții pentru validarea datelor de intrare pentru a preveni atacurile XSS și SQL injection
 *
 * @module input-validation
 */

/**
 * Validează un text pentru a preveni atacurile XSS
 * @param input Textul de validat
 * @returns True dacă textul este valid, false altfel
 */
export function validateText(input: string | null | undefined): boolean {
  if (input === null || input === undefined) return true;

  // Verificăm dacă textul conține caractere potențial periculoase
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
    /javascript:/gi, // JavaScript protocol
    /on\w+\s*=/gi, // Event handlers (onclick, onload, etc.)
    /data:/gi, // Data URI scheme
    /<iframe/gi, // iframes
    /<embed/gi, // embed tags
    /<object/gi, // object tags
    /<img[^>]+\bonerror\b/gi, // img with onerror
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(input));
}

/**
 * Validează un email
 * @param email Email-ul de validat
 * @returns True dacă email-ul este valid, false altfel
 */
export function validateEmail(email: string | null | undefined): boolean {
  if (email === null || email === undefined) return true;

  // Regex pentru validarea email-urilor
  const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validează un URL
 * @param url URL-ul de validat
 * @returns True dacă URL-ul este valid, false altfel
 */
export function validateUrl(url: string | null | undefined): boolean {
  if (url === null || url === undefined) return true;

  try {
    // Verificăm dacă URL-ul este valid
    const urlObj = new URL(url);

    // Verificăm dacă protocolul este http sau https
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch (error) {
    return false;
  }
}

/**
 * Validează un număr
 * @param value Valoarea de validat
 * @returns True dacă valoarea este un număr valid, false altfel
 */
export function validateNumber(value: any): boolean {
  if (value === null || value === undefined) return true;

  // Verificăm dacă valoarea este un număr valid
  return !isNaN(Number(value));
}

/**
 * Validează o dată
 * @param date Data de validat
 * @returns True dacă data este validă, false altfel
 */
export function validateDate(date: string | Date | null | undefined): boolean {
  if (date === null || date === undefined) return true;

  // Verificăm dacă data este validă
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
}

/**
 * Sanitizează un text pentru a preveni atacurile XSS
 * @param input Textul de sanitizat
 * @returns Textul sanitizat
 */
export function sanitizeText(input: string | null | undefined): string {
  if (input === null || input === undefined) return "";

  // Înlocuim caracterele speciale cu entități HTML
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitizează un obiect pentru a preveni atacurile XSS
 * @param obj Obiectul de sanitizat
 * @returns Obiectul sanitizat
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  if (!obj) return obj;

  const result = { ...obj };

  // Parcurgem toate proprietățile obiectului
  Object.keys(result).forEach((key) => {
    const value = result[key];

    if (typeof value === "string") {
      // Sanitizăm valorile de tip string
      result[key] = sanitizeText(value);
    } else if (typeof value === "object" && value !== null) {
      // Sanitizăm recursiv obiectele imbricate
      result[key] = sanitizeObject(value);
    }
  });

  return result;
}

// Exportăm toate funcțiile într-un singur obiect
export const inputValidation = {
  validateText,
  validateEmail,
  validateUrl,
  validateNumber,
  validateDate,
  sanitizeText,
  sanitizeObject,
};
