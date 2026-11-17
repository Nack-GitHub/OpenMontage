"""Build research_brief.json for the Kota Bharu pilot and write the research checkpoint."""
import json
from pathlib import Path
from lib.checkpoint import write_checkpoint

P = Path(__file__).resolve().parent
WIKI_KB = "https://en.wikipedia.org/wiki/Battle_of_Kota_Bharu"
WIKI_TH = "https://en.wikipedia.org/wiki/Japanese_invasion_of_Thailand"
AWM = "https://awm.gov.au/collection/E84717"
DUNLOP = "https://paperspast.natlib.govt.nz/newspapers/TAWC19420211.2.44"
FRUS = "https://history.state.gov/historicaldocuments/frus1941v04/d612"
CIMSEC = "https://cimsec.org/tag/pearl-harbor/"
NWC = "https://www.ichc.biz/proceedings/ICHC-032-11.pdf"
IWM = "https://www.iwm.org.uk/history/second-world-war/war-against-japan/why-did-singapore-fall"
TIME = "https://time.com/archive/6893075/war-front-rubber-and-tin"
NAEWNA = "https://www.naewna.com/likesara/577154"
SILPA = "https://www.silpa-mag.com/this-day-in-history/article_4665"

def dp(claim, url, name, cred, surprise, use):
    return {"claim": claim, "source_url": url, "source_name": name, "credibility": cred,
            "surprise_factor": surprise, "usable_as": use}

