import fs from 'node:fs/promises';
import path from 'node:path';

const root = new URL('..', import.meta.url);
const scanRoots = ['src', 'public'];
const ignored = new Set(['.git', 'node_modules', '.data', 'coverage']);
const rules = [
  { id: 'no-eval', pattern: /\beval\s*\(/, message: 'eval is forbidden' },
  { id: 'no-inner-html', pattern: /\.innerHTML\s*=/, message: 'innerHTML assignment can create XSS' },
  { id: 'no-child-process', pattern: /node:child_process|child_process/, message: 'child_process needs threat review' },
  { id: 'no-hardcoded-secret', pattern: /(api[_-]?key|secret|password)\s*[:=]\s*['"][^'"]{8,}/i, message: 'possible hardcoded secret' }
];
const findings = [];

async function walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (['.js', '.html', '.md', '.json', '.yml', '.yaml'].includes(path.extname(full))) await scan(full);
  }
}

async function scan(file) {
  const text = await fs.readFile(file, 'utf8');
  for (const rule of rules) {
    if (rule.pattern.test(text)) findings.push(`${path.relative(root.pathname, file)}: ${rule.id}: ${rule.message}`);
  }
}

for (const dir of scanRoots) {
  await walk(path.join(root.pathname, dir));
}
if (findings.length) {
  console.error(findings.join('\n'));
  process.exit(1);
}
console.log('local semgrep-compatible checks ok');
