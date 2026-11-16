"""final_raw.mp4 → loudnorm (I=-14, TP=-1, two-pass) → final.mp4; QC (blackdetect, silencedetect, spot frames); delete raw."""
import json, re, subprocess, sys
from pathlib import Path
from PIL import Image

PROJ = Path(__file__).resolve().parents[1]
R = PROJ / "renders"; raw, out = R / "final_raw.mkv", R / "final.mp4"
FF = "ffmpeg"

def run(args): return subprocess.run(args, capture_output=True, text=True, encoding="utf-8", errors="replace")

# concat the chunked renders (h264 + pcm in mkv) without re-encoding
chunks = sorted((R / "chunks").glob("chunk_*.mkv"))
assert chunks, "no chunks"
lst = R / "chunks" / "list.txt"
lst.write_text("".join(f"file '{c.as_posix()}'\n" for c in chunks), encoding="utf-8")
c = run([FF, "-hide_banner", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(raw)])
assert raw.exists() and raw.stat().st_size > 1e6, c.stderr[-800:]
print("concatenated", len(chunks), "chunks")

# single pass: limiter then loudnorm (two-pass linear left true peak at 0.0 dBTP; this chain measured I=-14.0, TP=-2.0)
af = "alimiter=limit=0.7:attack=5:release=60:level=false,loudnorm=I=-14:TP=-2:LRA=11"
m = run([FF, "-hide_banner", "-i", str(raw), "-af", "loudnorm=I=-14:TP=-1:print_format=json", "-f", "null", "-"]).stderr
js = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
r = run([FF, "-hide_banner", "-y", "-i", str(raw), "-c:v", "copy", "-af", af, "-ar", "48000", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", str(out)])
assert out.exists() and out.stat().st_size > 1e6, r.stderr[-800:]

# verify loudness of the output
v = run([FF, "-hide_banner", "-i", str(out), "-af", "loudnorm=I=-14:TP=-1:print_format=json", "-f", "null", "-"]).stderr
vj = json.loads(v[v.rindex("{"):v.rindex("}") + 1])
probe = run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_name,width,height,r_frame_rate", "-of", "json", str(out)]).stdout
dur = float(json.loads(probe)["format"]["duration"])

blk = run([FF, "-hide_banner", "-i", str(out), "-vf", "blackdetect=d=0.5:pix_th=0.06", "-an", "-f", "null", "-"]).stderr
blacks = re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", blk)
sil = run([FF, "-hide_banner", "-i", str(out), "-af", "silencedetect=n=-45dB:d=1.5", "-vn", "-f", "null", "-"]).stderr
silences = re.findall(r"silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)", sil)

# 24 spot frames
spot = R / "spot"; spot.mkdir(exist_ok=True)
times = [round(dur * (i + 0.5) / 24, 2) for i in range(24)]
for i, t in enumerate(times):
    run([FF, "-hide_banner", "-y", "-ss", str(t), "-i", str(out), "-frames:v", "1", "-vf", "scale=480:-1", str(spot / f"s{i:02d}.jpg")])
ims = [Image.open(spot / f"s{i:02d}.jpg") for i in range(24)]
w, h = ims[0].size; sheet = Image.new("RGB", (6 * w, 4 * h))
for i, im in enumerate(ims): sheet.paste(im, ((i % 6) * w, (i // 6) * h))
sheet.save(R / "final_spotcheck.jpg", quality=85)

report = {"duration_s": round(dur, 2), "loudness_in": js["input_i"], "loudness_out_I": vj["input_i"], "true_peak_out": vj["input_tp"],
          "black_segments": blacks, "silences_over_1_5s": silences, "size_mb": round(out.stat().st_size / 1e6, 1), "spot_times": times}
json.dump(report, open(R / "qc_report.json", "w", encoding="utf-8"), indent=1)
print(json.dumps(report, indent=1))
raw.unlink()
for c in chunks: c.unlink()
print("raw + chunks deleted")
