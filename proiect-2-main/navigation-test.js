// Script pentru testarea navigării între pagini
console.log('Începe testul de navigare...');

// Funcție pentru a măsura timpul de navigare între pagini
async function measureNavigation(fromPath, toPath, name) {
  console.log(`Testăm navigarea de la ${fromPath} la ${toPath}...`);
  
  // Navigăm la pagina inițială
  window.location.href = fromPath;
  
  // Așteptăm încărcarea paginii
  await new Promise(resolve => {
    const checkLoaded = () => {
      if (window.location.pathname === fromPath) {
        resolve();
      } else {
        setTimeout(checkLoaded, 100);
      }
    };
    setTimeout(checkLoaded, 500);
  });
  
  // Măsurăm timpul de navigare
  const start = performance.now();
  
  // Navigăm la pagina destinație
  window.location.href = toPath;
  
  // Așteptăm încărcarea paginii destinație
  await new Promise(resolve => {
    const checkLoaded = () => {
      if (window.location.pathname === toPath) {
        resolve();
      } else {
        setTimeout(checkLoaded, 100);
      }
    };
    setTimeout(checkLoaded, 500);
  });
  
  const end = performance.now();
  console.log(`Navigare ${name}: ${(end - start).toFixed(2)}ms`);
  return end - start;
}

// Funcție pentru a rula testul de navigare
async function runNavigationTest() {
  console.log('Rulăm testul de navigare...');
  
  // Testăm navigarea între diferite pagini
  const routes = [
    { from: '/login', to: '/register', name: 'Login -> Register' },
    { from: '/register', to: '/login', name: 'Register -> Login' },
    { from: '/login', to: '/', name: 'Login -> Dashboard' },
    { from: '/', to: '/projects', name: 'Dashboard -> Projects' },
    { from: '/projects', to: '/inventory', name: 'Projects -> Inventory' },
    { from: '/inventory', to: '/reports', name: 'Inventory -> Reports' },
    { from: '/reports', to: '/', name: 'Reports -> Dashboard' }
  ];
  
  const results = [];
  
  for (const route of routes) {
    try {
      const time = await measureNavigation(route.from, route.to, route.name);
      results.push({ ...route, time });
    } catch (error) {
      console.error(`Eroare la testarea rutei ${route.from} -> ${route.to}:`, error);
    }
  }
  
  // Afișăm rezultatele
  console.log('Rezultatele testului de navigare:');
  results.forEach(result => {
    console.log(`${result.name}: ${result.time.toFixed(2)}ms`);
  });
  
  // Calculăm media
  const average = results.reduce((sum, result) => sum + result.time, 0) / results.length;
  console.log(`Timpul mediu de navigare: ${average.toFixed(2)}ms`);
  
  if (average > 1000) {
    console.log('AVERTISMENT: Timpul mediu de navigare este ridicat (>1000ms).');
  } else {
    console.log('Timpul mediu de navigare este în limite normale.');
  }
  
  console.log('Testul de navigare s-a încheiat.');
}

// Rulăm testul după încărcarea completă a paginii
window.addEventListener('load', () => {
  // Așteptăm 2 secunde pentru a ne asigura că pagina este complet încărcată
  setTimeout(() => {
    runNavigationTest();
  }, 2000);
});
