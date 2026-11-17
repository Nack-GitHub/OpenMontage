"""scene_plan.json + scene_plan.md + doodle_beats.md for the Kota Bharu episode (from script.json)."""
import json
from pathlib import Path
from lib.checkpoint import write_checkpoint

HERE = Path(__file__).resolve().parent
script = json.loads((HERE / "script.json").read_text(encoding="utf-8"))
secs = script["sections"]
TOTAL = script["total_duration_seconds"]

PIX = lambda q: {"type": "video", "source": "source", "description": f"Pixabay video (ILLUSTRATIVE FOOTAGE tag): {q}"}
WM = lambda q: {"type": "image", "source": "source", "description": f"Wikimedia Commons photo (PD/CC, credit on screen): {q}"}
MAP = lambda d: {"type": "remotion_map", "source": "generate", "description": f"Remotion satellite map: {d}"}
HUD = lambda d: {"type": "remotion_graphic", "source": "generate", "description": f"Remotion HUD (hud.tsx): {d}"}
GFX = lambda d: {"type": "remotion_graphic", "source": "generate", "description": f"Remotion graphic: {d}"}
GLOBE = lambda d: {"type": "video", "source": "generate", "description": f"render_globe.py: {d}"}
DOOD = lambda i, d: {"type": "video", "source": "generate", "description": f"HyperFrames doodle insert {i} (MP4, white panel): {d}"}

A, B, T, C, D = "animation", "broll", "text_card", "character_scene", "diagram"
DOODLES = {}   # id -> (section, sprites, action, seconds)
def dd(i, sec, sprites, action, secs_):
    DOODLES[i] = (sec, sprites, action, secs_)
    return DOOD(i, action)

