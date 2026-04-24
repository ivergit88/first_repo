import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const pkg = JSON.parse(await fs.readFile('package.json', 'utf8'));
const lock = JSON.parse(await fs.readFile('package-lock.json', 'utf8'));
const components = Object.entries(lock.packages || {})
  .filter(([name]) => name)
  .map(([name, meta]) => ({ type: 'library', name: name.replace(/^node_modules\//, ''), version: meta.version || 'unknown', purl: `pkg:npm/${name.replace(/^node_modules\//, '')}@${meta.version || 'unknown'}` }));
const serialNumber = `urn:uuid:${crypto.randomUUID()}`;
const sbom = {
  bomFormat: 'CycloneDX',
  specVersion: '1.5',
  serialNumber,
  version: 1,
  metadata: {
    timestamp: new Date().toISOString(),
    component: { type: 'application', name: pkg.name, version: pkg.version }
  },
  components
};
await fs.mkdir('docs/security', { recursive: true });
await fs.writeFile('docs/security/sbom.cdx.json', `${JSON.stringify(sbom, null, 2)}\n`);
console.log(`SBOM written with ${components.length} third-party components`);
