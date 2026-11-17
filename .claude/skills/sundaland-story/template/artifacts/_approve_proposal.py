"""User approved the proposal (2026-11-17): Remotion main + HyperFrames doodle inserts, voice option (b) with 4 voices, screened music."""
import json
from pathlib import Path
from lib.checkpoint import write_checkpoint

P = Path(__file__).resolve().parent
prop = json.loads((P / "proposal_packet.json").read_text(encoding="utf-8"))
pp = prop["production_plan"]
pp["render_runtime"] = "remotion"
pp["voice_selection"]["rationale"] += "; character lines: Daniel (British/Indian Army phone), Charlie (RAAF, Australian), Will (Japanese radio, neutral), Liam (Thai cadet) — no put-on accents"
prop["approval"] = {"status": "approved_with_changes",
                    "user_notes": "Approved as recommended; voice option (b) with 4 character voices (3 -> 4 so Japanese and Thai lines differ). Keep the facts format's map language, sting, outro and end card."}
prop["selected_concept"]["modifications"].append("4 character voices (~700 chars) with radio/phone filter")
(P / "proposal_packet.json").write_text(json.dumps(prop, indent=2, ensure_ascii=False), encoding="utf-8")

def opt(i, label, score, reason, rej=None):
    o = {"option_id": i, "label": label, "score": score, "reason": reason}
    if rej: o["rejected_because"] = rej
    return o

def dec(i, cat, subj, opts, sel, reason):
    return {"decision_id": i, "stage": "proposal", "category": cat, "subject": subj, "options_considered": opts,
            "selected": sel, "reason": reason, "user_visible": True, "user_approved": True}

log = {"version": "1.0", "project_id": P.parent.name, "decisions": [
    dec("d-concept", "concept_selection", "Episode concept",
        [opt("c1", "78 minutes before Pearl Harbor (story)", 0.9, "reference engine + economy lens"),
         opt("c2", "Oil clock (data narrative)", 0.6, "weaker hook", "less drama for WW2 audience"),
         opt("c3", "Seven Thai beaches", 0.6, "Thai-centred", "smaller global audience")], "c1", "User picked option A and the recommended concept"),
    dec("d-runtime", "render_runtime_selection", "Main edit runtime",
        [opt("remotion", "Remotion (facts template)", 0.9, "map/HUD/brand already built in Remotion"),
         opt("hyperframes", "HyperFrames for the whole edit", 0.4, "doodle templates are HTML", "would mean rebuilding map/HUD/brand in HTML"),
         opt("ffmpeg", "FFmpeg only", 0.1, "concat", "no motion graphics")], "remotion",
        "Remotion for the main edit; doodle scenes rendered in HyperFrames and inserted as MP4 clips"),
    dec("d-mode", "composition_mode", "Authoring mode",
        [opt("atelier", "Atelier (facts template code)", 0.9, "channel look"), opt("templated", "Stock scene types", 0.2, "", "generic look")],
        "atelier", "Channel format is hand-authored"),
    dec("d-playbook", "playbook_override", "Story structure",
        [opt("timeline", "Acts The Clock / The Night / The Road South, no countdown numerals", 0.9, "story format"),
         opt("countdown", "N facts countdown", 0.3, "", "breaks the minute-by-minute story")], "timeline",
        "Keeps map language, HUD, sting, outro and end card from FORMAT.md; replaces fact title cards with timestamp/act cards"),
    dec("d-voice", "voice_selection", "Narration TTS provider",
        [opt("elevenlabs-brian", "ElevenLabs Brian", 0.9, "channel voice"), opt("google-orus", "Google Chirp3-HD Orus", 0.5, "", "fallback only")],
        "elevenlabs-brian", "Channel standard since 2026-11-16"),
    dec("d-charvoices", "voice_selection", "Character dialogue voices",
        [opt("b4", "4 ElevenLabs premade voices, filtered", 0.85, "voiced drama like the reference"),
         opt("a", "Brian only + speech bubbles", 0.5, "", "less immersive")], "b4", "User chose option (b); 4 voices so opposing sides differ"),
    dec("d-music", "music_source", "Music",
        [opt("screened", "Previously screened Pixabay tracks + 1 newly screened", 0.85, "low Content ID risk"),
         opt("generate", "ElevenLabs/Google music generation", 0.2, "", "paid; cost policy")], "screened",
        "Cinematic Tension (Kulakovka) + Dark Ambient (everything_is_dead) + 1 new screened track for Act 3"),
]}
write_checkpoint(P.parent.parent, P.parent.name, "proposal", "completed", {"proposal_packet": prop, "decision_log": log},
                 pipeline_type="animated-explainer", human_approval_required=True, human_approved=True)
print("proposal approved")
