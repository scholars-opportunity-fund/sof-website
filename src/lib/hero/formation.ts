// Particle targets sampled from a still, so the hero's field can resolve into an image instead of leaving.
//
// The clip below the hero is drawn scaled to the stage's height and centred (src/lib/brain/clip.ts), and
// both stages are the same sticky rectangle, so reproducing that framing here is what makes the dotted
// picture and the footage that replaces it land on the same pixels. Get the framing wrong and the effect
// reads as two different images crossfading, which is the cut this is meant to remove.
//
// Sampling is weighted by luminance through a cumulative table: one pass over the pixels to build it, then
// a binary search per particle. Rejection sampling was the obvious alternative and is unbounded in the
// worst case — a dark frame can spin for many tries per particle, and this runs for tens of thousands.

export type Formation = { positions: Float32Array; tints: Float32Array };

// The still is sampled at this width. The field is thousands of points, not millions, so a larger grid
// buys no detail that survives being drawn as dots, and costs a proportionally larger getImageData.
const SAMPLE_WIDTH = 480;
// Where a sampled particle sits on the tint ramp in nebula.ts: warm pixels (the candles) take the copper
// end, everything else sits between the deep blue and the sky.
const WARM = .95, COOL = .38;

/**
 * Positions and tints that place `count` particles across the visible part of `image`, matching how
 * the clip strip frames the same still. Returns null if the image cannot be read or is entirely black.
 *
 * `stageAspect` is the canvas's width over its height; `visibleHeight` is the world-space height the
 * camera sees at the field's resting depth.
 */
export function sampleFormation(
  image: HTMLImageElement,
  count: number,
  stageAspect: number,
  visibleHeight: number,
): Formation | null {
  if (!image.naturalWidth || !image.naturalHeight) return null;

  const width = SAMPLE_WIDTH;
  const height = Math.max(1, Math.round(width * image.naturalHeight / image.naturalWidth));
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;
  context.drawImage(image, 0, 0, width, height);

  let pixels: Uint8ClampedArray;
  try { pixels = context.getImageData(0, 0, width, height).data; } catch { return null; }

  // The clip is always drawn at the stage's full height, so its width on screen is the stage's height
  // times the still's aspect — wider than the stage on most screens, which crops the sides. Only that
  // centre strip is ever seen, and a particle placed outside it would be a particle nobody gets.
  const imageAspect = image.naturalWidth / image.naturalHeight;
  const seen = Math.min(1, stageAspect / imageAspect);
  const columns = Math.max(1, Math.round(seen * width));
  const left = Math.floor((width - columns) / 2);

  // Cumulative luminance, squared so the candles and the bright network read as structure while the dim
  // field behind them stays sparse rather than soaking up half the particles.
  const weights = new Float32Array(columns * height);
  let total = 0;
  for (let row = 0; row < height; row++) {
    for (let column = 0; column < columns; column++) {
      const offset = ((row * width) + left + column) * 4;
      const luminance = (pixels[offset] * .299 + pixels[offset + 1] * .587 + pixels[offset + 2] * .114) / 255;
      total += luminance * luminance;
      weights[row * columns + column] = total;
    }
  }
  if (!(total > 0)) return null;

  const spanWidth = visibleHeight * imageAspect * seen;
  const positions = new Float32Array(count * 3), tints = new Float32Array(count);
  for (let index = 0; index < count; index++) {
    // Binary search for the first cumulative weight past a uniform draw: the pixel's share of the total
    // is its chance of being picked.
    let low = 0, high = weights.length - 1;
    const pick = Math.random() * total;
    while (low < high) {
      const middle = (low + high) >> 1;
      if (weights[middle] < pick) low = middle + 1; else high = middle;
    }
    const row = (low / columns) | 0, column = low % columns;
    // Jittered inside the pixel, so the field does not band onto the sampling grid.
    positions[index * 3] = ((column + Math.random()) / columns - .5) * spanWidth;
    positions[index * 3 + 1] = (.5 - (row + Math.random()) / height) * visibleHeight;
    positions[index * 3 + 2] = (Math.random() - .5) * .3;

    const offset = ((row * width) + left + column) * 4;
    tints[index] = pixels[offset] > pixels[offset + 2] * 1.04 ? WARM : COOL;
  }
  return { positions, tints };
}
