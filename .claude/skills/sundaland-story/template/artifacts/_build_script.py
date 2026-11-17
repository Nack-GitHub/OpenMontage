"""Script for 'The Pacific War Started Here, Not Pearl Harbor' → script.json + script_locked.md (Thai notes)."""
import json, re
from pathlib import Path
from lib.checkpoint import write_checkpoint

HERE = Path(__file__).resolve().parent
WPM, VWPM = 160, 150          # narrator (Brian) / character lines
SECTION_GAP = 0.5

VOICES = {"brian": ("nPczCjzI2devNBz1zQrb", "narrator"),
          "daniel": ("onwK4e9ZLuTAKqWW03F9", "British/Indian Army phone — radio filter"),
          "charlie": ("IKne3meq5aSn9XLyUdCD", "RAAF Hudson crew (Australian) — radio filter"),
          "will": ("bIHbv24MWmeRgasZH58o", "Japanese radio (neutral English) — radio filter"),
          "liam": ("TX3LPaxmHKxFdv7VOQHJ", "Thai cadet (young, neutral) — light field filter")}

# (id, label, voice, text, pace, energy, emphasis, pause_after, cues[(type, desc)], extra_gap_after, story_note_th)
S = [
 # ── COLD OPEN ──────────────────────────────────────
 ("s00", "Cold open · the beach", "brian",
  "It's a few minutes past midnight on the eighth of December, 1941. On Sabak beach, on the northeast coast of Malaya, an Indian soldier on watch sees three shapes on the dark sea. They are not fishing boats.",
  "slow", "hushed tension", ["midnight", "three shapes", "not fishing boats"], 0.4,
  [("broll", "Night surf on a tropical beach, moonlight (Pixabay, ILLUSTRATIVE)"),
   ("animation", "Globe whip → satellite map → Malaya flag silhouette pops → zoom to Kota Bharu; HUD clock 00:0x"),
   ("doodle", "Defender lookout (df_lookout) on white panel, three ship sprites slide in on the horizon")], 0,
  "Hook เปิดกลางเหตุการณ์ (in medias res) + ภาพเฉพาะเจาะจง 'สามเงา'"),
 ("v01", "Voice · sentry on the field phone", "daniel",
  "Three ships off Sabak beach, sir. Big ones. They're dropping anchor.",
  "urgent", "low, tense", ["Three ships"], 0.3,
  [("doodle", "df_phone — speech bubble, phone crackle SFX")], 0, "บทพูดตัวละครนิรนาม (ไม่ใช่คนจริง)"),
 ("s01", "Cold open · the clock", "brian",
  "They're Japanese troop transports, about three kilometres offshore, carrying more than five thousand soldiers. At around half past midnight, their escorts open fire on the beach. "
  "Far across the Pacific, in Hawaii, it's dawn on Sunday. The first wave of Japanese planes is already in the air, but it won't reach Pearl Harbor for more than an hour. By most accounts, seventy-eight minutes. "
  "So the Pacific War didn't start at Pearl Harbor. It started here. And to understand why Japan came to this beach at all, you have to follow the oil.",
  "measured", "tension → revelation", ["three kilometres", "more than an hour", "seventy-eight minutes", "started here", "follow the oil"], 0.8,
  [("animation", "Map: 3 ship icons anchor 3 km off Sabak; muzzle-flash bursts on the shore"),
   ("hud", "Dual HUD clock: KOTA BHARU 00:30 · HAWAII 06:30 SUN → counter 'T-78 MIN' (source tag: Wikipedia/AWM, 'times vary by source')"),
   ("overlay", "Title card 'THE PACIFIC WAR STARTED HERE' then logo sting")], 2.6,
  "นาฬิกานับถอยหลังชั้นเล็ก (78 นาที) + คำถามค้าง 'ทำไมมาที่นี่' → ปมของทั้งเรื่อง"),
 # ── ACT 1 · THE CLOCK ──────────────────────────────
 ("a1", "Act 1 · The Clock", "brian",
  "Rewind four months. In the summer of 1941, Japan is fighting a war in China it cannot finish, and it's fighting it on borrowed fuel. "
  "Japan produces almost no oil of its own. Around eighty percent of what it imports comes from one country: the United States.",
  "conversational", "explanatory, calm", ["borrowed fuel", "eighty percent", "the United States"], 0.5,
  [("overlay", "Act card 'ACT ONE · THE CLOCK' over satellite map of East Asia"),
   ("doodle", "Host (host_clipboard) beside oil_barrel; arrow of barrels from USA to Japan"),
   ("hud", "Ring: ~80% of Japan's oil imports from the US (source)")], 0,
  "Setup: ทำไมต้องสนใจ — วางเดิมพันทางเศรษฐกิจ"),
 ("a2", "Act 1 · The freeze", "brian",
  "In July 1941, after Japanese troops move into southern French Indochina, Washington freezes Japanese assets. Within days, American oil stops flowing. Britain and the Dutch follow. "
  "Japan has stockpiled around fifty-four million barrels. Estimates of how long that would last range from about one year to two. Either way, a clock is now running. And every month Japan waits, its fleet gets weaker.",
  "measured", "tightening", ["freezes", "stops flowing", "one year to two", "a clock is now running"], 0.6,
  [("doodle", "padlock + chain snaps onto the oil_barrel; host_shock"),
   ("hud", "Fuel gauge (fuel_gauge sprite → HUD gauge) draining; '≈54 M bbl · 1–2 yrs (estimates vary)'")], 0,
  "นาฬิกาชั้นใหญ่ (เกจน้ำมัน) — ใช้คำเลี่ยงเพราะตัวเลขขัดกัน"),
 ("a2b", "Act 1 · The decision", "brian",
  "In September, at a conference before the Emperor, Japan's leaders agree: if talks with Washington fail, they will go to war. Through the autumn, the talks go nowhere. "
  "By late November, the decision is made, and the invasion fleets are already moving.",
  "measured", "ominous", ["before the Emperor", "go to war", "already moving"], 0.5,
  [("animation", "Calendar strip SEP → OCT → NOV ticking on the HUD while the gauge keeps draining"),
   ("doodle", "host_sad")], 0,
  "เร่งนาฬิกา — เวลาเหลือน้อยลงเรื่อยๆ"),
 ("a3", "Act 1 · The prize", "brian",
  "So Japan's planners look south, at Sundaland. The Dutch East Indies, today's Indonesia, is the world's fourth-largest oil exporter, with oil fields in Borneo and Sumatra. "
  "Next door, British Malaya grows something the whole industrial world runs on. In 1940, it shipped about thirty-nine percent of the world's rubber, for tyres, hoses, and every machine of war. "
  "And it's the world's biggest exporter of tin, the metal that lines food cans and solders electronics. Oil, rubber, tin. Almost everything Japan's war machine is missing sits on one shallow shelf of sea and islands.",
  "measured", "reveal, a little awe", ["Sundaland", "fourth-largest", "thirty-nine percent", "tin", "Oil, rubber, tin"], 0.6,
  [("animation", "Map whip south: Indonesia & Malaysia flag pops; pins on Borneo/Sumatra oil fields with oil_derrick icons"),
   ("hud", "Ring 39% world rubber (Dunlop 1940) · bar: Malaya #1 tin exporter (1939)"),
   ("doodle", "rubber_tap + tin_ingots + oil_derrick pop in a row; host_point")], 0,
  "ปูไว้ (setup) — ต้นยาง = ของรางวัล จะกลับมาเฉลยใน Act 3"),
 ("a4", "Act 1 · The shield", "brian",
  "But there's a problem. Guarding the sea lanes to all of it is the British naval base at Singapore. And watching from Hawaii is the American Pacific Fleet. "
  "So Japan decides to strike everything at once. Pearl Harbor will be the shield. The target is Sundaland. And the first blow won't fall in Hawaii. It will fall on a beach in Kelantan.",
  "measured", "ominous", ["Singapore", "at once", "the shield", "The target is Sundaland", "Kelantan"], 0.8,
  [("animation", "Wide Pacific map: Singapore pin, Pearl Harbor pin; arrows fan out from Japan; push back to Kota Bharu"),
   ("doodle", "host_think with '?' → host_point at the map")], 0,
  "พลิกมุมมอง (reframe) + จุดค้างท้าย Act → ดึงเข้า Act 2"),
 ("a5", "Act 1 · Why these beaches", "brian",
  "Why Kelantan, and why Thailand? Look at the map. Singapore's defences were built mainly to face the sea. The back door is the long, narrow Malay Peninsula. "
  "Land at Songkhla and Pattani in southern Thailand, and you get the ports, the roads and the railway that run straight into northern Malaya. "
  "Land at Kota Bharu, and you take the airfield whose bombers could hit your convoys. Geography decides the plan.",
  "measured", "teacher, clear", ["Look at the map", "back door", "railway", "airfield", "Geography decides the plan"], 0.6,
  [("animation", "Map: Singapore coastal-gun arcs face the sea; peninsula highlighted as the 'back door'; Songkhla/Pattani road+rail lines draw into Kedah; Kota Bharu airfield radius circle over the Gulf"),
   ("doodle", "host_point at a map; then host_clipboard")], 0,
  "เลนส์ภูมิศาสตร์ของช่อง — อธิบายด้วยแผนที่ล้วน"),
 # ── ACT 2 · THE NIGHT ──────────────────────────────
 ("b1", "Act 2 · The convoy", "brian",
  "In early December, the invasion convoy sails south from Hainan Island. On the seventh, an RAF Catalina flying boat finds it. Japanese aircraft shoot the Catalina down before any report gets through. "
  "Just before midnight, the convoy splits. Most of it turns toward the beaches of southern Thailand. Three transports head for Kota Bharu, near the Thai border, where the British have an airfield.",
  "measured", "building", ["Hainan", "before it can radio", "splits", "Kota Bharu"], 0.5,
  [("overlay", "Act card 'ACT TWO · THE NIGHT'"),
   ("animation", "Oblique-3D ship convoy follow-cam from Hainan down the Gulf; Catalina icon blinks out; convoy splits into two arrows"),
   ("photo", "Wikimedia: Japanese transport / period map (credit)")], 0,
  "ไต่ระดับความตึง — ศัตรูเกือบถูกเจอแต่ข่าวไม่ถึง"),
 ("b2", "Act 2 · The defenders", "brian",
  "Waiting on shore are the Dogras: the third battalion of the 17th Dogra Regiment, part of the 8th Indian Brigade under Brigadier B. W. Key. They hold about sixteen kilometres of beach, with pillboxes and wire.",
  "measured", "steady", ["Dogras", "sixteen kilometres", "pillboxes"], 0.4,
  [("animation", "Map zoom: Badang & Sabak beaches labelled; 16 km survey line along the coast"),
   ("photo", "Name card: Brig. B.W. Key (if PD photo found) else unit badge"),
   ("doodle", "df_lookout / df_run on white panel")], 0,
  "คนจริงพร้อมยศ (name card แบบ Yarnhub)"),
 ("b3", "Act 2 · The landing", "brian",
  "At around half past midnight, the shelling begins. Landing craft push through heavy surf in the dark, and the pillboxes open up. "
  "Colonel Masanobu Tsuji, a Japanese staff officer, later wrote that the men on that beach could not raise their heads.",
  "brisk", "tense", ["half past midnight", "heavy surf", "could not raise their heads"], 0.3,
  [("animation", "Map: landing_boat icons cross the surf line; tracer streaks from pillbox pins"),
   ("doodle", "jp_wade in blue crayon waves (no combat shown)")], 0,
  "เล่ามุมฝ่ายญี่ปุ่นด้วยคำพูดที่มีแหล่งอ้างอิง (Tsuji)"),
 ("v02", "Voice · Japanese radio", "will",
  "First wave ashore. Heavy fire from the pillboxes. Send in the second wave.",
  "clipped", "strained", ["First wave ashore"], 0.3,
  [("doodle", "jp_radio — speech bubble, radio static")], 0, "บทพูดตัวละครนิรนาม"),
 ("v02b", "Voice · Dogra position on the phone", "daniel",
  "Enemy landing at Sabak! Boats in the surf. We need the guns, now!",
  "urgent", "shouting over noise", ["Enemy landing"], 0.3,
  [("doodle", "df_shout → df_phone, bubble")], 0, "ตัดสลับสองฝั่งแบบถาม-ตอบ"),
 ("b4", "Act 2 · The Hudsons", "brian",
  "Two miles inland, at Kota Bharu airfield, the Australians of Number One Squadron scramble their Lockheed Hudson bombers. In the dark, Flight Lieutenant John Lockwood dives on the biggest transport, the Awazisan Maru.",
  "brisk", "rising", ["Australians", "Hudson", "John Lockwood", "Awazisan Maru"], 0.2,
  [("photo", "Wikimedia: RAAF Hudsons at Kota Bharu, 1941 (AWM, credit)"),
   ("doodle", "warplane sprite dives across the white panel toward transport_ship")], 0,
  "เป้าหมาย + อุปสรรคของตัวละครจริง (Lockwood ต้องหยุดเรือ)"),
 ("v03", "Voice · Hudson crew", "charlie",
  "She's burning! Coming round for another run.",
  "urgent", "adrenaline", ["burning"], 0.3,
  [("doodle", "transport_ship with crayon flames; bubble")], 0, "บทพูดตัวละครนิรนาม (ลูกเรือ)"),
 ("b5", "Act 2 · Ashore anyway", "brian",
  "All three transports are hit. The Awazisan Maru is left burning and abandoned. But the troops are already in the boats. By mid-morning, three Japanese battalions are ashore. "
  "And at one forty-eight, Malayan time, the first bombs fall on Pearl Harbor. By then, Kota Bharu has been under fire for more than an hour.",
  "measured", "grim turn → climax", ["already in the boats", "three Japanese battalions", "one forty-eight", "more than an hour"], 0.8,
  [("hud", "Dual clock hits KOTA BHARU 01:48 · HAWAII 07:48 — counter flips to '+78 MIN' (pin burst on Pearl Harbor)"),
   ("animation", "Map: Pearl Harbor pin bursts far right while Kota Bharu pins stay lit")], 0,
  "Try–fail: ยิงเรือได้แต่ยังขึ้นฝั่ง → Climax นาฬิกาถึง 01:48"),
 ("b6", "Act 2 · Seven beaches", "brian",
  "And Kota Bharu isn't alone. That same night, Japanese troops come ashore at seven places along Thailand's coast: Songkhla, Pattani, Nakhon Si Thammarat, Surat Thani, Chumphon, Prachuap Khiri Khan, and Samut Prakan, near Bangkok. "
  "Thailand is neutral, and Japan has demanded passage. But the prime minister can't be reached. While Bangkok's leaders wait for him, the landings begin.",
  "measured", "widening", ["isn't alone", "seven places", "neutral", "can't be reached"], 0.5,
  [("animation", "Map whip to Thailand: flag silhouette pops; 7 red pins tick down the coast in order with ray bursts"),
   ("doodle", "th_radio — cadet listening to the radio")], 0,
  "ตัดสลับหลายมุมมอง (Kota Bharu → ไทย)"),
 ("b7", "Act 2 · Chumphon", "brian",
  "At Chumphon, on the narrow neck of the peninsula, the defenders include soldiers, police, and schoolboys. They're Yuwachon Thahan, youth cadets from the local secondary school. "
  "With the 38th Infantry Battalion, they take up positions at the Tha Nang Sang bridge.",
  "measured", "intimate", ["schoolboys", "Yuwachon Thahan", "Tha Nang Sang"], 0.3,
  [("animation", "Map zoom: Chumphon province pops amber; pin on Tha Nang Sang bridge"),
   ("photo", "Wikimedia: diorama of the Battle of Tha Nang Sang Bridge, National Memorial (credit)"),
   ("doodle", "th_run → th_sandbags")], 0,
  "รายละเอียดเฉพาะที่สะเทือนใจ: 'นักเรียนมัธยม'"),
 ("v04", "Voice · Thai cadet", "liam",
  "They're coming up the road! Hold the bridge!",
  "urgent", "young, brave", ["Hold the bridge"], 0.3,
  [("doodle", "th_sandbags — bubble")], 0, "บทพูดตัวละครนิรนาม"),
 ("b8", "Act 2 · Cease fire", "brian",
  "Among the Thai dead is Captain Thawin Niyomsen. The cadets hold their ground until the afternoon, when an order arrives from Bangkok. Cease fire. "
  "Across the south, Thai resistance lasts only hours. Within two weeks, Thailand signs an alliance with Japan.",
  "slow", "quiet, respectful", ["Thawin Niyomsen", "Cease fire", "only hours", "alliance"], 1.2,
  [("animation", "Map only (no doodle): pin dims; text 'CAPT. THAWIN NIYOMSEN · KILLED IN ACTION' in Plex Mono"),
   ("doodle", "after the death line only: th_worried listening as the order arrives")], 0,
  "เว้นเงียบหลังการเสียชีวิต + ห้ามใช้ doodle ตอนที่มีคนตาย"),
 ("v04b", "Voice · Thai cadet, the order", "liam",
  "Cease fire? Now? ... Yes, sir.",
  "slow", "stunned", ["Cease fire"], 0.6,
  [("doodle", "th_worried — bubble, long hold")], 0, "ช่วงเงียบทางอารมณ์ก่อนเปลี่ยน Act"),
 # ── ACT 3 · THE ROAD SOUTH ─────────────────────────
 ("c1", "Act 3 · The race", "brian",
  "Kota Bharu falls on the ninth of December. Then the race begins. Japan's 25th Army, under General Tomoyuki Yamashita, has to cover the length of the Malay Peninsula, about a thousand kilometres, to reach Singapore.",
  "brisk", "momentum", ["the race begins", "Yamashita", "a thousand kilometres"], 0.4,
  [("overlay", "Act card 'ACT THREE · THE ROAD SOUTH'"),
   ("photo", "Name card: Gen. Tomoyuki Yamashita (Wikimedia, PD)"),
   ("animation", "Map: long dashed route down the peninsula, survey line '≈1,000 km'")], 0,
  "เปลี่ยนจังหวะเป็นการไล่ล่า"),
 ("c1b", "Act 3 · The sea lanes", "brian",
  "Two days later, Britain loses the sea. On the tenth of December, Japanese bombers find the battleship Prince of Wales and the battlecruiser Repulse off Kuantan, and sink them both. "
  "The ships sent to protect the route to Singapore are gone. From now on, the peninsula is a land race, and Japan is already ahead.",
  "measured", "shock", ["loses the sea", "sink them both", "land race"], 0.6,
  [("animation", "Map: two ship icons off Kuantan; red pin bursts; shipping lane fades from British blue to Japanese amber"),
   ("photo", "Wikimedia: HMS Prince of Wales, 1941 (PD, credit)")], 0,
  "จุดหักเห (turning point) — ฝ่ายป้องกันเสียทะเล"),
 ("c2", "Act 3 · Bicycles", "brian",
  "And here, the prize gets in the way. Malaya's rubber estates and jungle make heavy tanks a liability. So Japan does something that sounds absurd. It rides. "
  "Around eighteen thousand bicycles carry its infantry down the roads between the rubber trees. According to one Japanese account, when tyres burst in the heat, soldiers ride on the rims, and the clatter at night is mistaken for tanks. "
  "The rubber Japan came for is, quite literally, under its wheels.",
  "conversational", "wry, then pointed", ["the prize gets in the way", "It rides", "eighteen thousand", "on the rims", "under its wheels"], 0.6,
  [("doodle", "jp_bicycle sprites slide right in a line past rubber_tap trees (hop on bumps); host_shrug"),
   ("hud", "Count-up: ~18,000 bicycles"),
   ("animation", "Map: bicycle icons ride the dashed route (cargo on the line)")], 0,
  "เฉลยสิ่งที่ปูไว้ (payoff): ต้นยางที่มาแย่ง กลายเป็นตัวกำหนดวิธีบุก"),
 ("v05", "Voice · Japanese cyclist", "will",
  "Tyre's gone. Keep riding. Ride on the rims!",
  "breathless", "determined", ["Keep riding"], 0.3,
  [("doodle", "jp_bicycle — bubble")], 0, "บทพูดตัวละครนิรนาม"),
 ("c2b", "Act 3 · Down the peninsula", "brian",
  "Penang is abandoned in mid-December. Kuala Lumpur falls on the eleventh of January. At the end of January, the last defenders cross the causeway onto Singapore island and blow a gap in it behind them. "
  "About a week later, Japanese troops cross the Johor Strait in the dark.",
  "brisk", "relentless", ["Kuala Lumpur", "causeway", "in the dark"], 0.5,
  [("animation", "Map: pins tick down the peninsula with date labels (Penang · KL 11 JAN · Causeway 31 JAN · Johor Strait 8 FEB); bicycle icons keep riding"),
   ("hud", "Day counter running: DAY 10 → 35 → 54 → 62")], 0,
  "จังหวะเร็วแบบมอนทาจ — นับวันต่อเนื่อง"),
 ("c3", "Act 3 · Singapore", "brian",
  "On the fifteenth of February, 1942, about seventy days after the first shells fell on Sabak beach, Singapore surrenders. It's the largest surrender in British military history. "
  "Within weeks, Japanese troops are in the Dutch East Indies, taking the oil fields of Borneo and Sumatra. Sundaland's oil, rubber and tin, the prize behind the whole southern strike, are now in Japanese hands.",
  "measured", "heavy", ["seventy days", "largest surrender", "oil fields", "in Japanese hands"], 0.8,
  [("photo", "Wikimedia: Percival's party under flags of truce, 15 Feb 1942 (PD, credit)"),
   ("animation", "Map: Singapore pin bursts; whip to Borneo/Sumatra, oil_derrick pins flip to Japanese control"),
   ("hud", "Counter: DAY 70")], 0,
  "Resolution — ปิดวงของรางวัล"),
 ("c3b", "Act 3 · The twist", "brian",
  "But holding the oil is not the same as moving it. Every barrel still has to cross the sea to Japan, past American submarines. "
  "Tanker after tanker goes down. By 1945, only a trickle of Sundaland's oil is reaching Japan. The war Japan started to escape an oil blockade ends with Japan blockaded again, at sea.",
  "measured", "ironic, sober", ["not the same as moving it", "submarines", "only a trickle", "blockaded again"], 0.8,
  [("animation", "Map: tanker icons leave Borneo/Sumatra toward Japan; most blink out mid-route (cargo-on-line language, losses as fading icons, no explosions)"),
   ("hud", "Gauge from Act 1 returns and drains again (INDICATIVE)"),
   ("doodle", "oil_barrel + padlock return; host_shrug")], 0,
  "พลิกจบ (final irony) — ปิดวงกับนาฬิกาเกจน้ำมันของ Act 1"),
 ("c4", "Epilogue", "brian",
  "The fight on the beaches at Kota Bharu cost the defenders about sixty-eight killed, and Japan more than three hundred. "
  "In Chumphon, a monument stands to the cadets, and every eighth of December, the town marks Wiratai Day, the day of Thai heroes. "
  "We remember Pearl Harbor as the beginning. But the first shots of the Pacific War were fired on a Malayan beach, in a war over oil, rubber, and tin.",
  "slow", "reflective", ["sixty-eight", "Wiratai Day", "Pearl Harbor", "oil, rubber, and tin"], 1.0,
  [("hud", "Small KPI cards: Allied ~68 killed · Japanese ~320 killed (sources)"),
   ("photo", "Chumphon Wiratai / Yuwachon monument (Wikimedia if available)"),
   ("animation", "Pull back from Sabak beach to the region")], 0,
  "ตัวเลขจริงแบบบทส่งท้าย Yarnhub + ตอบคำถามเปิด 'ใครยิงก่อน' ด้วยคำตอบที่ใหญ่กว่า"),
 ("s99", "Outro", "brian",
  "That's the geography behind the economy. This is The Sundaland.",
  "slow", "warm sign-off", ["geography", "economy", "The Sundaland"], 1.0,
  [("overlay", "Globe pull-back (clean) → white pill logo types in → end card 8 s")], 3.5,
  "ประโยคปิดประจำช่อง"),
]

