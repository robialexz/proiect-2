// Script pentru testarea paginii de înregistrare
console.log('Începe testarea paginii de înregistrare...');

// Funcție pentru a aștepta un anumit timp
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Funcție pentru a completa formularul de înregistrare
async function fillRegisterForm() {
  console.log('Completez formularul de înregistrare...');
  
  // Completăm câmpurile formularului
  document.getElementById('firstName').value = 'Test';
  document.getElementById('firstName').dispatchEvent(new Event('input', { bubbles: true }));
  
  document.getElementById('lastName').value = 'User';
  document.getElementById('lastName').dispatchEvent(new Event('input', { bubbles: true }));
  
  document.getElementById('registerEmail').value = 'test' + Date.now() + '@example.com';
  document.getElementById('registerEmail').dispatchEvent(new Event('input', { bubbles: true }));
  
  document.getElementById('company').value = 'Test Company';
  document.getElementById('company').dispatchEvent(new Event('input', { bubbles: true }));
  
  document.getElementById('registerPassword').value = 'password123';
  document.getElementById('registerPassword').dispatchEvent(new Event('input', { bubbles: true }));
  
  // Bifăm termenii și condițiile
  const termsCheckbox = document.getElementById('terms');
  if (!termsCheckbox.checked) {
    termsCheckbox.click();
  }
  
  console.log('Formular completat cu succes.');
}

// Funcție pentru a testa înregistrarea cu un email nou
async function testNewEmailRegistration() {
  console.log('Testez înregistrarea cu un email nou...');
  
  // Completăm formularul
  await fillRegisterForm();
  
  // Apăsăm butonul de înregistrare
  const registerButton = Array.from(document.querySelectorAll('button')).find(
    button => button.textContent.includes('Creează cont')
  );
  
  if (registerButton) {
    console.log('Apăs butonul de înregistrare...');
    registerButton.click();
    
    // Așteptăm răspunsul
    await sleep(2000);
    
    // Verificăm dacă înregistrarea a reușit
    const successMessage = document.querySelector('.bg-green-900\\/50');
    if (successMessage) {
      console.log('Înregistrare reușită! Mesaj de succes afișat.');
      console.log('Mesaj:', successMessage.textContent);
      
      // Așteptăm să apară butonul de retrimitere email (după 1 minut)
      console.log('Aștept 60 de secunde pentru a apărea butonul de retrimitere email...');
      await sleep(60000);
      
      // Verificăm dacă butonul de retrimitere email a apărut
      const resendButton = Array.from(document.querySelectorAll('button')).find(
        button => button.textContent.includes('Retrimite email')
      );
      
      if (resendButton) {
        console.log('Butonul de retrimitere email a apărut după 1 minut!');
        
        // Testăm butonul de retrimitere email
        console.log('Apăs butonul de retrimitere email...');
        resendButton.click();
        
        // Așteptăm să apară formularul de retrimitere
        await sleep(1000);
        
        // Verificăm dacă formularul de retrimitere a apărut
        const resendForm = document.querySelector('form[onsubmit*="handleResendConfirmation"]');
        if (resendForm) {
          console.log('Formularul de retrimitere email a apărut!');
          
          // Apăsăm butonul de trimitere
          const sendButton = Array.from(resendForm.querySelectorAll('button')).find(
            button => button.textContent.includes('Trimite')
          );
          
          if (sendButton) {
            console.log('Apăs butonul de trimitere...');
            sendButton.click();
            
            // Așteptăm răspunsul
            await sleep(2000);
            
            // Verificăm dacă retrimiterea a reușit
            const resendSuccessMessage = document.querySelector('.bg-green-900\\/50');
            if (resendSuccessMessage) {
              console.log('Retrimitere reușită! Mesaj de succes afișat.');
              console.log('Mesaj:', resendSuccessMessage.textContent);
            } else {
              console.log('Retrimiterea a eșuat sau nu s-a afișat mesajul de succes.');
            }
          } else {
            console.log('Nu am găsit butonul de trimitere în formularul de retrimitere.');
          }
        } else {
          console.log('Formularul de retrimitere email nu a apărut.');
        }
      } else {
        console.log('Butonul de retrimitere email nu a apărut după 1 minut.');
      }
    } else {
      console.log('Înregistrarea a eșuat sau nu s-a afișat mesajul de succes.');
    }
  } else {
    console.log('Nu am găsit butonul de înregistrare.');
  }
}

