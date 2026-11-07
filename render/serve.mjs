// Kevyt staattinen palvelin projektin juuresta (esikatselu ja renderöinti).
//   node render/serve.mjs [build/demo]   -> tulostaa esikatselun osoitteen

import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.f32': 'application/octet-stream',
  '.wav': 'audio/wav',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

async function handle(req, res) {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.resolve(ROOT, '.' + (rel.endsWith('/') ? rel + 'index.html' : rel));
  if (!file.startsWith(ROOT + path.sep)) return res.writeHead(403).end();
  const info = await stat(file).catch(() => null);
  if (!info || !info.isFile()) return res.writeHead(404).end();
  const headers = {
    'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
    'Cache-Control': 'no-store',
    'Accept-Ranges': 'bytes',
  };
  // Range-tuki, jotta äänen kelaus toimii esikatselussa.
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  if (m) {
    const start = m[1] ? Number(m[1]) : 0;
    const end = m[2] ? Math.min(Number(m[2]), info.size - 1) : info.size - 1;
    res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${info.size}`, 'Content-Length': end - start + 1 });
    return createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { ...headers, 'Content-Length': info.size });
  res.end(await readFile(file));
}

export function startServer(port = 0) {
  const server = http.createServer((req, res) => handle(req, res).catch(() => res.writeHead(500).end()));
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => resolve({
      url: `http://127.0.0.1:${server.address().port}`,
      close: () => server.close(),
    }));
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const data = process.argv[2] || 'build/demo';
  const { url } = await startServer(Number(process.env.PORT) || 5173);
  console.log(`Esikatselu: ${url}/visual/?data=${data}&mode=preview  (Ctrl+C lopettaa)`);
}
