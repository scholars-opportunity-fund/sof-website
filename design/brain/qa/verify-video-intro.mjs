// Verifies the cinematic video intro end to end through the debug Chrome (port 9223) against the dev server:
// the normal timeline, the swap difference, reduced motion, a blocked clip, a late model, a mid-clip stall, and phones.
// Usage: node design/brain/qa/verify-video-intro.mjs [out-dir] [base-url]
import { openPage, until, pause } from './cdp.mjs';
import { writeFile, mkdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
const out = process.argv[2] || 'design/brain/qa/video';
const base = process.argv[3] || 'http://127.0.0.1:3000';
await mkdir(out, { recursive: true });
const results = {};
const state = p => p.evaluate(`(() => { const h = document.querySelector('[data-brain-home]'); const c = document.querySelector('[data-brain-canvas]'); const v = document.querySelector('[data-brain-clip]'); return { phase: h.dataset.brainPhase, ready: c.dataset.ready, failed: h.dataset.brainFailed, swap: h.dataset.swap, formation: c.dataset.formation, hidden: document.hidden, clip: v && !v.hidden ? { src: v.currentSrc.split('/').pop(), time: +v.currentTime.toFixed(2), ended: v.ended, paused: v.paused } : null, fallback: !document.querySelector('[data-brain-fallback]').hidden, stage: getComputedStyle(document.querySelector('[data-startup-stage]')).backgroundColor }; })()`);
const shot = async (p, name) => { const data = (await p.send('Page.captureScreenshot', { format: 'png' })).data; await writeFile(`${out}/${name}.png`, Buffer.from(data, 'base64')); return Buffer.from(data, 'base64'); };
async function page(width, height, mobile) {
  const p = await openPage();
  await p.send('Page.bringToFront');
  await p.send('Emulation.setScrollbarsHidden', { hidden: true });
  await p.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
  return p;
}
function decodePng(buffer) {
  let i = 8, w = 0, h = 0, ct = 0; const idat = [];
  while (i < buffer.length) { const len = buffer.readUInt32BE(i), type = buffer.toString('ascii', i + 4, i + 8), data = buffer.subarray(i + 8, i + 8 + len); if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); ct = data[9]; } if (type === 'IDAT') idat.push(data); i += 12 + len; }
  const raw = inflateSync(Buffer.concat(idat)), bpp = ct === 6 ? 4 : 3, stride = w * bpp, pixels = Buffer.alloc(h * stride); let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) { const f = raw[y * (stride + 1)], line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)), cur = pixels.subarray(y * stride, (y + 1) * stride);
    for (let x = 0; x < stride; x++) { const a = x >= bpp ? cur[x - bpp] : 0, b = prev[x], c = x >= bpp ? prev[x - bpp] : 0; let v = line[x]; if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += Math.floor((a + b) / 2); else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; } cur[x] = v & 255; } prev = cur; }
  return { w, h, bpp, pixels };
}
function diff(a, b) {
  const A = decodePng(a), B = decodePng(b); let sum = 0, count = 0;
  const x0 = Math.round(A.w * .18), x1 = Math.round(A.w * .82), y0 = Math.round(A.h * .12), y1 = Math.round(A.h * .95);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = (y * A.w + x) * A.bpp, j = (y * B.w + x) * B.bpp; for (let c = 0; c < 3; c++) { sum += Math.abs(A.pixels[i + c] - B.pixels[j + c]); count++; } }
  return +(sum / count).toFixed(2);
}

// 1. Normal desktop load: timed screenshots through the clip, the swap, and the tail.
{
  const p = await page(1440, 1000, false);
  await p.send('Page.navigate', { url: base });
  await until(p, `document.querySelector('[data-brain-home][data-brain-phase=forming]')`, 60000);
  const t0 = Date.now();
  for (const ms of [1500, 4000, 7000, 9000, 9800]) { const wait = t0 + ms - Date.now(); if (wait > 0) await pause(wait); await shot(p, `desktop-${ms}`); console.log('desktop', ms, JSON.stringify(await state(p))); }
  await until(p, `document.querySelector('[data-brain-home][data-swap=true]') || document.querySelector('[data-brain-home][data-brain-phase=still]')`, 20000);
  await pause(120); await shot(p, 'desktop-swap'); console.log('desktop swap', JSON.stringify(await state(p)));
  await until(p, `document.querySelector('[data-brain-home][data-brain-phase=still]')`, 20000);
  await pause(300); await shot(p, 'desktop-rest'); results.desktopRest = await state(p); console.log('desktop rest', JSON.stringify(results.desktopRest));
  await p.evaluate(`scrollTo({top:450,behavior:'instant'})`); await pause(600); await shot(p, 'desktop-explore');
  await p.close();
}

