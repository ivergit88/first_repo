import fs from 'node:fs/promises';
import path from 'node:path';

const root = new URL('..', import.meta.url);
const extensions = new Set(['.js', '.json', '.md', '.html', '.css', '.yml', '.yaml']);
const ignored = new Set(['.git', 'node_modules', '.data', 'coverage']);
const findings = [];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (extensions.has(path.extname(entry.name))) await lintFile(full);
  }
}

async function lintFile(file) {
  const text = await fs.readFile(file, 'utf8');
  const rel = path.relative(root.pathname, file);
  if (text.includes('\t')) findings.push(`${rel}: tab character is not allowed`);
  if (/[ \t]$/m.test(text)) findings.push(`${rel}: trailing whitespace`);
  if (!text.endsWith('\n')) findings.push(`${rel}: missing final newline`);
  if (rel.endsWith('.js') && text.includes('v' + 'ar ')) findings.push(`${rel}: use let/const instead of legacy declarations`);
}

await walk(root.pathname);
if (findings.length) {
  console.error(findings.join('\n'));
  process.exit(1);
}
console.log('lint ok');
