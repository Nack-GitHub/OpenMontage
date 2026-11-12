"""Edit timeline: real narration timing + approved scene plan → timeline.ts (consumed by Composition.tsx)."""
import json
from pathlib import Path

PROJ = Path(__file__).resolve().parents[1]
script = json.load(open(PROJ / "artifacts/script.json"))
timing = json.load(open(PROJ / "assets/narration/narration_timing.json"))
foot = json.load(open(PROJ / "assets/footage/provenance.json"))
photo = json.load(open(PROJ / "assets/photos_provenance.json"))
FPS = 30
fr = lambda t: round(t * FPS)

def fcred(slot, extra=""):
    p = foot[slot]; return f"Footage: {p['user']} / Pixabay" + (f" · {extra}" if extra else "")
def pcred(slot):
    p = photo[slot]; a = p["artist"].split(",")[0].replace("This Photo was taken by ", "").strip()[:40] or "unknown"
    return f"Photo: {a} · {p['license']} · Wikimedia Commons"
F = lambda slot: f"footage/{slot}.mp4"
P = lambda slot: f"photos/{slot}.jpg"
TEAL, AMBER = "teal", "amber"
_rv = json.load(open(PROJ / "assets/brand/rivers_khongchiam.json"))
def _chain(segs):
    segs = [list(x) for x in segs]
    out = segs.pop(0)
    while segs:  # append the segment whose start is nearest the current end
        j = min(range(len(segs)), key=lambda i: (segs[i][0][0]-out[-1][0])**2 + (segs[i][0][1]-out[-1][1])**2)
        out += segs.pop(j)
    return out[:: max(1, len(out) // 40)] + [out[-1]]
RIV = {"Mun": [[round(a, 4), round(b, 4)] for a, b in _chain(_rv["Mun"])], "Mekong": [[round(a, 4), round(b, 4)] for a, b in _chain(_rv["Mekong"])]}
ISAN = ["Amnat Charoen", "Bueng Kan", "Buri Ram", "Chaiyaphum", "Kalasin", "Khon Kaen", "Loei", "Maha Sarakham", "Mukdahan", "Nakhon Phanom",
        "Nakhon Ratchasima", "Nong Bua Lam Phu", "Nong Khai", "Roi Et", "Sakon Nakhon", "Si Sa Ket", "Surin", "Ubon Ratchathani", "Udon Thani", "Yasothon"]

def title(n, t, act, bg, credit):
    return ("title", None, {"n": n, "title": t, "act": act, "bg": bg, "credit": credit})

# Each section: list of (kind, weight|None, params). Title shots use real sentence timing; others share the rest by weight.
SHOTS = {
 "s01": [("footage", 1.2, {"src": F("s01_skyline"), "chip": "Built on an ancient seabed — and sinking", "credit": fcred("s01_skyline")}),
         ("footage", 1.0, {"src": "sample/hdd_spin.mp4", "chip": "2011: one flood, pricier computers worldwide", "credit": "Footage: MarandaP / Pixabay"}),
         ("map", 1.2, {"cam": [[0, 100.5, 11.5, 24], [4.5, 100.5, 11.5, 30]], "routes": [{"pts": [[88, 6.5], [95.5, 6.2], [98.6, 4.6], [101.2, 2.6], [103.8, 1.25], [105.5, 3.5], [109, 8], [113, 14]], "at": 0.2, "dur": 3.0, "color": "#F2A33A", "ship": True}],
                       "follow": {"route": 0, "from": 0.2, "release": 2.6, "vh": [[0.2, 6.5], [2.6, 8]]},
                       "arcs": [{"a": [100.9, 13.1], "b": [121, 25], "at": 2.9, "dur": 0.9, "color": TEAL, "icon": "box", "count": 3}, {"a": [100.9, 13.1], "b": [80, 13], "at": 3.1, "dur": 0.9, "color": TEAL, "icon": "box", "count": 3}], "credit": "Map: NASA Blue Marble (public domain)"}),
         ("maintitle", 1.1, {"src": F("s01_titlebg"), "credit": fcred("s01_titlebg")})],
 "s02": [("map", 1, {"cam": [[0, 100.8, 13.0, 19], [3, 100.8, 13.0, 16.5]], "flag": {"at": 0.4, "out": 9}, "act": {"kicker": "ACT ONE", "title": "The Land"}})],
 "f20": [title(20, "The country you can cycle across", "THE LAND", {"type": "video", "src": F("f20_title")}, fcred("f20_title")),
         ("map", 1.7, {"cam": [[0, 100.0, 12.6, 6], [2.0, 98.95, 11.75, 2.2], [6, 98.9, 11.72, 2.0]], "tint": {"at": 0.2},
                       "provinces": [{"name": "Prachuap Khiri Khan", "color": TEAL, "at": 0.9, "settle": 0.45}],
                       "dashes": [{"a": [99.48, 11.66], "b": [99.84, 11.66], "at": 2.0, "tick": 2.6}],
                       "labels": [{"lon": 99.2, "lat": 12.15, "text": "Myanmar", "at": 1.2}, {"lon": 100.3, "lat": 11.4, "text": "Gulf of Thailand", "at": 1.3}],
                       "stat": {"big": "≈ 11–12 km", "small": "coast to border · under an hour by bike", "src": "Prachuap Khiri Khan", "at": 2.8}}),
         ("footage", 1.0, {"src": F("f20_road"), "chip": "The main road south runs through this strip", "tag": True, "credit": fcred("f20_road")})],
 "f19": [title(19, "The canal that was never dug", "THE LAND", {"type": "video", "src": F("f19_title")}, fcred("f19_title")),
         ("map", 2.6, {"cam": [[0, 99.0, 10.3, 6], [6.5, 98.98, 10.3, 4.2], [9.2, 98.6, 9.0, 9], [16.3, 100.8, 6.4, 16], [22, 100.8, 6.4, 17]], "whips": [[9.2, 9.9]],
                       "dashes": [{"a": [98.78, 10.3], "b": [99.18, 10.3], "at": 1.0, "tick": 4.2}],
                       "routes": [{"pts": [[89, 8.5], [95.5, 6.3], [98.4, 4.8], [100.8, 2.9], [103.7, 1.3], [105.2, 3.0], [108.5, 7.8]], "at": 9.8, "dur": 6.2, "color": "#F2A33A", "ship": True}],
                       "follow": {"route": 0, "from": 9.6, "release": 15.9, "vh": [[9.6, 5.5], [13.0, 6.5], [15.9, 7.5]]},
                       "labels": [{"lon": 97.6, "lat": 10.9, "text": "Kra Isthmus · 44 km", "at": 1.6}, {"lon": 99.0, "lat": 3.6, "text": "Strait of Malacca", "at": 12.5},
                                  {"lon": 104.0, "lat": 0.4, "text": "Singapore", "at": 14.3, "size": 26}, {"lon": 91.0, "lat": 9.6, "text": "Indian Ocean", "at": 10.0}, {"lon": 108.6, "lat": 10.4, "text": "South China Sea", "at": 15.6}],
                       "stat": {"big": "Since the 1670s", "small": "a shortcut proposed — still never dug", "at": 16.6}}),
         ("footage", 0.9, {"src": F("f19_strait"), "tag": True, "credit": fcred("f19_strait")})],
 "f18": [title(18, "Frost in the tropics", "THE LAND", {"type": "video", "src": F("f18_title")}, fcred("f18_title")),
         ("map", 1.1, {"cam": [[0, 100.5, 16.0, 12], [2.2, 98.6, 18.6, 3.2]], "borders": {"at": 0.2}, "provinces": [{"name": "Chiang Mai", "color": AMBER, "at": 0.5}],
                       "pins": [{"lon": 98.487, "lat": 18.588, "at": 1.4, "label": "Doi Inthanon · 2,565 m", "dx": -200, "dy": -110}]}),
         ("photo", 1.3, {"src": P("f18_frost"), "stat": {"big": "−5 °C", "small": "grass-level frost on Doi Inthanon", "src": "Dec 2017 · JS100", "at": 12}, "credit": pcred("f18_frost")}),
         ("footage", 0.9, {"src": F("f18_mist"), "chip": "Locals call it mae khaning", "tag": True, "credit": fcred("f18_mist")})],
 "f17": [title(17, "The longest name on Earth", "THE LAND", {"type": "video", "src": F("f17_bkk")}, fcred("f17_bkk")),
         ("kinetic", 1, {"bg": F("f04_title"), "credit": fcred("f04_title")})],
 "s03": [("map", 1, {"cam": [[0, 101.0, 11.0, 18], [3, 100.6, 11.0, 15]], "tint": {"at": 0.1}, "act": {"kicker": "ACT TWO", "title": "The Water"}})],
 "f16": [title(16, "Three kinds of water, one lake", "THE WATER", {"type": "photo", "src": P("f16_thalenoi")}, pcred("f16_thalenoi")),
         ("map", 1.8, {"cam": [[0, 100.5, 9.0, 6], [1.8, 100.3, 7.5, 1.4]], "borders": {"at": 0.1},
                       "provinces": [{"name": "Phatthalung", "color": TEAL, "at": 0.6, "settle": 0.3}, {"name": "Songkhla", "color": AMBER, "at": 0.8, "settle": 0.3}],
                       "pins": [{"lon": 100.17, "lat": 7.80, "at": 2.2, "color": "#3FB7B0", "label": "Thale Noi · fresh", "dx": -230, "dy": -60},
                                {"lon": 100.30, "lat": 7.45, "at": 3.0, "color": "#C9C27A", "label": "Thale Luang · seasonal", "dx": -260, "dy": 40},
                                {"lon": 100.47, "lat": 7.20, "at": 3.8, "color": "#E9A23B", "label": "Thale Sap · brackish", "dx": 200, "dy": 60}]}),
         ("photo", 1.0, {"src": P("f16_lake"), "chip": "Songkhla Lake", "credit": pcred("f16_lake")})],
 "f15": [title(15, "Two coasts, opposite seasons", "THE WATER", {"type": "video", "src": F("f15_phuket")}, fcred("f15_phuket")),
         ("map", 1.8, {"cam": [[0, 100.8, 9.5, 8], [5, 100.6, 9.3, 7.4]], "tint": {"at": 0.1},
                       "pins": [{"lon": 98.39, "lat": 7.88, "at": 0.6, "color": "#3FB7B0", "label": "Phuket · Andaman", "dx": -230, "dy": -80},
                                {"lon": 100.0, "lat": 9.5, "at": 1.4, "color": "#E9A23B", "label": "Koh Samui · Gulf", "dx": 220, "dy": -70}],
                       "months": {"at": 1.8}}),
         ("footage", 1.0, {"src": F("f15_samui"), "chip": "One coast is almost always in season", "credit": fcred("f15_samui")})],
 "f14": [title(14, "A capital at sea level", "THE WATER", {"type": "video", "src": F("f14_title")}, fcred("f14_title")),
         ("footage", 1.0, {"src": F("f14_chao"), "chip": "Chao Phraya delta", "credit": fcred("f14_chao")}),
         ("gauge", 1.1, {"bg": F("s01_skyline"), "credit": fcred("s01_skyline")})],
 "f13": [title(13, "Sinking faster than the sea", "THE WATER", {"type": "video", "src": F("f13_title")}, fcred("f13_title")),
         ("sinking", 1.6, {}),
         ("footage", 1.0, {"src": F("f13_flood"), "chip": "Groundwater pumping was the main culprit", "tag": True, "credit": fcred("f13_flood")})],
 "f12": [title(12, "A city built on a seabed", "THE WATER", {"type": "video", "src": F("f12_title")}, fcred("f12_title")),
         ("piling", 1.7, {}),
         ("footage", 0.8, {"src": F("f12_site"), "tag": True, "credit": fcred("f12_site")})],
 "f11": [title(11, "A canyon inside a river", "THE WATER", {"type": "photo", "src": P("f11_spb2")}, pcred("f11_spb2")),
         ("map", 1.0, {"cam": [[0, 103.5, 15.5, 8], [2.0, 105.2, 15.8, 3.0]], "borders": {"at": 0.1}, "provinces": [{"name": "Ubon Ratchathani", "color": AMBER, "at": 0.5}],
                       "pins": [{"lon": 105.33, "lat": 15.83, "at": 1.3, "label": "Sam Phan Bok · Mekong", "dx": -230, "dy": -100}], "labels": [{"lon": 106.0, "lat": 16.6, "text": "Laos", "at": 1.0}]}),
         ("photo", 0.9, {"src": P("f11_spb1"), "fit": "contain", "credit": pcred("f11_spb1")}),
         ("photo", 0.9, {"src": P("f11_spb3"), "chip": "Visible only in the dry season", "credit": pcred("f11_spb3")})],
 "f10": [title(10, "Two rivers that won't mix", "THE WATER", {"type": "photo", "src": P("f10_mun")}, pcred("f10_mun")),
         ("map", 1.3, {"cam": [[0, 105.0, 15.5, 2.6], [3, 105.45, 15.33, 1.0]], "borders": {"at": 0.1},
                       "routes": [{"pts": RIV["Mun"], "at": 0.4, "dur": 1.4, "color": "#3FB7B0"}, {"pts": RIV["Mekong"], "at": 0.6, "dur": 1.8, "color": "#B07A45"}],
                       "pins": [{"lon": 105.5, "lat": 15.32, "at": 2.0, "label": "Khong Chiam", "dx": -200, "dy": -90}],
                       "labels": [{"lon": 105.0, "lat": 15.16, "text": "Mun", "at": 1.0}, {"lon": 105.62, "lat": 15.62, "text": "Mekong", "at": 1.2}]}),
         ("photo", 1.0, {"src": P("f10_mun"), "chip": "Muddy brown meets blue-green", "credit": pcred("f10_mun")})],
 "s04": [("map", 1, {"cam": [[0, 100.9, 13.1, 26], [3, 100.9, 13.1, 34]], "arcs": [{"a": [100.9, 13.1], "b": [121.5, 31], "at": 0.3, "color": TEAL, "icon": "box", "count": 2}, {"a": [100.9, 13.1], "b": [72.8, 19], "at": 0.5, "color": TEAL, "icon": "box", "count": 2},
                       {"a": [100.9, 13.1], "b": [139.7, 35.6], "at": 0.7, "color": TEAL, "icon": "box", "count": 2}, {"a": [100.9, 13.1], "b": [151, -33.8], "at": 0.9, "color": TEAL, "icon": "box", "count": 2}],
                       "act": {"kicker": "ACT THREE", "title": "The Money"}, "credit": "Map: NASA Blue Marble (public domain)"})],
 "f08": [title(8, "A third of the world's rubber", "THE MONEY", {"type": "photo", "src": P("f08_tap")}, pcred("f08_tap")),
         ("rubber", 1.4, {"bg": F("f08_latex")}),
         ("footage", 1.2, {"src": F("f08_latex"), "chip": "Tapped by hand, tree by tree", "credit": fcred("f08_latex")})],
 "f07": [title(7, "The four-billion-dollar fruit", "THE MONEY", {"type": "photo", "src": P("f07_durian")}, pcred("f07_durian")),
         ("map", 1.5, {"cam": [[0, 102.3, 12.9, 4.5], [5.0, 102.2, 12.8, 3.8], [5.8, 107.5, 18.5, 19], [12, 108.5, 19, 21]], "whips": [[5.0, 5.9]], "borders": {"at": 0.05},
                       "provinces": [{"name": "Chanthaburi", "color": AMBER, "at": 0.4, "settle": 0.6}], "bursts": [{"lon": 102.1, "lat": 12.75, "at": 0.8, "icon": "durian", "n": 7, "radius": 90}],
                       "labels": [{"lon": 102.1, "lat": 13.35, "text": "Chanthaburi · durian country", "at": 1.0}],
                       "arcs": [{"a": [102.1, 12.6], "b": [113.3, 23.1], "at": 5.7, "dur": 1.2, "icon": "durian", "count": 8, "gap": 5, "travel": 1.3}],
                       "countries": [{"name": "China", "color": "#D7262E", "at": 6.9, "settle": 0.8}],
                       "pins": [{"lon": 113.3, "lat": 23.1, "at": 6.9, "label": "China", "dx": 150, "dy": -90}],
                       "counts": [{"at": 7.0, "dur": 2.0, "to": 4, "prefix": "$", "suffix": " bn", "label": "DURIAN TO CHINA · 2024", "x": 120, "y": 620}],
                       "credit": "Map: NASA Blue Marble · Natural Earth · Data: Bangkok Post, Tridge (2024)"}),
         ("durianrace", 1.3, {})],
 "f06": [title(6, "Tuna, without the tuna", "THE MONEY", {"type": "video", "src": F("f06_title")}, fcred("f06_title")),
         ("map", 1.9, {"cam": [[0, 100, 12, 40], [1.0, 102, 10, 62], [4.2, 102, 10, 62], [5.0, 101, 10.5, 10], [7.4, 101, 10.5, 9], [8.1, 115, 4, 52], [15, 112, 4, 56]], "whips": [[4.2, 5.0], [7.5, 8.2]],
                       "countries": [{"name": "Thailand", "color": AMBER, "at": 0.3, "settle": 0.7}],
                       "arcs": [{"a": [100.4, 13.4], "b": [50, 26], "at": 0.8, "dur": 1.0, "icon": "can", "count": 5, "gap": 4, "travel": 1.2, "out": 4.1},
                                {"a": [100.4, 13.4], "b": [139.7, 35.7], "at": 1.0, "dur": 1.0, "icon": "can", "count": 5, "gap": 4, "travel": 1.2, "out": 4.1},
                                {"a": [100.4, 13.4], "b": [151, -33.9], "at": 1.2, "dur": 1.0, "icon": "can", "count": 5, "gap": 4, "travel": 1.2, "label": "28% of world canned-tuna exports", "out": 4.1},
                                {"a": [155, 8], "b": [100.4, 13.4], "at": 8.3, "dur": 1.2, "color": TEAL, "icon": "fish", "count": 6, "gap": 5, "travel": 1.4},
                                {"a": [142, -12], "b": [100.4, 13.4], "at": 8.6, "dur": 1.2, "color": TEAL, "icon": "fish", "count": 5, "gap": 5, "travel": 1.4},
                                {"a": [72, -8], "b": [100.4, 13.4], "at": 9.0, "dur": 1.2, "color": TEAL, "icon": "fish", "count": 5, "gap": 5, "travel": 1.4, "label": ">90% of the tuna is imported"}],
                       "labels": [{"lon": 101.2, "lat": 10.2, "text": "Thai waters?", "at": 5.2, "size": 40, "out": 7.4}],
                       "credit": "Map: NASA Blue Marble · Natural Earth · Data: Krungsri Research, IOTC"}),
         ("footage", 1.0, {"src": F("f06_port"), "chip": "Factories, ports and know-how", "tag": True, "credit": fcred("f06_port")})],
 "f05": [title(5, "Ten million tonnes of rice", "THE MONEY", {"type": "video", "src": F("f05_title")}, fcred("f05_title")),
         ("footage", 1.0, {"src": F("f05_harvest"), "stat": {"big": "9.95 Mt", "small": "exported in 2024 · ฿225.7 bn", "src": "Thai Government PR Dept", "at": 8}, "credit": fcred("f05_harvest")}),
         ("map", 1.2, {"cam": [[0, 101.5, 14.0, 12], [3.5, 103.0, 15.5, 9]], "borders": {"at": 0.1},
                       "provinces": [{"name": n, "color": AMBER, "at": 0.4 + i * 0.04, "settle": 0.55} for i, n in enumerate(ISAN)],
                       "labels": [{"lon": 103.6, "lat": 15.4, "text": "Hom Mali · the dry northeast", "at": 1.6}]})],
 "f04": [title(4, "Your air-con might be Thai", "THE MONEY", {"type": "video", "src": F("f04_title")}, fcred("f04_title")),
         ("footage", 1.1, {"src": F("f04_ac"), "chip": "Thailand cools the rest of the world", "credit": fcred("f04_ac")}),
         ("footage", 1.1, {"src": F("f04_factory"), "stat": {"big": "#2", "small": "air-conditioner exporter · ~$7 bn a year", "src": "OEC 2022 · Office of Industrial Economics", "at": 8}, "tag": True, "credit": fcred("f04_factory")})],
 "f03": [title(3, "The Detroit of Asia", "THE MONEY", {"type": "video", "src": F("f03_port")}, fcred("f03_port")),
         ("footage", 1.0, {"src": F("f03_trucks"), "stat": {"big": "1.47 M", "small": "vehicles built in 2024 · 1.02 M exported", "src": "Federation of Thai Industries via just-auto", "at": 8}, "tag": True, "credit": fcred("f03_trucks")}),
         ("map", 1.4, {"cam": [[0, 101.0, 13.2, 3.0], [1.4, 101.0, 13.2, 2.2], [3.0, 104, 12, 22]], "borders": {"at": 0.1},
                       "provinces": [{"name": "Chon Buri", "color": AMBER, "at": 0.3}], "pins": [{"lon": 100.88, "lat": 13.08, "at": 0.8, "label": "Laem Chabang port", "dx": -240, "dy": -90}],
                       "arcs": [{"a": [100.88, 13.08], "b": [151, -33.8], "at": 2.0, "icon": "pickup", "count": 3, "gap": 6}, {"a": [100.88, 13.08], "b": [55, 25], "at": 2.2, "icon": "pickup", "count": 3, "gap": 6}, {"a": [100.88, 13.08], "b": [120.9, 14.6], "at": 2.4, "icon": "pickup", "count": 2, "gap": 6}],
                       "labels": [{"lon": 104.5, "lat": 9.0, "text": "one-ton pickups → the world", "at": 2.8}]})],
 "f02": [title(2, "A sugar superpower", "THE MONEY", {"type": "video", "src": F("f02_title")}, fcred("f02_title")),
         ("map", 1.4, {"cam": [[0, 28, 5, 112], [4, 28, 5, 104]],
                       "countries": [{"name": "Brazil", "color": TEAL, "at": 0.5, "settle": 0.75}, {"name": "Thailand", "color": AMBER, "at": 1.1, "settle": 0.8}],
                       "pins": [{"lon": -47.9, "lat": -15.8, "at": 0.6, "color": "#3FB7B0", "label": "Brazil · #1", "dx": 150, "dy": -90},
                                {"lon": 100.5, "lat": 15.0, "at": 1.2, "color": "#E9A23B", "label": "Thailand · #2", "dx": -190, "dy": -90}],
                       "credit": "Map: NASA Blue Marble (public domain) · Ranking: USDA 2023-24"}),
         ("photo", 1.0, {"src": P("f02_cane"), "stat": {"big": "~¾", "small": "of Thai sugar is exported — a drought here moves world prices", "src": "USDA 2023-24 · CEFS", "at": 10}, "credit": pcred("f02_cane")})],
 "f01": [title(1, "The lost land", "THE FINALE", {"type": "video", "src": F("f01_grass")}, fcred("f01_grass")),
         ("map", 2.4, {"cam": [[0, 106, 5, 22], [9, 106, 4, 24]], "shelf": {"at": 1.0, "dur": 3.5},
                       "counter": {"label": "SEA LEVEL", "from": 0, "to": -120, "unit": " m", "at": 1.0, "dur": 3.5},
                       "dashes": [{"a": [100.6, 13.5], "b": [110.5, 1.6], "at": 5.0, "tick": 6.0}],
                       "labels": [{"lon": 105.5, "lat": 6.8, "text": "SUNDALAND", "at": 6.4, "size": 64}, {"lon": 114, "lat": 0.5, "text": "Borneo", "at": 4.0}, {"lon": 101, "lat": -1, "text": "Sumatra", "at": 4.2}, {"lon": 110, "lat": -7.6, "text": "Java", "at": 4.4}],
                       "note": "APPROXIMATE · SHALLOW SHELF FROM NASA BATHYMETRY SHADING", "credit": "Map: NASA Blue Marble shaded relief & bathymetry (public domain)"}),
         ("footage", 1.0, {"src": F("f01_grass"), "tag": True, "credit": fcred("f01_grass")}),
         ("footage", 0.8, {"src": F("f01_tide"), "tag": True, "credit": fcred("f01_tide")})],
 "s05": [("globeout", 1, {"pill": True})],
}

# ── timing ───────────────────────────────────────────────────────────────────
secs = {x["id"]: x for x in script["sections"]}
order = [x["id"] for x in script["sections"]]
LEAD = 0.25
timeline, audio, sfx = [], [], []
t = 0.0
# cold open (approved sample)
timeline.append({"kind": "coldopen", "from": 0, "dur": fr(6.8), "sid": "s00"})
audio.append({"src": "sample/a_hook.mp3", "from": fr(0.3)})
t = 6.8
for sid in order[1:]:
    sec = secs[sid]; nar = timing[sid]
    lead = LEAD
    if sid == "f09":
        win = 14.8
        timeline += [{"kind": "f09_title", "from": fr(t), "dur": fr(3.6), "sid": sid}, {"kind": "f09_share", "from": fr(t + 3.6), "dur": fr(5.4), "sid": sid},
                     {"kind": "f09_wipe", "from": fr(t + 9.0), "dur": fr(5.8), "sid": sid}]
        audio.append({"src": "narration/f09.wav", "from": fr(t + 0.2)})
        sfx += [("impact", t + 0.05, 0.35), ("pop", t + 9.1, 0.5), ("pop", t + 9.25, 0.3), ("pop", t + 9.7, 0.45), ("tick", t + 9.72, 0.45), ("whoosh", t + 10.32, 0.5)]
        t += win + 0.4
        continue
    tail = sec["delivery_cues"].get("pause_after_seconds", 0.6) + 0.5
    if sid == "s01": tail += 0
    win = lead + nar["duration"] + tail
    shots = SHOTS[sid]
    start = t
    # title takes the "Number N. Title." part
    rest_start = start
    if shots[0][0] == "title":
        tend = nar["sentences"][1]["end"] if len(nar["sentences"]) > 1 else nar["sentences"][0]["end"]
        tdur = lead + tend + 0.45
        timeline.append({"kind": "title", "from": fr(start), "dur": fr(tdur), "sid": sid, "p": shots[0][2]})
        sfx.append(("impact", start + 0.05, 0.3))
        rest_start = start + tdur; shots = shots[1:]
    tw = sum(w for _, w, _ in shots)
    cur = rest_start
    for i, (kind, w, p) in enumerate(shots):
        d = (start + win - rest_start) * w / tw
        if kind == "globeout":
            p = {"pillAt": fr(lead + nar["sentences"][-1]["start"] + 0.2)}
        timeline.append({"kind": kind, "from": fr(cur), "dur": fr(cur + d) - fr(cur), "sid": sid, "p": p})
        if kind == "map":
            sfx.append(("whoosh", cur - 0.12, 0.35))
            for q in p.get("provinces", [])[:3]: sfx.append(("pop", cur + q["at"], 0.4))
            for q in p.get("pins", []): sfx.append(("pop", cur + q["at"], 0.45)); sfx.append(("tick", cur + q["at"] + 0.02, 0.35))
            for q in p.get("dashes", []): sfx.append(("tick", cur + q["tick"], 0.5)); sfx.append(("impact", cur + q["tick"], 0.4))
            if p.get("flag"): sfx.append(("pop", cur + p["flag"]["at"], 0.5))
            for q in p.get("countries", []): sfx.append(("pop", cur + q["at"], 0.55))
            for q in p.get("arcs", []): sfx.append(("whoosh", cur + q["at"], 0.18)); sfx.append(("pop", cur + q["at"] + q.get("dur", 0.8), 0.3))
            for q in p.get("bursts", []): sfx.append(("pop", cur + q["at"], 0.4))
            for w in p.get("whips", []): sfx.append(("whoosh", cur + w[0], 0.4))
        cur += d
    audio.append({"src": f"narration/{sid}.wav", "from": fr(start + lead)})
    t = start + win
    if sid == "s01":   # logo sting
        timeline.append({"kind": "sting", "from": fr(t), "dur": fr(2.6), "sid": "sting"})
        sfx += [("whoosh", t - 0.05, 0.35)]
        t += 2.6
end_card = {"kind": "endcard", "from": fr(t), "dur": fr(8.0), "sid": "end"}
sfx += [("whoosh", t + 0.3, 0.3), ("click", t + 62 / 30, 0.7), ("pop", t + 62 / 30 + 0.05, 0.35), ("click", t + 100 / 30, 0.7), ("bell", t + 100 / 30 + 0.03, 0.6)]
timeline.append(end_card)
TOTAL = fr(t + 8.0)

# music: by act
def at(sid): return next(x["from"] for x in timeline if x["sid"] == sid)
music = [{"src": "music/act12.mp3", "from": 0, "to": at("s03")}, {"src": "music/act2.mp3", "from": at("s03") - fr(1), "to": at("s04")},
         {"src": "music/act3.mp3", "from": at("s04") - fr(1), "to": at("f01")}, {"src": "music/finale.mp3", "from": at("f01") - fr(1), "to": TOTAL}]
sting = next(x for x in timeline if x["kind"] == "sting")
# copy narration wavs to public
import shutil
(PROJ / "public/narration").mkdir(exist_ok=True)
for sid in order:
    src = PROJ / "assets/narration" / f"{sid}.wav"
    if src.exists(): shutil.copy(src, PROJ / "public/narration" / f"{sid}.wav")

out = "// generated by artifacts/_build_timeline.py — do not hand-edit\n"
out += f"export const TOTAL = {TOTAL};\n"
out += "export const TIMELINE: any[] = " + json.dumps(timeline, ensure_ascii=False) + ";\n"
out += "export const NARRATION: any[] = " + json.dumps(audio) + ";\n"
out += "export const MUSIC: any[] = " + json.dumps(music) + ";\n"
out += "export const SFX: any[] = " + json.dumps([{"n": n, "from": fr(max(0, a)), "v": v} for n, a, v in sfx]) + ";\n"
out += f"export const STING = {json.dumps({'from': sting['from'], 'dur': sting['dur']})};\n"
out += f"export const ENDCARD = {json.dumps({'from': end_card['from'], 'dur': end_card['dur']})};\n"
open(PROJ / "timeline.ts", "w").write(out)
kinds = {}
for x in timeline: kinds[x["kind"]] = kinds.get(x["kind"], 0) + 1
print("scenes", len(timeline), "total", round(TOTAL / FPS, 1), "s =", round(TOTAL / FPS / 60, 2), "min", kinds, "sfx", len(sfx))
