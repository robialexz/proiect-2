/**
 * Script pentru generarea unui raport PDF din raportul Markdown
 * Utilizează markdown-pdf pentru a converti raportul Markdown în PDF
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import markdownpdf from 'markdown-pdf';

// Obținem directorul curent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurare
const REPORTS_DIR = path.join(__dirname, '..', 'reports');
const MARKDOWN_FILE = path.join(REPORTS_DIR, 'test-report-2025-04-18.md');
const PDF_FILE = path.join(REPORTS_DIR, 'test-report-2025-04-18.pdf');

// Asigurăm că directorul de rapoarte există
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Verificăm dacă fișierul Markdown există
if (!fs.existsSync(MARKDOWN_FILE)) {
  console.error(`Fișierul ${MARKDOWN_FILE} nu există.`);
  process.exit(1);
}

console.log(`Convertire ${MARKDOWN_FILE} în PDF...`);

// Opțiuni pentru markdown-pdf
const options = {
  paperFormat: 'A4',
  paperOrientation: 'portrait',
  paperBorder: '1cm',
};

// Convertim Markdown în PDF
markdownpdf(options)
  .from(MARKDOWN_FILE)
  .to(PDF_FILE, function (err) {
    if (err) {
      console.error('Eroare la convertirea în PDF:', err);
      process.exit(1);
    } else {
      console.log(`PDF generat cu succes: ${PDF_FILE}`);
    }
  });
