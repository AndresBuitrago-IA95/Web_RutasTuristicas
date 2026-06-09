/**
 * Servidor HTTP simple para servir el frontend AngularJS
 * Puerto: 3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Default to index.html for root path
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if(error.code == 'ENOENT') {
        // File not found, serve index.html (for SPA routing)
        fs.readFile('./index.html', (error, content) => {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end('Server Error: ' + error.code);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log('================================================');
  console.log('  SERVIDOR FRONTEND - RUTAS TURÍSTICAS');
  console.log('================================================');
  console.log('');
  console.log(`  🌐 Frontend: http://localhost:${PORT}`);
  console.log(`  🔗 Backend:  http://localhost:8080/api`);
  console.log('');
  console.log('  Presiona Ctrl+C para detener el servidor');
  console.log('');
  console.log('================================================');
});
