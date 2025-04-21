/**
 * Script pentru rezolvarea problemelor cu URL-urile hardcodate
 * Acest script va înlocui URL-urile hardcodate cu variabile de mediu
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

// Funcție pentru a rezolva problemele cu URL-urile hardcodate
function fixHardcodedUrls(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let modifiedContent = content;
  let changes = 0;
  
  // Regex pentru a găsi URL-urile hardcodate
  const urlRegex = /(["'])(https?:\/\/[^"']+)\1/g;
  
  // Înlocuim URL-urile hardcodate cu variabile de mediu
  const urls = new Set();
  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    const url = match[2];
    urls.add(url);
  }
  
  // Creăm un obiect cu URL-urile și variabilele de mediu corespunzătoare
  const urlMap = {};
  let i = 1;
  for (const url of urls) {
    // Generăm un nume de variabilă bazat pe URL
    let varName = url
      .replace(/^https?:\/\//, '')
      .replace(/\.[a-z]+$/, '')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toUpperCase();
    
    // Adăugăm un număr dacă numele variabilei este prea lung
    if (varName.length > 30) {
      varName = `URL_${i++}`;
    }
    
    urlMap[url] = `process.env.${varName}`;
  }
  
  // Înlocuim URL-urile hardcodate cu variabilele de mediu
  for (const [url, varName] of Object.entries(urlMap)) {
    const regex = new RegExp(`(["'])(${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(\\1)`, 'g');
    modifiedContent = modifiedContent.replace(regex, `$1{${varName}}$3`);
    changes++;
  }
  
  // Adăugăm variabilele de mediu la începutul fișierului
  if (changes > 0) {
    // Verificăm dacă fișierul are deja importuri pentru process.env
    if (!modifiedContent.includes('process.env')) {
      // Adăugăm variabilele de mediu la începutul fișierului
      const envVars = Object.entries(urlMap)
        .map(([url, varName]) => `// ${varName} = "${url}";`)
        .join('\n');
      
      modifiedContent = `// Variabile de mediu pentru URL-uri\n${envVars}\n\n${modifiedContent}`;
    }
  }
  
  if (content !== modifiedContent) {
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, modifiedContent);
    }
  }
  
  return changes;
}

// Funcția principală
function main() {
  console.log('Rezolvarea problemelor cu URL-urile hardcodate...');
  
  // Obținem toate fișierele
  const files = getAllFiles();
  console.log(`S-au găsit ${files.length} fișiere pentru verificare.`);
  
  // Rezultatele
  const results = {
    urlsFixed: 0,
    filesModified: 0,
  };
  
  // Verificăm fiecare fișier
  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file);
    
    // Verificăm dacă fișierul conține URL-uri hardcodate
    const content = fs.readFileSync(file, 'utf-8');
    if (content.match(/(["'])(https?:\/\/[^"']+)\1/)) {
      console.log(`Verificare: ${relativePath}`);
      
      // Rezolvăm problemele cu URL-urile hardcodate
      const changes = fixHardcodedUrls(file);
      
      results.urlsFixed += changes;
      
      if (changes > 0) {
        results.filesModified++;
        console.log(`  Modificări în ${relativePath}: ${changes} URL-uri hardcodate rezolvate`);
      }
    }
  }
  
  // Afișăm rezultatele
  console.log('\n=== RAPORT FINAL ===');
  console.log(`Total fișiere verificate: ${files.length}`);
  console.log(`Fișiere modificate: ${results.filesModified}`);
  console.log(`URL-uri hardcodate rezolvate: ${results.urlsFixed}`);
  
  if (DRY_RUN) {
    console.log('\nAcesta a fost un dry run. Nicio modificare nu a fost aplicată.');
  }
  
  // Creăm un fișier .env.example cu toate variabilele de mediu
  if (results.urlsFixed > 0 && !DRY_RUN) {
    console.log('\nCrearea fișierului .env.example...');
    
    // Obținem toate variabilele de mediu
    const envVars = new Set();
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const regex = /process\.env\.([A-Z0-9_]+)/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        envVars.add(match[1]);
      }
    }
    
    // Creăm fișierul .env.example
    const envExample = Array.from(envVars)
      .map((varName) => `${varName}=`)
      .join('\n');
    
    fs.writeFileSync(path.join(__dirname, '../.env.example'), envExample);
    console.log('Fișierul .env.example a fost creat.');
  }
}

// Rulăm funcția principală
main();
