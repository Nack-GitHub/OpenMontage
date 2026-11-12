"""Writes research + proposal checkpoints for thailand-sounds-fake (pre-production record)."""
from pathlib import Path
from lib.checkpoint import write_checkpoint

PD = Path("projects")
PID = "thailand-sounds-fake"
PIPE = "animated-explainer"

research_brief = {
    "version": "1.0",
    "topic": "20 facts about Thailand's geography, trade and economy that sound fake (The Sundaland — Asia Explained)",
    "research_date": "2026-11-11",
    "landscape": {
        "existing_content": [
            {"title": "50 Geography Facts That Will Completely Change How You See Earth", "url": "https://www.youtube.com/watch?v=VGgWpWxA6cs", "source": "YouTube / Curious Elephant", "angle": "countdown of strange places", "what_it_covers": "Global physical geography, ~30s per fact, aerial stock + map highlights", "what_it_misses": "Trade/economic consequences", "engagement_signal": "~548K views, 28.8 min"},
            {"title": "Generic 'facts about Thailand' travel listicles", "source": "YouTube/blogs", "angle": "tourism trivia", "what_it_covers": "Food, temples, etiquette", "what_it_misses": "Trade and economic geography"},
            {"title": "Country-explainer channels on Thailand", "source": "YouTube", "angle": "single-narrative economy explainer", "what_it_covers": "Macro economy, history", "what_it_misses": "Fast 'sounds fake' countdown hook"},
        ],
        "saturated_angles": ["Thai food & etiquette facts", "temples/culture trivia", "tourist must-see lists"],
        "underserved_gaps": ["Countdown format through a trade/economic-geography lens: how Thailand's shape, water and exports connect to global supply chains"],
    },
    "data_points": [
        {"claim": "Narrowest part of Thailand ~11–12.38 km (Prachuap Khiri Khan)", "source_url": "https://en.wikipedia.org/wiki/Mueang_Prachuap_Khiri_Khan_district", "source_name": "Wikipedia", "credibility": "secondary_source", "surprise_factor": "surprising", "usable_as": "#20"},
        {"claim": "Kra Isthmus ~44 km at narrowest; canal suggested as early as 1677; hills ~75 m", "source_url": "https://en.wikipedia.org/wiki/Kra_Isthmus", "source_name": "Wikipedia", "credibility": "secondary_source", "surprise_factor": "notable", "usable_as": "#19"},
        {"claim": "Doi Inthanon grass-level frost reached -5°C (Dec 2017)", "source_url": "https://www.js100.com/en/site/post_share/view/49632", "source_name": "JS100", "credibility": "secondary_source", "surprise_factor": "counterintuitive", "usable_as": "#18"},
        {"claim": "Songkhla Lake has fresh (Thale Noi), seasonal and brackish (Thale Sap) zones", "source_url": "https://ilec.or.jp/ILBMTrainingMaterials/wp-content/uploads/Songkhla.pdf", "source_name": "ILEC", "credibility": "primary_source", "surprise_factor": "surprising", "usable_as": "#16"},
        {"claim": "Bangkok 0.5–2 m above sea level; subsidence ~1–2 cm/yr (historic up to 3); sea rising ~4 mm/yr", "source_url": "https://bangkokpost.com/print/640784", "source_name": "Bangkok Post", "credibility": "secondary_source", "surprise_factor": "surprising", "usable_as": "#13-14"},
        {"claim": "Thailand made ~25–45% of world HDDs in 2011; floods cut output by over a third; prices rose >30%", "source_url": "https://www.channelinsider.com/news-and-trends/thai-floods-impact-hard-disk-drive-pc-shipments-idc/", "source_name": "IDC via Channel Insider", "credibility": "secondary_source", "surprise_factor": "counterintuitive", "usable_as": "#9"},
        {"claim": "Thailand ~33.5% of world natural rubber output (2024); 53.2% of concentrated latex exports", "source_url": "https://seasia.co/2026/08/21/thailand-is-the-worlds-largest-natural-rubber-producer", "source_name": "Krungsri Research via SEAsia", "credibility": "secondary_source", "surprise_factor": "notable", "usable_as": "#8"},
        {"claim": "Thai durian exports to China ~US$4.0B in 2024; Vietnam's share rose 33%→42%", "source_url": "https://www.bangkokpost.com/business/general/2945865/china-breaks-durian-import-record-as-vietnam-malaysia-nip-at-thailands-heels", "source_name": "Bangkok Post", "credibility": "secondary_source", "surprise_factor": "surprising", "usable_as": "#7"},
        {"claim": "Thailand 28.2% of global canned tuna export volume; imports >90% of raw tuna", "source_url": "https://www.krungsri.com/en/research/industry/industry-outlook/food-beverage/processed-seafood/io/canned-seafood-2025-2027", "source_name": "Krungsri Research / IOTC", "credibility": "secondary_source", "surprise_factor": "counterintuitive", "usable_as": "#6"},
        {"claim": "Rice exports 9.95 Mt in 2024 (225,656 MB THB)", "source_url": "https://thailand.go.th/issue-focus-detail/thai-rice-exports-in-2024-hits-6-year-high", "source_name": "Thai Government PR", "credibility": "primary_source", "surprise_factor": "notable", "usable_as": "#5"},
        {"claim": "Thailand 2nd-largest air-conditioner exporter (OEC 2022, OIE 2023); one 2024 source says 3rd", "source_url": "https://www.nationthailand.com/business/trading-investment/40027434", "source_name": "The Nation", "credibility": "secondary_source", "surprise_factor": "surprising", "usable_as": "#4"},
        {"claim": "1,468,997 vehicles produced in 2024; 1,019,213 exported", "source_url": "https://www.just-auto.com/analyst-comment/thailands-automotive-industry-at-a-crossroads", "source_name": "just-auto (FTI data)", "credibility": "secondary_source", "surprise_factor": "notable", "usable_as": "#3"},
        {"claim": "Thailand 2nd-largest sugar exporter (USDA 2023-24); ~75% of output exported", "source_url": "https://www.bangkokpost.com/business/general/2779810/thai-sugar-output-falls-amid-drought", "source_name": "Bangkok Post / USDA", "credibility": "secondary_source", "surprise_factor": "surprising", "usable_as": "#2"},
    ],
    "audience_insights": {
        "common_questions": ["Why is Thailand shaped like that?", "Why is Bangkok sinking?", "What does Thailand actually export?", "What was Sundaland?"],
        "misconceptions": [
            {"myth": "Thailand's economy is just tourism and rice", "reality": "Major exporter of vehicles, air conditioners, rubber, sugar, canned tuna"},
            {"myth": "Tropical countries never get frost", "reality": "Doi Inthanon grass frost to -5°C"},
            {"myth": "Canned tuna comes from the exporter's own waters", "reality": "Thailand imports >90% of its raw tuna"}],
        "knowledge_level": "general international audience; curious about Asia, no economics background",
    },
    "angles_discovered": [
        {"name": "Sounds fake, is true — countdown", "hook": "Facts about Thailand that sound completely fake — and aren't", "type": "evergreen", "why_now": "Proven countdown format (reference ~548K views); trade lens is underserved", "grounded_in": ["reference analysis", "#9 HDD flood", "#6 tuna"]},
        {"name": "Geography runs the economy", "hook": "How a country's shape decides what it sells", "type": "data_driven", "why_now": "Supply-chain awareness post-2020", "grounded_in": ["#19 Kra", "#9 HDD", "#2 sugar drought"]},
        {"name": "Lost land of Sundaland", "hook": "20,000 years ago you could walk from Thailand to Borneo", "type": "narrative", "why_now": "Channel brand tie-in", "grounded_in": ["Sunda Shelf / Ice Age sea level"]},
    ],
    "sources": [
        {"url": "https://www.youtube.com/watch?v=VGgWpWxA6cs", "title": "Reference video", "used_for": "format/pacing", "reliability": "primary"},
        {"url": "https://en.wikipedia.org/wiki/Songkhla_Lake", "title": "Songkhla Lake", "used_for": "#16", "reliability": "secondary"},
        {"url": "https://en.wikivoyage.org/wiki/Sam_Phan_Bok", "title": "Sam Phan Bok", "used_for": "#11", "reliability": "secondary"},
        {"url": "https://iotc.org/sites/default/files/documents/2025/10/IOTC-2025-WPTT27-06-Thailand.pdf", "title": "IOTC Thailand tuna", "used_for": "#6", "reliability": "primary"},
        {"url": "https://www.scienceasia.org/2015.41.n1/scias41_55.pdf", "title": "Holocene sea level, Gulf of Thailand", "used_for": "#12", "reliability": "primary"},
        {"url": "https://www.computerworld.com/article/1475717/thailand-floods-spur-rush-to-ssds.html", "title": "Thai floods & HDDs", "used_for": "#9", "reliability": "secondary"},
    ],
    "research_summary": "Facts verified via web search 2026-11-11; uncertain items hedged in script (HDD share range, rice 'top two', AC 'has ranked'). Two [VERIFY] flags remain (Bangkok piles phrasing, Two-Colored River colours). Draft: projects/thailand-sounds-fake/draft_script_v3.md",
}

