# Snapshots for design tools

`SOF Home Live.html` is the homepage as it currently renders, frozen into one self-contained file:
the real markup and copy, every stylesheet inlined, images embedded as data URIs, and no scripts.

The hero is a still of the resting brain rather than the live sequence. The intro is a 5.5 MB video,
a 5 MB WebGL model and three.js, none of which survive a single-file snapshot, so the file shows the
moment the intro lands on instead of the twelve seconds that get there.

Regenerate it against a running dev server with `design/brain/qa/../..` — the script lives in the
session scratch, so if it is gone: open the page in the debug browser, skip the intro, capture the
hero region as a PNG, then serialise `document.documentElement` with stylesheets inlined and the
`[data-brain-home]` section swapped for that image.

Everything else on the page is real, editable HTML.
