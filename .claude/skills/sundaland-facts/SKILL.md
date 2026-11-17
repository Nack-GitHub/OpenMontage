---
name: sundaland-facts
description: Produce a long-form (8–10 min, 16:9) "N Facts About <Country/Place/Topic> That Sound Fake" countdown video for The Sundaland channel (Economy Geography) — satellite-map animation, real footage/photos, ElevenLabs TTS (voice Brian); format spec in FORMAT.md, code in template/. Use when the user types /sundaland-facts <topic> or asks for another clip in the channel's facts format.
---

# /sundaland-facts — The Sundaland countdown format

**The format is defined in this skill, not in any past project:**
- [`FORMAT.md`](FORMAT.md) — the full look/structure/sound spec (identity, palette, shot grammar, map language,
  signature sequences, end card, thumbnail). Read it before the proposal.
- `template/` — the working code: all `.tsx`, builders, `stills.mjs`/`thumbs.mjs`, narration + globe scripts,
  SFX wavs, logos (`template/public/`), projection + globe textures (`template/assets/`).
**Reuse the template; only the topic, facts, assets and map coordinates change.** Past projects under `projects/`
(gitignored, may be absent) are optional extra reference only — never required, never cited as the source of truth.
New project: `python -c "from lib.checkpoint import init_project; init_project('<slug>', title='<Title>', pipeline_type='animated-explainer')"`,
copy `template/*` into `projects/<slug>/`, put logos/SFX into `public/`, then regenerate `mapData.ts`, basemaps and `timeline.ts` for the new country.

Usage: `/sundaland-facts <topic> [count=20] [minutes=8-10]` — e.g. `/sundaland-facts Vietnam`, `/sundaland-facts Malaysia 15`.

---

## 0. Ground rules (decided with the user — do not re-ask)

- **Reply to the user in Thai.** Narration language: **English** (ask only if the topic is Thai-domestic).
- **Channel:** The Sundaland · tagline under the logo **ECONOMY GEOGRAPHY** · outro line "That's the geography behind the economy. This is The Sundaland."
- **Lens:** trade · geography · economy. **No unresolved/ongoing disputes (borders, territory), no domestic politics, no drug-trade angles.**
- **Cost policy:** the only paid service is **narration TTS = ElevenLabs `elevenlabs_tts`, voice Brian (`nPczCjzI2devNBz1zQrb`), model `eleven_multilingual_v2`** (key `ELEVENLABS_API_KEY` in `.env`; the key is scoped to text-to-speech only, so `/v1/voices` and `/v1/models` return 401 — that is expected, not a broken key). Use no other ElevenLabs product (music, SFX, soundtrack) without asking. Google TTS Chirp3-HD *Orus* @0.98 is the **fallback only** if ElevenLabs fails or runs out of quota — say so before switching. **Do NOT call Veo, Imagen, Lyria, Gemini TTS** (they bill the Google account). Everything else must be free: Pixabay video/music (key in `.env`), Wikimedia Commons, NASA GIBS, geoBoundaries, Natural Earth. Pexels is unavailable.
- **Pipeline:** `animated-explainer`, **Remotion atelier**, renderer_family documentary-montage. The template is Remotion, so Remotion is the format runtime. Check preflight once: if HyperFrames is available, mention it in one line with the recommendation to stay on Remotion (rebuilding the look in HTML is not worth it) and log both in `render_runtime_selection`; if unavailable, say so and log it. Don't turn it into a separate question.
- **Approval gates (stop and wait each time):** proposal/plan → script → scene plan → assets (stills contact sheet) → full render review → thumbnail pick → publish pack. Skip the 15-s sample unless the user asks — the look is already approved (reuse it).
- **Disk:** check free space before renders (`df -h` on macOS/Linux, `Get-PSDrive` on Windows); a full render needs ~5–10 GB headroom. Delete raw renders after loudnorm; offer to delete old versions; never sweep the temp dir yourself — tell the user to clear `remotion-webpack-bundle-*` from it.
- **Windows:** activate `.venv` (`.\.venv\Scripts\Activate.ps1`) so `piper`/`ffmpeg` resolve; scripts copied from the template may contain macOS paths — fix them to project-relative paths when copying.

## 1. Research & script (fast)

