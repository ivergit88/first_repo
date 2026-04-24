const notesEl = document.querySelector('#notes');
const form = document.querySelector('#note-form');
const message = document.querySelector('#message');
const filterButtons = document.querySelectorAll('[data-filter]');
const colorMap = {
  blue: '#315bdc',
  green: '#16a36a',
  yellow: '#dfaa20',
  red: '#d82f56',
  purple: '#7c4dff',
  gray: '#778091'
};
let notes = [];
let filter = 'all';

function setMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? '#d82f56' : '#5a6477';
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers || {}) }
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: 'request failed' }));
    throw new Error(payload.error || 'request failed');
  }
  if (response.status === 204) return null;
  return response.json();
}

function visibleNotes() {
  if (filter === 'open') return notes.filter((note) => !note.done);
  if (filter === 'done') return notes.filter((note) => note.done);
  return notes;
}

function render() {
  notesEl.textContent = '';
  const list = visibleNotes();
  if (!list.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'Заметок пока нет.';
    notesEl.append(empty);
    return;
  }

  for (const note of list) {
    const article = document.createElement('article');
    article.className = `note${note.done ? ' done' : ''}`;
    article.style.setProperty('--note-color', colorMap[note.color] || colorMap.blue);

    const title = document.createElement('h3');
    title.textContent = note.title;
    const body = document.createElement('p');
    body.textContent = note.body;
    const meta = document.createElement('small');
    meta.textContent = new Date(note.createdAt).toLocaleString('ru-RU');

    const actions = document.createElement('div');
    actions.className = 'note-actions';
    const toggle = document.createElement('button');
    toggle.textContent = note.done ? 'Вернуть' : 'Готово';
    toggle.addEventListener('click', () => toggleNote(note.id));
    const remove = document.createElement('button');
    remove.textContent = 'Удалить';
    remove.addEventListener('click', () => deleteNote(note.id));
    actions.append(toggle, remove);

    article.append(title, body, meta, actions);
    notesEl.append(article);
  }
}

async function loadNotes() {
  const payload = await api('/api/notes');
  notes = payload.notes;
  render();
}

async function toggleNote(id) {
  await api(`/api/notes/${id}/toggle`, { method: 'PATCH' });
  await loadNotes();
}

async function deleteNote(id) {
  await api(`/api/notes/${id}`, { method: 'DELETE' });
  await loadNotes();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  try {
    await api('/api/notes', { method: 'POST', body: JSON.stringify(data) });
    form.reset();
    setMessage('Заметка добавлена.');
    await loadNotes();
  } catch (error) {
    setMessage(error.message, true);
  }
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle('active', item === button));
    render();
  });
});

loadNotes().catch((error) => setMessage(error.message, true));
