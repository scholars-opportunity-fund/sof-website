// The opening clip, as a strip of stills the scroll can land on exactly.
//
// A video cannot be scrubbed: seeking the encoded mp4 costs about 220ms a frame, because it carries four
// keyframes in ten seconds. The same stretch of footage as WebP frames (design/brain/prepare-clip-frames.mjs)
// is 3MB and always instant, at the price of doing the paging by hand — which is what this does: it pulls
// whatever is being looked at to the front of the queue, decodes a window around it, and keeps the rest
// compressed, so a visitor who scrolls straight past the intro downloads a fraction of it.

// Frames, and the seconds of clip they cover, as exported.
export const CLIP_FRAMES = 61;
// Decoded frames held at once. Each is 1440x810, about 4.7MB of bitmap, so this is the memory ceiling.
const CACHE = 8;
// Frames fetched at once, and how far ahead of the scrubbed frame decoding runs.
const PARALLEL = 4, LOOKAHEAD = 3;

export type ClipStrip = ReturnType<typeof createClipStrip>;

export function createClipStrip(canvas: HTMLCanvasElement, base = '/brain/intro/') {
  const target = canvas.getContext('2d');
  if (!target) throw new Error('2D canvas unavailable');
  const context = target;
  const blobs: (Blob | null)[] = Array.from({ length: CLIP_FRAMES }, () => null);
  const bitmaps = new Map<number, ImageBitmap>();
  const fetching = new Set<number>();
  const decoding = new Set<number>();
  let wanted = 0, failed = 0, live = true;

  const source = (index: number) => `${base}f${String(index).padStart(2, '0')}.webp`;
  const held = (index: number) => index >= 0 && index < CLIP_FRAMES && Boolean(bitmaps.get(index));

  // Everything is pulled toward the frame on screen: the next fetch is the nearest one still missing,
  // looking forward first, since that is the way the scroll usually runs.
  function next() {
    for (let step = 0; step < CLIP_FRAMES; step++) {
      for (const index of step ? [wanted + step, wanted - step] : [wanted]) {
        if (index < 0 || index >= CLIP_FRAMES) continue;
        if (!blobs[index] && !fetching.has(index)) return index;
      }
    }
    return -1;
  }

  function pump() {
    while (live && failed < 3 && fetching.size < PARALLEL) {
      const index = next();
      if (index < 0) break;
      fetching.add(index);
      fetch(source(index)).then(response => {
        if (!response.ok) throw new Error(String(response.status));
        return response.blob();
      }).then(blob => {
        blobs[index] = blob; failed = 0;
        if (Math.abs(index - wanted) <= LOOKAHEAD) decode(index);
      }).catch(() => { failed++; }).finally(() => {
        fetching.delete(index);
        if (live) pump();
      });
    }
  }

  function decode(index: number) {
    const blob = blobs[index];
    if (!blob || bitmaps.has(index) || decoding.has(index)) return;
    decoding.add(index);
    createImageBitmap(blob).then(bitmap => {
      if (!live) { bitmap.close(); return; }
      bitmaps.set(index, bitmap);
      // Oldest first, but never the frame being looked at, so a slow scrub cannot evict what it is drawing.
      for (const key of bitmaps.keys()) {
        if (bitmaps.size <= CACHE) break;
        if (key === wanted) continue;
        bitmaps.get(key)?.close();
        bitmaps.delete(key);
      }
    }).catch(() => {}).finally(() => decoding.delete(index));
  }

  // The nearest decoded frame to the one asked for. Scrubbing ahead of the decoder shows a frame that is
  // a beat stale rather than an empty stage, and it is replaced as soon as the right one lands.
  function nearest(index: number) {
    for (let step = 0; step < CLIP_FRAMES; step++) {
      if (held(index - step)) return bitmaps.get(index - step);
      if (held(index + step)) return bitmaps.get(index + step);
    }
    return null;
  }

  // `progress` runs 0 to 1 across the clip's share of the timeline. Returns false while nothing has
  // arrived yet, which is the caller's signal that the stage is still bare.
  function draw(progress: number) {
    const index = Math.max(0, Math.min(CLIP_FRAMES - 1, Math.round(progress * (CLIP_FRAMES - 1))));
    if (index !== wanted) { wanted = index; pump(); }
    for (let ahead = 0; ahead <= LOOKAHEAD; ahead++) decode(index + ahead);
    const frame = nearest(index);
    if (!frame) return false;
    const ratio = Math.min(2, devicePixelRatio || 1);
    const width = Math.round(canvas.clientWidth * ratio), height = Math.round(canvas.clientHeight * ratio);
    if (!width || !height) return false;
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    // Scaled to the stage's height and centred, as the video element was, so the framing is unchanged.
    const scale = height / frame.height;
    const drawn = frame.width * scale;
    context.clearRect(0, 0, width, height);
    context.drawImage(frame, (width - drawn) / 2, 0, drawn, height);
    return true;
  }

  // True once the strip has given up: the frames are missing or the network refused them three times over,
  // and the stage should fall back to the drawn trace rather than wait.
  const broken = () => failed >= 3;

  function dispose() {
    live = false;
    for (const bitmap of bitmaps.values()) bitmap.close();
    bitmaps.clear();
  }

  pump();
  return { draw, broken, dispose };
}
