# คู่มือ Skill · Agent · Command ใน OpenMontage

> เอกสารนี้อธิบายว่า repo นี้มี **slash command, skill และ agent** อะไรบ้าง แต่ละตัวมีไว้ทำไม และควรใช้เมื่อไหร่
> สำรวจจากสถานะ repo วันที่ 2026-11-12 (branch `custom`) — ถ้ามีการเพิ่ม/ลบไฟล์ ให้ยึดตัวไฟล์จริงเป็นหลัก

---

## 1. ภาพรวม: ของในโปรเจกต์นี้แบ่งเป็น 5 กลุ่ม

| กลุ่ม | อยู่ที่ไหน | ใครเป็นคนเรียก | หน้าที่ |
|---|---|---|---|
| **Slash command** | `.claude/commands/*.md` | **คุณ** พิมพ์ `/ชื่อ` | ทางลัดเข้า workflow ที่ใช้บ่อย |
| **Claude Code skill** | `.claude/skills/<ชื่อ>/SKILL.md` | Claude โหลดเองเมื่อคำขอตรงกับ description (หรือคุณพิมพ์ `/ชื่อ`) | ความรู้เฉพาะทางที่ Claude Code เห็นใน skill list |
| **Layer 2 skill (OpenMontage)** | `skills/{meta,core,creative,pipelines}/` | Agent อ่านเองตามกฎใน `AGENT_GUIDE.md` | "วิธีที่ OpenMontage อยากให้ทำ" — กระบวนการ, quality bar, ขั้นตอนแต่ละ stage |
| **Layer 3 skill (vendor/เทคโนโลยี)** | `.agents/skills/<ชื่อ>/` (92 ตัว) | Agent อ่านก่อนเรียก tool ที่ชี้มา (`agent_skills[]`) | ความรู้ API/prompt ของผู้ให้บริการแต่ละเจ้า |
| **Agent (บทบาท)** | `skills/pipelines/<pipeline>/*-director.md`, `executive-producer.md` | Agent หลักสวมบทบาทตาม stage | ผู้กำกับแต่ละขั้นของ pipeline |

ลำดับความสัมพันธ์ (จาก `AGENT_GUIDE.md` → Layer Map):

```
Layer 1  tools/  + tool_registry       "มี tool อะไร ใช้ได้ไหม ราคาเท่าไร"
   │       └─ agent_skills[] ชี้ไป ↓
Layer 2  skills/                        "OpenMontage ใช้ tool เหล่านี้ยังไงใน pipeline"
   │
Layer 3  .agents/skills/                "ตัวเทคโนโลยี/ผู้ให้บริการทำงานยังไง (prompt, parameter)"
```

> **ทำไมต้องแยกชั้น?** เพราะ OpenMontage ออกแบบให้ "ความฉลาดอยู่ใน skill ไม่ใช่ใน code" — Python มีแค่ tool กับการเก็บ state
> การตัดสินใจเชิงสร้างสรรค์ การรีวิว และ checkpoint ทั้งหมด agent ทำตามคำสั่งใน markdown
> (ดู Rule Zero ใน `AGENT_GUIDE.md`)

---

## 2. Slash command (`.claude/commands/`)

มี **4 ตัว** — พิมพ์ในช่องแชตได้เลย

| Command | ใช้ทำอะไร | ทำไมต้องมี | ใช้เมื่อไหร่ |
|---|---|---|---|
| `/reel <สิ่งที่อยากได้>` | ส่งคำขอเข้า **pipeline system เต็มรูปแบบ** ตาม `AGENT_GUIDE.md` (onboarding → เลือก pipeline → preflight → ทำทีละ stage) | กันไม่ให้ agent ด้นสดเขียนสคริปต์เรียก API เอง — บังคับให้ผ่าน director skill, checkpoint และ approval gate | **ค่าเริ่มต้นสำหรับงานวิดีโอทั่วไป** ที่ยังไม่มี skill เฉพาะ เช่น `/reel ทำ explainer 60 วิเรื่องหลุมดำ` |
| `/backlot [project-id]` | เปิด **Backlot board** (สตอรีบอร์ดบนเบราว์เซอร์) — `python -m backlot open` | ดูความคืบหน้า stage, script, scene plan, asset แบบ live โดยไม่ต้องไล่อ่านไฟล์ | อยากดูงานที่กำลังทำ/ทำเสร็จแล้ว; ไม่ใส่ id = หน้า library ทุกโปรเจกต์ (board เป็นแค่ผู้สังเกต พังก็ไม่กระทบงาน) |
| `/ink-art <สิ่งที่จะวาด>` | แอนิเมชันลายเส้นหมึกบนพื้นขาว **สร้างจากศูนย์** (vector) — ตัวละครวาดตัวเองแล้วเดิน/เต้น/โบกมือ หรือ explainer แบบกลไก | ใช้ engine Ink Theater + Ink Puppet (mocap จริง) ได้ผลสม่ำเสมอ ไม่ต้องปั้นท่าเอง | อยากได้ลุค doodle/whiteboard ที่ยังไม่มีภาพต้นฉบับ |
| `/animated-drawing <ไฟล์ภาพ> <ท่า>` | เอา **ภาพวาด/รูปที่มีอยู่แล้ว** มาขยับด้วย mocap (Meta AnimatedDrawings) → GIF/MP4 แบบ raster | ทำให้ภาพของผู้ใช้เองขยับได้จริง | มีภาพตัวละคร 1 ตัวบนพื้นสีอ่อนแล้ว อยากให้มัน dance/walk/jump/wave |