def words(t): return len(re.findall(r"[A-Za-z0-9'’-]+", t))

sections, t = [], 0.0
PACE = {"urgent": "fast", "clipped": "brisk", "breathless": "fast"}
CUE = {"photo": ("broll", "PHOTO: "), "hud": ("stat_card", "HUD: "), "doodle": ("animation", "DOODLE (HyperFrames insert): "),
       "animation": ("animation", "MAP: "), "broll": ("broll", "FOOTAGE: "), "overlay": ("overlay", "")}
for sid, label, voice, text, pace, energy, emph, pause_after, cues, gap_after, note in S:
    pace = PACE.get(pace, pace)
    dur = words(text) / (WPM if voice == "brian" else VWPM) * 60
    st, en = round(t, 2), round(t + dur, 2)
    vid, vrole = VOICES[voice]
    sections.append({
        "id": sid, "label": label, "text": text, "start_seconds": st, "end_seconds": en,
        "speaker_directions": f"VOICE {voice} ({vrole}). {pace} pace, {energy}. Lean on: {', '.join(emph)}.",
        "delivery_cues": {"pace": pace, "energy": energy, "emphasis_words": emph, "pause_after_seconds": pause_after,
                          "delivery_note": "Present tense, one idea per breath." if voice == "brian" else f"Character line, voice_id {vid}; post-filter: {vrole.split('— ')[-1]}",
                          "provider_text": text},
        "enhancement_cues": [{"type": CUE[ty][0], "description": CUE[ty][1] + d, "timestamp_seconds": round(st + i * max(dur / max(len(cues), 1), 2), 1)}
                             for i, (ty, d) in enumerate(cues)],
        "pronunciation_guides": [], "source_ref": "research_brief"})
    t = en + pause_after + SECTION_GAP + gap_after

