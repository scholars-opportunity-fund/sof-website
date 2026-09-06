# Cinematic intro clips

Keyframes are captured from the live page with `node design/brain/qa/capture-pose.mjs` (dev server on 3000, debug Chrome on 9223, development-only `?pose=formed` / `?pose=empty`). `end-*.png` is the model at its formed pose (stage timeline 9.4 s, no shift, no sway); `start-*.png` is the bare stage in `#0b1221`. Any change to the formed look re-runs the capture and diffs these files before a final is rendered.

## Renders

| Date | Purpose | Model | Settings | Keyframes | Job id | Credits | Result |
|---|---|---|---|---|---|---|---|
| 2026-09-06 | Proof clip | gemini_omni_flash_1_1, image-to-video | 16:9, 10 s, 720p | start-16x9 (efdce47a), end-16x9 (9fcf75c1) | ace22189-78b7-41ec-8c22-60b8d40555fa | 30 | rejected: last frame is a different matte brain, mean diff 23/255 vs end keyframe; opening neurons and wireframe forming are strong |
| 2026-09-06 | Landscape final, reverse trick | kling3_0_turbo, start-frame | 16:9, 10 s, 1080p, generated forward as a dissolve from end-16x9 then reversed with ffmpeg in the Higgsfield sandbox | end-16x9 (9fcf75c1) as start_image | 7b6c549c-ecb3-4313-b685-fed70787f550 | 20 | accepted as the tail: reversed, last frame diff 2.9/255; Kling kept the brain mostly intact, so the formation comes from the hybrid below |
| 2026-09-06 | Landscape final (hybrid, no render) | ffmpeg in the Higgsfield sandbox | Gemini proof scaled to 1080p, first 7 s, cross-faded (1.5 s at 5.5 s) into the last 4.5 s of the reversed Kling clip; 24 fps, crf 22, no audio, fast-start, 4.15 MB | as above | media 81a49856 | 0 | accepted: `public/brain/intro-16x9.mp4`, last frame diff 2.9/255 |
| 2026-09-06 | Portrait final, reverse trick | kling3_0_turbo, start-frame | 9:16, 10 s, 1080p, generated forward as a dissolve from end-9x16 then reversed and blended with the centre-cropped Gemini opening in the sandbox | end-9x16 (683cdc75) as start_image | eaaf6a7c-3d56-4b81-a863-3b2b137df26d | 20 | accepted as `public/brain/intro-9x16.mp4` after the same hybrid assembly (Gemini opening centre-cropped to 1080x1920, 4.16 MB), last frame diff 2.5/255 |

Balance before the proof: 204 credits. Spent: 30 (proof) + 20 + 20 (Kling reverse renders) = 70. Balance after: 134.

## Prompt (Kling reverse, landscape)

A glossy metallic dark-blue human brain seen from the side against pure black, exactly as in the first frame, camera locked and motionless. The brain slowly dissolves: its surface breaks apart into luminous blue neural fibers and synapses that unravel outward, drift apart in slow motion, and fade into darkness with tiny pulses of light along the fibers. Cinematic, photoreal, volumetric light, shallow depth of field. Background stays pure near-black throughout. Ends on darkness with only a few faint drifting fibers. No text, no logos, no people.

## Prompt (Gemini proof, rejected)

Cinematic macro shot in deep darkness. Luminous blue neural synapses and fine glowing nerve fibers emerge from black, branching and firing with tiny pulses of light, drifting together and weaving into a dense network that condenses into a glossy metallic dark-blue human brain seen from the side, matching the final frame exactly. Photoreal materials, volumetric light rays, shallow depth of field, slow camera settling to a locked side view. Background stays pure near-black throughout. No text, no logos, no people. Seamless transition into the final frame.
