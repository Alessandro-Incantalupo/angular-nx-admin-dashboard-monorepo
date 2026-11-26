// Captures the assistant's recorded demo as the README's GIF, with no tools
// beyond Playwright: screenshots while the demo plays, decoded and scaled in
// Chromium's canvas, then written as a GIF by the small encoder below.
//
// 1. API: PORT=3100 bun run apps/api/src/server.ts
// 2. Dashboard: nx serve admin-dashboard --configuration=development --port 4300
// 3. node tools/assistant/capture-demo.mjs [docs/assistant-demo.gif]
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const OUT = process.argv[2] ?? 'docs/assistant-demo.gif';
const BASE_URL = process.env.DASHBOARD_URL ?? 'http://localhost:4300';
const CHROME =
  process.env.CHROME_PATH ??
  join(homedir(), '.cache/ms-playwright/chromium-1194/chrome-linux/chrome');
const VIEWPORT = { width: 1200, height: 760 };
const WIDTH = 960;
const HEIGHT = Math.round((VIEWPORT.height * WIDTH) / VIEWPORT.width);
const QUESTIONS = [
  'Which admins do we have?',
  'How many users are there per role?',
  'Show me Bob.',
];

// --- Capture ---------------------------------------------------------------

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: VIEWPORT });
await page.goto(`${BASE_URL}/assistant?assistant=recorded`);
await page.getByTestId('recorded-banner').waitFor();
await page.waitForTimeout(1500); // fonts, icons, the global spinner

const shots = [];
let playing = true;
const recorder = (async () => {
  while (playing) {
    shots.push({ at: Date.now(), png: await page.screenshot({ type: 'png' }) });
  }
})();

const answers = () => page.locator('.assistant-answer').count();
await page.waitForTimeout(1200);
for (const question of QUESTIONS) {
  const before = await answers();
  await page.getByRole('button', { name: question }).click();
  await page.waitForFunction(
    n => document.querySelectorAll('.assistant-answer').length > n,
    before,
    { timeout: 20_000 }
  );
  await page.waitForTimeout(2500);
}
playing = false;
await recorder;
shots.push({ at: Date.now(), png: shots.at(-1).png });

// --- Decode and scale in Chromium -----------------------------------------