# section_id → [(type, weight, role, description, overlay, assets, size, move, hero)]
SHOTS = {
 "s00": [(B, 0.30, "establish_context", "Night surf on a tropical beach, moonlight, slow push", "time chip '8 DEC 1941 · 00:0x'", [PIX("night beach waves moonlight")], "wide", "dolly_in", False),
         (A, 0.45, "establish_context", "Globe whip → satellite map → Malaya (Malaysia flag silhouette, hist. label 'BRITISH MALAYA') → zoom to Sabak beach, Kelantan", "labels", [GLOBE("globe_in → Kota Bharu"), MAP("ColdOpen to Sabak")], "extreme_wide", "zoom_in", True),
         (C, 0.25, "build_tension", "Doodle: Dogra lookout with binoculars; three ship sprites slide onto the horizon line", "none", [dd("D01", "s00", "df_lookout, transport_ship×3, waves", "lookout spots three ships", 4)], "medium", "static", False)],
 "v01": [(C, 1.0, "build_tension", "Doodle: sentry on the field phone, speech bubble", "bubble text = line", [dd("D02", "v01", "df_phone", "phone report, bubble", 3)], "medium", "static", False)],
 "s01": [(A, 0.35, "deliver_payload", "Map: 3 ship icons anchor 3 km off Sabak; muzzle-flash bursts on the shoreline", "'≈5,200 troops' KpiCard", [MAP("ship icons + bursts"), HUD("KpiCard troops")], "wide", "zoom_in", False),
         (A, 0.40, "deliver_payload", "HUD dual clock: KOTA BHARU 00:30 / HAWAII 06:30 SUN; planes icon over Pacific; counter 'T-78 MIN' (source tag)", "source tag 'times vary by source'", [HUD("DualClock + countdown"), MAP("Pacific wide")], "extreme_wide", "zoom_out", True),
         (T, 0.25, "transition", "Title card 'THE PACIFIC WAR STARTED HERE' over the beach footage", "title", [GFX("kinetic title")], "wide", "dolly_in", False)],
 "sting": [(T, 1.0, "transition", "Logo sting (approved)", "logo", [GFX("Sting")], "medium", "static", False)],
 "a1": [(A, 0.30, "transition", "Act card 'ACT ONE · THE CLOCK' over East Asia satellite map", "act title", [MAP("act card")], "extreme_wide", "zoom_in", False),
        (C, 0.35, "introduce_subject", "Doodle: host with clipboard beside an oil barrel; barrels slide USA → Japan", "labels USA / JAPAN", [dd("D03", "a1", "host_clipboard, oil_barrel×4", "barrels slide in from the US side", 5)], "medium", "static", False),
        (A, 0.35, "evidence", "HUD ring '~80% of oil imports from the US' with oil-barrel holo icon", "source", [HUD("Ring 80% + source")], "medium", "static", False)],
 "a2": [(C, 0.35, "build_tension", "Doodle: padlock + chain drops onto the barrel; host shocked", "none", [dd("D04", "a2", "padlock, oil_barrel, host_shock", "padlock locks the barrel", 4)], "medium", "static", False),
        (A, 0.65, "deliver_payload", "HUD fuel gauge draining + KpiCard '≈54 M bbl · 1–2 years (estimates vary)'; map: tanker route US→Japan fades out", "INDICATIVE note", [HUD("Gauge drain + KpiCard"), MAP("US→Japan route fades")], "medium", "static", True)],
 "a2b": [(A, 0.65, "build_tension", "HUD calendar strip SEP → OCT → NOV ticking while the gauge keeps draining", "none", [HUD("calendar strip + gauge")], "medium", "static", False),
         (C, 0.35, "emotional_beat", "Doodle: host head down", "none", [dd("D05", "a2b", "host_sad", "host sighs (breathe)", 3)], "medium", "static", False)],
 "a3": [(A, 0.45, "deliver_payload", "Map whip south: Indonesia & Malaysia flag pops (hist. labels); oil_derrick pins on Borneo/Sumatra fields", "labels", [MAP("NEI + Malaya pops, oil pins")], "extreme_wide", "pan_right", True),
        (A, 0.30, "evidence", "HUD ring 39% world rubber (Dunlop 1940) + bar 'Malaya #1 tin exporter (1939)'", "sources", [HUD("Ring 39% + tin bar")], "medium", "static", False),
        (C, 0.25, "deliver_payload", "Doodle: rubber tree, tin ingots, oil derrick pop in a row; host points", "labels OIL · RUBBER · TIN", [dd("D06", "a3", "rubber_tap, tin_ingots, oil_derrick, host_point", "three prizes pop in", 5)], "medium", "static", False)],
 "a4": [(A, 0.70, "deliver_payload", "Wide Pacific map: Singapore & Pearl Harbor pins; arrows fan out from Japan; push back to Kota Bharu", "labels", [MAP("Pacific strike arrows")], "extreme_wide", "zoom_out", True),
        (C, 0.30, "transition", "Doodle: host thinking '?' → pointing", "none", [dd("D07", "a4", "host_think → host_point", "question → answer swap", 3)], "medium", "static", False)],
 "a5": [(A, 0.75, "deliver_payload", "Map: Singapore sea-facing defences; peninsula 'back door' glow; Songkhla/Pattani road+rail draw into Kedah; Kota Bharu airfield range circle", "labels", [MAP("back-door geography")], "wide", "zoom_in", True),
        (C, 0.25, "transition", "Doodle: host points, then clipboard", "none", [dd("D08", "a5", "host_point → host_clipboard", "pose swap", 3)], "medium", "static", False)],
 "b1": [(A, 0.20, "transition", "Act card 'ACT TWO · THE NIGHT'", "act title", [MAP("act card, night tint")], "extreme_wide", "zoom_in", False),
        (A, 0.60, "build_tension", "Oblique-3D convoy follow-cam from Hainan down the Gulf; Catalina icon blinks out; convoy splits into two arrows (Thailand / Kota Bharu)", "labels", [MAP("Ship3D convoy + split")], "wide", "tracking_right", True),
        (B, 0.20, "evidence", "Archive photo: RAF Catalina (if PD) else night sea footage", "credit", [WM("RAF Catalina Far East 1941"), PIX("night sea")], "wide", "dolly_in", False)],
 "b2": [(A, 0.55, "establish_context", "Map zoom: Badang & Sabak beaches labelled; 16 km survey line along the coast", "survey label", [MAP("survey line 16 km")], "wide", "pan_right", False),
        (B, 0.25, "introduce_subject", "Name card: Brig. B.W. Key (photo if PD) or unit badge", "name card", [WM("Brigadier B.W. Key")], "medium", "dolly_in", False),
        (C, 0.20, "build_tension", "Doodle: Dogra soldier runs to position", "none", [dd("D09", "b2", "df_run", "slide right + hop", 3)], "medium", "tracking_right", False)],
 "b3": [(A, 0.60, "build_tension", "Map: landing_boat icons cross the surf line; tracer streaks from pillbox pins", "none", [MAP("landing craft + tracers")], "wide", "zoom_in", False),
        (C, 0.40, "build_tension", "Doodle: Japanese soldier wading through crayon waves (no combat)", "quote card Tsuji (Plex Mono) over doodle", [dd("D10", "b3", "jp_wade, waves", "wade left→right, bob", 4)], "medium", "tracking_right", False)],
 "v02": [(C, 1.0, "build_tension", "Doodle: Japanese radio operator, bubble", "bubble", [dd("D11", "v02", "jp_radio", "radio report, bubble", 3)], "medium", "static", False)],
 "v02b": [(C, 1.0, "build_tension", "Doodle: Dogra shouting → on the phone, bubble", "bubble", [dd("D12", "v02b", "df_shout → df_phone", "swap + bubble", 3)], "medium", "static", False)],
 "b4": [(B, 0.50, "introduce_subject", "Archive photo: RAAF Hudsons at Kota Bharu, 1941 (AWM via Commons); name card Flt Lt John Lockwood (text only if no photo)", "credit + name card", [WM("A16-50 of C Flight, 8 Squadron at Kota Bharu (AWM)")], "wide", "dolly_in", False),
        (C, 0.50, "build_tension", "Doodle: Hudson sprite dives toward transport ship", "none", [dd("D13", "b4", "warplane, transport_ship, waves", "plane dives across, ship rocks", 3)], "wide", "static", False)],
 "v03": [(C, 1.0, "build_tension", "Doodle: transport ship on fire (new prop), bubble from the plane", "bubble", [dd("D14", "v03", "ship_burning (NEW), warplane", "flames boil, bubble", 3)], "wide", "static", False)],
 "b5": [(A, 0.40, "resolution", "Map: three transport icons burning/damaged; landing pins grow to 3 battalions", "KpiCard '3 battalions ashore by mid-morning'", [MAP("transports + pins"), HUD("KpiCard")], "wide", "static", False),
        (A, 0.60, "deliver_payload", "HUD dual clock hits 01:48 / 07:48 — counter flips '+78 MIN'; Pearl Harbor pin bursts far right while Kota Bharu stays lit", "source tag", [HUD("DualClock climax"), MAP("Pacific wide bursts")], "extreme_wide", "zoom_out", True)],
 "b6": [(A, 0.75, "comparison", "Map whip to Thailand: flag silhouette pops; 7 red pins tick down the coast with names", "labels", [MAP("7 Thai landing pins")], "extreme_wide", "zoom_in", True),
        (C, 0.25, "emotional_beat", "Doodle: Thai cadet listening to the radio", "none", [dd("D15", "b6", "th_radio", "lean in (idle tilt)", 3)], "medium", "static", False)],
 "b7": [(A, 0.35, "establish_context", "Map zoom: Chumphon province pops amber; pin on Tha Nang Sang bridge", "label", [MAP("Chumphon pop + bridge pin")], "wide", "zoom_in", False),
        (B, 0.30, "evidence", "Photo: diorama of the Battle of Tha Nang Sang Bridge, National Memorial (Commons)", "credit", [WM("Diorama of the Battle of Than Nang Sang Bridge (1)")], "medium", "dolly_in", False),
        (C, 0.35, "build_tension", "Doodle: cadet runs, then crouches behind sandbags", "none", [dd("D16", "b7", "th_run → th_sandbags", "slide + swap", 4)], "medium", "tracking_right", False)],
 "v04": [(C, 1.0, "build_tension", "Doodle: cadet behind sandbags, bubble", "bubble", [dd("D17", "v04", "th_sandbags", "bubble, small shake", 3)], "medium", "static", False)],
 "b8": [(A, 0.65, "emotional_beat", "Map only: Chumphon pin dims; Plex Mono line 'CAPT. THAWIN NIYOMSEN · KILLED IN ACTION'; slow drift, 1.2 s silence", "text line", [MAP("pin dim + memorial line")], "wide", "static", True),
        (A, 0.35, "resolution", "Map: ceasefire stamp across southern Thailand; KpiCard 'alliance · 21 Dec 1941'", "KpiCard", [MAP("ceasefire overlay"), HUD("KpiCard")], "extreme_wide", "zoom_out", False)],
 "v04b": [(C, 1.0, "emotional_beat", "Doodle: cadet hears the order, long hold", "bubble", [dd("D18", "v04b", "th_worried", "bubble, hold", 3.5)], "medium", "static", False)],
 "c1": [(A, 0.25, "transition", "Act card 'ACT THREE · THE ROAD SOUTH'", "act title", [MAP("act card")], "extreme_wide", "zoom_in", False),
        (B, 0.30, "introduce_subject", "Name card: Gen. Tomoyuki Yamashita (Commons portrait)", "name card", [WM("Yamashita Tomoyuki.jpg")], "medium", "dolly_in", False),
        (A, 0.45, "deliver_payload", "Map: dashed route down the peninsula, survey line '≈1,000 km'", "survey label", [MAP("peninsula route + survey line")], "extreme_wide", "pan_right", False)],
 "c1b": [(B, 0.35, "evidence", "Archive photo: HMS Prince of Wales, 1941 (Commons, PD)", "credit", [WM("HMS Prince of Wales 1941")], "wide", "dolly_in", False),
         (A, 0.65, "build_tension", "Map: two ship icons off Kuantan; red pin bursts; shipping lane recolours British blue → Japanese amber", "labels", [MAP("Kuantan sinking + lane recolour")], "wide", "zoom_in", True)],
 "c2": [(C, 0.45, "deliver_payload", "Doodle: line of soldiers on bicycles slides right past rubber trees (hop on bumps); host shrugs", "count-up '~18,000 bicycles'", [dd("D19", "c2", "jp_bicycle×4, rubber_tap×3, host_shrug", "bicycle convoy parade", 6)], "wide", "tracking_right", True),
        (A, 0.35, "evidence", "Map: bicycle icons ride the peninsula route (cargo on the line)", "none", [MAP("bicycle icons on route")], "extreme_wide", "pan_right", False),
        (B, 0.20, "evidence", "Rubber plantation rows footage (ILLUSTRATIVE)", "credit", [PIX("rubber plantation rows")], "wide", "tracking_right", False)],
 "v05": [(C, 1.0, "build_tension", "Doodle: cyclist, bubble", "bubble", [dd("D20", "v05", "jp_bicycle", "bubble, bounce", 3)], "medium", "tracking_right", False)],
 "c2b": [(A, 1.0, "build_tension", "Map montage: date pins tick down the peninsula (Penang · KL 11 JAN · Causeway 31 JAN · Johor Strait); HUD day counter DAY 10→62", "date labels", [MAP("date pins montage"), HUD("day counter")], "extreme_wide", "pan_right", False)],
 "c3": [(B, 0.35, "resolution", "Archive photo: Percival's party under flags of truce, 15 Feb 1942 (Commons)", "credit", [WM("Malayan Campaign surrender of Percival")], "medium", "dolly_in", True),
        (A, 0.65, "resolution", "Map: Singapore pin bursts; HUD 'DAY 70'; whip to Borneo/Sumatra, oil pins flip to Japanese control", "KpiCard", [MAP("Singapore + NEI flip"), HUD("DAY 70")], "extreme_wide", "zoom_out", False)],
 "c3b": [(A, 0.60, "deliver_payload", "Map: tanker icons leave Borneo/Sumatra toward Japan; most fade out mid-route (no explosions)", "INDICATIVE", [MAP("tanker fade-out flows")], "extreme_wide", "pan_right", True),
         (A, 0.20, "comparison", "HUD: Act 1 gauge returns and drains again", "INDICATIVE", [HUD("gauge callback")], "medium", "static", False),
         (C, 0.20, "resolution", "Doodle: barrel + padlock return; host shrugs", "none", [dd("D21", "c3b", "oil_barrel, padlock, host_shrug", "callback pose", 3)], "medium", "static", False)],
 "c4": [(A, 0.35, "resolution", "HUD KPI cards: Allied ~68 killed · Japanese ~320 killed (sources)", "sources", [HUD("KpiCards casualties")], "medium", "static", False),
        (B, 0.30, "emotional_beat", "Photo: Chumphon Wiratai / Yuwachon monument (Commons if available) else bridge diorama", "credit", [WM("Wiratai monument Chumphon")], "medium", "dolly_in", False),
        (A, 0.35, "resolution", "Pull back from Sabak beach to the whole region at dawn", "none", [MAP("pull-back")], "extreme_wide", "zoom_out", False)],
 "s99": [(A, 1.0, "call_to_action", "Clean globe pull-back → white pill logo types in → end card 8 s (subscribe + bell)", "end card", [GLOBE("globe_out clean"), GFX("EndCard")], "extreme_wide", "zoom_out", False)],
}

