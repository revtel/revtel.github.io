import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: { port: { type: 'string', default: '4173' } } });
const port = Number(values.port);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid port');
const root = resolve(fileURLToPath(new URL('../out/', import.meta.url)));
await stat(resolve(root, 'index.html')); // Run npm run build before previewing.
const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

// Local preview only: serve the export files, never render a Next.js response.
createServer(async (request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400).end(); return; }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end(); return;
  }
  let target = resolve(root, `.${pathname}`);
  if (!target.startsWith(`${root}${sep}`) && target !== root) {
    response.writeHead(403).end(); return;
  }
  let status = 200;
  try {
    if ((await stat(target)).isDirectory()) {
      if (!pathname.endsWith('/')) {
        response.writeHead(308, { Location: `${pathname}/${new URL(request.url, 'http://localhost').search}` }).end(); return;
      }
      target = resolve(target, 'index.html');
    }
    await stat(target);
  } catch {
    target = resolve(root, pathname.startsWith('/en/') ? 'en/404.html' : '404.html');
    status = 404;
  }
  try {
    const body = await readFile(target);
    // Local AASA MIME only; public hosting headers require independent verification.
    const contentType = pathname === '/.well-known/apple-app-site-association' && status === 200
      ? 'application/json' : mime[extname(target)] ?? 'application/octet-stream';
    response.writeHead(status, { 'Content-Type': contentType, 'Cache-Control': 'no-store' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch { response.writeHead(500).end(); }
}).listen(port, '127.0.0.1', () => console.log(`Static preview: http://127.0.0.1:${port}`));
