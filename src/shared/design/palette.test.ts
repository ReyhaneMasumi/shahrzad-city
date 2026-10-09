import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { paletteCssMirrors } from './palette';

const tokensCss = readFileSync(join(process.cwd(), 'src/styles/tokens.css'), 'utf8').toLowerCase();

describe('design palette', () => {
  it.each(paletteCssMirrors)(
    'keeps %s in sync between palette.ts and tokens.css',
    (cssVar, value) => {
      expect(tokensCss).toContain(`${cssVar}: ${value.toLowerCase()};`);
    }
  );
});
