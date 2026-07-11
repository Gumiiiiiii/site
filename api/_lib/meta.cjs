// Shared logic for the share-preview backend, used by both the Vercel
// function (api/get-meta.js) and the local dev server (dev-server.js).
// CJS so both the ESM function and the CJS server can load it.
const dns = require('dns').promises;
const net = require('net');

// Origins allowed to call the API from a browser.
const ALLOWED_ORIGINS = new Set([
    'https://gumi.ch',
    'https://www.gumi.ch',
    'http://localhost:4173',
    'http://127.0.0.1:4173'
]);

// Fixed-window rate limit, per process. On serverless this only covers a warm
// instance, but it still stops a single client hammering the endpoint.
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX_REQUESTS = 20;
const rateHits = new Map();

function isRateLimited(ip) {
    const now = Date.now();
    const key = String(ip || 'unknown');
    const entry = rateHits.get(key);

    if (!entry || now - entry.start > RATE_WINDOW_MS) {
        if (rateHits.size > 1000) {
            for (const [k, v] of rateHits) {
                if (now - v.start > RATE_WINDOW_MS) rateHits.delete(k);
            }
        }
        rateHits.set(key, { start: now, count: 1 });
        return false;
    }

    entry.count += 1;
    return entry.count > RATE_MAX_REQUESTS;
}

const MAX_REDIRECTS = 5;
const FETCH_TIMEOUT_MS = 8000;
const MAX_BODY_BYTES = 512 * 1024;
const USER_AGENT = 'Mozilla/5.0 (compatible; GumiLinkPreview/1.0; +https://gumi.ch/tools/share-preview)';

function httpError(statusCode, publicMessage) {
    const err = new Error(publicMessage);
    err.statusCode = statusCode;
    err.publicMessage = publicMessage;
    return err;
}

// The endpoint fetches arbitrary user-supplied URLs, so every hop must be
// checked against internal/private address space (SSRF).
function isPrivateIPv4(ip) {
    const parts = ip.split('.').map(Number);
    const [a, b] = parts;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a >= 224) return true;
    return false;
}

function isPrivateAddress(ip) {
    if (net.isIPv4(ip)) return isPrivateIPv4(ip);
    const lower = ip.toLowerCase();
    if (lower === '::' || lower === '::1') return true;
    if (lower.startsWith('::ffff:')) {
        const mapped = lower.slice(7);
        return net.isIPv4(mapped) ? isPrivateIPv4(mapped) : true;
    }
    if (/^f[cd]/.test(lower)) return true; // fc00::/7 unique local
    if (/^fe[89ab]/.test(lower)) return true; // fe80::/10 link local
    return false;
}

async function assertPublicHost(hostname) {
    if (net.isIP(hostname)) {
        if (isPrivateAddress(hostname)) throw httpError(400, 'URL points to a private address');
        return;
    }
    let records;
    try {
        records = await dns.lookup(hostname, { all: true });
    } catch (err) {
        throw httpError(400, 'Host could not be resolved');
    }
    if (!records.length || records.some((r) => isPrivateAddress(r.address))) {
        throw httpError(400, 'URL points to a private address');
    }
}

function parseTargetUrl(raw) {
    let parsed;
    try {
        parsed = new URL(String(raw));
    } catch (err) {
        throw httpError(400, 'Invalid URL');
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        throw httpError(400, 'Only http(s) URLs are supported');
    }
    return parsed;
}

// Reads the response body up to MAX_BODY_BYTES; meta tags live in <head>,
// so a capped read is enough even for huge pages.
async function readCapped(response) {
    const reader = response.body.getReader();
    const chunks = [];
    let total = 0;
    while (total < MAX_BODY_BYTES) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        total += value.length;
    }
    reader.cancel().catch(() => {});
    return Buffer.concat(chunks).toString('utf8');
}

