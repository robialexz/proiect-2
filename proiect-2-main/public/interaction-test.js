// Script pentru testarea interacțiunilor cu pagina
console.log('Începe testarea interacțiunilor cu pagina...');

// Funcție pentru a aștepta un anumit timp
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Funcție pentru a testa butoanele din pagină
async function testButtons() {
  console.log('Testare butoane...');
  
  // Obținem toate butoanele din pagină
  const buttons = Array.from(document.querySelectorAll('button'));
  
  // Afișăm textul fiecărui buton
  buttons.forEach((button, index) => {
    const buttonText = button.textContent.trim() || '[Fără text]';
    const buttonType = button.type || 'button';
    const buttonDisabled = button.disabled ? 'dezactivat' : 'activat';
    
    console.log(`Buton ${index + 1}: "${buttonText}" (${buttonType}, ${buttonDisabled})`);
  });
  
  // Verificăm dacă există butoane specifice
  const loginButton = buttons.find(button => 
    button.textContent.includes('Autentificare') || 
    button.textContent.includes('Login')
  );
  
  if (loginButton) {
    console.log('✅ Butonul de autentificare există.');
    console.log(`   - Text: "${loginButton.textContent.trim()}"`);
    console.log(`   - Dezactivat: ${loginButton.disabled ? 'Da' : 'Nu'}`);
  }
  
  const registerButton = buttons.find(button => 
    button.textContent.includes('Înregistrare') || 
    button.textContent.includes('Creează cont') ||
    button.textContent.includes('Register')
  );
  
  if (registerButton) {
    console.log('✅ Butonul de înregistrare există.');
    console.log(`   - Text: "${registerButton.textContent.trim()}"`);
    console.log(`   - Dezactivat: ${registerButton.disabled ? 'Da' : 'Nu'}`);
  }
  
  return buttons.length;
}

// Funcție pentru a testa inputurile din pagină
async function testInputs() {
  console.log('Testare inputuri...');
  
  // Obținem toate inputurile din pagină
  const inputs = Array.from(document.querySelectorAll('input'));
  
  // Afișăm tipul și id-ul fiecărui input
  inputs.forEach((input, index) => {
    const inputType = input.type || 'text';
    const inputId = input.id || '[Fără id]';
    const inputName = input.name || '[Fără nume]';
    const inputPlaceholder = input.placeholder || '[Fără placeholder]';
    const inputRequired = input.required ? 'obligatoriu' : 'opțional';
    
    console.log(`Input ${index + 1}: ${inputType} (id="${inputId}", name="${inputName}", ${inputRequired})`);
    console.log(`   - Placeholder: "${inputPlaceholder}"`);
  });
  
  // Verificăm dacă există inputuri specifice
  const emailInput = inputs.find(input => 
    input.type === 'email' || 
    input.id?.includes('email') || 
    input.name?.includes('email')
  );
  
  if (emailInput) {
    console.log('✅ Input-ul de email există.');
    console.log(`   - ID: "${emailInput.id}"`);
    console.log(`   - Placeholder: "${emailInput.placeholder}"`);
    console.log(`   - Obligatoriu: ${emailInput.required ? 'Da' : 'Nu'}`);
    
    // Testăm completarea input-ului
    console.log('   - Testare completare input email...');
    const originalValue = emailInput.value;
    emailInput.value = 'test@example.com';
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(500);
    console.log(`   - Valoare setată: "${emailInput.value}"`);
    
    // Restaurăm valoarea originală
    emailInput.value = originalValue;
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  const passwordInput = inputs.find(input => 
    input.type === 'password' || 
    input.id?.includes('password') || 
    input.name?.includes('password')
  );
  
  if (passwordInput) {
    console.log('✅ Input-ul de parolă există.');
    console.log(`   - ID: "${passwordInput.id}"`);
    console.log(`   - Placeholder: "${passwordInput.placeholder}"`);
    console.log(`   - Obligatoriu: ${passwordInput.required ? 'Da' : 'Nu'}`);
    
    // Testăm completarea input-ului
    console.log('   - Testare completare input parolă...');
    const originalValue = passwordInput.value;
    passwordInput.value = 'password123';
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(500);
    console.log(`   - Valoare setată: "${passwordInput.value.replace(/./g, '*')}"`);
    
    // Restaurăm valoarea originală
    passwordInput.value = originalValue;
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  return inputs.length;
}

// Funcție pentru a testa formularele din pagină
async function testForms() {
  console.log('Testare formulare...');
  
  // Obținem toate formularele din pagină
  const forms = Array.from(document.querySelectorAll('form'));
  
  // Afișăm detalii despre fiecare formular
  forms.forEach((form, index) => {
    const formId = form.id || '[Fără id]';
    const formAction = form.action || '[Fără action]';
    const formMethod = form.method || 'get';
    const formInputs = form.querySelectorAll('input').length;
    const formButtons = form.querySelectorAll('button').length;
    
    console.log(`Formular ${index + 1}: id="${formId}", method="${formMethod}"`);
    console.log(`   - Action: "${formAction}"`);
    console.log(`   - Inputuri: ${formInputs}`);
    console.log(`   - Butoane: ${formButtons}`);
  });
  
  return forms.length;
}

// Funcție pentru a testa navigarea
async function testNavigation() {
  console.log('Testare navigare...');
  
  // Obținem toate link-urile din pagină
  const links = Array.from(document.querySelectorAll('a'));
  
  // Afișăm href-ul fiecărui link
  links.forEach((link, index) => {
    const linkText = link.textContent.trim() || '[Fără text]';
    const linkHref = link.href || '[Fără href]';
    
    console.log(`Link ${index + 1}: "${linkText}" -> ${linkHref}`);
  });
  
  return links.length;
}

// Funcție pentru a rula toate testele
async function runAllTests() {
  console.log('Rulare toate testele de interacțiune...');
  
  // Testăm butoanele
  const buttonCount = await testButtons();
  
  // Testăm inputurile
  const inputCount = await testInputs();
  
  // Testăm formularele
  const formCount = await testForms();
  
  // Testăm navigarea
  const linkCount = await testNavigation();
  
  // Afișăm rezultatele
  console.log('\nREZULTATELE TESTELOR:');
  console.log(`✅ Butoane testate: ${buttonCount}`);
  console.log(`✅ Inputuri testate: ${inputCount}`);
  console.log(`✅ Formulare testate: ${formCount}`);
  console.log(`✅ Link-uri testate: ${linkCount}`);
  
  console.log('Toate testele de interacțiune au fost finalizate!');
}

// Rulăm testele după încărcarea completă a paginii
window.addEventListener('load', () => {
  // Așteptăm 1 secundă pentru a ne asigura că pagina este complet încărcată
  setTimeout(() => {
    runAllTests();
  }, 1000);
});
