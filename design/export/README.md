# Snapshots for design tools

Two files, same page:

- `SOF Home Live (full).html` (8 MB) is the one that matches localhost. The original 1600x900
  Higgsfield clip, the hero captured at full resolution, photographs at 1400px.
- `SOF Home Live.html` (1.1 MB) is the same thing shrunk for tools that limit upload size: the clip
  re-encoded to 800x450 and trimmed to 8.2 s, the stills compressed harder.

`SOF Home Live.html` is the homepage as it currently renders, frozen into one self-contained file:
the real markup and copy, every stylesheet inlined, images embedded as JPEG data URIs, and no
scripts. It is kept under 300 KB so it can be handed to a design tool as an upload.

The hero runs the real intro. The Higgsfield clip is embedded as a compressed 573 KB copy (800x450,
the first 8.2 seconds, which is the part the live page uses), `src/lib/brain/intro.ts` is bundled in
with esbuild and draws the synapse trace over it, and the brain then forms and settles. Clicking the
REPLAY label in the corner runs the whole thing again.

Only the WebGL model cannot travel: the metal shell growing over the network needs three.js and a
5 MB model, so the file uses captured frames of the formed brain and the resting hero for that beat.

Regenerate it against a running dev server with `design/brain/qa/../..` — the script lives in the
session scratch, so if it is gone: open the page in the debug browser, skip the intro, capture the
hero region as a PNG, then serialise `document.documentElement` with stylesheets inlined and the
`[data-brain-home]` section swapped for that image.

Everything else on the page is real, editable HTML.

## Round trip

Edit this file wherever you like, bring the edited copy back, and the changes get ported into the
components by hand: the sections map to `src/components/signal/SignalContent.tsx` and
`src/components/signal/Signal.module.css`, the shell to `src/components/layout/`. Diff the returned
file against this one first, so only the deliberate changes move. Regenerate this snapshot afterwards
so the two stay in step.
