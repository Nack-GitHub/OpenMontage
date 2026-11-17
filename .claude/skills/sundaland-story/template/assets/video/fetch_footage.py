"""Pixabay video API → candidates per query, download top N (1080p), trim ≤12 s, no audio; credits in footage_credits.json."""
import json, subprocess, time, urllib.request, urllib.parse
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
KEY = next(l.split("=", 1)[1].strip().strip('"') for l in (ROOT / ".env").read_text(encoding="utf-8").splitlines() if l.startswith("PIXABAY_API_KEY="))
Q = {"night_beach": "night beach waves moon", "night_sea": "night ocean waves dark", "rubber_plantation": "rubber plantation",
     "jungle_road": "tropical jungle road", "beach_dawn": "tropical beach dawn", "surf_dark": "stormy sea waves"}
N = 3
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) OpenMontage/1.0"}
open_ = lambda url: urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
credits = {}
for key, q in Q.items():
    u = "https://pixabay.com/api/videos/?" + urllib.parse.urlencode({"key": KEY, "q": q, "per_page": 10, "safesearch": "true"})
    hits = json.loads(open_(u))["hits"]
    for k, h in enumerate(hits[:N]):
        v = h["videos"].get("large") or h["videos"]["medium"]
        if not v.get("url"): v = h["videos"]["medium"]
        raw = HERE / f"_raw_{h['id']}.mp4"; out = HERE / f"{key}_{k}.mp4"
        if not out.exists():
            raw.write_bytes(open_(v["url"]))
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-t", "12", "-an", "-vf",
                            "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30",
                            "-c:v", "libx264", "-crf", "20", "-preset", "veryfast", str(out)], check=True)
            raw.unlink()
        credits[out.name] = {"pixabay_id": h["id"], "user": h["user"], "page": h["pageURL"], "query": q, "tags": h["tags"],
                             "license": "Pixabay Content License"}
        print(out.name, h["user"], h["tags"][:60])
    time.sleep(1)
(HERE / "footage_credits.json").write_text(json.dumps(credits, indent=1, ensure_ascii=False), encoding="utf-8")
