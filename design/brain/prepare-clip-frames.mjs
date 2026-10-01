// The intro clip, exported as still frames so the scroll can scrub it.
//
// The encoded mp4 carries four keyframes in ten seconds, so every seek has to decode up to 138 frames
// and lands about 220ms later: fine while it played, useless now that the scroll is its only clock.
// Frames are instant instead, and only the stretch of clip the intro band covers is worth keeping.
//
// There is no ffmpeg on this machine (no win32-arm64 binary), so the decoding is done by the debug
// Chrome on 127.0.0.1:9223, which already serves the QA scripts: it seeks the video, draws each frame
// to a canvas and encodes it as WebP. Run it with the dev server up: node design/brain/prepare-clip-frames.mjs
import { mkdir, writeFile, readdir, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { openPage, pause } from './qa/cdp.mjs';

// The band opens at 2.4s of a 12s timeline and hands over to the drawn trace at 6.4s; the clip is handed
// over at 80% of its length. Those two bounds are this stretch of the clip, at half its 24fps.
const FROM = 3, TO = 8, FPS = 12, WIDTH = 1440, QUALITY = .74;
const count = Math.round((TO - FROM) * FPS) + 1;
const destination = new URL('../../public/brain/intro/', import.meta.url);
await mkdir(destination, { recursive: true });
for (const file of await readdir(destination)) if (file.endsWith('.webp')) await unlink(new URL(file, destination));

const page = await openPage();
await page.send('Page.navigate', { url: 'http://localhost:3000/brain/attribution.txt' });
await pause(500);
await page.evaluate(`window.frameSource = (async () => {
  const video = document.createElement('video');
  video.src = '/brain/intro-market-16x9.mp4'; video.muted = true; video.preload = 'auto';
  await new Promise(resolve => video.addEventListener('loadedmetadata', resolve, { once: true }));
  const canvas = document.createElement('canvas');
  canvas.width = ${WIDTH}; canvas.height = Math.round(${WIDTH} * video.videoHeight / video.videoWidth);
  const context = canvas.getContext('2d');
  window.grab = async seconds => {
    video.currentTime = seconds;
    await new Promise(resolve => video.addEventListener('seeked', resolve, { once: true }));
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/webp', ${QUALITY}).split(',')[1];
  };
  return { width: canvas.width, height: canvas.height, duration: video.duration };
})()`);
const source = await page.evaluate('window.frameSource');
console.log(`clip ${source.duration.toFixed(2)}s -> ${count} frames of ${source.width}x${source.height}`);

let total = 0;
for (let index = 0; index < count; index++) {
  const seconds = FROM + index / FPS;
  const encoded = await page.evaluate(`window.grab(${seconds})`);
  const bytes = Buffer.from(encoded, 'base64');
  total += bytes.length;
  await writeFile(fileURLToPath(new URL(`f${String(index).padStart(2, '0')}.webp`, destination)), bytes);
  if (index % 10 === 0 || index === count - 1) console.log(`  ${index + 1}/${count} (${(total / 1024 / 1024).toFixed(2)}MB)`);
}
console.log(`${count} frames, ${(total / 1024 / 1024).toFixed(2)}MB total, ${Math.round(total / count / 1024)}KB each`);
await page.close();
process.exit(0);
