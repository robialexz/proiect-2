/**
 * Utilități pentru lucrul cu array-uri
 * Acest fișier conține funcții pentru lucrul cu array-uri
 */

/**
 * Grupează elementele unui array după o proprietate
 * @param array Array-ul de grupat
 * @param key Proprietatea după care se face gruparea
 * @returns Un obiect cu elementele grupate
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    result[groupKey] = result[groupKey] || [];
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Sortează un array după o proprietate
 * @param array Array-ul de sortat
 * @param key Proprietatea după care se face sortarea
 * @param direction Direcția de sortare
 * @returns Array-ul sortat
 */
export function sortBy<T>(
  array: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const valueA = a[key];
    const valueB = b[key];
    
    if (valueA === valueB) return 0;
    
    if (valueA === null || valueA === undefined) return direction === 'asc' ? -1 : 1;
    if (valueB === null || valueB === undefined) return direction === 'asc' ? 1 : -1;
    
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return direction === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    
    return direction === 'asc'
      ? (valueA as any) - (valueB as any)
      : (valueB as any) - (valueA as any);
  });
}

/**
 * Filtrează un array după o proprietate
 * @param array Array-ul de filtrat
 * @param key Proprietatea după care se face filtrarea
 * @param value Valoarea după care se face filtrarea
 * @returns Array-ul filtrat
 */
export function filterBy<T>(array: T[], key: keyof T, value: any): T[] {
  return array.filter((item) => item[key] === value);
}

/**
 * Caută în array după o proprietate
 * @param array Array-ul în care se caută
 * @param key Proprietatea după care se face căutarea
 * @param value Valoarea după care se face căutarea
 * @returns Elementul găsit sau undefined
 */
export function findBy<T>(array: T[], key: keyof T, value: any): T | undefined {
  return array.find((item) => item[key] === value);
}

/**
 * Elimină duplicatele dintr-un array
 * @param array Array-ul din care se elimină duplicatele
 * @returns Array-ul fără duplicate
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Elimină duplicatele dintr-un array după o proprietate
 * @param array Array-ul din care se elimină duplicatele
 * @param key Proprietatea după care se face eliminarea duplicatelor
 * @returns Array-ul fără duplicate
 */
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * Împarte un array în chunk-uri
 * @param array Array-ul de împărțit
 * @param size Dimensiunea chunk-urilor
 * @returns Array-ul împărțit în chunk-uri
 */
export function chunk<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, index) =>
    array.slice(index * size, index * size + size)
  );
}

/**
 * Aplatizează un array
 * @param array Array-ul de aplatizat
 * @returns Array-ul aplatizat
 */
export function flatten<T>(array: (T | T[])[]): T[] {
  return array.reduce((result, item) => {
    return result.concat(Array.isArray(item) ? item : [item]);
  }, [] as T[]);
}

/**
 * Intersecția a două array-uri
 * @param array1 Primul array
 * @param array2 Al doilea array
 * @returns Intersecția celor două array-uri
 */
export function intersection<T>(array1: T[], array2: T[]): T[] {
  return array1.filter((item) => array2.includes(item));
}

/**
 * Diferența dintre două array-uri
 * @param array1 Primul array
 * @param array2 Al doilea array
 * @returns Diferența dintre cele două array-uri
 */
export function difference<T>(array1: T[], array2: T[]): T[] {
  return array1.filter((item) => !array2.includes(item));
}

/**
 * Uniunea a două array-uri
 * @param array1 Primul array
 * @param array2 Al doilea array
 * @returns Uniunea celor două array-uri
 */
export function union<T>(array1: T[], array2: T[]): T[] {
  return unique([...array1, ...array2]);
}

/**
 * Verifică dacă un array conține un element
 * @param array Array-ul în care se caută
 * @param item Elementul căutat
 * @returns true dacă array-ul conține elementul
 */
export function contains<T>(array: T[], item: T): boolean {
  return array.includes(item);
}

