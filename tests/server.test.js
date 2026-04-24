import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../src/server.js';

async function withServer(fn) {
  const dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'safe-notes-'));
  const previous = process.env.DATA_DIR;
  process.env.DATA_DIR = dataDir;
  const server = createApp();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  try {
    await fn(baseUrl);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    if (previous === undefined) delete process.env.DATA_DIR;
    else process.env.DATA_DIR = previous;
    await fs.rm(dataDir, { recursive: true, force: true });
  }
}

test('health endpoint returns ok and security headers', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-frame-options'), 'DENY');
    assert.deepEqual(await response.json(), { status: 'ok' });
  });
});

test('notes API creates and lists notes', async () => {
  await withServer(async (baseUrl) => {
    const create = await fetch(`${baseUrl}/api/notes`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Test', body: 'Functional test', color: 'purple' })
    });
    assert.equal(create.status, 201);
    const created = await create.json();
    assert.equal(created.note.title, 'Test');

    const list = await fetch(`${baseUrl}/api/notes`);
    const payload = await list.json();
    assert.equal(payload.notes.length, 1);
    assert.equal(payload.notes[0].color, 'purple');
  });
});

test('notes API rejects invalid payload', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/notes`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: '', body: 'x' })
    });
    assert.equal(response.status, 400);
    assert.match((await response.json()).error, /title is required/);
  });
});
