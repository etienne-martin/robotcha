const http = require('http');
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const port = Number(process.env.PORT) || 4173;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const normalized = path.normalize(decoded).replace(/^([/\\])+/, '');
  return path.join(root, normalized);
}

function respond(res, status, body, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': contentType });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const urlPath = req.url || '/';
  let filePath = urlPath === '/' ? '/demo/index.html' : urlPath;
  if (filePath === '/demo' || filePath === '/demo/') {
    filePath = '/demo/index.html';
  }

  const resolved = safePath(filePath);
  if (!resolved.startsWith(root)) {
    return respond(res, 403, 'Forbidden');
  }

  fs.readFile(resolved, (err, data) => {
    if (err) {
      return respond(res, 404, 'Not Found');
    }
    const ext = path.extname(resolved);
    const type = mimeTypes[ext] || 'application/octet-stream';
    respond(res, 200, data, type);
  });
});

server.listen(port, () => {
  console.log(`roboTCHA demo server running at http://localhost:${port}/demo/`);
});
