const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const NODE_MODULES = path.join(ROOT, 'node_modules');

function patchTargetLinkLibraries(content) {
  if (!content.includes('target_link_libraries') || content.includes('c++_shared')) {
    return content;
  }

  let patched = content;

  // target_link_libraries(
  //   target
  //   lib...
  patched = patched.replace(
    /(target_link_libraries\s*\(\s*\n\s*[^\n]+\n)(\s+)/g,
    '$1$2c++_shared\n$2',
  );

  // target_link_libraries(target
  //   lib...
  patched = patched.replace(
    /(target_link_libraries\s*\(\s*[^\s\n]+\s*\n)(\s+)/g,
    '$1$2c++_shared\n$2',
  );

  // target_link_libraries(target lib ...)
  patched = patched.replace(
    /target_link_libraries\s*\(\s*(\S+)\s+(?!c\+\+_shared)(\S)/g,
    'target_link_libraries($1 c++_shared $2',
  );

  return patched;
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.bin') {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (
      entry.name === 'CMakeLists.txt' ||
      entry.name.endsWith('.cmake')
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

let patchedCount = 0;

for (const filePath of walk(NODE_MODULES)) {
  const original = fs.readFileSync(filePath, 'utf8');
  const patched = patchTargetLinkLibraries(original);

  if (patched !== original) {
    fs.writeFileSync(filePath, patched);
    patchedCount += 1;
    console.log(`patched ${path.relative(ROOT, filePath)}`);
  }
}

console.log(`NDK STL patch complete (${patchedCount} files).`);
