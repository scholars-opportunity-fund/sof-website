// The intro is scrubbed by the scroll and never plays on its own: forward, backward, and at rest.
import { openPage, pause, until } from './cdp.mjs';
// The clip is a strip of stills drawn to a canvas, so the frame on screen is identified by fingerprint.
const state = `JSON.stringify({ y: scrollY, phase: document.querySelector('[data-brain-home]').dataset.brainPhase, word: document.querySelector('[data-brain-home] p span')?.textContent || '', light: Number(getComputedStyle(document.querySelector('[data-brain-home]')).getPropertyValue('--light')).toFixed(2), cue: getComputedStyle(document.querySelector('[data-brain-home]')).getPropertyValue('--cue-opacity'), frame: (() => { const c = document.querySelector('[data-brain-clip]'); if (!c?.width) return 'none'; const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0; for (let i = 0; i < d.length; i += 4009) h = (h * 31 + d[i]) >>> 0; return String(h).slice(0, 6); })() })`;
const page = await openPage();
await page.send('Page.bringToFront');
await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await page.send('Page.navigate', { url: 'http://localhost:3000/' });
await until(page, `document.querySelector('[data-brain-home]')?.dataset.brainPhase === 'forming'`);
const show = async label => console.log(label.padEnd(18), await page.evaluate(state));
console.log('-- at rest for 4s, nothing should move');
await show('load');
await pause(4000);
await show('+4s');
console.log('-- scrolling down the band');
for (const y of [270, 540, 810, 1080, 1350, 1620]) { await page.evaluate(`scrollTo(0, ${y})`); await pause(450); await show(`y=${y}`); }
console.log('-- scrolling back up, the formation should reverse');
for (const y of [900, 360, 0]) { await page.evaluate(`scrollTo(0, ${y})`); await pause(450); await show(`y=${y}`); }
console.log('-- past the band, navigation takes over');
for (const y of [1620, 1800, 2100]) { await page.evaluate(`scrollTo(0, ${y})`); await pause(400); await show(`y=${y}`); }
await page.close();
process.exit(0);
