export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || !url.includes('video.twimg.com')) {
    return res.status(400).json({ error: 'Invalid video URL' });
  }

  try {
    const headResp = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!headResp.ok) {
      return res.status(headResp.status).json({ error: 'Upstream HEAD failed' });
    }

    const size = headResp.headers.get('content-length');
    res.status(200).json({ size: size ? parseInt(size, 10) : null });
  } catch (e) {
    res.status(500).json({ error: 'Proxy failed' });
  }
}
