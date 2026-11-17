---
name: sundaland-story
description: Produce a long-form (9–11 min, 16:9) narrative history episode for The Sundaland channel — one Sundaland/SEA event told minute by minute in 3 acts and re-framed through economy geography ("X started here, not Y"), mixing the channel's satellite maps and HUD panels with Gemini-drawn doodle inserts, 3D aircraft on air routes, and 2–4 ElevenLabs character voices next to narrator Brian. Format spec in FORMAT.md, code in template/. Use when the user types /sundaland-story <event> or asks for another episode like the Kota Bharu 1941 one.
---

# /sundaland-story — The Sundaland story format

> **Channel hub:** this is one format of The Sundaland. Channel-wide constants and the format registry/rotation live in [`../sundaland/`](../sundaland/SKILL.md) (`CHANNEL.md`, `FORMATS.md`).

**The format lives in this skill, not in any past project:**
- [`FORMAT.md`](FORMAT.md) — topic rules, story structure, shot grammar, map additions, doodle modes, sound, thumbnail.
- `template/` — working code (all `.tsx`, builders, doodle generator, narration, basemaps, globe, stills/thumbs,
  SFX, logos, the reusable host cast, Gemini style sheet).
- [`examples/kota-bharu-1941/`](examples/kota-bharu-1941/) — the locked script, scene plan, doodle beat sheet,
  Gemini prompts, description/metadata and the winning thumbnail of episode 1.
- Shared channel rules come from `/sundaland-facts` (map language, HUD language, end card, cost policy) and the
  cut-out tools from `/sundaland-doodle` (`template/tools/cut_poses.py`). Read those skills' relevant sections; do
  not depend on files under `projects/` (gitignored, may be absent).