1. 2–4 parallel `WebSearch` batches to verify every fact; prefer primary/major sources (government stats, Bangkok Post-tier press, research houses, USDA/OEC/IOTC, Wikipedia for geography). Hedge where sources disagree ("about", "has ranked", "among the top two") and drop claims that can't be verified.
2. Pick **N facts** in 3 acts: **The Land → The Water → The Money**, finale **#1 tied to Sundaland/the region** when possible. Each fact: `Number N. <Title>.` + setup ("you'd assume…") + the number + twist + why it matters for trade/economy.
3. Length: ~1,250–1,300 words ≈ 8.3 min speech at **~160 wpm** (estimate for ElevenLabs Brian @ speed 1.0 — re-measure on the approved sample and update `WPM` in `_build_script.py`) → ~9 min with title beats/sting/end card.
4. Build `artifacts/script.json` with the same builder pattern (`template/artifacts/_build_script.py`): voice_performance, delivery_cues, pronunciation guides, enhancement cues. Write `script_locked.md` for the user.

## 2. Scene plan

Copy the shot grammar from `artifacts/_build_scene_plan.py` / `_build_timeline.py`:
- every fact opens with the **amber numeral title card** (over footage or a real photo);
- then **map beat(s)** + **real footage/photo** + **animated data viz** (never a static bar chart);
- non-local generic footage gets the **ILLUSTRATIVE FOOTAGE** tag; every photo/footage gets an on-screen credit.

## 3. Assets (all free except TTS)

| Need | How |
|---|---|
| Narration | ElevenLabs `elevenlabs_tts`, voice **Brian** (`nPczCjzI2devNBz1zQrb`), model `eleven_multilingual_v2`, stability 0.5, similarity 0.75, style 0, speed 1.0, fixed `seed` per section, `previous_text`/`next_text` set to the neighbouring sentences so prosody flows; **per sentence**, silences inserted (0.25 s after "Number N.", 0.7 s after title, 0.3 s between) — `assets/narration/make_narration.py`. Verify names with whisper. |
| Footage | Pixabay API search → contact sheets → pick → download, trim to ≤12 s, 1080p, `-an` (see footage step in the reference session). |
| Real photos of specific places | Wikimedia Commons API; accept only CC BY / BY-SA / CC0 / PD / FAL; record artist+license+page; **rate-limited → sequential with backoff**, verify JPEG (not HTML). |
| Music | Tracks the user drops into `music_library/` (YouTube Audio Library) are safest. **Pixabay Music is allowed but every track must pass the Content ID screen:** (1) the track's Pixabay page must not carry a Content ID / registered flag; (2) search the exact title + artist on YouTube Music/Spotify/Apple — if it is distributed to streaming (DistroKid, Elite Alliance, etc.) or exists under another name, reject it; (3) reject artists with known claims — AvelineMusic ("Documentary Ambient" → claimed as "Quiet Field Notes"/MarloweMusic via Elite Alliance Music) and NastelBom ("Emotional Cinematic" → "Epic Emotional Cinematic"); (4) prefer artists whose profile says no Content ID; (5) record the screen result per track in `assets/music_provenance.json`; (6) the user uploads **Private** first so YouTube's pre-publish copyright check runs, and keeps the Pixabay licence certificate (needs their login) for disputes. No screen can guarantee zero claims — say so. One track per act, loudnorm each to −18 LUFS. |
| SFX | Synthesized with ffmpeg in `public/sfx/` (whoosh, pop, tick, impact, click, bell) — copy them. |
| Basemaps | NASA GIBS WMS `BlueMarble_ShadedRelief_Bathymetry` at 3 levels (country / region / world `earth_8k.jpg`) aligned to the project projection (`assets/brand/proj.json` pattern). |
| Boundaries | geoBoundaries ADM0 + ADM1 (CC BY 4.0), Natural Earth 50m countries + 10m rivers (PD) → `mapData.ts`. |
| Globe | `assets/globe/render_globe.py in 48` and `out <frames>` (clouds: Solar System Scope CC BY 4.0) — change the target country/route. |

## 4. The look — summary (full spec in [`FORMAT.md`](FORMAT.md))