PG = [("Kota Bharu", "KOH-tah BAH-roo"), ("Sabak", "SAH-bak"), ("Kelantan", "keh-LAHN-tahn"), ("Dogra", "DOH-grah"),
      ("Awazisan Maru", "ah-wah-ZEE-sahn MAH-roo"), ("Masanobu Tsuji", "mah-sah-NOH-boo TSOO-jee"), ("Songkhla", "SONG-kla"),
      ("Pattani", "pat-TAH-nee"), ("Nakhon Si Thammarat", "na-KHON see tam-ma-RAHT"), ("Surat Thani", "soo-RAHT TAH-nee"),
      ("Chumphon", "choom-PON"), ("Prachuap Khiri Khan", "pra-CHOO-ap KHEE-ree KHAN"), ("Samut Prakan", "sa-MOOT pra-KAHN"),
      ("Yuwachon Thahan", "yoo-wa-CHON ta-HAHN"), ("Tha Nang Sang", "TAH nahng SAHNG"), ("Thawin Niyomsen", "ta-WIN nee-YOM-sen"),
      ("Tomoyuki Yamashita", "toh-moh-YOO-kee yah-mah-SHEE-tah"), ("Wiratai", "WEE-ra-tai"), ("Hainan", "HIGH-nahn")]
for sec in sections:
    sec["pronunciation_guides"] = [{"word": w, "phonetic": p} for w, p in PG if w.lower() in sec["text"].lower()]

