// /api/get-video.js
import YTDlpWrap from 'yt-dlp-wrap';
import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
  // Enable CORS so your frontend can talk to it
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  try {
    // Initialize yt-dlp (Vercel environments allow executing binary steps dynamically)
    const ytDlpWrap = new YTDlpWrap();
    
    // Extract the raw direct streaming URLs
    const metadata = await ytDlpWrap.getVideoInfo(url);
    
    // Grab the best quality direct video link available
    const directLink = metadata.url || (metadata.formats && metadata.formats.pop().url);

    if (!directLink) {
      return res.status(404).json({ error: 'Could not extract direct video link' });
    }

    // Return only the text link to keep bandwidth at zero
    return res.status(200).json({ directLink });
  } catch (error) {
    return res.status(500).json({ error: 'Scraping failed: ' + error.message });
  }
}
