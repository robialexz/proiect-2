/**
 * Utilități pentru validare
 * Acest fișier conține funcții pentru validarea datelor
 */

/**
 * Verifică dacă o valoare este definită
 * @param value Valoarea de verificat
 * @returns true dacă valoarea este definită
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

/**
 * Verifică dacă o valoare este nedefinită
 * @param value Valoarea de verificat
 * @returns true dacă valoarea este nedefinită
 */
export function isUndefined(value: any): value is undefined {
  return value === undefined;
}

/**
 * Verifică dacă o valoare este null
 * @param value Valoarea de verificat
 * @returns true dacă valoarea este null
 */
export function isNull(value: any): value is null {
  return value === null;
}

/**
 * Verifică dacă o valoare este un string
 * @param value Valoarea de verificat
 * @returns true dacă valoarea este un string
 */
export function isString(value: any): value is string {
  return typeof value === 'string';
}

/**
 * Verifică dacă o valoare este un număr
 * @param value Valoarea de verificat
 * @returns true dacă valoarea este un număr
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Verifică dacă o valoare este un boolean
 * @param value Valoarea de verificat
 * @returns true dacă valoarea este un boolean
 */
export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Verifică dacă o valoare este un obiect
 * @param value Valoarea de verificat
 * @returns true dacă valoarea este un obiect
 */
export function isObject(value: any): value is object {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Verifică dacă o valoare este un array
 * @param value Valoarea de verificat
 * @returns true dacă valoarea este un array
 */
export function isArray<T>(value: any): value is T[] {
  return Array.isArray(value);
}

/**
 * Verifică dacă o valoare este o funcție
 * @param value Valoarea de verificat
 * @returns true dacă valoarea este o funcție
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

/**
 * Verifică dacă o valoare este o dată
 * @param value Valoarea de verificat
 * @returns true dacă valoarea este o dată
 */
export function isDate(value: any): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Verifică dacă un string este gol
 * @param value String-ul de verificat
 * @returns true dacă string-ul este gol
 */
export function isEmptyString(value: string): boolean {
  return value.trim() === '';
}

/**
 * Verifică dacă un array este gol
 * @param value Array-ul de verificat
 * @returns true dacă array-ul este gol
 */
export function isEmptyArray<T>(value: T[]): boolean {
  return value.length === 0;
}

/**
 * Verifică dacă un obiect este gol
 * @param value Obiectul de verificat
 * @returns true dacă obiectul este gol
 */
export function isEmptyObject(value: object): boolean {
  return Object.keys(value).length === 0;
}

/**
 * Verifică dacă o valoare este un email valid
 * @param value Valoarea de verificat
 * @returns true dacă valoarea este un email valid
 */
export function isEmail(value: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(value);
}

/**
 * Verifică dacă o valoare este un URL valid
 * @param value Valoarea de verificat
 * @returns true dacă valoarea este un URL valid
 */
export function isUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Verifică dacă o valoare este un număr de telefon valid
 * @param value Valoarea de verificat
 * @returns true dacă valoarea este un număr de telefon valid
 */
export function isPhoneNumber(value: string): boolean {
  const phoneRegex = /^(\+\d{1,3})?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  return phoneRegex.test(value);
}

/**
 * Verifică dacă o valoare este un CNP valid
 * @param value Valoarea de verificat
 * @returns true dacă valoarea este un CNP valid
 */
export function isCNP(value: string): boolean {
  // Eliminăm toate caracterele non-numerice
  const cnp = value.replace(/\D/g, '');
  
  // Verificăm dacă CNP-ul are 13 cifre
  if (cnp.length !== 13) {
    return false;
  }
  
  // Verificăm prima cifră
  const firstDigit = parseInt(cnp[0], 10);
  if (firstDigit < 1 || firstDigit > 8) {
    return false;
  }
  
  // Verificăm data nașterii
  const year = parseInt(cnp.substring(1, 3), 10);
  const month = parseInt(cnp.substring(3, 5), 10);
  const day = parseInt(cnp.substring(5, 7), 10);
  
  if (month < 1 || month > 12) {
    return false;
  }
  
  const daysInMonth = new Date(
    firstDigit <= 2 ? 1900 + year : 2000 + year,
    month,
    0
  ).getDate();
  
  if (day < 1 || day > daysInMonth) {
    return false;
  }
  
  // Verificăm codul județului
  const countyCode = parseInt(cnp.substring(7, 9), 10);
  if (countyCode < 1 || countyCode > 52) {
    return false;
  }
  
  // Verificăm cifra de control
  const controlDigit = parseInt(cnp[12], 10);
  const controlString = '279146358279';
  let sum = 0;
  
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnp[i], 10) * parseInt(controlString[i], 10);
  }
  
  const remainder = sum % 11;
  const calculatedControlDigit = remainder === 10 ? 1 : remainder;
  
  return controlDigit === calculatedControlDigit;
}

