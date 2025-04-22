// Script pentru monitorizarea consumului de memorie
console.log('Începe monitorizarea consumului de memorie...');

// Variabile pentru a stoca măsurătorile de memorie
const memoryMeasurements = [];
let startTime = performance.now();
let testDuration = 5 * 60 * 1000; // 5 minute

// Funcție pentru a măsura consumul de memorie
function measureMemory() {
  if (window.performance && window.performance.memory) {
    const memoryInfo = window.performance.memory;
    const usedMemory = memoryInfo.usedJSHeapSize / (1024 * 1024); // MB
    const totalMemory = memoryInfo.totalJSHeapSize / (1024 * 1024); // MB
    const limitMemory = memoryInfo.jsHeapSizeLimit / (1024 * 1024); // MB
    
    const elapsedTime = (performance.now() - startTime) / 1000; // secunde
    
    memoryMeasurements.push({
      time: elapsedTime,
      used: usedMemory,
      total: totalMemory,
      limit: limitMemory
    });
    
    console.log(`[${elapsedTime.toFixed(2)}s] Memorie utilizată: ${usedMemory.toFixed(2)}MB / ${totalMemory.toFixed(2)}MB (Limită: ${limitMemory.toFixed(2)}MB)`);
    
    // Detectăm creșteri semnificative de memorie
    if (memoryMeasurements.length > 1) {
      const previousMeasurement = memoryMeasurements[memoryMeasurements.length - 2];
      const memoryIncrease = usedMemory - previousMeasurement.used;
      
      if (memoryIncrease > 5) { // 5MB
        console.log(`AVERTISMENT: Creștere semnificativă de memorie detectată: +${memoryIncrease.toFixed(2)}MB`);
      }
    }
    
    return {
      used: usedMemory,
      total: totalMemory,
      limit: limitMemory
    };
  } else {
    console.log('API-ul de măsurare a memoriei nu este disponibil în acest browser.');
    return null;
  }
}

// Funcție pentru a analiza tendința consumului de memorie
function analyzeMemoryTrend() {
  if (memoryMeasurements.length < 2) {
    console.log('Nu sunt suficiente măsurători pentru a analiza tendința.');
    return;
  }
  
  // Calculăm rata de creștere a memoriei
  const firstMeasurement = memoryMeasurements[0];
  const lastMeasurement = memoryMeasurements[memoryMeasurements.length - 1];
  
  const memoryIncrease = lastMeasurement.used - firstMeasurement.used;
  const timeElapsed = lastMeasurement.time - firstMeasurement.time;
  
  const growthRate = memoryIncrease / timeElapsed; // MB/s
  
  console.log(`Rata de creștere a memoriei: ${growthRate.toFixed(4)}MB/s`);
  
  if (growthRate > 0.1) { // 0.1MB/s = 6MB/min
    console.log('AVERTISMENT: Rată ridicată de creștere a memoriei detectată. Posibil memory leak.');
  } else if (growthRate > 0) {
    console.log('Rată normală de creștere a memoriei.');
  } else {
    console.log('Memoria este stabilă sau în scădere.');
  }
  
  // Estimăm când va fi atinsă limita de memorie
  if (growthRate > 0) {
    const remainingMemory = lastMeasurement.limit - lastMeasurement.used;
    const timeToLimit = remainingMemory / growthRate;
    
    console.log(`Estimare timp până la atingerea limitei de memorie: ${(timeToLimit / 60).toFixed(2)} minute`);
  }
}

