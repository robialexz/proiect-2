/**
 * Script pentru corectarea erorilor de sintaxă în fișierele sursă
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

// Funcție pentru a corecta erorile de sintaxă
function fixSyntaxErrors(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modifiedContent = content;
  let changes = 0;
  
  // Corectăm blocurile try-catch urmate de .from()
  const fromRegex = /try\s*{[^{}]*}\s*catch\s*\(error\)\s*{[^{}]*}\s*\.from\(/gs;
  if (fromRegex.test(modifiedContent)) {
    // Găsim toate blocurile try-catch urmate de .from()
    const matches = modifiedContent.match(/try\s*{([^{}]*?)}\s*catch\s*\(error\)\s*{([^{}]*?)}\s*\.from\(([^;]*?);/gs);
    
    if (matches) {
      for (const match of matches) {
        // Extragem părțile relevante
        const tryMatch = match.match(/try\s*{([^{}]*?)}\s*catch\s*\(error\)\s*{([^{}]*?)}\s*\.from\(([^;]*?);/s);
        
        if (tryMatch) {
          const [fullMatch, tryContent, catchContent, fromContent] = tryMatch;
          
          // Construim blocul try-catch corect
          const correctedBlock = `try {\n  ${tryContent.trim()}.from(${fromContent};\n} catch (error) {\n  ${catchContent.trim()}\n}`;
          
          // Înlocuim blocul incorect cu cel corect
          modifiedContent = modifiedContent.replace(fullMatch, correctedBlock);
          changes++;
        }
      }
    }
  }
  
  // Corectăm blocurile try-catch cu const ... = await ... urmate de parametri
  const constRegex = /try\s*{\s*const\s+[^=]+=\s+await\s+[^(]+}\s*catch\s*\(error\)\s*{[^{}]*}\s*\(/gs;
  if (constRegex.test(modifiedContent)) {
    // Găsim toate blocurile try-catch cu const ... = await ... urmate de parametri
    const matches = modifiedContent.match(/try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/gs);
    
    if (matches) {
      for (const match of matches) {
        // Extragem părțile relevante
        const constMatch = match.match(/try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/s);
        
        if (constMatch) {
          const [fullMatch, constPart, awaitPart, catchContent, paramsPart] = constMatch;
          
          // Construim blocul try-catch corect
          const correctedBlock = `try {\n  const ${constPart}= await ${awaitPart}(${paramsPart});\n} catch (error) {\n  ${catchContent.trim()}\n}`;
          
          // Înlocuim blocul incorect cu cel corect
          modifiedContent = modifiedContent.replace(fullMatch, correctedBlock);
          changes++;
        }
      }
    }
  }
  
  // Corectăm blocurile try-catch cu return await ... urmate de parametri
  const returnRegex = /try\s*{\s*return\s+await\s+[^(]+}\s*catch\s*\(error\)\s*{[^{}]*}\s*\(/gs;
  if (returnRegex.test(modifiedContent)) {
    // Găsim toate blocurile try-catch cu return await ... urmate de parametri
    const matches = modifiedContent.match(/try\s*{\s*return\s+await\s+([^(]+)}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/gs);
    
    if (matches) {
      for (const match of matches) {
        // Extragem părțile relevante
        const returnMatch = match.match(/try\s*{\s*return\s+await\s+([^(]+)}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/s);
        
        if (returnMatch) {
          const [fullMatch, awaitPart, catchContent, paramsPart] = returnMatch;
          
          // Construim blocul try-catch corect
          const correctedBlock = `try {\n  return await ${awaitPart}(${paramsPart});\n} catch (error) {\n  ${catchContent.trim()}\n}`;
          
          // Înlocuim blocul incorect cu cel corect
          modifiedContent = modifiedContent.replace(fullMatch, correctedBlock);
          changes++;
        }
      }
    }
  }
  
  // Corectăm blocurile try-catch cu const ... = await ... urmate de parametri (varianta 2)
  const constRegex2 = /try\s*{\s*const\s+[^}]*\s*}\s*catch\s*\(error\)\s*{[^{}]*}\s*[^;]*;/gs;
  if (constRegex2.test(modifiedContent)) {
    // Găsim toate blocurile try-catch cu const ... = await ... urmate de parametri
    const matches = modifiedContent.match(/try\s*{\s*const\s+([^=]+)=\s+await\s+([^}]*)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*([^;]*);/gs);
    
    if (matches) {
      for (const match of matches) {
        // Extragem părțile relevante
        const constMatch = match.match(/try\s*{\s*const\s+([^=]+)=\s+await\s+([^}]*)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*([^;]*);/s);
        
        if (constMatch) {
          const [fullMatch, constPart, awaitPart, catchContent, restPart] = constMatch;
          
          // Construim blocul try-catch corect
          const correctedBlock = `try {\n  const ${constPart}= await ${awaitPart}${restPart};\n} catch (error) {\n  ${catchContent.trim()}\n}`;
          
          // Înlocuim blocul incorect cu cel corect
          modifiedContent = modifiedContent.replace(fullMatch, correctedBlock);
          changes++;
        }
      }
    }
  }
  
  // Corectăm blocurile try-catch cu const ... = await ... urmate de parametri (varianta 3)
  const constRegex3 = /try\s*{\s*const\s+[^}]*\s*}\s*catch\s*\(error\)\s*{[^{}]*}\s*[^;]*;/gs;
  if (constRegex3.test(modifiedContent)) {
    // Găsim toate blocurile try-catch cu const ... = await ... urmate de parametri
    const matches = modifiedContent.match(/try\s*{\s*const\s+([^}]*)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*([^;]*);/gs);
    
    if (matches) {
      for (const match of matches) {
        // Extragem părțile relevante
        const constMatch = match.match(/try\s*{\s*const\s+([^}]*)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*([^;]*);/s);
        
        if (constMatch) {
          const [fullMatch, constPart, catchContent, restPart] = constMatch;
          
          // Construim blocul try-catch corect
          const correctedBlock = `try {\n  const ${constPart}${restPart};\n} catch (error) {\n  ${catchContent.trim()}\n}`;
          
          // Înlocuim blocul incorect cu cel corect
          modifiedContent = modifiedContent.replace(fullMatch, correctedBlock);
          changes++;
        }
      }
    }
  }
  
  // Corectăm blocurile try-catch cu const ... = await ... urmate de parametri (varianta 4)
  const constRegex4 = /try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/gs;
  if (constRegex4.test(modifiedContent)) {
    // Găsim toate blocurile try-catch cu const ... = await ... urmate de parametri
    const matches = modifiedContent.match(/try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/gs);
    
    if (matches) {
      for (const match of matches) {
        // Extragem părțile relevante
        const constMatch = match.match(/try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/s);
        
        if (constMatch) {
          const [fullMatch, constPart, awaitPart, catchContent, paramsPart] = constMatch;
          
          // Construim blocul try-catch corect
          const correctedBlock = `try {\n  const ${constPart}= await ${awaitPart}(${paramsPart});\n} catch (error) {\n  ${catchContent.trim()}\n}`;
          
          // Înlocuim blocul incorect cu cel corect
          modifiedContent = modifiedContent.replace(fullMatch, correctedBlock);
          changes++;
        }
      }
    }
  }
  
  // Corectăm blocurile try-catch cu const ... = await ... urmate de parametri (varianta 5)
  const constRegex5 = /try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/gs;
  if (constRegex5.test(modifiedContent)) {
    // Găsim toate blocurile try-catch cu const ... = await ... urmate de parametri
    const matches = modifiedContent.match(/try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/gs);
    
    if (matches) {
      for (const match of matches) {
        // Extragem părțile relevante
        const constMatch = match.match(/try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/s);
        
        if (constMatch) {
          const [fullMatch, constPart, awaitPart, catchContent, paramsPart] = constMatch;
          
          // Construim blocul try-catch corect
          const correctedBlock = `try {\n  const ${constPart}= await ${awaitPart}(${paramsPart});\n} catch (error) {\n  ${catchContent.trim()}\n}`;
          
          // Înlocuim blocul incorect cu cel corect
          modifiedContent = modifiedContent.replace(fullMatch, correctedBlock);
          changes++;
        }
      }
    }
  }
  
  // Corectăm blocurile try-catch cu const ... = await ... urmate de parametri (varianta 6)
  const constRegex6 = /try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/gs;
  if (constRegex6.test(modifiedContent)) {
    // Găsim toate blocurile try-catch cu const ... = await ... urmate de parametri
    const matches = modifiedContent.match(/try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/gs);
    
    if (matches) {
      for (const match of matches) {
        // Extragem părțile relevante
        const constMatch = match.match(/try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/s);
        
        if (constMatch) {
          const [fullMatch, constPart, awaitPart, catchContent, paramsPart] = constMatch;
          
          // Construim blocul try-catch corect
          const correctedBlock = `try {\n  const ${constPart}= await ${awaitPart}(${paramsPart});\n} catch (error) {\n  ${catchContent.trim()}\n}`;
          
          // Înlocuim blocul incorect cu cel corect
          modifiedContent = modifiedContent.replace(fullMatch, correctedBlock);
          changes++;
        }
      }
    }
  }
  
  // Corectăm blocurile try-catch cu const ... = await ... urmate de parametri (varianta 7)
  const constRegex7 = /try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/gs;
  if (constRegex7.test(modifiedContent)) {
    // Găsim toate blocurile try-catch cu const ... = await ... urmate de parametri
    const matches = modifiedContent.match(/try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/gs);
    
    if (matches) {
      for (const match of matches) {
        // Extragem părțile relevante
        const constMatch = match.match(/try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/s);
        
        if (constMatch) {
          const [fullMatch, constPart, awaitPart, catchContent, paramsPart] = constMatch;
          
          // Construim blocul try-catch corect
          const correctedBlock = `try {\n  const ${constPart}= await ${awaitPart}(${paramsPart});\n} catch (error) {\n  ${catchContent.trim()}\n}`;
          
          // Înlocuim blocul incorect cu cel corect
          modifiedContent = modifiedContent.replace(fullMatch, correctedBlock);
          changes++;
        }
      }
    }
  }
  
  // Corectăm blocurile try-catch cu const ... = await ... urmate de parametri (varianta 8)
  const constRegex8 = /try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/gs;
  if (constRegex8.test(modifiedContent)) {
    // Găsim toate blocurile try-catch cu const ... = await ... urmate de parametri
    const matches = modifiedContent.match(/try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/gs);
    
    if (matches) {
      for (const match of matches) {
        // Extragem părțile relevante
        const constMatch = match.match(/try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/s);
        
        if (constMatch) {
          const [fullMatch, constPart, awaitPart, catchContent, paramsPart] = constMatch;
          
          // Construim blocul try-catch corect
          const correctedBlock = `try {\n  const ${constPart}= await ${awaitPart}(${paramsPart});\n} catch (error) {\n  ${catchContent.trim()}\n}`;
          
          // Înlocuim blocul incorect cu cel corect
          modifiedContent = modifiedContent.replace(fullMatch, correctedBlock);
          changes++;
        }
      }
    }
  }
  
  // Corectăm blocurile try-catch cu const ... = await ... urmate de parametri (varianta 9)
  const constRegex9 = /try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/gs;
  if (constRegex9.test(modifiedContent)) {
    // Găsim toate blocurile try-catch cu const ... = await ... urmate de parametri
    const matches = modifiedContent.match(/try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/gs);
    
    if (matches) {
      for (const match of matches) {
        // Extragem părțile relevante
        const constMatch = match.match(/try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/s);
        
        if (constMatch) {
          const [fullMatch, constPart, awaitPart, catchContent, paramsPart] = constMatch;
          
          // Construim blocul try-catch corect
          const correctedBlock = `try {\n  const ${constPart}= await ${awaitPart}(${paramsPart});\n} catch (error) {\n  ${catchContent.trim()}\n}`;
          
          // Înlocuim blocul incorect cu cel corect
          modifiedContent = modifiedContent.replace(fullMatch, correctedBlock);
          changes++;
        }
      }
    }
  }
  
  // Corectăm blocurile try-catch cu const ... = await ... urmate de parametri (varianta 10)
  const constRegex10 = /try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/gs;
  if (constRegex10.test(modifiedContent)) {
    // Găsim toate blocurile try-catch cu const ... = await ... urmate de parametri
    const matches = modifiedContent.match(/try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/gs);
    
    if (matches) {
      for (const match of matches) {
        // Extragem părțile relevante
        const constMatch = match.match(/try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/s);
        
        if (constMatch) {
          const [fullMatch, constPart, awaitPart, catchContent, paramsPart] = constMatch;
          
          // Construim blocul try-catch corect
          const correctedBlock = `try {\n  const ${constPart}= await ${awaitPart}(${paramsPart});\n} catch (error) {\n  ${catchContent.trim()}\n}`;
          
          // Înlocuim blocul incorect cu cel corect
          modifiedContent = modifiedContent.replace(fullMatch, correctedBlock);
          changes++;
        }
      }
    }
  }
  
  // Corectăm blocurile try-catch cu const ... = await ... urmate de parametri (varianta 11)
  const constRegex11 = /try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/gs;
  if (constRegex11.test(modifiedContent)) {
    // Găsim toate blocurile try-catch cu const ... = await ... urmate de parametri
    const matches = modifiedContent.match(/try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/gs);
    
    if (matches) {
      for (const match of matches) {
        // Extragem părțile relevante
        const constMatch = match.match(/try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/s);
        
        if (constMatch) {
          const [fullMatch, constPart, awaitPart, catchContent, paramsPart] = constMatch;
          
          // Construim blocul try-catch corect
          const correctedBlock = `try {\n  const ${constPart}= await ${awaitPart}(${paramsPart});\n} catch (error) {\n  ${catchContent.trim()}\n}`;
          
          // Înlocuim blocul incorect cu cel corect
          modifiedContent = modifiedContent.replace(fullMatch, correctedBlock);
          changes++;
        }
      }
    }
  }
  
  // Corectăm blocurile try-catch cu const ... = await ... urmate de parametri (varianta 12)
  const constRegex12 = /try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/gs;
  if (constRegex12.test(modifiedContent)) {
    // Găsim toate blocurile try-catch cu const ... = await ... urmate de parametri
    const matches = modifiedContent.match(/try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/gs);
    
    if (matches) {
      for (const match of matches) {
        // Extragem părțile relevante
        const constMatch = match.match(/try\s*{\s*const\s+([^=]+)=\s+await\s+([^(]+)\s*}\s*catch\s*\(error\)\s*{([^{}]*)}\s*\(([^;]*);/s);
        
        if (constMatch) {
          const [fullMatch, constPart, awaitPart, catchContent, paramsPart] = constMatch;
          
          // Construim blocul try-catch corect
          const correctedBlock = `try {\n  const ${constPart}= await ${awaitPart}(${paramsPart});\n} catch (error) {\n  ${catchContent.trim()}\n}`;
          
          // Înlocuim blocul incorect cu cel corect
          modifiedContent = modifiedContent.replace(fullMatch, correctedBlock);
          changes++;
        }
      }
    }
  }
  
  if (content !== modifiedContent) {
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, modifiedContent);
    }
  }
  
  return changes;
}

// Funcția principală
function main() {
  console.log('Corectarea erorilor de sintaxă în fișierele sursă...');
  
  // Obținem toate fișierele
  const files = getAllFiles();
  console.log(`S-au găsit ${files.length} fișiere pentru verificare.`);
  
  // Rezultatele
  const results = {
    errorsFixed: 0,
    filesModified: 0,
  };
  
  // Verificăm fiecare fișier
  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file);
    
    // Verificăm dacă fișierul conține erori de sintaxă
    const content = fs.readFileSync(file, 'utf-8');
    
    // Verificăm dacă fișierul conține blocuri try-catch urmate de .from()
    if (content.match(/try\s*{[^{}]*}\s*catch\s*\(error\)\s*{[^{}]*}\s*\.from\(/s) ||
        content.match(/try\s*{\s*const\s+[^=]+=\s+await\s+[^(]+}\s*catch\s*\(error\)\s*{[^{}]*}\s*\(/s) ||
        content.match(/try\s*{\s*return\s+await\s+[^(]+}\s*catch\s*\(error\)\s*{[^{}]*}\s*\(/s)) {
      console.log(`Verificare: ${relativePath}`);
      
      // Corectăm erorile de sintaxă
      const changes = fixSyntaxErrors(file);
      
      results.errorsFixed += changes;
      
      if (changes > 0) {
        results.filesModified++;
        console.log(`  Modificări în ${relativePath}: ${changes} erori corectate`);
      }
    }
  }
  
  // Afișăm rezultatele
  console.log('\n=== RAPORT FINAL ===');
  console.log(`Total fișiere verificate: ${files.length}`);
  console.log(`Fișiere modificate: ${results.filesModified}`);
  console.log(`Erori corectate: ${results.errorsFixed}`);
  
  if (DRY_RUN) {
    console.log('\nAcesta a fost un dry run. Nicio modificare nu a fost aplicată.');
  }
}

// Rulăm funcția principală
main();