/**
 * Verifică dacă o valoare este un CUI valid
 * @param value Valoarea de verificat
 * @returns true dacă valoarea este un CUI valid
 */
export function isCUI(value: string): boolean {
  // Eliminăm toate caracterele non-numerice
  const cui = value.replace(/\D/g, '');
  
  // Verificăm dacă CUI-ul are între 2 și 10 cifre
  if (cui.length < 2 || cui.length > 10) {
    return false;
  }
  
  // Verificăm cifra de control
  const controlDigit = parseInt(cui[cui.length - 1], 10);
  const controlString = '753217532';
  let sum = 0;
  
  for (let i = 0; i < cui.length - 1; i++) {
    sum += parseInt(cui[i], 10) * parseInt(controlString[i], 10);
  }
  
  const remainder = sum * 10 % 11;
  const calculatedControlDigit = remainder === 10 ? 0 : remainder;
  
  return controlDigit === calculatedControlDigit;
}

/**
 * Verifică dacă o valoare este un IBAN valid
 * @param value Valoarea de verificat
 * @returns true dacă valoarea este un IBAN valid
 */
export function isIBAN(value: string): boolean {
  // Eliminăm toate spațiile
  const iban = value.replace(/\s/g, '').toUpperCase();
  
  // Verificăm dacă IBAN-ul are cel puțin 15 caractere
  if (iban.length < 15) {
    return false;
  }
  
  // Verificăm dacă IBAN-ul conține doar litere și cifre
  if (!/^[A-Z0-9]+$/.test(iban)) {
    return false;
  }
  
  // Verificăm codul țării
  const countryCode = iban.substring(0, 2);
  if (!/^[A-Z]{2}$/.test(countryCode)) {
    return false;
  }
  
  // Verificăm cifra de control
  const checkDigits = iban.substring(2, 4);
  if (!/^[0-9]{2}$/.test(checkDigits)) {
    return false;
  }
  
  // Mutăm primele 4 caractere la sfârșitul IBAN-ului
  const rearrangedIBAN = iban.substring(4) + iban.substring(0, 4);
  
  // Convertim literele în numere (A=10, B=11, ..., Z=35)
  const numericIBAN = rearrangedIBAN.split('').map((char) => {
    if (/[0-9]/.test(char)) {
      return char;
    } else {
      return (char.charCodeAt(0) - 55).toString();
    }
  }).join('');
  
  // Calculăm modulo 97
  let remainder = 0;
  for (let i = 0; i < numericIBAN.length; i += 7) {
    const chunk = remainder + numericIBAN.substring(i, i + 7);
    remainder = parseInt(chunk, 10) % 97;
  }
  
  return remainder === 1;
}

/**
 * Verifică dacă o valoare este un număr de card valid
 * @param value Valoarea de verificat
 * @returns true dacă valoarea este un număr de card valid
 */
export function isCreditCard(value: string): boolean {
  // Eliminăm toate caracterele non-numerice
  const card = value.replace(/\D/g, '');
  
  // Verificăm dacă numărul de card are între 13 și 19 cifre
  if (card.length < 13 || card.length > 19) {
    return false;
  }
  
  // Verificăm cifra de control folosind algoritmul Luhn
  let sum = 0;
  let double = false;
  
  for (let i = card.length - 1; i >= 0; i--) {
    let digit = parseInt(card[i], 10);
    
    if (double) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    double = !double;
  }
  
  return sum % 10 === 0;
}

