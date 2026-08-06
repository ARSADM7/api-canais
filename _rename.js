const fs = require('fs');
const path = require('path');

const ROOT = 'C:/Users/BESTBROTHER/api-canais';

// 1. Renomear API -> api (em 2 passos, Windows e case-insensitive)
const apiDir = path.join(ROOT, 'API');
const tmpDir = path.join(ROOT, '_api_tmp');
const lowerDir = path.join(ROOT, 'api');
if (fs.existsSync(apiDir) && !fs.existsSync(lowerDir)) {
  fs.renameSync(apiDir, tmpDir);
  fs.renameSync(tmpDir, lowerDir);
  console.log('renomeado API -> api');
} else if (fs.existsSync(lowerDir)) {
  console.log('api/ ja existe');
} else {
  console.log('API/ nao encontrado');
}

// 2. Corrigir referencias a "API/" em arquivos
function fixRefs(file) {
  if (!fs.existsSync(file)) return;
  let c = fs.readFileSync(file, 'utf8');
  const before = c;
  c = c.replace(/\.\.\/API\//g, '../api/');
  c = c.replace(/\.\/API\//g, './api/');
  c = c.replace(/API\/index/g, 'api/index');
  if (c !== before) {
    fs.writeFileSync(file, c, 'utf8');
    console.log('corrigido: ' + path.basename(file));
  }
}

// Corrige todos os .js, .json, .md
function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) {
      if (['node_modules', '.git', '.vercel', '.vscode', 'android', 'www', 'app', 'data'].includes(f.name)) continue;
      walk(p);
    } else if (/\.(js|json|md)$/.test(f.name)) {
      fixRefs(p);
    }
  }
}
walk(ROOT);

// 3. Limpar helper
console.log('concluido');
