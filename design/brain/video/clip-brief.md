# Intro clip brief — fill this in

Fill in the answers under each question. Leave a line blank if you have no preference and I will use the default in brackets. Hand the whole file back and I will turn it into the model prompt, pick the model, and render a cheap proof first.

Skip nothing in section 1 or 7. Those two decide whether the clip can work at all.

---

## 1. The transformation

**1a. What is on screen in the very first frame?**
[default: pure darkness, a few faint drifting specks]

>

**1b. What appears next, and what is it made of?**
Name the material in plain words: light filaments, glass shards, liquid metal, dust, wire, smoke.

>

**1c. How does it become a brain?** This is the most important line in the brief. Describe the mechanism, not the mood. "Fibers grow outward from a single seed and knit a shell" is a mechanism. "It elegantly forms" is not.

>

**1d. Does it build from the inside out, the outside in, bottom up, or all at once?**
[default: outward from one seed near the brain stem]

>

**1e. What is the last thing to complete?**
[default: the outer surface skins over and turns solid]

>

## 2. Timing

**2a. How long is the clip?** Shorter drifts less and costs less. [default: 6 seconds]

>

**2b. Rough beats.** Say what should be happening at the start, the middle, and the end.

- Opening third:
- Middle third:
- Final third:

**2c. Should it feel slow and heavy, or quick and electric?**
[default: slow, weighty, one continuous unhurried move]

>

## 3. Camera

**3a. Does the camera move?** [default: locked, no move at all]

>

**3b. If it moves, how?** Push in, pull back, orbit, drift. Say where it ends up.

>

**3c. Framing.** [default: full brain centered, lateral view, facing left, room around it]

>

## 4. Look

**4a. Material of the finished brain.** [default: glossy dark blue metal, wet-looking highlights, faint glass translucency]

>

**4b. Lighting.** [default: cool key from upper left, soft rim, volumetric haze]

>

**4c. Color of the light in the forming stage.** [default: cold blue with warm copper accents]

>

**4d. Depth of field.** [default: shallow, background falls off]

>

**4e. Anything you want it to look like.** Name a film, a title sequence, a site, a brand. Reference beats adjectives.

>

## 5. Background

**5a. Background through the whole clip.** [default: flat near-black, the hero stage color #0b1221, nothing else in frame]

>

## 6. Mood

**6a. Three words for how it should feel.** [default: precise, inevitable, expensive]

>

**6b. What would make it feel cheap or wrong?** Say what to avoid.

>

## 7. Hard constraints

Cross out anything you disagree with. Add your own.

- No text, numbers, letters, logos, watermarks, or UI of any kind.
- No people, hands, faces, or bodies.
- No audio.
- The background never becomes a room, a lab, a desk, or a landscape.
- The brain is a single whole brain, not two hemispheres drifting apart, not a slice, not a cross-section.
- The final frame must match the supplied end image exactly, same pose, same size, same position in frame.

Your additions:

>

## 8. Practical

**8a. Where does it play?** [default: both, a 16:9 for desktop and a 9:16 for phones, same look]

>

**8b. Budget for this attempt.** You have 134 credits. A proof is about 10 to 30, a 1080p final about 20 to 40. [default: one proof, then one final per aspect ratio]

>

**8c. How many retries before we abandon the video idea again?** [default: two]

>

## 9. What makes it a pass

**9a. Besides the exact end frame, what single thing must be true for you to accept it?**

>

**9b. What went wrong with the last one, in your words?** This is worth more than any adjective above.

>

---

## Notes from me, for context while you fill this in

The last attempt failed for a specific and fixable reason. I used two models that cannot do the job. Gemini accepts an end frame but ignored it, so its last frame was a different brain. Kling honors a start frame beautifully but accepts no end frame at all, so I generated a dissolve and played it backwards. Neither gave one continuous shot, so I cross-faded the two together and that seam in the middle is the part that does not flow.

Two models on your account do support real start-and-end keyframes and neither has been tried: FLUX 3 Video, which goes to 20 seconds at 1080p, and MiniMax H3, which renders at 2K. Either one can be handed both the empty stage and the finished model render and asked to travel between them in a single shot. That is the attempt worth making.

Two things will still be true whatever we render. A ten second clip is a long time for any of these models to stay coherent, so shorter is safer. And the assembly of a specific object from particles is one of the harder motions to ask for, so section 1c matters more than every adjective in section 4.
