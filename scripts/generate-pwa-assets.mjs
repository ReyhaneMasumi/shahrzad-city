import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const SRC = 'public/brand/favicon.png';
const OUT = 'public';

const ANY = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icons/icon-192.png', size: 192 },
  { name: 'icons/icon-512.png', size: 512 },
];

const MASKABLE = [
  { name: 'icons/icon-maskable-192.png', size: 192 },
  { name: 'icons/icon-maskable-512.png', size: 512 },
];

await mkdir(path.join(OUT, 'icons'), { recursive: true });

// Maskable safe zone is the central 80%; the source artwork touches the
// edges, so center it inside a transparent canvas before resizing.
async function maskableVariant(size) {
  const inner = Math.round(size * 0.8);
  const offset = Math.round((size - inner) / 2);
  const bg = sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  });
  const logo = await sharp(SRC).resize(inner, inner).png().toBuffer();
  return bg
    .composite([{ input: logo, left: offset, top: offset }])
    .png()
    .toBuffer();
}

const icoSources = [];
for (const { name, size } of ANY) {
  const buf = await sharp(SRC).resize(size, size).png().toBuffer();
  await writeFile(path.join(OUT, name), buf);
  if (name === 'favicon-16x16.png' || name === 'favicon-32x32.png') icoSources.push(buf);
  console.log('wrote', name);
}

for (const { name, size } of MASKABLE) {
  await writeFile(path.join(OUT, name), await maskableVariant(size));
  console.log('wrote', name);
}

await writeFile(path.join(OUT, 'favicon.ico'), await pngToIco(icoSources));
console.log('wrote favicon.ico');
