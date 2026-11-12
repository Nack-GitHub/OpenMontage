"""Builds scene_plan.json (canonical artifact) + scene_plan.md (readable) from script.json + a per-section shot list."""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
script = json.load(open(HERE / "script.json"))
secs = script["sections"]
TOTAL = script["total_duration_seconds"]

# asset helpers ───────────────────────────────────────────────────────────────
PIX = lambda q: {"type": "video", "source": "source", "description": f"Pixabay video: {q}"}
WM = lambda q: {"type": "image", "source": "source", "description": f"Wikimedia Commons photo (credit on screen): {q}"}
VEO = lambda p: {"type": "video", "source": "generate", "description": f"Veo 8 s clip — ILLUSTRATIVE (labelled on screen): {p}"}
MAP = lambda d: {"type": "remotion_map", "source": "generate", "description": f"Remotion satellite map (NASA Blue Marble + geoBoundaries): {d}"}
GFX = lambda d: {"type": "remotion_graphic", "source": "generate", "description": f"Remotion graphic: {d}"}
GLOBE = lambda d: {"type": "video", "source": "generate", "description": f"render_globe.py globe zoom: {d}"}
SAMPLE = lambda d: {"type": "sample_reuse", "source": "provided", "description": f"Approved in sample v4: {d}"}

# shot list: section_id → [(type, weight, role, description, overlays, assets, shot_size, movement, hero)]
T = "text_card"; A = "animation"; B = "broll"; G = "generated"; D = "diagram"
def title(n, t, bg): return (T, 1.15, "introduce_subject", f"Fact title card: amber numeral '{n}' + '{t}' over {bg}, slow push; teal rule draws",
                             f"NO. {n:02d} / 20 + title", [GFX("FactTitle (numeral, rule, kicker)")], "wide", "dolly_in", False)
