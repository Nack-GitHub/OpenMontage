"""Download selected Wikimedia Commons files (licence-checked) → assets/images/<key>.jpg + photo_credits.json."""
import json, re, time, urllib.request, urllib.parse
from pathlib import Path

HERE = Path(__file__).resolve().parent
UA = {"User-Agent": "OpenMontageResearch/1.0 (asset licence check)"}
OK = re.compile(r"(public domain|^pd|cc0|cc[- ]by(-sa)?|fal|free art)", re.I)
FILES = {
    "yamashita": "Yamashita Tomoyuki.jpg",
    "hudsons_kota_bharu": "A16-50 of C Flight, 8 Squadron at Kota Bharu, Kelantan, Malaya (28244301476).jpg",
    "catalinas_205": "Catalinas 205 Sqn RAF off Malaya 1941.jpg",
    "prince_of_wales_sg": "HMS Prince Of Wales in Singapore.jpg",
    "percival_surrender": "Malayan Campaign (03 surrender of Percival 01) PDVD 003.JPG",
    "surrender_alt": "Surrender Singapore.jpg",
    "tha_nang_sang_diorama": "Diorama of the Battle of Than Nang Sang Bridge of Chumphon Province, National Memorial, Thailand (1).jpg",
    "youth_monument": "World Wall 2 Youth Volunteers Monument - panoramio.jpg",
    "jp_river_crossing": "Japanese troops crossing a river.jpg",
    "jp_johore": "Japanese troops at Johore.jpg",
    "jp_johore_bahru_awm": "Japanese troops final stages to conquest Singapore, Johore Bahru (AWM 127900).JPG",
    "jp_gemas": "Japanese troops near Gemas, Malaya.jpg",
}

def get(url, tries=6):
    for k in range(tries):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
        except Exception as e:
            if "429" in str(e) or "timed out" in str(e):
                time.sleep(10 * (k + 1)); continue
            raise
    raise RuntimeError("gave up " + url)

credits = json.loads((HERE / "photo_credits.json").read_text(encoding="utf-8")) if (HERE / "photo_credits.json").exists() else {}
strip = lambda h: re.sub(r"<[^>]+>", "", h or "").strip()
for key, title in FILES.items():
    out = HERE / f"{key}.jpg"
    if out.exists() and key in credits:
        continue
    q = urllib.parse.urlencode({"action": "query", "titles": "File:" + title, "prop": "imageinfo", "iiprop": "url|extmetadata|size",
                                "iiurlwidth": 2400, "format": "json"})
    d = json.loads(get("https://commons.wikimedia.org/w/api.php?" + q))
    page = next(iter(d["query"]["pages"].values()))
    if "imageinfo" not in page:
        print("MISSING", key); continue
    ii = page["imageinfo"][0]; md = ii.get("extmetadata", {})
    lic = strip(md.get("LicenseShortName", {}).get("value"))
    artist = strip(md.get("Artist", {}).get("value"))[:120]
    desc = strip(md.get("ImageDescription", {}).get("value"))[:200]
    date = strip(md.get("DateTimeOriginal", {}).get("value"))[:40]
    if not OK.search(lic):
        print("REJECT licence", key, lic); continue
    data = get(ii.get("thumburl") or ii["url"])
    if data[:3] != b"\xff\xd8\xff" and data[:8] != b"\x89PNG\r\n\x1a\n":
        print("NOT AN IMAGE", key); continue
    out.write_bytes(data)
    credits[key] = {"file": out.name, "title": title, "page": ii["descriptionurl"], "license": lic, "artist": artist,
                    "date": date, "description": desc, "size": [ii["width"], ii["height"]]}
    print("OK", key, "|", lic, "|", artist[:50], "|", date, "|", desc[:90])
    (HERE / "photo_credits.json").write_text(json.dumps(credits, indent=2, ensure_ascii=False), encoding="utf-8")
    time.sleep(3)
