// Script pentru testarea răspunsului paginilor
console.log('Începe testarea răspunsului paginilor...');

// Funcție pentru a aștepta un anumit timp
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Funcție pentru a verifica erorile din consolă
function checkConsoleErrors() {
  if (window.consoleErrors && window.consoleErrors.length > 0) {
    console.log('ERORI DETECTATE ÎN CONSOLĂ:');
    window.consoleErrors.forEach(error => {
      console.log(`- ${error}`);
    });
    return true;
  }
  return false;
}

// Funcție pentru a verifica răspunsul unei pagini
async function checkPageResponse(url, name) {
  console.log(`Testez pagina ${name} (${url})...`);
  
  // Salvăm URL-ul curent pentru a reveni
  const currentUrl = window.location.href;
  
  try {
    // Navigăm la pagina de testat
    window.location.href = url;
    
    // Așteptăm încărcarea paginii
    await sleep(2000);
    
    // Verificăm dacă pagina s-a încărcat
    if (window.location.href.includes(url.replace('http://localhost:5173', ''))) {
      console.log(`✅ Pagina ${name} s-a încărcat cu succes.`);
      
      // Verificăm erorile din consolă
      const hasErrors = checkConsoleErrors();
      if (!hasErrors) {
        console.log(`✅ Pagina ${name} nu are erori în consolă.`);
      }
      
      // Verificăm elementele principale
      const mainElement = document.querySelector('main') || document.querySelector('.main-content') || document.querySelector('#root > div');
      if (mainElement) {
        console.log(`✅ Pagina ${name} are conținut principal.`);
      } else {
        console.log(`❌ Pagina ${name} nu are conținut principal detectabil.`);
      }
      
      // Verificăm butoanele și link-urile
      const buttons = document.querySelectorAll('button');
      const links = document.querySelectorAll('a');
      console.log(`✅ Pagina ${name} are ${buttons.length} butoane și ${links.length} link-uri.`);
      
      return true;
    } else {
      console.log(`❌ Pagina ${name} nu s-a încărcat corect.`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Eroare la testarea paginii ${name}:`, error);
    return false;
  } finally {
    // Revenim la pagina inițială
    if (window.location.href !== currentUrl) {
      window.location.href = currentUrl;
      await sleep(1000);
    }
  }
}

// Funcție pentru a testa toate paginile
async function testAllPages() {
  // Captăm erorile din consolă
  window.consoleErrors = [];
  const originalConsoleError = console.error;
  console.error = function() {
    window.consoleErrors.push(Array.from(arguments).join(' '));
    originalConsoleError.apply(console, arguments);
  };
  
  // Lista paginilor de testat
  const pages = [
    { url: 'http://localhost:5173/login', name: 'Login' },
    { url: 'http://localhost:5173/register', name: 'Register' },
    { url: 'http://localhost:5173/', name: 'Dashboard' },
    { url: 'http://localhost:5173/projects', name: 'Projects' },
    { url: 'http://localhost:5173/inventory', name: 'Inventory' },
    { url: 'http://localhost:5173/reports', name: 'Reports' },
    { url: 'http://localhost:5173/settings', name: 'Settings' }
  ];
  
  // Testăm fiecare pagină
  const results = [];
  for (const page of pages) {
    const success = await checkPageResponse(page.url, page.name);
    results.push({ ...page, success });
    await sleep(1000); // Pauză între teste
  }
  
  // Afișăm rezultatele
  console.log('\nREZULTATELE TESTELOR:');
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.name} (${result.url})`);
  });
  
  // Restaurăm console.error
  console.error = originalConsoleError;
}

// Rulăm testele după încărcarea completă a paginii
window.addEventListener('load', () => {
  // Așteptăm 2 secunde pentru a ne asigura că pagina este complet încărcată
  setTimeout(() => {
    testAllPages();
  }, 2000);
});
