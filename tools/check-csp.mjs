// Fails when the inline script in the built index.html no longer matches the
// hash allowed by the Content-Security-Policy in vercel.json (after editing
// the theme script, or after a formatter touched it). Run after the build.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const html = readFileSync(
  'dist/apps/admin-dashboard/browser/index.html',
  'utf8'
);
const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
const csp = config.headers
  .flatMap(h => h.headers)
  .find(h => h.key === 'Content-Security-Policy').value;

const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
  m => m[1]
);
const missing = inline
  .map(s => `'sha256-${createHash('sha256').update(s).digest('base64')}'`)
  .filter(hash => !csp.includes(hash));

if (missing.length) {
  console.error(
    `vercel.json CSP is missing ${missing.join(', ')}: update script-src.`
  );
  process.exit(1);
}
console.log(`CSP covers the ${inline.length} inline script(s) in index.html.`);
