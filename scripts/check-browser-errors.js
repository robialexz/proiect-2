/**
 * Script pentru verificarea erorilor în consola browserului
 * Acest script va deschide aplicația în browser și va monitoriza erorile din consolă
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configurație
const BASE_URL = 'http://localhost:5173'; // Schimbă portul dacă este necesar
const MONITORING_TIME = 60000; // 60 secunde de monitorizare
const ACTIONS = [
  // Acțiuni de efectuat pe pagină pentru a testa funcționalitățile
  { name: 'Click pe butonul de login', selector: 'button:contains("Login")' },
  { name: 'Click pe butonul de register', selector: 'button:contains("Register")' },
  { name: 'Click pe butonul de dashboard', selector: 'a[href="/dashboard"]' },
  { name: 'Click pe butonul de proiecte', selector: 'a[href="/projects"]' },
  { name: 'Click pe butonul de inventar', selector: 'a[href="/inventory-management"]' },
  { name: 'Click pe butonul de rapoarte', selector: 'a[href="/reports"]' },
  { name: 'Click pe butonul de resurse', selector: 'a[href="/resources"]' },
  { name: 'Click pe butonul de setări', selector: 'a[href="/settings"]' },
];

// Funcție pentru a efectua acțiuni pe pagină
async function performActions(page) {
  for (const action of ACTIONS) {
    try {
      console.log(`Efectuare acțiune: ${action.name}`);
      
      // Așteptăm ca selectorul să fie disponibil
      await page.waitForSelector(action.selector, { timeout: 5000 });
      
      // Efectuăm click
      await page.click(action.selector);
      
      // Așteptăm puțin pentru a permite încărcarea paginii
      await page.waitForTimeout(2000);
    } catch (error) {
      console.log(`Nu s-a putut efectua acțiunea "${action.name}": ${error.message}`);
    }
  }
}

// Funcția principală
async function main() {
  console.log('Verificarea erorilor în consola browserului...');
  console.log(`URL de bază: ${BASE_URL}`);
  console.log(`Timp de monitorizare: ${MONITORING_TIME / 1000} secunde`);
  
  // Lansăm browser-ul
  const browser = await puppeteer.launch({
    headless: false, // Folosim modul cu interfață pentru a putea vedea ce se întâmplă
    args: ['--window-size=1920,1080'],
  });
  
  // Creăm o pagină nouă
  const page = await browser.newPage();
  
  // Setăm dimensiunea viewport-ului
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Colectăm erorile și avertismentele
  const errors = [];
  const warnings = [];
  
  // Interceptăm erorile din consolă
  page.on('console', (message) => {
    const type = message.type();
    const text = message.text();
    
    if (type === 'error') {
      console.log(`❌ Eroare în consolă: ${text}`);
      errors.push({ text, timestamp: new Date().toISOString() });
    } else if (type === 'warning') {
      console.log(`⚠️ Avertisment în consolă: ${text}`);
      warnings.push({ text, timestamp: new Date().toISOString() });
    }
  });
  
  // Interceptăm erorile de pagină
  page.on('pageerror', (error) => {
    console.log(`❌ Eroare de pagină: ${error.message}`);
    errors.push({ text: error.message, timestamp: new Date().toISOString() });
  });
  
  // Interceptăm erorile de request
  page.on('requestfailed', (request) => {
    const errorText = `Request failed: ${request.url()} - ${request.failure().errorText}`;
    console.log(`❌ ${errorText}`);
    errors.push({ text: errorText, timestamp: new Date().toISOString() });
  });
  
  try {
    // Navigăm la pagina principală
    console.log(`Navigare la ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    
    // Efectuăm acțiuni pe pagină
    await performActions(page);
    
    // Monitorizăm pentru o perioadă de timp
    console.log(`Monitorizare pentru ${MONITORING_TIME / 1000} secunde...`);
    await page.waitForTimeout(MONITORING_TIME);
    
    // Generăm un raport
    console.log('=== RAPORT FINAL ===');
    console.log(`Total erori: ${errors.length}`);
    console.log(`Total avertismente: ${warnings.length}`);
    
    if (errors.length > 0) {
      console.log('\nErori:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.text} (${error.timestamp})`);
      });
    }
    
    if (warnings.length > 0) {
      console.log('\nAvertismente:');
      warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.text} (${warning.timestamp})`);
      });
    }
    
    // Salvăm rezultatele într-un fișier JSON
    const results = {
      url: BASE_URL,
      monitoringTime: MONITORING_TIME,
      timestamp: new Date().toISOString(),
      errors,
      warnings,
      errorCount: errors.length,
      warningCount: warnings.length,
    };
    
    fs.writeFileSync(
      path.join(__dirname, 'browser-errors-report.json'),
      JSON.stringify(results, null, 2)
    );
    
    console.log('\nRaportul a fost salvat în browser-errors-report.json');
  } catch (error) {
    console.error('Eroare în script:', error);
  } finally {
    // Închidem browser-ul
    await browser.close();
  }
}

// Verificăm dacă Puppeteer este instalat
try {
  require.resolve('puppeteer');
} catch (error) {
  console.error('Puppeteer nu este instalat. Instalați-l folosind comanda:');
  console.error('npm install puppeteer');
  process.exit(1);
}

// Rulăm funcția principală
main().catch((error) => {
  console.error('Eroare în script:', error);
  process.exit(1);
});
