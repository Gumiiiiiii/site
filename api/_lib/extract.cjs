// Shared logic for the media-downloader backend, used by both the Vercel
// function (api/get-video.js) and the Render server (server.js).
// CJS so both the ESM function and the CJS server can load it.
const youtubedl = require('youtube-dl-exec');

// Origins allowed to call the API from a browser.
const ALLOWED_ORIGINS = new Set([
    'https://gumi.ch',
    'https://www.gumi.ch',
    'http://localhost:4173',
    'http://127.0.0.1:4173'
]);

// Platforms the extractor is meant to serve; anything else is rejected
// so the endpoint can't be used as a generic download proxy.
const ALLOWED_HOSTS = [
    'youtube.com', 'youtu.be',
    'instagram.com',
    'tiktok.com',
    'vimeo.com',
    'x.com', 'twitter.com',
    'facebook.com', 'fb.watch',
    'dailymotion.com',
    'soundcloud.com',
    'twitch.tv'
];

function isAllowedMediaUrl(raw) {
    let parsed;
    try {
        parsed = new URL(String(raw));
    } catch (err) {
        return false;
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    const host = parsed.hostname.toLowerCase();
    return ALLOWED_HOSTS.some((domain) => host === domain || host.endsWith('.' + domain));
}

// Fixed-window rate limit, per process. On serverless this only covers a warm
// instance, but it still stops a single client hammering the endpoint.
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX_REQUESTS = 15;
const rateHits = new Map();

function isRateLimited(ip) {
    const now = Date.now();
    const key = String(ip || 'unknown');
    const entry = rateHits.get(key);

    if (!entry || now - entry.start > RATE_WINDOW_MS) {
        // Prune stale entries so the map can't grow unbounded.
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

function pickFormat(formats, format) {
    if (format === 'audio_only') {
        return (
            formats.find((f) => f.acodec !== 'none' && f.vcodec === 'none' && ['m4a', 'mp3', 'webm'].includes(f.ext)) ||
            formats.find((f) => f.acodec !== 'none' && f.vcodec === 'none')
        );
    }
    if (format === 'video_only') {
        return (
            formats.find((f) => f.vcodec !== 'none' && f.acodec === 'none' && f.ext === 'mp4') ||
            formats.find((f) => f.vcodec !== 'none' && f.acodec === 'none')
        );
    }
    return (
        formats.find((f) => f.ext === 'mp4' && f.acodec !== 'none' && f.vcodec !== 'none') ||
        formats.find((f) => f.acodec !== 'none' && f.vcodec !== 'none')
    );
}

// Resolves { directLink, thumbnailLink, title } or null when nothing usable.
async function extractMedia(url, format, withThumb) {
    const output = await youtubedl(url, {
        dumpJson: true,
        noWarnings: true,
        preferFreeFormats: true,
        addHeader: ['referer:youtube.com', 'user-agent:Mozilla/5.0']
    });

    const formats = output.formats || [];
    const selected = pickFormat(formats, format);
    const fallbackLink = formats.find((f) => Boolean(f && f.url))?.url || output.url || null;
    const directLink = (selected && selected.url) || fallbackLink;
    if (!directLink) return null;

    // The thumbnail is always returned so the result card can show a preview;
    // the `withThumb` flag only controls whether the client also offers it as
    // a separate download. (yt-dlp already includes it in the dump, so this is
    // free.)
    return {
        directLink,
        thumbnailLink: output.thumbnail || null,
        title: output.title || null
    };
}

module.exports = { ALLOWED_ORIGINS, isAllowedMediaUrl, isRateLimited, extractMedia };
