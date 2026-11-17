"""Boundaries (geoBoundaries CC BY 4.0, Natural Earth PD), event points, flags and NASA basemap layers for the
Kota Bharu 1941 episode → mapData.ts. Channel projection (same as sea-goes-broke-first / lake-toba so region basemaps
are reusable): x = (lon - lon0) * k * sx, y = (lat1 - lat) * sx.

Historical territories (British Malaya, Dutch East Indies) are drawn as SOLID colour with period labels, not modern flags
(playbook_override logged): a 1941 map showing the Malaysian/Indonesian flags would be anachronistic. Thailand and Japan
use their flags (unchanged since 1941). The US uses solid colour (1941 flag had 48 stars).
"""
import json, math, time
from pathlib import Path
import requests

PROJ_DIR = Path(__file__).resolve().parents[1]
BRAND = PROJ_DIR / "assets" / "brand"; PUB = PROJ_DIR / "public"
UA = {"User-Agent": "OpenMontage-map-builder/1.0 (educational video production)"}
PROJ = {"lon0": 92.0, "lat1": 24.0, "k": math.cos(math.radians(7.5)), "sx": 120.0}
def ll(lon, lat): return ((lon - PROJ["lon0"]) * PROJ["k"] * PROJ["sx"], (PROJ["lat1"] - lat) * PROJ["sx"])

def get(url, **kw):
    for i in range(6):
        try:
            r = requests.get(url, headers=UA, timeout=180, **kw)
            if r.status_code == 200: return r
        except requests.RequestException: pass
        time.sleep(4 * (i + 1))
    raise RuntimeError(f"failed: {url}")

def simplify(pts, tol):
    if len(pts) < 4 or tol <= 0: return pts
    import sys; sys.setrecursionlimit(100000)
    def rdp(a, b):
        (x1, y1), (x2, y2) = pts[a], pts[b]; dx, dy = x2 - x1, y2 - y1; L = math.hypot(dx, dy) or 1e-9
        idx, dmax = -1, 0
        for i in range(a + 1, b):
            x0, y0 = pts[i]; d = abs(dy * x0 - dx * y0 + x2 * y1 - y2 * x1) / L
            if d > dmax: idx, dmax = i, d
        if dmax > tol and idx > 0: return rdp(a, idx)[:-1] + rdp(idx, b)
        return [pts[a], pts[b]]
    mid = len(pts) // 2
    return rdp(0, mid)[:-1] + rdp(mid, len(pts) - 1)

def ring_paths(rings_ll, tol, min_area, closed=True):
    out, xs, ys, area_sum, cx, cy = [], [], [], 0.0, 0.0, 0.0
    for ring in rings_ll:
        p = [ll(lon, lat) for lon, lat in ring]
        a = 0.5 * abs(sum(p[i][0] * p[i - 1][1] - p[i - 1][0] * p[i][1] for i in range(len(p)))) if closed else 1.0
        if closed and a < min_area: continue
        p = simplify(p, tol)
        if len(p) < (3 if closed else 2): continue
        out.append("M" + " L".join(f"{x:.2f},{y:.2f}" for x, y in p) + (" Z" if closed else ""))
        xs += [x for x, _ in p]; ys += [y for _, y in p]
        area_sum += a; cx += a * sum(x for x, _ in p) / len(p); cy += a * sum(y for _, y in p) / len(p)
    if not out: return None
    return {"paths": out, "bbox": [round(min(xs), 2), round(min(ys), 2), round(max(xs), 2), round(max(ys), 2)],
            "cx": round(cx / area_sum, 2), "cy": round(cy / area_sum, 2)}

def geom_rings(geom):
    polys = [geom["coordinates"]] if geom["type"] == "Polygon" else geom["coordinates"]
    return [poly[0] for poly in polys]

def gb(iso, adm):
    cache = BRAND / f"{iso}_{adm.lower()}.geojson"
    if not cache.exists():
        meta = get(f"https://www.geoboundaries.org/api/current/gbOpen/{iso}/{adm}/").json()
        cache.write_bytes(get(meta["simplifiedGeometryGeoJSON"]).content)
    return json.load(open(cache, encoding="utf-8"))

