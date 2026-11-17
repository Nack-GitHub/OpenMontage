# Format `life`: A Day in the Life (pilot)

## Identity
- **Series:** A Day in the Life · playlist "A Day in the Life"
- **Title pattern:** "I'm a <Thing>. Follow Me From <A> to <B>." · alt "A Day in the Life of a <Thing> (It's N Days Long)"
- **Hook device:** POV promise: the object introduces itself and the trip ("follow me").
- **Voice persona:** Brian, **first person as the object**, relaxed, a bit self-mocking vlogger; speed 1.0.
- **Length:** 7–9 min ≈ 1,150–1,350 words.

## Spine
```
Cold open: object intro + destination (≈30 s) → globe → whole route previews as a dashed line → sting
→ 6–9 "stops", each = HUD timestamp card → what happens here → ONE economy/geography reveal → hand-off to next stop
→ arrival → "what happens to me next" twist (empty return, recycling, re-export)
→ shell outro → end card
```
- Every stop answers **"why does the route go through here?"** (depth, hub economics, chokepoint, policy).
- Time is the spine: the HUD clock and km counter only move forward. At least one beat must be a surprising
  detour ("I'm going to India, but my first ship goes south").
- Budget: ~120–160 words per stop.

## Shot grammar additions
- **Stop card** replaces the facts numeral card: HUD timestamp `DAY 05 · 04:50` big in amber Fraunces, stop
  name in paper, kicker `A DAY IN THE LIFE · STOP 6/8`.
- The **object stays on screen** as much as possible: Ship3D/truck/plane with followCam; the camera releases
  to a wide reveal at each stop.
- The route line is drawn progressively across the episode and never redrawn from scratch.

## Signature component: `VlogHUD`
Persistent corner overlay (top-left, glass panel, Plex Mono): `DAY n · hh:mm` · `km` counter (count-up between
stops) · a small "mood" glyph that changes on beats (😴 layover, 😬 narrow strait). It's hidden during the sting and
end card. One component, props `{day, time, km, mood}` keyed off the timeline. Build it in `fx.tsx` next to `CountUp`.

## Topic rules + episode ideas
The object must **physically travel through Sundaland/Asia** and its route must carry economic meaning.
1. A shipping container: Thailand → Singapore → Malacca → India (draft in `examples/life-container-v1.md`)
2. A durian: Chanthaburi → Laem Chabang/rail → China (Laos–China railway)
3. A barrel of palm oil: Sumatra plantation → Dumai → refinery → your shampoo
4. A tin ingot / a hard drive / a rubber glove (Malaysia → the world)
5. A fish: Andaman longliner → Bangkok market → canned tuna export (Thailand is a top canner)
6. A reefer of bananas: Mindanao → Davao Gulf → Philippine Sea → Tokyo (draft in `examples/life-reefer-philippines-v1.md`): typhoon-belt geography, a 1963 import opening, a 13.3 °C HUD gag

## Sound
Music: upbeat lo-fi / light documentary from the Audio Library. A soft "tick" SFX when the HUD clock jumps,
whoosh on whips, pop on stop cards.

## Thumbnail
The object with a "selfie" feel in the foreground (photo or 3D) + the most famous stop behind it + ≤4 words
("12 DAYS. 1 BOX.") + brand mark.

## Guardrails
Choose routes that avoid active conflict zones (e.g. do not route through the Red Sea story). Don't name real
companies' boxes/ships as the protagonist.
