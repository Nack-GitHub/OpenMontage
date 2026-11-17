# The Sundaland: format registry

Status: **live** = has its own skill and at least one published episode · **pilot** = spec in `formats/`,
produced through the facts process · **idea** = passed the niche test, no spec yet.

## 1. Registry

| id | Series name (playlist) | Status | Spine | Signature device | Length | Title pattern | Where |
|---|---|---|---|---|---|---|---|
| `facts` | **Sounds Fake** | live (anchor) | countdown of N facts, 3 acts | amber numeral title card | 8–10 min | "N Facts About X That Sound Fake (But Aren't)" | `/sundaland-facts` |
| `story` | **The Story** | live | one regional event, minute by minute, 3 acts | doodle inserts + character voices | 9–11 min | "X Started Here, Not Y" | `/sundaland-story` |
| `doodle` | (inserts / Shorts) | live (tool) | one gag/beat | Gemini crayon cast | 10–60 s | n/a | `/sundaland-doodle` |
| `life` | **A Day in the Life** | pilot | one object's journey, clock-driven (Day N · hh:mm) | Vlog HUD (clock, km, mood) | 7–9 min | "I'm a <Thing>. Follow Me From A to B." | [`formats/life.md`](formats/life.md) |
| `game` | **Hard Mode** | pilot | a country/city played as a strategy game, turn by turn | Game HUD + hex grid + tech tree | 7–9 min | "<Place> Is a Strategy Game on Hard Mode" | [`formats/game.md`](formats/game.md) |
| `wild` | **Wild Trade** | pilot | nature-documentary parody, migration chapters | Species card | 7–9 min | "A Nature Documentary, But the Animals Are <Things>" | [`formats/wild.md`](formats/wild.md) |
| `tier` | Tier List | idea | rank N ports/straits/exports S→F | tier board | 8–10 min | "I Ranked Every <X> in Asia" | n/a |
| `unbox` | Unboxed | idea | unbox a product, every part flies to its origin country | exploded-view + map arcs | 7–9 min | "Where Does Your <Product> Really Come From?" | n/a |
| `plate` | One Plate | idea | one dish, every ingredient's trade route | plate → ingredient pop | 7–9 min | "This Plate of <Dish> Travelled N km" | n/a |
| `heist` | The Heist | idea | economic-history "heist" (e.g. rubber seeds → Malaya) | heist-plan board | 9–11 min | "The Heist That Built <Industry>" | consider folding into `story` |
| `pitch` | The Pitch | idea | a place pitches itself to investors | pitch deck slides on map | 6–8 min | "<Place> Pitches Itself to Investors" | n/a |

## 2. Topic → format fit guide

Ask three questions about the topic, then pick the format with the most ✓:

| The topic is mainly… | facts | story | life | game | wild |
|---|---|---|---|---|---|
| a **country/place** with many surprising numbers | ✓✓ | | | ✓ | |
| a **place that rose from nothing** (port city, hub, reclaimed land) | ✓ | | | ✓✓ | |
| **one dramatic event** with a date and a clock | | ✓✓ | | | |
| **a thing that moves** (cargo, ship, commodity, product) | | | ✓✓ | | ✓ |
| **a fleet / swarm / seasonal flow** (tankers, fishing fleets, haj flights, monsoon trade) | | | ✓ | | ✓✓ |
| a **route or chokepoint** | ✓ | ✓ | ✓✓ | | ✓ |
| a **commodity's economy** (rubber, tin, palm oil, durian) | ✓✓ | ✓ | ✓ | | ✓ |

Tie-breakers: prefer the format **not used in the last 2 uploads**. Pick the one where the hook can be said in one
breath. If the topic needs disputed geography to make sense, drop the topic.

**Same topic, different formats.** Use this to recycle research. Example *Strait of Malacca*: facts = "15 Facts
About the Strait of Malacca" · life = "I'm a Container. Follow Me Through Malacca" · wild = "The Great Tanker
Migration" · story = "The Night the Strait Changed Hands (1824 treaty)". Each episode's WATCH NEXT points to
the others.

## 3. Rotation (default cadence)

- **Anchor:** every other long-form upload is `facts` (proven CTR, our search traffic).
- **Rotating slot:** `story` → pilot → `story` → pilot … (pilots in order `life` → `game` → `wild`, then repeat
  the winners).
- **Shorts:** cut a 45–60 s 9:16 down from every long-form (the strongest single beat + the hook), plus `doodle`
  Shorts when there's spare time.
- **Pilot review after each pilot episode (≈7–10 days after publish):** compare CTR, average view duration and
  % viewed against the channel's last 3 `facts` episodes. Then decide:
  - ≥ 80 % of facts AVD **or** clearly higher CTR → make episode 2 and promote after it (SKILL.md "Promoting").
  - clearly lower on both → park as `idea`, note why in the registry.
  The user reads YouTube Studio. Ask them for the numbers; never guess them.
- Keep a short log here when a rotation slot is used:

| Date | Format | Episode | Result note |
|---|---|---|---|
| | | | |

## 4. New-format template (niche test)

An idea becomes a format only if **all** are yes:
1. Can every episode answer "**why here?**" with geography or trade? (If it's just a skin on trivia, no.)
2. Does it reuse the map language and the opening/closing shell **unchanged**?
3. Does it need **at most one** new signature component?
4. Can we name **5 episodes** for it without touching off-limits topics?
5. Can it be produced with free sources + ElevenLabs TTS only?

Spec file skeleton for `formats/<id>.md`: Identity (series name, title pattern, hook device, voice persona,
length) → Spine (beat structure + word budget) → Shot grammar additions → Signature component (spec + suggested
Remotion component name) → Topic rules + 5 episode ideas → Sound → Thumbnail → Guardrail notes → Example draft.