order = [s["id"] for s in secs]
starts = {s["id"]: s["start_seconds"] for s in secs}
ends = {s["id"]: s["end_seconds"] for s in secs}
scenes, n = [], 0
for i, sid in enumerate(order):
    a = starts[sid]
    b = starts[order[i + 1]] if i + 1 < len(order) else TOTAL
    windows = [(sid, a, b)]
    if sid == "s01":
        sa = round(ends[sid] + 0.6, 2)
        windows = [(sid, a, sa), ("sting", sa, b)]
    for key, wa, wb in windows:
        shots = SHOTS[key]
        tw = sum(s[1] for s in shots)
        t = wa
        for j, (ty, w, role, desc, ovl, assets, size, move, hero) in enumerate(shots):
            dur = (wb - wa) * w / tw
            st = round(t, 2)
            en = round(t + dur, 2) if j < len(shots) - 1 else round(wb, 2)
            n += 1
            scenes.append({
                "id": f"sc{n:03d}", "type": ty, "description": desc, "start_seconds": st, "end_seconds": en,
                "script_section_id": sid,
                "framing": "doodle on white paper panel, centred; captions in Patrick Hand" if ty == C else ("left-third text column" if ty in (A, T) else "full-bleed"),
                "movement": move.replace("_", " "),
                "transition_in": "paper-wipe" if ty == C else ("whip blur" if ty == A else "cut"),
                "transition_out": "cut",
                "overlay_notes": f"{ovl}; watermark bottom-right (hidden during sting/end card)",
                "shot_language": {"shot_size": size, "camera_movement": move},
                "narrative_role": role, "hero_moment": hero,
                "texture_keywords": (["orange crayon doodle", "white paper", "line boil"] if ty == C else
                                     ["NASA satellite", "HUD glass", "amber subject"] if ty == A else ["archive / real footage", "credit"]),
                "required_assets": assets,
            })
            t = en

