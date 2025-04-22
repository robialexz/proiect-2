/**
 * Script pentru generarea unui raport PDF din raportul Markdown
 * Utilizează markdown-pdf pentru a converti raportul Markdown în PDF
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import markdownpdf from 'markdown-pdf';
import * as globModule from 'glob';
const glob = globModule.glob;

// Obținem directorul curent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurare
const REPORTS_DIR = path.join(__dirname, '..', 'reports');

// Asigurăm că directorul de rapoarte există
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Funcție pentru a găsi cel mai recent raport Markdown
function findLatestMarkdownReport() {
  const mdFiles = glob(path.join(REPORTS_DIR, 'test-report-*.md'), { sync: true });

  if (mdFiles.length === 0) {
    console.error('Nu a fost găsit niciun raport Markdown. Rulați mai întâi "npm run generate-report".');
    process.exit(1);
  }

  // Sortăm fișierele după data modificării (cel mai recent primul)
  mdFiles.sort((a, b) => {
    return fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime();
  });

  return mdFiles[0];
}

// Funcție pentru a converti Markdown în PDF
function convertToPdf(markdownPath) {
  const pdfPath = markdownPath.replace('.md', '.pdf');

  console.log(`Convertire ${path.basename(markdownPath)} în PDF...`);

  // Opțiuni pentru markdown-pdf
  const options = {
    cssPath: path.join(__dirname, 'report-style.css'),
    paperFormat: 'A4',
    paperOrientation: 'portrait',
    paperBorder: '1cm',
    runningsPath: path.join(__dirname, 'report-header-footer.js')
  };

  // Creăm un fișier CSS simplu pentru stilizare
  const cssContent = `
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #333;
    }
    h1 {
      color: #2c3e50;
      font-size: 24px;
      margin-top: 20px;
      margin-bottom: 10px;
      page-break-before: always;
    }
    h1:first-of-type {
      page-break-before: avoid;
    }
    h2 {
      color: #3498db;
      font-size: 18px;
      margin-top: 15px;
      margin-bottom: 10px;
    }
    h3 {
      color: #2980b9;
      font-size: 16px;
      margin-top: 10px;
      margin-bottom: 5px;
    }
    p {
      margin-bottom: 10px;
    }
    ul, ol {
      margin-bottom: 10px;
      padding-left: 20px;
    }
    li {
      margin-bottom: 5px;
    }
    code {
      font-family: Consolas, Monaco, 'Andale Mono', monospace;
      background-color: #f5f5f5;
      padding: 2px 4px;
      border-radius: 3px;
    }
    pre {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 5px;
      overflow-x: auto;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 15px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
  `;

  fs.writeFileSync(path.join(__dirname, 'report-style.css'), cssContent);

  // Creăm un fișier JS pentru header și footer
  const headerFooterContent = `
    exports.header = {
      height: '1cm',
      contents: function(pageNum, numPages) {
        return '<div style="text-align: center; font-size: 10px; color: #777;">Raport de testare</div>';
      }
    };

    exports.footer = {
      height: '1cm',
      contents: function(pageNum, numPages) {
        return '<div style="text-align: center; font-size: 10px; color: #777;">Pagina ' + pageNum + ' din ' + numPages + '</div>';
      }
    };
  `;

  fs.writeFileSync(path.join(__dirname, 'report-header-footer.js'), headerFooterContent);

  // Convertim Markdown în PDF
  return new Promise((resolve, reject) => {
    markdownpdf(options)
      .from(markdownPath)
      .to(pdfPath, function (err) {
        if (err) {
          console.error('Eroare la convertirea în PDF:', err);
          reject(err);
        } else {
          console.log(`PDF generat cu succes: ${pdfPath}`);
          resolve(pdfPath);
        }
      });
  });
}

// Funcție principală
async function main() {
  try {
    // Găsim cel mai recent raport Markdown
    const latestMarkdownReport = findLatestMarkdownReport();
    console.log(`Cel mai recent raport Markdown: ${latestMarkdownReport}`);

    // Convertim în PDF
    await convertToPdf(latestMarkdownReport);

    // Curățăm fișierele temporare
    fs.unlinkSync(path.join(__dirname, 'report-style.css'));
    fs.unlinkSync(path.join(__dirname, 'report-header-footer.js'));

    console.log('Procesul de generare a raportului PDF a fost finalizat cu succes.');
  } catch (error) {
    console.error('Eroare:', error);
    process.exit(1);
  }
}

// Rulăm funcția principală
main();

