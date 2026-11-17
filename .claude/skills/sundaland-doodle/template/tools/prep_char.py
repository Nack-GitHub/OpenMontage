"""Build an AnimatedDrawings character folder from a cut-out sprite + hand-placed joints.

Usage: python -I prep_char.py <sprite.png> <out_dir> <joints.json>
joints.json: {"neck":[x,y], "torso":[x,y], "hip":[x,y], "right_shoulder":..., ...}
(character's RIGHT = viewer's LEFT, as in the AnimatedDrawings examples)
Writes texture.png (RGBA), mask.png (largest blob, limbs thickened), char_cfg.yaml, joint_overlay.png
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

sprite, out, jpath = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
out.mkdir(parents=True, exist_ok=True)
J = json.loads(jpath.read_text())

im = Image.open(sprite).convert("RGBA")
pad = 40                                               # room for limbs to swing past the old bbox
canvas = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad), (255, 255, 255, 0))
canvas.paste(im, (pad, pad), im)
a = np.asarray(canvas)[..., 3] > 110

# keep the figure (largest blob) — floating notes / marks are dropped from the mesh
lab, n = ndi.label(ndi.binary_dilation(a, iterations=2))
sizes = ndi.sum(np.ones_like(lab), lab, range(1, n + 1))
body = lab == (int(np.argmax(sizes)) + 1)
mask = ndi.binary_fill_holes(ndi.binary_dilation(body & a, iterations=7))   # thicken thin stick limbs for a usable mesh
# optional "head_circle": [cx, cy, r] — cut a moat around the head so it joins the body only at
# the neck; otherwise the mesh webs the head to the upper arms and the head squashes when arms move
if "head_circle" in J:
    hx, hy, hr = J["head_circle"]; hx += pad; hy += pad
    yy, xx = np.mgrid[0:mask.shape[0], 0:mask.shape[1]]
    dist = np.hypot(xx - hx, yy - hy)
    moat = (dist > hr + 2) & (dist < hr + 12) & (yy < hy + hr - 8) & ~((np.abs(xx - hx) < 30) & (yy > hy))
    mask &= ~moat
    lab2, n2 = ndi.label(mask)                       # keep the main piece only
    if n2 > 1:
        s2 = ndi.sum(np.ones_like(lab2), lab2, range(1, n2 + 1)); mask = lab2 == (int(np.argmax(s2)) + 1)

tex = np.asarray(canvas).copy()
tex[..., 3] = np.where(mask, tex[..., 3], 0)          # texture keeps only the figure's own pixels
Image.fromarray(tex, "RGBA").save(out / "texture.png")
Image.fromarray((mask * 255).astype(np.uint8), "L").save(out / "mask.png")

def P(name): x, y = J[name]; return [int(x + pad), int(y + pad)]
order = [("root", None, "hip"), ("hip", "root", "hip"), ("torso", "hip", "torso"), ("neck", "torso", "neck"),
         ("right_shoulder", "torso", None), ("right_elbow", "right_shoulder", None), ("right_hand", "right_elbow", None),
         ("left_shoulder", "torso", None), ("left_elbow", "left_shoulder", None), ("left_hand", "left_elbow", None),
         ("right_hip", "root", None), ("right_knee", "right_hip", None), ("right_foot", "right_knee", None),
         ("left_hip", "root", None), ("left_knee", "left_hip", None), ("left_foot", "left_knee", None)]
lines = [f"height: {canvas.height}", "skeleton:"]
for name, parent, src in order:
    x, y = P(src or name)
    lines += [f"- loc:", f"  - {x}", f"  - {y}", f"  name: {name}", f"  parent: {parent if parent else 'null'}"]
lines.append(f"width: {canvas.width}")
(out / "char_cfg.yaml").write_text("\n".join(lines) + "\n")

ov = Image.new("RGB", canvas.size, "white"); ov.paste(canvas, (0, 0), canvas)
d = ImageDraw.Draw(ov)
m = Image.fromarray((mask * 60).astype(np.uint8), "L")
ov.paste(Image.new("RGB", canvas.size, (90, 160, 230)), (0, 0), m)
for name, parent, src in order:
    if parent:
        d.line([tuple(P(src or name)), tuple(P(dict((o[0], o[2]) for o in order)[parent] or parent))], fill=(220, 30, 30), width=3)
for name, parent, src in order:
    x, y = P(src or name); d.ellipse([x - 6, y - 6, x + 6, y + 6], fill=(220, 30, 30))
ov.save(out / "joint_overlay.png")
print("ok", canvas.size)
