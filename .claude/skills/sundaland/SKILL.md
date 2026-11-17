---
name: sundaland
description: Hub for The Sundaland channel (Economy Geography) — picks or switches the video FORMAT for a topic (countdown facts, narrative story, doodle, and the pilot formats day-in-the-life / strategy-game / nature-doc parody), keeps the channel constants identical across formats, and routes to the format's own skill or spec. Use when the user types /sundaland <format?> <topic>, asks "which format fits this topic", wants to try/switch/add a format, or plans the channel's upload rotation.
---

# /sundaland — channel hub & format switcher

The channel is **one niche (trade · geography · economy of Sundaland/Asia) shown in many formats.**
A format is a swappable "skin + spine" on top of a constant channel shell. Countdown facts is the anchor format
and is never replaced; other formats rotate around it.

Files in this skill:
- [`CHANNEL.md`](CHANNEL.md): **the constant shell**, what every format must keep and what a format may change.
- [`FORMATS.md`](FORMATS.md): **the format registry** (live / pilot / idea), the topic→format fit guide and the
  upload rotation.
- `formats/<id>.md`: spec for each **pilot** format that does not have its own skill yet.
- `formats/examples/`: draft scripts written as worked examples for the pilots.

Usage:
```
/sundaland <topic>                 → recommend the best 1–2 formats for this topic (fit guide), then route
/sundaland <format-id> <topic>     → go straight to that format
/sundaland formats                 → show the registry + what's next in the rotation
/sundaland new-format <idea>       → add an idea/pilot to the registry using the template in FORMATS.md §4
```
Format ids: `facts` · `story` · `doodle` · `life` · `game` · `wild` (see FORMATS.md).

## Routing (do this first)

1. **Reply in Thai.** Read `CHANNEL.md` (short), then `FORMATS.md`.
2. If no format is given: score the topic against the fit guide (FORMATS.md §2). Give the user **the top 1–2
   formats, one line on why each fits, and one line on the rotation** (what was uploaded last). Ask which one.
   Don't start producing until they choose.
3. Route:
   - **Live format with its own skill:** follow that skill end to end:
     `facts` → `/sundaland-facts`, `story` → `/sundaland-story`, `doodle` → `/sundaland-doodle`.
   - **Pilot format:** read `formats/<id>.md`, then run the **`/sundaland-facts` production process**
     (pipeline `animated-explainer`, Remotion atelier, copy `sundaland-facts/template/`, same approval gates,
     cost policy, review loop, publish pack). The pilot spec overrides only the parts it names (spine,
     hook device, signature components, voice pacing, thumbnail rule). Log the format in the decision log as
     `playbook_override: format=<id>`.
4. Whatever the format, the **CHANNEL.md constants** apply. A format spec can never override them. Only the user
   can, and that override gets logged.

## Promoting a pilot to a live format

After a pilot episode is published and the user approves the look:
1. Create `.claude/skills/sundaland-<id>/` with `SKILL.md`, `FORMAT.md`, `template/` (the approved project's
   code minus episode data) and `examples/<episode>/` (locked script, scene plan, metadata, thumbnail).
   Follow the layout of `sundaland-story`.
2. Move any new reusable components (e.g. `VlogHUD`, `GameHUD`, `SpeciesCard`) into that template, and copy any
   that are useful channel-wide into `sundaland-facts/template/` as well.
3. In `FORMATS.md`, change the status to **live**, point it to the new skill and delete `formats/<id>.md` (keep the example).
4. Update the channel memory (`channel-the-sundaland.md`) with a single line.

## Adding a format idea

Run every idea through the **niche test** (FORMATS.md §4). If it passes, add a row to the registry as `idea`. It
becomes a `pilot` once a spec file exists in `formats/`.
