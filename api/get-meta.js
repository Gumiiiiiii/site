import shared from './_lib/meta.cjs';

const { ALLOWED_ORIGINS, clientIp, isRateLimited, fetchPageMeta } = shared;

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

  try {
    const result = await fetchPageMeta(req.query.url);
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.publicMessage });
    }
    console.error('get-meta failed:', error);
    return res.status(500).json({ error: 'Metadata extraction failed, please try again later.' });
  }
}
