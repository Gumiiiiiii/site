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

// Cheap liveness probe for uptime monitors and keep-warm pings.
app.get('/health', (req, res) => res.json({ ok: true }));

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

    try {
        const result = await extractMedia(url, format, String(thumb).toLowerCase() === 'true');
        if (!result) {
            return res.status(422).json({ error: 'No downloadable format available for this URL' });
        }
        res.json(result);
    } catch (error) {
        console.error('get-video extraction failed:', error);
        res.status(500).json({ error: 'Extraction failed, please try again later.' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Serveur prêt sur le port ${PORT}`));
