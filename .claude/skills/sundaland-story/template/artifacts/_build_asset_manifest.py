"""asset_manifest.json from what is on disk (narration, music, photos, footage, doodles, globe, basemaps) + assets checkpoint (awaiting review)."""
import json, re
from pathlib import Path
from lib.checkpoint import write_checkpoint

P = Path(__file__).resolve().parents[1]
rd = lambda f: json.loads((P / f).read_text(encoding="utf-8"))
timing = rd("assets/narration/narration_timing.json")
plan = rd("artifacts/scene_plan.json")
photos = rd("assets/images/photo_credits.json"); foot = rd("assets/video/footage_credits.json"); music = rd("assets/music_provenance.json")
first_scene = {}
for sc in plan["scenes"]:
    first_scene.setdefault(sc["script_section_id"], sc["id"])
    for a in sc["required_assets"]:
        m = re.search(r"insert (D\d\d)", a["description"])
        if m: first_scene[m.group(1)] = sc["id"]
A = []
for sid, v in timing.items():
    A.append({"id": f"nar_{sid}", "type": "narration", "path": v["file"], "source_tool": "elevenlabs_tts", "provider": "elevenlabs",
              "model": "eleven_multilingual_v2", "scene_id": first_scene.get(sid, "sc001"), "duration_seconds": v["duration"], "format": "wav",
              "subtype": v["voice"], "license": "ElevenLabs output (user plan)"})
for slot, v in music.items():
    A.append({"id": f"music_{slot}", "type": "music", "path": v["file"], "source_tool": "pixabay_music" if "reused_from" in v else "youtube_audio_library",
              "provider": "pixabay" if "reused_from" in v else "youtube",
              "scene_id": "sc001", "duration_seconds": v["duration_seconds"], "license": v["license"], "original_url": v.get("page", "https://studio.youtube.com (Audio Library)"),
              "generation_summary": f"{v['track_title']} — {v['artist']} ({'reused, Content-ID screened' if 'reused_from' in v else 'YouTube Audio Library'})"})
for k, v in photos.items():
    A.append({"id": f"photo_{k}", "type": "image", "path": f"assets/images/{v['file']}", "source_tool": "wikimedia_commons", "provider": "wikimedia",
              "scene_id": "sc001", "license": v["license"], "original_url": v.get("page", "https://studio.youtube.com (Audio Library)"), "generation_summary": f"{v['artist']} · {v['date']}"[:200]})
for f, v in foot.items():
    A.append({"id": f"footage_{f[:-4]}", "type": "video", "path": f"assets/video/{f}", "source_tool": "pixabay", "provider": "pixabay",
              "scene_id": "sc001", "license": v["license"], "original_url": v.get("page", "https://studio.youtube.com (Audio Library)"), "generation_summary": f"{v['user']} · {v.get('planned_use', '')}"})
for d, v in rd("doodle/inserts.json").items():
    A.append({"id": f"doodle_{d}", "type": "animation", "path": f"public/doodles/{d}.mp4", "source_tool": "hyperframes", "provider": "local",
              "scene_id": first_scene.get(d, "sc001"), "duration_seconds": v["duration"], "format": "mp4", "subtype": "sundaland-doodle sprite insert",
              "license": "own (Gemini-app art drawn by the user)"})
for g in ("globe_in", "globe_out"):
    A.append({"id": g, "type": "video", "path": f"public/{g}.mp4", "source_tool": "render_globe", "provider": "local", "scene_id": "sc001",
              "license": "NASA Blue Marble (PD) + Solar System Scope clouds (CC BY 4.0)"})
for b in ("basemap_region", "basemap_sea", "basemap_kelantan", "basemap_chumphon", "earth_8k"):
    A.append({"id": b, "type": "image", "path": f"public/{b}.jpg", "source_tool": "nasa_gibs", "provider": "nasa", "scene_id": "sc001",
              "license": "NASA GIBS Blue Marble / ASTER GDEM (PD)"})
manifest = {"version": "1.0", "assets": A, "total_cost_usd": 0.0,
            "metadata": {"tts_chars_approx": 8200, "notes": "ElevenLabs credits from the user's plan; everything else free. Sequential TTS (parallel calls returned 401)."}}
(P / "artifacts/asset_manifest.json").write_text(json.dumps(manifest, indent=1, ensure_ascii=False), encoding="utf-8")
write_checkpoint(P.parent, P.name, "assets", "awaiting_human", {"asset_manifest": manifest}, pipeline_type="animated-explainer",
                 human_approval_required=True)
print("assets", len(A))
