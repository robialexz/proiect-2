/**
 * Script pentru eliminarea declarațiilor console.log din cod
 * Acest script va elimina console.log, console.error, etc. din fișierele de cod
 */

const fs = require('fs');
const path = require('path');

// Configurație
const SRC_DIR = path.join(__dirname, '../src');
const IGNORE_DIRS = ['node_modules', 'dist', 'build', '.git', 'public'];
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const DRY_RUN = false; // Setați la true pentru a vedea modificările fără a le aplica

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

// Funcție pentru a elimina console.log
function removeConsoleStatements(content) {
  // Regex pentru a găsi console.log, console.error, etc.
  const consoleRegex = /console\.(log|error|warn|info|debug)\([^;]*\);?/g;
  
  // Înlocuim console.log cu comentarii
  return content.replace(consoleRegex, '// Removed console statement');
}

// Funcția principală
function main() {
  console.log('Eliminarea declarațiilor console.log din cod...');
  
  // Obținem toate fișierele
  const files = getAllFiles();
  console.log(`S-au găsit ${files.length} fișiere pentru verificare.`);
  
  // Rezultatele
  const results = {
    consoleStatementsRemoved: 0,
    filesModified: 0,
  };
  
  // Verificăm fiecare fișier
  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file);
    
    // Citim conținutul fișierului
    const content = fs.readFileSync(file, 'utf-8');
    
    // Eliminăm console.log
    const contentWithoutConsole = removeConsoleStatements(content);
    
    // Verificăm dacă s-au făcut modificări
    const consoleStatementsRemoved = (content.match(/console\.(log|error|warn|info|debug)/g) || []).length;
    
    results.consoleStatementsRemoved += consoleStatementsRemoved;
    
    if (content !== contentWithoutConsole) {
      results.filesModified++;
      
      console.log(`  Modificări în ${relativePath}:`);
      console.log(`    Console statements eliminate: ${consoleStatementsRemoved}`);
      
      // Salvăm modificările
      if (!DRY_RUN) {
        fs.writeFileSync(file, contentWithoutConsole);
      }
    }
  }
  
  // Afișăm rezultatele
  console.log('\n=== RAPORT FINAL ===');
  console.log(`Total fișiere verificate: ${files.length}`);
  console.log(`Fișiere modificate: ${results.filesModified}`);
  console.log(`Console statements eliminate: ${results.consoleStatementsRemoved}`);
  
  if (DRY_RUN) {
    console.log('\nAcesta a fost un dry run. Nicio modificare nu a fost aplicată.');
  }
}

// Rulăm funcția principală
main();
