// Script pentru testarea automată a tuturor paginilor
console.log('Începe testarea automată a tuturor paginilor...');

// Funcție pentru a aștepta un anumit timp
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Funcție pentru a verifica elementele din pagină
function checkPageElements() {
  // Verificăm titlul paginii
  const pageTitle = document.title;
  
  // Verificăm URL-ul curent
  const currentUrl = window.location.href;
  
  // Verificăm elementele principale
  const mainElement = document.querySelector('main') || document.querySelector('.main-content') || document.querySelector('#root > div');
  const hasMainContent = !!mainElement;
  
  // Verificăm butoanele
  const buttons = document.querySelectorAll('button');
  const buttonCount = buttons.length;
  
  // Verificăm link-urile
  const links = document.querySelectorAll('a');
  const linkCount = links.length;
  
  // Verificăm formularele
  const forms = document.querySelectorAll('form');
  const formCount = forms.length;
  
  // Verificăm inputurile
  const inputs = document.querySelectorAll('input');
  const inputCount = inputs.length;
  
  // Returnăm rezultatele
  return {
    pageTitle,
    currentUrl,
    hasMainContent,
    buttonCount,
    linkCount,
    formCount,
    inputCount
  };
}

// Funcție pentru a testa o pagină
async function testPage(url) {
  console.log(`Testare pagină: ${url}`);
  
  // Navigăm la pagina de testat
  window.location.href = url;
  
  // Așteptăm încărcarea paginii
  await sleep(2000);
  
  // Verificăm elementele din pagină
  const results = checkPageElements();
  
  // Afișăm rezultatele
  console.log(`Rezultate pentru ${url}:`);
  console.log(`- Titlu: ${results.pageTitle}`);
  console.log(`- URL: ${results.currentUrl}`);
  console.log(`- Are conținut principal: ${results.hasMainContent ? 'Da' : 'Nu'}`);
  console.log(`- Număr butoane: ${results.buttonCount}`);
  console.log(`- Număr link-uri: ${results.linkCount}`);
  console.log(`- Număr formulare: ${results.formCount}`);
  console.log(`- Număr inputuri: ${results.inputCount}`);
  
  // Returnăm rezultatele
  return {
    url,
    success: true,
    results
  };
}

// Funcție pentru a testa toate paginile
async function testAllPages() {
  // Lista paginilor de testat
  const pages = [
    'http://localhost:5173/login',
    'http://localhost:5173/register',
    'http://localhost:5173/',
    'http://localhost:5173/projects',
    'http://localhost:5173/inventory',
    'http://localhost:5173/reports',
    'http://localhost:5173/settings'
  ];
  
  // Rezultatele testelor
  const results = [];
  
  // Testăm fiecare pagină
  for (const page of pages) {
    try {
      const result = await testPage(page);
      results.push(result);
    } catch (error) {
      console.error(`Eroare la testarea paginii ${page}:`, error);
      results.push({
        url: page,
        success: false,
        error: error.message
      });
    }
    
    // Așteptăm puțin între teste
    await sleep(1000);
  }
  
  // Afișăm rezultatele finale
  console.log('\nREZULTATELE TESTELOR:');
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.url}`);
  });
  
  // Returnăm rezultatele
  return results;
}

// Funcție pentru a rula testele
async function runTests() {
  console.log('Rulare teste automate...');
  
  // Testăm toate paginile
  const results = await testAllPages();
  
  // Verificăm dacă toate testele au trecut
  const allPassed = results.every(result => result.success);
  
  if (allPassed) {
    console.log('✅ Toate testele au trecut!');
  } else {
    console.log('❌ Unele teste au eșuat!');
  }
  
  console.log('Testele automate s-au încheiat!');
}

// Rulăm testele după încărcarea completă a paginii
window.addEventListener('load', () => {
  // Așteptăm 1 secundă pentru a ne asigura că pagina este complet încărcată
  setTimeout(() => {
    runTests();
  }, 1000);
});
