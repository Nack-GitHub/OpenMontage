# Art Direction — thailand-sounds-fake (The Sundaland · Asia Explained)

## Subject
Twenty true facts about Thailand's land, water and trade that sound invented. The visual problem: make
*real places* and *dry trade numbers* feel like revelations without looking like a slideshow or a
tourism ad — evidence first, graphics as quiet annotation on top of the world.

## Design read / taste profile
"Atlas-meets-ledger: a calm surveyor annotating real footage. Credible, curious, unhurried; numbers land
like small reveals, never like hype."
- visual_variance 5 · motion_intensity 4 · information_density 4
- Reference strategy: real footage/photos carry every frame; graphics never replace the place.
- Anti-patterns: tourism-ad sunsets with upbeat ukulele energy; corporate-blue infographic slides;
  AI-purple gradients; floating 3D globe clichés; captions that repeat the narration word for word.

## Palette
- Ink `#0B1530` — the night-sea base for graphic-only beats and the logo sting (deeper than the logo navy so the white logo glows).
- Brand navy `#1F2A6B` → teal `#21807F` — taken from the logo gradient; used ONLY for survey lines, map strokes, underline rules.
- Paper `#F2EFE6` — warm off-white for all type on footage (pure white reads clinical).
- Ledger amber `#E9A23B` — the single accent, reserved for numbers and measurements. Nothing else is amber.

## Type personality
- **Fraunces** (soft optical serif, 600) — fact titles and big numbers: an old atlas / economist voice.
- **Manrope** (geometric sans, 500/700) — labels and short lines; matches the logo wordmark's geometry.
- **IBM Plex Mono** (400) — coordinates, sources, credits: the surveyor's field notes.

## Motion character
Settling, surveyed. Lines *draw* (stroke-dashoffset, Easing.inOut(cubic), 0.8–1.2 s); type rises 24 px and
settles with spring `{damping: 200}`; numbers count up with Easing.out(exp). Footage always drifts (1.00→1.06
scale over the shot) — nothing is ever perfectly still. Cuts on narration phrase boundaries; graphic beats
hold ≥ 2.5 s so a number can be read.

## Layout & rhythm
Left-third text column on footage (safe from the bottom-right watermark). Maps sit right-of-centre, large,
partially bleeding off-frame. Fact title cards: giant numeral left, title right, thin teal rule between.
Average shot 3–4 s (matches reference pacing), graphic overlays every ~8–10 s.

## Map style (user direction, after sample v1)
Establishing move: real footage first, then whip into a spinning NASA Blue Marble globe that zooms into the country
and hands off (same centre + scale) to the flat satellite map — rendered by `assets/globe/render_globe.py`.
Follow the channel's existing map language (user's Malacca piece): NASA Blue Marble satellite basemap with
camera moves in map units; whip-zoom with motion blur between places; country silhouette filled with its flag
that pops (spring, drop shadow) then dissolves into a tinted territory + white border; small bold-italic white
labels with thin leader lines; dashed amber line that "ticks" white with a 12-ray burst + ring (tick/impact SFX);
pins land with a spring + burst. Province level (geoBoundaries ADM1): faint white province borders; the province
being discussed pops in a solid colour (amber = subject, teal = context/reference place) with white edge + lifted
shadow, then settles semi-transparent; red pin ticks inside it. SFX: whoosh on whips, pop on silhouettes/pins, tick+impact on bursts.

## Signature device
**The survey line** — a thin teal measuring line with end ticks and a Plex Mono distance/coordinate label
that draws itself across real geography (e.g. the ≈11–12 km neck of Thailand). Used only at moments where a
*measurement is the fact* (hook, #20, #19, #1), never as decoration.

## Branding
- Logo sting after the cold open: ink field, white mark rotates in from −18°, wordmark wipes left→right,
  "ECONOMY GEOGRAPHY" tracks in under a teal rule. ~2.6 s.
- Watermark: white mark + wordmark, bottom-right, 58 % opacity, hidden during sting and end card.
- End card: full white logo on ink + "That's Asia, explained."

## Anti-references
- The reference video's yellow-box captions and stock globe renders (keep the pacing, not the look).
- Any prior OpenMontage atelier piece (violet themes, score rings, candle heroes).