Usage: `/sundaland-story <event or idea> [minutes=10]` — e.g. `/sundaland-story "Palembang oil raid 1942"`,
`/sundaland-story <YouTube link>` (adapt a reference video's story to a regional event).

---

## 0. Ground rules (decided with the user — do not re-ask)

- **Reply in Thai.** Narration and character lines in **English**.
- **Cost:** the only paid service is ElevenLabs TTS (narrator Brian `nPczCjzI2devNBz1zQrb`, model
  `eleven_multilingual_v2`; character voices in FORMAT §2). The key is TTS-scoped — `/v1/voices` returning 401 is
  expected. **Call ElevenLabs sequentially** (parallel calls returned 401). Google TTS Chirp3-HD only as fallback,
  announced first. **Never call Gemini/Imagen/Veo/Lyria APIs** — the user draws all art in the Gemini app.
- **Never draw the doodle cast procedurally.** Gemini art → cut-outs → pose-swap animation.
- Region only, no unresolved disputes / domestic politics / drugs; no invented quotes for named people.
- **Never upload.** The user uploads Private first. **Never sweep %TEMP%** — tell the user to delete old
  `remotion-webpack-bundle-*` folders.
- **Disk (Windows):** C: fills up. Before every full Remotion render set
  `TEMP/TMP/TMPDIR=D:\MyProject\OpenMontage\.tmp\remotion-tmp` in the same shell. Keep ≥10 GB free on the render drive.
- **Python:** use `.venv/Scripts/python.exe -I -X utf8` (system Python lacks PIL; `-X utf8` because `-I` ignores
  PYTHONIOENCODING).
- **Runtimes:** Remotion (atelier) for the episode; HyperFrames for the doodle inserts (rendered once, split into
  `public/doodles/Dxx.mp4`). Log both in `render_runtime_selection`.
- **Gates (stop and wait):** proposal (3 concepts) → voice audition → script → scene plan + Gemini prompt list →
  (user draws) → cut-out check + doodle contact sheet → stills contact sheet → full render → thumbnail → publish pack.
  If the user says "finish it, I'll review in the morning", run the remaining gates yourself and leave a
  `NEXT_STEPS.md` review guide.

## 1. New project

```bash
.venv/Scripts/python.exe -I -X utf8 -c "from lib.checkpoint import init_project; init_project('<slug>', title='<Title>', pipeline_type='animated-explainer')"
cp -r .claude/skills/sundaland-story/template/* projects/<slug>/
mkdir -p projects/<slug>/poses/host && cp .claude/skills/sundaland-story/template/cast/host/* projects/<slug>/poses/host/
```
Rename the composition id in `Root.tsx` (and `COMP_ID` default in `artifacts/stills.mjs`/`thumbs.mjs`).
Every builder under `artifacts/` still holds episode-1 data as a worked example — **rewrite the data blocks**, keep
the code. `kb.tsx` holds the episode-specific HUD variants (`KBHud` `v:` oil80, gauge, callback, calendar, prize,
casualties, day70) and the cold open — rewrite them per episode in the same HUD style.

## 2. Research → proposal

1. If the user gives a reference video: get the transcript (`TranscriptFetcher`, English track; `yt-dlp
   --js-runtimes node` for segments) and extract its story beats; `video_analyzer` refuses >~15 min videos.
2. 2–4 parallel WebSearch batches; ≥15 data points with sources in `artifacts/_build_research.py` →
   `research_brief.json`. Mark where sources disagree.
3. `_build_proposal.py` → `proposal_packet.json` with **3 concepts** (schema needs ≥3), each with the re-framing
   hook, act outline, doodle use, risks. Recommend one. Approve with `_approve_proposal.py` after the user picks.

## 3. Voices → script

1. Audition: render one line per candidate character voice (Daniel/Charlie/Will/Liam) into one mp3 for the user.
2. `_build_script.py` → `script.json` + `script_locked.md`: sections per FORMAT §2, `speaker_directions` choose the
   voice, `metadata.voices`, `hedges`, `verify_before_tts`. Schema enums: pace → enum values, cue types
   photo→`broll`, hud→`stat_card`, doodle→`animation`. Explain the storytelling devices to the user when asked.
3. `assets/narration/make_narration.py` → per-section wavs + `narration_timing.json` (sentence timestamps).
   Character lines: one clip, radio/field filter. Sequential calls only.

## 4. Scene plan + Gemini prompt list

1. `_build_scene_plan.py` → `scene_plan.json/.md` + `doodle_beats.md` (Dxx id, section, sprites, motion, seconds,
   mode A/B/C, background). Target doodle share 20–25 %.
2. Write `source/GEMINI_PROMPTS_TH.md` from [`template/prompts/gemini_prompts_story.md`](template/prompts/gemini_prompts_story.md):
   one sheet per side (6 poses each), 2–3 prop sheets, 3–6 crayon backgrounds (16:9), all with
   `style-reference-sheet.jpg` attached. The host is already drawn (reuse `cast/host`) unless new host poses are needed.
3. Tell the user exactly which files to drop into `projects/<slug>/source/` and their names.

## 5. Assets

| Need | How |
|---|---|
| Cut-outs | `/sundaland-doodle` `template/tools/cut_poses.py <sheet> projects/<slug>/poses/<group> name1 name2 …` (left→right); check `_cutout-check.png`; copy to `public/sprites/` for stickers |
| Backgrounds | user's 16:9 Gemini images → `public/bg/<name>.jpg` (1920×1080, cover crop) |
| Photos | `assets/images/fetch_commons.py` (CC BY/BY-SA/CC0/PD only, backoff on 429) → `photo_credits.json` |
| Footage | `assets/video/fetch_footage.py` (Pixabay API, **browser User-Agent** or 403) → `footage_credits.json` |
| Music | YouTube Audio Library via **Claude in Chrome** (the built-in browser is blocked at accounts.google.com); save originals to `music_library/`; Pixabay only with Content-ID screen. `assets/music_provenance.json` |
| Basemaps | `assets/brand/build_basemaps.py` (region/sea/world + z12 detail crops of the event site, NASA GIBS) |
| Map data | `artifacts/_build_mapdata.py` → `mapData.ts` (geoBoundaries/Natural Earth; period territories as `SOLID_HISTORICAL`) |
| Globe | `assets/globe/render_globe.py` with `globe_cfg.json` → `public/globe_in.mp4`, `public/globe_out.mp4` |

## 6. Doodle inserts (HyperFrames)

```bash
.venv/Scripts/python.exe -I -X utf8 projects/<slug>/doodle/gen_doodles.py      # one composition, all Dxx back to back + inserts.json
cd projects/<slug>/doodle && npx --yes hyperframes lint .
npx --yes hyperframes snapshot . -o snapshots --at <t1,t2,...>                  # contact sheet before rendering
npx --yes hyperframes render . -o ../assets/video/doodles_all.mp4 -f 30
cd ../../.. && .venv/Scripts/python.exe -I -X utf8 projects/<slug>/doodle/split_inserts.py   # → public/doodles/Dxx.mp4 + contact sheet
```
- Insert bodies live in `gen_doodles.py` `B = {"Dxx": "<JS>"}` using the template helpers (`actor, popIn, popOut,
  swap, breathe, hops, jitter, shake, bubble, label, bg, hideAll`); `BG` maps inserts to backgrounds, `LINES` maps
  inserts to character-line sections (bubble text).
- `template.tmpl` must stay `.tmpl` (a second `.html` root breaks `hyperframes lint`).
- Fix one insert without re-rendering all: `npx --yes hyperframes render . -o ../assets/video/_dxx.mp4 -f 30
  --start <start> --end <start+duration>` (values from `inserts.json`), re-encode to `public/doodles/Dxx.mp4`.
- Direction check: sprites travelling right must face right (`P.idle.querySelector('img').style.transform='scaleX(-1)'`).

## 7. Edit (Remotion)

1. `artifacts/_build_timeline.py` → `timeline.ts`: shots per section with end anchors `"S<i>[+/-sec]"` (sentence i
   of that section) or `"end"`; all `at` values inside shot params may use anchors too. Map DSL keys:
   `cam [[t, lon, lat, vh_deg],…]`, `whips`, `dim`, `act`, `pins`, `labels`, `countries`, `provinces`, `routes`
   (`ship: true` for sea), `arcs` (icons), **`planes`**, **`stickers`**, **`clock`**, `counts`, `counter`, `fx`,
   `flag`, `credit`. Helpers `doodle(Dxx, mode, map=…)`, `ph(key, end, fit="contain")`, `ft(key, end)`.
2. Stage + stills (one bundle, many frames) — always look before the full render:
```bash
cp projects/<slug>/*.ts* projects/<slug>/artifacts/*.mjs remotion-composer/projects/<slug>/   # first time: VideoCompose()._stage_atelier_project(entry, composer_dir)
cd remotion-composer && export TEMP='D:\MyProject\OpenMontage\.tmp\remotion-tmp' TMP="$TEMP" TMPDIR="$TEMP"
node projects/<slug>/stills.mjs projects/<slug>/index.tsx ../projects/<slug>/public ../projects/<slug>/renders/stills 0.5 "f1,f2,..."
```
   Frame list without a trailing newline (a stray `\n` gives "Frame NaN"). "source image cannot be decoded" lines
   for big basemaps are benign.
3. Review checklist: every sea route at sea · planes head to targets, don't sit on top of each other or the pins ·
   sprites face their travel direction · portrait photos use `fit: "contain"` · labels not over subjects · clock
   panels clear of pins · period territories, not modern flags.

## 8. Render, QC, publish

```bash
cd remotion-composer && export TEMP='D:\MyProject\OpenMontage\.tmp\remotion-tmp' TMP="$TEMP" TMPDIR="$TEMP"
npx remotion render projects/<slug>/index.tsx <CompId> ../projects/<slug>/renders/final_vN_raw.mp4 --public-dir=../projects/<slug>/public --crf=18 --concurrency=6 --gl=angle
ffmpeg -i final_vN_raw.mp4 -c:v copy -af loudnorm=I=-14:TP=-1:LRA=11 -c:a aac -b:a 192k -ar 48000 -movflags +faststart final_vN.mp4
```
Run in the background (~15–25 min). QC: integrated loudness, `blackdetect`, `silencedetect d=2.5`, spot frames at
every changed beat; delete the raw. Thumbnails: `node projects/<slug>/thumbs.mjs …` → 3 JPGs. Publish pack:
`artifacts/_build_publish.py` → `exports/description.txt` + `metadata.json` (chapters asserted ≥10 s apart).
Write checkpoints (edit with `edit_decisions.bespoke.art_direction`, compose with `render_report`) and
`NEXT_STEPS.md`.

## 9. Lessons from episode 1 (do not repeat)

- Route drawn straight from Hainan to the Gulf crossed Vietnam → waypoints round the coast.
- Plane sprite faced left while flying right ("looks like it's reversing") → flip + dive at the ship.
- Portrait monument photo cropped the statue's head under cover-crop → `fit: "contain"`.
- Air routes looked like sea routes → 3D planes + dashed white contrails; two Hudsons on one path overlapped → stagger
  start times and offset paths.
- Full render died with ENOSPC on C: → temp on D:.
- ElevenLabs 401 under parallel calls → sequential. Pixabay 403 → browser User-Agent. Commons 429 → backoff.
- User asked "are the doodle scenes just white backgrounds?" → offer modes A/B/C up front (FORMAT §5).
