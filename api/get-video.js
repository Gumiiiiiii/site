import youtubedl from 'youtube-dl-exec';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const output = await youtubedl(url, {
      dumpJson: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: ['referer:youtube.com', 'user-agent:Mozilla/5.0']
    });

    // Cherche le format mp4 ou retourne l'url par défaut
    const format = output.formats?.find(f => f.ext === 'mp4' && f.acodec !== 'none') || output;
    
    return res.status(200).json({ directLink: format.url, thumbnailLink: output.thumbnail });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
