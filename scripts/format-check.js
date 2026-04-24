import fs from 'node:fs/promises';
import path from 'node:path';

const root = new URL('..', import.meta.url);
const ignored = new Set(['.git', 'node_modules', '.data', 'coverage']);
const maxLine = 320;
const findings = [];

async function walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else await check(full);
  }
}

async function check(file) {
  const binary = ['.png', '.jpg', '.jpeg', '.gif', '.ico'].includes(path.extname(file));
  if (binary) return;
  const text = await fs.readFile(file, 'utf8');
  text.split('\n').forEach((line, index) => {
    if (line.length > maxLine) findings.push(`${path.relative(root.pathname, file)}:${index + 1} line longer than ${maxLine}`);
  });
}

await walk(root.pathname);
if (findings.length) {
  console.error(findings.join('\n'));
  process.exit(1);
}
console.log('format ok');