countries = {}
for iso, name, tol, mina in [("THA", "Thailand", 0.5, 6.0), ("SGP", "Singapore", 0.15, 0.5), ("IDN", "Dutch East Indies", 0.5, 6.0)]:
    countries[name] = ring_paths(geom_rings(gb(iso, "ADM0")["features"][0]["geometry"]), tol, mina)
    print("adm0", iso, len(countries[name]["paths"]))

# British Malaya = peninsular Malaysian states + Singapore (1941 territory, approximate)
PEN = {"Perlis", "Kedah", "Penang", "Pulau Pinang", "Perak", "Kelantan", "Terengganu", "Pahang", "Selangor", "Kuala Lumpur",
       "Putrajaya", "Negeri Sembilan", "Melaka", "Malacca", "Johor"}
provinces, malaya = {}, []
for f in gb("MYS", "ADM1")["features"]:
    nm = f["properties"].get("shapeName")
    if nm in PEN:
        malaya += geom_rings(f["geometry"])
        if nm in ("Kelantan", "Pahang", "Johor", "Penang", "Pulau Pinang", "Kedah", "Selangor"):
            provinces[nm] = ring_paths(geom_rings(f["geometry"]), 0.4, 1.0)
    if nm in ("Sabah", "Sarawak"):
        provinces[nm] = ring_paths(geom_rings(f["geometry"]), 0.4, 1.0)
malaya += geom_rings(gb("SGP", "ADM0")["features"][0]["geometry"])
countries["British Malaya"] = ring_paths(malaya, 0.5, 2.0)

THA7 = {"Songkhla", "Pattani", "Nakhon Si Thammarat", "Surat Thani", "Chumphon", "Prachuap Khiri Khan", "Samut Prakan"}
for f in gb("THA", "ADM1")["features"]:
    nm = f["properties"].get("shapeName")
    if any(nm and nm.replace(" Province", "").strip() == t for t in THA7):
        provinces[nm.replace(" Province", "").strip()] = ring_paths(geom_rings(f["geometry"]), 0.4, 1.0)
print("provinces", sorted(provinces))

ne = json.load(open(BRAND / "countries_50m.json", encoding="utf-8"))
want = {"China": "China", "Japan": "Japan", "United States of America": "United States", "Philippines": "Philippines",
        "Vietnam": "French Indochina", "Laos": "Laos", "Cambodia": "Cambodia", "Myanmar": "Burma", "Brunei": "Brunei", "Taiwan": "Taiwan"}
indo = []
for f in ne["features"]:
    nm = f["properties"].get("NAME") or f["properties"].get("name")
    if nm in want:
        rings = geom_rings(f["geometry"])
        if nm == "United States of America":
            rings = [[(lon + 360, lat) for lon, lat in r] for r in rings if sum(p[0] for p in r) / len(r) < -60]
        if nm in ("Vietnam", "Laos", "Cambodia"): indo += rings
        countries[want[nm]] = ring_paths(rings, 2.0, 20.0 if nm not in ("Brunei",) else 0.5)
countries["French Indochina"] = ring_paths(indo, 2.0, 20.0)
print("countries", list(countries))

