const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');

const app = express();
app.use(cors()); // Autorise ton site Vercel à contacter ce serveur

app.get('/api/get-video', async (req, res) => {
    const { url, format = 'video_audio', thumb = 'false' } = req.query;
    if (!url) return res.status(400).json({ error: 'Missing URL' });

    try {
        const output = await youtubedl(url, {
            dumpJson: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: ['referer:youtube.com', 'user-agent:Mozilla/5.0']
        });

        const formats = output.formats || [];
        let selected = null;

        if (format === 'audio_only') {
            selected =
                formats.find((f) => f.acodec !== 'none' && f.vcodec === 'none' && ['m4a', 'mp3', 'webm'].includes(f.ext)) ||
                formats.find((f) => f.acodec !== 'none' && f.vcodec === 'none');
        } else if (format === 'video_only') {
            selected =
                formats.find((f) => f.vcodec !== 'none' && f.acodec === 'none' && f.ext === 'mp4') ||
                formats.find((f) => f.vcodec !== 'none' && f.acodec === 'none');
        } else {
            selected =
                formats.find((f) => f.ext === 'mp4' && f.acodec !== 'none' && f.vcodec !== 'none') ||
                formats.find((f) => f.acodec !== 'none' && f.vcodec !== 'none');
        }

        const directLink = selected?.url || output.url;
        const withThumb = String(thumb).toLowerCase() === 'true';

        res.json({
            directLink,
            thumbnailLink: withThumb ? output.thumbnail || null : null
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Serveur prêt sur le port ${PORT}`));
