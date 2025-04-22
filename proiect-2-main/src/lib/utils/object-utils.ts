/**
 * Utilități pentru lucrul cu obiecte
 * Acest fișier conține funcții pentru lucrul cu obiecte
 */

/**
 * Verifică dacă un obiect este gol
 * @param obj Obiectul de verificat
 * @returns true dacă obiectul este gol
 */
export function isEmpty(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Verifică dacă un obiect are o proprietate
 * @param obj Obiectul de verificat
 * @param key Proprietatea de verificat
 * @returns true dacă obiectul are proprietatea
 */
export function hasKey<T extends object>(obj: T, key: keyof any): key is keyof T {
  return key in obj;
}

/**
 * Obține valorile unui obiect
 * @param obj Obiectul din care se obțin valorile
 * @returns Array-ul cu valorile obiectului
 */
export function values<T>(obj: Record<string, T>): T[] {
  return Object.values(obj);
}

/**
 * Obține cheile unui obiect
 * @param obj Obiectul din care se obțin cheile
 * @returns Array-ul cu cheile obiectului
 */
export function keys<T extends object>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}

/**
 * Obține intrările unui obiect
 * @param obj Obiectul din care se obțin intrările
 * @returns Array-ul cu intrările obiectului
 */
export function entries<T extends object>(obj: T): Array<[keyof T, T[keyof T]]> {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
}

/**
 * Creează un obiect din intrări
 * @param entries Intrările din care se creează obiectul
 * @returns Obiectul creat
 */
export function fromEntries<K extends string | number | symbol, V>(
  entries: Array<[K, V]>
): Record<K, V> {
  return Object.fromEntries(entries) as Record<K, V>;
}

/**
 * Selectează proprietăți dintr-un obiect
 * @param obj Obiectul din care se selectează proprietățile
 * @param keys Proprietățile de selectat
 * @returns Obiectul cu proprietățile selectate
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {} as Pick<T, K>);
}

/**
 * Omite proprietăți dintr-un obiect
 * @param obj Obiectul din care se omit proprietățile
 * @param keys Proprietățile de omis
 * @returns Obiectul fără proprietățile omise
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
}

/**
 * Merge două obiecte
 * @param obj1 Primul obiect
 * @param obj2 Al doilea obiect
 * @returns Obiectul rezultat
 */
export function merge<T extends object, U extends object>(
  obj1: T,
  obj2: U
): T & U {
  return { ...obj1, ...obj2 };
}

/**
 * Merge adânc două obiecte
 * @param obj1 Primul obiect
 * @param obj2 Al doilea obiect
 * @returns Obiectul rezultat
 */
export function deepMerge<T extends object, U extends object>(
  obj1: T,
  obj2: U
): T & U {
  const result = { ...obj1 } as T & U;
  
  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      if (
        obj1[key as keyof T] &&
        typeof obj1[key as keyof T] === 'object' &&
        typeof obj2[key] === 'object' &&
        !Array.isArray(obj1[key as keyof T]) &&
        !Array.isArray(obj2[key])
      ) {
        result[key as keyof (T & U)] = deepMerge(
          obj1[key as keyof T] as object,
          obj2[key] as object
        ) as (T & U)[keyof (T & U)];
      } else {
        result[key as keyof (T & U)] = obj2[key] as (T & U)[keyof (T & U)];
      }
    }
  }
  
  return result;
}

/**
 * Clonează un obiect
 * @param obj Obiectul de clonat
 * @returns Clona obiectului
 */
export function clone<T>(obj: T): T {
  return { ...obj };
}

/**
 * Clonează adânc un obiect
 * @param obj Obiectul de clonat
 * @returns Clona adâncă a obiectului
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(deepClone) as unknown as T;
  }
  
  const result = {} as T;
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = deepClone(obj[key]);
    }
  }
  
  return result;
}

/**
 * Transformă un obiect
 * @param obj Obiectul de transformat
 * @param transformer Funcția de transformare
 * @returns Obiectul transformat
 */
export function mapValues<T extends object, U>(
  obj: T,
  transformer: (value: T[keyof T], key: keyof T, obj: T) => U
): Record<keyof T, U> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      transformer(value as T[keyof T], key as keyof T, obj),
    ])
  ) as Record<keyof T, U>;
}

/**
 * Transformă cheile unui obiect
 * @param obj Obiectul de transformat
 * @param transformer Funcția de transformare
 * @returns Obiectul transformat
 */
export function mapKeys<T extends object, K extends string | number | symbol>(
  obj: T,
  transformer: (key: keyof T, value: T[keyof T], obj: T) => K
): Record<K, T[keyof T]> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      transformer(key as keyof T, value as T[keyof T], obj),
      value,
    ])
  ) as Record<K, T[keyof T]>;
}

/**
 * Filtrează un obiect
 * @param obj Obiectul de filtrat
 * @param predicate Funcția de filtrare
 * @returns Obiectul filtrat
 */
export function filterObject<T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T, obj: T) => boolean
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, value]) =>
      predicate(value as T[keyof T], key as keyof T, obj)
    )
  ) as Partial<T>;
}

/**
 * Inversează cheile și valorile unui obiect
 * @param obj Obiectul de inversat
 * @returns Obiectul inversat
 */
export function invert<T extends object>(
  obj: T
): Record<string & T[keyof T], keyof T> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [String(value), key])
  ) as Record<string & T[keyof T], keyof T>;
}

/**
 * Aplatizează un obiect
 * @param obj Obiectul de aplatizat
 * @param prefix Prefixul pentru cheile aplatizate
 * @returns Obiectul aplatizat
 */
export function flatten(
  obj: Record<string, any>,
  prefix: string = ''
): Record<string, any> {
  return Object.entries(obj).reduce((result, [key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flatten(value, newKey));
    } else {
      result[newKey] = value;
    }
    
    return result;
  }, {} as Record<string, any>);
}

/**
 * Verifică dacă două obiecte sunt egale
 * @param obj1 Primul obiect
 * @param obj2 Al doilea obiect
 * @returns true dacă obiectele sunt egale
 */
export function isEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) {
    return true;
  }
  
  if (
    obj1 === null ||
    obj2 === null ||
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object'
  ) {
    return false;
  }
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  return keys1.every((key) => {
    return keys2.includes(key) && isEqual(obj1[key], obj2[key]);
  });
}

/**
 * Verifică dacă un obiect este un subset al altui obiect
 * @param subset Obiectul subset
 * @param superset Obiectul superset
 * @returns true dacă subset este un subset al superset
 */
export function isSubset(subset: Record<string, any>, superset: Record<string, any>): boolean {
  return Object.entries(subset).every(([key, value]) => {
    if (!(key in superset)) {
      return false;
    }
    
    if (value === null || typeof value !== 'object') {
      return value === superset[key];
    }
    
    if (superset[key] === null || typeof superset[key] !== 'object') {
      return false;
    }
    
    return isSubset(value, superset[key]);
  });
}

// Exportăm toate funcțiile
export default {
  isEmpty,
  hasKey,
  values,
  keys,
  entries,
  fromEntries,
  pick,
  omit,
  merge,
  deepMerge,
  clone,
  deepClone,
  mapValues,
  mapKeys,
  filterObject,
  invert,
  flatten,
  isEqual,
  isSubset,
};
