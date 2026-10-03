import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { planTrip } from './planner-core.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 3000);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' };

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(payload));
}

async function readJson(req) {
  let body = '';
  for await (const chunk of req) body += chunk;
  if (body.length > 100_000) throw new Error('Request body too large');
  return body ? JSON.parse(body) : {};
}

createServer(async (req, res) => {
  const rawPath = (req.url || '/').split('?')[0];
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
    return res.end();
  }
  if (rawPath === '/api/health' && req.method === 'GET') return sendJson(res, 200, { ok: true, service: 'chargepath-planner-api' });
  if (rawPath === '/api/plan' && req.method === 'POST') {
    try {
      const input = await readJson(req);
      return sendJson(res, 200, planTrip(input));
    } catch (error) {
      return sendJson(res, 400, { error: 'Invalid planning request', message: error.message });
    }
  }
  if (rawPath.startsWith('/api/')) return sendJson(res, 404, { error: 'API route not found' });

  const requestedPath = rawPath === '/manus-routes.json' ? '/public/manus-routes.json' : (rawPath === '/' ? '/index.html' : rawPath);
  const safePath = normalize(requestedPath).replace(/^\.\.(\/|\\)/, '');
  const filePath = join(root, safePath);
  try {
    const body = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': types[extname(filePath)] || 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}).listen(port, '0.0.0.0', () => console.log(`ChargePath API + frontend listening on ${port}`));
