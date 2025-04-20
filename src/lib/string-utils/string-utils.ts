/**
 * Utilități pentru string-uri
 * Acest fișier conține funcții pentru lucrul cu string-uri
 */

/**
 * Capitalizează prima literă a unui string
 * @param str String-ul de capitalizat
 * @returns String-ul capitalizat
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Capitalizează fiecare cuvânt dintr-un string
 * @param str String-ul de capitalizat
 * @returns String-ul capitalizat
 */
export function capitalizeWords(str: string): string {
  if (!str) return '';
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Transformă un string în camelCase
 * @param str String-ul de transformat
 * @returns String-ul în camelCase
 */
export function camelCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

/**
 * Transformă un string în PascalCase
 * @param str String-ul de transformat
 * @returns String-ul în PascalCase
 */
export function pascalCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/\s+/g, '');
}

/**
 * Transformă un string în snake_case
 * @param str String-ul de transformat
 * @returns String-ul în snake_case
 */
export function snakeCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/\s+/g, '_')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase();
}

/**
 * Transformă un string în kebab-case
 * @param str String-ul de transformat
 * @returns String-ul în kebab-case
 */
export function kebabCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/\s+/g, '-')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Transformă un string în CONSTANT_CASE
 * @param str String-ul de transformat
 * @returns String-ul în CONSTANT_CASE
 */
export function constantCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/\s+/g, '_')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toUpperCase();
}

/**
 * Transformă un string în dotCase
 * @param str String-ul de transformat
 * @returns String-ul în dotCase
 */
export function dotCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/\s+/g, '.')
    .replace(/([a-z])([A-Z])/g, '$1.$2')
    .toLowerCase();
}

/**
 * Transformă un string în path/case
 * @param str String-ul de transformat
 * @returns String-ul în path/case
 */
export function pathCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/\s+/g, '/')
    .replace(/([a-z])([A-Z])/g, '$1/$2')
    .toLowerCase();
}

/**
 * Transformă un string în Title Case
 * @param str String-ul de transformat
 * @returns String-ul în Title Case
 */
