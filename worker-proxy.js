export default {
  async fetch(request) {
    const url = new URL(request.url);
    const origin = url.origin;

    const target = url.searchParams.get('url');
    if (!target) {
      return new Response('Informe a URL do stream: /?url=http://...', {
        status: 400,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    const headers = new Headers({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Referer': target,
      'Accept': '*/*',
    });

    const range = request.headers.get('Range');
    if (range) headers.set('Range', range);

    let upstream;
    try {
      upstream = await fetch(target, {
        method: request.method,
        headers,
        redirect: 'follow',
      });
    } catch (e) {
      return new Response('Erro ao buscar: ' + e.message, {
        status: 502,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (!upstream.ok) {
      return new Response('Upstream: ' + upstream.status + ' ' + upstream.statusText, {
        status: upstream.status,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    const contentType = upstream.headers.get('content-type') || '';
    const looksLikePlaylist = /\.m3u8($|\?)/.test(target);
    const isM3u8Type = contentType.includes('mpegurl');
    const isUnknownType = !contentType ||
      contentType.includes('text/plain') ||
      contentType.includes('octet-stream');
    const isPlaylist = isM3u8Type || (looksLikePlaylist && isUnknownType);

    if (isPlaylist) {
      const text = await upstream.text();
      const base = new URL(target);
      const proxied = (u) => `${origin}/?url=${encodeURIComponent(u)}`;

      const lines = text.split(/\r?\n/).map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return line;

        if (trimmed.includes('URI=')) {
          return line.replace(/URI="([^"]+)"/g, (m, u) => `URI="${proxied(new URL(u, base).href)}"`);
        }

        if (!trimmed.startsWith('#')) {
          return proxied(new URL(trimmed, base).href);
        }

        return line;
      });

      return new Response(lines.join('\n'), {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Cache-Control': 'no-store',
        },
      });
    }

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': contentType,
      },
    });
  },
};
