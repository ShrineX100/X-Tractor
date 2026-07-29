export default async function handler(req, res) {
  const { url, filename } = req.query;
  if (!url || !url.includes('video.twimg.com')) {
    return res.status(400).json({ error: 'Invalid video URL' });
  }

  try {
    const twResp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        // no Referer/Origin sent server-to-server by default
      }
    });

    if (!twResp.ok) {
      return res.status(twResp.status).json({ error: 'Upstream fetch failed' });
    }

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${filename || 'video.mp4'}"`);

    const buffer = Buffer.from(await twResp.arrayBuffer());
    res.status(200).send(buffer);
  } catch (e) {
    res.status(500).json({ error: 'Proxy failed' });
  }
}