SHOTS = {
 "s00": [(B, 0.18, "establish_context", "Aerial: limestone karst island, speedboat wake (approved opener)", "credit", [SAMPLE("coast_karst.mp4")], "extreme_wide", "dolly_in", False),
         (A, 0.82, "deliver_payload", "Whip into spinning globe → zoom into Thailand → flat satellite map → flag silhouette pop → zoom to the neck, Prachuap pops teal, dashed line ticks white, '≈ 11–12 km'", "≈ 11–12 km; labels", [SAMPLE("ColdOpen globe→map sequence"), GLOBE("globe_in.mp4")], "extreme_wide", "zoom_in", True)],
 "s01": [(B, 0.28, "build_tension", "Bangkok skyline at dusk, slow push; chip 'built on an ancient seabed — and sinking'", "chip", [PIX("bangkok skyline night")], "wide", "dolly_in", False),
         (B, 0.2, "build_tension", "Spinning hard-drive macro (sample asset); chip '2011 flood → computers cost more worldwide'", "chip", [SAMPLE("hdd_spin.mp4")], "extreme_close_up", "static", False),
         (A, 0.27, "establish_context", "Satellite map pull-back over Thailand; shipping lanes and trade arcs light up around the peninsula ('geography quietly runs an economy')", "none", [MAP("trade arcs teaser")], "extreme_wide", "zoom_out", False),
         (T, 0.25, "transition", "Title: '20 FACTS ABOUT THAILAND THAT SOUND FAKE' over Phuket aerial, words land one by one", "title", [PIX("phuket aerial"), GFX("kinetic title")], "wide", "dolly_in", False)],
 "sting": [(T, 1.0, "transition", "Logo sting: mark rotates in, wordmark wipes, 'ECONOMY GEOGRAPHY' tracks in (approved)", "logo", [SAMPLE("Sting")], "medium", "static", False)],
 "s02": [(A, 1.0, "transition", "Act card 'THE LAND' — satellite map of Thailand, flag-silhouette ghost, big serif act title", "act title", [MAP("Thailand overview + act title")], "extreme_wide", "zoom_in", False)],
 "f20": [title(20, "The country you can cycle across", "Gulf coast aerial (Pixabay)"),
         (A, 1.6, "evidence", "Map: Prachuap Khiri Khan province pops teal, dashed line coast↔border ticks, labels Gulf / Myanmar; '≈ 11–12 km · < 1 h by bike'", "stat", [MAP("Prachuap pop + DashLine + PinTick")], "wide", "zoom_in", False),
         (B, 1.0, "evidence", "Highway / southern railway traffic along the narrow coast, telephoto", "chip 'Bangkok ↔ the south'", [PIX("thailand highway traffic"), PIX("thailand train")], "medium_wide", "tracking_right", False)],
 "f19": [title(19, "The canal that was never dug", "container ship at sea (Pixabay)"),
         (A, 2.0, "deliver_payload", "Map pull-out: ship icon sails Indian Ocean → around the Malay Peninsula → Strait of Malacca (orange route draws), then the 44 km dashed line across Kra ticks; label 'proposed 1670s · never built'", "route + labels", [MAP("route around peninsula, Kra DashLine, ship icon")], "extreme_wide", "pan_right", True),
         (B, 1.0, "evidence", "Container ships queue in a strait, aerial", "none", [PIX("container ship aerial")], "wide", "orbital", False)],
 "f18": [title(18, "Frost in the tropics", "misty northern mountains (Pixabay)"),
         (A, 1.0, "establish_context", "Map: Chiang Mai province pops amber, red pin ticks on Doi Inthanon (2,565 m)", "pin label", [MAP("Chiang Mai pop + pin Doi Inthanon")], "wide", "zoom_in", False),
         (B, 1.2, "deliver_payload", "Macro of frost on grass at dawn (generic stock, not Inthanon) — label 'illustration'; stat '−5 °C grass-level · Dec 2017'", "stat + 'illustration' tag", [PIX("hoarfrost / frost on grass macro (generic, labelled illustration)")], "extreme_close_up", "dolly_in", False),
         (B, 0.8, "evidence", "Sea of mist from a summit viewpoint, people silhouettes", "none", [PIX("mountain fog sunrise")], "extreme_wide", "pan_left", False)],
 "f17": [title(17, "The longest name on Earth", "Bangkok aerial (Pixabay)"),
         (A, 2.0, "deliver_payload", "Kinetic typography: the full ceremonial name of Bangkok scrolls across a slow Bangkok aerial, letter counter ticks to 168; 'Krung Thep' highlighted amber", "kinetic text + counter", [PIX("bangkok aerial"), GFX("kinetic long-name scroll + counter")], "wide", "tracking_left", False)],
 "s03": [(A, 1.0, "transition", "Act card 'THE WATER' — satellite map, rivers and coastlines glow teal", "act title", [MAP("water act card")], "extreme_wide", "zoom_in", False)],
 "f16": [title(16, "Three kinds of water, one lake", "Songkhla Lake photo (Wikimedia)"),
         (A, 1.6, "deliver_payload", "Map: Songkhla Lake zoom; three zones tint fresh (teal) → seasonal → brackish (amber) with labels Thale Noi / Thale Luang / Thale Sap; Songkhla province pops", "zone labels", [MAP("Songkhla lake zones")], "wide", "zoom_in", True),
         (B, 1.0, "evidence", "Songkhla Lake fishermen / traps (real photo, push-in)", "credit", [WM("Songkhla Lake / Thale Noi")], "medium_wide", "dolly_in", False)],
 "f15": [title(15, "Two coasts, opposite seasons", "Phuket aerial (Pixabay)"),
         (A, 1.6, "comparison", "Split map: Andaman coast vs Gulf coast highlighted; month strips May–Oct (Andaman wet) vs Oct–Dec (Gulf wet) fill in", "month bars", [MAP("two-coast split with month strips")], "extreme_wide", "static", False),
         (B, 1.0, "evidence", "Koh Samui beach aerial, then Phuket bay", "none", [PIX("koh samui"), PIX("phuket drone")], "wide", "orbital", False)],
 "f14": [title(14, "A capital at sea level", "Bangkok canal (Pixabay)"),
         (B, 1.2, "establish_context", "Chao Phraya river aerial through the city", "none", [PIX("chao phraya river aerial")], "extreme_wide", "dolly_in", False),
         (A, 1.0, "deliver_payload", "Sea-level gauge graphic over skyline: water line rises to 0.5–2 m mark", "stat", [GFX("sea-level gauge")], "wide", "static", False)],
 "f13": [title(13, "Sinking faster than the sea", "Bangkok street (Pixabay)"),
         (A, 1.6, "comparison", "Side-by-side bars: land −1 to −2 cm/yr (past up to −3) vs sea +~4 mm/yr", "bars", [GFX("subsidence vs sea-level bars")], "medium", "static", False),
         (B, 1.0, "evidence", "Pumps / pipes or flooded street footage", "none", [PIX("bangkok flood")], "medium_wide", "handheld", False)],
 "f12": [title(12, "A city built on a seabed", "construction site (Pixabay)"),
         (D, 1.6, "deliver_payload", "Cross-section: tower on piles through soft Bangkok clay down to sand at 20–50 m; ancient coastline ghost on map inset", "depth labels", [GFX("soil cross-section with piles")], "medium", "crane_down", False),
         (B, 0.8, "evidence", "Piling rig on a Bangkok site", "none", [PIX("construction piling")], "medium", "static", False)],
 "f11": [title(11, "A canyon inside a river", "Sam Phan Bok photo (Wikimedia)"),
         (A, 1.0, "establish_context", "Map: Ubon Ratchathani pops amber, red pin ticks on the Mekong at Sam Phan Bok", "pin label", [MAP("Ubon pop + pin")], "wide", "zoom_in", False),
         (B, 1.6, "deliver_payload", "Sam Phan Bok rock holes — 2–3 real photos with slow push / parallax", "credits", [WM("Sam Phan Bok (2–3 files)")], "wide", "dolly_in", True)],
 "f10": [title(10, "Two rivers that won't mix", "Mun River mouth photo (Wikimedia)"),
         (A, 1.4, "deliver_payload", "Map: Khong Chiam pin; Mun drawn blue-green, Mekong drawn muddy brown, meeting side by side", "river labels", [MAP("two-colour river lines")], "wide", "zoom_in", False),
         (B, 1.0, "evidence", "Real photo of the confluence (Mun River Mouth)", "credit", [WM("Mun River Mouth, Khong Chiam")], "wide", "dolly_in", False)],
 "s04": [(A, 1.0, "transition", "Act card 'THE MONEY' — night map, export arcs from Laem Chabang to the world", "act title", [MAP("export arcs act card")], "extreme_wide", "zoom_out", False)],
 "f09": [(A, 1.0, "deliver_payload", "Approved sample block: title No. 9 over Ayutthaya flood photo → spinning drive + 25–40% → provinces + Ayutthaya pop + pin → NASA EO-1 before/after wipe + ↑ 30%+", "per sample", [SAMPLE("No. 9 block")], "wide", "zoom_in", True)],
 "f08": [title(8, "A third of the world's rubber", "rubber tapping photo (Wikimedia)"),
         (A, 1.4, "deliver_payload", "World share bar: Thailand ~33% of natural rubber; latex exports 53% — counters", "stats", [GFX("share bars")], "medium", "static", False),
         (B, 1.2, "evidence", "Rubber plantation rows at dawn; real tapping photo push-in", "credit", [PIX("rubber plantation"), WM("rubber tapping Thailand")], "medium_wide", "tracking_right", False)],
 "f07": [title(7, "The four-billion-dollar fruit", "durian photo (Wikimedia)"),
         (A, 1.4, "deliver_payload", "Map: arc Thailand → China lights up, '$4 bn (2024)' rides the arc", "stat", [MAP("arc TH→CN")], "extreme_wide", "pan_right", False),
         (A, 1.2, "comparison", "Share bars China durian imports: Thailand vs Vietnam, 2023 → 2024 (VN 33% → 42%)", "bars", [GFX("TH vs VN share bars")], "medium", "static", False)],
 "f06": [title(6, "Tuna, without the tuna", "fishing boats in port (Pixabay)"),
         (A, 1.6, "deliver_payload", "Map: inbound arrows from Pacific & Indian Ocean into Thailand (>90% imported), outbound arrows to the world (28% of canned-tuna exports)", "stats", [MAP("import/export arrows")], "extreme_wide", "zoom_out", True),
         (B, 1.0, "evidence", "Fishing port unloading + cannery photo — label 'illustration' where not Thai", "'illustration' tag", [PIX("port cranes / fishing boats unloading"), WM("tuna cannery photo (historic, labelled)")], "medium", "tracking_left", False)],
 "f05": [title(5, "Ten million tonnes of rice", "rice field aerial (Pixabay)"),
         (B, 1.0, "evidence", "Rice harvest / paddies at golden hour", "none", [PIX("rice harvest")], "wide", "crane_up", False),
         (A, 1.2, "deliver_payload", "Stat '9.95 Mt · ฿225.7 bn (2024)'; map: northeast (Isan) provinces pop amber for Hom Mali", "stat + labels", [GFX("stat"), MAP("Isan provinces pop")], "extreme_wide", "zoom_in", False)],
 "f04": [title(4, "Your air-con might be Thai", "Bangkok heat-haze skyline (Pixabay)"),
         (B, 1.2, "evidence", "AC outdoor units on buildings + generic assembly line — label 'illustration'", "'illustration' tag", [PIX("air conditioning units"), PIX("factory assembly line")], "medium", "dolly_in", False),
         (A, 1.0, "deliver_payload", "Stat '#2 exporter · ~$7 bn/yr' with world map pulse from Thailand", "stat", [GFX("stat + map pulse")], "wide", "static", False)],
 "f03": [title(3, "The Detroit of Asia", "Laem Chabang port photo (Wikimedia)"),
         (B, 1.0, "evidence", "Port terminal aerial + trucks on highway (generic stock)", "'illustration' tag", [PIX("container terminal harbor"), PIX("trucks highway")], "wide", "orbital", False),
         (A, 1.4, "deliver_payload", "Map: Chonburi pops, pin on Laem Chabang, export arcs; stat '1.47 M built · 1.02 M exported (2024)'", "stats", [MAP("Chonburi pop + arcs")], "extreme_wide", "zoom_out", False)],
 "f02": [title(2, "A sugar superpower", "sugarcane field (Pixabay)"),
         (A, 1.4, "comparison", "World map (flat Blue Marble): pins Brazil #1, Thailand #2 sugar exporters tick in; '~¾ of Thai sugar exported'", "pins + stat", [MAP("world flat map pins")], "extreme_wide", "pan_right", False),
         (B, 1.0, "evidence", "Cane field at sunset + harvest photo — label 'illustration' where not Thai", "'illustration' tag", [PIX("cane field sunset"), WM("sugarcane mechanized harvest")], "wide", "pan_left", False)],
 "f01": [title(1, "The lost land", "globe at night (render)"),
         (A, 2.2, "emotional_beat", "Hero: satellite map of Sunda Shelf; sea level counter drops −120 m and the shallow shelf turns to land (approximate, labelled); label 'SUNDALAND' draws across Thailand–Borneo; dashed walking path Thailand → Borneo ticks", "counter, label", [MAP("Sunda Shelf emergence (shelf mask from bathymetry shading, approximate)")], "extreme_wide", "zoom_out", True),
         (B, 1.2, "emotional_beat", "Aerial grassland & meandering rivers, then rising tide — label 'illustration'", "'illustration' tag", [PIX("grassland / meandering river aerial"), PIX("tide rising over coast")], "extreme_wide", "crane_up", True)],
 "s05": [(A, 0.6, "resolution", "Map pulls back to the globe, Sundaland outline fades", "none", [GLOBE("reverse zoom-out")], "extreme_wide", "zoom_out", False),
         (T, 0.4, "call_to_action", "End card: white logo on ink, 'ECONOMY GEOGRAPHY', subscribe + next video slots", "logo, CTA", [GFX("end card")], "medium", "static", False)],
}

