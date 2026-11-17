"""Edit timeline: real narration timing + approved scene plan → timeline.ts (Composition.tsx) — Kota Bharu 1941.

Anchors: "S<i>[+/-sec]" = sentence i of this section starts (+offset), resolved to scene-local seconds.
A shot's end may be an anchor or "end" (the section window end). Pattern from the Lake Toba episode."""
import json, re, shutil
from pathlib import Path

PROJ = Path(__file__).resolve().parents[1]
rd = lambda f: json.loads((PROJ / f).read_text(encoding="utf-8"))
script = rd("artifacts/script.json"); timing = rd("assets/narration/narration_timing.json")
foot = rd("assets/video/footage_credits.json"); photo = rd("assets/images/photo_credits.json"); ins = rd("doodle/inserts.json")
FPS = 30
fr = lambda t: round(t * FPS)

def pcred(k):
    p = photo[k]; a = re.sub(r"\s+", " ", p["artist"]).split(",")[0].strip()[:40] or "unknown"
    a = "Royal Navy official" if "Abrahams" in a else a
    lic = "public domain" if p["license"].lower().startswith("public") else p["license"]
    return f"Photo: {a} · {lic} · Wikimedia Commons"
fcred = lambda f: f"Footage: {foot[f + '.mp4']['user']} / Pixabay"
MAPC = "Map: NASA Blue Marble + ASTER GDEM (public domain) · geoBoundaries (CC BY 4.0) · Natural Earth"
def doodle(d, mode="full", **kw): return ("doodle", kw.pop("end", "end"), {"src": f"doodles/{d}.mp4", "clip": ins[d]["duration"], "mode": mode, **kw})
def ph(k, end, **kw): return ("photo", end, {"src": f"photos/{k}.jpg", "credit": pcred(k), **kw})
def ft(k, end, **kw): return ("footage", end, {"src": f"footage/{k}.mp4", "credit": fcred(k), "tag": True, **kw})

# ── geography ────────────────────────────────────────────────────────────────
SABAK = (102.328, 6.176); BADANG = (102.262, 6.180); KB = (102.2386, 6.1254); AIRF = (102.293, 6.166)
SONG = (100.595, 7.19); PAT = (101.25, 6.869); NAK = (99.963, 8.43); SUR = (99.33, 9.14); CHUM = (99.18, 10.493); PRA = (99.797, 11.812); SAMUT = (100.598, 13.599)
BRIDGE = (99.183, 10.486); SING = (103.851, 1.29); JB = (103.761, 1.463); KL = (101.687, 3.139); PEN = (100.333, 5.414); KUA = (103.326, 3.808)
POW = (104.45, 3.55); HAINAN = (109.5, 18.25); TOKYO = (139.69, 35.68); PEARL = (202.05, 21.36); USA = (240.5, 38.0)
PALEM = (104.76, -2.99); BALIK = (116.83, -1.27); TARAKAN = (117.6, 3.3); MIRI = (113.99, 4.4); ALOR = (100.367, 6.121); HATYAI = (100.474, 7.008); PADANG = (100.32, 6.663)
pin = lambda c, at, label, dx=-160, dy=-100, **kw: {"lon": c[0], "lat": c[1], "at": at, "label": label, "dx": dx, "dy": dy, **kw}
PAC = [[0, 128, 10, 34], [3.0, 152, 16, 72]]          # whip out to the whole Pacific (Kota Bharu ↔ Pearl Harbor)

