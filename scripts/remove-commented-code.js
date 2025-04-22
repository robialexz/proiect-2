/**
 * Script pentru eliminarea codului comentat
 * Acest script va elimina codul comentat din fișierele de cod
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

// Funcție pentru a elimina codul comentat
function removeCommentedCode(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let modifiedContent = content;
  let changes = 0;
  
  // Regex pentru a găsi codul comentat
  const commentedCodeRegex = /\/\/\s*[a-zA-Z0-9]+.*[;{}]/g;
  
  // Înlocuim codul comentat cu nimic
  modifiedContent = modifiedContent.replace(commentedCodeRegex, '');
  
  // Numărăm modificările
  changes = (content.match(commentedCodeRegex) || []).length;
  
  if (content !== modifiedContent) {
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, modifiedContent);
    }
  }
  
  return changes;
}

// Funcția principală
function main() {
  console.log('Eliminarea codului comentat...');
  
  // Obținem toate fișierele
  const files = getAllFiles();
  console.log(`S-au găsit ${files.length} fișiere pentru verificare.`);
  
  // Rezultatele
  const results = {
    commentedCodeRemoved: 0,
    filesModified: 0,
  };
  
  // Verificăm fiecare fișier
  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file);
    
    // Verificăm dacă fișierul conține cod comentat
    const content = fs.readFileSync(file, 'utf-8');
    if (content.match(/\/\/\s*[a-zA-Z0-9]+.*[;{}]/)) {
      console.log(`Verificare: ${relativePath}`);
      
      // Eliminăm codul comentat
      const changes = removeCommentedCode(file);
      
      results.commentedCodeRemoved += changes;
      
      if (changes > 0) {
        results.filesModified++;
        console.log(`  Modificări în ${relativePath}: ${changes} linii de cod comentat eliminate`);
      }
    }
  }
  
  // Afișăm rezultatele
  console.log('\n=== RAPORT FINAL ===');
  console.log(`Total fișiere verificate: ${files.length}`);
  console.log(`Fișiere modificate: ${results.filesModified}`);
  console.log(`Linii de cod comentat eliminate: ${results.commentedCodeRemoved}`);
  
  if (DRY_RUN) {
    console.log('\nAcesta a fost un dry run. Nicio modificare nu a fost aplicată.');
  }
}

// Rulăm funcția principală
main();
