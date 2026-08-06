const http = require('http');
const fs = require('fs');
const path = require('path');

const mime = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
};

http.createServer((req, res) => {
    let f = req.url === '/' ? '/index.html' : req.url;
    f = path.join(process.cwd(), f);
    fs.readFile(f, (e, d) => {
        if (e) {
            res.writeHead(404);
            res.end('404');
        } else {
            res.writeHead(200, { 'Content-Type': mime[path.extname(f)] || 'application/octet-stream' });
            res.end(d);
        }
    });
}).listen(8080, () => console.log('✓ http://localhost:8080'));
