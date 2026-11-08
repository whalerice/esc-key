import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const cwd = process.cwd();
const artPath = join(cwd, 'src/themes/haemu-radio/art.ts');
const src = readFileSync(artPath, 'utf8');
const rootMatch = src.match(/const root = '([^']+)'/);
if (!rootMatch) {
  console.error('MISSING root const in art.ts');
  process.exit(1);
}
const root = rootMatch[1];
const urls = [...src.matchAll(/\$\{root\}(\/[^`$]+)`/g)].map((m) => `${root}${m[1]}`);
const unique = [...new Set(urls)].filter((u) => !u.includes('/audio/'));
let fail = 0;
for (const u of unique) {
  const file = join(cwd, 'public', u.slice(1));
  if (!existsSync(file)) {
    console.error('MISSING', u);
    fail++;
  }
}
if (fail) {
  console.error(`fail ${fail}`);
  process.exit(1);
}
console.log(`ok ${unique.length} art files`);