scenes, n = [], 0
order = [x["id"] for x in secs]
starts = {x["id"]: x["start_seconds"] for x in secs}
ends = {x["id"]: x["end_seconds"] for x in secs}
for i, sid in enumerate(order):
    a = starts[sid]
    b = starts[order[i + 1]] if i + 1 < len(order) else TOTAL
    windows = [(sid, a, b)]
    if sid == "s01":                       # logo sting sits in the tail gap
        sting_a = round(ends[sid] + 0.6, 2)
        windows = [(sid, a, sting_a), ("sting", sting_a, b)]
    for key, wa, wb in windows:
        shots = SHOTS[key]
        tw = sum(s[1] for s in shots)
        t = wa
        for j, (ty, w, role, desc, ovl, assets, size, move, hero) in enumerate(shots):
            dur = (wb - wa) * w / tw
            st, en = round(t, 2), round(t + dur, 2) if j < len(shots) - 1 else round(wb, 2)
            n += 1
            scenes.append({
                "id": f"sc{n:03d}", "type": ty, "description": desc, "start_seconds": st, "end_seconds": en,
                "script_section_id": sid if key != "sting" else "s01",
                "framing": "left-third text column; subject right-of-centre" if ty in (A, T) else "full-bleed",
                "movement": move.replace("_", " "),
                "transition_in": "whip blur" if (ty == A and "map" in desc.lower()) else "cut",
                "transition_out": "cut",
                "overlay_notes": f"{ovl}; watermark bottom-right (hidden during sting/end card)",
                "shot_language": {"shot_size": size, "camera_movement": move},
                "narrative_role": role, "hero_moment": hero,
                "texture_keywords": ["NASA satellite", "survey line", "brand navy→teal", "amber numbers"] if ty == A else ["real footage", "natural light"],
                "required_assets": assets,
            })
            t = en

