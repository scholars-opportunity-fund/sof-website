// Whether this visit gets the cinematic clip or the drawn synapse trace.
//
// Two places need the same answer. The brain runs one intro or the other, and the hero above it resolves
// its field into the clip's first frame only when that frame is what comes next — otherwise it falls back
// to throwing the field past the camera. Were the two to disagree, the hero would dissolve into a picture
// the page never shows.

/**
 * True when the clip should run: it is landscape-only and heavy, so portrait stages, narrow stages and
 * metered connections take the drawn trace instead. Call it in the browser only.
 *
 * Reduced motion is checked here for the hero's sake. The brain skips its whole intro under that
 * preference before it ever asks this question, so the clip is not what comes next — and a hero that
 * resolved into its first frame anyway would be dissolving into an image the page never shows.
 */
export function clipPreferred() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
  return !saveData && innerWidth >= innerHeight && innerWidth >= 900;
}