doodle_s = sum(s["end_seconds"] - s["start_seconds"] for s in scenes if s["type"] == C)
plan = {"version": "1.0", "style_playbook": "clean-professional", "scenes": scenes,
        "metadata": {"total_seconds": TOTAL, "scene_count": len(scenes), "doodle_inserts": len(DOODLES),
                     "doodle_share": round(doodle_s / TOTAL, 3), "paid_generation": "ElevenLabs TTS only",
                     "tone_rule": "no doodle on death/combat beats (b8 is map-only)",
                     "new_props_needed": ["ship_burning", "smoke_puff"]}}
(HERE / "scene_plan.json").write_text(json.dumps(plan, indent=2, ensure_ascii=False), encoding="utf-8")

lab = {x["id"]: x["label"] for x in secs}; lab["sting"] = "Logo sting"
icon = {A: "🗺️ map/HUD", B: "📷 photo/footage", T: "🔤 title", C: "✏️ doodle", D: "diagram"}
md = [f"# Scene plan — {len(scenes)} ช็อต · {TOTAL/60:.1f} นาที · doodle {len(DOODLES)} ฉาก ({doodle_s/TOTAL:.0%} ของเวลา)\n",
      "| # | เวลา | ช่วง | ประเภท | บนจอ |", "|---|---|---|---|---|"]