plan = {"version": "1.0", "style_playbook": "clean-professional", "scenes": scenes,
        "metadata": {"total_seconds": TOTAL, "scene_count": len(scenes),
                     "veo_clips": sum(1 for s in scenes for a in s["required_assets"] if a["description"].startswith("Veo")), "paid_generation": "none — Google credentials reserved for TTS only (user)",
                     "art_direction": "art-direction.md (Malacca map style, ECONOMY GEOGRAPHY sting)"}}
json.dump(plan, open(HERE / "scene_plan.json", "w"), indent=2, ensure_ascii=False)

# readable summary
lab = {x["id"]: x["label"] for x in secs}; lab["sting"] = "Logo sting"
md = [f"# Scene plan — {len(scenes)} scenes · {TOTAL/60:.1f} min · Veo clips: {plan['metadata']['veo_clips']}\n",
      "| # | time | section | type | what's on screen | assets |", "|---|---|---|---|---|---|"]
for s in scenes:
    m, ss = divmod(s["start_seconds"], 60)
    src = "; ".join(a["description"].split(":")[0] for a in s["required_assets"])
    md.append(f"| {s['id']} | {int(m)}:{ss:04.1f} | {lab.get(s['script_section_id'],'')} | {s['type']} | {s['description']} | {src} |")
open(HERE.parent / "scene_plan.md", "w").write("\n".join(md))
types = {}
for s in scenes: types[s["type"]] = types.get(s["type"], 0) + 1
run, maxrun, prev = 0, 0, None
for s in scenes:
    run = run + 1 if s["type"] == prev else 1; prev = s["type"]; maxrun = max(maxrun, run)
print("scenes", len(scenes), "types", types, "max consecutive same type", maxrun, "veo", plan["metadata"]["veo_clips"],
      "gaps", sum(1 for a, b in zip(scenes, scenes[1:]) if abs(b["start_seconds"] - a["end_seconds"]) > 0.05),
      "covers", scenes[0]["start_seconds"], scenes[-1]["end_seconds"])
