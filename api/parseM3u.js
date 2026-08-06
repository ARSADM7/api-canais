const fs = require('fs');

function parseM3u(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split(/\r?\n/);
  const channels = [];
  let cur = null;
  for (const raw of lines) {
    const line = raw.replace(/\uFEFF/g, '').trim();
    if (!line) continue;
    if (line.startsWith('#EXTINF')) {
      if (cur && cur.url) channels.push(cur);
      cur = { name: '', tvgId: '', tvgLogo: '', groupTitle: '', url: '' };
      const m = /^#EXTINF:-?\d*[ ,](.*)$/.exec(line);
      if (m) {
        const rest = m[1];
        const lastComma = rest.lastIndexOf(',');
        if (lastComma >= 0) {
          const attrStr = rest.slice(0, lastComma);
          cur.name = rest.slice(lastComma + 1).trim();
          const attrRe = /([a-zA-Z_-]+)="([^"]*)"/g;
          let am;
          while ((am = attrRe.exec(attrStr))) {
            const k = am[1].toLowerCase();
            if (k === 'tvg-id') cur.tvgId = am[2];
            else if (k === 'tvg-logo') cur.tvgLogo = am[2];
            else if (k === 'group-title') cur.groupTitle = am[2];
          }
        } else cur.name = rest.trim();
      }
      continue;
    }
    if (line.startsWith('#')) continue;
    if (cur && !cur.url && /^https?:\/\//i.test(line)) {
      cur.url = line;
      channels.push(cur);
      cur = null;
    }
  }
  if (cur && cur.url) channels.push(cur);
  return channels;
}

module.exports = { parseM3u };