**จำง่าย ๆ:** มีภาพแล้ว → `/animated-drawing` · ยังไม่มีภาพ อยากได้ doodle → `/ink-art`

> ไฟล์ซ้ำใน `.cursor/commands/`, `.codex/prompts/`, `.github/prompts/` คือ command ชุดเดียวกันสำหรับ Cursor / Codex / Copilot
> (ยกเว้น `/reel` ที่มีเฉพาะ Claude) — ถ้าแก้ command ใน `.claude/` แล้วใช้หลายเครื่องมือ อย่าลืมแก้ที่อื่นด้วย

---

## 3. Claude Code skill (`.claude/skills/`)

มี **50 โฟลเดอร์** แบ่งได้ 3 แบบ:

### 3.1 Skill ที่ทำเองสำหรับช่อง (สำคัญที่สุดสำหรับคุณ)

| Skill | ทำอะไร | ทำไม | ใช้เมื่อไหร่ |
|---|---|---|---|
| **`sundaland-facts`** | ผลิตวิดีโอยาว 8–10 นาที 16:9 แบบ countdown *"N Facts About <ประเทศ> That Sound Fake"* ของช่อง The Sundaland | เก็บ format ของช่อง (`FORMAT.md`), prompt (`PROMPT.md`) และ code template (`template/`) ไว้ในตัว skill — ไม่ต้องพึ่งโปรเจกต์เก่า และล็อกกฎที่ตกลงไว้แล้ว (ตอบไทย, narration อังกฤษ, Google TTS เท่านั้น, ห้ามใช้ Veo/Imagen/Lyria, Remotion atelier, approval gate ทุกขั้น) | `/sundaland-facts Vietnam` หรือ `/sundaland-facts Malaysia 15` — ทุกครั้งที่จะทำคลิปใหม่ในฟอร์แมตนี้ **ใช้ตัวนี้แทน `/reel`** |

### 3.2 สำเนาของ Layer 3 skill (48 ตัว)

ส่วนใหญ่เป็น **สำเนาจาก `.agents/skills/`** วางไว้ให้ Claude Code มองเห็นใน skill list และโหลดอัตโนมัติเมื่อคำขอตรง description
(ความหมายและกรณีใช้งานดูหัวข้อ 5)

ข้อควรรู้:
- **6 ตัวไม่ตรงกับต้นฉบับ** ใน `.agents/skills/` แล้ว: `ai-video-gen`, `d3-viz`, `elevenlabs`, `remotion-best-practices`, `text-to-speech` (และ `video_toolkit` ที่ชื่อต่างจาก `video-toolkit`) — ถ้าเนื้อหาขัดกัน ให้ถือ `.agents/skills/` เป็นหลัก เพราะ tool registry ชี้ไปที่นั่น
- `.agents/skills/` มี 92 ตัว แต่ `.claude/skills/` มีแค่ส่วนหนึ่ง — ตัวที่ไม่ได้ copy มา (เช่น `seedance-2-0`, `hyperframes*`, `gsap-*`, `kling-official`, `lyria`) agent ยังอ่านได้ตามปกติผ่าน `agent_skills[]` เพียงแต่จะไม่โผล่ใน skill list ของ Claude Code
- `heygen` ถูกระบุว่า **deprecated** → ใช้ `create-video` (สั่งด้วย prompt) หรือ `avatar-video` (คุมละเอียด) แทน