// 2. Swap difference: hold the model so the clip ends first, screenshot the last frame, release, screenshot the model.
{
  const p = await page(1440, 1000, false);
  await p.send('Fetch.enable', { patterns: [{ urlPattern: '*anatomical-brain.glb.gz*', requestStage: 'Request' }] });
  let release; const held = new Promise(resolve => { release = resolve; });
  p.on('Fetch.requestPaused', async e => { await held; await p.send('Fetch.continueRequest', { requestId: e.requestId }); });
  await p.send('Page.navigate', { url: base });
  await until(p, `(() => { const v = document.querySelector('[data-brain-clip]'); return v && v.ended; })()`, 40000);
  await pause(200);
  // The wordmark sits over both frames in reality; hide it so the measure covers the brain only.
  await p.evaluate(`document.querySelector('[data-brain-word]').style.display = 'none'; document.querySelectorAll('nextjs-portal').forEach(node => node.remove())`);
  const last = await shot(p, 'swap-last-video-frame'); console.log('held at clip end', JSON.stringify(await state(p)));
  release();
  await until(p, `document.querySelector('[data-brain-home][data-swap=true]')`, 30000);
  await pause(320);
  await shot(p, 'swap-after-fade'); console.log('after swap', JSON.stringify(await state(p)));
  await p.close();
  // The model's first interactive frame is the formed pose itself, which the development pose mode renders at this exact viewport.
  const q = await page(1440, 1000, false);
  await q.send('Page.navigate', { url: `${base}/?pose=formed` });
  await until(q, `document.querySelector('[data-brain-home][data-brain-pose=formed]') && document.querySelector('[data-brain-canvas][data-ready=true]')`, 60000);
  await pause(800);
  await q.evaluate(`document.querySelectorAll('nextjs-portal').forEach(node => node.remove())`);
  const model = await shot(q, 'swap-first-model-frame');
  await q.close();
  results.swapDiff = diff(last, model);
  console.log('swap difference (mean abs per channel, brain region):', results.swapDiff);
}

// 3. Reduced motion: never plays the clip.
{
  const p = await page(1440, 1000, false);
  await p.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await p.send('Page.navigate', { url: base });
  await until(p, `document.querySelector('[data-brain-home][data-brain-phase=still]')`, 40000);
  await pause(300); await shot(p, 'reduced-motion'); results.reducedMotion = await state(p); console.log('reduced motion', JSON.stringify(results.reducedMotion));
  await p.close();
}

// 4. Blocked clip: the page reaches the still state within the wait budget.
{
  const p = await page(1440, 1000, false);
  await p.send('Fetch.enable', { patterns: [{ urlPattern: '*intro-*.mp4*', requestStage: 'Request' }] });
  p.on('Fetch.requestPaused', e => p.send('Fetch.failRequest', { requestId: e.requestId, errorReason: 'Failed' }));
  await p.send('Page.navigate', { url: base });
  const t0 = Date.now();
  await until(p, `document.querySelector('[data-brain-home][data-brain-phase=still]')`, 40000);
  results.blockedClipMs = Date.now() - t0;
  await pause(300); await shot(p, 'blocked-clip'); console.log('blocked clip -> still after ms', results.blockedClipMs, JSON.stringify(await state(p)));
  await p.close();
}

// 5. Mid-clip stall: a throttled clip that starts but cannot keep up; the watchdog must reach the still state.
{
  const p = await page(1440, 1000, false);
  await p.send('Network.enable');
  await p.send('Network.setCacheDisabled', { cacheDisabled: true });
  // The model is served straight from disk so only the clip feels the throttle.
  const glb = readFileSync('public/brain/anatomical-brain.glb.gz').toString('base64');
  await p.send('Fetch.enable', { patterns: [{ urlPattern: '*anatomical-brain.glb.gz*', requestStage: 'Request' }] });
  p.on('Fetch.requestPaused', e => p.send('Fetch.fulfillRequest', { requestId: e.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'application/octet-stream' }], body: glb }));
  // About 2.5 Mbps with the cache off: the clip starts but stutters, and the lag watchdog must cut it for the still.
  await p.send('Network.emulateNetworkConditions', { offline: false, latency: 40, downloadThroughput: 2_500_000 / 8, uploadThroughput: 1_000_000 / 8 });
  await p.send('Page.navigate', { url: base });
  await until(p, `(() => { const v = document.querySelector('[data-brain-clip]'); return v && !v.paused && v.currentTime > .3; })()`, 40000).catch(() => {});
  const t0 = Date.now();
  await until(p, `document.querySelector('[data-brain-home][data-brain-phase=still]')`, 40000).then(() => { results.stallRecoveredMs = Date.now() - t0; }).catch(() => { results.stallRecoveredMs = null; });
  await p.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await pause(300); await shot(p, 'stall'); console.log('stall -> still after ms', results.stallRecoveredMs, JSON.stringify(await state(p)));
  await p.close();
}

// 6. Phone: portrait clip selected, brain in frame through the swap.
{
  const p = await page(390, 844, true);
  await p.send('Page.navigate', { url: base });
  await until(p, `document.querySelector('[data-brain-home][data-brain-phase=forming]')`, 60000);
  await pause(3000); await shot(p, 'mobile-clip'); results.mobileClip = await state(p); console.log('mobile clip', JSON.stringify(results.mobileClip));
  await until(p, `document.querySelector('[data-brain-home][data-brain-phase=still]')`, 40000);
  await pause(300); await shot(p, 'mobile-rest'); console.log('mobile rest', JSON.stringify(await state(p)), 'overflow', await p.evaluate(`document.documentElement.scrollWidth>innerWidth`));
  await p.close();
}

// 7. Wide and portrait-tablet stages: the clip's side margins and the tablet clip choice.
for (const [name, width, height, mobile] of [['laptop-1366', 1366, 768, false], ['ultrawide', 2560, 1080, false], ['tablet-portrait', 768, 1024, true]]) {
  const p = await page(width, height, mobile);
  await p.send('Page.navigate', { url: base });
  await until(p, `document.querySelector('[data-brain-home][data-brain-phase=forming]')`, 60000);
  await pause(5000); await shot(p, `${name}-mid`); console.log(name, JSON.stringify(await state(p)));
  await p.close();
}
console.log('RESULTS', JSON.stringify(results));
