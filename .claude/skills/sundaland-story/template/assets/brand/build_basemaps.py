"""Detail basemaps for Kota Bharu / Chumphon close-ups: NASA GIBS Blue Marble colour (z8) × ASTER GDEM greyscale shaded relief (z11/z12),
stitched from WMTS Web-Mercator tiles and reprojected to the project's equirectangular grid (PD, NASA/METI)."""
import math, time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import numpy as np
import requests
from PIL import Image, ImageFilter, ImageDraw
import json
OSM = __import__("pathlib").Path(__file__).resolve().parent / "osm"

def join_rings(ways):
    """Join OSM way geometries [(lon,lat)...] into closed rings."""
    ways = [list(w) for w in ways if len(w) > 1]; rings = []
    while ways:
        ring = ways.pop(0)
        while ring[0] != ring[-1]:
            for i, w in enumerate(ways):
                if w[0] == ring[-1]: ring += w[1:]; ways.pop(i); break
                if w[-1] == ring[-1]: ring += w[::-1][1:]; ways.pop(i); break
            else: break
        rings.append(ring)
    return rings

def water_polys(name):
    """outer/inner rings for OSM water features in osm/<name>.json (relations + closed ways)."""
    nf = OSM / f"nom_{name}.json"
    if nf.exists():
        d = json.load(open(nf, encoding="utf-8")); d = d[0] if isinstance(d, list) else d
        g = d["geojson"]
        if g["type"] == "Polygon": return [[tuple(p) for p in g["coordinates"][0]]], [[tuple(p) for p in r] for r in g["coordinates"][1:]]
        if g["type"] == "MultiPolygon": return [[tuple(p) for p in q[0]] for q in g["coordinates"]], [[tuple(p) for p in r] for q in g["coordinates"] for r in q[1:]]
        return [], []
    f = OSM / f"{name}.json"
    if not f.exists(): return [], []
    outer, inner = [], []
    for e in json.load(open(f, encoding="utf-8"))["elements"]:
        if e["type"] == "relation":
            o = [[(p["lon"], p["lat"]) for p in m["geometry"]] for m in e["members"] if m.get("role") == "outer" and m.get("geometry")]
            i = [[(p["lon"], p["lat"]) for p in m["geometry"]] for m in e["members"] if m.get("role") == "inner" and m.get("geometry")]
            outer += join_rings(o); inner += join_rings(i)
        elif e["type"] == "way" and e.get("geometry"):
            outer.append([(p["lon"], p["lat"]) for p in e["geometry"]])
    return outer, inner

def paint_water(img, bb, ppd, names):
    W, H = img.size
    mask = Image.new("L", (W, H), 0); d = ImageDraw.Draw(mask)
    xy = lambda ring: [((lon - bb[0]) * ppd, (bb[3] - lat) * ppd) for lon, lat in ring]
    for n in names:
        o, i = water_polys(n)
        for r in o: d.polygon(xy(r), fill=255)
        for r in i: d.polygon(xy(r), fill=0)
    if not mask.getbbox(): return img
    soft = mask.filter(ImageFilter.GaussianBlur(radius=max(1.0, ppd / 1400)))
    deep = mask.filter(ImageFilter.GaussianBlur(radius=ppd / 120))        # darker towards the middle
    a = np.asarray(img, dtype=np.float32) / 255
    m = np.asarray(soft, dtype=np.float32)[..., None] / 255; dm = np.asarray(deep, dtype=np.float32)[..., None] / 255
    shallow, deepc = np.array([0.10, 0.22, 0.30]), np.array([0.03, 0.08, 0.16])
    wc = shallow * (1 - dm) + deepc * dm
    return Image.fromarray((np.clip(a * (1 - m) + wc * m, 0, 1) * 255).astype(np.uint8))

HERE = Path(__file__).resolve().parent
PUB = HERE.parents[1] / "public"
TILES = HERE / "tiles"; TILES.mkdir(exist_ok=True)
UA = {"User-Agent": "OpenMontage-map-builder/1.0 (educational video production)"}
Image.MAX_IMAGE_PIXELS = None
GIBS = "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best"

