"""Cut a white-background doodle sheet into one transparent PNG per figure.

Usage: python -I cut_poses.py <sheet.jpg> <out_dir> [name1 name2 ...] [--fragments]   (names left-to-right)
Optional overrides.json NEXT TO THE SHEET: [{"box":[x0,x1,y0,y1],"owner":"name"}] — a stray fragment
(zzz, sparks, a face between two figures) whose centre falls in a box goes to that owner.
Writes <name>.png per figure + poses.json; check them on a checkerboard (see SKILL.md step 3).
- groups ink by proximity (so props, notes, zzz, motion lines stay with their figure)
- keeps enclosed white areas (head, book pages, sign) opaque by filling holes
- un-blends the white matte on anti-aliased edges
- upscales 2x (Lanczos) so the sprites hold up at 1080p
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

src, out = Path(sys.argv[1]), Path(sys.argv[2])
names = [a for a in sys.argv[3:] if a != "--fragments"]
SHOW_FRAG = "--fragments" in sys.argv   # print every small fragment + its owner (to write overrides.json)
out.mkdir(parents=True, exist_ok=True)

rgb = np.asarray(Image.open(src).convert("RGB")).astype(np.float32)
dark = 255.0 - rgb.min(axis=2)                      # 0 on white paper, high on ink / colour
ink = dark > 38

# group strokes: small dilation keeps neighbours apart; big components = figures,
# small ones (notes, zzz, speed lines, drops) are merged into the nearest figure
grp = ndi.binary_dilation(ink, structure=np.ones((3, 3)), iterations=3)
lab0, n0 = ndi.label(grp)
areas = ndi.sum(np.ones_like(lab0), lab0, index=range(1, n0 + 1))
slices = ndi.find_objects(lab0)
BIG = 9000.0   # px area (on the source sheet) that counts as a whole figure
big = [i + 1 for i in range(n0) if areas[i] >= BIG]
def box(sl): return (sl[1].start, sl[0].start, sl[1].stop, sl[0].stop)
def gap(a, b):
    dx = max(b[0] - a[2], a[0] - b[2], 0); dy = max(b[1] - a[3], a[1] - b[3], 0)
    return (dx * dx + dy * dy) ** 0.5
big.sort(key=lambda j: slices[j - 1][1].start)
by_name = {nm: big[k] for k, nm in enumerate(names) if k < len(big)}
# optional overrides.json next to the sheet: [{"box":[x0,x1,y0,y1],"owner":"name"}]
# a fragment whose centre falls in a box goes to that owner (for zzz / faces between figures)
ov_path = src.with_name("overrides.json")
overrides = json.loads(ov_path.read_text()) if ov_path.exists() else []
lab = np.zeros_like(lab0)
for j in big:
    lab[lab0 == j] = j
for i in range(1, n0 + 1):
    if i in big or areas[i - 1] < 25:
        continue
    bi = box(slices[i - 1])
    cx, cy = (bi[0] + bi[2]) / 2, (bi[1] + bi[3]) / 2
    owner = None
    for o in overrides:
        x0, x1, y0, y1 = o["box"]
        if x0 <= cx <= x1 and y0 <= cy <= y1 and o["owner"] in by_name:
            owner = by_name[o["owner"]]
    if owner is None:
        owner = min(big, key=lambda j: gap(bi, box(slices[j - 1])))
    lab[lab0 == i] = owner
    if SHOW_FRAG:
        own_name = next((nm for nm, j in by_name.items() if j == owner), owner)
        print(f"fragment x {bi[0]}-{bi[2]} y {bi[1]}-{bi[3]} area {int(areas[i - 1])} -> {own_name}")
objs = []
for j in big:
    ys, xs = np.nonzero(lab == j)
    sl = (slice(ys.min(), ys.max() + 1), slice(xs.min(), xs.max() + 1))
    objs.append((sl[1].start, j, sl))
objs.sort()
print("groups:", len(objs))

meta = []
for k, (x0, i, sl) in enumerate(objs):
    name = names[k] if k < len(names) else f"pose{k + 1:02d}"
    pad = 6
    ys = slice(max(sl[0].start - pad, 0), min(sl[0].stop + pad, rgb.shape[0]))
    xs = slice(max(sl[1].start - pad, 0), min(sl[1].stop + pad, rgb.shape[1]))
    own = ndi.binary_dilation(lab[ys, xs] == i, iterations=2)
    d = dark[ys, xs]
    soft = np.clip((d - 10.0) / 55.0, 0, 1) * own
    solid = ndi.binary_closing(ink[ys, xs] & own, structure=np.ones((3, 3)), iterations=2)
    filled = ndi.binary_fill_holes(solid)
    a = np.maximum(soft, filled.astype(np.float32))
    c = rgb[ys, xs]
    aa = np.clip(a, 1e-3, 1)[..., None]
    col = np.clip((c - (1 - aa) * 255.0) / aa, 0, 255)
    col = np.where(filled[..., None], c, col)          # interiors keep their real (white) colour
    rgba = np.dstack([col, a * 255.0]).astype(np.uint8)
    im = Image.fromarray(rgba, "RGBA")
    im = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
    im.save(out / f"{name}.png")
    meta.append({"name": name, "x": int(xs.start), "y": int(ys.start), "w": im.width, "h": im.height})
    print(f"{name:10s} x={xs.start:4d} w={xs.stop - xs.start:3d} h={ys.stop - ys.start:3d}")

(out / "poses.json").write_text(json.dumps(meta, indent=2))

# checkerboard preview: every cut-out side by side — transparent areas show the grey checks,
# head / pages / sign must stay solid white, and stray marks must sit on the right figure
W = sum(m["w"] // 2 + 20 for m in meta) + 20; H = max(m["h"] for m in meta) // 2 + 20
chk = Image.new("RGB", (W, H), "white")
for yy in range(0, H, 16):
    for xx in range(0, W, 16):
        if (xx // 16 + yy // 16) % 2:
            chk.paste((205, 205, 205), (xx, yy, xx + 16, yy + 16))
x = 10
for m in meta:
    im = Image.open(out / f"{m['name']}.png"); im = im.resize((im.width // 2, im.height // 2))
    chk.paste(im, (x, H - im.height - 10), im); x += im.width + 20
chk.save(out / "_cutout-check.png")
print("check:", out / "_cutout-check.png")
