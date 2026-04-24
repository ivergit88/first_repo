import test from 'node:test';
import assert from 'node:assert/strict';
import { createNote, deleteNote, normalizeNote, toggleNote } from '../src/notes.js';

test('normalizeNote trims and validates note payload', () => {
  const note = normalizeNote({ title: '  title  ', body: '  body  ', color: 'green' });
  assert.deepEqual(note, { title: 'title', body: 'body', color: 'green' });
});

test('normalizeNote rejects empty title', () => {
  assert.throws(() => normalizeNote({ title: ' ', body: 'body' }), /title is required/);
});

test('createNote adds note to the beginning', () => {
  const date = new Date('2026-04-24T12:00:00.000Z');
  const notes = createNote([{ id: 'old' }], { title: 'A', body: 'B', color: 'red' }, date);
  assert.equal(notes.length, 2);
  assert.equal(notes[0].title, 'A');
  assert.equal(notes[0].done, false);
  assert.equal(notes[0].createdAt, date.toISOString());
});

test('toggleNote changes status and deleteNote removes item', () => {
  const id = '00000000-0000-4000-8000-000000000000';
  const notes = [{ id, title: 'A', body: 'B', done: false }];
  const toggled = toggleNote(notes, id, new Date('2026-04-24T12:00:00.000Z'));
  assert.equal(toggled[0].done, true);
  assert.deepEqual(deleteNote(toggled, id), []);
});
