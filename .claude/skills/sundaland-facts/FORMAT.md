# The Sundaland — channel format spec (self-contained)

This file **is** the format. It was extracted from the approved Thailand long-form ("20 Facts About Thailand
That Sound Fake", 9:02, v3) and the channel's Malacca Short (9:16, 62 s). Do not depend on those project
folders or files existing — everything needed to reproduce the look is described here and implemented in
`template/` (code) of this skill. If a past project happens to be on disk you may glance at it, but this spec
wins when they disagree.

---

## 1. Identity

| Item | Value |
|---|---|
| Channel | **The Sundaland** |
| Tagline (under logo) | **ECONOMY GEOGRAPHY** |
| Lens | trade · geography · economy — "the geography behind the economy" |
| Outro line (spoken) | "That's the geography behind the economy. This is The Sundaland." |
| Off-limits | unresolved/ongoing disputes (borders, territory), domestic politics, drug-trade angles |
| Narration | English, `en-US-Chirp3-HD-Orus`, rate 0.98 (≈166 wpm measured) |
| Long-form | 16:9 · 1920×1080 · 30 fps · 8–10 min |
| Short | 9:16 · 1080×1920 · 30 fps · ~60 s (map language identical; adds word-highlight captions) |

### Design read
"Atlas-meets-ledger: a calm surveyor annotating real footage. Credible, curious, unhurried; numbers land like
small reveals, never like hype." visual_variance 5 · motion_intensity 4 · information_density 4.
Real footage/photos carry every frame; graphics annotate the world, never replace it.

### Palette (the only colours)
| Token | Hex | Use |
|---|---|---|
| ink | `#0B1530` | night-sea base for graphic-only beats, sting, end card |
| navy → teal | `#1F2A6B` → `#21807F` | logo gradient; survey lines, map strokes, rules, *context* places |
| paper | `#F2EFE6` | all type on footage (pure white reads clinical) |
| amber | `#E9A23B` | the single accent: numbers, measurements, the *subject* place. Nothing else is amber |
| pin red | brand red used only for pin ticks / flag fills | |

### Type
Fraunces 600 (titles, big numbers) · Manrope 500/700 (labels, short lines) · IBM Plex Mono 400 (coordinates,
sources, credits). Map labels: Manrope bold-italic, white, thin leader line.

### Anti-patterns
Tourism-ad sunsets with ukulele energy · corporate-blue infographic slides · AI-purple gradients · stock 3D globe
clichés · captions that repeat narration word for word · **static bar charts** (rejected) · **plain arcs with
nothing travelling on them** (rejected) · a ship that looks like a rocket (rejected).

---

## 2. Story structure (long-form countdown)

```
Cold open (hook ≈6 s) → tease (3 teaser lines ≈15–20 s) → main title card → logo sting (2.6 s)
→ Act 1 card → facts N … → Act 2 card → facts … → Act 3 card → facts … → #1 finale
→ outro (globe pull-back + "This is The Sundaland") → end card (8 s)
```

- **Count / length:** default 20 facts (~1,250–1,300 words); 15 facts gives ~80 words per fact for denser
  topics. Target ≈8.3 min of speech → ≈9 min total.
- **Acts:** default **The Land → The Water → The Money**. A topic may rename acts to fit (e.g. a money topic:
  *The Illusion → The Scars → The Edge*) — log it as a `playbook_override` decision.
- **Finale #1** ties back to Sundaland / the region whenever possible; it pays off the cold-open hook.
- **Per-fact beat:** `Number N. <Title>.` → setup ("you'd assume…") → the number → twist → why it matters for
  trade/economy. Hedge where sources disagree ("about", "has ranked", "among the top two"); drop anything
  unverifiable.
- **Title pattern:** "N Facts About <X> That Sound Fake (But Aren't)" or a question title with the countdown
  as subtitle ("Which … First? 15 Facts That Sound Fake"). ≤60 chars.

## 3. Shot grammar

Every fact = **title card → map beat(s) → real footage/photo → animated data beat**, average shot 3–4 s, a
graphic every ~8–10 s, graphic beats hold ≥2.5 s. Cuts land on narration phrase boundaries; pins, pops and
counters land **on the spoken word** (use sentence timestamps).

| Beat | Look |
|---|---|
| **Fact title card** | giant amber Fraunces numeral left, title right (paper), thin teal rule draws between; small Plex Mono act line ("NO. 09 · ACT THREE · THE MONEY") above; over drifting footage or a real photo with a left-side dark wash |
| **Footage** | always drifting (scale 1.00→1.06 over the shot); left-third text column; on-screen credit bottom-left in Plex Mono; non-local generic footage tagged **ILLUSTRATIVE FOOTAGE** |
| **Photo** | Ken-Burns push / parallax, credit (author · licence · source) on screen |
| **Stat on footage** | big amber Fraunces number + one paper line + Plex Mono source |
| **Data beat** | **HUD dashboard style** (see §3a) — glass panels floating on a holographic stage, glow rings, digital numerals, glow bars/lines, data tables. Every element animates in; never a static chart |
| **Act card** | satellite map of the region, flag-silhouette ghost, big Fraunces act title, "ACT ONE" Plex Mono kicker |

## 3a. Data visualization — HUD dashboard language (user direction 2026-11-12)

The v1 editorial look (serif amber numbers, hand-drawn scales/tanks) was rejected as dated. Data beats and every
number overlay now use a "smart-city monitoring dashboard" language (refs: smart-park / office-building
data-visualization screens, a holographic tablet with floating panels). Code: `template/hud.tsx` (primitives) and
`template/viz.tsx` (11 worked scenes from the SEA-debt video).

- **Stage:** deep navy (#020b1f → #04173a), perspective circuit-grid floor, drifting particles, scanlines, slow
  light sweep; panels sit **flat** (no CSS rotateX/rotateY) above a soft glowing floor with light pillars — a CSS 3D
  tilt made small SVG axis labels re-rasterize and jitter ±1–2 px every frame (user caught it). Depth comes from the
  WebGL story objects and the floor, never from tilting text.
- **Header bar:** spaced, skewed tech title (Orbitron) + angled underline + source tag top-right.
- **Panels:** glass, cut corners, thin cyan edge, corner brackets, thin title underline with a notch and a small dash.
- **Numbers:** Orbitron 500, skewed −9°, glowing, count up. Labels: Rajdhani 500/600.
- **Charts:** thin multi-segment glow rings (laps > 100% wrap), thin glow bars with white caps + line overlay,
  glowing area line charts with markers, segmented vertical gauges, legend lists (bullet · label · value · %),
  translucent data tables, glowing badges (AAA / LOCKED / DEFERRED), holographic icon pedestals.
- **Palette:** cyan #39d5ff, blue #1e8bff, ice #e8f6ff, dim #7fa8d6, amber #ffb347 (subject), red #ff4d6a (risk),
  teal #2ee6c5 (safe), violet #8f7bff, green #7be08a.
- **Map overlays:** stat/counter blocks become `KpiCard` glass cards; rating stamps become `Badge`s.
- **Story + numbers (mandatory):** every data scene pairs one **holographic story animation** that acts out the
  point (shrinking banknote vs a growing debt weight, a cracking coin, a dial locked by a padlock, a vault gathering
  dust, an hourglass draining beside a rig going dark, calendar pages stamped DUE being pushed on…) with the HUD
  charts that carry the figures. Charts alone read as "just numbers" — rejected.
- **The story object is real 3D with a moving camera** (user direction 2026-11-12): Three.js via `@remotion/three`
  (`template/three3d.tsx`: `Zone3D` + one object per scene with a `CameraRig` that orbits / dollies / pushes in on the
  narration beats). Holographic look = translucent emissive solids + glowing edges, cyan grid floor with distance fog,
  glowing pedestal ring. Keep objects inside frame at every camera key (check start/mid/end stills). The flat 2D
  versions in `template/holo.tsx` are a fallback only.
- **3D render requirement:** `remotion-composer` needs `@remotion/three@<remotion version>`, `three@0.170.0`,
  `@react-three/fiber@8.17.10`; every still/video render must pass `chromiumOptions: { gl: "angle" }` (see
  `template/artifacts/stills.mjs`) or WebGL scenes render blank.
- **No jitter on text/numbers (user feedback):** chart text, axis labels and counters must stay pixel-still — no CSS
  3D tilt on text panels, digits in fixed-width cells, no handheld camera drift. Intentional object motion is fine
  (e.g. the coin's short pre-crack tremor — the user asked for it back). Verify text stability on a preview clip with a
  frame-change heat map before a full render. Floors/plates must fade out inside frame — no hard-cut edges.
- **Honesty:** only verified figures; any curve shape between verified endpoints carries an "INDICATIVE" note.

Fact title cards, act cards, logo sting and end card keep the editorial look (Fraunces/Manrope) — HUD is for data.

## 4. Map language (from the Malacca piece — mandatory)

- **Basemap:** NASA Blue Marble shaded relief + bathymetry (deep navy sea, natural land), 3 zoom levels
  (country / region / world) aligned to one projection (`assets/brand/proj.json`).
- **Camera:** moves in map units; **whip-zoom with motion blur** between places; whoosh SFX on every whip.
- **Country pop:** silhouette filled with its **flag**, springs in with a drop shadow, then dissolves into a
  tinted territory + white border so borders read on satellite. Pointing at *another* country: whip-zoom, the
  country pops as a **big solid silhouette with shadow** (amber = subject, white/teal = context), pin burst,
  count-up number. (Malacca: Japan pops white → fills amber as "94 percent" is spoken.)
- **Countries are always flags (user rule, 2026-11-13):** every country that pops/highlights on a map is its flag
  clipped to the silhouette (`CountryPop` does this by default when the flag exists in `FLAGS`). Solid colour only for
  sub-national areas (provinces, zones) or a deliberately unnamed mystery silhouette (`solid`).
- **Rail routes:** a train rides the line in the same oblique-3D language as the ship (`Train3D`: stacked body slices,
  livery stripes, lit roof, shadow, rail bed with sleepers), cars enter one by one, camera follows, and the train
  shrinks with the camera when it pulls out to the wide reveal.
- **Provinces:** faint white ADM1 borders; the province discussed pops in solid colour (amber subject / teal
  context) with white edge + lifted shadow, then settles semi-transparent; **red pin ticks** inside it.
- **Labels:** small bold-italic white, thin leader lines; water bodies in italic (Andaman Sea, Makassar Strait).
- **Lines:** dashed amber line that "ticks" white with a 12-ray burst + ring (tick + impact SFX).
- **Routes / flows:** **every pointing line carries cargo** — durian, fish in / cans out, pickups, containers,
  money — with a comet head, flowing dashes and an arrival burst. Shipping: the camera **follows an oblique-3D
  container ship** (hull walls, stacked boxes, white bridge, foam wake; orange trail ends well behind the stern),
  then releases to a wide reveal. Lanes may show several small ships with blue/orange route strokes.
- **Big caption on map (Shorts only):** red/white heavy sans headline top ("1.7 miles wide"), word-highlight
  captions lower third with the key number in amber/red.

## 5. Signature sequences

1. **Cold open:** real aerial footage → whip-blur into a **spinning cloudy globe** → zoom → seamless hand-off
   (same centre + scale) to the flat satellite map → flag-filled silhouette pops → zoom to the hook location →
   dashed line ticks white with ray burst → big amber number.
2. **Logo sting (≈2.6 s):** ink field, white mark rotates in from −18°, wordmark wipes left→right, "ECONOMY
   GEOGRAPHY" tracks in under a teal rule. Music ducks up to 0.4.
3. **Survey line** (signature device): thin teal measuring line with end ticks + Plex Mono label drawing across
   real geography — only where *a measurement is the fact* (hook, finale).
4. **Outro:** pull back to a **clean** cloudy globe — no country outlines or route lines left on it (user, 2026-11-13;
   `globe_cfg.json` "out": `outline: []`, `route: []`) → **white pill logo "The
   Sundaland" types in** on "This is The Sundaland".
5. **End card (8 s):** big logo + tagline, channel card, **cursor clicks SUBSCRIBE → ✓ SUBSCRIBED → clicks
   bell (rings, red dot)** with click/bell SFX, dashed **WATCH NEXT** slot for the YouTube end screen.
6. **Watermark:** white mark + wordmark bottom-right at 58 % — hidden during sting and end card.

## 6. Motion

Settling, surveyed. Lines draw (stroke-dashoffset, `Easing.inOut(cubic)`, 0.8–1.2 s); type rises 24 px and
settles with spring `{damping: 200}`; numbers count up with `Easing.out(exp)`; silhouettes pop with a springy
overshoot. Nothing is ever perfectly still.

## 7. Sound

- Narration per sentence, silences inserted: 0.25 s after "Number N.", 0.7 s after the title, 0.3 s between
  sentences. Verify proper names with whisper.
- Music: one track per act (+ optional finale), each loudnorm'd to −18 LUFS; bed at 0.13, 0.4 under the sting,
  0.32 under the end card, 1 s crossfades. Final mix loudnorm `I=-14 TP=-1`.
- SFX (synthesised, `template/public/sfx/`): whoosh (whips), pop (silhouettes, pins), tick + impact (bursts),
  click + bell (end card).

## 8. Sources & credits (free only)

Footage/music: Pixabay (key in `.env`). Photos: Wikimedia Commons — accept only CC BY / BY-SA / CC0 / PD / FAL,
record artist + licence + page. Maps: NASA GIBS, geoBoundaries ADM0/ADM1 (CC BY 4.0), Natural Earth (PD).
Globe clouds: Solar System Scope (CC BY 4.0). Everything credited on screen and in the description.

## 9. Thumbnail

1280×720 JPG: ≤4 huge words + one focal map subject (flag-filled silhouette or popped country) + a measurement
bubble (e.g. "11 KM") + small brand mark; must read at feed size. The "SOUNDS FAKE + flag map + number bubble"
style is the proven default — offer it first, plus two variants.
