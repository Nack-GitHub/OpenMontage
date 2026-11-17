# Gemini (Nano Banana) prompts — The Sundaland doodle cast

Generate in the **Gemini app** (manual, by the user). Do not call the Gemini/Imagen API from the agent:
it bills the same Google account as TTS, and the channel's cost rule allows TTS only.

**Always attach the style reference** (`template/examples/style-reference-sheet.jpg`, or the latest approved
sheet) to every request and say "same character and drawing style as the attached image". This keeps
the orange, the head size and the line weight consistent between episodes.

---

## 0 · Style lock (paste at the start of every prompt)

```
Same character and exact drawing style as the attached image: a hand-drawn doodle stick figure.
Big round white head with a thick, slightly uneven black marker outline, no hair, no ears,
simple face (arc or dot eyes, simple mouth). Body is a small rounded-rectangle tunic coloured
with loose orange crayon scribbles that slightly spill past the lines. Thin black stick arms
and legs, round white mitten hands, small white oval feet. Pure white background, no shadows,
no scenery, no frame, no text unless I ask for it.
```

## A · Pose sheet for an episode (sprite poses — the everyday workhorse)

```
[STYLE LOCK]
Draw 6 poses of this character in ONE horizontal row, evenly spaced, with wide white gaps
between figures (nothing touching or overlapping between poses), every figure full body,
same height and proportions, feet on the same baseline.
Poses, left to right:
1. pointing up at something with a big smile
2. holding a small cargo container box with both hands
3. shocked, hands on cheeks, small spark marks above the head
4. thinking, hand on chin, a question mark above the head
5. thumbs up, winking
6. walking to the right, mid-stride
Wide image, high resolution.
```
Rules: **max 6–8 poses per image** (more = smaller figures = blurry when cut out). Props that belong to a pose
(box, umbrella, laptop) must touch the figure; floating marks (♪, zzz, ?, sparks) are fine — the cutter keeps
them with the nearest figure, and `overrides.json` fixes any that land on the wrong one.

## B · Rig pose for mocap (AnimatedDrawings) — one per character

```
[STYLE LOCK]
ONE figure only, full body, front facing, centred, large in the frame.
A-pose: both arms held out diagonally down-and-away from the body, elbows slightly bent,
hands well away from the head and torso; legs apart, knees slightly bent, feet pointing outward.
Nothing touching the head. No props, no marks, no music notes. Happy open-mouth smile.
Plain white background. Square image, high resolution.
```
Why: the auto-warp needs **limbs separated from the body and from the head**. Arms raised beside the head
make the head squash when the arms move (fixable, see SKILL.md, but avoid it at the source).

## C · Props sheet (same style, for the story)

```
Same hand-drawn doodle style as the attached image (thick black marker lines, loose orange and
light-blue crayon scribble colouring, white background). Draw these objects in one row, evenly
spaced with wide white gaps, no text: a small cargo ship, a shipping container, a globe on a stand,
a gold coin, a map pin, a rubber-tree leaf, a durian. Wide image, high resolution.
```

## D · Second character (a cast member — different colour, same world)

```
[STYLE LOCK] but the tunic is coloured with light-blue crayon scribbles instead of orange,
and the character wears round glasses. [then the pose list or the rig pose]
```

---

## Output checklist (reject and regenerate if any fails)
- [ ] same orange, same head size, same line weight as the reference
- [ ] white gaps between every figure; no figure touching another
- [ ] pure white background (no grey paper texture, no vignette)
- [ ] no unwanted text / watermark / signature
- [ ] for the rig pose: one figure, arms clear of head and torso, legs apart
- [ ] the longest side is at least 2000 px (bigger = sharper sprites)

Save the image to `projects/<slug>/source/` (e.g. `poses-ep1.png`, `rig-host.png`).