- **Cold open:** real aerial footage → whip-blur into **spinning cloudy globe** → zoom → seamless hand-off to flat satellite map → **flag-filled country silhouette pops** → zoom to the hook location → dashed line **ticks white with ray burst** → big amber number.
- **Logo sting** after the tease: white mark rotates in, wordmark wipes, ECONOMY GEOGRAPHY.
- **Map language:** satellite basemap, whip-zoom motion blur, bold-italic white labels with leader lines, provinces pop in solid colour (**amber = subject, teal = context**), **red pin ticks** with ray burst, territory tint + white border so borders read on satellite.
- **Ship routes:** **camera follows an oblique-3D container ship** (hull walls, stacked container boxes, white bridge tower, foam wake; orange trail ends well behind the stern — never a "rocket"), then releases to a wide reveal.
- **Pointing at another country:** whip-zoom, the **country pops as a big solid silhouette with shadow** (like Japan in Malacca), pin burst, count-up number.
- **Every pointing line carries cargo** (durian / fish in / cans out / pickups / containers) with comet head, flow dashes, arrival burst. Plain arcs were rejected.
- **Data beats are animated scenes** (e.g. sinking-city cross-section with year counter, pile driver, latex beaker + share ring, durian race). Bar charts were rejected.
- **Outro:** pull back to the cloudy globe with the route drawn on it → **white pill logo "The Sundaland" types in** at "This is The Sundaland" → **end card 8 s**: big logo + tagline, channel card, **cursor clicks SUBSCRIBE → ✓ SUBSCRIBED → clicks bell (rings, red dot)** with click/bell SFX, dashed **WATCH NEXT** slot for YouTube end-screen.
- Watermark: white logo bottom-right (hidden during sting/end card). Palette: ink #0B1530, navy #1F2A6B → teal #21807F, paper #F2EFE6, amber #E9A23B. Fonts: Fraunces 600 / Manrope / IBM Plex Mono.

**Code to reuse (copy `template/`, then edit data):** `parts.tsx` (atoms, Basemap, FlagSilhouette, MapLabel, PinTick, DashLine, ColdOpen, Sting, FactTitle), `scenes.tsx` (MapScene data-driven, Footage/Photo/Title scenes, EndCard), `fx.tsx` (Ship3D oblique, followCam, RouteFX, FlowArc + icons, CountryPop, IconBurst, CountUp, viz scenes, GlobeOutro), `Thumb.tsx`, `artifacts/_build_timeline.py` (timeline from real narration timing; scene specs per section), `artifacts/stills.mjs` (one bundle → many stills). Stage with `VideoCompose()._stage_atelier_project(...)`, render with `artifacts/_render_final.py`.

## 5. Review loop (before asking the user)

- Render **one still per scene** (`stills.mjs`, scale 0.4–0.5) → contact sheets → fix overlaps, off-screen labels, text over subjects, wrong geography (use real river/coast data, not hand-drawn lines).
- Time every beat to **sentence timestamps** from `narration_timing.json` (pins/pops land on the spoken word).
- Full render ~16–17 min (background). Then `loudnorm I=-14 TP=-1`, `blackdetect`, `silencedetect`, 12–24 frame spot check, delete the raw file.

## 6. Thumbnail & publish

- Render **3 thumbnail variants** with `Thumb.tsx` (1280×720 JPG): ≤4 huge words + one focal map subject + small brand mark; check at feed size. User picked the "SOUNDS FAKE + flag map + 11 KM bubble" style last time — offer that style first.
- Publish pack via `export_bundle` → `exports/`: title ≤60 chars, description <5,000 chars (first line = hook; chapters; selected sources; full credits incl. CC BY/BY-SA photo authors+licence+link, NASA/geoBoundaries/Natural Earth/Solar System Scope, Pixabay users & tracks), 10–12 tags, 3–5 hashtags. **Chapters ≥10 s each** (merge act cards into the next fact). **export_bundle appends a duplicate chapter list — rewrite `description.txt` from the metadata.** Replace the copied video with a hard link. **Never upload** — the user uploads (Private first).

## 7. Logging

Keep the pipeline honest: checkpoints for research → publish via `lib.checkpoint.write_checkpoint` (schemas are strict: no extra fields), decision_log entries for runtime, composition mode, visual sources, voice, music, approvals, and any style override.
