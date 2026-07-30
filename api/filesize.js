export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || !url.includes('video.twimg.com')) {
    return res.status(400).json({ error: 'Invalid video URL' });
  }

  try {
    const rangeResp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Range': 'bytes=0-0'
      }
    });

    if (!rangeResp.ok && rangeResp.status !== 206) {
      return res.status(rangeResp.status).json({ error: 'Upstream fetch failed' });
    }

    // Partial content responses expose the real total in Content-Range: bytes 0-0/12345
    const contentRange = rangeResp.headers.get('content-range');
    let size = null;
    if (contentRange) {
      const m = contentRange.match(/\/(\d+)$/);
      if (m) size = parseInt(m[1], 10);
    }
    if (!size) {
      const len = rangeResp.headers.get('content-length');
      if (len) size = parseInt(len, 10);
    }

    res.status(200).json({ size });
  } catch (e) {
    res.status(500).json({ error: 'Proxy failed' });
  }
}
