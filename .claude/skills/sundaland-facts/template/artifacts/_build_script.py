"""Builds the canonical script artifact (script.json) + a readable script_locked.md for review."""
import json, re
from pathlib import Path

HERE = Path(__file__).resolve().parent
WPM = 166            # measured: Chirp3-HD Orus @ 0.98 → 166–170 wpm on the sample
TITLE_PAUSE = 0.7    # beat after each "Number N — title"
SECTION_GAP = 0.5

# (id, label, text, pace, energy, emphasis, pause_after, cues[(type, desc)], extra_gap_after_seconds)
S = [
 ("s00", "Cold open · hook",
  "In one spot, Thailand is so narrow, you could cycle across the entire country before lunch.",
  "measured", "curious, confident", ["narrow", "before lunch"], 0.3,
  [("broll", "Aerial: limestone islands, boat wake (Pixabay)"),
   ("animation", "Whip into spinning globe → zoom into Thailand → flag silhouette pops → zoom to the neck; dashed line ticks white; '≈ 11–12 km'")], 0),
 ("s01", "Cold open · tease",
  "Its capital is built on the floor of an ancient sea, and it's sinking. And in 2011, a flood here made computers more expensive all over the world. "
  "This isn't trivia. It's how geography quietly runs an economy. Here are twenty facts about Thailand that sound completely fake, and aren't.",
  "measured", "intrigued → promise", ["sinking", "computers", "geography", "fake"], 0.6,
  [("broll", "Bangkok skyline at dusk, slow push"), ("broll", "Spinning hard drive macro"),
   ("overlay", "Title card: '20 facts about Thailand that sound fake'")], 2.6),   # +2.6 s logo sting after
 # ── ACT 1 ─────────────────────────────────────────────
 ("s02", "Act 1 · The Land",
  "First, the shape of the country itself. Because in Thailand, the map is half the story.",
  "conversational", "warm", ["shape", "half the story"], 0.4,
  [("overlay", "Act card 'THE LAND' over satellite map of Thailand")], 0),
 ("f20", "20 · The country you can cycle across",
  "Number twenty. The country you can cycle across. Thailand's south hangs down like a thin thread. And in Prachuap Khiri Khan, the gap between the Gulf of Thailand and the Myanmar border is only about eleven to twelve kilometers. At an easy pace, you could ride from coast to border in under an hour. "
  "Squeezed into that strip are the main road and railway that tie Bangkok to the entire south.",
  "measured", "matter-of-fact wonder", ["eleven to twelve kilometers", "entire south"], 0.6,
  [("animation", "Satellite map: Prachuap province pops (teal), dashed line across the neck ticks; label coast ↔ border"),
   ("broll", "Coastal road / railway along the Gulf (Pixabay)")], 0),
 ("f19", "19 · The canal that was never dug",
  "Number nineteen. The canal that was never dug. A little further south, the land narrows into the Kra Isthmus, about forty-four kilometers wide. "
  "Ships can't cut through it. So trade between the Indian Ocean and the South China Sea swings all the way around, through the Strait of Malacca. "
  "A canal here was suggested as early as the sixteen-seventies. Three centuries later, it still hasn't been dug, partly because hills up to seventy-five meters high stand in the way.",
  "measured", "storytelling", ["forty-four", "all the way around", "still hasn't"], 0.6,
  [("animation", "Map: shipping route drawn around the Malay Peninsula vs. dashed 44 km line across Kra (never built)"),
   ("broll", "Container ships in a strait (Pixabay)")], 0),
 ("f18", "18 · Frost in the tropics",
  "Number eighteen. Frost in the tropics. Thailand means beaches and thirty-degree days, so this sounds wrong. "
  "But on Doi Inthanon, the country's highest peak, grass-level temperatures have dropped to minus five degrees Celsius. "
  "Locals call it mae khaning, and on cold mornings, thousands of visitors drive up just to see ice.",
  "measured", "playful surprise", ["frost", "minus five", "ice"], 0.6,
  [("animation", "Map pin on Doi Inthanon (Chiang Mai province pops amber)"), ("stat_card", "−5 °C · grass-level frost, Dec 2017"),
   ("broll", "Wikimedia photo: frost at Inthanon")], 0),
 ("f17", "17 · The longest name on Earth",
  "Number seventeen. The longest name on Earth. Almost nobody in Thailand calls the capital Bangkok. Locals say Krung Thep. "
  "And that's the short version. The city's full ceremonial name runs to one hundred and sixty-eight letters, the longest place name in the world. The name the rest of us use is, essentially, a nickname.",
  "conversational", "amused", ["Krung Thep", "one hundred and sixty-eight"], 0.6,
  [("animation", "Kinetic type: the full name scrolling across a Bangkok aerial"), ("stat_card", "168 letters")], 0),
 # ── ACT 2 ─────────────────────────────────────────────
 ("s03", "Act 2 · The Water",
  "If the land shapes Thailand, water decides what it can do with it.",
  "conversational", "turn", ["water"], 0.4,
  [("overlay", "Act card 'THE WATER'")], 0),
 ("f16", "16 · Three kinds of water in one lake",
  "Number sixteen. Three kinds of water, one lake. Songkhla Lake starts fresh in the north, at Thale Noi. Its middle turns salty or fresh with the seasons. "
  "And its southern end, open to the Gulf, is brackish, about half as salty as the sea. One lake, three waters, and fisheries that change as you travel down it.",
  "measured", "curious", ["fresh", "brackish", "three waters"], 0.6,
  [("animation", "Map: Songkhla Lake with three-colour gradient fresh → brackish, labels Thale Noi / Thale Luang / Thale Sap"),
   ("broll", "Wikimedia photo: Songkhla Lake fishermen")], 0),
 ("f15", "15 · Two coasts, opposite seasons",
  "Number fifteen. Two coasts, opposite seasons. On the Andaman side, Phuket and Krabi are wettest from May to October. "
  "On the Gulf side, Koh Samui gets its heaviest rain later, around October to December. For a tourism economy, that's a built-in hedge. One coast is almost always in season.",
  "conversational", "insightful", ["opposite", "built-in hedge"], 0.6,
  [("animation", "Split map: Andaman vs Gulf coasts with month bars"), ("broll", "Phuket and Koh Samui aerials (Pixabay)")], 0),
 ("f14", "14 · A capital at sea level",
  "Number fourteen. A capital at sea level. Bangkok has millions of people and gleaming towers, yet much of it sits just half a meter to two meters above the sea. "
  "It grew up on a river delta, laced with canals, where land and water were always hard to tell apart.",
  "measured", "calm", ["half a meter", "two meters"], 0.6,
  [("broll", "Bangkok canals and Chao Phraya aerial (Pixabay)"), ("stat_card", "0.5–2 m above sea level")], 0),
 ("f13", "13 · Sinking faster than the sea rises",
  "Number thirteen. Sinking faster than the sea is rising. Parts of Bangkok have been subsiding one to two centimeters a year, and in the past some areas sank as much as three, while the sea rises only a few millimeters. "
  "The main culprit was groundwater pumped out for homes and industry. Limits on pumping have slowed it, but in a city this low, every centimeter counts.",
  "measured", "concerned but even", ["one to two centimeters", "few millimeters", "every centimeter"], 0.6,
  [("stat_card", "Land −1–2 cm/yr vs sea +~4 mm/yr — side-by-side bars"), ("broll", "Bangkok street / flood footage")], 0),
 ("f12", "12 · A city built on a seabed",
  "Number twelve. A city built on a seabed. Why does Bangkok sink so easily? Because of what's underneath: Bangkok clay, soft marine mud laid down when the sea once reached deep into the central plain. "
  "It's so soft that most big buildings stand on piles driven twenty to fifty meters down, to reach firmer sand.",
  "measured", "explanatory", ["seabed", "Bangkok clay", "twenty to fifty meters"], 0.6,
  [("diagram", "Cross-section: tower on piles through soft clay to sand layer at 20–50 m"), ("broll", "Bangkok construction piling (Pixabay)")], 0),
 ("f11", "11 · A canyon inside a river",
  "Number eleven. A canyon inside a river. On the Mekong in Ubon Ratchathani, there's a landscape people call Thailand's Grand Canyon: Sam Phan Bok, roughly three thousand holes. "
  "For half the year you can't see it at all. Then, in the dry season, roughly November to April, the river drops and reveals sandstone carved into bowls and channels by rushing water.",
  "measured", "awe", ["Grand Canyon", "three thousand", "can't see it"], 0.6,
  [("animation", "Map pin on the Mekong, Ubon Ratchathani pops amber"), ("broll", "Wikimedia photos: Sam Phan Bok rock holes")], 0),
 ("f10", "10 · Two rivers that won't mix",
  "Number ten. Two rivers that won't mix. Just downstream, at Khong Chiam, the Mun River flows into the Mekong. "
  "And for a stretch, the two run side by side: the Mekong a muddy brown, the Mun a clearer blue-green. Locals call it the Two-Colored River.",
  "conversational", "light", ["side by side", "Two-Colored River"], 0.6,
  [("animation", "Map: Mun and Mekong lines in two colours meeting at Khong Chiam pin"), ("broll", "Wikimedia/Veo: confluence")], 0),
 # ── ACT 3 ─────────────────────────────────────────────
 ("s04", "Act 3 · The Money",
  "Which brings us to the part most people never connect to Thailand: how much of the world's stuff passes through it.",
  "conversational", "pivot, building", ["world's stuff"], 0.4,
  [("overlay", "Act card 'THE MONEY'")], 0),
 ("f09", "9 · The flood that hit your computer",
  "Number nine. The flood that hit your computer. "
  "In 2011, Thailand built somewhere between a quarter and forty percent of the world's hard drives. When the factories went under water, prices jumped worldwide.",
  "measured", "reveal", ["quarter", "forty percent", "worldwide"], 0.6,
  [("broll", "Wikimedia: Ayutthaya 2011 flood photo"), ("stat_card", "25–40% of world hard drives"),
   ("animation", "Provinces → Ayutthaya pops amber, red pin ticks → NASA EO-1 before/after wipe, '↑ 30%+'")], 0),
 ("f08", "8 · A third of the world's rubber",
  "Number eight. A third of the world's rubber. Tyres, medical gloves, shoe soles. In 2024, Thailand produced around a third of the world's natural rubber, "
  "and more than half of the world's exported latex concentrate. Much of it is still tapped by hand, tree by tree, before dawn.",
  "measured", "tactile", ["a third", "more than half", "by hand"], 0.6,
  [("broll", "Wikimedia: rubber tapping in Thailand"), ("stat_card", "~33% of world natural rubber · 53% of latex exports")], 0),
 ("f07", "7 · The four-billion-dollar fruit",
  "Number seven. The four-billion-dollar fruit. It's spiky, it's heavy, and its smell gets it banned from hotels. "
  "In 2024, Thailand sold about four billion dollars of durian to China alone. But Vietnam is catching up fast, and its share of China's durian market jumped from about a third to over forty percent in a single year.",
  "conversational", "playful → competitive", ["four billion", "China alone", "catching up"], 0.6,
  [("broll", "Wikimedia: durian"), ("animation", "Map arc Thailand → China; share bars Thailand vs Vietnam 2023→2024")], 0),
 ("f06", "6 · Tuna, without the tuna",
  "Number six. Tuna, without the tuna. Thailand ships more than a quarter of the world's canned tuna exports. You'd assume the fish come from Thai waters. "
  "They don't. Thailand imports over ninety percent of the tuna it cans, from across the Pacific and Indian Oceans. It has the factories, the ports and the know-how. That's a processing economy in a single can.",
  "measured", "wry reveal", ["They don't", "ninety percent", "single can"], 0.6,
  [("animation", "Map: import arrows from Pacific/Indian Ocean into Thailand, export arrows out"), ("stat_card", "28% of canned tuna exports · >90% raw tuna imported"),
   ("broll", "Veo: cannery line (illustrative)")], 0),
 ("f05", "5 · Ten million tonnes of rice",
  "Number five. Ten million tonnes of rice. In 2024, Thailand exported about nine point nine five million tonnes, worth more than two hundred and twenty-five billion baht. "
  "That keeps it among the top two exporters on Earth, in a constant race with India and Vietnam. Its famous jasmine rice, Hom Mali, grows largely in the dry northeast.",
  "measured", "steady", ["ten million", "top two"], 0.6,
  [("broll", "Thai rice field aerials (Pixabay)"), ("stat_card", "9.95 Mt · 225.7 bn THB (2024)")], 0),
 ("f04", "4 · Your air-con might be Thai",
  "Number four. Your air conditioner might be Thai. Thailand sits in one of Asia's hottest climates, and it cools the rest of the world too. "
  "In recent years it has ranked as the world's second-largest exporter of air conditioners, behind only China, at around seven billion dollars a year.",
  "conversational", "light irony", ["air conditioner", "second-largest", "seven billion"], 0.6,
  [("broll", "Veo/Pixabay: AC units on buildings, factory line (illustrative)"), ("stat_card", "#2 AC exporter · ~$7 bn/yr")], 0),
 ("f03", "3 · The Detroit of Asia",
  "Number three. The Detroit of Asia. In 2024, Thailand built about one point four seven million vehicles and exported more than a million of them. "
  "Its specialty is the one-ton pickup, shipped around the world. It's still Southeast Asia's biggest car maker, even as the industry shifts to electric.",
  "brisk", "confident", ["Detroit of Asia", "more than a million", "one-ton pickup"], 0.6,
  [("broll", "Car assembly / port car carriers (Pixabay)"), ("stat_card", "1.47 M built · 1.02 M exported (2024)")], 0),
 ("f02", "2 · A sugar superpower",
  "Number two. A sugar superpower. You probably think of Thailand for beaches, not sugar. But it exports roughly three-quarters of the sugar it makes, "
  "and has ranked as the world's second-largest exporter, behind only Brazil. So when drought cut Thailand's cane harvest in 2023, traders everywhere paid attention.",
  "measured", "building to climax", ["three-quarters", "behind only Brazil", "everywhere"], 0.8,
  [("broll", "Wikimedia: sugarcane harvest Thailand"), ("animation", "World map: Brazil #1, Thailand #2 export pins")], 0),
 ("f01", "1 · The lost land",
  "And number one. The lost land. About twenty thousand years ago, at the height of the last Ice Age, sea levels were roughly one hundred and twenty meters lower than today. "
  "The Gulf of Thailand, where container ships sail now, was dry land. So was much of the shallow sea between mainland Asia, Sumatra, Java and Borneo. "
  "You could have walked from Thailand to Borneo. Then the ice melted, the seas rose, and that lost world slipped beneath the water. Scientists call it Sundaland.",
  "slow", "awe, cinematic", ["dry land", "walked", "Sundaland"], 1.0,
  [("animation", "Globe/sat map: sea level drops 120 m — Sunda Shelf emerges as land, then floods back; label SUNDALAND"),
   ("broll", "Veo: Ice Age Sunda grassland and rivers (illustrative, labelled)")], 0),
 ("s05", "Outro",
  "The shape of the land, the movement of water, the flow of trade. That's the geography behind the economy. This is The Sundaland.",
  "slow", "warm sign-off", ["geography", "economy", "The Sundaland"], 1.0,
  [("overlay", "End card: logo + ECONOMY GEOGRAPHY + subscribe / next video")], 3.5),
]

