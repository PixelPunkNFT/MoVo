import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const sizes = [192, 512];
const svg = readFileSync(resolve('public/pwa-icon.svg'), 'utf-8');

for (const size of sizes) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(resolve(`public/pwa-icon-${size}.png`));
  console.log(`✓ public/pwa-icon-${size}.png`);
}
