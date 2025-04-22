/**
 * Script pentru corectarea blocurilor try-catch adăugate incorect
 */

const fs = require('fs');
const path = require('path');

// Configurație
const SRC_DIR = path.join(__dirname, '../src');
const IGNORE_DIRS = ['node_modules', 'dist', 'build', '.git', 'public'];
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const DRY_RUN = false; // Setați la true pentru a vedea modificările fără a le aplica

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

// Funcție pentru a corecta blocurile try-catch adăugate incorect
function fixTryCatch(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let modifiedContent = content;
  let changes = 0;

  // Regex pentru a găsi blocurile try-catch adăugate incorect
  // Căutăm pattern-ul:
  // try {
  // statement
  // } catch (error) {
  //   // Handle error appropriately
  // }
  //   .restOfStatement

  const regex = /try\s*{\s*([^{}]*?)\s*}\s*catch\s*\(error\)\s*{\s*\/\/\s*Handle error appropriately\s*}\s*(\.[^;]*)/g;

  // Înlocuim cu:
  // try {
  //   statement
  //   .restOfStatement
  // } catch (error) {
  //   // Handle error appropriately
  // }

  modifiedContent = modifiedContent.replace(regex, (match, statement, restOfStatement) => {
    changes++;
    return `try {\n  ${statement.trim()}${restOfStatement}\n} catch (error) {\n  // Handle error appropriately\n}`;
  });

  // Regex pentru a găsi blocurile try-catch adăugate incorect pentru return statements
  // Căutăm pattern-ul:
  // try {
  // return await
  // } catch (error) {
  //   // Handle error appropriately
  // }
  //   object

  const returnRegex = /try\s*{\s*return\s+await\s+([^(]*?)\s*}\s*catch\s*\(error\)\s*{\s*\/\/\s*Handle error appropriately\s*}\s*(\{[^;]*)/g;

  // Înlocuim cu:
  // try {
  //   return await function({
  //     object
  //   });
  // } catch (error) {
  //   // Handle error appropriately
  // }

  modifiedContent = modifiedContent.replace(returnRegex, (match, func, object) => {
    changes++;
    return `try {\n  return await ${func}${object}\n} catch (error) {\n  // Handle error appropriately\n}`;
  });

  // Regex pentru a găsi blocurile try-catch adăugate incorect pentru const statements
  // Căutăm pattern-ul:
  // try {
  // const { data, error } = await
  // } catch (error) {
  //   // Handle error appropriately
  // }
  //   function(

  const constRegex = /try\s*{\s*const\s+(\{[^}]*\})\s*=\s*await\s+([^(]*?)\s*}\s*catch\s*\(error\)\s*{\s*\/\/\s*Handle error appropriately\s*}\s*(\([^;]*)/g;

  // Înlocuim cu:
  // try {
  //   const { data, error } = await function(
  //     params
  //   );
  // } catch (error) {
  //   // Handle error appropriately
  // }

  modifiedContent = modifiedContent.replace(constRegex, (match, vars, func, params) => {
    changes++;
    return `try {\n  const ${vars} = await ${func}${params}\n} catch (error) {\n  // Handle error appropriately\n}`;
  });

  if (content !== modifiedContent) {
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, modifiedContent);
    }
  }

  return changes;
}

// Funcția principală
function main() {
  console.log('Corectarea blocurilor try-catch adăugate incorect...');

  // Obținem toate fișierele
  const files = getAllFiles();
  console.log(`S-au găsit ${files.length} fișiere pentru verificare.`);

  // Rezultatele
  const results = {
    tryCatchFixed: 0,
    filesModified: 0,
  };

  // Verificăm fiecare fișier
  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file);

    // Verificăm dacă fișierul conține blocuri try-catch adăugate incorect
    const content = fs.readFileSync(file, 'utf-8');
    if (content.match(/try\s*{\s*[^{}]*?\s*}\s*catch\s*\(error\)\s*{\s*\/\/\s*Handle error appropriately\s*}\s*\.|try\s*{\s*const\s+\{[^}]*\}\s*=\s*await\s+[^(]*?\s*}\s*catch\s*\(error\)\s*{\s*\/\/\s*Handle error appropriately\s*}\s*\(|try\s*{\s*return\s+await\s+[^(]*?\s*}\s*catch\s*\(error\)\s*{\s*\/\/\s*Handle error appropriately\s*}\s*\{/)) {
      console.log(`Verificare: ${relativePath}`);

      // Corectăm blocurile try-catch adăugate incorect
      const changes = fixTryCatch(file);

      results.tryCatchFixed += changes;

      if (changes > 0) {
        results.filesModified++;
        console.log(`  Modificări în ${relativePath}: ${changes} blocuri try-catch corectate`);
      }
    }
  }

  // Afișăm rezultatele
  console.log('\n=== RAPORT FINAL ===');
  console.log(`Total fișiere verificate: ${files.length}`);
  console.log(`Fișiere modificate: ${results.filesModified}`);
  console.log(`Blocuri try-catch corectate: ${results.tryCatchFixed}`);

  if (DRY_RUN) {
    console.log('\nAcesta a fost un dry run. Nicio modificare nu a fost aplicată.');
  }
}

// Rulăm funcția principală
main();
