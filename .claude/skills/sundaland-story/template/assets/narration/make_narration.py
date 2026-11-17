"""Per-sentence ElevenLabs TTS (narrator Brian + character voices from script metadata; radio/field filter on character lines, eleven_multilingual_v2) → per-section WAV with designed pauses.
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
script = json.load(open(PROJ / "artifacts/script.json", encoding="utf-8"))
VOICE_IDS = script["metadata"]["voices"]
def voice_of(sec): return sec["speaker_directions"].split()[1]
SENT = HERE / "sentences"; SENT.mkdir(exist_ok=True)
PROVIDER = "elevenlabs_tts"
EL_VOICE, EL_MODEL = "nPczCjzI2devNBz1zQrb", "eleven_multilingual_v2"   # Brian
EL_SETTINGS = {"stability": 0.5, "similarity_boost": 0.75, "style": 0.0, "speed": 1.0}
VOICE, RATE = "en-US-Chirp3-HD-Orus", 0.98                              # google_tts fallback
GAP_NUMBER, GAP_TITLE, GAP_SENT = 0.25, 0.70, 0.30
REUSE = {}
CHAR_SETTINGS = {"stability": 0.4, "similarity_boost": 0.75, "style": 0.3, "speed": 1.0}
RADIO = "highpass=f=320,lowpass=f=3200,acompressor=threshold=-20dB:ratio=4,volume=1.6"
FIELD = "highpass=f=180,lowpass=f=5500,acompressor=threshold=-20dB:ratio=3,volume=1.3"
FILTER = {"daniel": RADIO, "charlie": RADIO, "will": RADIO, "liam": FIELD}

def split(text):
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    return [p for p in parts if p]

registry.discover()
tts = registry._tools[PROVIDER]
jobs = []
for n, sec in enumerate(script["sections"]):
    if sec["id"] in REUSE: continue
    v = voice_of(sec)
    ss = split(sec["text"]) if v == "brian" else [sec["text"]]   # character lines = one clip
    for i, s in enumerate(ss):
        jobs.append((sec["id"], i, s, " ".join(ss[:i])[-300:], " ".join(ss[i + 1:])[:300], 1000 + n, v))

def run(job):
    sid, i, text, prev, nxt, seed, v = job
    out = SENT / f"{sid}_{i:02d}.mp3"
    if out.exists() and out.stat().st_size > 1000:
        return sid, i, True, 0.0, None
    if PROVIDER == "elevenlabs_tts":
        args = {"text": text, "voice_id": VOICE_IDS[v], "model_id": EL_MODEL, **(EL_SETTINGS if v == "brian" else CHAR_SETTINGS), "seed": seed, "output_path": str(out)}
        if prev: args["previous_text"] = prev      # neighbouring sentences keep prosody continuous across clips
        if nxt: args["next_text"] = nxt
    else:
        args = {"text": text, "voice": VOICE, "speaking_rate": RATE, "output_path": str(out)}
    r = tts.execute(args)
    return sid, i, r.success, (r.cost_usd or 0.0), r.error

cost = 0.0
with ThreadPoolExecutor(1) as ex:   # 4 parallel calls hit 401s on this plan
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
    v = voice_of(sec)
    sents = split(sec["text"]) if v == "brian" else [sec["text"]]
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
        fx = (FILTER[v] + ",") if v in FILTER and not isinstance(parts[k], tuple) else ""
        filters.append(f"[{k}:a]{fx}aresample=48000,aformat=channel_layouts=mono[a{k}]")
    filters.append("".join(f"[a{k}]" for k in range(n)) + f"concat=n={n}:v=0:a=1[out]")
    out = HERE / f"{sid}.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filters), "-map", "[out]", str(out)], check=True)
    timing[sid] = {"file": str(out.relative_to(PROJ)).replace("\\", "/"), "voice": v, "duration": round(dur(out), 3), "sentences": offs}

json.dump(timing, open(HERE / "narration_timing.json", "w", encoding="utf-8"), indent=2, ensure_ascii=False)
tot = sum(v["duration"] for v in timing.values())
print(f"sections {len(timing)}  narration {tot:.1f}s ({tot/60:.2f} min)  tts_cost ${cost:.4f}")