### 3.3 Skill จาก plugin / Claude Code ในเครื่อง

skill อย่าง `anthropic-skills:*`, `product-management:*`, `pdf-viewer:*`, `code-review`, `simplify` ฯลฯ **ไม่ได้อยู่ใน repo** — มาจาก plugin/การตั้งค่าของ Claude Code ในเครื่องคุณ ไม่เกี่ยวกับ OpenMontage โดยตรง

---

## 4. Agent — ใน repo นี้หมายถึงอะไร

**ไม่มี Claude Code subagent ที่นิยามไว้ใน repo** (ไม่มีโฟลเดอร์ `.claude/agents/`)
คำว่า "agent" ใน OpenMontage หมายถึง **บทบาทที่ agent หลักสวมตาม stage ของ pipeline** โดยอ่านไฟล์ director:

| บทบาท | ไฟล์ | ทำไม | ใช้เมื่อไหร่ |
|---|---|---|---|
| **Executive Producer** | `skills/pipelines/<pipeline>/executive-producer.md` | คุมทั้ง pipeline แบบ serial: ส่งงานให้ director แต่ละ stage, ตรวจ, ส่งกลับแก้ — แก้ปัญหา "ถูกเทคนิคแต่คุณภาพต่ำ" ที่เกิดจากการรันแต่ละ stage แบบไม่มี feedback | ตลอดการผลิตของ pipeline ที่มีไฟล์นี้ |
| **Research Director** | `research-director.md` | ค้นข้อมูล/เทรนด์/ผู้ชมก่อนคิดคอนเซ็ปต์ | stage `research` (explainer, animation, cinematic, character-animation) |
| **Proposal / Idea Director** | `proposal-director.md` / `idea-director.md` | เสนอ 2–5 คอนเซ็ปต์, tool path, ค่าใช้จ่าย, เลือก runtime → ขออนุมัติ | stage `proposal` / `idea` |
| **Script Director** | `script-director.md` | โครงเรื่อง, timing, narration | stage `script` |
| **Scene Director** | `scene-director.md` | วางภาพทีละฉาก + asset ที่ต้องใช้ | stage `scene_plan` |
| **Asset Director** | `asset-director.md` | สร้าง/หา TTS, ภาพ, วิดีโอ, เพลง พร้อม provenance | stage `assets` |
| **Edit Director** | `edit-director.md` | ตัดต่อ, ซับ, ducking เสียง → `edit_decisions` | stage `edit` |
| **Compose Director** | `compose-director.md` | เรนเดอร์ (Remotion/HyperFrames/FFmpeg) + ตรวจผลลัพธ์ | stage `compose` |
| **Publish Director** | `publish-director.md` | metadata, chapter, SEO, thumbnail | stage `publish` |
| เฉพาะ character-animation | `character-design-director.md`, `rig-plan-director.md` | ออกแบบตัวละครและ rig | pipeline `character-animation` |

> **ทำไมเป็นไฟล์ markdown ไม่ใช่ subagent?** แต่ละ stage ส่งต่อกันด้วย artifact JSON (`brief → script → scene_plan → asset_manifest → edit_decisions → render_report`) ที่ validate ด้วย schema ใน `schemas/artifacts/` และมี checkpoint ใน `projects/<id>/` — state อยู่บนดิสก์ จึงไม่จำเป็นต้องแยก process

**สิ่งที่ชื่อคล้ายแต่ไม่ใช่:**
- skill `agents` = สร้าง **voice AI agent ของ ElevenLabs** (แชตบอตเสียง) ไม่เกี่ยวกับการผลิตวิดีโอ
- subagent ในตัว Claude Code (`Explore`, `Plan`, `general-purpose`) ใช้ได้ทุก repo แต่ไม่ได้นิยามในนี้ — เหมาะกับงานค้นโค้ดกว้าง ๆ ไม่ใช่งานผลิตวิดีโอ

---

## 5. Pipeline (ตัวกำหนดว่า director ชุดไหนจะทำงาน)

อยู่ที่ `pipeline_defs/*.yaml` — `/reel` จะเลือกให้ หรือบอกชื่อเองก็ได้