def get(url):
    for i in range(6):
        try:
            r = requests.get(url, headers=UA, timeout=60)
            if r.status_code == 200 and r.headers.get("content-type", "").startswith("image/"): return r.content
        except requests.RequestException: pass
        time.sleep(2 * (i + 1))
    raise RuntimeError(url)

def tx(lon, n): return (lon + 180) / 360 * n
def ty(lat, n): r = math.radians(lat); return (1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * n

def equirect(layer, mset, z, ext, bb, ppd):
    """Fetch WMTS tiles for bb at zoom z and resample to an equirectangular image at ppd pixels/degree."""
    n = 2 ** z
    x0, x1 = int(tx(bb[0], n)), int(tx(bb[1], n)); y0, y1 = int(ty(bb[3], n)), int(ty(bb[2], n))
    d = TILES / f"{layer}_{z}"; d.mkdir(exist_ok=True)
    def fetch(xy):
        x, y = xy; f = d / f"{y}_{x}.{ext}"
        if not f.exists(): f.write_bytes(get(f"{GIBS}/{layer}/default/{mset}/{z}/{y}/{x}.{ext}"))
    jobs = [(x, y) for y in range(y0, y1 + 1) for x in range(x0, x1 + 1)]
    with ThreadPoolExecutor(6) as ex: list(ex.map(fetch, jobs))
    merc = Image.new("RGB", ((x1 - x0 + 1) * 256, (y1 - y0 + 1) * 256))
    for x, y in jobs: merc.paste(Image.open(d / f"{y}_{x}.{ext}").convert("RGB"), ((x - x0) * 256, (y - y0) * 256))
    W, H = int((bb[1] - bb[0]) * ppd), int((bb[3] - bb[2]) * ppd)
    left, right = (tx(bb[0], n) - x0) * 256, (tx(bb[1], n) - x0) * 256
    out = Image.new("RGB", (W, H))
    for row in range(H):
        lat = bb[3] - (row + 0.5) / ppd
        my = (ty(lat, n) - y0) * 256
        out.paste(merc.crop((int(left), int(my), int(math.ceil(right)), int(my) + 1)).resize((W, 1), Image.BILINEAR), (0, row))
    print(layer, z, "tiles", len(jobs), "->", W, H)
    return out

def build(name, bb, z, ppd, water_names=()):
    colour = equirect("BlueMarble_ShadedRelief_Bathymetry", "GoogleMapsCompatible_Level8", 8, "jpeg", bb, ppd)
    relief = equirect("ASTER_GDEM_Greyscale_Shaded_Relief", "GoogleMapsCompatible_Level12", z, "jpg", bb, ppd)
    colour = colour.filter(ImageFilter.GaussianBlur(radius=ppd / 182 * 0.75))   # hide Blue Marble 500 m pixel blocks
    c = np.asarray(colour, dtype=np.float32) / 255
    r = np.asarray(relief.convert("L"), dtype=np.float32) / 255
    # sea/lake: Blue Marble water is dark and blue-dominant → keep its colour, skip relief there
    water = (c[..., 2] > c[..., 1] + 0.02) & (c[..., 2] > c[..., 0] + 0.08)
    shade = 1.0 + 2.0 * (r - r[~water].mean()) if (~water).any() else np.ones_like(r)
    out = c * np.where(water, 1.0, np.clip(shade, 0.35, 1.6))[..., None]
    img = Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8))
    img = paint_water(img, bb, ppd, list(water_names)) if water_names else img
    img.save(PUB / name, quality=90)
    print("saved", name)

if __name__ == "__main__":
    # Kota Bharu coast: Sabak & Badang beaches, Pengkalan Chepa airfield, Kelantan river mouth
    build("basemap_kelantan.jpg", (101.95, 102.55, 5.85, 6.35), 12, 3200)
    # Chumphon town, Tha Nang Sang bridge, coast
    build("basemap_chumphon.jpg", (98.95, 99.45, 10.25, 10.65), 12, 3200)
