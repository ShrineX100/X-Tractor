export default async function handler(req, res) {
  const { url, filename } = req.query;

  if (!url || !url.includes('video.twimg.com')) {
    return res.status(400).json({ error: 'Invalid video URL' });
  }

  try {
    const twResp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!twResp.ok) {
      return res.status(twResp.status).json({ error: 'Upstream fetch failed' });
    }

    const buffer = Buffer.from(await twResp.arrayBuffer());

    const rawName = filename || 'video.mp4';
    // Content-Disposition headers only allow ASCII in the plain filename="" part.
    // Strip non-ASCII for a safe fallback name, and additionally provide the
    // proper RFC 5987 filename*= form so browsers that support it show the
    // full original (including unicode) name.
    const asciiName = rawName.replace(/[^\x20-\x7E]/g, '').trim() || 'video.mp4';
    const encodedName = encodeURIComponent(rawName);

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${asciiName}"; filename*=UTF-8''${encodedName}`
    );
    res.setHeader('Content-Length', buffer.length);
    res.status(200).send(buffer);
  } catch (e) {
    res.status(500).json({ error: 'Proxy failed' });
  }
}
