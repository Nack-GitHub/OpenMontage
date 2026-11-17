# Format `game`: Hard Mode (pilot)

## Identity
- **Series:** Hard Mode · playlist "Hard Mode"
- **Title pattern:** "<Place> Is a Strategy Game Played on Hard Mode" · alt "How to Win a Country With One Tile and No <X>"
- **Hook device:** "SELECT NATION → DIFFICULTY: HARD". Show the bad starting hand, then "most players would hit restart".
- **Voice persona:** Brian as a confident strategy-game streamer explaining a run; speed 1.0–1.05.
- **Length:** 7–9 min ≈ 1,150–1,350 words.

## Spine
```
Cold open: the starting tile + missing resources (≈35 s) → globe → hex grid fades onto the map → sting
→ 6–8 TURNS (each a year/era): popup (EVENT / POLICY / TECH / BUILDING / WARNING) → what happened → resource bar changes
→ FINAL TURN: score screen (real indicators) → the lesson: "location was the starting bonus; the rest was strategy"
→ "which country should I play next?" → shell outro → end card
```
- Each turn = **one real economic decision or geographic event**. The game metaphor explains it and never
  replaces the fact.
- At least one turn must be a **counter to a weakness** (tech tree), and one a **random global event** the player
  didn't control (e.g. Suez 1869).
- Budget: ~130–170 words per turn.

## Shot grammar additions
- **Turn card** replaces the numeral card: `TURN 1965` in amber Fraunces, era name in paper, kicker
  `HARD MODE · SINGAPORE · TURN 3/7`.
- Game popups appear **on top of the satellite map**. The map stays real; only the HUD is game-styled.

## Signature component: `GameHUD`
- Resource bar (top): 4–5 icons + values (e.g. 🌊 WATER · 🏝️ LAND km² · 💰 TRADE · ⚓ PORT · ⛽ ENERGY). Values
  count up or down when a turn changes them; missing resources pulse red.
- `HexGrid` overlay: thin teal hexes at 15–20 % opacity over the basemap; the "owned" hexes are lit amber.
- `GamePopup`: glass panel with a type label (TECH UNLOCKED / POLICY ADOPTED / GLOBAL EVENT / WARNING) + bell SFX.
- `TechTree`: 3–5 nodes unlocking left→right with click SFX.
Palette stays the channel palette. **No neon gaming colours.** The game feel comes from the layout and sounds, not from new colours.

## Topic rules + episode ideas
Places that **started with a weak hand and won through geography or policy**. Describe only economic policy and
never parties or leaders' politics.
1. Singapore: no water, one tile (draft in `examples/game-singapore-v1.md`)
2. Brunei: the oil-rush run (and the "what after oil" end-game)
3. Hong Kong: the entrepôt run (economic history only, stop before present-day politics)
4. The Malacca Sultanate (1400s): a port-state built on monsoon timing
5. Penang / Batam: the "free port" and "special zone" builds

## Sound
Music: light electronic / chiptune-tinged documentary from the Audio Library (keep it subtle). SFX: bell on popups,
click on tech nodes, a soft "level up" chime on the score screen (synthesise it with ffmpeg next to the existing SFX).

## Thumbnail
Map of the place on the hex grid + a big red **"HARD"** difficulty badge + one resource at 0 next to gold 9999.
≤4 words.

## Guardrails
Moments like 1965 (Singapore) are described **only economically** (lost domestic market, new export strategy).
Water deals with neighbours are mentioned neutrally as agreements and never framed as disputes.
