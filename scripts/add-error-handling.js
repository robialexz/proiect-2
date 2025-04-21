/**
 * Script pentru adăugarea gestionării erorilor pentru operațiile asincrone
 * Acest script va adăuga try-catch pentru operațiile await care nu au gestionarea erorilor
 */

const fs = require('fs');
const path = require('path');

// Configurație
const SRC_DIR = path.join(__dirname, '../src');
const IGNORE_DIRS = ['node_modules', 'dist', 'build', '.git', 'public'];
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const DRY_RUN = false; // Setați la true pentru a vedea modificările fără a le aplica
const MAX_FILES = 100; // Numărul maxim de fișiere de procesat într-o singură rulare

// Funcție pentru a obține toate fișierele din directorul src
function getAllFiles() {
  const files = [];

  function scanDirectory(directory) {
    const items = fs.readdirSync(directory);

    for (const item of items) {
      const itemPath = path.join(directory, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        if (!IGNORE_DIRS.includes(item)) {
          scanDirectory(itemPath);
        }
      } else if (EXTENSIONS.includes(path.extname(item))) {
        files.push(itemPath);
      }
    }
  }

  scanDirectory(SRC_DIR);
  return files;
}

// Funcție pentru a adăuga gestionarea erorilor pentru operațiile asincrone
function addErrorHandling(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let modifiedContent = content;
  let changes = 0;

  // Regex pentru a găsi operațiile asincrone fără gestionarea erorilor
  // Căutăm linii care conțin await, dar nu sunt într-un bloc try-catch
  const lines = content.split('\n');
  const newLines = [...lines];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Verificăm dacă linia conține await
    if (line.includes('await ') && !line.includes('try {') && !line.includes('catch')) {
      // Verificăm dacă await este deja într-un bloc try-catch
      let inTryCatch = false;

      // Verificăm liniile anterioare pentru a vedea dacă suntem într-un bloc try
      for (let j = i - 1; j >= Math.max(0, i - 10); j--) {
        if (lines[j].includes('try {')) {
          inTryCatch = true;
          break;
        }
        if (lines[j].includes('}')) {
          break;
        }
      }

      if (!inTryCatch) {
        // Determinăm indentarea
        const indentation = line.match(/^(\s*)/)[1];

        // Adăugăm try-catch
        newLines[i] = `${indentation}try {\n${line}\n${indentation}} catch (error) {\n${indentation}  // Handle error appropriately\n${indentation}}`;
        changes++;
      }
    }
  }

  modifiedContent = newLines.join('\n');

  if (content !== modifiedContent) {
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, modifiedContent);
    }
  }

  return changes;
}

// Funcția principală
function main() {
  console.log('Adăugarea gestionării erorilor pentru operațiile asincrone...');

  // Obținem toate fișierele
  const allFiles = getAllFiles();

  // Filtrăm fișierele care conțin await
  const filesToProcess = [];

  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes('await ')) {
      // Verificăm dacă fișierul a fost deja procesat
      // Dacă nu conține "try {" urmat de "await" în aceeași linie sau în linia următoare,
      // înseamnă că nu a fost procesat complet
      if (!content.match(/try\s*{[^}]*await/) || content.match(/await[^;]*;(?![^}]*catch)/)) {
        filesToProcess.push(file);
      }
    }
  }

  console.log(`S-au găsit ${filesToProcess.length} fișiere cu operații asincrone neprotejate.`);

  // Procesăm doar un număr limitat de fișiere
  const filesToProcessNow = filesToProcess.slice(0, MAX_FILES);

  console.log(`Se procesează ${filesToProcessNow.length} fișiere în această rulare.`);

  // Rezultatele
  const results = {
    errorHandlingAdded: 0,
    filesModified: 0,
  };

  // Procesăm fiecare fișier
  for (const file of filesToProcessNow) {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`Procesare: ${relativePath}`);

    // Adăugăm gestionarea erorilor
    const changes = addErrorHandling(file);

    results.errorHandlingAdded += changes;

    if (changes > 0) {
      results.filesModified++;
      console.log(`  Modificări în ${relativePath}: ${changes} operații asincrone protejate`);
    }
  }

  // Afișăm rezultatele
  console.log('\n=== RAPORT FINAL ===');
  console.log(`Total fișiere procesate: ${filesToProcessNow.length}`);
  console.log(`Fișiere modificate: ${results.filesModified}`);
  console.log(`Operații asincrone protejate: ${results.errorHandlingAdded}`);

  if (DRY_RUN) {
    console.log('\nAcesta a fost un dry run. Nicio modificare nu a fost aplicată.');
  }

  if (filesToProcess.length > MAX_FILES) {
    console.log(`\nMai sunt ${filesToProcess.length - MAX_FILES} fișiere de procesat. Rulați scriptul din nou pentru a continua.`);
  }
}

// Rulăm funcția principală
main();
