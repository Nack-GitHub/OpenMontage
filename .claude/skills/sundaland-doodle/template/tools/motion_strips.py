"""Contact strip of a rendered motion clip with source-frame numbers, to pick the usable window.

Usage: python -I motion_strips.py <clip.mp4> <out.png> [start end] [count=12]
Each tile is labelled with its SOURCE frame index (use these numbers in beats.json).
Look for: the character leaving frame (root motion, e.g. 'jumping' exits right), T-pose frames at the
start of most clips, and frames where a limb crosses the face.
"""
import subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

clip, out = sys.argv[1], Path(sys.argv[2])
probe = subprocess.run(["ffprobe", "-v", "error", "-count_packets", "-select_streams", "v", "-show_entries",
                        "stream=nb_read_packets,width,height", "-of", "csv=p=0", clip], capture_output=True, text=True).stdout.strip()
w, h, total = [int(x) for x in probe.split(",")]
s = int(sys.argv[3]) if len(sys.argv) > 4 else 0
e = int(sys.argv[4]) if len(sys.argv) > 4 else total - 1
count = int(sys.argv[5]) if len(sys.argv) > 5 else 12
idx = [int(round(s + (e - s) * i / (count - 1))) for i in range(count)]
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", clip, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                     capture_output=True).stdout
frames = np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)
tw = 200; th = int(h * tw / w)
sheet = Image.new("RGB", (tw * count, th + 24), "white")
d = ImageDraw.Draw(sheet)
for k, i in enumerate(idx):
    im = Image.fromarray(frames[min(i, len(frames) - 1)]).resize((tw, th))
    sheet.paste(im, (k * tw, 24))
    d.text((k * tw + 6, 4), str(i), fill=(220, 30, 30))
sheet.save(out)
print(f"{out}  frames {s}..{e} of {total}")
