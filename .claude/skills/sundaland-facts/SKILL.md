---
name: sundaland-facts
description: Produce a long-form (8–10 min, 16:9) "N Facts About <Country/Place> That Sound Fake" video for The Sundaland channel (Economy Geography) — countdown documentary with Malacca-style satellite map animation, real footage/photos, Google TTS only. Use when the user types /sundaland-facts <topic> or asks for "another clip in the Thailand-facts format".
---

# /sundaland-facts — The Sundaland countdown format

Reference production: `projects/thailand-sounds-fake/` ("20 Facts About Thailand That Sound Fake (But Aren't)", 9:02, approved v3).
**Reuse its code and pipeline; only the topic, facts, assets and map coordinates change.**
If that project folder is gone (`projects/` is gitignored), start from the snapshot in this skill's `template/`
(all `.tsx`, builders, `stills.mjs`/`thumbs.mjs`, narration + globe scripts, SFX wavs, cropped logos).
New project: `python -c "from lib.checkpoint import init_project; init_project('<slug>', title='<Title>', pipeline_type='animated-explainer')"`,
copy `template/*` into `projects/<slug>/`, put logos/SFX into `public/`, then regenerate `mapData.ts`, basemaps and `timeline.ts` for the new country.

Usage: `/sundaland-facts <topic> [count=20] [minutes=8-10]` — e.g. `/sundaland-facts Vietnam`, `/sundaland-facts Malaysia 15`.

---

## 0. Ground rules (decided with the user — do not re-ask)

- **Reply to the user in Thai.** Narration language: **English** (ask only if the topic is Thai-domestic).
- **Channel:** The Sundaland · tagline under the logo **ECONOMY GEOGRAPHY** · outro line "That's the geography behind the economy. This is The Sundaland."
- **Lens:** trade · geography · economy. **No unresolved/ongoing disputes (borders, territory), no domestic politics, no drug-trade angles.**
- **Cost policy:** Google credentials are for **TTS only** (Chirp3-HD). **Do NOT call Veo, Imagen, Lyria, Gemini TTS** (they bill the same Google account). Everything else must be free: Pixabay video/music (key in `.env`), Wikimedia Commons, NASA GIBS, geoBoundaries, Natural Earth. Pexels is unavailable.
- **Pipeline:** `animated-explainer`, **Remotion atelier**, renderer_family documentary-montage. HyperFrames is broken on this machine — say so once, log it, don't ask.
- **Approval gates (stop and wait each time):** proposal/plan → script → scene plan → assets (stills contact sheet) → full render review → thumbnail pick → publish pack. Skip the 15-s sample unless the user asks — the look is already approved (reuse it).
- **Disk is tight (~7–9 GB free).** Check `df -h` before renders; delete raw renders after loudnorm; offer to delete old versions; never sweep `$TMPDIR` yourself (user runs `rm -rf "$TMPDIR"/remotion-webpack-bundle-*`).

## 1. Research & script (fast)

1. 2–4 parallel `WebSearch` batches to verify every fact; prefer primary/major sources (government stats, Bangkok Post-tier press, research houses, USDA/OEC/IOTC, Wikipedia for geography). Hedge where sources disagree ("about", "has ranked", "among the top two") and drop claims that can't be verified.
2. Pick **N facts** in 3 acts: **The Land → The Water → The Money**, finale **#1 tied to Sundaland/the region** when possible. Each fact: `Number N. <Title>.` + setup ("you'd assume…") + the number + twist + why it matters for trade/economy.
3. Length: ~1,250–1,300 words ≈ 8.3 min speech at **166 wpm** (measured for Chirp3-HD *Orus* @0.98) → ~9 min with title beats/sting/end card.
4. Build `artifacts/script.json` with the same builder pattern (`projects/thailand-sounds-fake/artifacts/_build_script.py`): voice_performance, delivery_cues, pronunciation guides, enhancement cues. Write `script_locked.md` for the user.

## 2. Scene plan

Copy the shot grammar from `artifacts/_build_scene_plan.py` / `_build_timeline.py`:
- every fact opens with the **amber numeral title card** (over footage or a real photo);
- then **map beat(s)** + **real footage/photo** + **animated data viz** (never a static bar chart);
- non-local generic footage gets the **ILLUSTRATIVE FOOTAGE** tag; every photo/footage gets an on-screen credit.

## 3. Assets (all free except TTS)

| Need | How |
|---|---|
| Narration | `google_tts` voice `en-US-Chirp3-HD-Orus`, rate 0.98, **per sentence**, silences inserted (0.25 s after "Number N.", 0.7 s after title, 0.3 s between) — `assets/narration/make_narration.py`. Verify names with whisper. |
| Footage | Pixabay API search → contact sheets → pick → download, trim to ≤12 s, 1080p, `-an` (see footage step in the reference session). |
| Real photos of specific places | Wikimedia Commons API; accept only CC BY / BY-SA / CC0 / PD / FAL; record artist+license+page; **rate-limited → sequential with backoff**, verify JPEG (not HTML). |
| Music | **Prefer tracks the user drops into `music_library/` from YouTube Audio Library (Content-ID safe).** Pixabay Music is a fallback only: on the Thailand video two Pixabay tracks got Content ID claims on upload ("Documentary Ambient"/AvelineMusic → claimed as "Quiet Field Notes"/MarloweMusic via Elite Alliance Music; "Emotional Cinematic"/NastelBom → "Epic Emotional Cinematic"). Never reuse those two. One track per act, loudnorm each to −18 LUFS. |
| SFX | Synthesized with ffmpeg in `public/sfx/` (whoosh, pop, tick, impact, click, bell) — copy them. |
| Basemaps | NASA GIBS WMS `BlueMarble_ShadedRelief_Bathymetry` at 3 levels (country / region / world `earth_8k.jpg`) aligned to the project projection (`assets/brand/proj.json` pattern). |
| Boundaries | geoBoundaries ADM0 + ADM1 (CC BY 4.0), Natural Earth 50m countries + 10m rivers (PD) → `mapData.ts`. |
| Globe | `assets/globe/render_globe.py in 48` and `out <frames>` (clouds: Solar System Scope CC BY 4.0) — change the target country/route. |

