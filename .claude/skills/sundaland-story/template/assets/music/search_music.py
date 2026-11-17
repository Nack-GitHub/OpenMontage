"""Pixabay Music search (raw bootstrap items) for each act → candidates.json with every field Pixabay exposes.
Then screen: known claimers, Pixabay Content-ID flags in the raw item, YouTube distribution check (yt-dlp search)."""
import json, re, subprocess, sys, time, urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]; sys.path.insert(0, str(ROOT))
from tools.audio.pixabay_music import PixabayMusic

QUERIES = {"act3": ["war documentary drums", "military march tension documentary", "historical war epic percussion"]}
OLDQ = {
 "act1": ["curious documentary light", "inquisitive ambient pulse", "documentary minimal piano curious"],
 "act2": ["serious documentary", "dark documentary ambient", "historical documentary tension"],
 "act3": ["suspense minimal documentary", "tense ambient pulse", "investigation documentary"],
 "finale": ["reflective cinematic ambient", "hopeful reflective piano", "documentary ending calm"],
}
BLOCK = {"avelinemusic", "nastelbom"}
t = PixabayMusic()

def raw_search(q):
    slug = re.sub(r"[^a-z0-9]+", "-", q.lower()).strip("-")
    url = f"https://pixabay.com/music/search/{slug}/"
    op = t._build_opener()
    req = urllib.request.Request(url); req.add_header("User-Agent", t._USER_AGENT)
    for k, v in t._BROWSER_HEADERS.items(): req.add_header(k, v)
    with t._open_with_retry(op.open, req, 30) as r: html = r.read().decode("utf-8", "replace")
    m = re.search(r'window\.__BOOTSTRAP_URL__\s*=\s*["\']([^"\']+)["\']', html)
    if not m: return []
    req = urllib.request.Request("https://pixabay.com" + m.group(1)); req.add_header("User-Agent", t._USER_AGENT)
    req.add_header("Accept", "application/json, text/plain, */*"); req.add_header("Referer", url)
    with t._open_with_retry(op.open, req, 20) as r: data = json.loads(r.read().decode("utf-8"))
    return data.get("page", {}).get("results", [])

cands = {}
for act, qs in QUERIES.items():
    seen = {}
    for q in qs:
        res = []
        for attempt in range(4):
            try: res = raw_search(q); break
            except Exception as e: print("retry", q, e); time.sleep(10 * (attempt + 1))
        for it in res:
            if it.get("id") in seen: continue
            seen[it["id"]] = it
        time.sleep(2)
    cands[act] = list(seen.values())
    print(act, len(cands[act]))
json.dump(cands, open(HERE / "raw_candidates.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)
k = cands["act3"][0]
print("RAW KEYS:", sorted(k.keys()))
print("SAMPLE:", json.dumps({kk: k[kk] for kk in k if kk not in ("sources", "description")}, ensure_ascii=False)[:1200])