// Funcție pentru a simula interacțiuni cu aplicația
async function simulateInteractions() {
  // Simulăm navigarea între pagini
  const routes = ['/login', '/register', '/', '/projects', '/inventory', '/reports'];
  let currentRouteIndex = 0;
  
  // Funcție pentru a naviga la următoarea rută
  async function navigateToNextRoute() {
    currentRouteIndex = (currentRouteIndex + 1) % routes.length;
    const nextRoute = routes[currentRouteIndex];
    
    console.log(`Navigăm la ${nextRoute}...`);
    window.location.href = nextRoute;
    
    // Așteptăm încărcarea paginii
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Simulăm interacțiuni cu elementele paginii
  function interactWithPage() {
    console.log('Interacționăm cu elementele paginii...');
    
    // Găsim toate butoanele și link-urile
    const interactiveElements = [
      ...document.querySelectorAll('button'),
      ...document.querySelectorAll('a'),
      ...document.querySelectorAll('input')
    ];
    
    // Interacționăm cu câteva elemente aleatorii
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * interactiveElements.length);
      const element = interactiveElements[randomIndex];
      
      if (element.tagName === 'INPUT') {
        element.value = `test-${Date.now()}`;
        element.dispatchEvent(new Event('input', { bubbles: true }));
      } else if (element.tagName === 'BUTTON' || element.tagName === 'A') {
        // Evităm click-urile care ar putea naviga în afara aplicației
        if (!element.href || element.href.startsWith(window.location.origin)) {
          // Simulăm un hover
          element.dispatchEvent(new Event('mouseover', { bubbles: true }));
          // Nu facem click pentru a evita navigarea necontrolată
        }
      }
    }
  }
  
  // Rulăm interacțiunile la fiecare 10 secunde
  const interactionInterval = setInterval(async () => {
    try {
      // Măsurăm memoria înainte de interacțiuni
      measureMemory();
      
      // Interacționăm cu pagina curentă
      interactWithPage();
      
      // Așteptăm 2 secunde
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigăm la următoarea rută
      await navigateToNextRoute();
      
      // Verificăm dacă testul s-a încheiat
      if (performance.now() - startTime >= testDuration) {
        clearInterval(interactionInterval);
        finishTest();
      }
    } catch (error) {
      console.error('Eroare în timpul simulării interacțiunilor:', error);
    }
  }, 10000); // 10 secunde
  
  // Măsurăm memoria la fiecare 5 secunde
  const memoryInterval = setInterval(() => {
    try {
      measureMemory();
      
      // Verificăm dacă testul s-a încheiat
      if (performance.now() - startTime >= testDuration) {
        clearInterval(memoryInterval);
      }
    } catch (error) {
      console.error('Eroare în timpul măsurării memoriei:', error);
    }
  }, 5000); // 5 secunde
}

// Funcție pentru a finaliza testul
function finishTest() {
  console.log('Testul de memorie s-a încheiat.');
  
  // Analizăm tendința consumului de memorie
  analyzeMemoryTrend();
  
  // Afișăm rezultatele
  console.log('Rezultatele testului de memorie:');
  console.log(`Număr de măsurători: ${memoryMeasurements.length}`);
  
  if (memoryMeasurements.length > 0) {
    const firstMeasurement = memoryMeasurements[0];
    const lastMeasurement = memoryMeasurements[memoryMeasurements.length - 1];
    
    console.log(`Memorie inițială: ${firstMeasurement.used.toFixed(2)}MB`);
    console.log(`Memorie finală: ${lastMeasurement.used.toFixed(2)}MB`);
    console.log(`Diferență: ${(lastMeasurement.used - firstMeasurement.used).toFixed(2)}MB`);
    
    // Determinăm dacă există un memory leak
    const memoryIncrease = lastMeasurement.used - firstMeasurement.used;
    const timeElapsed = lastMeasurement.time - firstMeasurement.time;
    const growthRate = memoryIncrease / timeElapsed;
    
    if (growthRate > 0.1) {
      console.log('CONCLUZIE: Posibil memory leak detectat.');
    } else if (memoryIncrease > 50) {
      console.log('CONCLUZIE: Creștere semnificativă de memorie, dar poate fi normală pentru utilizarea aplicației.');
    } else {
      console.log('CONCLUZIE: Nu s-a detectat niciun memory leak.');
    }
  }
}

// Rulăm testul după încărcarea completă a paginii
window.addEventListener('load', () => {
  // Așteptăm 2 secunde pentru a ne asigura că pagina este complet încărcată
  setTimeout(() => {
    startTime = performance.now();
    
    // Măsurăm memoria inițială
    console.log('Memoria inițială:');
    measureMemory();
    
    // Începem simularea interacțiunilor
    simulateInteractions();
    
    // Finalizăm testul după durata specificată
    setTimeout(() => {
      finishTest();
    }, testDuration);
  }, 2000);
});