P = {  # name: (lon, lat, kind)
    "Kota Bharu": (102.2386, 6.1254, "town"), "Sabak Beach": (102.328, 6.176, "beach"), "Badang Beach": (102.262, 6.180, "beach"),
    "Kota Bharu airfield": (102.293, 6.166, "airfield"), "Kelantan coast anchorage": (102.36, 6.21, "sea"),
    "Songkhla": (100.595, 7.190, "landing"), "Pattani": (101.250, 6.869, "landing"), "Nakhon Si Thammarat": (99.963, 8.430, "landing"),
    "Surat Thani": (99.330, 9.140, "landing"), "Chumphon": (99.180, 10.493, "landing"), "Prachuap Khiri Khan": (99.797, 11.812, "landing"),
    "Samut Prakan": (100.598, 13.599, "landing"), "Tha Nang Sang bridge": (99.183, 10.486, "bridge"), "Hat Yai": (100.474, 7.008, "town"),
    "Padang Besar": (100.320, 6.663, "town"), "Alor Setar": (100.367, 6.121, "town"), "Bangkok": (100.502, 13.756, "capital"),
    "Singapore": (103.851, 1.290, "city"), "Johor Bahru": (103.761, 1.463, "city"), "Causeway": (103.769, 1.452, "bridge"),
    "Kuala Lumpur": (101.687, 3.139, "city"), "Penang": (100.333, 5.414, "city"), "Kuantan": (103.326, 3.808, "town"),
    "Prince of Wales sinking": (104.45, 3.55, "sea"), "Hainan (Samah)": (109.50, 18.25, "port"), "Saigon": (106.70, 10.78, "city"),
    "Tokyo": (139.69, 35.68, "capital"), "Pearl Harbor": (-157.95 + 360, 21.36, "naval base"), "Manila": (120.98, 14.60, "city"),
    "Palembang": (104.76, -2.99, "oil"), "Balikpapan": (116.83, -1.27, "oil"), "Miri": (113.99, 4.40, "oil"), "Tarakan": (117.60, 3.30, "oil"),
}
points = {n: {"x": round(ll(lo, la)[0], 2), "y": round(ll(lo, la)[1], 2), "lon": lo, "lat": la, "kind": k} for n, (lo, la, k) in P.items()}
ROUTES = {  # approximate polylines through real station / waypoint coordinates
    "rail_songkhla_malaya": ["Songkhla", "Hat Yai", "Padang Besar", "Alor Setar"],
    "road_south": ["Kota Bharu", "Kuantan", "Johor Bahru", "Singapore"],
    "west_coast_drive": ["Alor Setar", "Penang", "Kuala Lumpur", "Johor Bahru", "Causeway", "Singapore"],
    "convoy": ["Hainan (Samah)", "Saigon"],
}
routes = {k: [[points[n]["x"], points[n]["y"]] for n in v] for k, v in ROUTES.items()}

FLAGS = {"Thailand": "thailand.png", "Japan": "japan.png", "China": "china.png", "Singapore": "singapore.png"}

def layer(src, lonmin, lonmax, latmin, latmax):
    x0, y0 = ll(lonmin, latmax); x1, y1 = ll(lonmax, latmin)
    return {"src": src, "x": round(x0, 3), "y": round(y0, 3), "w": round(x1 - x0, 3), "h": round(y1 - y0, 3)}
BASE_LAYERS = [layer("earth_8k.jpg", -180, 180, -90, 90), layer("earth_8k.jpg", 180, 540, -90, 90),
               layer("basemap_region.jpg", 60, 160, -25, 45), layer("basemap_sea.jpg", 92, 128, -11, 24),
               layer("basemap_kelantan.jpg", 101.95, 102.55, 5.85, 6.35), layer("basemap_chumphon.jpg", 98.95, 99.45, 10.25, 10.65)]

T = "{paths: string[]; bbox: number[]; cx: number; cy: number}"
ts = ["// Generated by artifacts/_build_mapdata.py — geoBoundaries ADM0/ADM1 (CC BY 4.0), Natural Earth 50m (PD),",
      "// NASA GIBS Blue Marble + ASTER GDEM shaded relief (PD). Equirectangular, cos(lat0)-scaled map units.",
      f"export const PROJ = {json.dumps(PROJ)} as const;",
      f"export const BASE_LAYERS = {json.dumps(BASE_LAYERS)} as const;",
      f"export const COUNTRIES: Record<string, {T}> = {json.dumps(countries)};",
      f"export const PROVINCES: Record<string, {T}> = {json.dumps(provinces)};",
      "export const LAO_PROVINCES = PROVINCES; // template components draw these as faint ADM1 borders",
      f"export const LAKES: Record<string, {T}> = {{}};",
      f"export const ISLANDS: Record<string, {T}> = {{}};",
      f"export const RIVERS: Record<string, {T} & {{pts?: number[][]}}> = {{}};",
      f"export const POINTS: Record<string, {{x: number; y: number; lon: number; lat: number; kind: string | null}}> = {json.dumps(points)};",
      f"export const ROUTES: Record<string, number[][]> = {json.dumps(routes)};",
      f"export const FLAGS: Record<string, string> = {json.dumps({n: 'flags/' + f for n, f in FLAGS.items()})};",
      "export const SOLID_HISTORICAL = ['British Malaya', 'Dutch East Indies', 'French Indochina', 'United States', 'Burma'] as const;"]
(PROJ_DIR / "mapData.ts").write_text("\n".join(ts) + "\n", encoding="utf-8")
json.dump(PROJ, open(BRAND / "proj.json", "w", encoding="utf-8"))
print("mapData.ts", round((PROJ_DIR / "mapData.ts").stat().st_size / 1e6, 2), "MB", len(points), "points")
