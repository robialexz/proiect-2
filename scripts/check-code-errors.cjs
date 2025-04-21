/**
 * Script pentru verificarea erorilor în fișierele de cod
 * Acest script va analiza fiecare fișier de cod pentru probleme comune
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configurație
const SRC_DIR = path.join(__dirname, '../src');
const IGNORE_DIRS = ['node_modules', 'dist', 'build', '.git', 'public'];
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Probleme comune de verificat
const COMMON_ISSUES = [
  {
    name: 'Console statements',
    pattern: /console\.(log|error|warn|info|debug)/g,
    severity: 'warning',
    message: 'Console statement should be removed in production code',
  },
  {
    name: 'Debugger statements',
    pattern: /debugger;/g,
    severity: 'error',
    message: 'Debugger statement should be removed',
  },
  {
    name: 'TODO comments',
    pattern: /\/\/\s*TODO/g,
    severity: 'info',
    message: 'TODO comment found',
  },
  {
    name: 'FIXME comments',
    pattern: /\/\/\s*FIXME/g,
    severity: 'warning',
    message: 'FIXME comment found',
  },
  {
    name: 'Hardcoded URLs',
    pattern: /(["'])(https?:\/\/[^"']+)\1/g,
    severity: 'warning',
    message: 'Hardcoded URL found, consider using environment variables',
    exclude: ['constants.ts', 'config.ts', 'environment.ts'],
  },
  {
    name: 'Empty catch blocks',
    pattern: /catch\s*\([^)]*\)\s*{\s*}/g,
    severity: 'error',
    message: 'Empty catch block found',
  },
  {
    name: 'Commented out code',
    pattern: /\/\/\s*[a-zA-Z0-9]+.*[;{}]/g,
    severity: 'warning',
    message: 'Commented out code found',
  },
  {
    name: 'Unused imports',
    pattern: /import\s+{[^}]*}\s+from/g,
    severity: 'warning',
    message: 'Potential unused imports',
    customCheck: (content, match) => {
      const imports = match[0].match(/import\s+{([^}]*)}\s+from/)[1].split(',');
      const unusedImports = [];
      
      for (const importItem of imports) {
        const importName = importItem.trim().split(' as ')[0].trim();
        if (importName && !content.includes(importName)) {
          unusedImports.push(importName);
        }
      }
      
      return unusedImports.length > 0 ? `Unused imports: ${unusedImports.join(', ')}` : null;
    },
  },
  {
    name: 'Missing error handling',
    pattern: /\bawait\s+[^;]*(?!\s*catch)/g,
    severity: 'warning',
    message: 'Potential missing error handling for await',
    exclude: ['try {'],
  },
  {
    name: 'Undefined variables',
    pattern: /\b(logger|apiLogger|authLogger|routerLogger|storeLogger|uiLogger)\b/g,
    severity: 'error',
    message: 'Potential undefined variable',
    customCheck: (content, match) => {
      const variable = match[1];
      const importPattern = new RegExp(`import\\s+{[^}]*\\b${variable}\\b[^}]*}\\s+from`);
      const importDefaultPattern = new RegExp(`import\\s+${variable}\\s+from`);
      
      if (!importPattern.test(content) && !importDefaultPattern.test(content)) {
        return `Variable '${variable}' is used but not imported`;
      }
      
      return null;
    },
  },
];

// Funcție pentru a obține toate fișierele din directorul src
function getAllFiles() {
  const files = [];
  
  function scanDirectory(directory) {
    const items = fs.readdirSync(directory);
    
    for (const item of items) {
      const itemPath = path.join(directory, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        if (!IGNORE_DIRS.includes(item)) {
          scanDirectory(itemPath);
        }
      } else if (EXTENSIONS.includes(path.extname(item))) {
        files.push(itemPath);
      }
    }
  }
  
  scanDirectory(SRC_DIR);
  return files;
}

// Funcție pentru a verifica un fișier pentru probleme
function checkFileForIssues(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];
  const fileName = path.basename(filePath);
  
  for (const issue of COMMON_ISSUES) {
    // Verificăm dacă fișierul trebuie exclus pentru această problemă
    if (issue.exclude && issue.exclude.some(exclude => {
      if (typeof exclude === 'string') {
        return fileName.includes(exclude);
      } else {
        return exclude.test(filePath);
      }
    })) {
      continue;
    }
    
    let match;
    while ((match = issue.pattern.exec(content)) !== null) {
      // Verificăm contextul pentru a evita false positive-uri
      const line = content.substring(0, match.index).split('\n').length;
      const lineContent = content.split('\n')[line - 1];
      
      // Verificăm dacă linia este într-un comentariu (exceptând problemele legate de comentarii)
      if (!issue.name.includes('comment') && lineContent.trim().startsWith('//')) {
        continue;
      }
      
      let message = issue.message;
      
      // Aplicăm verificarea personalizată dacă există
      if (issue.customCheck) {
        const customMessage = issue.customCheck(content, match);
        if (customMessage === null) {
          continue;
        }
        message = customMessage;
      }
      
      issues.push({
        name: issue.name,
        severity: issue.severity,
        message,
        line,
        column: match.index - content.lastIndexOf('\n', match.index),
        match: match[0],
      });
    }
  }
  
  return issues;
}

// Funcție pentru a rula ESLint pe un fișier
function runEslintOnFile(filePath) {
  try {
    const result = execSync(`npx eslint "${filePath}" --format json`, { encoding: 'utf-8' });
    return JSON.parse(result);
  } catch (error) {
    // ESLint returnează un cod de ieșire diferit de 0 când găsește probleme
    if (error.stdout) {
      return JSON.parse(error.stdout);
    }
    return [];
  }
}

// Funcția principală
function main() {
  console.log('Verificarea erorilor în fișierele de cod...');
  
  // Obținem toate fișierele
  const files = getAllFiles();
  console.log(`S-au găsit ${files.length} fișiere pentru verificare.`);
  
  // Rezultatele verificării
  const results = {};
  
  // Verificăm fiecare fișier
  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`Verificare: ${relativePath}`);
    
    // Verificăm problemele comune
    const issues = checkFileForIssues(file);
    
    // Adăugăm rezultatele
    results[relativePath] = {
      issues,
      hasIssues: issues.length > 0,
    };
    
    // Afișăm rezultatele pentru fișierul curent
    if (issues.length > 0) {
      console.log(`  ⚠️ ${issues.length} probleme găsite:`);
      
      issues.forEach((issue) => {
        const severityIcon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`    ${severityIcon} [${issue.severity.toUpperCase()}] ${issue.name}: ${issue.message} (linia ${issue.line})`);
      });
    } else {
      console.log('  ✅ Nicio problemă găsită');
    }
    
    console.log('');
  }
  
  // Generăm un raport
  const issueFiles = Object.entries(results).filter(([_, data]) => data.hasIssues);
  
  console.log('=== RAPORT FINAL ===');
  console.log(`Total fișiere verificate: ${files.length}`);
  console.log(`Fișiere cu probleme: ${issueFiles.length}`);
  
  if (issueFiles.length > 0) {
    console.log('\nFișiere cu probleme:');
    issueFiles.forEach(([file, data]) => {
      const errorCount = data.issues.filter(issue => issue.severity === 'error').length;
      const warningCount = data.issues.filter(issue => issue.severity === 'warning').length;
      const infoCount = data.issues.filter(issue => issue.severity === 'info').length;
      
      console.log(`- ${file}: ${errorCount} erori, ${warningCount} avertismente, ${infoCount} informații`);
    });
  }
  
  // Salvăm rezultatele într-un fișier JSON
  fs.writeFileSync(
    path.join(__dirname, 'code-issues-report.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log('\nRaportul a fost salvat în code-issues-report.json');
  
  // Returnăm numărul de fișiere cu erori
  return issueFiles.length;
}

// Rulăm funcția principală
const issueCount = main();

// Ieșim cu un cod de eroare dacă există probleme
process.exit(issueCount > 0 ? 1 : 0);
