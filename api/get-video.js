import youtubedl from 'youtube-dl-exec';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

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

    return res.status(200).json({
      directLink,
      thumbnailLink: withThumb ? output.thumbnail || null : null
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
