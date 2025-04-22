// Script pentru a rula toate testele de performanță
console.log('Începe testarea completă a performanței...');

// Importăm scripturile de test
const scripts = [
  'performance-test.js',
  'navigation-test.js',
  'functionality-test.js',
  'memory-test.js'
];

// Funcție pentru a încărca un script
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Funcție pentru a rula toate testele
async function runAllTests() {
  console.log('Rulăm toate testele...');
  
  // Încărcăm și rulăm fiecare script de test
  for (const script of scripts) {
    try {
      console.log(`Încărcăm scriptul ${script}...`);
      await loadScript(script);
      console.log(`Scriptul ${script} a fost încărcat cu succes.`);
    } catch (error) {
      console.error(`Eroare la încărcarea scriptului ${script}:`, error);
    }
  }
  
  console.log('Toate scripturile au fost încărcate. Testele vor rula automat.');
}

// Rulăm toate testele după încărcarea completă a paginii
window.addEventListener('load', () => {
  // Așteptăm 2 secunde pentru a ne asigura că pagina este complet încărcată
  setTimeout(() => {
    runAllTests();
  }, 2000);
});
