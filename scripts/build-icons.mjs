import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';

// Keep all raster fallbacks in sync with the hand-drawn vector master.
const svg = await readFile(new URL('../public/favicon.svg', import.meta.url));
const output = name => new URL(`../public/${name}`, import.meta.url);
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(size => sharp(svg).resize(size, size).png().toBuffer()));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
images.forEach((image, index) => {
  const entry = 6 + index * 16;
  header[entry] = sizes[index]; header[entry + 1] = sizes[index];
  header.writeUInt16LE(1, entry + 4); header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(image.length, entry + 8); header.writeUInt32LE(offset, entry + 12);
  offset += image.length;
});
await writeFile(output('favicon.ico'), Buffer.concat([header, ...images]));
await writeFile(output('favicon-32.png'), images[1]);
// iOS applies its own corner mask; give it an opaque square canvas.
await writeFile(output('apple-touch-icon.png'), await sharp(svg).resize(180, 180).flatten({ background: '#073D33' }).png().toBuffer());