brief = {
    "version": "1.0",
    "topic": "Kota Bharu, 8 December 1941: the Pacific War began on a Malayan beach before Pearl Harbor — and it was a war for Sundaland's oil, rubber and tin",
    "research_date": "2026-11-17",
    "landscape": {
        "existing_content": [
            {"title": "When the US Hit Tokyo After Pearl Harbor", "url": "https://www.youtube.com/watch?v=2ZKANCH80-M",
             "source": "Yarnhub (YouTube)", "angle": "minute-by-minute WW2 reenactment, Unreal Engine",
             "what_it_covers": "Doolittle Raid; present-tense narration, named crews, dialogue lines, ticking fuel constraint",
             "what_it_misses": "economic motive; Southeast Asia almost never covered", "engagement_signal": "16.2M views in 19 days"},
            {"title": "Kota Bharu: How Imperial Japan Conquered British Malaya in the Most Unlikely Way",
             "url": "https://www.warhistoryonline.com/war-articles/kota-bharu-imperial-japan.html",
             "source": "War History Online", "angle": "military narrative", "what_it_covers": "landing, defence, bicycles",
             "what_it_misses": "why Japan needed Malaya/NEI resources; Thai side"},
            {"title": "First shots of the Pacific War were fired at Kota Bharu, not Pearl Harbour",
             "url": "https://kajomag.com/first-shots-of-the-pacific-war-were-fired-at-kota-bharu-not-pearl-harbour/",
             "source": "Kajo Magazine", "angle": "'first shots' trivia", "what_it_covers": "timing claim",
             "what_it_misses": "economic stakes, visual storytelling"},
        ],
        "saturated_angles": ["Pearl Harbor minute-by-minute", "Fall of Singapore as British humiliation", "WW2 dogfight reenactments"],
        "underserved_gaps": [
            "The economic WHY: the oil embargo clock and Sundaland's rubber/tin/oil as the prize",
            "Simultaneous Thai landings (Songkhla, Pattani, Chumphon) told to an international audience",
            "Map-led timeline showing Kota Bharu firing before Pearl Harbor across the date line",
        ],
    },
    "data_points": [
        dp("Japanese bombardment at Kota Bharu began about 00:30 local time on 8 Dec 1941 (17:00 GMT 7 Dec); Pearl Harbor attack began 01:48 Kelantan time (07:48 Hawaii, 7 Dec) — about 78 minutes later",
           WIKI_KB, "Wikipedia: Battle of Kota Bharu", "secondary_source", "counterintuitive", "cold open hook + HUD clock"),
        dp("Sources disagree on the margin (AWM cites the landing at 1:45 am, others 70–90 min); script must hedge: 'more than an hour before' or 'by some accounts'",
           AWM, "Australian War Memorial", "primary_source", "notable", "hedge wording"),
        dp("Lookouts saw three transports (Awazisan, Ayatosan, Sakura Maru) anchor ~3 km offshore just after midnight",
           WIKI_KB, "Wikipedia: Battle of Kota Bharu", "secondary_source", "notable", "doodle beat: defender lookout"),
        dp("About 5,200 men of the Takumi Detachment (Maj Gen Hiroshi Takumi) landed vs the 8th Indian Brigade (Brig B.W. Key); 3/17th Dogras held ~16 km of beach at Badang and Sabak",
           WIKI_KB, "Wikipedia: Battle of Kota Bharu", "secondary_source", "notable", "map beat + name cards"),
        dp("No. 1 Squadron RAAF flew Hudsons from Kota Bharu: 17 sorties, 2 lost; Flt Lt John Lockwood's attack left Awazisan Maru burning and abandoned",
           WIKI_KB, "Wikipedia: Battle of Kota Bharu", "secondary_source", "surprising", "first Allied ship sunk/abandoned in Pacific War angle (hedge)"),
        dp("Japanese pillboxes reaction quote: Col Masanobu Tsuji wrote the men on the beach 'could not raise their heads'",
           WIKI_KB, "Wikipedia (citing Tsuji)", "secondary_source", "notable", "sourced quote line"),
        dp("Casualties (infobox): Allied 68 killed, 360 wounded, 37 missing; Japanese ~320 killed, 538 wounded", WIKI_KB,
           "Wikipedia: Battle of Kota Bharu", "secondary_source", "expected", "epilogue numbers (hedge 'about')"),
        dp("Kota Bharu town fell on 9 December", WIKI_KB, "Wikipedia", "secondary_source", "expected", "timeline"),
        dp("Same night Japan landed at Songkhla (10 transports), Pattani, Nakhon Si Thammarat, Surat Thani, Chumphon and Prachuap Khiri Khan",
           WIKI_TH, "Wikipedia: Japanese invasion of Thailand", "secondary_source", "surprising", "map: 7 pins along the coast"),
        dp("At Chumphon, Yuwachon Thahan cadets of Sriyaphai school fought at Tha Nang Sang bridge with the 38th Infantry Battalion and police; Capt Thawin Niyomsen was killed; fighting stopped in the afternoon on ceasefire orders",
           WIKI_TH, "Wikipedia: Japanese invasion of Thailand", "secondary_source", "surprising", "doodle beat: Thai cadets"),
        dp("Chumphon still marks 8 December as Wiratai / Yuwachon Thahan Day at the Wiratai monument", NAEWNA,
           "Naewna", "secondary_source", "notable", "epilogue / legacy"),
        dp("Thai resistance lasted hours: ceasefire around midday in most places, Prachuap held until noon the next day; secret agreement 14 Dec, alliance 21 Dec 1941",
           WIKI_TH, "Wikipedia: Japanese invasion of Thailand", "secondary_source", "notable", "Thai thread payoff"),
        dp("Japan imported roughly 80% of its oil from the United States before the 1941 freeze (sources range 75–85%)",
           "https://staradvertiser.com/?p=623820", "Honolulu Star-Advertiser (and others)", "secondary_source", "surprising", "economy act: fuel gauge"),
        dp("US froze Japanese assets July 1941; by 1 Aug 1941 oil exports effectively stopped; the Dutch East Indies joined the embargo",
           "https://www.nationalww2museum.org/war/articles/soviet-union-china-pearl-harbor", "National WWII Museum", "secondary_source", "expected", "padlock beat"),
        dp("Japan's stockpile ~54 million barrels (29M reserved for the navy); estimates of how long it lasts range from about 1 to 2 years",
           CIMSEC, "CIMSEC", "secondary_source", "notable", "ticking clock (hedge range)"),
        dp("The Dutch East Indies was the world's 4th-largest oil exporter (after US, Iran, Romania)",
           "https://en.wikipedia.org/wiki/Dutch_East_Indies_campaign", "Wikipedia", "secondary_source", "surprising", "map: oil fields Borneo/Sumatra"),
        dp("British Malaya shipped 540,417 t of rubber in 1940 out of a world 1,392,604 t — about 39% (Dunlop Bulletin)", DUNLOP,
           "Dunlop Bulletin via Papers Past (1942)", "primary_source", "surprising", "HUD ring: 39%"),
        dp("Malaya was the world's largest tin exporter: 55,945 t in 1939 vs NEI 31,281 t; Britain+Netherlands ~half of world tin (single wartime source — use 'largest', not a % share)",
           TIME, "TIME (1941/42)", "secondary_source", "notable", "HUD bar"),
        dp("Japan's 25th Army advanced largely by bicycle; ~6,000 bicycles per division, ~18,000 total; rubber plantations hindered heavy tanks",
           NWC, "Naval War College paper (Headrick) via ICHC", "secondary_source", "counterintuitive", "doodle beat: bicycle blitz"),
        dp("Singapore surrendered 15 Feb 1942, about 70 days after Kota Bharu — Britain's largest military surrender", IWM,
           "Imperial War Museums", "primary_source", "notable", "finale / epilogue"),
    ],
    "audience_insights": {
        "common_questions": ["Did the Pacific War really start before Pearl Harbor?", "Why did Japan want Malaya and the Dutch East Indies?",
                             "What did Thailand do on 8 December 1941?", "How did Japan reach Singapore so fast?"],
        "misconceptions": [
            {"myth": "The Pacific War started at Pearl Harbor", "reality": "Shelling at Kota Bharu began more than an hour earlier (in absolute time)", "source": WIKI_KB},
            {"myth": "Japan attacked to conquer America", "reality": "The southern drive was for resources — oil, rubber, tin — after the embargo; Pearl Harbor was cover for it", "source": FRUS},
            {"myth": "Thailand simply let Japan in", "reality": "Thai troops, police and teenage cadets fought for hours before the ceasefire order", "source": WIKI_TH},
        ],
        "knowledge_level": "general WW2-curious audience; knows Pearl Harbor, little about Southeast Asia",
        "pain_points": ["Southeast Asian front is under-told", "military docs skip the economics"],
    },
    "angles_discovered": [
        {"name": "Before Pearl Harbor", "hook": "The Pacific War started on a Malayan beach — 78 minutes before Pearl Harbor.", "type": "contrarian",
         "why_now": "8 December anniversary in three weeks (85th in 2026)", "grounded_in": [WIKI_KB]},
        {"name": "A war for Sundaland's resources", "hook": "Pearl Harbor was the distraction. The real target was Sundaland's oil, rubber and tin.", "type": "data_driven",
         "why_now": "fits the channel lens (economy geography)", "grounded_in": [DUNLOP, CIMSEC]},
        {"name": "Seven beaches, one night", "hook": "The same night, Japan came ashore on seven Thai beaches — and teenagers fought back.", "type": "narrative",
         "why_now": "Thai side rarely told in English", "grounded_in": [WIKI_TH]},
    ],
    "visual_references": [
        {"description": "Yarnhub Doolittle Raid: name card with real photo + rank, present-tense narration", "url": "https://www.youtube.com/watch?v=2ZKANCH80-M",
         "what_works": "real person framing, dialogue every ~20 s, fuel clock"},
        {"description": "Wikimedia Commons: Yamashita portrait, Percival surrender photos, 8 Sqn RAAF Hudsons at Kota Bharu 1941, A6M2s at Kota Bharu airfield, Tha Nang Sang bridge diorama (National Memorial)",
         "url": "https://commons.wikimedia.org", "what_works": "archive name cards + establishing photos (licences to verify per file at assets)"},
    ],
    "sources": [
        {"url": WIKI_KB, "title": "Battle of Kota Bharu — Wikipedia", "used_for": "timeline, forces, casualties, RAAF", "reliability": "secondary"},
        {"url": AWM, "title": "AWM collection E84717", "used_for": "landing time (alt)", "reliability": "primary"},
        {"url": WIKI_TH, "title": "Japanese invasion of Thailand — Wikipedia", "used_for": "Thai landings, Chumphon, ceasefire", "reliability": "secondary"},
        {"url": NAEWNA, "title": "Naewna — Wiratai Day Chumphon", "used_for": "legacy", "reliability": "secondary"},
        {"url": SILPA, "title": "Silpa-Mag — 8 Dec 2484", "used_for": "Thai context", "reliability": "secondary"},
        {"url": DUNLOP, "title": "The Rubber Industry (Dunlop Bulletin, 1942)", "used_for": "rubber share 1940", "reliability": "primary"},
        {"url": TIME, "title": "TIME — War Front: Rubber and Tin", "used_for": "tin exports", "reliability": "secondary"},
        {"url": FRUS, "title": "FRUS 1941 vol IV", "used_for": "Japanese oil stock estimates", "reliability": "primary"},
        {"url": CIMSEC, "title": "CIMSEC — Pearl Harbor", "used_for": "stockpile barrels", "reliability": "secondary"},
        {"url": NWC, "title": "Bicycle Blitzkrieg (ICHC paper)", "used_for": "bicycles", "reliability": "secondary"},
        {"url": IWM, "title": "IWM — Why did Singapore fall", "used_for": "surrender", "reliability": "primary"},
    ],
    "research_summary": ("Kota Bharu shelling began ~00:30 local on 8 Dec 1941, about 78 min before Pearl Harbor (sources vary 40–90 min → hedge). "
                         "Same night Japan landed at seven Thai points; teenage Yuwachon cadets fought at Chumphon until a ceasefire. "
                         "Economic spine: ~80% of Japan's oil came from the US; the mid-1941 freeze left a 1–2 year stockpile; Malaya held ~39% of world rubber "
                         "and was the top tin exporter; the NEI was the 4th-largest oil exporter. 70 days later Singapore fell. "
                         "Unverified / dropped: exact tin %, Hudson 'first ship sunk' superlative (hedge or drop)."),
}
(P / "research_brief.json").write_text(json.dumps(brief, indent=2, ensure_ascii=False), encoding="utf-8")
write_checkpoint(P.parent.parent, P.parent.name, "research", "completed", {"research_brief": brief},
                 pipeline_type="animated-explainer")
print("ok", len(brief["data_points"]), "data points")
