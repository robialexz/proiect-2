/**
 * Script pentru generarea unui raport de testare
 * Analizează rezultatele testelor și generează un raport detaliat
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obținem directorul curent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurare
const SRC_DIR = path.join(__dirname, '..', 'src');
const REPORTS_DIR = path.join(__dirname, '..', 'reports');
const TEST_DIRS = ['__tests__', '__test__', 'tests', 'test'];
const COMPONENT_EXTENSIONS = ['.tsx', '.jsx'];
const TEST_FILE_PATTERN = /\.(test|spec)\.(tsx|jsx|ts|js)$/;

// Asigurăm că directorul de rapoarte există
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Funcție pentru a găsi toate fișierele cu o anumită extensie
function findFiles(dir, extensions, excludePatterns = []) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory() && !TEST_DIRS.includes(file)) {
      // Recursiv pentru directoare, excluzând directoarele de teste
      results = results.concat(findFiles(filePath, extensions, excludePatterns));
    } else if (stat && stat.isFile()) {
      const ext = path.extname(file);
      const isExcluded = excludePatterns.some(pattern => pattern.test(file));
      
      if (extensions.includes(ext) && !isExcluded) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

// Funcție pentru a găsi toate fișierele de test
function findTestFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      if (TEST_DIRS.includes(file)) {
        // Dacă este un director de teste, căutăm fișiere de test în el
        const testFiles = fs.readdirSync(filePath)
          .filter(f => TEST_FILE_PATTERN.test(f))
          .map(f => path.join(filePath, f));
        results = results.concat(testFiles);
      } else {
        // Recursiv pentru alte directoare
        results = results.concat(findTestFiles(filePath));
      }
    } else if (stat && stat.isFile() && TEST_FILE_PATTERN.test(file)) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Funcție pentru a analiza complexitatea unei componente
function analyzeComponentComplexity(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Indicatori de complexitate
  const indicators = {
    conditionalRendering: (content.match(/\{.*\?.*:.*\}/g) || []).length,
    useEffectCalls: (content.match(/useEffect\(/g) || []).length,
    useStateCalls: (content.match(/useState\(/g) || []).length,
    renderMethods: (content.match(/render\(\)/g) || []).length,
    nestedComponents: (content.match(/function\s+[A-Z][a-zA-Z]*\s*\(/g) || []).length,
    jsxElements: (content.match(/<[A-Z][a-zA-Z]*|<[a-z][a-zA-Z]*\.[A-Z][a-zA-Z]*/g) || []).length,
  };
  
  // Calculăm un scor de complexitate
  const complexityScore = 
    indicators.conditionalRendering * 1 +
    indicators.useEffectCalls * 2 +
    indicators.useStateCalls * 0.5 +
    indicators.renderMethods * 3 +
    indicators.nestedComponents * 3 +
    indicators.jsxElements * 0.2;
  
  return {
    filePath,
    complexityScore,
    indicators,
    isComplex: complexityScore > 30, // Prag arbitrar pentru complexitate
  };
}