| Pipeline | เหมาะกับ | สถานะ |
|---|---|---|
| `animated-explainer` | หัวข้อ → explainer ที่สร้างภาพทั้งหมด (**ช่อง Sundaland ใช้ตัวนี้**) | production |
| `animation` | motion graphics / แอนิเมชันเป็นหลัก (รวม Ink Theater แบบภาพประกอบ) | production |
| `cinematic` | trailer, teaser, งานเน้นอารมณ์ | production |
| `screen-demo` | screen recording, walkthrough, demo CLI | production |
| `hybrid` | ฟุตเทจจริง + ภาพเสริม | production |
| `avatar-spokesperson` | พรีเซนเตอร์ avatar / lip-sync | production |
| `talking-head` | ฟุตเทจคนพูด | beta |
| `clip-factory` | ตัดคลิปสั้นจำนวนมากจากวิดีโอยาว | beta |
| `podcast-repurpose` | ไฮไลต์พอดแคสต์ | beta |
| `documentary-montage` | มอนทาจจากฟุตเทจ stock/archive ฟรี | beta |
| `character-animation` | ตัวละครการ์ตูน rig ในเครื่อง (รวม Ink Puppet mocap) | beta |
| `localization-dub` | ซับ / พากย์ / แปลภาษา | beta |
| `framework-smoke` | ทดสอบระบบ | test |

---

## 6. Layer 2 skill (`skills/`) — agent อ่านเอง คุณไม่ต้องเรียก

### 6.1 Meta skill (`skills/meta/`) — กฎกระบวนการ

| ไฟล์ | ทำไม | agent อ่านเมื่อไหร่ |
|---|---|---|
| `onboarding.md` | พาผู้ใช้จาก "อยากลอง" → "เริ่มทำ" ใน 60 วิ | คำขอกว้าง ๆ เช่น "ทำอะไรได้บ้าง" |
| `video-reference-analyst.md` | วิเคราะห์วิดีโอต้นแบบอย่างมีหลักฐาน แทนการเดา | ผู้ใช้ส่งลิงก์/ไฟล์วิดีโอเป็น **แรงบันดาลใจ** ("ทำแบบนี้ให้หน่อย") |
| `creative-intake.md` | ถามบรีฟให้ชัดก่อนเริ่ม | บรีฟยังคลุมเครือ ก่อน stage research |
| `taste-direction.md` | กำหนด taste profile (mood, ความหนาแน่น, motion) ให้ส่งต่อทุก stage | งาน brand / hero / atelier ก่อนเลือก playbook |
| `bespoke-composition.md` | ขั้นตอนเขียน composition เองทั้งหมด (atelier) ไม่ใช้ scene สำเร็จรูป | เลือก `composition_mode: atelier` |
| `animation-runtime-selector.md` | เลือก Remotion / HyperFrames / FFmpeg และไลบรารีแอนิเมชัน | ตอนวางแผน runtime |
| `voice-performance-director.md` | ทำให้ TTS ฟังเหมือนมีคนกำกับ ไม่ใช่แค่อ่าน | ทุก pipeline ที่มี narration TTS |
| `reviewer.md` | self-review หลังทุก stage (critical / suggestion / nitpick, สูงสุด 2 รอบ) | จบงานแต่ละ stage ก่อน checkpoint |
| `checkpoint-protocol.md` | บันทึก checkpoint และหยุดรออนุมัติตาม manifest | หลังรีวิวผ่าน |
| `capability-extension.md` | ขยายระบบเมื่อไม่มี tool รองรับ แบบมีกรอบ | เจองานที่ไม่มี tool ไหนทำได้ |
| `skill-creator.md` | สร้าง skill ใหม่ระหว่างรัน | เจอช่องว่างที่ **ใช้ซ้ำได้** (ไม่ใช่งานครั้งเดียว) |

### 6.2 Core skill (`skills/core/`) — engine หลัก

`ffmpeg.md` (encode/ตัด/ต่อ), `remotion.md` (composition แบบ React), `hyperframes.md` (HTML/CSS/GSAP + ตารางเทียบกับ Remotion), `whisperx.md` (ถอดเสียงพร้อม timestamp ระดับคำ), `subtitle-sync.md` (จังหวะซับ), `color-grading.md` (LUT/โปรไฟล์สี)

### 6.3 Creative skill (`skills/creative/`) — ฝีมือเฉพาะด้าน

