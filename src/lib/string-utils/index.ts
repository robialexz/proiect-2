/**
 * Exportă utilitarele pentru string-uri
 */

// Exportăm utilitarele pentru string-uri
export {
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
} from './string-utils';
export { default as stringUtils } from './string-utils';

// Export implicit pentru compatibilitate
export default {
  stringUtils,
};
