"""Build proposal_packet.json (pending approval) for the Kota Bharu pilot and write an awaiting_human checkpoint."""
import json
from pathlib import Path
from lib.checkpoint import write_checkpoint

P = Path(__file__).resolve().parent
research = json.loads((P / "research_brief.json").read_text(encoding="utf-8"))

def tool(name, role, ok=True):
    return {"tool_name": name, "role": role, "available": ok}

proposal = {
    "version": "1.0",
    "concept_options": [
        {
            "id": "c1-78-minutes",
            "title": "The Pacific War Started Here, Not Pearl Harbor",
            "hook": "At half past midnight, three ships dropped anchor off a Malayan beach. Seventy-eight minutes later, Pearl Harbor. The war started here — and it was a war for Sundaland's oil, rubber and tin.",
            "narrative_structure": "story",
            "visual_approach": "Yarnhub-style present-tense minute-by-minute story told in the channel's language: satellite map + HUD dual clock (Kota Bharu vs Hawaii), archive photo name cards, doodle-cast inserts for the human beats and the economics, illustrative footage.",
            "suggested_playbook": "sundaland-facts FORMAT.md (map/HUD/brand) + sundaland-doodle (inserts)",
            "target_audience": "global WW2-curious viewers; Thai/SEA viewers",
            "target_platform": "youtube",
            "target_duration_seconds": 780,
            "key_points": [
                "Cold open: lookout sees three ships → shelling 00:30 → Hawaii clock still asleep → '78 minutes before Pearl Harbor' (hedged)",
                "Act 1 The Clock: Japan's oil ~80% from the US → July 1941 freeze → 1–2 year stockpile → the prize: NEI oil, Malaya rubber (~39%), tin",
                "Act 2 The Night: Kota Bharu beaches, Dogras, RAAF Hudsons, Awazisan Maru burning; seven Thai beaches; Chumphon cadets at Tha Nang Sang bridge",
                "Act 3 The Road South: 18,000 bicycles through rubber estates → Singapore falls in ~70 days → epilogue numbers, Wiratai Day",
            ],
            "core_message": "Pearl Harbor was the shield; the target was Sundaland's resources.",
            "cta": "Subscribe for the geography behind the economy",
            "tone": "tense, respectful, documentary; no jokes about death",
            "grounded_in": [d["source_url"] for d in research["data_points"][:6]],
            "why_this_works": "Borrows the reference's proven engine (cold open in medias res, ticking clock, named people, multi-POV) while adding what it lacks: the economic why and the SEA geography — and rides the WW2 audience's interest ahead of the 8 December anniversary.",
        },
        {
            "id": "c2-oil-clock",
            "title": "Japan Was Running Out of Oil. So It Invaded Sundaland",
            "hook": "In the summer of 1941, Japan's oil gauge started falling — and the nearest full tank was in Borneo and Sumatra.",
            "narrative_structure": "data_narrative",
            "visual_approach": "Starts with the embargo and a HUD fuel gauge; landing comes at minute 5. More HUD, less drama.",
            "target_platform": "youtube",
            "target_duration_seconds": 600,
            "why_this_works": "Closest to the channel's current data style; weaker hook for WW2 search/suggested traffic.",
        },
        {
            "id": "c3-seven-beaches",
            "title": "Seven Beaches, One Night: The Day Japan Landed in Thailand",
            "hook": "On 8 December 1941, Japan came ashore on seven Thai beaches at once — and at Chumphon, schoolboys fought back.",
            "narrative_structure": "story",
            "visual_approach": "Thai-centred version: map of the seven landings, doodle Yuwachon cadets carry the story; Kota Bharu becomes a side thread.",
            "target_platform": "youtube",
            "target_duration_seconds": 720,
            "why_this_works": "Strong for Thai viewers; smaller global audience and less economy content.",
        },
    ],
    "selected_concept": {
        "concept_id": "c1-78-minutes",
        "rationale": "User picked the Kota Bharu pilot (option A) and asked to pair it with the doodle format; c1 keeps the reference's cold-open drama and the channel's economy lens.",
        "modifications": ["Doodle inserts ~20–25% of runtime", "Exact time gap hedged ('more than an hour' / 'by most accounts 78 minutes')"],
    },
    "production_plan": {
        "pipeline": "animated-explainer",
        "playbook": "sundaland-facts FORMAT.md (playbook_override: acts renamed The Clock / The Night / The Road South; countdown replaced by timeline)",
        "stages": [
            {"stage": "script", "tools": [tool("web_search", "fact checks")], "approach": "~1,950 words, present tense, sourced quotes only for named people; unnamed doodle characters may say generic lines"},
            {"stage": "scene_plan", "tools": [tool("video_compose", "plan beats")], "approach": "map/HUD ~55%, archive photos + footage ~20–25%, doodle ~20–25%; beat sheet for doodle scenes"},
            {"stage": "assets", "tools": [tool("elevenlabs_tts", "narration Brian"), tool("pixabay", "illustrative footage"), tool("wikimedia", "archive photos"),
                                         tool("pixabay_music", "screened music"), tool("hyperframes", "doodle inserts")],
             "approach": "doodle sprites already cut (39); per-sentence TTS; Commons PD/CC photos only", "fallback_if_unavailable": "google_tts Chirp3-HD Orus (ask first)"},
            {"stage": "edit", "tools": [tool("video_compose", "timeline from narration timing")], "approach": "facts template timeline builder"},
            {"stage": "compose", "tools": [tool("video_compose", "render")], "approach": "main edit in the chosen runtime; doodle scenes as MP4 inserts"},
        ],
        "quality_tradeoffs": [
            {"tradeoff": "No Unreal-grade 3D reenactment", "recommendation": "Compete on map + money + archive authenticity, not graphics", "quality_impact": "different, not lower, perceived value"},
            {"tradeoff": "Doodle tone vs war deaths", "recommendation": "Deaths/combat only via map, text and archive; doodles for economics and human moments with serious faces"},
            {"tradeoff": "Sources disagree on the time gap (40–90 min)", "recommendation": "Hedge in narration; show both clocks with sources on screen"},
        ],
        "alternative_paths": [
            {"description": "Narration only (Brian), dialogue as on-screen speech bubbles", "total_cost_usd": 0, "quality_level": "budget", "what_changes": "no character voices"},
            {"description": "Brian + 3 extra ElevenLabs voices for ~12 short dialogue lines (radio/phone filtered)", "total_cost_usd": 0, "quality_level": "standard", "what_changes": "+~700 TTS characters"},
        ],
        "delivery_promise": {"promise_type": "hybrid", "motion_required": True, "source_required": False,
                              "tone_mode": "tense documentary", "quality_floor": "broadcast", "approved_fallback": None},
        "renderer_family": "documentary-montage",
        "composition_mode": "atelier",
        "art_direction": "Atlas-meets-ledger brand (FORMAT.md) + HUD data + crayon doodle inserts on white panels",
        "music_source": {"source_type": "bring_your_own", "provider": "pixabay_music (Content-ID screened)",
                         "mood_direction": "cold open/Act 2 tension; Act 1 low pulse; Act 3 driving then somber",
                         "estimated_cost_usd": 0},
        "voice_selection": {"provider": "elevenlabs", "voice_id": "nPczCjzI2devNBz1zQrb", "rationale": "channel voice Brian (user change 2026-11-16)",
                            "delivery_style": "present-tense, measured tension", "pacing_policy": "~160 wpm, re-measure on first section",
                            "sample_approval_required": False},
    },
    "cost_estimate": {
        "total_estimated_usd": 0,
        "line_items": [
            {"tool": "elevenlabs_tts", "operation": "narration ~1,950 words", "quantity": 12500, "estimated_usd": 0, "notes": "~12,500 characters from the user's ElevenLabs plan credits (+~700 if character voices)"},
            {"tool": "pixabay / wikimedia / pixabay_music", "operation": "footage, photos, music", "estimated_usd": 0},
            {"tool": "remotion / hyperframes", "operation": "local render", "estimated_usd": 0},
        ],
        "budget_verdict": "no_budget_set",
    },
    "approval": {"status": "pending"},
}
(P / "proposal_packet.json").write_text(json.dumps(proposal, indent=2, ensure_ascii=False), encoding="utf-8")
write_checkpoint(P.parent.parent, P.parent.name, "proposal", "awaiting_human", {"proposal_packet": proposal},
                 pipeline_type="animated-explainer", human_approval_required=True)
print("proposal awaiting approval")