decisions = {"version": "1.0", "project_id": PID, "decisions": [
    {"decision_id": "d-001", "stage": "proposal", "category": "pipeline_selection", "subject": "Production pipeline",
     "options_considered": [
         {"option_id": "animated-explainer", "label": "animated-explainer", "score": 0.9, "reason": "Production-stable, supports reference input, video_selector covers stock + Veo"},
         {"option_id": "documentary-montage", "label": "documentary-montage", "score": 0.4, "reason": "Real-footage fit", "rejected_because": "Beta; corpus_population/clip_retrieval unavailable; no reference_input support"},
         {"option_id": "hybrid", "label": "hybrid", "score": 0.3, "reason": "Needs source footage", "rejected_because": "No user source footage"}],
     "selected": "animated-explainer", "reason": "Best fit for narrated, research-led countdown with mixed visuals", "user_visible": True, "user_approved": True},
    {"decision_id": "d-002", "stage": "proposal", "category": "concept_selection", "subject": "Concept & format",
     "options_considered": [
         {"option_id": "B-doc-longform", "label": "Documentary countdown, 16:9, 8-10 min", "score": 0.9, "reason": "User chose long-form 8-10 min"},
         {"option_id": "A-short", "label": "Fake-or-True vertical Short", "score": 0.5, "reason": "Original recommendation", "rejected_because": "User chose long-form"},
         {"option_id": "C-map-first", "label": "Map-first animated vertical", "score": 0.3, "reason": "Least stock-dependent", "rejected_because": "Not chosen"}],
     "selected": "B-doc-longform", "reason": "User: 'จะทำคลิปยาวครับ 8-10นาที'", "user_visible": True, "user_approved": True},
    {"decision_id": "d-003", "stage": "proposal", "category": "render_runtime_selection", "subject": "Composition runtime",
     "options_considered": [
         {"option_id": "remotion", "label": "Remotion", "score": 0.9, "reason": "Available; React scenes for maps, stat cards, photo push-ins"},
         {"option_id": "hyperframes", "label": "HyperFrames", "score": 0.0, "reason": "Would suit kinetic type", "rejected_because": "runtime not available on this machine (npm doctor failed)"},
         {"option_id": "ffmpeg", "label": "FFmpeg only", "score": 0.2, "reason": "Always available", "rejected_because": "Cannot do animated maps/data graphics"}],
     "selected": "remotion", "reason": "Only motion-graphics runtime available; user informed HyperFrames is broken", "user_visible": True, "user_approved": True},
    {"decision_id": "d-004", "stage": "proposal", "category": "composition_mode", "subject": "Authoring mode",
     "options_considered": [
         {"option_id": "atelier", "label": "Atelier (bespoke)", "score": 0.85, "reason": "Brand-defining first video for The Sundaland"},
         {"option_id": "templated", "label": "Templated scene types", "score": 0.5, "reason": "Faster", "rejected_because": "Generic look for a channel-launch style piece"}],
     "selected": "atelier", "reason": "Hero/brand work; user shown the plan incl. atelier", "user_visible": True, "user_approved": True},
    {"decision_id": "d-005", "stage": "proposal", "category": "provider_selection", "subject": "Visual sources",
     "options_considered": [
         {"option_id": "pixabay+wikimedia+veo", "label": "Pixabay video + Wikimedia Commons photos + Veo for 6-8 non-photographable shots", "score": 0.9, "reason": "Real footage/photos for real places; ~$20-30"},
         {"option_id": "pexels", "label": "Pexels", "score": 0.0, "reason": "", "rejected_because": "User could not obtain a key"},
         {"option_id": "veo-only", "label": "Veo for all footage", "score": 0.2, "reason": "", "rejected_because": "$220-450 and AI depictions of real places mislead in factual content"}],
     "selected": "pixabay+wikimedia+veo", "reason": "Accuracy + cost", "user_visible": True, "user_approved": True},
    {"decision_id": "d-006", "stage": "proposal", "category": "voice_selection", "subject": "Narration TTS provider",
     "options_considered": [
         {"option_id": "google_tts_chirp3hd", "label": "Google TTS Chirp3-HD, English, male documentary", "score": 0.85, "reason": "Available, near-free, expressive"},
         {"option_id": "gemini_tts", "label": "Gemini TTS", "score": 0.6, "reason": "Style control", "rejected_because": "Price needs quote; keep as alternative"}],
     "selected": "google_tts_chirp3hd", "reason": "Default stated to user; voice confirmed at sample", "user_visible": True, "user_approved": True},
    {"decision_id": "d-007", "stage": "proposal", "category": "music_source", "subject": "Music",
     "options_considered": [
         {"option_id": "pixabay_music", "label": "Pixabay Music (free)", "score": 0.8, "reason": "Free, no key"},
         {"option_id": "google_music", "label": "Google Lyria", "score": 0.5, "reason": "Custom", "rejected_because": "Price needs quote"}],
     "selected": "pixabay_music", "reason": "Free; documentary ambient bed", "user_visible": True, "user_approved": True},
    {"decision_id": "d-008", "stage": "proposal", "category": "approval_policy", "subject": "Proposal approval",
     "options_considered": [{"option_id": "approved_with_changes", "label": "Approved with change: channel logo on intro/watermark/end card", "score": 1.0, "reason": "User: 'อย่าลืมใส่ logo ช่องไว้ด้วยนะครับ' in reply to approve-and-sample question"}],
     "selected": "approved_with_changes", "reason": "Covers proposal gate only; sample/script/scene/assets gates still require separate approval", "user_visible": True, "user_approved": True},
]}

