"""Per-sentence ElevenLabs TTS (voice Brian, eleven_multilingual_v2) → per-section WAV with designed pauses.
Fallback: set PROVIDER = "google_tts" (Chirp3-HD Orus @0.98) only if ElevenLabs fails / quota runs out.
Writes assets/narration/<section>.wav + narration_timing.json (sentence-level offsets for the edit)."""
import json, re, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]          # repo root
sys.path.insert(0, str(ROOT))
from tools.tool_registry import registry

HERE = Path(__file__).resolve().parent
PROJ = HERE.parents[1]
script = json.load(open(PROJ / "artifacts/script.json"))
SENT = HERE / "sentences"; SENT.mkdir(exist_ok=True)
PROVIDER = "elevenlabs_tts"
EL_VOICE, EL_MODEL = "nPczCjzI2devNBz1zQrb", "eleven_multilingual_v2"   # Brian
EL_SETTINGS = {"stability": 0.5, "similarity_boost": 0.75, "style": 0.0, "speed": 1.0}
VOICE, RATE = "en-US-Chirp3-HD-Orus", 0.98                              # google_tts fallback
GAP_NUMBER, GAP_TITLE, GAP_SENT = 0.25, 0.70, 0.30
REUSE = {  # identical text to the approved sample → reuse approved audio
    "s00": [PROJ / "public/sample/a_hook.mp3"],
}

def split(text):
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    return [p for p in parts if p]

registry.discover()
tts = registry._tools[PROVIDER]
jobs = []
for n, sec in enumerate(script["sections"]):
    if sec["id"] in REUSE: continue
    ss = split(sec["text"])
    for i, s in enumerate(ss):
        jobs.append((sec["id"], i, s, " ".join(ss[:i])[-300:], " ".join(ss[i + 1:])[:300], 1000 + n))

def run(job):
    sid, i, text, prev, nxt, seed = job
    out = SENT / f"{sid}_{i:02d}.mp3"
    if out.exists() and out.stat().st_size > 1000:
        return sid, i, True, 0.0, None
    if PROVIDER == "elevenlabs_tts":
        args = {"text": text, "voice_id": EL_VOICE, "model_id": EL_MODEL, **EL_SETTINGS, "seed": seed, "output_path": str(out)}
        if prev: args["previous_text"] = prev      # neighbouring sentences keep prosody continuous across clips
        if nxt: args["next_text"] = nxt
    else:
        args = {"text": text, "voice": VOICE, "speaking_rate": RATE, "output_path": str(out)}
    r = tts.execute(args)
    return sid, i, r.success, (r.cost_usd or 0.0), r.error

cost = 0.0
with ThreadPoolExecutor(4) as ex:
    for sid, i, ok, c, err in ex.map(run, jobs):
        cost += c
        if not ok: print("FAIL", sid, i, err)

def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                                capture_output=True, text=True).stdout.strip())

timing = {}
for sec in script["sections"]:
    sid = sec["id"]
    files = REUSE.get(sid) or sorted(SENT.glob(f"{sid}_*.mp3"))
    sents = split(sec["text"])
    parts, offs, t = [], [], 0.0
    for i, f in enumerate(files):
        d = dur(f)
        offs.append({"i": i, "text": sents[i] if i < len(sents) and sid not in REUSE else sec["text"], "start": round(t, 3), "end": round(t + d, 3)})
        parts.append(f); t += d
        if i < len(files) - 1:
            is_num = bool(re.match(r"^(And )?[Nn]umber [a-z-]+\.$", sents[i])) if sid not in REUSE else False
            is_title = i == 1 and sid.startswith("f") and bool(re.match(r"^(And )?[Nn]umber", sents[0]))
            g = GAP_NUMBER if is_num else GAP_TITLE if is_title else GAP_SENT
            parts.append(("gap", g)); t += g
    # build concat via filter_complex with generated silences
    inputs, filters, labels = [], [], []
    for p in parts:
        if isinstance(p, tuple):
            idx = len(inputs); inputs += ["-f", "lavfi", "-t", f"{p[1]}", "-i", "anullsrc=r=48000:cl=mono"]
        else:
            idx = len(inputs); inputs += ["-i", str(p)]
        labels.append(f"[{len(labels)}:a]")
    # resample every input to 48k mono
    n = len(labels)
    for k in range(n):
        filters.append(f"[{k}:a]aresample=48000,aformat=channel_layouts=mono[a{k}]")
    filters.append("".join(f"[a{k}]" for k in range(n)) + f"concat=n={n}:v=0:a=1[out]")
    out = HERE / f"{sid}.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filters), "-map", "[out]", str(out)], check=True)
    timing[sid] = {"file": str(out.relative_to(PROJ)), "duration": round(dur(out), 3), "sentences": offs}

json.dump(timing, open(HERE / "narration_timing.json", "w"), indent=2)
tot = sum(v["duration"] for v in timing.values())
print(f"sections {len(timing)}  narration {tot:.1f}s ({tot/60:.2f} min)  tts_cost ${cost:.4f}")
