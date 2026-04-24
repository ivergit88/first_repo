import crypto from 'node:crypto';

export const COLORS = new Set(['blue', 'green', 'yellow', 'red', 'purple', 'gray']);

function cleanText(value, field, maxLength) {
  if (typeof value !== 'string') {
    throw Object.assign(new Error(`${field} must be a string`), { statusCode: 400 });
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw Object.assign(new Error(`${field} is required`), { statusCode: 400 });
  }
  if (trimmed.length > maxLength) {
    throw Object.assign(new Error(`${field} must be at most ${maxLength} characters`), { statusCode: 400 });
  }
  return trimmed;
}

export function normalizeNote(input) {
  const title = cleanText(input.title, 'title', 80);
  const body = cleanText(input.body, 'body', 1000);
  const color = typeof input.color === 'string' && COLORS.has(input.color) ? input.color : 'blue';
  return { title, body, color };
}

export function createNote(notes, input, now = new Date()) {
  const normalized = normalizeNote(input);
  const note = {
    id: crypto.randomUUID(),
    title: normalized.title,
    body: normalized.body,
    color: normalized.color,
    done: false,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
  return [note, ...notes];
}

export function toggleNote(notes, id, now = new Date()) {
  let found = false;
  const next = notes.map((note) => {
    if (note.id !== id) return note;
    found = true;
    return { ...note, done: !note.done, updatedAt: now.toISOString() };
  });
  if (!found) {
    throw Object.assign(new Error('note not found'), { statusCode: 404 });
  }
  return next;
}

export function deleteNote(notes, id) {
  const next = notes.filter((note) => note.id !== id);
  if (next.length === notes.length) {
    throw Object.assign(new Error('note not found'), { statusCode: 404 });
  }
  return next;
}