for s in scenes:
    m, ss = divmod(s["start_seconds"], 60)
    md.append(f"| {s['id']} | {int(m)}:{ss:04.1f} | {lab.get(s['script_section_id'], '')} | {icon[s['type']]} | {s['description']} |")
(HERE.parent / "scene_plan.md").write_text("\n".join(md), encoding="utf-8")

bd = ["# Doodle beat sheet — ฉาก HyperFrames ที่ต้องทำ\n", "| ID | ช่วง | sprite ที่ใช้ | การเคลื่อนไหว | วินาที |", "|---|---|---|---|---|"]
for i, (sec, spr, act, s_) in DOODLES.items():
    bd.append(f"| {i} | {lab[sec]} | {spr} | {act} | {s_} |")
bd.append("\nทั้งหมดใช้ **sprite path** (สลับท่า + เลื่อน/กระดอน) — ไม่ใช้ mocap เพราะท่าที่มี (dab/เต้น) ไม่เข้ากับเรื่อง\n")
bd.append("**ต้องวาดเพิ่ม 1 แผ่น:** `ship_burning` (เรือขนส่งไฟลุก+ควัน) และ `smoke_puff` (กลุ่มควันเทา) — ใช้ใน D14\n")
(HERE.parent / "doodle_beats.md").write_text("\n".join(bd), encoding="utf-8")

write_checkpoint(HERE.parent.parent, HERE.parent.name, "scene_plan", "awaiting_human", {"scene_plan": plan},
                 pipeline_type="animated-explainer", human_approval_required=True)
types = {}
for s in scenes: types[s["type"]] = types.get(s["type"], 0) + 1
run, maxrun, prev = 0, 0, None
for s in scenes:
    run = run + 1 if s["type"] == prev else 1; prev = s["type"]; maxrun = max(maxrun, run)
print("scenes", len(scenes), types, "max run", maxrun, "doodle share", round(doodle_s / TOTAL, 3),
      "gaps", sum(1 for x, y in zip(scenes, scenes[1:]) if abs(y["start_seconds"] - x["end_seconds"]) > 0.05),
      "covers", scenes[0]["start_seconds"], scenes[-1]["end_seconds"])
