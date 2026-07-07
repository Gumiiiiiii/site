const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');

const app = express();
app.use(cors()); // Autorise ton site Vercel à contacter ce serveur

app.get('/api/get-video', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Missing URL' });

    try {
        const output = await youtubedl(url, {
            dumpJson: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: ['referer:youtube.com', 'user-agent:Mozilla/5.0']
        });
        
        const format = output.formats?.find(f => f.ext === 'mp4' && f.acodec !== 'none') || output;
        res.json({ directLink: format.url, thumbnailLink: output.thumbnail });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Serveur prêt sur le port ${PORT}`));