def words(t): return len(re.findall(r"[A-Za-z0-9'’-]+", t))

sections, t = [], 0.0
for sid, label, text, pace, energy, emph, pause_after, cues, gap_after in S:
    dur = words(text) / WPM * 60 + (TITLE_PAUSE if label[0].isdigit() else 0)
    st, en = round(t, 2), round(t + dur, 2)
    sec = {"id": sid, "label": label, "text": text, "start_seconds": st, "end_seconds": en,
           "speaker_directions": f"{pace} pace, {energy}. Lean on: {', '.join(emph)}." + (" Brief beat after the numbered title." if label[0].isdigit() else ""),
           "delivery_cues": {"pace": pace, "energy": energy, "emphasis_words": emph, "pause_after_seconds": pause_after,
                             "delivery_note": "Numbered title read as its own short phrase, then the setup; slow down on the number that pays it off." if label[0].isdigit() else "One idea, one breath.",
                             "provider_text": text},
           "enhancement_cues": [{"type": ty, "description": d, "timestamp_seconds": round(st + i * max(dur / max(len(cues), 1), 3), 1)} for i, (ty, d) in enumerate(cues)],
           "pronunciation_guides": [], "source_ref": "research_brief"}
    sections.append(sec)
    t = en + pause_after + SECTION_GAP + gap_after