SHOTS = {
 "s00": [("coldopen", "S1+2.6", {}), doodle("D01")],
 "v01": [doodle("D02")],
 "s01": [("map", "S2", {"cam": [[0, 102.37, 6.21, 0.42], ["S1", 102.35, 6.2, 0.36]],
                        "pins": [pin((102.36, 6.215), 0.4, "3 troop transports · ≈ 3 km offshore", 170, -110, color="#E9A23B"),
                                 pin((102.33, 6.178), "S1+0.4", "shelling begins · ≈ 00:30", -230, 120), pin((102.315, 6.18), "S1+0.9", None)],
                        "counts": [{"at": 1.6, "dur": 1.4, "to": 5200, "prefix": "≈ ", "label": "JAPANESE TROOPS (TAKUMI DETACHMENT)", "x": 120, "y": 160}], "credit": MAPC}),
         ("map", "S5", {"cam": PAC, "whips": [[0, 2.6]], "dim": {"at": 0, "o": 0.25},
                        "pins": [pin(KB, 0.6, "Kota Bharu", 160, -100), pin(PEARL, "S3+0.4", "Pearl Harbor", -220, -110, color="#E9A23B")],
                        "clock": {"at": 0.8, "from": 30, "to": 30, "dur": 1}, "credit": MAPC}),
         ("maintitle", "end", {"src": "footage/night_beach_0.mp4", "credit": fcred("night_beach_0"),
                               "words": ["THE", "PACIFIC", "WAR", "STARTED", "HERE"], "highlight": ["HERE"], "sub": "NOT AT PEARL HARBOR"})],
 # ── ACT 1 · THE CLOCK
 "a1": [("map", "S2", {"cam": [[0, 128, 30, 40], ["S2", 135, 32, 46]], "act": {"kicker": "ACT ONE", "title": "The Clock"}, "dim": {"at": 0, "o": 0.3},
                       "countries": [{"name": "Japan", "color": "white", "at": 1.0, "settle": 0.8}], "credit": MAPC}),
        doodle("D03", "card", end="S3", map={"lon": 150, "lat": 30, "vh": 40}),
        ("hud", "end", {"v": "oil80"})],
 "a2": [doodle("D04", "card", end="S3", map={"lon": 150, "lat": 30, "vh": 40}), ("hud", "end", {"v": "gauge"})],
 "a2b": [("hud", "S2", {"v": "calendar"}), doodle("D05", "card", map={"lon": 139, "lat": 35, "vh": 12})],
 "a3": [("map", "S2", {"cam": [[0, 115, 15, 34], ["S1", 110, 2, 24], ["S2", 108, 2, 22]], "whips": [[0.4, "S1"]],
                       "countries": [{"name": "Dutch East Indies", "color": "amber", "at": "S1+0.3", "settle": 0.45}],
                       "labels": [{"lon": 112, "lat": -6.5, "text": "DUTCH EAST INDIES · 1941", "at": "S1+0.8", "size": 40}],
                       "pins": [pin(PALEM, "S1+2.2", "Palembang oil", -170, 100), pin(BALIK, "S1+2.8", "Balikpapan oil", 150, 100), pin(MIRI, "S1+3.4", "Miri oil", -150, -90), pin(TARAKAN, "S1+4.0", "Tarakan oil", 150, -90)],
                       "credit": MAPC}),
        ("hud", "S5", {"v": "prize"}),
        doodle("D06", "card", map={"lon": 108, "lat": 2, "vh": 22})],
 "a4": [("map", "S6", {"cam": [[0, 118, 12, 44], ["S3", 152, 14, 62]], "dim": {"at": 0, "o": 0.2},
                       "pins": [pin(SING, "S1+0.6", "Singapore naval base", -200, 110), pin(PEARL, "S2+0.6", "US Pacific Fleet · Pearl Harbor", -260, 120), pin(TOKYO, "S3", "Tokyo", -110, -100, color="#E9A23B")],
                       "arcs": [{"a": list(TOKYO), "b": list(PEARL), "at": "S3+0.5", "dur": 2.2, "label": "the shield", "bend": -0.2},
                                {"a": list(TOKYO), "b": list(SING), "at": "S3+1.0", "dur": 1.4, "label": "the target", "bend": 0.25},
                                {"a": list(TOKYO), "b": list(KB), "at": "S3+1.4", "dur": 1.4, "bend": 0.2}],
                       "planes": [{"arc": {"a": list(TOKYO), "b": list(PEARL), "bend": bd}, "at": f"S3+{0.5 + dl}", "dur": 2.2, "ease": "arc", "side": "jp", "kind": "fighter", "size": sz, "alt": 60, "end": "strike"}
                                  for bd, dl, sz in ((-0.2, 0.0, 78), (-0.17, 0.12, 60), (-0.23, 0.2, 60))],
                       "credit": MAPC}),
        doodle("D07", "card", map={"lon": 102.3, "lat": 6.1, "vh": 6})],
 "a5": [("map", "S6", {"cam": [[0, 103, 6, 10], ["S2", 103.8, 1.8, 3.6], ["S3", 101.8, 5, 10], ["S4", 100.9, 6.9, 4.4], ["S5", 101.9, 6.4, 3.6]],
                       "whips": [["S2-0.6", "S2"], ["S3-0.5", "S3+0.3"]],
                       "countries": [{"name": "British Malaya", "color": "amber", "at": "S3+0.2", "settle": 0.45}, {"name": "Thailand", "color": "white", "at": "S4", "settle": 0.8}],
                       "pins": [pin(SING, "S2+0.3", "Singapore · guns face the sea", -280, 110), pin(SONG, "S4+1.0", "Songkhla", -150, -90), pin(PAT, "S4+1.6", "Pattani", 140, -90),
                                pin(AIRF, "S5+0.6", "RAF Kota Bharu airfield", 180, 100)],
                       "routes": [{"pts": [list(SONG), list(HATYAI), list(PADANG), list(ALOR)], "at": "S4+3.0", "dur": 2.4, "color": "#F2A33A"}],
                       "labels": [{"lon": 103.6, "lat": 4.2, "text": "the back door", "at": "S3+0.8", "out": "S4", "size": 40},
                                  {"lon": 99.2, "lat": 6.8, "text": "road + railway into Malaya", "at": "S4+4.0", "size": 30}],
                       "credit": MAPC}),
        doodle("D08", "card", map={"lon": 101.5, "lat": 6.0, "vh": 8})],
 # ── ACT 2 · THE NIGHT
 "b1": [("map", "S3", {"cam": [[0, 108.5, 14.5, 15], ["S1", 106.5, 10.5, 13], ["S3", 104.5, 8.6, 11]], "act": {"kicker": "ACT TWO", "title": "The Night"}, "dim": {"at": 0, "o": 0.35},
                       "routes": [{"pts": [list(HAINAN), [110.2, 15.5], [109.9, 12.5], [109.3, 10.8], [107.6, 9.0], [105.6, 8.0], [104.0, 8.4]], "at": 0.6, "dur": 10.0, "ship": True, "shipScale": 1.1}],
                       "planes": [{"pts": [[101.2, 3.0], [102.6, 4.9], [103.9, 6.4], [104.6, 7.0]], "at": "S1+0.4", "dur": 3.6, "side": "allied", "kind": "flyingboat", "size": 110, "alt": 70, "end": "crash"},
                                  {"pts": [[105.9, 8.0], [105.4, 7.4], [104.75, 7.1], [104.0, 7.2]], "at": "S2-1.0", "dur": 1.7, "side": "jp", "kind": "fighter", "size": 64, "alt": 80, "end": "fade"},
                                  {"pts": [[106.1, 7.8], [105.5, 7.1], [104.8, 6.85], [104.1, 6.8]], "at": "S2-0.85", "dur": 1.7, "side": "jp", "kind": "fighter", "size": 64, "alt": 80, "end": "fade"}],
                       "labels": [{"lon": 104.2, "lat": 6.2, "text": "RAF Catalina · shot down", "at": "S2+0.5", "size": 30}],
                       "pins": [pin(HAINAN, 0.4, "Hainan Island", 150, -90, color="#E9A23B")], "credit": MAPC}),
        ("map", "S5+2.0", {"cam": [[0, 103.4, 8.0, 7.0], ["S5", 102.8, 7.0, 5.6]], "dim": {"at": 0, "o": 0.3},
                           "arcs": [{"a": [104.0, 8.4], "b": list(SONG), "at": "S4", "dur": 1.6, "label": "southern Thailand", "bend": -0.18},
                                    {"a": [104.0, 8.4], "b": list(SABAK), "at": "S5+0.2", "dur": 1.6, "label": "Kota Bharu", "bend": 0.22}],
                           "credit": MAPC}),
        ph("catalinas_205", "end", chip="RAF Catalinas of 205 Squadron, 1941", chipAt=4)],
 "b2": [("map", "end", {"cam": [[0, 102.3, 6.16, 0.62], ["S3", 102.3, 6.17, 0.52]],
                        "pins": [pin(BADANG, 0.8, "Badang", -150, -90), pin(SABAK, 1.3, "Sabak", 150, -90)],
                        "fx": [{"k": "survey", "a": [102.205, 6.215], "b": [102.36, 6.172], "at": "S3+0.4", "tick": "S3+1.2", "label": "≈ 16 KM OF BEACH", "lx": 40, "ly": 60}],
                        "stickers": [{"src": "df_run", "lon": 102.245, "lat": 6.15, "toLon": 102.27, "toLat": 6.17, "at": 2.0, "dur": 3.0, "h": 190},
                                     {"src": "df_lookout", "lon": 102.33, "lat": 6.168, "at": 5.4, "h": 190}],
                        "credit": MAPC + " · 3/17th Dogras, 8th Indian Brigade (Brig. B. W. Key)"})],
 "b3": [("map", "S2", {"cam": [[0, 102.34, 6.19, 0.34], ["S2", 102.335, 6.185, 0.3]],
                       "pins": [pin((102.33, 6.178), 0.4, "shelling · ≈ 00:30", -220, 110), pin((102.322, 6.177), "S1+0.6", None), pin((102.338, 6.176), "S1+1.0", None)],
                       "stickers": [{"src": "jp_wade", "lon": 102.352, "lat": 6.205, "toLon": 102.334, "toLat": 6.184, "at": "S1", "dur": 4.2, "h": 220}], "credit": MAPC}),
        ("quote", "end", {"text": "…could not raise their heads.", "who": "COL. MASANOBU TSUJI · Japanese staff officer, on the Kota Bharu beach fire (memoir)", "src": "footage/night_sea_0.mp4",
                          "credit": "Quote: Tsuji, via Wikipedia — Battle of Kota Bharu · " + fcred("night_sea_0")})],
 "v02": [doodle("D11")],
 "v02b": [doodle("D12")],
 "b4": [ph("hudsons_kota_bharu", "S1+1.5", chip="RAAF Lockheed Hudson · Kota Bharu, 1941", chipAt=4), doodle("D13")],
 "v03": [doodle("D14")],
 "b5": [("map", "S4", {"cam": [[0, 102.36, 6.2, 0.45], ["S3", 102.33, 6.18, 0.4]],
                       "pins": [pin((102.36, 6.215), 0.3, "Awazisan Maru · burning", 170, -110, color="#E9A23B"), pin((102.375, 6.21), 0.6, None, color="#E9A23B"), pin((102.39, 6.205), 0.9, None, color="#E9A23B")],
                       "counts": [{"at": "S3+0.4", "dur": 0.8, "to": 3, "label": "JAPANESE BATTALIONS ASHORE BY MID-MORNING", "x": 120, "y": 160}],
                       "planes": [{"pts": [list(AIRF), [102.33, 6.20], [102.36, 6.232], [102.40, 6.228], [102.425, 6.20], [102.41, 6.172]], "at": 0.3, "dur": 5.0, "side": "allied", "kind": "twin", "size": 105, "alt": 90, "end": "fade"},
                                  {"pts": [[102.29, 6.163], [102.315, 6.215], [102.36, 6.248], [102.41, 6.245], [102.44, 6.215]], "at": 2.0, "dur": 4.6, "side": "allied", "kind": "twin", "size": 90, "alt": 110, "end": "fade"}],
                       "credit": MAPC}),
        ("map", "end", {"cam": PAC, "whips": [[0, 2.6]], "dim": {"at": 0, "o": 0.25},
                        "pins": [pin(KB, 0.5, "Kota Bharu", 160, -100), pin(PEARL, 1.7, "Pearl Harbor", -220, -110, color="#E9A23B")],
                        "clock": {"at": 0.4, "from": 102, "to": 108, "dur": 1.5},
                        "planes": [{"arc": {"a": [199.0 + dx, 31.0], "b": list(PEARL), "bend": 0.12}, "at": 2.4 + dl, "dur": 1.6, "ease": "arc", "side": "jp", "kind": "fighter", "size": 54, "alt": 50, "end": "strike"}
                                   for dx, dl in ((0.0, 0.0), (1.6, 0.12), (-1.6, 0.18))],
                        "credit": MAPC})],
 "b6": [("map", "S2+1.5", {"cam": [[0, 101.2, 9.4, 11], ["S1", 100.6, 10.2, 10.5]], "flag": {"country": "Thailand", "at": 0.8, "out": 3.0},
                           "pins": [pin(SAMUT, "S1+1.2", "Samut Prakan", 150, -80), pin(PRA, "S1+2.6", "Prachuap Khiri Khan", 170, -60), pin(CHUM, "S1+4.4", "Chumphon", -170, -60),
                                    pin(SUR, "S1+6.2", "Surat Thani", -170, 50), pin(NAK, "S1+8.0", "Nakhon Si Thammarat", 190, -40), pin(SONG, "S1+10.0", "Songkhla", 160, -40),
                                    pin(PAT, "S1+12.0", "Pattani", 150, 70)],
                           "credit": MAPC}),
        doodle("D15")],
 "b7": [("map", "S2", {"cam": [[0, 99.5, 10.7, 2.4], ["S1", 99.2, 10.5, 0.42]], "whips": [[0, 1.2]],
                       "pins": [pin(BRIDGE, "S1+1.0", "Tha Nang Sang bridge", 170, -100)],
                       "stickers": [{"src": "th_run", "lon": 99.165, "lat": 10.478, "toLon": 99.18, "toLat": 10.485, "at": "S1+1.6", "dur": 2.8, "h": 200}], "credit": MAPC}),
        ph("tha_nang_sang_diorama", "end", chip="Diorama · Battle of Tha Nang Sang Bridge, National Memorial", chipAt=4)],
 "v04": [doodle("D17")],
 "b8": [("map", "S3", {"cam": [[0, 99.19, 10.49, 0.4], ["S3", 99.19, 10.49, 0.38]], "dim": {"at": 0, "o": 0.35},
                       "pins": [pin(BRIDGE, 0.2, "Tha Nang Sang bridge", 170, -100)],
                       "labels": [{"lon": 99.13, "lat": 10.455, "text": "CAPT. THAWIN NIYOMSEN · KILLED IN ACTION", "at": 0.8, "size": 30}], "credit": MAPC}),
        ("map", "end", {"cam": [[0, 100.4, 10.0, 10.0], ["S4", 100.6, 10.4, 9.5]],
                        "labels": [{"lon": 100.2, "lat": 8.4, "text": "CEASEFIRE · AFTERNOON, 8 DEC", "at": 0.4, "size": 36},
                                   {"lon": 101.6, "lat": 13.8, "text": "Alliance with Japan · 21 Dec 1941", "at": "S4+0.4", "size": 32}], "credit": MAPC})],
 "v04b": [doodle("D18")],
 # ── ACT 3 · THE ROAD SOUTH
 "c1": [("map", "S2", {"cam": [[0, 102.3, 5.4, 9], ["S2", 102.6, 4.5, 10]], "act": {"kicker": "ACT THREE", "title": "The Road South"}, "dim": {"at": 0, "o": 0.3},
                       "pins": [pin(KB, 0.5, "Kota Bharu falls · 9 Dec", 170, -100)], "credit": MAPC}),
        ph("yamashita", "S2+4.0", fit="contain", chip="Gen. Tomoyuki Yamashita · 25th Army", chipAt=4),
        ("map", "end", {"cam": [[0, 102.4, 4.0, 10.5], ["end", 102.6, 3.8, 10.8]],
                        "routes": [{"pts": [list(KB), list(KUA), list(JB), list(SING)], "at": 0.3, "dur": 2.6, "color": "#F2A33A"},
                                   {"pts": [list(ALOR), list(PEN), list(KL), list(JB), list(SING)], "at": 0.6, "dur": 2.8, "color": "#F2A33A"}],
                        "fx": [{"k": "survey", "a": [100.4, 6.3], "b": [103.85, 1.3], "at": 1.2, "tick": 2.4, "label": "≈ 1,000 KM", "lx": 60, "ly": -30}], "credit": MAPC})],
 "c1b": [ph("prince_of_wales_sg", "S2", chip="HMS Prince of Wales arrives at Singapore · 4 Dec 1941", chipAt=4),
         ("map", "end", {"cam": [[0, 104.0, 3.6, 4.0], ["end", 104.1, 3.5, 3.8]],
                         "pins": [pin(POW, 0.3, "Prince of Wales & Repulse · sunk 10 Dec", 170, -100, color="#E9A23B"), pin(KUA, 0.8, "Kuantan", -140, 90)], "credit": MAPC})],
 "c2": [ft("rubber_plantation_0", "S3", chip="Rubber tapping · Southeast Asia", chipAt=4),
        doodle("D19", end="S6"),
        ("map", "end", {"cam": [[0, 101.8, 4.0, 7.0], ["end", 101.9, 3.4, 6.6]],
                        "stickers": [{"src": "jp_bicycle", "lon": 100.4 + i * 0.1, "lat": 5.9 - i * 0.15, "toLon": 101.6 + i * 0.1, "toLat": 3.4 - i * 0.15, "at": 0.2 + i * 0.7, "dur": 4.0, "h": 180} for i in range(3)],
                        "counts": [{"at": 0.4, "dur": 1.2, "to": 18000, "prefix": "≈ ", "label": "BICYCLES · 25TH ARMY", "x": 120, "y": 160}], "credit": MAPC})],
 "v05": [doodle("D20")],
 "c2b": [("map", "end", {"cam": [[0, 101.5, 4.6, 7.5], ["S1", 101.9, 3.0, 6.5], ["S2", 103.6, 1.6, 2.4], ["S3", 103.75, 1.4, 1.2]],
                         "pins": [pin(PEN, 0.3, "Penang · abandoned mid-Dec", -230, -90), pin(KL, "S1+0.3", "Kuala Lumpur · 11 Jan", -220, 90), pin((103.769, 1.452), "S2+0.6", "Causeway · blown 31 Jan", 200, 110),
                                  pin((103.7, 1.42), "S3+0.4", "Johor Strait · 8 Feb", -210, -90, color="#E9A23B")],
                         "counter": {"at": 0.3, "dur": 14, "from": 10, "to": 62, "label": "DAY", "unit": ""}, "credit": MAPC})],
 "c3": [ph("surrender_alt", "S1+3.0", chip="Lt-Gen. Percival's party under flags of truce · 15 Feb 1942", chipAt=4),
        ("hud", "S2+0.5", {"v": "day70"}),
        ("map", "end", {"cam": [[0, 109, 1, 20], ["end", 110, 0, 21]], "countries": [{"name": "Dutch East Indies", "color": "#E5484D", "at": 0.4, "settle": 0.4}],
                        "pins": [pin(PALEM, 0.8, "Palembang", -150, 100), pin(BALIK, 1.2, "Balikpapan", 150, 100), pin(TARAKAN, 1.6, "Tarakan", 150, -90)], "credit": MAPC})],
 "c3b": [("map", "S3", {"cam": [[0, 120, 15, 38], ["S3", 122, 18, 40]], "dim": {"at": 0, "o": 0.25},
                        "arcs": [{"a": list(PALEM), "b": list(TOKYO), "at": "S1", "dur": 2.2, "icon": "barrel", "count": 6, "gap": 7, "travel": 2.4, "label": "tankers to Japan", "bend": 0.15, "burst": False},
                                 {"a": list(BALIK), "b": list(TOKYO), "at": "S1+0.6", "dur": 2.2, "icon": "barrel", "count": 5, "gap": 8, "travel": 2.4, "bend": -0.12, "burst": False}],
                        "labels": [{"lon": 128, "lat": 22, "text": "US submarines", "at": "S2", "size": 34}], "note": "INDICATIVE", "credit": MAPC}),
         ("hud", "S4+2.0", {"v": "callback"}),
         doodle("D21", "card", map={"lon": 120, "lat": 15, "vh": 38})],
 "c4": [("hud", "S1", {"v": "casualties"}), ph("youth_monument", "S2", chip="Yuwachon Thahan monument · Chumphon", chipAt=4, fit="contain"), ft("beach_dawn_1", "end")],
 "s99": [("globeout", "end", {})],
}