/**
 * Verifică dacă un array conține un element după o proprietate
 * @param array Array-ul în care se caută
 * @param key Proprietatea după care se face căutarea
 * @param value Valoarea după care se face căutarea
 * @returns true dacă array-ul conține elementul
 */
export function containsBy<T>(array: T[], key: keyof T, value: any): boolean {
  return array.some((item) => item[key] === value);
}

/**
 * Calculează suma valorilor dintr-un array
 * @param array Array-ul pentru care se calculează suma
 * @returns Suma valorilor din array
 */
export function sum(array: number[]): number {
  return array.reduce((result, item) => result + item, 0);
}

/**
 * Calculează suma valorilor dintr-un array după o proprietate
 * @param array Array-ul pentru care se calculează suma
 * @param key Proprietatea după care se face calculul
 * @returns Suma valorilor din array
 */
export function sumBy<T>(array: T[], key: keyof T): number {
  return array.reduce((result, item) => {
    const value = item[key];
    return result + (typeof value === 'number' ? value : 0);
  }, 0);
}

/**
 * Calculează media valorilor dintr-un array
 * @param array Array-ul pentru care se calculează media
 * @returns Media valorilor din array
 */
export function average(array: number[]): number {
  if (array.length === 0) return 0;
  return sum(array) / array.length;
}

/**
 * Calculează media valorilor dintr-un array după o proprietate
 * @param array Array-ul pentru care se calculează media
 * @param key Proprietatea după care se face calculul
 * @returns Media valorilor din array
 */
export function averageBy<T>(array: T[], key: keyof T): number {
  if (array.length === 0) return 0;
  return sumBy(array, key) / array.length;
}

/**
 * Calculează valoarea minimă dintr-un array
 * @param array Array-ul pentru care se calculează minimul
 * @returns Valoarea minimă din array
 */
export function min(array: number[]): number {
  if (array.length === 0) return 0;
  return Math.min(...array);
}

/**
 * Calculează valoarea minimă dintr-un array după o proprietate
 * @param array Array-ul pentru care se calculează minimul
 * @param key Proprietatea după care se face calculul
 * @returns Valoarea minimă din array
 */
export function minBy<T>(array: T[], key: keyof T): number {
  if (array.length === 0) return 0;
  return Math.min(...array.map((item) => {
    const value = item[key];
    return typeof value === 'number' ? value : 0;
  }));
}

/**
 * Calculează valoarea maximă dintr-un array
 * @param array Array-ul pentru care se calculează maximul
 * @returns Valoarea maximă din array
 */
export function max(array: number[]): number {
  if (array.length === 0) return 0;
  return Math.max(...array);
}

/**
 * Calculează valoarea maximă dintr-un array după o proprietate
 * @param array Array-ul pentru care se calculează maximul
 * @param key Proprietatea după care se face calculul
 * @returns Valoarea maximă din array
 */
export function maxBy<T>(array: T[], key: keyof T): number {
  if (array.length === 0) return 0;
  return Math.max(...array.map((item) => {
    const value = item[key];
    return typeof value === 'number' ? value : 0;
  }));
}

/**
 * Amestecă elementele unui array
 * @param array Array-ul de amestecat
 * @returns Array-ul amestecat
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Extrage un element aleatoriu dintr-un array
 * @param array Array-ul din care se extrage elementul
 * @returns Elementul extras
 */
export function sample<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Extrage mai multe elemente aleatorii dintr-un array
 * @param array Array-ul din care se extrag elementele
 * @param count Numărul de elemente de extras
 * @returns Array-ul cu elementele extrase
 */
export function sampleSize<T>(array: T[], count: number): T[] {
  if (array.length === 0) return [];
  return shuffle(array).slice(0, count);
}

// Exportăm toate funcțiile
export default {
  groupBy,
  sortBy,
  filterBy,
  findBy,
  unique,
  uniqueBy,
  chunk,
  flatten,
  intersection,
  difference,
  union,
  contains,
  containsBy,
  sum,
  sumBy,
  average,
  averageBy,
  min,
  minBy,
  max,
  maxBy,
  shuffle,
  sample,
  sampleSize,
};
