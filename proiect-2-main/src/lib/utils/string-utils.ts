/**
 * Utilități pentru lucrul cu string-uri
 * Acest fișier conține funcții pentru lucrul cu string-uri
 */

/**
 * Capitalizează primul caracter al unui string
 * @param str String-ul de capitalizat
 * @returns String-ul cu primul caracter capitalizat
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Capitalizează fiecare cuvânt dintr-un string
 * @param str String-ul de capitalizat
 * @returns String-ul cu fiecare cuvânt capitalizat
 */
export function capitalizeWords(str: string): string {
  if (!str) return '';
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Truncează un string la o lungime maximă
 * @param str String-ul de truncat
 * @param maxLength Lungimea maximă
 * @param suffix Sufixul de adăugat
 * @returns String-ul truncat
 */
export function truncate(str: string, maxLength: number, suffix: string = '...'): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Elimină diacriticele dintr-un string
 * @param str String-ul de procesat
 * @returns String-ul fără diacritice
 */
export function removeDiacritics(str: string): string {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Generează un slug dintr-un string
 * @param str String-ul de procesat
 * @returns Slug-ul generat
 */
export function slugify(str: string): string {
  if (!str) return '';
  return removeDiacritics(str)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generează un ID unic
 * @param prefix Prefixul pentru ID
 * @returns ID-ul generat
 */
export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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
  
  // Verificăm dacă numărul are lungimea corectă
  if (cleaned.length !== 10) return phone;
  
  // Formatăm numărul
  return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
}

/**
 * Formatează un CNP
 * @param cnp CNP-ul
 * @returns CNP-ul formatat
 */
export function formatCNP(cnp: string): string {
  if (!cnp) return '';
  
  // Eliminăm toate caracterele non-numerice
  const cleaned = cnp.replace(/\D/g, '');
  
  // Verificăm dacă CNP-ul are lungimea corectă
  if (cleaned.length !== 13) return cnp;
  
  // Formatăm CNP-ul
  return `${cleaned.slice(0, 1)} ${cleaned.slice(1, 7)} ${cleaned.slice(7)}`;
}

/**
 * Formatează un număr de card
 * @param card Numărul de card
 * @returns Numărul de card formatat
 */
export function formatCardNumber(card: string): string {
  if (!card) return '';
  
  // Eliminăm toate caracterele non-numerice
  const cleaned = card.replace(/\D/g, '');
  
  // Verificăm dacă numărul are lungimea corectă
  if (cleaned.length !== 16) return card;
  
  // Formatăm numărul
  return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8, 12)} ${cleaned.slice(12)}`;
}

/**
 * Formatează un IBAN
 * @param iban IBAN-ul
 * @returns IBAN-ul formatat
 */
export function formatIBAN(iban: string): string {
  if (!iban) return '';
  
  // Eliminăm toate spațiile
  const cleaned = iban.replace(/\s/g, '');
  
  // Formatăm IBAN-ul
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Formatează o sumă de bani
 * @param amount Suma de bani
 * @param currency Moneda
 * @returns Suma de bani formatată
 */
export function formatMoney(amount: number, currency: string = 'RON'): string {
  if (amount === undefined || amount === null) return '';
  
  // Formatăm suma
  const formatted = amount.toLocaleString('ro-RO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return `${formatted} ${currency}`;
}

/**
 * Formatează un număr
 * @param number Numărul
 * @param decimals Numărul de zecimale
 * @returns Numărul formatat
 */
export function formatNumber(number: number, decimals: number = 2): string {
  if (number === undefined || number === null) return '';
  
  // Formatăm numărul
  return number.toLocaleString('ro-RO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formatează un procent
 * @param percent Procentul
 * @param decimals Numărul de zecimale
 * @returns Procentul formatat
 */
export function formatPercent(percent: number, decimals: number = 2): string {
  if (percent === undefined || percent === null) return '';
  
  // Formatăm procentul
  return `${percent.toLocaleString('ro-RO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}

/**
 * Formatează o dimensiune de fișier
 * @param bytes Dimensiunea în bytes
 * @param decimals Numărul de zecimale
 * @returns Dimensiunea formatată
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Formatează o durată
 * @param seconds Durata în secunde
 * @returns Durata formatată
 */
export function formatDuration(seconds: number): string {
  if (seconds === undefined || seconds === null) return '';
  
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
 * Generează un text Lorem Ipsum
 * @param paragraphs Numărul de paragrafe
 * @param sentencesPerParagraph Numărul de propoziții per paragraf
 * @returns Textul Lorem Ipsum
 */
export function loremIpsum(paragraphs: number = 1, sentencesPerParagraph: number = 5): string {
  const sentences = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Nullam auctor, nisl eget ultricies aliquam, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.',
    'Donec euismod, nisl eget ultricies aliquam, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.',
    'Sed euismod, nisl eget ultricies aliquam, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.',
    'Fusce euismod, nisl eget ultricies aliquam, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.',
    'Vivamus euismod, nisl eget ultricies aliquam, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.',
    'Curabitur euismod, nisl eget ultricies aliquam, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.',
    'Pellentesque euismod, nisl eget ultricies aliquam, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.',
    'Etiam euismod, nisl eget ultricies aliquam, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.',
    'Vestibulum euismod, nisl eget ultricies aliquam, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.',
  ];
  
  const result = [];
  
  for (let i = 0; i < paragraphs; i++) {
    const paragraph = [];
    
    for (let j = 0; j < sentencesPerParagraph; j++) {
      const randomIndex = Math.floor(Math.random() * sentences.length);
      paragraph.push(sentences[randomIndex]);
    }
    
    result.push(paragraph.join(' '));
  }
  
  return result.join('\n\n');
}

// Exportăm toate funcțiile
export default {
  capitalize,
  capitalizeWords,
  truncate,
  removeDiacritics,
  slugify,
  generateId,
  formatPhoneNumber,
  formatCNP,
  formatCardNumber,
  formatIBAN,
  formatMoney,
  formatNumber,
  formatPercent,
  formatFileSize,
  formatDuration,
  loremIpsum,
};