# ── anchors ──────────────────────────────────────────────────────────────────
ANCH = re.compile(r"^S(\d+)([+-][\d.]+)?$")
TEXT_KEYS = ("src", "text", "label", "credit", "title", "chip", "note", "kicker", "who", "sub", "hitText", "mode", "v", "country", "name", "color", "icon")
def resolve(v, sec_t0, scene_t0, sents, scene_len=None):
    if isinstance(v, str):
        if v == "end" and scene_len is not None: return round(scene_len, 3)
        m = ANCH.match(v)
        if m:
            i = min(int(m.group(1)), len(sents) - 1); off = float(m.group(2) or 0)
            return round(sec_t0 + sents[i]["start"] + off - scene_t0, 3)
        return v
    if isinstance(v, list): return [resolve(x, sec_t0, scene_t0, sents, scene_len) for x in v]
    if isinstance(v, dict): return {k: (resolve(x, sec_t0, scene_t0, sents, scene_len) if k not in TEXT_KEYS else x) for k, x in v.items()}
    return v

secs = {x["id"]: x for x in script["sections"]}
order = [x["id"] for x in script["sections"]]
LEAD = 0.25
timeline, audio, sfx = [], [], []
t = 0.0
for sid in order:
    sec = secs[sid]; nar = timing[sid]; sents = nar["sentences"]
    tail = sec["delivery_cues"].get("pause_after_seconds", 0.6) + (0.25 if sid.startswith("v") else 0.5)
    lead = 0.3 if sid == "s00" else LEAD
    win = lead + nar["duration"] + tail
    start = t; sec_t0 = start + lead; end_t = start + win
    shots = list(SHOTS[sid]); cur = start
    for idx, (kind, endspec, p) in enumerate(shots):
        if endspec == "end": e = end_t
        else:
            m = ANCH.match(endspec); e = sec_t0 + sents[min(int(m.group(1)), len(sents) - 1)]["start"] + float(m.group(2) or 0)
        e = min(e, end_t - 2.6 * (len(shots) - idx - 1))
        d = e - cur
        assert d > 1.0, (sid, kind, round(d, 2))
        rp = resolve(p, sec_t0, cur, sents, d)
        if kind == "globeout": rp = {"pillAt": fr(sec_t0 + sents[-1]["start"] + 0.2 - cur)}
        timeline.append({"kind": kind, "from": fr(cur), "dur": fr(e) - fr(cur), "sid": sid, "p": rp})
        num = lambda v: v if isinstance(v, (int, float)) else 0
        if kind == "map":
            sfx.append(("whoosh", cur - 0.12, 0.35))
            for q in rp.get("pins", []): sfx.append(("pop", cur + num(q["at"]), 0.4)); sfx.append(("tick", cur + num(q["at"]) + 0.02, 0.3))
            if rp.get("flag"): sfx.append(("pop", cur + num(rp["flag"]["at"]), 0.5))
            for q in rp.get("countries", [])[:3]: sfx.append(("pop", cur + num(q["at"]), 0.45))
            for q in rp.get("arcs", []): sfx.append(("whoosh", cur + num(q["at"]), 0.18))
            for w in rp.get("whips", []): sfx.append(("whoosh", cur + num(w[0]), 0.4))
            for q in rp.get("fx", []):
                if q.get("k") == "survey": sfx.append(("tick", cur + num(q.get("tick", 0)), 0.5)); sfx.append(("impact", cur + num(q.get("tick", 0)), 0.35))
            for q in rp.get("stickers", []): sfx.append(("pop", cur + num(q.get("at", 0)), 0.35))
            for q in rp.get("planes", []):
                sfx.append(("whoosh", cur + num(q["at"]), 0.3))
                if q.get("end") in ("strike", "crash"): sfx.append(("impact", cur + num(q["at"]) + num(q["dur"]) + (1.1 if q["end"] == "crash" else 0), 0.3))
        if kind in ("doodle", "hud", "quote"): sfx.append(("whoosh", cur - 0.08, 0.22))
        cur = e
    audio.append({"src": f"narration/{sid}.wav", "from": fr(sec_t0)})
    t = end_t
    if sid == "s01":
        timeline.append({"kind": "sting", "from": fr(t), "dur": fr(2.6), "sid": "sting"})
        sfx.append(("whoosh", t - 0.05, 0.35)); t += 2.6