nar = sum(words(x[3]) for x in S if x[2] == "brian")
dia = [x for x in S if x[2] != "brian"]
script = {
    "version": "1.0",
    "title": "The Pacific War Started Here, Not Pearl Harbor",
    "total_duration_seconds": round(t, 1),
    "voice_performance": {
        "performance_intent": "Present-tense documentary narrator: tense, respectful, never hype. Character lines are short, filtered, unnamed people.",
        "pacing_profile": "conversational",
        "energy_curve": "Hushed cold open → calm explanatory Act 1 tightening to ominous → brisk rising Act 2 → climax at 01:48 → quiet Chumphon → momentum Act 3 → heavy, reflective close.",
        "pause_policy": "Per-sentence clips with inserted silence; 1.2 s after the Chumphon death line; dialogue lines get 0.3 s air either side.",
        "sample_section_id": "b5",
        "provider_notes": {"elevenlabs_tts": "narrator Brian; characters Daniel/Charlie/Will/Liam (premade voice IDs), eleven_multilingual_v2; radio/phone filter in post"}},
    "sections": sections,
    "metadata": {"narration_words": nar, "dialogue_lines": len(dia), "dialogue_chars": sum(len(x[3]) for x in dia),
                 "wpm_assumed": WPM, "sting_after": "s01", "voices": {k: v[0] for k, v in VOICES.items()},
                 "hedges": ["time gap 'by most accounts seventy-eight minutes' (sources 40–90)", "stockpile 'one year to two'",
                            "bicycles 'around eighteen thousand'", "rims/tanks anecdote 'according to one Japanese account'"],
                 "verify_before_tts": ["Optional: Thai source on Capt Thawin's role (script now says only 'among the Thai dead')",
                                       "Brig. B.W. Key name form"],
                 "verified_changes": ["convoy date removed (unverified) -> 'In early December'", "Catalina: 205 Sqn W8417 lost 7 Dec shadowing the fleet",
                                      "tanker twist: imports collapsed 1944-45 (USSBS/JANAC summaries)"]},
}
(HERE / "script.json").write_text(json.dumps(script, indent=2, ensure_ascii=False), encoding="utf-8")