| กลุ่ม | ไฟล์ |
|---|---|
| เล่าเรื่อง / ฟอร์แมต | `storytelling`, `short-form` (9:16 < 60 วิ), `long-form` (YouTube 10+ นาที — **เกี่ยวกับช่องคุณ**), `cinematic`, `screen-recording`, `animation-pipeline` |
| ตัดต่อ | `video-editing`, `video-stitching`, `enhancement-strategy`, `broll-planning`, `typography`, `sound-design` |
| สร้างภาพ/วิดีโอ | `image-gen-usage`, `image-provider-usage`, `video-gen-prompting` + `prompting/` (seedance, veo, sora, ltx, grok, hunyuan), `commercial-product-video` |
| หาสื่อ | `stock-sourcing-usage` (Pexels/Pixabay + license), `scene-detect-usage`, `video-understand-usage` |
| เสียง | `music-gen-usage`, `sound-design` |
| ข้อมูล/ไดอะแกรม | `data-visualization`, `diagram-gen-usage`, `manim-usage` |
| ปรับคุณภาพ | `upscale-usage`, `bg-remove-usage`, `face-restore-usage` (เกรดสีอยู่ใน core: `color-grading`) |
| ตัวละคร/ลายเส้น | `ink-theater`, `animated-drawing`, `talking-head-gen-usage`, `lip-sync-usage` |
| 3D | `3d-world-generation` |

รายการเต็มพร้อม Layer 3 ที่ผูกไว้: `skills/INDEX.md`

---

## 7. Layer 3 skill (`.agents/skills/`) — คู่มือผู้ให้บริการ

**ทำไม:** แต่ละ tool ที่สร้างสื่อ (วิดีโอ/ภาพ/TTS/เพลง) มีช่อง `agent_skills[]` ชี้มาที่นี่ — agent **ต้องอ่านก่อนเรียก tool** เพราะมีโครง prompt และ parameter ที่โมเดลนั้นตอบสนองดีที่สุด
**เมื่อไหร่:** อัตโนมัติก่อนเรียก tool; คุณเรียกเองได้ถ้าอยากถามความรู้เฉพาะเรื่อง เช่น "Remotion ทำ transition แบบนี้ยังไง"

| หมวด | Skill | ใช้เมื่อ |
|---|---|---|
| **Composition runtime** | `remotion`, `remotion-best-practices`, `synthetic-screen-recording`, `hyperframes` (router) → `hyperframes-core/-cli/-creative/-media/-animation/-registry`, `remotion-to-hyperframes`, `website-to-video`, `music-to-video`, `motion-graphics`, `media-use` | ประกอบวิดีโอสุดท้าย; demo terminal ปลอม (TerminalScene); แปลงเว็บเป็นวิดีโอ; วิดีโอตามจังหวะเพลง |
| **แอนิเมชันทั่วไป** | `gsap`, `gsap-core/-timeline/-plugins/-utils/-react/-frameworks/-performance/-scrolltrigger`, `framer-motion`, `lottie-bodymovin` | เขียน motion เอง (หลัก Disney 12 ข้อ, SplitText, MorphSVG ฯลฯ) |
| **ตัวละคร** | `character-rigging`, `svg-character-animation`, `pose-library-design`, `canvas-procedural-animation`, `character-animation-qa` | pipeline `character-animation` |
| **สร้างภาพ** | `bfl-api`, `flux-best-practices`, `grok-media`, `dashscope`, `comfyui`, `atlas-cloud` | เรียก FLUX / Grok / Qwen / ComfyUI / Atlas |
| **สร้างวิดีโอ** | `seedance-2-0`, `seedance-2-5` (premium default), `gemini-omni`, `kling-official`, `minimax-h3`, `pika-h3-flex`, `ai-video-gen` (รวม VEO/Kling/Sora/Runway), `ltx2` (โลคัล) | เรียก provider วิดีโอ AI |
| **อัปเดต provider** | `provider-model-refresh`, `provider-refresh-oct23` | ตรวจ contract โมเดลรุ่นใหม่ (ก.ย./ต.ค. 2026) |
| **เสียงพูด (TTS)** | `azure-text-to-speech`, `text-to-speech` (HeyGen), `elevenlabs`, `fish-audio-tts`, `doubao-tts`, `setup-api-key` | สร้าง narration (ช่องคุณใช้ Google Chirp3-HD ผ่าน tool `google_tts`) |
| **เพลง / SFX** | `music` (ElevenLabs), `sound-effects`, `acestep` (โลคัล), `lyria` (Google — **ช่องคุณห้ามใช้ เพราะคิดเงินบัญชี Google**) | เพลงประกอบ / เสียงเอฟเฟกต์ |
| **ถอดเสียง (STT)** | `speech-to-text`, `azure-speech-to-text` | ทำซับ, ตัดตาม transcript |
| **Avatar / lip-sync** | `avatar-video`, `create-video`, `heygen` (deprecated), `faceswap`, `video-translate`, `agents` (voice bot) | วิดีโอพรีเซนเตอร์, พากย์แปล |
| **Capture** | `playwright-recording`, `ffmpeg` | อัดหน้าจอเบราว์เซอร์จริง, แปลงไฟล์ |
| **Visualization** | `beautiful-mermaid`, `d3-viz`, `manim-composer`, `manimce-best-practices`, `manimgl-best-practices` | กราฟ, ไดอะแกรม, แอนิเมชันคณิตศาสตร์ |
| **3D** | `threejs-*` (10 ตัว), `threejs-world-generation`, `3d-asset-generation` | โลก 3D, fly-through, โมเดล GLB |
| **แก้ไขสื่อ** | `video-edit`, `video-download`, `video-understand`, `video-toolkit`, `visual-style` | ตัด/ต่อ/บีบอัด, โหลดจาก YouTube, ดูเนื้อหาวิดีโอ, design system |
| **เว็บ/UI** (ไม่ค่อยเกี่ยวกับวิดีโอ) | `tailwind-design-system`, `vercel-react-best-practices`, `vercel-composition-patterns`, `web-design-guidelines` | เขียน React component ใน Remotion ให้สะอาด |