end_card = {"kind": "endcard", "from": fr(t), "dur": fr(8.0), "sid": "end"}
sfx += [("whoosh", t + 0.3, 0.3), ("click", t + 62 / 30, 0.7), ("pop", t + 62 / 30 + 0.05, 0.35), ("click", t + 100 / 30, 0.7), ("bell", t + 100 / 30 + 0.03, 0.6)]
timeline.append(end_card)
TOTAL = fr(t + 8.0)

def at(sid): return next(x["from"] for x in timeline if x["sid"] == sid)
music = [{"src": "music/cold_open.mp3", "from": 0, "to": at("a1")},
         {"src": "music/act1.mp3", "from": at("a1") - fr(1), "to": at("b1")},
         {"src": "music/act2.mp3", "from": at("b1") - fr(1), "to": at("c1")},
         {"src": "music/act3.mp3", "from": at("c1") - fr(1), "to": at("c3b"), "gain": 0.85},
         {"src": "music/finale.mp3", "from": at("c3b") - fr(1), "to": at("s99")},
         {"src": "music/outro.mp3", "from": at("s99") - fr(1), "to": TOTAL}]
sting = next(x for x in timeline if x["kind"] == "sting")
(PROJ / "public/narration").mkdir(exist_ok=True)
for sid in order: shutil.copy(PROJ / "assets/narration" / f"{sid}.wav", PROJ / "public/narration" / f"{sid}.wav")

