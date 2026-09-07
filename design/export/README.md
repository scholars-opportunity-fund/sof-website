# Snapshots for design tools

`SOF Home Live.html` is the homepage as it currently renders, frozen into one self-contained file:
the real markup and copy, every stylesheet inlined, images embedded as JPEG data URIs, and no
scripts. It is kept under 300 KB so it can be handed to a design tool as an upload.

The hero animates. `src/lib/brain/intro.ts` is bundled into the file with esbuild and runs for real:
the synapse trace draws the brain, the formed brain lands, then the page settles into its resting
composition. Clicking the REPLAY label in the corner runs it again.

Two parts of the live hero cannot travel in a single file, so they are stills instead of live layers:
the rendered market clip that opens the real intro, and the WebGL model whose metal shell grows over
the network. The file uses a captured frame of the formed brain and a captured frame of the resting
hero for those beats.

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
