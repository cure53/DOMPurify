/* jshint globalstrict:true, node:true */
'use strict';

var http = require('http'),
  url = require('url'),
  path = require('path'),
  fs = require('fs'),
  domain = require('domain').create();

var mimeTypes = {
  html: 'text/html',
  json: 'application/json',
  js: 'text/javascript',
  css: 'text/css',
};

// *VERY* minimal static file server
http
  .createServer(function (req, res) {
    var uri = url.parse(req.url).pathname,
      filename;

    if (uri === '/test/') {
      uri = '/test/index.html';
    }
    filename = path.join(process.cwd(), uri);

    domain.on('error', function () {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found\n');
    });
    domain.run(function () {
      var mimeType =
        mimeTypes[path.extname(filename).split('.')[1]] || 'text/plain';
      res.writeHead(200, { 'Content-Type': mimeType });
      fs.createReadStream(filename).pipe(res);
    });
  })
  .listen(8000);
console.log(
  'Test server is running on \x1B[1m\x1B[32mhttp://localhost:8000/test/\x1B[39m, press Ctrl-C to stop.'
);
