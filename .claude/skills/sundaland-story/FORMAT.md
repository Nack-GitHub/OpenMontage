# The Sundaland · STORY format spec

A **single historical event in Sundaland/SEA, told as a story and re-framed through economy geography.**
The format was inspired by the narrative war-history channels (one event, minute by minute, cartoon characters on
maps) and rebuilt in our own language: satellite maps, HUD data panels and the Gemini-drawn doodle cast.
Proven on episode 1: *"The Pacific War Started Here, Not Pearl Harbor"* (Kota Bharu, 8 Dec 1941). It is public.
Worked example: [`examples/kota-bharu-1941/`](examples/kota-bharu-1941/).

It sits next to the other two formats and borrows from both:

| | `/sundaland-facts` | `/sundaland-doodle` | **`/sundaland-story`** |
|---|---|---|---|
| unit | N facts, countdown | one short doodle scene | one event, 3 acts |
| spine | list | gag/beat | **ticking clock + stakes** |
| visuals | maps + footage + HUD | doodle cast only | maps + HUD + photos + **doodle inserts (≈20–25 %)** |
| voices | Brian | none/Brian | **Brian + 2–4 character voices** |
| length | 8–10 min | 10–30 s | **9–11 min** |

---

## 1. What makes a good story topic

- **One event with a hidden economic engine**: the "why" is oil, rubber, tin, rice, a strait, a railway, a port, a
  price. The story answers *"why did it happen HERE?"* with geography.
- **A re-framing hook** that a viewer can repeat: *"X started here, not Y"*, *"the N minutes before…"*,
  *"the battle that was really about…"*, *"the town that decided…"*. One surprising, checkable claim.
- **Region only.** Location must be Sundaland/SEA. If the reference idea is elsewhere, relocate it to a regional
  event with the same archetype (do not just add SEA trivia to a foreign story).
- **Avoid:** unresolved disputes (South China Sea, borders), domestic politics, drug trade, glorifying violence,
  events with contested atrocity counts unless sources agree. War topics are fine when the angle is economy/logistics.
- Good candidates: Kota Bharu 1941 (done) · fall of Singapore and the rubber/tin economy · the Death Railway as a
  supply line · Palembang oil raid 1942 · Battle of the Java Sea and the oil route · the 1997 baht float (a
  financial "night") · the opening of Malacca/Singapore port · the Krakatoa 1883 telegraph/news shock · the tin rush.

## 2. Story structure (≈1,300–1,450 words + 6–8 short character lines)

Use these storytelling tools on purpose; the script must show them:
**in medias res** cold open · **ticking clock** (a deadline or a clock on screen) · **stakes in numbers** ·
**a POV character** (an unnamed eyewitness) · **rewind** · **reversal/twist** · **callback** to the cold open in the
epilogue.

| Block | Sections (ids) | Length | Job |
|---|---|---|---|
| Cold open · the scene | `s00` + voice `v01` | 40–50 w | Night/now, a place, an unnamed eyewitness sees something. Doodle insert with a crayon background. |
| Cold open · the clock | `s01` | 80–100 w | Who they are, what is at stake, the hook claim with the hedge ("by most accounts"), the dual clock. → main title over footage → logo sting |
| **Act 1 · The why** | `a1…a5` | ~320 w | Rewind. The economic engine: dependence, a freeze/price shock, a decision, the prize (resources on the map), the plan, why THIS place (geography). Host doodle cards explain. |
| **Act 2 · The night** | `b1…b8` + voices | ~420 w | The event minute by minute: approach (route on map), defenders, the first shot, counter-attack (planes), the parallel fronts, the human moment (a young/local POV), the order/turn. Character lines between narration. |
| **Act 3 · The consequences** | `c1…c3b` + voice | ~330 w | The race/aftermath on the map, one surprising mechanism (bicycles on rubber estates), the fall, then **the twist**: the prize did not work out the way it was planned (the economic irony). |
| Epilogue | `c4` | ~70 w | Cost (HUD casualties, hedged), a monument/real photo, the callback line to the cold open. |
| Outro | `s99` | 10 w | "That's the geography behind the economy. This is The Sundaland." |

**Act cards** ("ACT ONE · The Clock") ride on the first map of each act (`act` key), not on separate slides.
**Chapters** = cold open + 4 per act + epilogue (≥10 s apart).

### Character voices (dramatized lines)
- 6–8 lines, 5–15 words each, **only for unnamed characters** (a sentry, a radio operator, a cadet, a pilot).
  **Never invent quotes for real, named people.** Real quotes go on a **QuoteCard** with source and attribution.
- Voice map (ElevenLabs, all TTS-scoped key): narrator **Brian** `nPczCjzI2devNBz1zQrb`; characters from
  **Daniel** `onwK4e9ZLuTAKqWW03F9`, **Charlie** `IKne3meq5aSn9XLyUdCD`, **Will** `bIHbv24MWmeRgasZH58o`,
  **Liam** `TX3LPaxmHKxFdv7VOQHJ`. One voice per side/role; give the user a 4-voice audition before TTS.
- Each line is one clip with a **radio / field-phone filter** (band-pass + light drive) so it reads as diegetic.
- Lines appear as a speech bubble on the doodle insert (the bubble text = the line).

### Accuracy rules
- Every number hedged when sources differ ("about", "by most accounts", "sources vary between 40 and 90 minutes");
  put the range in the description.
- Times in the local time of the place, with the other place's time on the dual clock.
- 1941-style borders: draw **period territories as solid colour + label** (British Malaya, Dutch East Indies, French
  Indochina, Burma, Philippines/US) — never modern flags on a historical map.
- Log hedges and unverifiable items in `script.json → metadata.hedges / verify_before_tts`.