const canvasPage = await browser.newPage();
async function toRgba(png) {
  const b64 = await canvasPage.evaluate(
    async ({ src, width, height }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${src}`;
      await img.decode();
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      const data = ctx.getImageData(0, 0, width, height).data;
      let binary = '';
      for (let i = 0; i < data.length; i += 0x8000) {
        binary += String.fromCharCode(...data.subarray(i, i + 0x8000));
      }
      return btoa(binary);
    },
    { src: png.toString('base64'), width: WIDTH, height: HEIGHT }
  );
  return new Uint8Array(Buffer.from(b64, 'base64'));
}
const frames = [];
for (const shot of shots) frames.push({ at: shot.at, rgba: await toRgba(shot.png) });
await browser.close();

// --- Palette: the 256 most common colours, 5 bits per channel --------------

const key = (d, i) => ((d[i] >> 3) << 10) | ((d[i + 1] >> 3) << 5) | (d[i + 2] >> 3);
const counts = new Uint32Array(1 << 15);
for (const { rgba } of frames) {
  for (let i = 0; i < rgba.length; i += 4) counts[key(rgba, i)]++;
}
const palette = [...counts.keys()]
  .filter(k => counts[k] > 0)
  .sort((a, b) => counts[b] - counts[a])
  .slice(0, 256)
  .map(k => [((k >> 10) & 31) * 8 + 4, ((k >> 5) & 31) * 8 + 4, (k & 31) * 8 + 4]);
while (palette.length < 256) palette.push([0, 0, 0]);
const nearest = new Int16Array(1 << 15).fill(-1);
function indexOf(k) {
  if (nearest[k] >= 0) return nearest[k];
  const r = ((k >> 10) & 31) * 8 + 4, g = ((k >> 5) & 31) * 8 + 4, b = (k & 31) * 8 + 4;
  let best = 0, bestDistance = Infinity;
  for (const [i, [pr, pg, pb]] of palette.entries()) {
    const d = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
    if (d < bestDistance) [best, bestDistance] = [i, d];
  }
  return (nearest[k] = best);
}
const indexed = frames.map(({ at, rgba }) => {
  const px = new Uint8Array(WIDTH * HEIGHT);
  for (let p = 0; p < px.length; p++) px[p] = indexOf(key(rgba, p * 4));
  return { at, px };
});

// --- GIF89a encoder --------------------------------------------------------

/** GIF's variable-width LZW, 8-bit minimum code size. */
function lzw(indices) {
  const clear = 256, eoi = 257;
  let size = 9, next = 258, table = new Map();
  const bytes = [];
  let bits = 0, nbits = 0;
  const emit = code => {
    bits |= code << nbits;
    nbits += size;
    while (nbits >= 8) {
      bytes.push(bits & 255);
      bits >>>= 8;
      nbits -= 8;
    }
  };
  emit(clear);
  let prefix = indices[0];
  for (let i = 1; i < indices.length; i++) {
    const k = indices[i];
    const entry = (prefix << 8) | k;
    const found = table.get(entry);
    if (found !== undefined) {
      prefix = found;
      continue;
    }
    emit(prefix);
    if (next === 4096) {
      emit(clear);
      size = 9;
      next = 258;
      table = new Map();
    } else {
      if (next >= 1 << size) size++;
      table.set(entry, next++);
    }
    prefix = k;
  }
  emit(prefix);
  emit(eoi);
  if (nbits > 0) bytes.push(bits & 255);
  return bytes;
}

const out = [];
const u16 = n => out.push(n & 255, (n >> 8) & 255);
out.push(...Buffer.from('GIF89a'));
u16(WIDTH);
u16(HEIGHT);
out.push(0xf7, 0, 0); // global table of 256 colours
for (const rgb of palette) out.push(...rgb);
out.push(0x21, 0xff, 0x0b, ...Buffer.from('NETSCAPE2.0'), 3, 1, 0, 0, 0); // loop

let previous;
let written = 0;
for (let f = 0; f < indexed.length; f++) {
  const { at, px } = indexed[f];
  // Only the rectangle that changed since the last written frame.
  let [x0, y0, x1, y1] = [0, 0, WIDTH - 1, HEIGHT - 1];
  if (previous) {
    [x0, y0, x1, y1] = [WIDTH, HEIGHT, -1, -1];
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        const p = y * WIDTH + x;
        if (px[p] !== previous[p]) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
    }
    if (x1 < 0) continue; // nothing changed: the previous frame stays longer
  }
  // A frame lasts until the next frame that differs.
  let end = f + 1;
  while (end < indexed.length - 1 && indexed[end].px.every((v, i) => v === px[i])) end++;
  const isLast = end >= indexed.length - 1;
  const delay = isLast ? 400 : Math.max(2, Math.round((indexed[end].at - at) / 10));
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  const sub = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) sub.set(px.subarray((y0 + y) * WIDTH + x0, (y0 + y) * WIDTH + x0 + w), y * w);
  out.push(0x21, 0xf9, 4, 0x04);
  u16(delay);
  out.push(0, 0);
  out.push(0x2c);
  u16(x0);
  u16(y0);
  u16(w);
  u16(h);
  out.push(0, 8);
  const data = lzw(sub);
  for (let i = 0; i < data.length; i += 255) {
    const block = data.slice(i, i + 255);
    out.push(block.length, ...block);
  }
  out.push(0);
  previous = px;
  written++;
}
out.push(0x3b);
writeFileSync(OUT, Buffer.from(out));
console.log(`${OUT}: ${written} frames from ${shots.length} shots, ${WIDTH}x${HEIGHT}, ${(out.length / 1024).toFixed(0)} kB`);