/**
 * Verifică dacă o valoare este un cod poștal valid
 * @param value Valoarea de verificat
 * @returns true dacă valoarea este un cod poștal valid
 */
export function isPostalCode(value: string): boolean {
  // Eliminăm toate caracterele non-numerice
  const postalCode = value.replace(/\D/g, '');
  
  // Verificăm dacă codul poștal are 6 cifre
  return postalCode.length === 6;
}

/**
 * Verifică dacă o valoare este o parolă puternică
 * @param value Valoarea de verificat
 * @returns true dacă valoarea este o parolă puternică
 */
export function isStrongPassword(value: string): boolean {
  // Verificăm dacă parola are cel puțin 8 caractere
  if (value.length < 8) {
    return false;
  }
  
  // Verificăm dacă parola conține cel puțin o literă mare
  if (!/[A-Z]/.test(value)) {
    return false;
  }
  
  // Verificăm dacă parola conține cel puțin o literă mică
  if (!/[a-z]/.test(value)) {
    return false;
  }
  
  // Verificăm dacă parola conține cel puțin o cifră
  if (!/[0-9]/.test(value)) {
    return false;
  }
  
  // Verificăm dacă parola conține cel puțin un caracter special
  if (!/[^A-Za-z0-9]/.test(value)) {
    return false;
  }
  
  return true;
}

/**
 * Verifică dacă o valoare este un număr întreg
 * @param value Valoarea de verificat
 * @returns true dacă valoarea este un număr întreg
 */
export function isInteger(value: any): value is number {
  return isNumber(value) && Number.isInteger(value);
}

/**
 * Verifică dacă o valoare este un număr pozitiv
 * @param value Valoarea de verificat
 * @returns true dacă valoarea este un număr pozitiv
 */
export function isPositive(value: number): boolean {
  return isNumber(value) && value > 0;
}

/**
 * Verifică dacă o valoare este un număr negativ
 * @param value Valoarea de verificat
 * @returns true dacă valoarea este un număr negativ
 */
export function isNegative(value: number): boolean {
  return isNumber(value) && value < 0;
}

/**
 * Verifică dacă o valoare este un număr între două valori
 * @param value Valoarea de verificat
 * @param min Valoarea minimă
 * @param max Valoarea maximă
 * @returns true dacă valoarea este între min și max
 */
export function isBetween(value: number, min: number, max: number): boolean {
  return isNumber(value) && value >= min && value <= max;
}

/**
 * Verifică dacă o valoare este un JSON valid
 * @param value Valoarea de verificat
 * @returns true dacă valoarea este un JSON valid
 */
export function isValidJSON(value: string): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Verifică dacă o valoare este un hex color valid
 * @param value Valoarea de verificat
 * @returns true dacă valoarea este un hex color valid
 */
export function isHexColor(value: string): boolean {
  return /^#([A-Fa-f0-9]{3}){1,2}$/.test(value);
}

/**
 * Verifică dacă o valoare este un RGB color valid
 * @param value Valoarea de verificat
 * @returns true dacă valoarea este un RGB color valid
 */
export function isRGBColor(value: string): boolean {
  return /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(value);
}

/**
 * Verifică dacă o valoare este un RGBA color valid
 * @param value Valoarea de verificat
 * @returns true dacă valoarea este un RGBA color valid
 */
export function isRGBAColor(value: string): boolean {
  return /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(?:0|1|0?\.\d+)\s*\)$/.test(value);
}

// Exportăm toate funcțiile
export default {
  isDefined,
  isUndefined,
  isNull,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isFunction,
  isDate,
  isEmptyString,
  isEmptyArray,
  isEmptyObject,
  isEmail,
  isUrl,
  isPhoneNumber,
  isCNP,
  isCUI,
  isIBAN,
  isCreditCard,
  isPostalCode,
  isStrongPassword,
  isInteger,
  isPositive,
  isNegative,
  isBetween,
  isValidJSON,
  isHexColor,
  isRGBColor,
  isRGBAColor,
};
