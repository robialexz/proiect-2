import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combină clase CSS cu Tailwind
 * @param inputs Clasele de combinat
 * @returns Clasele combinate
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatează o dată
 * @param date Data de formatat
 * @param options Opțiuni pentru formatare
 * @returns Data formatată
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {}
) {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...options,
  };

  return new Intl.DateTimeFormat("ro-RO", defaultOptions).format(
    typeof date === "string" || typeof date === "number" ? new Date(date) : date
  );
}

/**
 * Formatează un număr
 * @param number Numărul de formatat
 * @param options Opțiuni pentru formatare
 * @returns Numărul formatat
 */
export function formatNumber(
  number: number,
  options: Intl.NumberFormatOptions = {}
) {
  const defaultOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  };

  return new Intl.NumberFormat("ro-RO", defaultOptions).format(number);
}

/**
 * Formatează o sumă de bani
 * @param amount Suma de formatat
 * @param currency Moneda
 * @param options Opțiuni pentru formatare
 * @returns Suma formatată
 */
export function formatCurrency(
  amount: number,
  currency: string = "RON",
  options: Intl.NumberFormatOptions = {}
) {
  const defaultOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency,
    ...options,
  };

  return formatNumber(amount, defaultOptions);
}

/**
 * Truncează un text
 * @param text Textul de truncat
 * @param length Lungimea maximă
 * @param suffix Sufixul pentru truncare
 * @returns Textul truncat
 */
export function truncateText(
  text: string,
  length: number = 100,
  suffix: string = "..."
) {
  if (text.length <= length) {
    return text;
  }

  return text.substring(0, length).trim() + suffix;
}

/**
 * Generează un ID unic
 * @param prefix Prefixul pentru ID
 * @returns ID-ul generat
 */
export function generateId(prefix: string = "id") {
  return `${prefix}_${Math.random()
    .toString(36)
    .substring(2, 9)}_${Date.now().toString(36)}`;
}

/**
 * Întârzie execuția unei funcții
 * @param ms Timpul de întârziere în milisecunde
 * @returns Promise care se rezolvă după întârziere
 */
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Verifică dacă un obiect este gol
 * @param obj Obiectul de verificat
 * @returns True dacă obiectul este gol, false în caz contrar
 */
export function isEmptyObject(obj: Record<string, any>) {
  return Object.keys(obj).length === 0;
}

/**
 * Verifică dacă un array este gol
 * @param arr Array-ul de verificat
 * @returns True dacă array-ul este gol, false în caz contrar
 */
export function isEmptyArray(arr: any[]) {
  return Array.isArray(arr) && arr.length === 0;
}

/**
 * Grupează un array după o cheie
 * @param arr Array-ul de grupat
 * @param key Cheia pentru grupare
 * @returns Obiectul grupat
 */
