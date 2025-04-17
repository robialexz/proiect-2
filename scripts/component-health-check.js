#!/usr/bin/env node

/**
 * Component Health Check Script
 * 
 * This script scans the project for React components and performs health checks:
 * - Verifies that components have corresponding test files
 * - Checks if tests are passing
 * - Analyzes component complexity
 * - Detects potential performance issues
 * - Generates a health report
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Configuration
const COMPONENT_DIRS = [
  'src/components',
  'src/pages',
  'src/layouts',
];
const TEST_DIR = '__tests__';
const REPORT_PATH = 'component-health-report.json';
const COMPLEXITY_THRESHOLD = {
  lines: 300,
  hooks: 5,
  props: 10,
  states: 8,
  effects: 5,
};

// Initialize report structure
const healthReport = {
  timestamp: new Date().toISOString(),
  summary: {
    totalComponents: 0,
    testedComponents: 0,
    passingTests: 0,
    failingTests: 0,
    highComplexityComponents: 0,
    performanceIssues: 0,
  },
  components: [],
};

// Helper functions
function findComponentFiles(dir) {
  const files = [];
  
  function scanDir(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (
        entry.isFile() && 
        (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx')) &&
        !entry.name.includes('.test.') &&
        !entry.name.includes('.spec.')
      ) {
        files.push(fullPath);
      }
    }
  }
  
  scanDir(dir);
  return files;
}

function hasTestFile(componentPath) {
  const dir = path.dirname(componentPath);
  const baseName = path.basename(componentPath, path.extname(componentPath));
  
  // Check for test file in __tests__ directory
  const testDirPath = path.join(dir, TEST_DIR);
  const testFileInTestDir = path.join(testDirPath, `${baseName}.test.tsx`);
  
  // Check for test file alongside component
  const testFileAlongside = path.join(dir, `${baseName}.test.tsx`);
  
  return fs.existsSync(testFileInTestDir) || fs.existsSync(testFileAlongside);
}

function getTestFilePath(componentPath) {
  const dir = path.dirname(componentPath);
  const baseName = path.basename(componentPath, path.extname(componentPath));
  
  // Check for test file in __tests__ directory
  const testDirPath = path.join(dir, TEST_DIR);
  const testFileInTestDir = path.join(testDirPath, `${baseName}.test.tsx`);
  
  // Check for test file alongside component
  const testFileAlongside = path.join(dir, `${baseName}.test.tsx`);
  
  if (fs.existsSync(testFileInTestDir)) {
    return testFileInTestDir;
  } else if (fs.existsSync(testFileAlongside)) {
    return testFileAlongside;
  }
  
  return null;
}

function analyzeComponentComplexity(componentPath) {
  const content = fs.readFileSync(componentPath, 'utf8');
  
  // Count lines of code (excluding comments and blank lines)
  const lines = content.split('\n')
    .filter(line => line.trim() && !line.trim().startsWith('//'))
    .length;
  
  // Count hooks
  const hooksCount = (content.match(/use[A-Z][a-zA-Z]+\(/g) || []).length;
  
  // Count props
  const propsMatch = content.match(/interface\s+\w+Props\s*{([^}]*)}/);
  const propsCount = propsMatch 
    ? propsMatch[1].split(';').filter(line => line.trim()).length 
    : 0;
  
  // Count state variables
  const stateCount = (content.match(/useState[<(]/g) || []).length;
  
  // Count effects
  const effectsCount = (content.match(/useEffect\(/g) || []).length;
  
  return {
    lines,
    hooks: hooksCount,
    props: propsCount,
    states: stateCount,
    effects: effectsCount,
    isComplex: 
      lines > COMPLEXITY_THRESHOLD.lines ||
      hooksCount > COMPLEXITY_THRESHOLD.hooks ||
      propsCount > COMPLEXITY_THRESHOLD.props ||
      stateCount > COMPLEXITY_THRESHOLD.states ||
      effectsCount > COMPLEXITY_THRESHOLD.effects,
  };
}

function detectPerformanceIssues(componentPath) {
  const content = fs.readFileSync(componentPath, 'utf8');
  const issues = [];
  
  // Check for missing memo
  if (
    content.includes('export default') && 
    !content.includes('memo(') &&
    (content.includes('useState') || content.includes('useEffect'))
  ) {
    issues.push('Component with state/effects not wrapped in memo');
  }
  
  // Check for inline function definitions in JSX
  const jsxInlineFunctions = (content.match(/\<[A-Za-z]+[^>]*\s+on[A-Z][a-zA-Z]+={(?!\s*[a-zA-Z0-9_]+\s*})(?!\s*\([^)]*\)\s*=>\s*[a-zA-Z0-9_]+\s*\()/g) || []).length;
  if (jsxInlineFunctions > 0) {
    issues.push(`${jsxInlineFunctions} inline function(s) in JSX`);
  }
  
  // Check for large useEffect dependencies
  const largeEffectDeps = (content.match(/useEffect\([^,]+,\s*\[[^\]]{50,}\]\)/g) || []).length;
  if (largeEffectDeps > 0) {
    issues.push(`${largeEffectDeps} useEffect(s) with large dependency arrays`);
  }
  
  // Check for missing dependency array in useEffect
  const missingEffectDeps = (content.match(/useEffect\([^,]+(?!\s*,\s*\[)/g) || []).length;
  if (missingEffectDeps > 0) {
    issues.push(`${missingEffectDeps} useEffect(s) without dependency array`);
  }
  
  return issues;
}

function runTestForComponent(testFilePath) {
  try {
    execSync(`npx jest ${testFilePath} --silent`, { stdio: 'pipe' });
    return { passing: true, error: null };
  } catch (error) {
    return { 
      passing: false, 
      error: error.stdout ? error.stdout.toString() : 'Unknown test error' 
    };
  }
}

// Main execution
console.log(chalk.blue('🔍 Starting Component Health Check...'));

// Scan for component files
let allComponentFiles = [];
for (const dir of COMPONENT_DIRS) {
  if (fs.existsSync(dir)) {
    const files = findComponentFiles(dir);
    allComponentFiles = [...allComponentFiles, ...files];
  }
}

console.log(chalk.blue(`Found ${allComponentFiles.length} components to analyze`));
healthReport.summary.totalComponents = allComponentFiles.length;

// Analyze each component
for (const componentPath of allComponentFiles) {
  const relativePath = path.relative(process.cwd(), componentPath);
  const componentName = path.basename(componentPath, path.extname(componentPath));
  
  console.log(chalk.cyan(`\nAnalyzing ${componentName}...`));
  
  // Check for test file
  const hasTest = hasTestFile(componentPath);
  const testFilePath = hasTest ? getTestFilePath(componentPath) : null;
  
  if (hasTest) {
    healthReport.summary.testedComponents++;
    console.log(chalk.green('✓ Has test file'));
  } else {
    console.log(chalk.yellow('⚠ No test file found'));
  }
  
  // Run test if available
  let testResult = null;
  if (testFilePath) {
    console.log(chalk.blue('Running tests...'));
    testResult = runTestForComponent(testFilePath);
    
    if (testResult.passing) {
      healthReport.summary.passingTests++;
      console.log(chalk.green('✓ Tests passing'));
    } else {
      healthReport.summary.failingTests++;
      console.log(chalk.red('✗ Tests failing'));
    }
  }
  
  // Analyze complexity
  const complexity = analyzeComponentComplexity(componentPath);
  if (complexity.isComplex) {
    healthReport.summary.highComplexityComponents++;
    console.log(chalk.yellow(`⚠ High complexity (${complexity.lines} lines, ${complexity.hooks} hooks, ${complexity.props} props, ${complexity.states} states, ${complexity.effects} effects)`));
  } else {
    console.log(chalk.green(`✓ Acceptable complexity (${complexity.lines} lines, ${complexity.hooks} hooks, ${complexity.props} props, ${complexity.states} states, ${complexity.effects} effects)`));
  }
  
  // Detect performance issues
  const performanceIssues = detectPerformanceIssues(componentPath);
  if (performanceIssues.length > 0) {
    healthReport.summary.performanceIssues += performanceIssues.length;
    console.log(chalk.yellow(`⚠ Performance issues detected: ${performanceIssues.join(', ')}`));
  } else {
    console.log(chalk.green('✓ No performance issues detected'));
  }
  
  // Add to report
  healthReport.components.push({
    name: componentName,
    path: relativePath,
    hasTest,
    testPassing: testResult ? testResult.passing : null,
    testError: testResult && !testResult.passing ? testResult.error : null,
    complexity,
    performanceIssues,
  });
}

// Calculate health score (0-100)
const healthScore = Math.round(
  (
    (healthReport.summary.testedComponents / healthReport.summary.totalComponents) * 40 +
    (healthReport.summary.passingTests / Math.max(1, healthReport.summary.testedComponents)) * 40 +
    (1 - (healthReport.summary.highComplexityComponents / healthReport.summary.totalComponents)) * 10 +
    (1 - (healthReport.summary.performanceIssues / Math.max(1, healthReport.summary.totalComponents))) * 10
  ) * 100
) / 100;

healthReport.summary.healthScore = healthScore;

// Save report
fs.writeFileSync(REPORT_PATH, JSON.stringify(healthReport, null, 2));

// Print summary
console.log(chalk.blue('\n📊 Component Health Summary:'));
console.log(chalk.white(`Total Components: ${healthReport.summary.totalComponents}`));
console.log(chalk.white(`Components with Tests: ${healthReport.summary.testedComponents} (${Math.round(healthReport.summary.testedComponents / healthReport.summary.totalComponents * 100)}%)`));
console.log(chalk.white(`Passing Tests: ${healthReport.summary.passingTests} (${Math.round(healthReport.summary.passingTests / Math.max(1, healthReport.summary.testedComponents) * 100)}%)`));
console.log(chalk.white(`High Complexity Components: ${healthReport.summary.highComplexityComponents} (${Math.round(healthReport.summary.highComplexityComponents / healthReport.summary.totalComponents * 100)}%)`));
console.log(chalk.white(`Performance Issues: ${healthReport.summary.performanceIssues}`));
console.log(chalk.white(`Overall Health Score: ${healthScore}/100`));

console.log(chalk.blue(`\n📝 Full report saved to ${REPORT_PATH}`));

// Exit with appropriate code
if (healthScore < 60) {
  console.log(chalk.red('\n❌ Component health check failed. Score below 60/100.'));
  process.exit(1);
} else {
  console.log(chalk.green('\n✅ Component health check passed!'));
  process.exit(0);
}
