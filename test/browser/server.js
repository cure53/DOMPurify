/* Tiny static file server for the Playwright browser test runner.
 * Serves the repository root (one level up from this file's parent dir).
 * Zero dependencies — deliberately small so npm install stays lean.
 *
 * Binds to 127.0.0.1 only; used solely during `npm test`.
 * Path-injection and response-injection guards are present below; see
 * inline comments.
 */

'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const PORT = Number.parseInt(process.env.PORT || '9877', 10);

const MIME = Object.freeze({
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ts': 'application/javascript; charset=utf-8',
});

/* Error responses never echo any part of the request. They use text/plain so
 * even if a header or body somehow contained markup it would not be rendered
 * as HTML by the receiving browser. */
function sendError(res, status) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(String(status));
}

/* True iff `child` is the same as, or resides inside, `parent`.
 * Uses path.relative semantics which CodeQL recognizes as a path-containment
 * sanitizer for js/path-injection. */
function isInside(child, parent) {
  if (child === parent) return true;
  const rel = path.relative(parent, child);
  return rel.length > 0 && !rel.startsWith('..') && !path.isAbsolute(rel);
}

const server = http.createServer((req, res) => {
  /* Parse the request URL defensively. A malformed URL yields 400 before any
   * path math runs. */
  let urlPath;
  try {
    urlPath = new URL(req.url || '/', 'http://127.0.0.1').pathname;
  } catch (_) {
    return sendError(res, 400);
  }

  /* Resolve the requested path against ROOT. path.resolve produces an
   * absolute path with `..` segments collapsed, which combined with the
   * isInside check below forms a CodeQL-recognized containment pattern. */
  const resolved = path.resolve(ROOT, '.' + urlPath);

  if (!isInside(resolved, ROOT)) {
    return sendError(res, 403);
  }

  fs.stat(resolved, (err, stat) => {
    if (err || !stat.isFile()) return sendError(res, 404);

    /* MIME table lookup is bounded by a frozen allow-list; falls back to a
     * safe generic type rather than the requested extension. */
    const ext = path.extname(resolved).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';

    fs.readFile(resolved, (readErr, data) => {
      if (readErr) return sendError(res, 500);
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(data);
    });
  });
});

server.listen(PORT, '127.0.0.1', () => {
  // eslint-disable-next-line no-console
  console.log(`test server listening on http://127.0.0.1:${PORT}`);
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => server.close(() => process.exit(0)));
}