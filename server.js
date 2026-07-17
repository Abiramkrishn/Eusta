const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf'
};

const server = http.createServer((req, res) => {
  // Log request
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  
  // Strip query parameters
  let safeUrl = req.url.split('?')[0];
  if (safeUrl === '/') {
    safeUrl = '/index.html';
  }
  
  let filePath = path.join(PUBLIC_DIR, safeUrl);
  
  // Prevent directory traversal attacks
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/html');
    res.end('<h1>403 Forbidden</h1><p>Access Denied</p>');
    return;
  }
  
  fs.stat(filePath, (err, stats) => {
    if (err) {
      // If file not found, try appending .html (pretty URLs)
      const altFilePath = filePath + '.html';
      fs.stat(altFilePath, (altErr, altStats) => {
        if (!altErr && altStats.isFile()) {
          serveFile(altFilePath, res);
        } else {
          serve404(res);
        }
      });
    } else if (stats.isDirectory()) {
      // If it's a directory, serve the index.html inside it
      const indexFilePath = path.join(filePath, 'index.html');
      fs.stat(indexFilePath, (indexErr, indexStats) => {
        if (!indexErr && indexStats.isFile()) {
          serveFile(indexFilePath, res);
        } else {
          serve404(res);
        }
      });
    } else if (stats.isFile()) {
      serveFile(filePath, res);
    } else {
      serve404(res);
    }
  });
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain');
      res.end(`Internal Server Error: ${err.code}`);
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      // Disable cache for active development
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.end(content);
    }
  });
}

function serve404(res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html');
  res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>404 Not Found - Eusta</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Inter', sans-serif;
          background-color: #0f0f0f;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
        }
        .container {
          text-align: center;
        }
        h1 {
          font-size: 6rem;
          margin: 0;
          background: linear-gradient(135deg, #ffffff, #B18B5E);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        p {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 0;
          margin-bottom: 2rem;
        }
        a {
          background-color: #B18B5E;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.375rem;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s;
        }
        a:hover {
          background-color: #96724b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>404</h1>
        <p>Oops! The page you are looking for does not exist.</p>
        <a href="/">Go to Home</a>
      </div>
    </body>
    </html>
  `);
}

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(` Eusta Portal is hosting on http://localhost:${PORT}`);
  console.log(` Press Ctrl+C to stop the server`);
  console.log(`==================================================\n`);
});