// Follows redirects manually so each hop gets the private-address check.
async function fetchHtml(startUrl) {
    let current = startUrl;
    for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
        await assertPublicHost(current.hostname);

        let response;
        try {
            response = await fetch(current.href, {
                redirect: 'manual',
                signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
                headers: {
                    'User-Agent': USER_AGENT,
                    Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5',
                    'Accept-Language': 'fr,en;q=0.8'
                }
            });
        } catch (err) {
            throw httpError(502, 'The page could not be fetched');
        }

        if (response.status >= 300 && response.status < 400) {
            const location = response.headers.get('location');
            if (!location) throw httpError(502, 'Broken redirect on the target page');
            try {
                current = new URL(location, current);
            } catch (err) {
                throw httpError(502, 'Broken redirect on the target page');
            }
            if (current.protocol !== 'https:' && current.protocol !== 'http:') {
                throw httpError(400, 'Only http(s) URLs are supported');
            }
            continue;
        }

        if (!response.ok) {
            throw httpError(502, 'The page answered with HTTP ' + response.status);
        }

        const contentType = String(response.headers.get('content-type') || '');
        if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
            throw httpError(415, 'The URL does not point to an HTML page');
        }

        return { html: await readCapped(response), finalUrl: current };
    }
    throw httpError(502, 'Too many redirects');
}

const NAMED_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decodeEntities(text) {
    return String(text)
        .replace(/&#x([0-9a-f]+);/gi, (m, hex) => String.fromCodePoint(parseInt(hex, 16)))
        .replace(/&#(\d+);/g, (m, dec) => String.fromCodePoint(parseInt(dec, 10)))
        .replace(/&([a-z]+);/gi, (m, name) => NAMED_ENTITIES[name.toLowerCase()] || m);
}

function attrValue(tag, name) {
    const match = tag.match(new RegExp(name + '\\s*=\\s*("([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i'));
    if (!match) return null;
    return decodeEntities(match[2] ?? match[3] ?? match[4] ?? '').trim();
}

function resolveMaybe(href, base) {
    if (!href) return null;
    try {
        return new URL(href, base).href;
    } catch (err) {
        return null;
    }
}

function parseMeta(html, finalUrl) {
    const meta = {};
    for (const tag of html.match(/<meta\s[^>]*>/gi) || []) {
        const key = (attrValue(tag, 'property') || attrValue(tag, 'name') || '').toLowerCase();
        const content = attrValue(tag, 'content');
        // First occurrence wins, matching how crawlers behave.
        if (key && content && !(key in meta)) meta[key] = content;
    }

    let favicon = null;
    for (const tag of html.match(/<link\s[^>]*>/gi) || []) {
        const rel = (attrValue(tag, 'rel') || '').toLowerCase();
        if (rel.split(/\s+/).includes('icon') || rel === 'shortcut icon' || rel === 'apple-touch-icon') {
            favicon = resolveMaybe(attrValue(tag, 'href'), finalUrl);
            if (favicon) break;
        }
    }

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

    return {
        finalUrl: finalUrl.href,
        domain: finalUrl.hostname.replace(/^www\./, ''),
        title: titleMatch ? decodeEntities(titleMatch[1]).replace(/\s+/g, ' ').trim() : null,
        description: meta.description || null,
        favicon: favicon || resolveMaybe('/favicon.ico', finalUrl),
        og: {
            title: meta['og:title'] || null,
            description: meta['og:description'] || null,
            image: resolveMaybe(meta['og:image'] || meta['og:image:url'], finalUrl),
            imageAlt: meta['og:image:alt'] || null,
            url: meta['og:url'] || null,
            siteName: meta['og:site_name'] || null,
            type: meta['og:type'] || null
        },
        twitter: {
            card: meta['twitter:card'] || null,
            title: meta['twitter:title'] || null,
            description: meta['twitter:description'] || null,
            image: resolveMaybe(meta['twitter:image'] || meta['twitter:image:src'], finalUrl)
        }
    };
}

// Resolves the parsed social metadata for a user-supplied URL.
async function fetchPageMeta(rawUrl) {
    if (!rawUrl) throw httpError(400, 'Missing URL');
    const target = parseTargetUrl(rawUrl);
    const { html, finalUrl } = await fetchHtml(target);
    return parseMeta(html, finalUrl);
}

module.exports = { ALLOWED_ORIGINS, isRateLimited, fetchPageMeta };
