// Script pentru testarea directă a paginilor
console.log('Începe testarea directă a paginilor...');

// Funcție pentru a aștepta un anumit timp
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Funcție pentru a verifica elementele din pagină
function checkPageElements() {
  console.log('Verificare elemente din pagină...');
  
  // Verificăm titlul paginii
  console.log(`Titlu pagină: ${document.title}`);
  
  // Verificăm URL-ul curent
  console.log(`URL curent: ${window.location.href}`);
  
  // Verificăm elementele principale
  const mainElement = document.querySelector('main') || document.querySelector('.main-content') || document.querySelector('#root > div');
  if (mainElement) {
    console.log('✅ Pagina are conținut principal.');
  } else {
    console.log('❌ Pagina nu are conținut principal detectabil.');
  }
  
  // Verificăm butoanele
  const buttons = document.querySelectorAll('button');
  console.log(`Pagina are ${buttons.length} butoane.`);
  
  // Verificăm link-urile
  const links = document.querySelectorAll('a');
  console.log(`Pagina are ${links.length} link-uri.`);
  
  // Verificăm formularele
  const forms = document.querySelectorAll('form');
  console.log(`Pagina are ${forms.length} formulare.`);
  
  // Verificăm inputurile
  const inputs = document.querySelectorAll('input');
  console.log(`Pagina are ${inputs.length} inputuri.`);
  
  // Verificăm dacă există erori în consolă
  if (window.consoleErrors && window.consoleErrors.length > 0) {
    console.log('ERORI DETECTATE ÎN CONSOLĂ:');
    window.consoleErrors.forEach(error => {
      console.log(`- ${error}`);
    });
  } else {
    console.log('✅ Nu există erori în consolă.');
  }
}

// Funcție pentru a testa butoanele din pagină
function testButtons() {
  console.log('Testare butoane...');
  
  // Obținem toate butoanele din pagină
  const buttons = Array.from(document.querySelectorAll('button'));
  
  // Afișăm textul fiecărui buton
  buttons.forEach((button, index) => {
    console.log(`Buton ${index + 1}: ${button.textContent.trim() || '[Fără text]'}`);
  });
  
  // Verificăm dacă există butoane specifice
  const loginButton = buttons.find(button => 
    button.textContent.includes('Autentificare') || 
    button.textContent.includes('Login')
  );
  
  if (loginButton) {
    console.log('✅ Butonul de autentificare există.');
  }
  
  const registerButton = buttons.find(button => 
    button.textContent.includes('Înregistrare') || 
    button.textContent.includes('Creează cont') ||
    button.textContent.includes('Register')
  );
  
  if (registerButton) {
    console.log('✅ Butonul de înregistrare există.');
  }
}

// Funcție pentru a testa inputurile din pagină
function testInputs() {
  console.log('Testare inputuri...');
  
  // Obținem toate inputurile din pagină
  const inputs = Array.from(document.querySelectorAll('input'));
  
  // Afișăm tipul și id-ul fiecărui input
  inputs.forEach((input, index) => {
    console.log(`Input ${index + 1}: type=${input.type}, id=${input.id || '[Fără id]'}`);
  });
}

// Funcție pentru a testa navigarea
function testNavigation() {
  console.log('Testare navigare...');
  
  // Obținem toate link-urile din pagină
  const links = Array.from(document.querySelectorAll('a'));
  
  // Afișăm href-ul fiecărui link
  links.forEach((link, index) => {
    console.log(`Link ${index + 1}: ${link.textContent.trim() || '[Fără text]'} -> ${link.href}`);
  });
}

// Funcție pentru a rula toate testele
async function runAllTests() {
  console.log('Rulare toate testele...');
  
  // Captăm erorile din consolă
  window.consoleErrors = [];
  const originalConsoleError = console.error;
  console.error = function() {
    window.consoleErrors.push(Array.from(arguments).join(' '));
    originalConsoleError.apply(console, arguments);
  };
  
  // Verificăm elementele din pagină
  checkPageElements();
  
  // Testăm butoanele
  testButtons();
  
  // Testăm inputurile
  testInputs();
  
  // Testăm navigarea
  testNavigation();
  
  // Restaurăm console.error
  console.error = originalConsoleError;
  
  console.log('Toate testele au fost finalizate!');
}

// Rulăm testele după încărcarea completă a paginii
window.addEventListener('load', () => {
  // Așteptăm 1 secundă pentru a ne asigura că pagina este complet încărcată
  setTimeout(() => {
    runAllTests();
  }, 1000);
});
