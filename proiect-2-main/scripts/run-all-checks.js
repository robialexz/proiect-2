/**
 * Script pentru a rula toate verificările
 * Acest script va rula toate scripturile de verificare și va genera un raport final
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configurație
const SCRIPTS = [
  { name: 'Verificare erori în cod', script: 'check-code-errors.js' },
  { name: 'Verificare erori pe pagini', script: 'check-pages-errors.js' },
  { name: 'Verificare erori în browser', script: 'check-browser-errors.js' },
];

// Funcție pentru a rula un script
function runScript(scriptPath) {
  console.log(`\n=== Rulare script: ${scriptPath} ===\n`);
  
  try {
    execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Eroare la rularea scriptului ${scriptPath}:`, error.message);
    return false;
  }
}

// Funcție pentru a combina rapoartele
function combineReports() {
  const reports = {};
  
  // Încărcăm rapoartele individuale
  for (const script of SCRIPTS) {
    const reportPath = path.join(__dirname, script.script.replace('.js', '-report.json'));
    
    if (fs.existsSync(reportPath)) {
      try {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
        reports[script.name] = report;
      } catch (error) {
        console.error(`Eroare la încărcarea raportului ${reportPath}:`, error.message);
      }
    }
  }
  
  // Generăm raportul final
  const finalReport = {
    timestamp: new Date().toISOString(),
    reports,
  };
  
  // Salvăm raportul final
  fs.writeFileSync(
    path.join(__dirname, 'final-report.json'),
    JSON.stringify(finalReport, null, 2)
  );
  
  console.log('\nRaportul final a fost salvat în final-report.json');
}

// Funcția principală
function main() {
  console.log('Rularea tuturor verificărilor...');
  
  // Rulăm fiecare script
  for (const script of SCRIPTS) {
    const scriptPath = path.join(__dirname, script.script);
    
    if (fs.existsSync(scriptPath)) {
      const success = runScript(scriptPath);
      
      if (!success) {
        console.log(`⚠️ Scriptul ${script.script} a eșuat.`);
      }
    } else {
      console.error(`❌ Scriptul ${script.script} nu există.`);
    }
  }
  
  // Combinăm rapoartele
  combineReports();
  
  console.log('\n=== VERIFICĂRI FINALIZATE ===');
}

// Rulăm funcția principală
main();