md = [f"# {script['title']} — สคริปต์ร่าง (รออนุมัติ)\n",
      f"**บรรยาย {nar} คำ · บทพูดตัวละคร {len(dia)} ประโยค · ยาวประมาณ {t/60:.1f} นาที** (รวมช่วงหยุด, logo sting, end card)\n",
      "เสียง: Brian = ผู้บรรยาย · Daniel = ฝ่ายอังกฤษ-อินเดีย · Charlie = ลูกเรือ RAAF · Will = ทหารญี่ปุ่น · Liam = ยุวชนไทย\n",
      "> 💡 = หลักการเล่าเรื่องที่ใช้ในช่วงนั้น · 🎬 = ภาพที่วางไว้\n"]
for sec, row in zip(sections, S):
    m, s_ = divmod(sec["start_seconds"], 60)
    who = "" if row[2] == "brian" else f"**[{row[2].upper()}]** "
    md.append(f"\n### {int(m)}:{s_:04.1f} · {sec['label']}\n\n{who}{sec['text']}\n")
    md.append(f"💡 {row[10]}\n")
    md.append("🎬 " + " · ".join(d for _, d in row[8]) + "\n")
md.append("\n---\n**ต้องตรวจก่อนทำเสียง:** " + "; ".join(script["metadata"]["verify_before_tts"]) + "\n")
(HERE.parent / "script_locked.md").write_text("\n".join(md), encoding="utf-8")

write_checkpoint(HERE.parent.parent, HERE.parent.name, "script", "awaiting_human", {"script": script},
                 pipeline_type="animated-explainer", human_approval_required=True)
print("narration words", nar, "| dialogue", len(dia), "lines", script["metadata"]["dialogue_chars"], "chars | est min", round(t / 60, 2),
      "| narration chars", sum(len(x[3]) for x in S if x[2] == "brian"))
