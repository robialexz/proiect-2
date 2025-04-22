// Script pentru testarea butoanelor din pagina de autentificare
console.log('Începe testarea butoanelor din pagina de autentificare...');

// Funcție pentru a aștepta un anumit timp
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Funcție pentru a testa butoanele din pagina de login
async function testLoginButtons() {
  console.log('Testez butoanele din pagina de login...');
  
  // Verificăm dacă suntem pe pagina de login
  if (!window.location.pathname.includes('/login')) {
    console.log('Nu suntem pe pagina de login. Navighez la pagina de login...');
    window.location.href = '/login';
    await sleep(2000);
  }
  
  // Verificăm butonul de autentificare
  const loginButton = Array.from(document.querySelectorAll('button')).find(
    button => button.textContent.includes('Autentificare')
  );
  
  if (loginButton) {
    console.log('✅ Butonul de autentificare există.');
    
    // Verificăm dacă butonul este dezactivat când câmpurile sunt goale
    const isDisabled = loginButton.disabled;
    console.log(`Butonul de autentificare este ${isDisabled ? 'dezactivat' : 'activat'} când câmpurile sunt goale.`);
    
    // Completăm câmpurile
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput && passwordInput) {
      console.log('✅ Câmpurile de email și parolă există.');
      
      // Testăm completarea câmpurilor
      emailInput.value = 'test@example.com';
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      passwordInput.value = 'password123';
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      await sleep(500);
      
      console.log('✅ Câmpurile au fost completate cu succes.');
    } else {
      console.log('❌ Nu am găsit câmpurile de email și/sau parolă.');
    }
  } else {
    console.log('❌ Nu am găsit butonul de autentificare.');
  }
  
  // Verificăm link-ul de înregistrare
  const registerLink = Array.from(document.querySelectorAll('button')).find(
    button => button.textContent.includes('Înregistrează-te')
  );
  
  if (registerLink) {
    console.log('✅ Link-ul de înregistrare există.');
    
    // Testăm navigarea la pagina de înregistrare
    console.log('Apăs link-ul de înregistrare...');
    registerLink.click();
    
    await sleep(1000);
    
    // Verificăm dacă am ajuns la pagina de înregistrare
    if (window.location.pathname.includes('/register')) {
      console.log('✅ Navigarea la pagina de înregistrare funcționează.');
      
      // Testăm butoanele din pagina de înregistrare
      await testRegisterButtons();
    } else {
      console.log('❌ Navigarea la pagina de înregistrare nu funcționează.');
    }
  } else {
    console.log('❌ Nu am găsit link-ul de înregistrare.');
  }
}

// Funcție pentru a testa butoanele din pagina de înregistrare
async function testRegisterButtons() {
  console.log('Testez butoanele din pagina de înregistrare...');
  
  // Verificăm dacă suntem pe pagina de înregistrare
  if (!window.location.pathname.includes('/register')) {
    console.log('Nu suntem pe pagina de înregistrare. Navighez la pagina de înregistrare...');
    window.location.href = '/register';
    await sleep(2000);
  }
  
  // Verificăm butonul de creare cont
  const registerButton = Array.from(document.querySelectorAll('button')).find(
    button => button.textContent.includes('Creează cont')
  );
  
  if (registerButton) {
    console.log('✅ Butonul de creare cont există.');
    
    // Verificăm dacă butonul este dezactivat când câmpurile sunt goale
    const isDisabled = registerButton.disabled;
    console.log(`Butonul de creare cont este ${isDisabled ? 'dezactivat' : 'activat'} când câmpurile sunt goale.`);
    
    // Completăm câmpurile
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('registerEmail');
    const companyInput = document.getElementById('company');
    const passwordInput = document.getElementById('registerPassword');
    const termsCheckbox = document.getElementById('terms');
    
    if (firstNameInput && lastNameInput && emailInput && passwordInput && termsCheckbox) {
      console.log('✅ Toate câmpurile necesare există.');
      
      // Testăm completarea câmpurilor
      firstNameInput.value = 'Test';
      firstNameInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      lastNameInput.value = 'User';
      lastNameInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      emailInput.value = 'test@example.com';
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      if (companyInput) {
        companyInput.value = 'Test Company';
        companyInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      passwordInput.value = 'password123';
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Bifăm termenii și condițiile
      if (!termsCheckbox.checked) {
        termsCheckbox.click();
      }
      
      await sleep(500);
      
      console.log('✅ Câmpurile au fost completate cu succes.');
    } else {
      console.log('❌ Nu am găsit toate câmpurile necesare.');
    }
  } else {
    console.log('❌ Nu am găsit butonul de creare cont.');
  }
  
  // Verificăm link-ul de autentificare
  const loginLink = Array.from(document.querySelectorAll('button')).find(
    button => button.textContent.includes('Autentifică-te')
  );
  
  if (loginLink) {
    console.log('✅ Link-ul de autentificare există.');
    
    // Testăm navigarea la pagina de autentificare
    console.log('Apăs link-ul de autentificare...');
    loginLink.click();
    
    await sleep(1000);
    
    // Verificăm dacă am ajuns la pagina de autentificare
    if (window.location.pathname.includes('/login')) {
      console.log('✅ Navigarea la pagina de autentificare funcționează.');
    } else {
      console.log('❌ Navigarea la pagina de autentificare nu funcționează.');
    }
  } else {
    console.log('❌ Nu am găsit link-ul de autentificare.');
  }
}

// Funcție pentru a rula toate testele
async function runAllTests() {
  console.log('Rulăm toate testele pentru butoanele din paginile de autentificare...');
  
  // Testăm butoanele din pagina de login
  await testLoginButtons();
  
  console.log('Toate testele au fost finalizate!');
}

// Rulăm testele după încărcarea completă a paginii
window.addEventListener('load', () => {
  // Așteptăm 2 secunde pentru a ne asigura că pagina este complet încărcată
  setTimeout(() => {
    runAllTests();
  }, 2000);
});