## 4. The look — MUST match the user's Malacca piece

(`/Users/nack/MyProjects/studio/content/2026-11-05_malacca-om/renders/final.en-US.9x16.mp4`)
- **Cold open:** real aerial footage → whip-blur into **spinning cloudy globe** → zoom → seamless hand-off to flat satellite map → **flag-filled country silhouette pops** → zoom to the hook location → dashed line **ticks white with ray burst** → big amber number.
- **Logo sting** after the tease: white mark rotates in, wordmark wipes, ECONOMY GEOGRAPHY.
- **Map language:** satellite basemap, whip-zoom motion blur, bold-italic white labels with leader lines, provinces pop in solid colour (**amber = subject, teal = context**), **red pin ticks** with ray burst, territory tint + white border so borders read on satellite.
- **Ship routes:** **camera follows an oblique-3D container ship** (hull walls, stacked container boxes, white bridge tower, foam wake; orange trail ends well behind the stern — never a "rocket"), then releases to a wide reveal.
- **Pointing at another country:** whip-zoom, the **country pops as a big solid silhouette with shadow** (like Japan in Malacca), pin burst, count-up number.
- **Every pointing line carries cargo** (durian / fish in / cans out / pickups / containers) with comet head, flow dashes, arrival burst. Plain arcs were rejected.
- **Data beats are animated scenes** (e.g. sinking-city cross-section with year counter, pile driver, latex beaker + share ring, durian race). Bar charts were rejected.
- **Outro:** pull back to the cloudy globe with the route drawn on it → **white pill logo "The Sundaland" types in** at "This is The Sundaland" → **end card 8 s**: big logo + tagline, channel card, **cursor clicks SUBSCRIBE → ✓ SUBSCRIBED → clicks bell (rings, red dot)** with click/bell SFX, dashed **WATCH NEXT** slot for YouTube end-screen.
- Watermark: white logo bottom-right (hidden during sting/end card). Palette: ink #0B1530, navy #1F2A6B → teal #21807F, paper #F2EFE6, amber #E9A23B. Fonts: Fraunces 600 / Manrope / IBM Plex Mono.

**Code to reuse (copy the project folder, then edit data):** `parts.tsx` (atoms, Basemap, FlagSilhouette, MapLabel, PinTick, DashLine, ColdOpen, Sting, FactTitle), `scenes.tsx` (MapScene data-driven, Footage/Photo/Title scenes, EndCard), `fx.tsx` (Ship3D oblique, followCam, RouteFX, FlowArc + icons, CountryPop, IconBurst, CountUp, viz scenes, GlobeOutro), `Thumb.tsx`, `artifacts/_build_timeline.py` (timeline from real narration timing; scene specs per section), `artifacts/stills.mjs` (one bundle → many stills). Stage with `VideoCompose()._stage_atelier_project(...)`, render with `artifacts/_render_final.py`.

## 5. Review loop (before asking the user)

- Render **one still per scene** (`stills.mjs`, scale 0.4–0.5) → contact sheets → fix overlaps, off-screen labels, text over subjects, wrong geography (use real river/coast data, not hand-drawn lines).
- Time every beat to **sentence timestamps** from `narration_timing.json` (pins/pops land on the spoken word).
- Full render ~16–17 min (background). Then `loudnorm I=-14 TP=-1`, `blackdetect`, `silencedetect`, 12–24 frame spot check, delete the raw file.

## 6. Thumbnail & publish

- Render **3 thumbnail variants** with `Thumb.tsx` (1280×720 JPG): ≤4 huge words + one focal map subject + small brand mark; check at feed size. User picked the "SOUNDS FAKE + flag map + 11 KM bubble" style last time — offer that style first.
- Publish pack via `export_bundle` → `exports/`: title ≤60 chars, description <5,000 chars (first line = hook; chapters; selected sources; full credits incl. CC BY/BY-SA photo authors+licence+link, NASA/geoBoundaries/Natural Earth/Solar System Scope, Pixabay users & tracks), 10–12 tags, 3–5 hashtags. **Chapters ≥10 s each** (merge act cards into the next fact). **export_bundle appends a duplicate chapter list — rewrite `description.txt` from the metadata.** Replace the copied video with a hard link. **Never upload** — the user uploads (Private first).

## 7. Logging

Keep the pipeline honest: checkpoints for research → publish via `lib.checkpoint.write_checkpoint` (schemas are strict: no extra fields), decision_log entries for runtime, composition mode, visual sources, voice, music, approvals, and any style override.