// Funcție pentru a testa înregistrarea cu un email existent
async function testExistingEmailRegistration() {
  console.log('Testez înregistrarea cu un email existent...');
  
  // Completăm formularul cu un email care știm că există
  await fillRegisterForm();
  
  // Setăm un email care știm că există
  document.getElementById('registerEmail').value = 'test@example.com';
  document.getElementById('registerEmail').dispatchEvent(new Event('input', { bubbles: true }));
  
  // Apăsăm butonul de înregistrare
  const registerButton = Array.from(document.querySelectorAll('button')).find(
    button => button.textContent.includes('Creează cont')
  );
  
  if (registerButton) {
    console.log('Apăs butonul de înregistrare...');
    registerButton.click();
    
    // Așteptăm răspunsul
    await sleep(2000);
    
    // Verificăm dacă apare mesajul de eroare pentru email existent
    const errorMessage = document.querySelector('.bg-red-900\\/50');
    if (errorMessage && errorMessage.textContent.includes('Există deja un cont')) {
      console.log('Test reușit! Mesaj de eroare pentru email existent afișat.');
      console.log('Mesaj:', errorMessage.textContent);
      
      // Verificăm dacă apar opțiunile pentru utilizatorul existent
      const loginButton = Array.from(document.querySelectorAll('button')).find(
        button => button.textContent.includes('Autentificare cu contul existent')
      );
      
      const recoverButton = Array.from(document.querySelectorAll('button')).find(
        button => button.textContent.includes('Recuperare parolă')
      );
      
      const useOtherEmailButton = Array.from(document.querySelectorAll('button')).find(
        button => button.textContent.includes('Folosiți altă adresă de email')
      );
      
      if (loginButton && recoverButton && useOtherEmailButton) {
        console.log('Toate opțiunile pentru utilizatorul existent sunt afișate!');
        
        // Testăm butonul de recuperare parolă
        console.log('Apăs butonul de recuperare parolă...');
        recoverButton.click();
        
        // Așteptăm să apară formularul de recuperare
        await sleep(1000);
        
        // Verificăm dacă formularul de recuperare a apărut
        const recoverForm = document.querySelector('form[onsubmit*="handleResendConfirmation"]');
        if (recoverForm) {
          console.log('Formularul de recuperare parolă a apărut!');
        } else {
          console.log('Formularul de recuperare parolă nu a apărut.');
        }
        
        // Testăm butonul de folosire altă adresă de email
        console.log('Apăs butonul de folosire altă adresă de email...');
        useOtherEmailButton.click();
        
        // Așteptăm să dispară opțiunile
        await sleep(1000);
        
        // Verificăm dacă opțiunile au dispărut
        const optionsAfterClick = document.querySelector('button[textContent*="Autentificare cu contul existent"]');
        if (!optionsAfterClick) {
          console.log('Opțiunile au dispărut după apăsarea butonului de folosire altă adresă de email!');
        } else {
          console.log('Opțiunile nu au dispărut după apăsarea butonului de folosire altă adresă de email.');
        }
      } else {
        console.log('Nu toate opțiunile pentru utilizatorul existent sunt afișate.');
      }
    } else {
      console.log('Nu s-a afișat mesajul de eroare pentru email existent.');
    }
  } else {
    console.log('Nu am găsit butonul de înregistrare.');
  }
}

// Funcție pentru a rula toate testele
async function runAllTests() {
  console.log('Rulăm toate testele pentru pagina de înregistrare...');
  
  // Testăm înregistrarea cu un email existent
  await testExistingEmailRegistration();
  
  // Reîncărcăm pagina pentru a testa înregistrarea cu un email nou
  console.log('Reîncărcăm pagina pentru a testa înregistrarea cu un email nou...');
  window.location.reload();
  
  // Așteptăm să se încarce pagina
  await sleep(2000);
  
  // Testăm înregistrarea cu un email nou
  await testNewEmailRegistration();
  
  console.log('Toate testele au fost finalizate!');
}

// Rulăm testele după încărcarea completă a paginii
window.addEventListener('load', () => {
  // Așteptăm 2 secunde pentru a ne asigura că pagina este complet încărcată
  setTimeout(() => {
    runAllTests();
  }, 2000);
});