---

## 8. สรุป: พิมพ์อะไรเมื่อไหร่

```
อยากทำคลิปช่อง The Sundaland ฟอร์แมต facts countdown?
  └─ /sundaland-facts <ประเทศ> [จำนวน]

อยากทำวิดีโออื่น ๆ (explainer, trailer, short, demo ...)?
  └─ /reel <คำอธิบาย>          ← agent จะเลือก pipeline + director ให้เอง

มีวิดีโอต้นแบบ อยากได้ "แบบนี้"?
  └─ /reel ทำแบบนี้ <ลิงก์>      ← จะเข้า video-reference-analyst ก่อน

อยากได้แอนิเมชันลายเส้น doodle?
  ├─ ยังไม่มีภาพ → /ink-art <ไอเดีย>
  └─ มีภาพตัวละครแล้ว → /animated-drawing <ไฟล์> <dance|walk|jump|wave>

อยากดูความคืบหน้า/งานเก่า?
  └─ /backlot [project-id]

ถามความรู้เฉพาะ (Remotion, FFmpeg, GSAP, prompt ของ Seedance ...)?
  └─ ถามตรง ๆ ได้เลย — Claude จะโหลด skill ที่ตรงเอง
```

### ข้อห้ามที่ควรรู้ (จาก `AGENT_GUIDE.md`)
- ห้ามข้าม pipeline ไปเขียนสคริปต์เรียก API ตรง ๆ (Rule Zero)
- ห้ามเรียก tool สร้างสื่อโดยไม่อ่าน Layer 3 skill ก่อน
- ต้องประกาศ tool / provider / โมเดล / เหตุผล **ก่อน** การเรียกที่เสียเงิน และห้ามเปลี่ยน provider เองโดยไม่ถาม
- ถ้ามีทั้ง Remotion และ HyperFrames ต้องเสนอทั้งสองตัวก่อนล็อก `render_runtime`
- stage ที่ manifest กำหนด `human_approval_default: true` ต้องหยุดรออนุมัติทุกครั้ง

---

## 9. ถ้าจะเพิ่มของใหม่

| อยากเพิ่ม | ทำที่ | หมายเหตุ |
|---|---|---|
| ทางลัดที่ใช้บ่อย | `.claude/commands/<ชื่อ>.md` (frontmatter `description`, `argument-hint`, ใช้ `$ARGUMENTS`) | ถ้าใช้ Cursor/Codex/Copilot ด้วย ให้ copy ไป `.cursor/commands/`, `.codex/prompts/`, `.github/prompts/` |
| ฟอร์แมตช่องใหม่ (แบบ sundaland-facts) | `.claude/skills/<ชื่อ>/SKILL.md` + ไฟล์ประกอบ | เก็บ format และ template ไว้ใน skill เอง ไม่อ้างอิงโปรเจกต์เก่าใน `projects/` |
| ความรู้ provider ใหม่ | `.agents/skills/<ชื่อ>/SKILL.md` แล้วผูกใน `agent_skills[]` ของ tool | ถ้าอยากให้ Claude Code เห็นใน list ค่อย copy ไป `.claude/skills/` |
| กระบวนการ/director ใหม่ | `skills/meta/` หรือ `skills/pipelines/<pipeline>/` + manifest ใน `pipeline_defs/` | ดู `skills/meta/skill-creator.md` |
