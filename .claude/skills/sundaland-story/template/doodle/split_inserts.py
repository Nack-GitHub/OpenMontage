"""Split assets/video/doodles_all.mp4 into public/doodles/Dxx.mp4 using inserts.json, plus a 1-frame-per-insert contact sheet."""
import json, subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent; PROJ = HERE.parent
src = PROJ / "assets/video/doodles_all.mp4"; out = PROJ / "public/doodles"; out.mkdir(parents=True, exist_ok=True)
ins = json.loads((HERE / "inserts.json").read_text(encoding="utf-8"))
for d, v in ins.items():
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{v['start']:.3f}", "-i", str(src), "-t", f"{v['duration']:.3f}",
                    "-c:v", "libx264", "-crf", "18", "-preset", "veryfast", "-pix_fmt", "yuv420p", "-an", str(out / f"{d}.mp4")], check=True)
thumbs = []
for d, v in ins.items():
    th = out / f"_{d}.png"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{v['duration'] * 0.65:.2f}", "-i", str(out / f"{d}.mp4"), "-frames:v", "1",
                    "-vf", "scale=480:270", str(th)], check=True)
    thumbs.append(th)
args = []
for t in thumbs: args += ["-i", str(t)]
n = len(thumbs); cols = 7
layout = "|".join(f"{(i % cols) * 480}_{(i // cols) * 270}" for i in range(n))
subprocess.run(["ffmpeg", "-v", "error", "-y", *args, "-filter_complex", "".join(f"[{i}]" for i in range(n)) + f"xstack=inputs={n}:layout={layout}",
                str(PROJ / "assets/video/_doodles_contact.jpg")], check=True)
for t in thumbs: t.unlink()
print("split", n, "inserts →", out)
