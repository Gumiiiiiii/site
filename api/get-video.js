import shared from './_lib/extract.cjs';

const { ALLOWED_ORIGINS, isAllowedMediaUrl, clientIp, isRateLimited, extractMedia } = shared;

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
  }
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (isRateLimited(clientIp(req))) {
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
    return res.status(200).json(result);
  } catch (error) {
    console.error('get-video extraction failed:', error);
    return res.status(500).json({ error: 'Extraction failed, please try again later.' });
  }
}
