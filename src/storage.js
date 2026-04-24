import fs from 'node:fs/promises';
import path from 'node:path';

export function storageFile(dataDir = process.env.DATA_DIR || '.data') {
  return path.join(dataDir, 'notes.json');
}

export async function readNotes(file = storageFile()) {
  try {
    const raw = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

export async function writeNotes(notes, file = storageFile()) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, `${JSON.stringify(notes, null, 2)}\n`, { mode: 0o600 });
  await fs.rename(tmp, file);
}