export function groupBy<T>(arr: T[], key: keyof T) {
  return arr.reduce((result, item) => {
    const groupKey = String(item[key]);
    result[groupKey] = result[groupKey] || [];
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Sortează un array după o cheie
 * @param arr Array-ul de sortat
 * @param key Cheia pentru sortare
 * @param direction Direcția de sortare
 * @returns Array-ul sortat
 */
export function sortBy<T>(
  arr: T[],
  key: keyof T,
  direction: "asc" | "desc" = "asc"
) {
  return [...arr].sort((a, b) => {
    const valueA = a[key];
    const valueB = b[key];

    if (valueA === valueB) {
      return 0;
    }

    if (valueA === null || valueA === undefined) {
      return direction === "asc" ? -1 : 1;
    }

    if (valueB === null || valueB === undefined) {
      return direction === "asc" ? 1 : -1;
    }

    if (typeof valueA === "string" && typeof valueB === "string") {
      return direction === "asc"
        ? valueA.localeCompare(valueB, "ro")
        : valueB.localeCompare(valueA, "ro");
    }

    return direction === "asc"
      ? valueA < valueB
        ? -1
        : 1
      : valueA < valueB
      ? 1
      : -1;
  });
}

/**
 * Filtrează un array după o condiție
 * @param arr Array-ul de filtrat
 * @param predicate Funcția de predicat
 * @returns Array-ul filtrat
 */
export function filterBy<T>(arr: T[], predicate: (item: T) => boolean) {
  return arr.filter(predicate);
}

/**
 * Caută în array după un text
 * @param arr Array-ul în care se caută
 * @param searchText Textul de căutat
 * @param keys Cheile în care se caută
 * @returns Array-ul filtrat
 */
export function searchInArray<T>(
  arr: T[],
  searchText: string,
  keys: (keyof T)[]
) {
  if (!searchText) {
    return arr;
  }

  const normalizedSearchText = searchText.toLowerCase();

  return arr.filter((item) => {
    return keys.some((key) => {
      const value = item[key];

      if (value === null || value === undefined) {
        return false;
      }

      return String(value).toLowerCase().includes(normalizedSearchText);
    });
  });
}

/**
 * Paginează un array
 * @param arr Array-ul de paginat
 * @param page Pagina curentă
 * @param pageSize Dimensiunea paginii
 * @returns Array-ul paginat și informații despre paginare
 */
export function paginateArray<T>(
  arr: T[],
  page: number = 1,
  pageSize: number = 10
) {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const totalPages = Math.ceil(arr.length / pageSize);

  return {
    data: arr.slice(startIndex, endIndex),
    pagination: {
      page,
      pageSize,
      totalItems: arr.length,
      totalPages,
    },
  };
}

/**
 * Elimină duplicatele dintr-un array
 * @param arr Array-ul din care se elimină duplicatele
 * @param key Cheia pentru comparație
 * @returns Array-ul fără duplicate
 */
export function uniqueBy<T>(arr: T[], key: keyof T) {
  const seen = new Set();

  return arr.filter((item) => {
    const value = item[key];
    const valueKey = String(value);

    if (seen.has(valueKey)) {
      return false;
    }

    seen.add(valueKey);
    return true;
  });
}

/**
 * Verifică dacă un string este un email valid
 * @param email Email-ul de verificat
 * @returns True dacă email-ul este valid, false în caz contrar
 */
export function isValidEmail(email: string) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Verifică dacă un string este un număr de telefon valid
 * @param phone Numărul de telefon de verificat
 * @returns True dacă numărul de telefon este valid, false în caz contrar
 */
export function isValidPhone(phone: string) {
  const phoneRegex =
    /^(\+4|)?(07[0-8]{1}[0-9]{1}|02[0-9]{2}|03[0-9]{2}){1}?(\s|\.|\-)?([0-9]{3}(\s|\.|\-|)){2}$/;
  return phoneRegex.test(phone);
}

/**
 * Verifică dacă un string este un CNP valid
 * @param cnp CNP-ul de verificat
 * @returns True dacă CNP-ul este valid, false în caz contrar
 */
export function isValidCNP(cnp: string) {
  if (cnp.length !== 13) {
    return false;
  }

  const cnpRegex = /^[1-9]\d{12}$/;
  if (!cnpRegex.test(cnp)) {
    return false;
  }

  const controlNumber = "279146358279";
  let sum = 0;

  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnp[i]) * parseInt(controlNumber[i]);
  }

  const remainder = sum % 11;
  const controlDigit = remainder === 10 ? 1 : remainder;

  return controlDigit === parseInt(cnp[12]);
}

/**
 * Verifică dacă un string este un CUI valid
 * @param cui CUI-ul de verificat
 * @returns True dacă CUI-ul este valid, false în caz contrar
 */
export function isValidCUI(cui: string) {
  const cuiRegex = /^(RO)?\d{2,10}$/;
  if (!cuiRegex.test(cui)) {
    return false;
  }

  let cuiNumber = cui;
  if (cui.startsWith("RO")) {
    cuiNumber = cui.substring(2);
  }

  const controlNumber = "753217532";
  let sum = 0;

  for (let i = 0; i < cuiNumber.length - 1; i++) {
    sum +=
      parseInt(cuiNumber[i]) *
      parseInt(controlNumber[controlNumber.length - cuiNumber.length + i]);
  }

  const remainder = (sum * 10) % 11;
  const controlDigit = remainder === 10 ? 0 : remainder;

  return controlDigit === parseInt(cuiNumber[cuiNumber.length - 1]);
}

/**
 * Verifică dacă un string este un IBAN valid
 * @param iban IBAN-ul de verificat
 * @returns True dacă IBAN-ul este valid, false în caz contrar
 */
export function isValidIBAN(iban: string) {
  const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{16}$/;
  if (!ibanRegex.test(iban)) {
    return false;
  }

  const rearrangedIBAN = iban.substring(4) + iban.substring(0, 4);
  let sum = 0;

  for (let i = 0; i < rearrangedIBAN.length; i++) {
    const char = rearrangedIBAN[i];
    const value = char >= "A" ? char.charCodeAt(0) - 55 : parseInt(char);
    sum = (sum * 10 + value) % 97;
  }

  return sum === 1;
}

/**
 * Exportă toate funcțiile utilitare
 */
export default {
  cn,
  formatDate,
  formatNumber,
  formatCurrency,
  truncateText,
  generateId,
  delay,
  isEmptyObject,
  isEmptyArray,
  groupBy,
  sortBy,
  filterBy,
  searchInArray,
  paginateArray,
  uniqueBy,
  isValidEmail,
  isValidPhone,
  isValidCNP,
  isValidCUI,
  isValidIBAN,
};
