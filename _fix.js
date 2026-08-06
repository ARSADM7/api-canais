const fs = require('fs');
const path = require('path');
const ROOT = 'C:/Users/BESTBROTHER/api-canais';
let fixed = 0;
function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) {
      if (['node_modules', '.git', '.vercel', '.vscode', 'android', 'www', 'app', 'data'].includes(f.name)) continue;
      walk(p);
    } else if (/\.(js|json|md)$/.test(f.name)) {
      let c = fs.readFileSync(p, 'utf8');
      const before = c;
      c = c.replace(/\.\.\/API\//g, '../api/');
      c = c.replace(/\.\/API\//g, './api/');
      c = c.replace(/API\/index/g, 'api/index');
      if (c !== before) { fs.writeFileSync(p, c, 'utf8'); fixed++; console.log('fix: ' + p.replace(ROOT, '')); }
    }
  }
}
walk(ROOT);
console.log('total corrigidos: ' + fixed);
