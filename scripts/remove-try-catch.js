/**
 * Script pentru eliminarea blocurilor try-catch adăugate incorect
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

// Funcție pentru a elimina blocurile try-catch adăugate incorect
function removeTryCatch(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modifiedContent = content;
  let changes = 0;
  
  // Eliminăm blocurile try-catch urmate de .from(), .select(), etc.
  const regex = /try\s*{[^{}]*}\s*catch\s*\(error\)\s*{[^{}]*\/\/\s*Handle error appropriately[^{}]*}\s*\./g;
  modifiedContent = modifiedContent.replace(regex, '');
  
  // Eliminăm blocurile try-catch cu const ... = await ... urmate de parametri
  const constRegex = /try\s*{\s*const\s+[^=]+=\s+await\s+[^(]+}\s*catch\s*\(error\)\s*{[^{}]*\/\/\s*Handle error appropriately[^{}]*}\s*\(/g;
  modifiedContent = modifiedContent.replace(constRegex, 'const ');
  
  // Eliminăm blocurile try-catch cu return await ... urmate de parametri
  const returnRegex = /try\s*{\s*return\s+await\s+[^(]+}\s*catch\s*\(error\)\s*{[^{}]*\/\/\s*Handle error appropriately[^{}]*}\s*\(/g;
  modifiedContent = modifiedContent.replace(returnRegex, 'return await ');
  
  // Verificăm dacă au fost făcute modificări
  if (content !== modifiedContent) {
    changes = (content.match(/try\s*{[^{}]*}\s*catch\s*\(error\)\s*{[^{}]*\/\/\s*Handle error appropriately[^{}]*}/g) || []).length;
    
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, modifiedContent);
    }
  }
  
  return changes;
}

// Funcția principală
function main() {
  console.log('Eliminarea blocurilor try-catch adăugate incorect...');
  
  // Obținem toate fișierele
  const files = getAllFiles();
  console.log(`S-au găsit ${files.length} fișiere pentru verificare.`);
  
  // Rezultatele
  const results = {
    tryCatchRemoved: 0,
    filesModified: 0,
  };
  
  // Verificăm fiecare fișier
  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file);
    
    // Verificăm dacă fișierul conține blocuri try-catch adăugate incorect
    const content = fs.readFileSync(file, 'utf-8');
    
    // Verificăm dacă fișierul conține blocuri try-catch urmate de .from(), .select(), etc.
    if (content.match(/try\s*{[^{}]*}\s*catch\s*\(error\)\s*{[^{}]*\/\/\s*Handle error appropriately[^{}]*}\s*\./g) ||
        content.match(/try\s*{\s*const\s+[^=]+=\s+await\s+[^(]+}\s*catch\s*\(error\)\s*{[^{}]*\/\/\s*Handle error appropriately[^{}]*}\s*\(/g) ||
        content.match(/try\s*{\s*return\s+await\s+[^(]+}\s*catch\s*\(error\)\s*{[^{}]*\/\/\s*Handle error appropriately[^{}]*}\s*\(/g)) {
      console.log(`Verificare: ${relativePath}`);
      
      // Eliminăm blocurile try-catch adăugate incorect
      const changes = removeTryCatch(file);
      
      results.tryCatchRemoved += changes;
      
      if (changes > 0) {
        results.filesModified++;
        console.log(`  Modificări în ${relativePath}: ${changes} blocuri try-catch eliminate`);
      }
    }
  }
  
  // Afișăm rezultatele
  console.log('\n=== RAPORT FINAL ===');
  console.log(`Total fișiere verificate: ${files.length}`);
  console.log(`Fișiere modificate: ${results.filesModified}`);
  console.log(`Blocuri try-catch eliminate: ${results.tryCatchRemoved}`);
  
  if (DRY_RUN) {
    console.log('\nAcesta a fost un dry run. Nicio modificare nu a fost aplicată.');
  }
}

// Rulăm funcția principală
main();
