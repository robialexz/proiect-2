// Script pentru testarea funcționalităților principale
console.log('Începe testul de funcționalități...');

// Funcție pentru a măsura timpul de execuție
function measureTime(fn, name) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name}: ${(end - start).toFixed(2)}ms`);
  return { time: end - start, result };
}

// Funcție pentru a testa autentificarea
async function testAuthentication() {
  console.log('Testăm funcționalitatea de autentificare...');
  
  // Navigăm la pagina de autentificare
  window.location.href = '/login';
  
  // Așteptăm încărcarea paginii
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Completăm formularul de autentificare
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginButton = document.querySelector('button[type="submit"]');
  
  if (emailInput && passwordInput && loginButton) {
    // Măsurăm timpul de completare a formularului
    const formFillTime = measureTime(() => {
      emailInput.value = 'test@example.com';
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      passwordInput.value = 'password123';
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    }, 'Completare formular autentificare');
    
    // Măsurăm timpul de procesare a formularului
    const formSubmitTime = measureTime(() => {
      loginButton.click();
    }, 'Procesare formular autentificare');
    
    // Așteptăm rezultatul autentificării
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      formFillTime: formFillTime.time,
      formSubmitTime: formSubmitTime.time,
      success: window.location.pathname === '/'
    };
  } else {
    console.error('Nu am putut găsi elementele formularului de autentificare.');
    return {
      formFillTime: 0,
      formSubmitTime: 0,
      success: false
    };
  }
}

// Funcție pentru a testa crearea unui proiect
async function testProjectCreation() {
  console.log('Testăm funcționalitatea de creare a unui proiect...');
  
  // Navigăm la pagina de proiecte
  window.location.href = '/projects';
  
  // Așteptăm încărcarea paginii
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Căutăm butonul de creare a unui proiect
  const createButton = document.querySelector('button:contains("Proiect nou")') || 
                       document.querySelector('button:contains("New Project")') ||
                       document.querySelector('button[aria-label="Create Project"]');
  
  if (createButton) {
    // Măsurăm timpul de deschidere a formularului
    const openFormTime = measureTime(() => {
      createButton.click();
    }, 'Deschidere formular proiect');
    
    // Așteptăm deschiderea formularului
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Completăm formularul
    const nameInput = document.querySelector('input[name="name"]') || 
                      document.querySelector('input[placeholder*="name"]');
    const descriptionInput = document.querySelector('textarea[name="description"]') || 
                            document.querySelector('textarea[placeholder*="description"]');
    const submitButton = document.querySelector('button[type="submit"]') || 
                         document.querySelector('button:contains("Save")') ||
                         document.querySelector('button:contains("Create")');
    
    if (nameInput && submitButton) {
      // Măsurăm timpul de completare a formularului
      const formFillTime = measureTime(() => {
        nameInput.value = 'Test Project';
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        if (descriptionInput) {
          descriptionInput.value = 'This is a test project created for performance testing.';
          descriptionInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }, 'Completare formular proiect');
      
      // Măsurăm timpul de procesare a formularului
      const formSubmitTime = measureTime(() => {
        submitButton.click();
      }, 'Procesare formular proiect');
      
      // Așteptăm rezultatul creării proiectului
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        openFormTime: openFormTime.time,
        formFillTime: formFillTime.time,
        formSubmitTime: formSubmitTime.time,
        success: document.body.textContent.includes('Test Project')
      };
    } else {
      console.error('Nu am putut găsi elementele formularului de creare a proiectului.');
      return {
        openFormTime: openFormTime.time,
        formFillTime: 0,
        formSubmitTime: 0,
        success: false
      };
    }
  } else {
    console.error('Nu am putut găsi butonul de creare a unui proiect.');
    return {
      openFormTime: 0,
      formFillTime: 0,
      formSubmitTime: 0,
      success: false
    };
  }
}

// Funcție pentru a rula testul de funcționalități
async function runFunctionalityTest() {
  console.log('Rulăm testul de funcționalități...');
  
  // Testăm autentificarea
  const authResult = await testAuthentication();
  
  // Dacă autentificarea a reușit, testăm crearea unui proiect
  let projectResult = null;
  if (authResult.success) {
    projectResult = await testProjectCreation();
  }
  
  // Afișăm rezultatele
  console.log('Rezultatele testului de funcționalități:');
  console.log('Autentificare:', authResult);
  if (projectResult) {
    console.log('Creare proiect:', projectResult);
  }
  
  console.log('Testul de funcționalități s-a încheiat.');
}

// Rulăm testul după încărcarea completă a paginii
window.addEventListener('load', () => {
  // Așteptăm 2 secunde pentru a ne asigura că pagina este complet încărcată
  setTimeout(() => {
    runFunctionalityTest();
  }, 2000);
});
