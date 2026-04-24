import fs from 'node:fs/promises';

const required = ['public/index.html', 'public/app.js', 'public/styles.css', 'src/server.js'];
for (const file of required) {
  await fs.access(file);
}
const html = await fs.readFile('public/index.html', 'utf8');
if (!html.includes('<script src="/app.js" type="module"></script>')) {
  throw new Error('frontend entrypoint is missing');
}
console.log('build check ok');
