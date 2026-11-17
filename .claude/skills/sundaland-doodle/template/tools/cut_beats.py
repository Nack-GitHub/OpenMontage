"""Cut the chosen frame windows out of full-length AnimatedDrawings renders, ready for HyperFrames.

Usage: python -I cut_beats.py <beats.json> <render_dir> <assets_dir>
beats.json: [
  {"name": "b1_hi",    "src": "dab",   "start": 50,  "end": 125, "src_fps": 30},
  {"name": "b2_jump",  "src": "jump",  "start": 140, "end": 310, "src_fps": 120, "slow": 1.15},
  {"name": "b5_cheer", "src": "dab",   "start": 230, "end": 339, "src_fps": 30,  "hold": 0.6}
]
- src_fps: the BVH rate of that render (wave/jump 120, jesse dance 100, dab/jacks/zombie 30)
- slow: >1 plays slower (1.15 = 15 % slower)    - hold: seconds to freeze the last frame (final beat)
Every clip is resampled to 30 fps and its near-white background is pushed to pure white (255),
otherwise a faint grey box shows when the clip is multiplied onto the white page.
Prints each clip's duration — copy those into the scene's data-start / data-duration.
"""
import json, subprocess, sys
from pathlib import Path

beats = json.loads(Path(sys.argv[1]).read_text())
rdir, adir = Path(sys.argv[2]), Path(sys.argv[3])
adir.mkdir(parents=True, exist_ok=True)
t = 0.0
for b in beats:
    vf = (f"select='between(n\\,{b['start']}\\,{b['end']})',setpts=(N/{b['src_fps']})/TB*{b.get('slow', 1)},fps=30,"
          "colorlevels=rimax=0.94:gimax=0.94:bimax=0.94")
    if b.get("hold"):
        vf += f",tpad=stop_mode=clone:stop_duration={b['hold']}"
    out = adir / f"{b['name']}.mp4"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(rdir / f"{b['src']}.mp4"), "-vf", vf, "-an",
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", str(out)], check=True)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(out)],
                               capture_output=True, text=True).stdout)
    print(f'{b["name"]:12s} data-start="{t:.3f}" data-duration="{dur:.3f}"')
    t += dur
print(f"total {t:.3f} s")
