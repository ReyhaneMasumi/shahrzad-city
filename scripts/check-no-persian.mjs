import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');

const IGNORED = new Set(['node_modules', '.next', '.git', 'visuals', 'docs', 'public']);
const ALLOWED = new Set(['src/shared/i18n/fa.ts', 'tests/fixtures']);
const SCAN_DIRS = ['src', 'scripts', 'tests'];
const SCAN_FILES = [
  'eslint.config.mjs',
  'next.config.ts',
  'prettier.config.mjs',
  'tsconfig.json',
  'vitest.config.ts',
];
const PERSIAN = /[\u0600-\u06FF]/;

function walk(dir) {
  if (!existsSync(dir)) return [];
  let out = [];
  for (const entry of readdirSync(dir)) {
    if (IGNORED.has(entry)) continue;
    const full = join(dir, entry);
    const rel = relative(ROOT, full);
    if (statSync(full).isDirectory()) out = out.concat(walk(full));
    else out.push(rel);
  }
  return out;
}

function isAllowed(rel) {
  for (const allowed of ALLOWED) {
    if (rel === allowed || rel.startsWith(`${allowed}/`)) return true;
  }
  return false;
}

const files = SCAN_DIRS.flatMap((d) => walk(join(ROOT, d)))
  .filter((rel) => !isAllowed(rel))
  .concat(SCAN_FILES);
const offenders = [];

for (const rel of files) {
  if (
    IGNORED.has(rel.split('/')[0]) ||
    (!rel.endsWith('.ts') &&
      !rel.endsWith('.tsx') &&
      !rel.endsWith('.mjs') &&
      !rel.endsWith('.mts'))
  )
    continue;
  const content = readFileSync(join(ROOT, rel), 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (PERSIAN.test(line)) offenders.push(`${rel}:${i + 1}`);
  });
}

if (offenders.length > 0) {
  console.error('Persian characters outside allowed locations (fa.ts, test fixtures):');
  for (const o of offenders) console.error(`  ${o}`);
  process.exit(1);
}
console.log('check-no-persian: ok');
