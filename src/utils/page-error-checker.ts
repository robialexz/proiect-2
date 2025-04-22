/**
 * Utilitar pentru verificarea erorilor din paginile aplicației
 * Acest script poate fi rulat pentru a verifica erorile din consolă pentru fiecare pagină
 */

// Lista de pagini care trebuie verificate
const pagesToCheck = [
  '/dashboard',
  '/overview',
  '/inventory-management',
  '/inventory-overview',
  '/company-inventory',
  '/projects',
  '/suppliers',
  '/teams',
  '/budget',
  '/reports',
  '/resources',
  '/documents',
  '/schedule',
  '/tasks',
  '/forecast',
  '/settings',
  '/profile',
  '/preferences',
  '/users',
  '/role-management',
  '/audit-logs',
  '/error-monitoring',
  '/ai-assistant',
  '/scan',
  '/os-report',
  '/desktop-info',
];

// Funcție pentru verificarea erorilor din consolă
export async function checkPageErrors(page: string): Promise<{
  page: string;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Înlocuim console.error și console.warn pentru a captura erorile
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  console.error = (...args: any[]) => {
    errors.push(args.map(arg => String(arg)).join(' '));
    originalConsoleError(...args);
  };

  console.warn = (...args: any[]) => {
    warnings.push(args.map(arg => String(arg)).join(' '));
    originalConsoleWarn(...args);
  };

  try {
    // Navigăm la pagină
    window.history.pushState({}, '', page);

    // Așteptăm încărcarea paginii
    await new Promise(resolve => setTimeout(resolve, 2000));

    return { page, errors, warnings };
  } finally {
    // Restaurăm funcțiile originale
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  }
}

// Funcție pentru verificarea tuturor paginilor
export async function checkAllPages(): Promise<{
  page: string;
  errors: string[];
  warnings: string[];
}[]> {
  const results: {
    page: string;
    errors: string[];
    warnings: string[];
  }[] = [];

  for (const page of pagesToCheck) {
    const result = await checkPageErrors(page);
    results.push(result);
  }

  return results;
}

// Funcție pentru afișarea rezultatelor
export function displayResults(results: {
  page: string;
  errors: string[];
  warnings: string[];
}[]): void {
  console.group('Page Error Check Results');
  
  for (const result of results) {
    console.group(`Page: ${result.page}`);
    
    if (result.errors.length === 0 && result.warnings.length === 0) {
      console.log('✅ No errors or warnings');
    } else {
      if (result.errors.length > 0) {
        console.group(`❌ Errors (${result.errors.length})`);
        result.errors.forEach((error, index) => {
          console.error(`${index + 1}. ${error}`);
        });
        console.groupEnd();
      }
      
      if (result.warnings.length > 0) {
        console.group(`⚠️ Warnings (${result.warnings.length})`);
        result.warnings.forEach((warning, index) => {
          console.warn(`${index + 1}. ${warning}`);
        });
        console.groupEnd();
      }
    }
    
    console.groupEnd();
  }
  
  console.groupEnd();
}

// Funcție pentru rularea verificării
export async function runPageErrorCheck(): Promise<void> {
  const results = await checkAllPages();
  displayResults(results);
  
  // Calculăm statistici
  const totalErrors = results.reduce((sum, result) => sum + result.errors.length, 0);
  const totalWarnings = results.reduce((sum, result) => sum + result.warnings.length, 0);
  const pagesWithErrors = results.filter(result => result.errors.length > 0).length;
  const pagesWithWarnings = results.filter(result => result.warnings.length > 0).length;
  
  console.log(`
Summary:
- Total pages checked: ${results.length}
- Pages with errors: ${pagesWithErrors}
- Pages with warnings: ${pagesWithWarnings}
- Total errors: ${totalErrors}
- Total warnings: ${totalWarnings}
  `);
}

// Exportăm funcțiile pentru a putea fi utilizate în alte fișiere
export default {
  checkPageErrors,
  checkAllPages,
  displayResults,
  runPageErrorCheck,
};
