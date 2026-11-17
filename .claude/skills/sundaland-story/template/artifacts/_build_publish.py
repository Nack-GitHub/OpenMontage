"""Publish pack → exports/: title options, description (hook, chapters, sources, credits), tags, hashtags. Never uploads."""
import json, re
from pathlib import Path

P = Path(__file__).resolve().parents[1]
rd = lambda f: json.loads((P / f).read_text(encoding="utf-8"))
tl = (P / "timeline.ts").read_text(encoding="utf-8")
TIMELINE = json.loads(re.search(r"export const TIMELINE: any\[\] = (\[.*?\]);\n", tl, re.S).group(1))
first = {}
for x in TIMELINE: first.setdefault(x["sid"], x["from"] / 30)
CH = [("s00", "The beach at midnight"), ("a1", "Act 1 · The oil clock"), ("a3", "The prize: oil, rubber and tin"), ("a5", "Why these beaches"),
      ("b1", "Act 2 · The night of 8 December"), ("b4", "The Hudsons and the burning ship"), ("b6", "Seven Thai beaches"),
      ("b7", "The cadets of Chumphon"), ("c1", "Act 3 · The road south"), ("c2", "The bicycle blitz"), ("c3", "Singapore falls"),
      ("c3b", "The oil Japan couldn't move"), ("c4", "Epilogue")]
fmt = lambda t: f"{int(t // 60)}:{int(t % 60):02d}"
chap = [(fmt(first[s] if s != "s00" else 0), n) for s, n in CH]
for (a, _), (b, _) in zip(chap, chap[1:]):
    ta = int(a.split(":")[0]) * 60 + int(a.split(":")[1]); tb = int(b.split(":")[0]) * 60 + int(b.split(":")[1])
    assert tb - ta >= 10, (a, b)

photos = rd("assets/images/photo_credits.json"); foot = rd("assets/video/footage_credits.json"); music = rd("assets/music_provenance.json")
used_photos = sorted({x["p"]["src"].split("/")[-1][:-4] for x in TIMELINE if x["kind"] == "photo"} | {"youth_monument"})
used_foot = sorted({x["p"]["src"].split("/")[-1] for x in TIMELINE if x["kind"] in ("footage", "maintitle", "quote") and x["p"].get("src")} | {"night_sea_1.mp4"})

title = "The Pacific War Started Here, Not Pearl Harbor"
alts = ["Before Pearl Harbor: The Beach Where the Pacific War Began", "78 Minutes Before Pearl Harbor", "Japan's First Strike Wasn't Pearl Harbor. It Was Malaya."]
desc = [
    "Seventy-eight minutes before the first bombs fell on Pearl Harbor (by most accounts), Japanese troops were already storming a beach in Malaya. "
    "This is the story of Kota Bharu, 8 December 1941, and why the Pacific War was really a war for Sundaland's oil, rubber and tin.",
    "",
    "Chapters",
    *[f"{t} {n}" for t, n in chap],
    "",
    "Selected sources",
    "• Battle of Kota Bharu: Wikipedia; Australian War Memorial (landing time)",
    "• Japanese invasion of Thailand (Chumphon, ceasefire, alliance): Wikipedia; Naewna (Wiratai Day)",
    "• Rubber 1940: Dunlop Bulletin via Papers Past (1942). Tin 1939: TIME (1941)",
    "• Japan's oil imports and stockpile: Honolulu Star-Advertiser; National WWII Museum; CIMSEC; FRUS 1941 vol. IV",
    "• Bicycles: ICHC / Naval War College study. Fall of Singapore: Imperial War Museums",
    "• Tanker war 1944–45: USSBS / JANAC summaries",
    "Times of the Kota Bharu landing differ between sources (≈40–90 minutes before Pearl Harbor); figures are approximate. Character lines are dramatized; named quotes are sourced.",
    "",
    "Credits",
    "Narration & character voices: ElevenLabs. Doodle cast and backgrounds: drawn for The Sundaland (Gemini app).",
    "Maps: NASA Blue Marble / ASTER GDEM (public domain), geoBoundaries (CC BY 4.0), Natural Earth (public domain). Globe clouds: Solar System Scope (CC BY 4.0).",
    "Photos (Wikimedia Commons):",
    *[f"• {photos[k]['title']} — {re.sub(chr(10), ' ', photos[k]['artist'])[:60] or 'unknown'} — {photos[k]['license']} — {photos[k]['page']}" for k in used_photos if k in photos],
    "Footage (Pixabay): " + "; ".join(f"{foot[f]['user']} ({foot[f]['page']})" for f in used_foot if f in foot),
    "Music: " + "; ".join(f"{v['track_title']} — {v['artist']} ({'YouTube Audio Library' if 'reused_from' not in v else 'Pixabay'})" for v in music.values()),
    "",
    "That's the geography behind the economy. This is The Sundaland.",
]
tags = ["Kota Bharu", "Pearl Harbor", "Pacific War", "World War 2", "Malaya 1941", "Battle of Kota Bharu", "Japanese invasion of Thailand",
        "Fall of Singapore", "bicycle blitzkrieg", "Southeast Asia history", "economic history", "The Sundaland"]
hashtags = ["#WW2", "#PacificWar", "#KotaBharu", "#SoutheastAsia", "#TheSundaland"]
out = P / "exports"; out.mkdir(exist_ok=True)
d = "\n".join(desc)
assert len(d) < 5000, len(d)
(out / "description.txt").write_text(d, encoding="utf-8")
(out / "metadata.json").write_text(json.dumps({"title": title, "title_alternatives": alts, "tags": tags, "hashtags": hashtags,
                                                "chapters": chap, "thumbnail_recommended": "renders/thumbs/thumb_map.jpg",
                                                "upload_note": "Upload as PRIVATE first so YouTube's pre-publish copyright check runs; never auto-uploaded."}, indent=1, ensure_ascii=False), encoding="utf-8")
print(title, len(title), "chars | description", len(d), "chars |", len(chap), "chapters")
