/* Tiny static file server for the Playwright browser test runner.
 * Serves the repository root (one level up from this file's parent dir).
 * Zero dependencies — deliberately small so npm install stays lean.
 */

'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const PORT = Number.parseInt(process.env.PORT || '9877', 10);

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ts': 'application/javascript; charset=utf-8',
};

function send(res, status, body, headers) {
  res.writeHead(status, headers || {});
  res.end(body);
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const resolved = path.normalize(path.join(ROOT, urlPath));

  // Path traversal guard: the resolved absolute path must stay inside ROOT.
  if (!resolved.startsWith(ROOT + path.sep) && resolved !== ROOT) {
    return send(res, 403, 'forbidden');
  }

  fs.stat(resolved, (err, stat) => {
    if (err || !stat.isFile()) return send(res, 404, 'not found: ' + urlPath);
    const ext = path.extname(resolved).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';
    fs.readFile(resolved, (readErr, data) => {
      if (readErr) return send(res, 500, 'read error');
      send(res, 200, data, {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
      });
    });
  });
});

server.listen(PORT, '127.0.0.1', () => {
  // eslint-disable-next-line no-console
  console.log(`test server listening on http://127.0.0.1:${PORT}`);
});

// Clean shutdown on Playwright's SIGTERM.
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => server.close(() => process.exit(0)));
}
