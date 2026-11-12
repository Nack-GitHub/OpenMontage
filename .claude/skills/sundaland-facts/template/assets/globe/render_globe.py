"""Render globe moves for the cold open (zoom-in) and the outro (pull-out + slow spin) — orthographic Blue Marble + clouds.

  python render_globe.py in  48          → public/globe_in.mp4   (ends on the flat map's first camera)
  python render_globe.py out <frames>    → public/globe_out.mp4  (pull-out from Thailand, clouds roll in, slow spin, route on globe)
Clouds: Solar System Scope 8k earth clouds (CC BY 4.0) via Wikimedia Commons.
"""
import json, math, subprocess, sys, shutil
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import map_coordinates

HERE = Path(__file__).resolve().parent
PROJ = HERE.parent.parent
W, H, FPS = 1920, 1080, 30
MODE = sys.argv[1] if len(sys.argv) > 1 else "in"
N = int(sys.argv[2]) if len(sys.argv) > 2 else 48
OUT_FRAMES = HERE / f"frames_{MODE}"
shutil.rmtree(OUT_FRAMES, ignore_errors=True); OUT_FRAMES.mkdir()

tex = np.asarray(Image.open(HERE / "earth_8k.jpg").convert("RGB")).astype(np.float32)
TH, TW = tex.shape[:2]
cl = np.asarray(Image.open(HERE / "clouds.jpg").convert("L").resize((TW // 2, TH // 2), Image.BILINEAR)).astype(np.float32) / 255.0
CH, CW = cl.shape

P = json.load(open(PROJ / "assets/brand/proj.json"))
lon0, lat1, k, sx = P["lon0"], P["lat1"], P["k"], P["sx"]
END_CX, END_CY, END_VH = 500 - 560, 940, 1980
end_lon = lon0 + END_CX / (k * sx)
end_lat = lat1 - END_CY / sx
R_END = (1080 / END_VH) * sx * 180 / math.pi

g = json.load(open(PROJ / "assets/brand/THA_adm0.geojson"))["features"][0]["geometry"]
polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
rings = [np.array(p[0])[:: max(1, len(p[0]) // 900)] for p in polys if len(p[0]) > 60]
ROUTE = np.array([[56, 25.5], [58.5, 23.5], [62, 20], [70, 14], [78, 7.5], [88, 6.2], [95.5, 6.3], [98.4, 4.8], [100.8, 2.9], [103.7, 1.3], [105.2, 3.0], [108.5, 7.8], [113, 14], [118, 20], [122.5, 26], [128, 31], [135, 33.5], [139.7, 35.3]])

def ease_io(t): return 4 * t ** 3 if t < 0.5 else 1 - (-2 * t + 2) ** 3 / 2
def clamp01(x): return min(max(x, 0.0), 1.0)

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
bg_r = np.sqrt((xx - W / 2) ** 2 + (yy - H / 2) ** 2) / (W / 2)
space = np.stack([11 - 6 * bg_r, 21 - 11 * bg_r, 48 - 26 * bg_r], -1).clip(4, 60)

def frame_params(i):
    t = i / max(N - 1, 1)
    if MODE == "in":
        z_t = ease_io(clamp01((t - 0.22) / 0.78)); r_t = ease_io(clamp01(t / 0.85))
        R = 430 * (R_END / 430) ** z_t
        lam = 74.0 + (end_lon - 74.0) * r_t + 3.0 * (1 - r_t) * t
        phi = 6.0 + (end_lat - 6.0) * r_t
        cloud_a = 0.85 * (1 - clamp01((z_t - 0.25) / 0.5))
        outline_a = clamp01((t - 0.25) / 0.12); route_p = 0.0
        return R, lam, phi, cloud_a, outline_a, route_p, i * 0.08
    # out: 50-frame pull-out then a slow spin hold
    po = 50
    if i < po:
        z_t = ease_io(i / (po - 1))
        R = R_END * (470 / R_END) ** z_t
        lam = end_lon + (102 - end_lon) * z_t; phi = end_lat + (14 - end_lat) * z_t
        cloud_a = 0.85 * clamp01((z_t - 0.35) / 0.5)
    else:
        h = (i - po) / max(N - po, 1)
        R = 470 - 25 * h; lam = 102 - 14 * h; phi = 14 + 2 * h; cloud_a = 0.85
    route_p = clamp01((i - 10) / 70)
    return R, lam, phi, cloud_a, 1.0 - clamp01((i - 30) / 40) * 0.4, route_p, i * 0.08

def project(lo, la, lam0, phi0, R):
    cp, sp = math.cos(phi0), math.sin(phi0)
    cosc = sp * np.sin(la) + cp * np.cos(la) * np.cos(lo - lam0)
    x = W / 2 + R * np.cos(la) * np.sin(lo - lam0)
    y = H / 2 - R * (cp * np.sin(la) - sp * np.cos(la) * np.cos(lo - lam0))
    return x, y, cosc

for i in range(N):
    R, lamd, phid, cloud_a, outline_a, route_p, cdrift = frame_params(i)
    lam0, phi0 = math.radians(lamd), math.radians(phid)
    nx = (xx - W / 2) / R; ny = -(yy - H / 2) / R
    rr = nx * nx + ny * ny; inside = rr <= 1.0
    z = np.sqrt(np.clip(1 - rr, 0, 1))
    lat = np.arcsin(np.clip(z * math.sin(phi0) + ny * math.cos(phi0), -1, 1))
    lon = lam0 + np.arctan2(nx, z * math.cos(phi0) - ny * math.sin(phi0))
    u = ((np.degrees(lon) + 180) % 360) / 360 * TW; v = (90 - np.degrees(lat)) / 180 * TH
    img = np.empty((H, W, 3), np.float32)
    for c in range(3):
        img[..., c] = map_coordinates(tex[..., c], [v, u], order=1, mode="wrap")
    if cloud_a > 0.01:
        cu = ((np.degrees(lon) + 180 - cdrift) % 360) / 360 * CW; cv = (90 - np.degrees(lat)) / 180 * CH
        c = map_coordinates(cl, [cv, cu], order=1, mode="wrap")
        c = np.clip((c - 0.12) / 0.75, 0, 1) ** 1.1 * cloud_a
        img = img * (1 - c[..., None]) + 245 * c[..., None]
    zoom_k = clamp01((R - 470) / (R_END - 470))
    shade_k = 1 - zoom_k
    shade = 1 - shade_k * (1 - (0.45 + 0.55 * z ** 0.55))
    img *= shade[..., None]
    rim = np.sqrt(rr); glow = np.exp(-np.clip(rim - 1, 0, None) * R / 22) * (rim > 1)
    out = np.where(inside[..., None], img, space) + glow[..., None] * np.array([70, 150, 255], np.float32) * 0.55 * shade_k
    frame = Image.fromarray(out.clip(0, 255).astype(np.uint8)).convert("RGBA")

    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
    fill = Image.new("RGBA", (W, H), (0, 0, 0, 0)); df = ImageDraw.Draw(fill)
    if outline_a > 0:
        for ring in rings:
            x, y, cosc = project(np.radians(ring[:, 0]), np.radians(ring[:, 1]), lam0, phi0, R)
            if (cosc <= 0).any(): continue
            pts = list(zip(x.tolist(), y.tolist()))
            df.polygon(pts, fill=(233, 162, 59, int(48 * outline_a)))
            d.line(pts + [pts[0]], fill=(255, 255, 255, int(255 * outline_a)), width=3 if R < 1500 else 4, joint="curve")
    if route_p > 0:
        dense = []
        for a, b in zip(ROUTE[:-1], ROUTE[1:]):
            for s in np.linspace(0, 1, 12, endpoint=False): dense.append(a + (b - a) * s)
        dense = np.array(dense + [ROUTE[-1]]); n = max(2, int(len(dense) * route_p))
        x, y, cosc = project(np.radians(dense[:n, 0]), np.radians(dense[:n, 1]), lam0, phi0, R)
        pts = [(float(a), float(b)) for a, b, c in zip(x, y, cosc) if c > 0]
        if len(pts) > 1: d.line(pts, fill=(242, 163, 58, 255), width=4, joint="curve")
    glowl = layer.filter(ImageFilter.GaussianBlur(7))
    for lyr in (fill, glowl, glowl, layer): frame = Image.alpha_composite(frame, lyr)
    frame.convert("RGB").save(OUT_FRAMES / f"g_{i:03d}.png")
    if i % 20 == 0: print(f"{MODE} {i+1}/{N} R={R:.0f}", flush=True)

out = PROJ / f"public/globe_{MODE}.mp4"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", str(OUT_FRAMES / "g_%03d.png"),
                "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-pix_fmt", "yuv420p", str(out)], check=True)
shutil.rmtree(OUT_FRAMES, ignore_errors=True)
print("wrote", out)
