# SOF — Claude Signal restoration with the movable 3D brain

## Current direction

The latest user instruction restores the website and animation from `SOF Home A - Signal.dc.html`, the original imported Claude Design export containing the brain. This supersedes the dark split hero and modal startup introduced during the concept work. The actual anatomical 3D model and its interaction remain. The imported exports, assets, concept images, and original plan are preserved.

The restored homepage includes the 72px dropdown header, sticky 230vh brain stage, immersive synapse formation and catalyst labels, typed SOF wordmark, dark-to-light paper field, scroll transition into five-region exploration, editorial headline, catalyst ticker, four-step investment rail with cubes, leadership feature, and analyst call to action. The shared header/footer use the original visual direction. Existing About, Team, and Program content remains on native routes; the restored Process menu targets real work/week/growth/apply anchors.

The same Three.js canvas forms and becomes the interactive brain. It uses the original logical timeline at 0.85 speed: immersive network/pullback through 7.4 seconds, SOF typing around 8.1–9.2, and the light transition at 9.6–10.6. The 3D anatomy needs different projection and network-density values from the original 2D canvas; it is an adaptation of that animation to the new model, not the original renderer. Scrolling during formation skips into exploration. Replay resets the model and returns to the top; Skip is available during startup. Reduced motion skips the opening and uses discrete scroll states.

## Preview and interaction

Local production preview: http://127.0.0.1:3001

- Scroll to center/enlarge the brain and expose its five section pins.
- Drag horizontally to orbit on touch; vertical swipes scroll the landing page. Two fingers pinch to zoom. Mouse dragging rotates freely.
- Shift + wheel zooms the brain; ordinary wheel scrolls the page. Browser Ctrl/Meta zoom remains available.
- Select a region, then use Explore to open its destination. Pins are direct section links and highlight the matching anatomy.
- Zoom buttons and Reset are available in exploration. Tab to the canvas and use arrows or +/− for keyboard control.
- Explore the fund moves directly to the editorial section. The original Scroll cue remains at rest.
- Without WebGL or a successful model download, the fallback and five direct links remain. Without JavaScript, the header exposes ordinary navigation links and editorial content stays visible.

## Source and provenance

Visual authority: [original Claude Signal export](../../SOF%20Home%20A%20-%20Signal.dc.html). Reference capture: [original landing](qa/claude-signal-original.png).

The model, preparation script, and attribution are unchanged: anatomical geometry from Z-Anatomy/BodyParts3D via the pinned brainproject source, adapted into five SOF regions under CC BY-SA 4.0. The page links [model credits](../../public/brain/attribution.txt). Details, hashes, geometry counts, and prior measurements remain in [3D implementation history](README-3d-history.md), [2D history](README-2d-history.md), and `source/model-provenance.json`.

Plan history: [brain design and integration](../../docs/plans/2026-09-05-1124-feat-brain-design-integration-plan.md). Current user instructions supersede its older renderer and presentation constraints. Visual acceptance is the user's decision; automated checks do not grant it. No commit, push, PR, or deployment is part of this local iteration.

## Verification

The restoration has its own browser suite, `qa/verify-signal.mjs`; older modal/docking assertions in `qa/verify-3d.mjs` are historical and no longer describe the requested interface. Fresh results are written to `qa/signal-browser-results.json`. Browser checks run serially against local Chromium on port 9223.

Production builds run in `%TEMP%/sof-brain-build-20260905` using the canonical node_modules junction and copied source/public files. This avoids the known OneDrive reparse-point output deletion error and Windows Turbopack panic without loosening the application security policy. Use `npm.cmd run build -- --webpack`, then `npm.cmd run start -- --hostname 127.0.0.1 --port 3001` in that directory.

Simplification: the reuse, quality, and efficiency reviews completed. The efficiency role reused an idle reviewer after the agent thread limit prevented another spawn. Applied canonical fund/CIO data, corrected section anchors, removed the superseded docking phase, cached the header DOM reference, avoided animation-time layout reads at static endpoints, and reused the seed vector. Kept the tiny local smoothstep helper to preserve asynchronous loading of Three.js; React already bails out unchanged primitive state, and a five-item region lookup did not justify a separate map. Additional review fixes cover mobile scrolling, menu closure, no-script navigation, reduced motion, hidden field work, and interrupted signal-label cleanup.

Final restoration verification: production Webpack build and TypeScript passed. Application ESLint has zero errors and one existing unused-variable warning in `src/lib/seo.ts`. All 44 Signal browser assertions passed, including native mobile swipe/orbit/pinch, five anatomical raycast targets, real section navigation, same-canvas formation, light/typing/scroll sequence, Replay/Skip, menu closure, investment-rail progression and reversal, model/WebGL failures, and no-JavaScript navigation. [Browser results](qa/signal-browser-results.json).

Independent code review completed with no remaining actionable findings: `signal-20260905-194359`, [receipt](qa/signal-code-review.json). Its pipeline-progression coverage note was closed by the final browser run; direct Process dropdown link activation was not separately exercised, while its exact destination anchors were verified. This is a code receipt, not user visual approval.

All 64 source, brain asset, and package files SHA-256 match the running preview: [equivalence](qa/signal-preview-equivalence.json). Current captures: [landing](qa/signal-rest.png), [brain exploration](qa/signal-explore.png), [headline](qa/signal-headline.png), [investment rail](qa/signal-process.png), [mobile](qa/signal-3d-mobile.png), and [early synapses](qa/signal-formation-3s.png). Physical-device and deployed performance have not been measured in this local iteration.