proposal_packet = {
    "version": "1.0",
    "concept_options": [
        {"id": "A", "title": "Sounds Fake… It's True (vertical Short)", "hook": "FAKE? stamp flips to TRUE", "narrative_structure": "myth_busting", "visual_approach": "Stock + map pins + stamps", "target_platform": "youtube", "target_duration_seconds": 165, "key_points": ["20 facts", "2-beat reveal"], "why_this_works": "Game mechanic fits the title"},
        {"id": "B", "title": "20 Facts About Thailand That Sound Fake (But Aren't) — documentary countdown", "hook": "Thailand is 11 km wide in one spot, its capital sits on an old seabed, and one flood made computers pricier worldwide", "narrative_structure": "data_narrative", "visual_approach": "Real aerial/stock footage + Wikimedia photos of real places + bespoke Remotion maps/stat cards in brand navy→teal; Veo only for non-photographable shots", "suggested_playbook": "clean-professional", "target_audience": "International audience curious about Asia", "target_platform": "youtube", "target_duration_seconds": 540, "key_points": ["Act 1 The Land", "Act 2 The Water", "Act 3 The Money", "#1 Sundaland tie-in"], "core_message": "Geography quietly runs an economy", "cta": "That's Asia, explained. This is The Sundaland.", "tone": "calm documentary, curious", "grounded_in": ["reference analysis", "research_brief data_points"], "why_this_works": "Proven countdown format + underserved trade lens + brand tie-in"},
        {"id": "C", "title": "Map-first animated (vertical)", "hook": "A stylized map flies pin to pin", "narrative_structure": "journey", "visual_approach": "Remotion map + Imagen stills", "target_platform": "youtube", "target_duration_seconds": 150, "key_points": ["map journey", "no stock dependency"], "why_this_works": "Most distinct from reference"},
    ],
    "selected_concept": {"concept_id": "B", "rationale": "User chose long-form 8-10 min, Asia Explained niche", "modifications": [
        "Niche lens: trade/geography/economy; avoid unresolved disputes and domestic politics",
        "Channel branding: The Sundaland logo — intro sting, persistent watermark, end card",
        "English narration (default stated; changeable)"]},
    "production_plan": {
        "pipeline": PIPE, "playbook": "clean-professional",
        "stages": [
            {"stage": "assets", "approach": "Stock B-roll from Pixabay; real-place photos from Wikimedia Commons (attributed); Veo only for non-photographable shots; Google TTS narration; Pixabay music",
             "fallback_if_unavailable": "Imagen stills animated in Remotion for gaps (user approval required)",
             "tools": [
                {"tool_name": "tts_selector", "role": "narration", "provider": "google_tts", "available": True, "estimated_cost_usd": 0.3},
                {"tool_name": "pixabay_video", "role": "stock b-roll", "provider": "pixabay", "available": True, "estimated_cost_usd": 0},
                {"tool_name": "direct_clip_search", "role": "real-place photos (wikimedia)", "provider": "wikimedia", "available": True, "estimated_cost_usd": 0},
                {"tool_name": "veo_video", "role": "non-photographable shots", "provider": "veo", "available": True, "estimated_cost_usd": 25.6},
                {"tool_name": "pixabay_music", "role": "music bed", "provider": "pixabay", "available": True, "estimated_cost_usd": 0}]},
            {"stage": "compose", "approach": "Atelier Remotion composition: maps, stat cards, photo push-ins, logo sting/watermark/end card",
             "tools": [{"tool_name": "video_compose", "role": "render", "provider": "remotion", "available": True, "estimated_cost_usd": 0}]}],
        "renderer_family": "documentary-montage",
        "render_runtime": "remotion",
        "composition_mode": "atelier",
        "art_direction": "Calm documentary. Real footage carries the frame; graphics are restrained: brand navy (#1F2A6B) → teal (#21807F) gradient accents, white type, a single warm highlight (amber) for numbers. Thailand map as recurring motif. White logo watermark bottom-right.",
        "delivery_promise": {"promise_type": "hybrid", "motion_required": True, "source_required": False, "tone_mode": "educational", "quality_floor": "presentable",
                             "approved_fallback": "Animated real photos (Wikimedia) for specific real places only; 16:9 1920x1080, 8-10 min"},
        "music_source": {"source_type": "bring_your_own", "provider": "pixabay_music", "mood_direction": "calm documentary ambient, light pulse", "estimated_cost_usd": 0},
        "voice_selection": {"provider": "google_tts", "voice_id": "en-US-Chirp3-HD (male, confirm at sample)", "rationale": "Available, near-free, natural", "estimated_cost_usd": 0.3,
                            "delivery_style": "calm, curious documentary", "pacing_policy": "~150 wpm, beat pause before each reveal", "sample_approval_required": True},
        "decision_log_ref": "decision_log.json",
    },
    "cost_estimate": {"total_estimated_usd": 26.0, "budget_cap_usd": 30.0, "budget_verdict": "within_budget", "line_items": [
        {"tool": "veo_video", "operation": "8s clips", "quantity": 8, "estimated_usd": 25.6},
        {"tool": "google_tts", "operation": "narration ~1,550 words", "quantity": 1, "estimated_usd": 0.3},
        {"tool": "pixabay_video / direct_clip_search / pixabay_music", "operation": "stock video, Wikimedia photos, music", "estimated_usd": 0.0}]},
    "approval": {"status": "approved_with_changes", "user_notes": "อย่าลืมใส่ logo ช่องไว้ด้วยนะครับ", "approved_budget_usd": 30.0},
}

write_checkpoint(PD, PID, "research", "completed", {"research_brief": research_brief}, pipeline_type=PIPE, style_playbook="clean-professional")
write_checkpoint(PD, PID, "proposal", "completed", {"proposal_packet": proposal_packet, "decision_log": decisions},
                 pipeline_type=PIPE, style_playbook="clean-professional", human_approval_required=True, human_approved=True,
                 cost_snapshot={"total_spent_usd": 0.0, "budget_remaining_usd": 30.0})
print("ok")
