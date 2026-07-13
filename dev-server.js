// Minimal local dev server mimicking the Vercel production config:
// cleanUrls (extensionless .html) + the /en/ language prefix rewrite.
// Usage: node dev-server.js  →  http://localhost:4173
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 4173;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.woff2': 'font/woff2',
    '.webmanifest': 'application/manifest+json',
    '.xml': 'application/xml; charset=utf-8'
};

// Resolves a URL path the way the static handler below does (directory
// index + cleanUrls) and reports whether a real file backs it.
function resolvesToFile(urlPath) {
    if (urlPath.endsWith('/')) urlPath += 'index.html';
    let filePath = path.normalize(path.join(ROOT, urlPath));
    if (!filePath.startsWith(ROOT)) return false;
    if (!path.extname(filePath) && fs.existsSync(filePath + '.html')) {
        filePath += '.html';
    } else if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
    }
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
}

http.createServer((req, res) => {
    let urlPath;
    try {
        urlPath = decodeURIComponent(req.url.split('?')[0]);
    } catch (err) {
        res.writeHead(400);
        return res.end('Bad request');
    }

    // /en prefix rewrite, mimicking Vercel: real files win (the pre-rendered
    // pages in en/), the rewrite only kicks in as a fallback (shared assets).
    if ((urlPath === '/en' || urlPath.startsWith('/en/')) && !resolvesToFile(urlPath)) {
        urlPath = urlPath.slice(3) || '/';
    }

    // Local stand-in for the Vercel function behind the share-preview tool.
    if (urlPath === '/api/get-meta') {
        const meta = require('./api/_lib/meta.cjs');
        const query = new URL(req.url, 'http://localhost').searchParams;
        return meta.fetchPageMeta(query.get('url'))
            .then((data) => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
            })
            .catch((err) => {
                res.writeHead(err.statusCode || 500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.publicMessage || 'Metadata extraction failed' }));
            });
    }

    if (urlPath.endsWith('/')) urlPath += 'index.html';

    let filePath = path.normalize(path.join(ROOT, urlPath));
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        return res.end('Forbidden');
    }

    // cleanUrls: extensionless paths resolve to .html files, which win over
    // a same-named directory (Vercel behavior: /experiments serves
    // experiments.html, /en serves en/index.html).
    if (!path.extname(filePath) && fs.existsSync(filePath + '.html')) {
        filePath += '.html';
    } else if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            // Same behavior as Vercel: serve the custom 404 page.
            return fs.readFile(path.join(ROOT, '404.html'), (err404, page) => {
                res.writeHead(404, { 'Content-Type': err404 ? 'text/plain; charset=utf-8' : 'text/html; charset=utf-8' });
                res.end(err404 ? '404 - ' + urlPath : page);
            });
        }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
        res.end(data);
    });
}).listen(PORT, () => {
    console.log('Dev server: http://localhost:' + PORT);
});
