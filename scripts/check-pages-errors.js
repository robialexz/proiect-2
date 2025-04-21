/**
 * Script pentru verificarea erorilor pe fiecare pagină
 * Acest script va deschide fiecare pagină din aplicație și va verifica erorile din consolă
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configurație
const BASE_URL = 'http://localhost:5173'; // Schimbă portul dacă este necesar
const PAGES_DIR = path.join(__dirname, '../src/pages');
const TIMEOUT = 10000; // 10 secunde pentru încărcarea fiecărei pagini
const IGNORE_ERRORS = [
  // Erori care pot fi ignorate (regex)
  /Download the React DevTools/i,
  /React does not recognize the.*prop on a DOM element/i,
  /Warning: ReactDOM.render is no longer supported/i,
];

// Funcție pentru a obține toate paginile din directorul pages
function getAllPages() {
  const pages = [];
  
  function scanDirectory(directory) {
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        // Extragem ruta din calea fișierului
        let route = filePath
          .replace(PAGES_DIR, '')
          .replace(/\\/g, '/')
          .replace(/\.(tsx|jsx)$/, '')
          .replace(/\/index$/, '/');
        
        // Ignorăm paginile de layout și componente
        if (!file.includes('Layout') && !file.includes('Component')) {
          // Transformăm ruta în URL
          if (route.includes('[') && route.includes(']')) {
            // Înlocuim parametrii dinamici cu valori de test
            route = route.replace(/\[([^\]]+)\]/g, 'test-$1');
          }
          
          pages.push(route);
        }
      }
    }
  }
  
  scanDirectory(PAGES_DIR);
  return pages;
}

// Funcție pentru a verifica erorile pe o pagină
async function checkPageForErrors(page, url) {
  const errors = [];
  const warnings = [];
  
  // Interceptăm erorile din consolă
  page.on('console', (message) => {
    const type = message.type();
    const text = message.text();
    
    // Verificăm dacă eroarea trebuie ignorată
    const shouldIgnore = IGNORE_ERRORS.some((regex) => regex.test(text));
    
    if (!shouldIgnore) {
      if (type === 'error') {
        errors.push(text);
      } else if (type === 'warning') {
        warnings.push(text);
      }
    }
  });
  
  // Interceptăm erorile de pagină
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  
  // Interceptăm erorile de request
  page.on('requestfailed', (request) => {
    errors.push(`Request failed: ${request.url()} - ${request.failure().errorText}`);
  });
  
  try {
    // Navigăm la pagină
    await page.goto(url, { timeout: TIMEOUT, waitUntil: 'networkidle2' });
    
    // Așteptăm puțin pentru a permite încărcarea completă a paginii
    await page.waitForTimeout(2000);
    
    return { errors, warnings };
  } catch (error) {
    errors.push(`Navigation error: ${error.message}`);
    return { errors, warnings };
  }
}

// Funcția principală
async function main() {
  console.log('Verificarea erorilor pe fiecare pagină...');
  
  // Obținem toate paginile
  const pages = getAllPages();
  console.log(`S-au găsit ${pages.length} pagini pentru verificare.`);
  
  // Lansăm browser-ul
  const browser = await puppeteer.launch({
    headless: 'new', // Folosim noul mod headless
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  // Creăm o pagină nouă
  const page = await browser.newPage();
  
  // Rezultatele verificării
  const results = {};
  
  // Verificăm fiecare pagină
  for (const route of pages) {
    const url = `${BASE_URL}${route}`;
    console.log(`Verificare: ${url}`);
    
    const { errors, warnings } = await checkPageForErrors(page, url);
    
    results[route] = {
      errors,
      warnings,
      hasErrors: errors.length > 0,
      hasWarnings: warnings.length > 0,
    };
    
    // Afișăm rezultatele pentru pagina curentă
    if (errors.length > 0) {
      console.log(`  ❌ ${errors.length} erori:`);
      errors.forEach((error) => console.log(`    - ${error}`));
    } else {
      console.log('  ✅ Nicio eroare');
    }
    
    if (warnings.length > 0) {
      console.log(`  ⚠️ ${warnings.length} avertismente:`);
      warnings.forEach((warning) => console.log(`    - ${warning}`));
    }
    
    console.log('');
  }
  
  // Închidem browser-ul
  await browser.close();
  
  // Generăm un raport
  const errorPages = Object.entries(results).filter(([_, data]) => data.hasErrors);
  const warningPages = Object.entries(results).filter(([_, data]) => data.hasWarnings);
  
  console.log('=== RAPORT FINAL ===');
  console.log(`Total pagini verificate: ${pages.length}`);
  console.log(`Pagini cu erori: ${errorPages.length}`);
  console.log(`Pagini cu avertismente: ${warningPages.length}`);
  
  if (errorPages.length > 0) {
    console.log('\nPagini cu erori:');
    errorPages.forEach(([route, data]) => {
      console.log(`- ${route}: ${data.errors.length} erori`);
    });
  }
  
  // Salvăm rezultatele într-un fișier JSON
  fs.writeFileSync(
    path.join(__dirname, 'page-errors-report.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log('\nRaportul a fost salvat în page-errors-report.json');
}

// Rulăm funcția principală
main().catch((error) => {
  console.error('Eroare în script:', error);
  process.exit(1);
});
