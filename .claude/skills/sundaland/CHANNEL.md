# The Sundaland: the constant shell (every format)

A viewer should recognise the channel within 5 seconds, whatever the format. These are the **constants**.
The full approved spec for each item lives in [`../sundaland-facts/FORMAT.md`](../sundaland-facts/FORMAT.md)
(the canonical source; section numbers below). This file never duplicates that content. It only says what is locked.

## A. Locked for every format

| Constant | Rule | Canonical spec |
|---|---|---|
| Niche / lens | trade · geography · economy of Sundaland/Asia. Every episode answers "**why here?**" with geography | facts FORMAT §1 |
| Off-limits | unresolved/ongoing disputes (borders, territory, South China Sea), domestic politics, drug trade, sanctions-evasion / "dark fleet", piracy as entertainment | facts FORMAT §1 |
| Brand | logo, tagline **ECONOMY GEOGRAPHY**, watermark bottom-right | facts FORMAT §1, §5.6 |
| Palette & type | ink / navy→teal / paper / **amber = the subject only** / pin red; Fraunces · Manrope · IBM Plex Mono | facts FORMAT §1 |
| Map language | satellite basemap, whip-zoom, flag-silhouette pop, amber subject / teal context, red pin tick + ray burst, cargo rides every line | facts FORMAT §4 |
| Data beats | animated HUD/viz scenes, **never static bar charts or empty arcs** | facts FORMAT §3a |
| Opening shell | cold open → **globe → map hand-off** (globe has clouds) → logo sting (2.6 s) | facts FORMAT §5.1–5.2 |
| Closing shell | spoken line "**That's the geography behind the economy. This is The Sundaland.**" → clean cloudy globe pull-back → pill logo types in → 8 s end card (subscribe + bell + WATCH NEXT) | facts FORMAT §5.4–5.5 |
| Narrator | ElevenLabs **Brian** (`nPczCjzI2devNBz1zQrb`, `eleven_multilingual_v2`), English | facts SKILL §0 |
| Cost | ElevenLabs TTS is the only paid service; never call Gemini/Imagen/Veo/Lyria APIs; free sources only | facts SKILL §0 |
| Sources & credits | Pixabay, Wikimedia (CC BY/BY-SA/CC0/PD/FAL), NASA GIBS, geoBoundaries, Natural Earth; credit everything on screen and in the description; facts verified and hedged | facts FORMAT §8 |
| Music | YouTube Audio Library from `music_library/` first; never the two Pixabay tracks that got claimed | facts SKILL §3 |
| Process | approval gates, review loop, never upload (user uploads Private first) | facts SKILL §0, §5–6 |
| Output | 16:9 1920×1080 30 fps long-form; 9:16 Shorts cut-down allowed for any format | facts FORMAT §1 |

## B. What a format MAY change (the "format slots")

| Slot | Example (facts) | Example (pilot) |
|---|---|---|
| **Spine**: how the episode is structured | countdown of N facts in 3 acts | 12-day journey · game turns · migration chapters |
| **Series kicker**: Plex Mono line on title cards | `NO. 09 · ACT THREE · THE MONEY` | `DAY 05 · 04:50 · THE NARROW BIT` / `TURN 1965 · HARD RESET` |
| **Signature component**: one new on-screen device | amber numeral title card | Vlog HUD · Game HUD + hex grid · Species card |
| **Hook device**: what the cold open promises | "this sounds fake" + number | "follow me" · "difficulty: hard" · "something enormous appears" |
| **Voice persona**: same narrator, different delivery | Brian 1.0, surveyor | Brian as the box (1st person) · streamer · hushed documentary 0.90 |
| **Music mood** within the Audio Library | documentary ambient | upbeat lo-fi · chiptune-tinged · orchestral nature |
| **Thumbnail rule** | SOUNDS FAKE + flag map + number bubble | see each format spec |
| **Length** | 8–10 min | 7–10 min |

**Rule of thumb:** a format may add **one** new signature device and change the spine. If a format needs to
change the map language, palette or the opening/closing shell, it's a different channel. Say no to it, or
ask the user explicitly.

## C. Series identity on the channel

- Each format = **one YouTube playlist** and one title pattern (FORMATS.md §1). Episode title cards show the series
  name in the kicker so returning viewers recognise the series.
- The end-card **WATCH NEXT** slot links to the latest episode of a *different* format (cross-pollination).
