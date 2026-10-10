#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const EXTS = ['.tsx', '.jsx'];
const MAX = 3;
let errors = 0;

function walk(dir) {
  for (const e of readdirSync(dir)) {
    if (e.startsWith('.') || ['node_modules', '.next', 'dist', 'build', '.vercel'].includes(e))
      continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (EXTS.includes(p.slice(p.lastIndexOf('.')))) check(p);
  }
}

function tokens(value) {
  return value
    .replace(/\$\{[^}]*\}/g, ' ')
    .replace(/[\r\n]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

// Cost of a `${...}` expression: the widest mutually-exclusive string literal
// (each ternary branch is one alternative), 0 when no literal is present.
function interpolationCost(expr) {
  const literals = expr.match(/'[^']*'|"[^"]*"/g);
  if (!literals) return 0;
  return Math.max(...literals.map((l) => tokens(l.slice(1, -1)).length));
}

function check(file) {
  const src = readFileSync(file, 'utf8');
  const re = /className\s*=\s*(?:\{`([\s\S]*?)`\}|"([^"]*)"|'([^']*)')/g;
  let m;
  while ((m = re.exec(src))) {
    if (m[1] !== undefined) {
      const body = m[1];
      const base = tokens(body.replace(/\$\{[\s\S]*?\}/g, ' '));
      let cost = 0;
      for (const expr of body.match(/\$\{[\s\S]*?\}/g) ?? []) {
        cost += interpolationCost(expr);
      }
      if (base.length + cost > MAX) {
        console.error(
          `ERROR: class count > ${MAX} in ${file}: ${base.length + cost} -> ${body.replace(/\s+/g, ' ').trim()}`
        );
        errors++;
      }
    } else {
      const raw = m[2] ?? m[3] ?? '';
      const list = raw.split(/\s+/).filter(Boolean);
      if (list.length > MAX) {
        console.error(
          `ERROR: class count > ${MAX} in ${file}: ${list.length} -> ${list.join(' ')}`
        );
        errors++;
      }
    }
  }
}

walk(join(ROOT, 'src'));
if (errors > 0) process.exit(1);
console.log('class-count: OK');