out = "// generated by artifacts/_build_timeline.py — do not hand-edit\n"
out += f"export const TOTAL = {TOTAL};\n"
out += "export const TIMELINE: any[] = " + json.dumps(timeline, ensure_ascii=False) + ";\n"
out += "export const NARRATION: any[] = " + json.dumps(audio) + ";\n"
out += "export const MUSIC: any[] = " + json.dumps(music) + ";\n"
out += "export const SFX: any[] = " + json.dumps([{"n": n, "from": fr(max(0, a)), "v": v} for n, a, v in sfx]) + ";\n"
out += f"export const STING = {json.dumps({'from': sting['from'], 'dur': sting['dur']})};\n"
out += f"export const ENDCARD = {json.dumps({'from': end_card['from'], 'dur': end_card['dur']})};\n"
(PROJ / "timeline.ts").write_text(out, encoding="utf-8")
kinds = {}
for x in timeline: kinds[x["kind"]] = kinds.get(x["kind"], 0) + 1
print("scenes", len(timeline), "total", round(TOTAL / FPS, 1), "s =", round(TOTAL / FPS / 60, 2), "min", kinds, "sfx", len(sfx))
json.dump({"mid_frames": [x["from"] + x["dur"] // 2 for x in timeline], "labels": [f"{x['sid']}:{x['kind']}" for x in timeline]},
          open(PROJ / "artifacts/_stills_index.json", "w"), indent=0)