## 3. Shot grammar (≈60–70 shots per 9–10 min)

| Kind (`timeline.ts`) | Use | Notes |
|---|---|---|
| `coldopen` | first 7–8 s | dark beach/sea footage + kicker text + time/place stamp |
| `doodle` mode **full** | eyewitness / character lines / action gags | crayon background (mode B), 3–8 s |
| `doodle` mode **card** | host explains (Act 1, twist) | torn-edge paper card over a dimmed basemap of the place being discussed (mode A) |
| `map` | every location, route, front, count | the channel map DSL (§4) — carries ~40 % of runtime |
| `hud` | numbers: dependence, gauge, stockpile, prize, calendar, casualties, "N days" | HUD dashboard language from `/sundaland-facts` FORMAT §3a, never editorial serif charts |
| `photo` | real people/places/equipment (Commons) | chip + credit; **portrait images → `fit: "contain"`** (blurred fill) so the subject is never cropped |
| `footage` | sea, beach, plantation, dawn | Pixabay, **ILLUSTRATIVE FOOTAGE** tag |
| `quote` | a real, sourced quote | over dark footage, attribution line |
| `maintitle` / `sting` / `globeout` / `endcard` | as in the facts format | |

Doodle share **20–25 %** of runtime, never two doodle inserts longer than 6 s back to back without a map/photo between.

## 4. Map language (story additions on top of the facts map language)

All facts-format map rules apply (satellite basemap, whips, bold-italic labels with leaders, red pin ticks, solid
province/country pops, territory tint + white border). The story format adds:

- **Stickers (mode C):** doodle sprites with a white outline standing on the map at real coordinates, moving in
  lon/lat (`stickers: [{src, lon, lat, toLon, toLat, at, dur, h, flip}]`). Use for soldiers wading ashore,
  cadets running to a bridge, a bicycle column. **A sprite must face its direction of travel** (`flip` when needed).
- **Dual clock** (`clock`): two HUD panels (here vs. there) bottom-centre, counting minutes; the hook gap in red.
- **Sea routes** (`routes` with `ship: true`): solid amber line + ship marker. **Every waypoint must be at sea** —
  route around capes and coasts (check against the basemap; e.g. Hainan → Gulf of Thailand goes round Cape Ca Mau,
  never across Vietnam). Check each route in a still before the full render.
- **Air routes** (`planes`): **3D aircraft** (`planes3d.tsx`, three.js) flying a smooth path with a **dashed white
  contrail**, banking into turns, soft ground shadow. Sides read at a glance: `side: "jp"` olive + red disc,
  `side: "allied"` khaki + RAF roundel; `kind: "fighter" | "twin" | "flyingboat"`; endings `fly | fade | strike`
  (flash on target) `| crash` (spin, fall, flash). Arcs that are air strikes get a plane on the same arc
  (`arc: {a, b, bend}`, `ease: "arc"`). Planes always head toward their target.
- **Land routes:** amber `routes` without ship (roads/rail), plus sticker columns.
- **Flow arcs with icons** (barrels, tankers): symbolic flows may bend over land; say so if the user asks.
- **Detail basemaps** for the event site (z12 NASA GIBS crops, e.g. `basemap_kelantan`, `basemap_chumphon`)
  so the camera can go to 0.3–0.6° tall frames on the beach.

## 5. Doodle inserts (three modes)

All drawn by the user in the Gemini app (cast + props + backgrounds), cut out locally, animated in HyperFrames by
pose-swap. **Never redraw the cast in code.**

- **A · Paper card over map** — host poses on a torn-paper card; the dimmed basemap behind shows where we are.
- **B · Crayon background** — 16:9 Gemini background scenes (night beach, night sea, bridge, rubber estate, road)
  baked into the insert; characters and props act on top; speech bubble for voice lines.
- **C · Stickers on the map** — see §4.
- Motion vocabulary: pop in/out, swap pose, breathe, hops (travel), jitter (fear), shake (impact), slide, bob on
  water, flames boil, smoke drift. **Direction rule:** anything that travels faces where it goes (flip the sprite);
  attackers dive toward the target, then pull out.
- Recurring **host** (orange tunic) is reusable across episodes: `template/cast/host/` (6 poses).

## 6. Sound

- Narration Brian per sentence (seeded, previous/next text); character lines one clip each with the radio filter.
- Music: one track per block — cold open (dark ambient), Act 1 (tense economic pulse), Act 2 (cinematic tension),
  Act 3 (driving symphonic), finale/epilogue (elegy), outro (hopeful). Beds at **0.13**, **0.4** under the sting,
  **0.32** under the end card. **YouTube Audio Library first** (the user's Studio, opened via Claude in Chrome),
  Content-ID-screened Pixabay second; record each in `assets/music_provenance.json`.
- SFX: whoosh on whips/arcs/plane take-off, pop on pins/stickers, tick on clocks, impact on strikes/crashes.
- Final mix: `loudnorm I=-14 TP=-1 LRA=11`.

## 7. Thumbnail

Three variants from `Thumb.tsx`: **map** (≤3 huge words + period territory in amber + red pin + number bubble — the
winner for ep. 1), **clock** (HUD times), **doodle** (crayon scene + cast). Brand mark top-left.

## 8. Publish pack

Title ≤60 chars stating the re-framing; 3 alternative titles; description = hook (with hedge) + chapters + selected
sources + "times differ between sources" note + "character lines are dramatized; named quotes are sourced" +
full credits (ElevenLabs voices, Gemini-app doodles, NASA/geoBoundaries/Natural Earth/Solar System Scope, Commons
authors + licence + link, Pixabay users, music). 10–12 tags, 3–5 hashtags. The user uploads **Private** first.
