"""Help place the 16 AnimatedDrawings joints on a cut-out sprite.

Usage: python -I check_joints.py <sprite.png> [joints.json] [char_dir]
- prints the head interior centre + a suggested "head_circle" [cx, cy, r_outer] (needed so the
  head does not squash when the arms move — see SKILL.md, troubleshooting)
- with joints.json + char_dir (after prep_char.py): lists joints that fall OUTSIDE the mesh mask
  and the nearest point inside it (outside joints are silently skipped by AnimatedDrawings ->
  that limb will not bend)
Coordinates are sprite pixels (before prep_char's 40 px pad).
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

sprite = Path(sys.argv[1])
a = np.asarray(Image.open(sprite).convert("RGBA"))
white = (a[..., 3] > 250) & (a[..., :3].min(axis=2) > 230)
lab, n = ndi.label(white)
best = None
for i in range(1, n + 1):
    ys, xs = np.nonzero(lab == i)
    if len(ys) > 2000 and ys.mean() < a.shape[0] * 0.55:          # big white blob in the upper half = head
        if best is None or len(ys) > best[0]:
            best = (len(ys), xs.mean(), ys.mean(), (xs.max() - xs.min() + ys.max() - ys.min()) / 4)
if best:
    _, cx, cy, r_in = best
    print(f"head interior centre ({cx:.0f}, {cy:.0f}), inner radius {r_in:.0f}")
    print(f'suggest  "neck": [{cx:.0f}, {cy + r_in * 0.4:.0f}]   (neck goes INSIDE the head, not at the chin)')
    print(f'suggest  "head_circle": [{cx:.0f}, {cy:.0f}, {r_in + 12:.0f}]')
else:
    print("no head blob found — place neck / head_circle by eye")

if len(sys.argv) >= 4:
    J = json.loads(Path(sys.argv[2]).read_text())
    m = np.asarray(Image.open(Path(sys.argv[3]) / "mask.png")) > 0
    pad = 40
    ys, xs = np.nonzero(m)
    bad = 0
    for k, v in J.items():
        if k == "head_circle":
            continue
        X, Y = v[0] + pad, v[1] + pad
        if not (0 <= Y < m.shape[0] and 0 <= X < m.shape[1] and m[Y, X]):
            d = (xs - X) ** 2 + (ys - Y) ** 2
            i = int(np.argmin(d)); bad += 1
            print(f"OUTSIDE  {k:15s} {v} -> nearest inside ({xs[i] - pad}, {ys[i] - pad}); move it onto the stroke centre")
    print("all joints inside the mesh" if not bad else f"{bad} joint(s) outside — fix joints.json and rerun prep_char.py")