export function titleCase(str: string): string {
  if (!str) return '';
  return str.replace(/\b\w+/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

/**
 * Transformă un string în sentence case
 * @param str String-ul de transformat
 * @returns String-ul în sentence case
 */
export function sentenceCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Transformă un string în slug
 * @param str String-ul de transformat
 * @returns String-ul în slug
 */
export function slugify(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Transformă un string în URL
 * @param str String-ul de transformat
 * @returns String-ul în URL
 */
export function urlify(str: string): string {
  if (!str) return '';
  return encodeURIComponent(slugify(str));
}

/**
 * Transformă un string în HTML
 * @param str String-ul de transformat
 * @returns String-ul în HTML
 */
export function htmlify(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Transformă un string în HTML cu păstrarea newline-urilor
 * @param str String-ul de transformat
 * @returns String-ul în HTML
 */
export function htmlifyWithNewlines(str: string): string {
  if (!str) return '';
  return htmlify(str).replace(/\n/g, '<br>');
}

/**
 * Transformă un string în HTML cu păstrarea newline-urilor și link-urilor
 * @param str String-ul de transformat
 * @returns String-ul în HTML
 */
export function htmlifyWithLinks(str: string): string {
  if (!str) return '';
  return htmlifyWithNewlines(str).replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );
}

/**
 * Transformă un string în text pentru afișare
 * @param str String-ul de transformat
 * @param maxLength Lungimea maximă
 * @param suffix Sufixul de adăugat
 * @returns String-ul pentru afișare
 */
export function truncate(str: string, maxLength: number = 100, suffix: string = '...'): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Transformă un string în text pentru căutare
 * @param str String-ul de transformat
 * @returns String-ul pentru căutare
 */
export function searchify(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Transformă un string în text pentru comparare
 * @param str String-ul de transformat
 * @returns String-ul pentru comparare
 */
export function comparify(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

/**
 * Transformă un string în text pentru sortare
 * @param str String-ul de transformat
 * @returns String-ul pentru sortare
 */
export function sortify(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .trim();
}

/**
 * Transformă un string în text pentru filtrare
 * @param str String-ul de transformat
 * @returns String-ul pentru filtrare
 */
export function filterify(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Transformă un string în text pentru indexare
 * @param str String-ul de transformat
 * @returns String-ul pentru indexare
 */
export function indexify(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Transformă un string în text pentru tokenizare
 * @param str String-ul de transformat
 * @returns String-ul pentru tokenizare
 */
export function tokenify(str: string): string[] {
  if (!str) return [];
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ');
}

/**
 * Transformă un string în text pentru stemming
 * @param str String-ul de transformat
 * @returns String-ul pentru stemming
 */
export function stemmify(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Transformă un string în text pentru lemmatizare
 * @param str String-ul de transformat
 * @returns String-ul pentru lemmatizare
 */
export function lemmatify(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Transformă un string în text pentru normalizare
 * @param str String-ul de transformat
 * @returns String-ul pentru normalizare
 */
export function normalize(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Transformă un string în text pentru diacritice
 * @param str String-ul de transformat
 * @returns String-ul pentru diacritice
 */
export function diacriticify(str: string): string {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Transformă un string în text pentru accente
 * @param str String-ul de transformat
 * @returns String-ul pentru accente
 */
export function accentify(str: string): string {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Transformă un string în text pentru punctuație
 * @param str String-ul de transformat
 * @returns String-ul pentru punctuație
 */
export function punctuationify(str: string): string {
  if (!str) return '';
  return str.replace(/[^\w\s]/g, '');
}

/**
 * Transformă un string în text pentru spații
 * @param str String-ul de transformat
 * @returns String-ul pentru spații
 */
export function spacify(str: string): string {
  if (!str) return '';
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Transformă un string în text pentru cuvinte
 * @param str String-ul de transformat
 * @returns String-ul pentru cuvinte
 */
export function wordify(str: string): string[] {
  if (!str) return [];
  return str
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ');
}

/**
 * Transformă un string în text pentru caractere
 * @param str String-ul de transformat
 * @returns String-ul pentru caractere
 */
export function characterify(str: string): string[] {
  if (!str) return [];
  return str.split('');
}

/**
 * Transformă un string în text pentru linii
 * @param str String-ul de transformat
 * @returns String-ul pentru linii
 */
export function lineify(str: string): string[] {
  if (!str) return [];
  return str.split('\n');
}

/**
 * Transformă un string în text pentru paragrafe
 * @param str String-ul de transformat
 * @returns String-ul pentru paragrafe
 */
export function paragraphify(str: string): string[] {
  if (!str) return [];
  return str.split(/\n\s*\n/);
}

/**
 * Transformă un string în text pentru fraze
 * @param str String-ul de transformat
 * @returns String-ul pentru fraze
 */
export function sentencify(str: string): string[] {
  if (!str) return [];
  return str.split(/[.!?]+/);
}

/**
 * Transformă un string în text pentru cuvinte cheie
 * @param str String-ul de transformat
 * @returns String-ul pentru cuvinte cheie
 */
export function keywordify(str: string): string[] {
  if (!str) return [];
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ');
}

/**
 * Transformă un string în text pentru hashtag-uri
 * @param str String-ul de transformat
 * @returns String-ul pentru hashtag-uri
 */
export function hashtagify(str: string): string[] {
  if (!str) return [];
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => `#${word}`);
}

/**
 * Transformă un string în text pentru mention-uri
 * @param str String-ul de transformat
 * @returns String-ul pentru mention-uri
 */
export function mentionify(str: string): string[] {
  if (!str) return [];
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => `@${word}`);
}

/**
 * Transformă un string în text pentru emoji-uri
 * @param str String-ul de transformat
 * @returns String-ul pentru emoji-uri
 */
export function emojify(str: string): string {
  if (!str) return '';
  return str
    .replace(/:smile:/g, '😊')
    .replace(/:sad:/g, '😢')
    .replace(/:laugh:/g, '😂')
    .replace(/:cry:/g, '😭')
    .replace(/:angry:/g, '😠')
    .replace(/:heart:/g, '❤️')
    .replace(/:thumbsup:/g, '👍')
    .replace(/:thumbsdown:/g, '👎')
    .replace(/:clap:/g, '👏')
    .replace(/:fire:/g, '🔥')
    .replace(/:star:/g, '⭐')
    .replace(/:check:/g, '✅')
    .replace(/:x:/g, '❌')
    .replace(/:warning:/g, '⚠️')
    .replace(/:info:/g, 'ℹ️')
    .replace(/:question:/g, '❓')
    .replace(/:exclamation:/g, '❗')
    .replace(/:rocket:/g, '🚀')
    .replace(/:gear:/g, '⚙️')
    .replace(/:lock:/g, '🔒')
    .replace(/:unlock:/g, '🔓')
    .replace(/:key:/g, '🔑')
    .replace(/:money:/g, '💰')
    .replace(/:calendar:/g, '📅')
    .replace(/:clock:/g, '🕒')
    .replace(/:email:/g, '📧')
    .replace(/:phone:/g, '📱')
    .replace(/:computer:/g, '💻')
    .replace(/:document:/g, '📄')
    .replace(/:folder:/g, '📁')
    .replace(/:image:/g, '🖼️')
    .replace(/:video:/g, '🎥')
    .replace(/:audio:/g, '🔊')
    .replace(/:link:/g, '🔗')
    .replace(/:search:/g, '🔍')
    .replace(/:home:/g, '🏠')
    .replace(/:user:/g, '👤')
    .replace(/:users:/g, '👥')
    .replace(/:settings:/g, '⚙️')
    .replace(/:help:/g, '❓')
    .replace(/:info:/g, 'ℹ️')
    .replace(/:warning:/g, '⚠️')
    .replace(/:error:/g, '❌')
    .replace(/:success:/g, '✅')
    .replace(/:bell:/g, '🔔')
    .replace(/:mute:/g, '🔕')
    .replace(/:volume:/g, '🔊')
    .replace(/:muted:/g, '🔇')
    .replace(/:play:/g, '▶️')
    .replace(/:pause:/g, '⏸️')
    .replace(/:stop:/g, '⏹️')
    .replace(/:next:/g, '⏭️')
    .replace(/:previous:/g, '⏮️')
    .replace(/:fast_forward:/g, '⏩')
    .replace(/:rewind:/g, '⏪')
    .replace(/:repeat:/g, '🔁')
    .replace(/:shuffle:/g, '🔀')
    .replace(/:eject:/g, '⏏️');
}

// Exportăm toate funcțiile
export default {
  capitalize,
  capitalizeWords,
  camelCase,
  pascalCase,
  snakeCase,
  kebabCase,
  constantCase,
  dotCase,
  pathCase,
  titleCase,
  sentenceCase,
  slugify,
  urlify,
  htmlify,
  htmlifyWithNewlines,
  htmlifyWithLinks,
  truncate,
  searchify,
  comparify,
  sortify,
  filterify,
  indexify,
  tokenify,
  stemmify,
  lemmatify,
  normalize,
  diacriticify,
  accentify,
  punctuationify,
  spacify,
  wordify,
  characterify,
  lineify,
  paragraphify,
  sentencify,
  keywordify,
  hashtagify,
  mentionify,
  emojify,
};
