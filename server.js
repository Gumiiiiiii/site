// Standalone extraction server (Render). Shares its logic with the Vercel
// function in api/get-video.js via api/_lib/extract.cjs.
const express = require('express');
const cors = require('cors');
const { ALLOWED_ORIGINS, isAllowedMediaUrl, isRateLimited, extractMedia } = require('./api/_lib/extract.cjs');

const app = express();
app.use(cors({
    origin: Array.from(ALLOWED_ORIGINS),
    methods: ['GET']
}));

// Concurrency gate: each extraction spawns yt-dlp (and sometimes ffmpeg),
// which is memory-hungry on the 1 GB VM. Cap simultaneous jobs and give
// waiters a bounded queue; overflow returns 503 rather than OOM-killing the
// process. Tunable via env for a bigger box.
const MAX_CONCURRENT = Number(process.env.MAX_CONCURRENT || 2);
const MAX_QUEUE = Number(process.env.MAX_QUEUE || 8);
let active = 0;
const waiters = [];

function acquireSlot() {
    if (active < MAX_CONCURRENT) {
        active += 1;
        return Promise.resolve(true);
    }
    if (waiters.length >= MAX_QUEUE) {
        return Promise.resolve(false); // queue full — shed load
    }
    return new Promise((resolve) => waiters.push(resolve));
}

function releaseSlot() {
    const next = waiters.shift();
    if (next) {
        next(true); // hand the still-held slot to the next waiter
    } else {
        active -= 1;
    }
}

// Cheap liveness probe for uptime monitors and keep-warm pings.
app.get('/health', (req, res) => res.json({ ok: true, active, queued: waiters.length }));

app.get('/api/get-video', async (req, res) => {
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress;
    if (isRateLimited(ip)) {
        return res.status(429).json({ error: 'Too many requests, slow down.' });
    }

    const { url, format = 'video_audio', thumb = 'false' } = req.query;
    if (!url) return res.status(400).json({ error: 'Missing URL' });
    if (!isAllowedMediaUrl(url)) {
        return res.status(400).json({ error: 'Unsupported or invalid URL' });
    }

    const gotSlot = await acquireSlot();
    if (!gotSlot) {
        return res.status(503).json({ error: 'Server busy, please retry in a moment.' });
    }

    try {
        const result = await extractMedia(url, format, String(thumb).toLowerCase() === 'true');
        if (!result) {
            return res.status(422).json({ error: 'No downloadable format available for this URL' });
        }
        res.json(result);
    } catch (error) {
        console.error('get-video extraction failed:', error);
        res.status(500).json({ error: 'Extraction failed, please try again later.' });
    } finally {
        releaseSlot();
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Serveur prêt sur le port ${PORT}`));
