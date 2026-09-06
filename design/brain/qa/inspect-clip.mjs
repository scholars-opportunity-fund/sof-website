// Inspects a rendered intro clip through the debug Chrome: saves frames at several times and measures
// how far the clip's last frame is from the captured end keyframe (mean absolute difference per channel,
// 0-255, over the central brain region). Usage: node design/brain/qa/inspect-clip.mjs <clip-file-under-public-brain> <end-png> <out-dir>
// The clip argument is a bare filename (Git Bash rewrites a leading slash into a Windows path).
import { openPage, until, pause } from './cdp.mjs';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
const [clipFile = 'intro-proof-16x9.mp4', endPng = 'design/brain/video/end-16x9.png', out = 'design/brain/qa/video'] = process.argv.slice(2);
const base = 'http://127.0.0.1:3000';
mkdirSync(out, { recursive: true });

function decodePng(buffer) {
  let i = 8, w = 0, h = 0, ct = 0; const idat = [];
  while (i < buffer.length) {
    const len = buffer.readUInt32BE(i), type = buffer.toString('ascii', i + 4, i + 8), data = buffer.subarray(i + 8, i + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); ct = data[9]; }
    if (type === 'IDAT') idat.push(data);
    i += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat)), bpp = ct === 6 ? 4 : 3, stride = w * bpp, pixels = Buffer.alloc(h * stride);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const filter = raw[y * (stride + 1)], line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)), cur = pixels.subarray(y * stride, (y + 1) * stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0, b = prev[x], c = x >= bpp ? prev[x - bpp] : 0; let v = line[x];
      if (filter === 1) v += a; else if (filter === 2) v += b; else if (filter === 3) v += Math.floor((a + b) / 2);
      else if (filter === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      cur[x] = v & 255;
    }
    prev = cur;
  }
  return { w, h, bpp, pixels };
}

const p = await openPage();
await p.send('Page.bringToFront');
await p.send('Page.navigate', { url: `${base}/design/brain` });
await until(p, `location.pathname === '/design/brain' && document.readyState === 'complete'`, 60000);
await p.evaluate(`(() => { const v = document.createElement('video'); v.id = 'clip'; v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = '/brain/${clipFile}'; document.body.appendChild(v); v.load(); return 'created'; })()`);
await until(p, `document.getElementById('clip').readyState >= 1 || document.getElementById('clip').error`);
const error = await p.evaluate(`document.getElementById('clip').error ? document.getElementById('clip').error.code + ':' + document.getElementById('clip').error.message : null`);
if (error) { console.log('video error', error); await p.close(); process.exit(1); }
const meta = await p.evaluate(`({ duration: document.getElementById('clip').duration, width: document.getElementById('clip').videoWidth, height: document.getElementById('clip').videoHeight })`);
console.log('clip', JSON.stringify(meta));
const grab = async (time, name) => {
  await p.evaluate(`(() => { const v = document.getElementById('clip'); window.__seeked = false; v.addEventListener('seeked', () => { window.__seeked = true; }, { once: true }); v.currentTime = ${time}; })()`);
  await until(p, `window.__seeked === true`);
  await pause(60);
  const data = await p.evaluate(`(() => { const v = document.getElementById('clip'); const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight; c.getContext('2d').drawImage(v, 0, 0); return c.toDataURL('image/png'); })()`);
  const png = Buffer.from(data.split(',')[1], 'base64');
  writeFileSync(`${out}/${name}.png`, png);
  return png;
};
const times = [0, 1.5, 3, 4.5, 6, 7.5, 8.5, 9.3];
for (const t of times) await grab(t, `frame-${t.toFixed(1)}s`);
const lastPng = await grab(Math.max(0, meta.duration - 0.04), 'frame-last');
await p.close();

// Compare the last frame against the end keyframe, scaled by nearest neighbour to the clip size.
const end = decodePng(readFileSync(endPng)), last = decodePng(lastPng);
const region = { x0: Math.round(last.w * .18), x1: Math.round(last.w * .82), y0: Math.round(last.h * .05), y1: Math.round(last.h * .95) };
let sum = 0, count = 0;
for (let y = region.y0; y < region.y1; y++) for (let x = region.x0; x < region.x1; x++) {
  const ex = Math.floor(x * end.w / last.w), ey = Math.floor(y * end.h / last.h);
  const a = (y * last.w + x) * last.bpp, b = (ey * end.w + ex) * end.bpp;
  for (let c = 0; c < 3; c++) { sum += Math.abs(last.pixels[a + c] - end.pixels[b + c]); count++; }
}
console.log('last-frame vs end keyframe: mean abs diff per channel =', (sum / count).toFixed(2), 'over region', JSON.stringify(region));
