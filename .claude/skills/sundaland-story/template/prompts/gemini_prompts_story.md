# Gemini prompts — แม่แบบสำหรับ /sundaland-story

agent ใช้ไฟล์นี้เขียน `projects/<slug>/source/GEMINI_PROMPTS_TH.md` ของแต่ละตอน:
เติมสีเสื้อ หมวก ท่า อุปกรณ์ และฉากหลังให้ตรงกับ doodle beat sheet แล้วส่งให้ผู้ใช้
ตัวอย่างที่ใช้จริงของตอนแรกอยู่ที่ `examples/kota-bharu-1941/GEMINI_PROMPTS_TH.md`

## วิธีใช้ (ทุกภาพ) — ส่วนนี้คัดลอกไปให้ผู้ใช้ตามนี้
1. เปิด **Gemini app** แล้วแนบไฟล์ `style-reference-sheet.jpg` ทุกครั้ง
2. คัดลอก prompt ภาษาอังกฤษทั้งก้อนไปวาง แล้วกดส่ง
3. เช็กตาม checklist ท้ายไฟล์ ถ้าข้อไหนไม่ผ่านให้กด regenerate
4. ดาวน์โหลดภาพที่**ความละเอียดสูงสุด** แล้วเซฟลง `projects/<slug>/source/` ตามชื่อไฟล์ที่กำหนด

ลำดับท่าในภาพสำคัญ เพราะ agent ตัดภาพตามลำดับจากซ้ายไปขวา ถ้า Gemini วาดสลับลำดับ ไม่ต้องวาดใหม่ แค่บอก agent ว่าลำดับจริงเป็นยังไง

**พิธีกร (เสื้อส้ม) มีครบ 6 ท่าแล้วใน `template/cast/host/`** ได้แก่ point, think, shock, clipboard, shrug, sad
ให้วาดเพิ่มเฉพาะเมื่อตอนนั้นต้องใช้ท่าใหม่

---

## A · ตัวละครหนึ่งฝ่าย (6 ท่าต่อภาพ) → `poses-<side>.png`

```
Same character and exact drawing style as the attached image: a hand-drawn doodle stick figure.
Big round white head with a thick, slightly uneven black marker outline, simple face.
Body is a small rounded-rectangle tunic coloured with loose <COLOUR> crayon scribbles
(instead of orange). <HEADGEAR, e.g. "He wears a simple soft olive-green military field cap.">
Thin black stick arms and legs, round white mitten hands, small white oval feet.
Pure white background, no shadows, no scenery, no frame, no text. <EXPRESSION, e.g. "Serious expressions, not smiling.">
Draw 6 poses in ONE horizontal row, evenly spaced, wide white gaps between figures (nothing
touching), every figure full body, same height, feet on the same baseline.
Poses, left to right:
1. <pose — say the facing direction: "running to the RIGHT", "looking through binoculars to the LEFT">
2. …
6. …
Wide image, high resolution.
```

**กฎการออกแบบท่า**
- แยกฝ่ายด้วย**สีเสื้อและหมวกเท่านั้น** ห้ามวาดหน้าตาแบบเหมารวมเชื้อชาติ
- ระบุทิศทุกท่าที่เคลื่อนที่หรือหันมอง ฝ่ายที่บุกมักหันขวา ฝ่ายตั้งรับหันซ้าย ให้ตรงกับแผนที่
- ถ้าท่าไหนต้องมีอุปกรณ์ เช่น วิทยุ จักรยาน หรือกระสอบทราย ให้เขียนว่า "(the X touches the figure)" เพื่อให้ตัดออกมาเป็นชิ้นเดียวกัน
- ต้องมีท่าพูดใส่วิทยุหรือโทรศัพท์สนาม 1 ท่า ไว้ใช้กับบทพูดของตัวละคร

## B · อุปกรณ์ (5–7 ชิ้นต่อภาพ) → `props-<group>.png`

```
Same hand-drawn doodle style as the attached image (thick black marker lines, loose crayon
scribble colouring, pure white background). Draw these objects in ONE row, evenly spaced with
wide white gaps, no text, no letters, no numbers:
1. <object, side view, which way it faces: "a small propeller warplane seen from the side, nose pointing RIGHT, no markings">
2. …
Wide image, high resolution.
```
ชุดที่มักต้องใช้:
- **เศรษฐกิจ:** ถังน้ำมัน, เกจน้ำมันใกล้หมด, ต้นยางกับถ้วยรับน้ำยาง, แท่งดีบุก, แท่นขุดเจาะ, แม่กุญแจกับโซ่, ลูกโลก
- **ฉาก:** เรือยกพล, เรือขนส่ง, ต้นมะพร้าว, คลื่น, เครื่องบินใบพัด, วิทยุ, จักรยาน
- **ผลลัพธ์:** เรือไฟไหม้ (ใช้เรือลำเดิม), กลุ่มควัน, เปลวไฟ

## C · ฉากหลังสีเทียน (โหมด B) — ภาพละ 1 ฉาก, **แนวนอน 16:9** → `bg-<name>.png`

ใช้หัว prompt นี้ทุกภาพ แล้วต่อด้วยรายละเอียดฉาก 1 บรรทัด
```
Same hand-drawn doodle style as the attached image: thick black marker lines, loose crayon
scribble colouring that slightly spills past the lines. A BACKGROUND SCENE ONLY — no people,
no characters, no animals, no text, no letters. Wide 16:9 landscape, high resolution.
Keep the colours soft and light so cartoon characters placed on top stay readable.
Leave the bottom third mostly open and flat (empty ground or sand) where characters will stand.
<SCENE, e.g. "A tropical beach at night: dark blue crayon sky with a few stars and a pale moon, calm sea with a low horizon line, two leaning coconut palm trees at the left edge, flat pale sand across the bottom third.">
```
ฉากที่ใช้แล้วในตอนแรก: ชายหาดกลางคืน, ทะเลกลางคืน, สะพานเหล็กข้ามแม่น้ำในเมือง, สวนยาง, ถนนในสวนยาง

---

## Checklist (ไม่ผ่านข้อไหนให้ regenerate)
- [ ] ความหนาเส้น ขนาดหัว และสไตล์เหมือนภาพ reference
- [ ] ทุกตัวมีช่องว่างสีขาวคั่น ไม่แตะกัน
- [ ] พื้นหลังขาวล้วน ไม่มีลายกระดาษ ไม่มีเงา (ยกเว้นภาพฉากหลัง)
- [ ] ไม่มีตัวหนังสือหรือลายน้ำแปลกๆ
- [ ] ด้านที่ยาวที่สุดของภาพ ≥ 2000 px
- [ ] สีเสื้อแต่ละฝ่ายต่างกันชัดเจน
- [ ] ทิศที่ตัวละครหรือยานหันตรงกับที่ prompt ระบุ
- [ ] ไม่มีการวาดหน้าตาแบบเหมารวมเชื้อชาติ