pg = [("Prachuap Khiri Khan", "pra-CHOO-ap KHEE-ree KHAN"), ("Krung Thep", "kroong TEP"), ("Doi Inthanon", "doy in-ta-NON"),
      ("mae khaning", "meh kha-NING"), ("Songkhla", "SONG-kla"), ("Thale Noi", "ta-LAY noy"), ("Ubon Ratchathani", "oo-BON rat-cha-ta-NEE"),
      ("Sam Phan Bok", "sahm pahn BOK"), ("Khong Chiam", "kong CHEE-am"), ("Mun", "moon"), ("Ayutthaya", "ah-YOO-tah-yah"), ("Hom Mali", "hom MAH-lee")]
for sec in sections:
    sec["pronunciation_guides"] = [{"word": w, "phonetic": p} for w, p in pg if w.lower() in sec["text"].lower()]

total_words = sum(words(x[2]) for x in S)
script = {
 "version": "1.0",
 "title": "20 Facts About Thailand That Sound Fake (But Aren't)",
 "total_duration_seconds": round(t, 1),
 "voice_performance": {
   "performance_intent": "Calm, curious documentary narrator who enjoys the twist; credible, never hype.",
   "pacing_profile": "conversational",
   "energy_curve": "Measured hook → warmer act 1 → steady, explanatory act 2 → building confidence in act 3 → slow, awed #1 → warm sign-off.",
   "pause_policy": "Numbered titles get a 0.7 s beat; 0.6 s after each fact's payoff number; 1.0 s before and after #1. Pauses are produced by splitting narration into per-sentence clips and inserting silence (Chirp3-HD voices ignore SSML breaks).",
   "sample_section_id": "f09",
   "provider_notes": {"google_tts": "voice en-US-Chirp3-HD-Orus, speaking_rate 0.98 (approved in sample v4); plain text per sentence, silence inserted in edit"}},
 "sections": sections,
 "metadata": {"words": total_words, "wpm_assumed": WPM, "sting_after": "s01", "target_minutes": [8, 10],
              "verify_resolved": {"bangkok_piles": "most buildings on piles 20–50 m to reach sand (geotech literature)",
                                  "two_colored_river": "Mekong muddy brown, Mun clearer blue-green; season claim removed (sources conflict)"}},
}
json.dump(script, open(HERE / "script.json", "w"), indent=2, ensure_ascii=False)

md = [f"# {script['title']} — locked script (draft for approval)\n",
      f"**{total_words} words · est. {t/60:.1f} min** at {WPM} wpm incl. title beats, pauses, logo sting and end card.\n"]
for sec in sections:
    m, s_ = divmod(sec["start_seconds"], 60)
    md.append(f"\n### {int(m)}:{s_:04.1f} · {sec['label']}\n\n{sec['text']}\n")
open(HERE.parent / "script_locked.md", "w").write("\n".join(md))
print("words", total_words, "total_s", round(t, 1), "min", round(t / 60, 2), "sections", len(sections))
