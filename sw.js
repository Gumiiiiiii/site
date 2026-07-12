// Service worker: makes the local-first tools genuinely work offline.
// Strategy: precache the light core (pages, styles, scripts, fonts), then
// cache-first for immutable assets (fonts, vendored libs) and
// stale-while-revalidate for the rest. Navigations stay network-first so a
// deploy is picked up on the next visit; the cache is the offline fallback.
// One cache for precache + runtime, so a network refresh overwrites the
// precached copy instead of being shadowed by it.
const VERSION = 'gumi-sw-v2';
const CACHE_NAME = VERSION;

const CORE_ASSETS = [
    '/',
    '/outils',
    '/experiments',
    '/404.html',
    '/tools/file-converter',
    '/tools/qrcode',
    '/tools/text-modifier',
    '/tools/contrast-checker',
    '/tools/placeholder-text',
    '/tools/password-generator',
    '/tools/video-compressor',
    '/tools/media-downloader',
    '/tools/share-preview',
    '/tools/social-formats',
    '/tools/palette',
    '/styles/shared.css',
    '/styles/tools-suite.css',
    '/styles/article.css',
    '/scripts/i18n.js',
    '/scripts/navbar.js',
    '/scripts/page-effects.js',
    '/scripts/tools-common.js',
    '/scripts/filters.js',
    '/scripts/tool-file-converter.js',
    '/scripts/tool-qrcode.js',
    '/scripts/tool-text-modifier.js',
    '/scripts/tool-contrast-checker.js',
    '/scripts/tool-placeholder-text.js',
    '/scripts/tool-password-generator.js',
    '/scripts/tool-video-compressor.js',
    '/scripts/tool-media-downloader.js',
    '/scripts/tool-share-preview.js',
    '/scripts/tool-social-formats.js',
    '/scripts/tool-palette.js',
    '/scripts/vendor/lenis.min.js',
    '/scripts/vendor/qr-code-styling.js',
    '/fonts/urbanist-latin.woff2',
    '/fonts/urbanist-latin-ext.woff2',
    '/media/cream-paper.png',
    '/media/favicon-32.png',
    '/media/Gumi-small.png',
    '/site.webmanifest'
];

// Long-lived, fingerprint-free but effectively immutable paths (they also
// carry max-age=31536000 headers on Vercel).
const CACHE_FIRST = /^\/(fonts|scripts\/vendor)\//;

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(CORE_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// Mirror the vercel.json /en rewrite so both language URLs hit one cache entry.
function cacheKeyFor(url) {
    const parsed = new URL(url);
    if (parsed.pathname === '/en' || parsed.pathname.startsWith('/en/')) {
        parsed.pathname = parsed.pathname.slice(3) || '/';
    }
    parsed.search = '';
    return parsed.href;
}

async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(cacheKeyFor(request.url), response.clone());
        }
        return response;
    } catch (err) {
        const cached = await caches.match(cacheKeyFor(request.url));
        if (cached) return cached;
        const notFound = await caches.match('/404.html');
        if (notFound) return new Response(await notFound.text(), {
            status: 503,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
        throw err;
    }
}

async function cacheFirst(request) {
    const cached = await caches.match(request.url);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request.url, response.clone());
    }
    return response;
}

async function staleWhileRevalidate(request) {
    const cached = await caches.match(request.url);
    const refresh = fetch(request).then((response) => {
        if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request.url, response.clone()));
        }
        return response;
    }).catch(() => cached);
    return cached || refresh;
}

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_vercel/')) return;

    if (request.mode === 'navigate') {
        event.respondWith(networkFirst(request));
        return;
    }

    if (CACHE_FIRST.test(url.pathname)) {
        event.respondWith(cacheFirst(request));
        return;
    }

    event.respondWith(staleWhileRevalidate(request));
});
