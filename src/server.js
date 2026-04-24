import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createNote, deleteNote, toggleNote } from './notes.js';
import { readNotes, writeNotes } from './storage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const MAX_BODY_BYTES = 16 * 1024;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8'
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store'
  });
  res.end(body);
}

function securityHeaders(res) {
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('x-frame-options', 'DENY');
  res.setHeader('referrer-policy', 'no-referrer');
  res.setHeader('permissions-policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('content-security-policy', "default-src 'self'; style-src 'self'; script-src 'self'; base-uri 'none'; frame-ancestors 'none'");
}

async function parseJsonBody(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      throw Object.assign(new Error('request body is too large'), { statusCode: 413 });
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw Object.assign(new Error('invalid JSON body'), { statusCode: 400 });
  }
}

async function serveStatic(req, res, pathname) {
  const requested = pathname === '/' ? '/index.html' : pathname;
  const normalized = path.normalize(requested).replace(/^([.][.][/\\])+/, '');
  const filePath = path.join(publicDir, normalized);
  if (!filePath.startsWith(publicDir)) {
    sendJson(res, 403, { error: 'forbidden' });
    return;
  }
  try {
    const body = await fs.readFile(filePath);
    const type = MIME_TYPES[path.extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
    res.end(body);
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'EISDIR') {
      sendJson(res, 404, { error: 'not found' });
      return;
    }
    throw error;
  }
}

export function createApp() {
  return http.createServer(async (req, res) => {
    securityHeaders(res);
    try {
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

      if (url.pathname === '/health') {
        sendJson(res, 200, { status: 'ok' });
        return;
      }

      if (url.pathname === '/api/notes' && req.method === 'GET') {
        sendJson(res, 200, { notes: await readNotes() });
        return;
      }

      if (url.pathname === '/api/notes' && req.method === 'POST') {
        const notes = await readNotes();
        const next = createNote(notes, await parseJsonBody(req));
        await writeNotes(next);
        sendJson(res, 201, { note: next[0] });
        return;
      }

      const toggleMatch = url.pathname.match(/^\/api\/notes\/([a-f0-9-]{36})\/toggle$/);
      if (toggleMatch && req.method === 'PATCH') {
        const next = toggleNote(await readNotes(), toggleMatch[1]);
        await writeNotes(next);
        sendJson(res, 200, { note: next.find((note) => note.id === toggleMatch[1]) });
        return;
      }

      const deleteMatch = url.pathname.match(/^\/api\/notes\/([a-f0-9-]{36})$/);
      if (deleteMatch && req.method === 'DELETE') {
        await writeNotes(deleteNote(await readNotes(), deleteMatch[1]));
        sendJson(res, 204, {});
        return;
      }

      if (req.method === 'GET' || req.method === 'HEAD') {
        await serveStatic(req, res, url.pathname);
        return;
      }

      sendJson(res, 405, { error: 'method not allowed' });
    } catch (error) {
      const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
      sendJson(res, statusCode, { error: statusCode === 500 ? 'internal server error' : error.message });
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT || 3000);
  createApp().listen(port, () => {
    console.log(`Safe Notes listening on http://localhost:${port}`);
  });
}
