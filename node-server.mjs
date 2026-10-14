import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {createServer} from 'node:http';
import {extname, join, normalize} from 'node:path';
import {Readable} from 'node:stream';
import {fileURLToPath} from 'node:url';

// Serves the same fetch handler that runs on Oxygen (dist/server/index.js) from plain Node.
const {default: worker} = await import('./dist/server/index.js');

const CLIENT_DIR = fileURLToPath(new URL('./dist/client/', import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

async function serveStatic(req, res, pathname) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return false;
  if (pathname.includes('/.')) return false;
  const file = normalize(join(CLIENT_DIR, pathname));
  if (!file.startsWith(CLIENT_DIR)) return false;
  const info = await stat(file).catch(() => null);
  if (!info?.isFile()) return false;

  res.writeHead(200, {
    'content-type': MIME_TYPES[extname(file)] ?? 'application/octet-stream',
    'content-length': info.size,
    'cache-control': pathname.startsWith('/assets/')
      ? 'public, max-age=31536000, immutable'
      : 'public, max-age=3600',
  });
  if (req.method === 'HEAD') res.end();
  else createReadStream(file).pipe(res);
  return true;
}

function toRequest(req) {
  // Behind the load balancer TLS ends there; the original scheme matters for customer login redirects.
  const protocol =
    req.headers['x-forwarded-proto']?.split(',')[0].trim() || 'http';
  const url = new URL(req.url, `${protocol}://${req.headers.host}`);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    for (const item of [value].flat())
      if (item !== undefined) headers.append(key, item);
  }
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  return new Request(url, {
    method: req.method,
    headers,
    body: hasBody ? Readable.toWeb(req) : undefined,
    duplex: hasBody ? 'half' : undefined,
  });
}

function sendResponse(res, response) {
  const headers = {};
  response.headers.forEach((value, key) => {
    if (key !== 'set-cookie') headers[key] = value;
  });
  const cookies = response.headers.getSetCookie();
  if (cookies.length) headers['set-cookie'] = cookies;
  res.writeHead(response.status, headers);
  if (response.body) Readable.fromWeb(response.body).pipe(res);
  else res.end();
}

const server = createServer(async (req, res) => {
  try {
    const {pathname} = new URL(req.url, 'http://localhost');
    if (pathname === '/health') {
      res.writeHead(200, {'content-type': 'text/plain'});
      res.end('ok');
      return;
    }
    if (await serveStatic(req, res, decodeURIComponent(pathname))) return;

    const response = await worker.fetch(toRequest(req), process.env, {
      waitUntil: (promise) => promise.catch(console.error),
      passThroughOnException() {},
    });
    sendResponse(res, response);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.writeHead(500, {'content-type': 'text/plain'});
    res.end('An unexpected error occurred');
  }
});

server.listen(PORT, () => process.stdout.write(`Listening on port ${PORT}\n`));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