// Funcție pentru a detecta probleme de performanță
function detectPerformanceIssues(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  const issues = [];
  
  // Verificăm pentru funcții inline în JSX
  const inlineFunctions = (content.match(/<.*\{.*=>.*\}.*>/g) || []).length;
  if (inlineFunctions > 0) {
    issues.push({
      type: 'inlineFunctions',
      count: inlineFunctions,
      description: 'Funcții inline în JSX care pot cauza re-renderizări inutile',
    });
  }
  
  // Verificăm pentru array-uri goale în useEffect
  const emptyDependencyArrays = (content.match(/useEffect\([^,]*,\s*\[\s*\]\s*\)/g) || []).length;
  if (emptyDependencyArrays > 0) {
    issues.push({
      type: 'emptyDependencyArrays',
      count: emptyDependencyArrays,
      description: 'useEffect cu array de dependențe gol care rulează doar la montare',
    });
  }
  
  // Verificăm pentru lipsa memo/useCallback
  const functionComponents = (content.match(/function\s+[A-Z][a-zA-Z]*\s*\(/g) || []).length;
  const memoUsage = (content.match(/React\.memo|memo\(/g) || []).length;
  const useCallbackUsage = (content.match(/useCallback\(/g) || []).length;
  
  if (functionComponents > 0 && memoUsage === 0) {
    issues.push({
      type: 'noMemo',
      count: functionComponents,
      description: 'Componente funcționale fără React.memo',
    });
  }
  
  // Verificăm pentru obiecte create în render
  const objectsInRender = (content.match(/\{\s*[a-zA-Z0-9_$]+\s*:\s*[^,}]+\s*(,\s*[a-zA-Z0-9_$]+\s*:\s*[^,}]+\s*)*\}/g) || []).length;
  if (objectsInRender > 5) { // Prag arbitrar
    issues.push({
      type: 'objectsInRender',
      count: objectsInRender,
      description: 'Multe obiecte create în render care pot cauza re-renderizări',
    });
  }
  
  return {
    filePath,
    issues,
    hasIssues: issues.length > 0,
  };
}

// Funcție pentru a genera raportul
function generateReport() {
  console.log('Generare raport de testare...');
  
  // Găsim toate componentele
  const componentFiles = findFiles(SRC_DIR, COMPONENT_EXTENSIONS, [TEST_FILE_PATTERN]);
  console.log(`Găsite ${componentFiles.length} componente.`);
  
  // Găsim toate fișierele de test
  const testFiles = findTestFiles(SRC_DIR);
  console.log(`Găsite ${testFiles.length} fișiere de test.`);
  
  // Identificăm componentele fără teste
  const componentBasenames = componentFiles.map(file => {
    const basename = path.basename(file, path.extname(file));
    const dirPath = path.dirname(file);
    return { basename, dirPath, file };
  });
  
  const testBasenames = testFiles.map(file => {
    const basename = path.basename(file, path.extname(file))
      .replace('.test', '')
      .replace('.spec', '');
    return basename;
  });
  
  const componentsWithoutTests = componentBasenames.filter(component => {
    return !testBasenames.includes(component.basename) &&
           !testFiles.some(testFile => testFile.includes(component.dirPath));
  });
  
  // Analizăm complexitatea componentelor
  const complexityAnalysis = componentFiles.map(analyzeComponentComplexity);
  const complexComponents = complexityAnalysis.filter(analysis => analysis.isComplex);
  
  // Detectăm probleme de performanță
  const performanceAnalysis = componentFiles.map(detectPerformanceIssues);
  const componentsWithPerformanceIssues = performanceAnalysis.filter(analysis => analysis.hasIssues);
  
  // Generăm raportul
  const reportDate = new Date().toLocaleString();
  let report = `# Raport de testare - ${reportDate}\n\n`;
  
  // Secțiunea pentru componente fără teste
  report += `## Componente fără teste (${componentsWithoutTests.length}/${componentFiles.length})\n\n`;
  if (componentsWithoutTests.length > 0) {
    report += 'Următoarele componente nu au teste asociate:\n\n';
    componentsWithoutTests.forEach(component => {
      const relativePath = path.relative(SRC_DIR, component.file);
      report += `- ${component.basename} (${relativePath})\n`;
    });
    report += '\n**Recomandări:**\n';
    report += '- Creați teste pentru componentele critice mai întâi\n';
    report += '- Folosiți Testing Library pentru a testa comportamentul, nu implementarea\n';
    report += '- Implementați cel puțin teste de bază pentru fiecare componentă\n';
  } else {
    report += 'Toate componentele au teste asociate. Felicitări!\n';
  }
  report += '\n';
  
  // Secțiunea pentru componente complexe
  report += `## Componente complexe (${complexComponents.length}/${componentFiles.length})\n\n`;
  if (complexComponents.length > 0) {
    report += 'Următoarele componente au complexitate ridicată și pot fi dificil de întreținut:\n\n';
    complexComponents.forEach(component => {
      const relativePath = path.relative(SRC_DIR, component.filePath);
      report += `- ${path.basename(component.filePath)} (${relativePath}) - Scor: ${component.complexityScore.toFixed(1)}\n`;
      report += `  - Condiții de randare: ${component.indicators.conditionalRendering}\n`;
      report += `  - Apeluri useEffect: ${component.indicators.useEffectCalls}\n`;
      report += `  - Apeluri useState: ${component.indicators.useStateCalls}\n`;
      report += `  - Componente imbricate: ${component.indicators.nestedComponents}\n`;
      report += `  - Elemente JSX: ${component.indicators.jsxElements}\n`;
    });
    report += '\n**Recomandări:**\n';
    report += '- Refactorizați componentele mari în componente mai mici și reutilizabile\n';
    report += '- Extrageți logica complexă în hooks personalizate\n';
    report += '- Folosiți pattern-uri precum Compound Components pentru a simplifica interfețele\n';
  } else {
    report += 'Nu au fost detectate componente cu complexitate ridicată. Felicitări!\n';
  }
  report += '\n';
  
  // Secțiunea pentru probleme de performanță
  const totalIssues = componentsWithPerformanceIssues.reduce((sum, component) => sum + component.issues.length, 0);
  report += `## Probleme de performanță (${totalIssues} în ${componentsWithPerformanceIssues.length} componente)\n\n`;
  if (componentsWithPerformanceIssues.length > 0) {
    report += 'Au fost detectate următoarele probleme potențiale de performanță:\n\n';
    componentsWithPerformanceIssues.forEach(component => {
      const relativePath = path.relative(SRC_DIR, component.filePath);
      report += `- ${path.basename(component.filePath)} (${relativePath}):\n`;
      component.issues.forEach(issue => {
        report += `  - ${issue.description} (${issue.count} instanțe)\n`;
      });
    });
    report += '\n**Recomandări:**\n';
    report += '- Folosiți React.memo pentru a preveni re-renderizări inutile\n';
    report += '- Evitați definirea funcțiilor inline în JSX\n';
    report += '- Utilizați useCallback și useMemo pentru a memora funcții și valori\n';
    report += '- Optimizați array-urile de dependențe în useEffect\n';
  } else {
    report += 'Nu au fost detectate probleme de performanță. Felicitări!\n';
  }
  report += '\n';
  
  // Secțiunea pentru rezumat
  report += '## Rezumat\n\n';
  report += `- Total componente: ${componentFiles.length}\n`;
  report += `- Componente cu teste: ${componentFiles.length - componentsWithoutTests.length} (${((componentFiles.length - componentsWithoutTests.length) / componentFiles.length * 100).toFixed(1)}%)\n`;
  report += `- Componente complexe: ${complexComponents.length} (${(complexComponents.length / componentFiles.length * 100).toFixed(1)}%)\n`;
  report += `- Componente cu probleme de performanță: ${componentsWithPerformanceIssues.length} (${(componentsWithPerformanceIssues.length / componentFiles.length * 100).toFixed(1)}%)\n`;
  
  // Salvăm raportul
  const reportPath = path.join(REPORTS_DIR, `test-report-${new Date().toISOString().split('T')[0]}.md`);
  fs.writeFileSync(reportPath, report);
  
  // Salvăm și o versiune în format text
  const textReportPath = path.join(REPORTS_DIR, `test-report-${new Date().toISOString().split('T')[0]}.txt`);
  fs.writeFileSync(textReportPath, report);
  
  console.log(`Raport generat cu succes: ${reportPath}`);
  console.log(`Raport text generat cu succes: ${textReportPath}`);
  
  return {
    componentsWithoutTests,
    complexComponents,
    componentsWithPerformanceIssues,
    reportPath,
    textReportPath
  };
}

// Rulăm generarea raportului
generateReport();
