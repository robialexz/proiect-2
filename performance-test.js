// Script pentru testarea performanței aplicației
console.log('Începe testul de performanță...');

// Funcție pentru a măsura timpul de execuție
function measureTime(fn, name) {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name}: ${(end - start).toFixed(2)}ms`);
  return end - start;
}

// Funcție pentru a simula interacțiuni cu pagina
async function simulateInteractions() {
  // Simulăm interacțiuni cu pagina de autentificare
  console.log('Simulăm interacțiuni cu pagina de autentificare...');
  
  // Simulăm tastarea în câmpul de email
  const emailInput = document.getElementById('email');
  if (emailInput) {
    for (let i = 0; i < 10; i++) {
      emailInput.value = `test${i}@example.com`;
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // Simulăm tastarea în câmpul de parolă
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    for (let i = 0; i < 10; i++) {
      passwordInput.value = `password${i}`;
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // Simulăm comutarea între formularele de autentificare și înregistrare
  const registerLink = document.querySelector('a[href="/register"]');
  if (registerLink) {
    registerLink.click();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const loginLink = document.querySelector('a[href="/login"]');
    if (loginLink) {
      loginLink.click();
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

// Funcție pentru a măsura consumul de memorie
function measureMemoryUsage() {
  if (window.performance && window.performance.memory) {
    const memoryInfo = window.performance.memory;
    console.log(`Memorie utilizată: ${(memoryInfo.usedJSHeapSize / (1024 * 1024)).toFixed(2)}MB`);
    console.log(`Limită memorie: ${(memoryInfo.jsHeapSizeLimit / (1024 * 1024)).toFixed(2)}MB`);
    return memoryInfo.usedJSHeapSize;
  } else {
    console.log('API-ul de măsurare a memoriei nu este disponibil în acest browser.');
    return null;
  }
}

// Funcție pentru a rula testul de performanță
async function runPerformanceTest() {
  console.log('Rulăm testul de performanță...');
  
  // Măsurăm consumul inițial de memorie
  console.log('Consumul inițial de memorie:');
  const initialMemory = measureMemoryUsage();
  
  // Simulăm interacțiuni cu pagina
  await simulateInteractions();
  
  // Măsurăm consumul de memorie după interacțiuni
  console.log('Consumul de memorie după interacțiuni:');
  const afterInteractionsMemory = measureMemoryUsage();
  
  // Simulăm o utilizare intensivă a aplicației
  console.log('Simulăm o utilizare intensivă a aplicației...');
  for (let i = 0; i < 5; i++) {
    await simulateInteractions();
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Iterația ${i + 1} completă.`);
  }
  
  // Măsurăm consumul final de memorie
  console.log('Consumul final de memorie:');
  const finalMemory = measureMemoryUsage();
  
  // Calculăm creșterea de memorie
  if (initialMemory && finalMemory) {
    const memoryIncrease = finalMemory - initialMemory;
    console.log(`Creșterea de memorie: ${(memoryIncrease / (1024 * 1024)).toFixed(2)}MB`);
    
    if (memoryIncrease > 50 * 1024 * 1024) { // 50MB
      console.log('AVERTISMENT: Creștere semnificativă de memorie detectată. Posibil memory leak.');
    } else {
      console.log('Creșterea de memorie este în limite normale.');
    }
  }
  
  console.log('Testul de performanță s-a încheiat.');
}

// Rulăm testul după încărcarea completă a paginii
window.addEventListener('load', () => {
  // Așteptăm 2 secunde pentru a ne asigura că pagina este complet încărcată
  setTimeout(() => {
    runPerformanceTest();
  }, 2000);
});

// Monitorizăm timpul de răspuns al aplicației
let lastResponseTime = performance.now();
let freezeDetected = false;

function checkResponseTime() {
  const now = performance.now();
  const responseTime = now - lastResponseTime;
  
  if (responseTime > 500) { // 500ms
    console.log(`AVERTISMENT: Timp de răspuns ridicat detectat: ${responseTime.toFixed(2)}ms`);
    if (responseTime > 1000) { // 1000ms = 1s
      console.log('EROARE: Aplicația pare să fie înghețată!');
      freezeDetected = true;
    }
  }
  
  lastResponseTime = now;
}

// Verificăm timpul de răspuns la fiecare 100ms
const responseCheckInterval = setInterval(checkResponseTime, 100);

// Oprim verificarea după 5 minute
setTimeout(() => {
  clearInterval(responseCheckInterval);
  console.log('Monitorizarea timpului de răspuns s-a încheiat.');
  
  if (!freezeDetected) {
    console.log('Nicio înghețare a aplicației nu a fost detectată în timpul testului.');
  }
}, 5 * 60 * 1000); // 5 minute
