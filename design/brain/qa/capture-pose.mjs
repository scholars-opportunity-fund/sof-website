// Captures the clip keyframes from the real page: the model at its formed pose (`end`) and the bare stage (`start`),
// at 16:9 and 9:16. Requires the dev server on 3000 and the debug Chrome on 9223. Development-only `?pose=` mode.
import { openPage, until, pause } from './cdp.mjs';
import { writeFile, mkdir } from 'node:fs/promises';
const out = process.argv[2] || 'design/brain/video';
const base = process.argv[3] || 'http://127.0.0.1:3000';
await mkdir(out, { recursive: true });
const frames = [
  { name: '16x9', width: 1920, height: 1080 + 72, mobile: false },
  { name: '9x16', width: 1080, height: 1920 + 72, mobile: true },
];
for (const frame of frames) {
  for (const pose of ['formed', 'empty']) {
    const p = await openPage();
    await p.send('Page.bringToFront');
    await p.send('Emulation.setScrollbarsHidden', { hidden: true });
    await p.send('Emulation.setDeviceMetricsOverride', { width: frame.width, height: frame.height, deviceScaleFactor: 1, mobile: frame.mobile });
    await p.send('Page.navigate', { url: `${base}/?pose=${pose}` });
    await until(p, `document.querySelector('[data-brain-home][data-brain-pose=${pose}]')`);
    await until(p, `document.querySelector('[data-brain-canvas][data-ready=true]')`, 60000);
    await pause(1200);
    // The Next dev-overlay badge must not end up in a keyframe.
    await p.evaluate(`document.querySelectorAll('nextjs-portal').forEach(node => node.remove())`);
    await pause(100);
    const rect = await p.evaluate(`(() => { const r = document.querySelector('[data-startup-stage]').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; })()`);
    const state = await p.evaluate(`({ formation: document.querySelector('[data-brain-canvas]').dataset.formation, hidden: document.hidden })`);
    const shot = await p.send('Page.captureScreenshot', { format: 'png', clip: { ...rect, scale: 1 } });
    const file = `${out}/${pose === 'formed' ? 'end' : 'start'}-${frame.name}.png`;
    await writeFile(file, Buffer.from(shot.data, 'base64'));
    console.log(file, JSON.stringify({ ...rect, ...state }));
    await p.close();
  }
}
