"""Generate ONE HyperFrames composition holding all 21 doodle inserts back-to-back (sprite path), plus inserts.json
(start/duration of each insert) so the render can be split into D01.mp4 … D21.mp4. Sprites come from ../poses/*."""
import json, re, shutil
from pathlib import Path

HERE = Path(__file__).resolve().parent
PROJ = HERE.parent; REPO = PROJ.parents[1]
A = HERE / "assets"; (A / "poses").mkdir(parents=True, exist_ok=True)
shutil.copy(REPO / "ink-theater" / "ink-theater.js", HERE / "ink-theater.js")
for f in ("patrickhand.ttf", "OFL.txt"):
    shutil.copy(REPO / "ink-theater" / f if (REPO / "ink-theater" / f).exists() else REPO / "ink-theater" / "assets" / f, A / f)

SIZE = {}
for pj in (PROJ / "poses").glob("*/poses.json"):
    for p in json.loads(pj.read_text(encoding="utf-8")):
        src = pj.parent / f"{p['name']}.png"
        if src.exists():
            shutil.copy(src, A / "poses" / src.name)
            from PIL import Image
            SIZE[p["name"]] = list(Image.open(src).size)

plan = json.loads((PROJ / "artifacts" / "scene_plan.json").read_text(encoding="utf-8"))
script = {s["id"]: s for s in json.loads((PROJ / "artifacts" / "script.json").read_text(encoding="utf-8"))["sections"]}
dur = {}
for sc in plan["scenes"]:
    for a in sc["required_assets"]:
        m = re.search(r"insert (D\d\d)", a["description"])
        if m: dur[m.group(1)] = round(sc["end_seconds"] - sc["start_seconds"] + 1.0, 2)
line = lambda sid: script[sid]["text"]

# Each insert: JS body using helpers; `t` = insert start time inside the long composition.
B = {
 "D01": """var L=actor('df_lookout',1450,0.30); popIn(L,t+0.1); breathe(L,t+0.6,t+D);
  [560,820,1080].forEach(function(x,i){var S=actor('transport_ship',x,0.10,640); tl.set(S.pose,{scale:1,opacity:1},t+0.8+i*0.5);
   tl.fromTo(S.el,{x:-700},{x:0,duration:1.8,ease:'power2.out',immediateRender:false},t+0.8+i*0.5);
   tl.fromTo(S.idle,{rotation:-1.5},{rotation:1.5,duration:0.9,ease:'sine.inOut',yoyo:true,repeat:5,immediateRender:false},t+0.8);});""",
 "D02": """var P=actor('df_phone',1350,0.32); popIn(P,t+0.1); breathe(P,t+0.6,t+D); bubble(LINE,380,180,t+0.35,820);""",
 "D03": """var H=actor('host_clipboard',380,0.30); popIn(H,t+0.1); breathe(H,t+0.6,t+D);
  label('USA',1760,300,t+0.3); label('JAPAN',800,300,t+0.3);
  [860,1080,1300,1520].forEach(function(x,i){var O=actor('oil_barrel',x,0.30); tl.set(O.pose,{scale:1,opacity:1},t+0.6+i*0.35);
   tl.fromTo(O.el,{x:1300-x+500},{x:0,duration:0.9,ease:'power2.out',immediateRender:false},t+0.6+i*0.35);
   tl.fromTo(O.idle,{y:0},{y:-18,duration:0.12,ease:'power1.out',yoyo:true,repeat:5,immediateRender:false},t+0.6+i*0.35);});""",
 "D04": """var O=actor('oil_barrel',1200,0.62); popIn(O,t+0.1);
  var K=actor('padlock',1200,0.30,700); tl.set(K.pose,{scale:1,opacity:1},t+0.7);
  tl.fromTo(K.el,{y:-900},{y:0,duration:0.55,ease:'bounce.out',immediateRender:false},t+0.7); shake(t+1.15);
  var S=actor('host_shock',470,0.30); popIn(S,t+1.2); jitter(S,t+1.3);""",
 "D05": """var S=actor('host_sad',960,0.32); popIn(S,t+0.1); breathe(S,t+0.6,t+D);""",
 "D06": """var H=actor('host_point',300,0.30); popIn(H,t+0.1); breathe(H,t+0.6,t+D);
  [['rubber_tap',820,0.70,'RUBBER'],['tin_ingots',1220,0.50,'TIN'],['oil_derrick',1620,0.42,'OIL']].forEach(function(o,i){
   var X=actor(o[0],o[1],o[2]); popIn(X,t+0.6+i*0.5); label(o[3],o[1],150,t+0.75+i*0.5);});""",
 "D07": """var Q=actor('host_think',960,0.30), R=actor('host_point',960,0.30); popIn(Q,t+0.1); breathe(Q,t+0.6,t+D*0.5); swap(Q,R,t+D*0.5); breathe(R,t+D*0.5+0.4,t+D);""",
 "D08": """var Q=actor('host_point',960,0.30), R=actor('host_clipboard',960,0.30); popIn(Q,t+0.1); swap(Q,R,t+D*0.5); breathe(R,t+D*0.5+0.4,t+D);""",
 "D09": """var R=actor('df_run',960,0.32); tl.set(R.pose,{scale:1,opacity:1},t); tl.set(R.shadow,{opacity:1},t);
  tl.fromTo(R.el,{x:-1250},{x:1250,duration:D,ease:'none',immediateRender:false},t); hops(R,t,D,0.14,-28);""",
 "D10": """var J=actor('jp_wade',700,0.32); tl.set(J.pose,{scale:1,opacity:1},t);
  tl.fromTo(J.el,{x:-500},{x:600,duration:D,ease:'none',immediateRender:false},t);
  tl.fromTo(J.idle,{y:0,rotation:-2},{y:-10,rotation:2,duration:0.45,ease:'sine.inOut',yoyo:true,repeat:Math.floor(D/0.45),immediateRender:false},t);""",
 "D11": """var R=actor('jp_radio',1350,0.32); popIn(R,t+0.1); breathe(R,t+0.6,t+D); bubble(LINE,360,180,t+0.35,820);""",
 "D12": """var S=actor('df_shout',1350,0.32), P=actor('df_phone',1350,0.32); popIn(S,t+0.1); swap(S,P,t+1.4); breathe(P,t+1.8,t+D); bubble(LINE,360,180,t+0.35,820);""",
 "D13": """var S=actor('transport_ship',1250,0.40,880); popIn(S,t+0.05);
  tl.fromTo(S.idle,{rotation:-1.5},{rotation:1.5,duration:0.8,ease:'sine.inOut',yoyo:true,repeat:Math.ceil(D/0.8),immediateRender:false},t);
  var P=actor('warplane',300,0.35,320); P.idle.querySelector('img').style.transform='scaleX(-1)'; tl.set(P.pose,{scale:1,opacity:1},t+0.4);
  tl.fromTo(P.el,{x:-560,y:-160},{x:760,y:230,duration:1.25,ease:'power1.in',immediateRender:false},t+0.4);
  tl.fromTo(P.idle,{rotation:6},{rotation:22,duration:1.25,ease:'power1.in',immediateRender:false},t+0.4);
  var BM=document.createElement('div'); BM.style.cssText='position:absolute;left:1180px;top:520px;width:46px;height:18px;border-radius:9px;background:#2b2b2b;border:3px solid #111;opacity:0'; world.appendChild(BM);
  tl.set(BM,{opacity:1,rotation:40},t+1.55); tl.fromTo(BM,{x:-60,y:-40},{x:40,y:150,duration:0.35,ease:'power1.in',immediateRender:false},t+1.55); tl.set(BM,{opacity:0},t+1.9);
  tl.to(P.el,{x:1750,y:-420,duration:0.9,ease:'power1.out'},t+1.65); tl.to(P.idle,{rotation:-30,duration:0.45,ease:'sine.out'},t+1.65);
  shake(t+1.9);""",
 "D14": """var S=actor('ship_burning',1150,0.42,900); popIn(S,t+0.05);
  tl.fromTo(S.idle,{rotation:-1.2},{rotation:1.2,duration:0.8,ease:'sine.inOut',yoyo:true,repeat:Math.ceil(D/0.8),immediateRender:false},t);
  var F=actor('flames',1000,0.18,520); popIn(F,t+0.3); tl.fromTo(F.idle,{scaleY:0.9},{scaleY:1.12,duration:0.18,ease:'sine.inOut',yoyo:true,repeat:Math.ceil(D/0.18),immediateRender:false},t+0.3);
  var K=actor('smoke_puff',1150,0.20,420); tl.set(K.pose,{scale:1,opacity:0.9},t+0.4); tl.fromTo(K.el,{y:0,x:0},{y:-260,x:-120,duration:D,ease:'none',immediateRender:false},t+0.4);
  bubble(LINE,120,120,t+0.3,700);""",
 "D15": """var R=actor('th_radio',960,0.40); popIn(R,t+0.1);
  tl.fromTo(R.idle,{rotation:0},{rotation:-3,duration:0.9,ease:'sine.inOut',yoyo:true,repeat:Math.floor(D/0.9),immediateRender:false},t+0.5);""",
 "D16": """var R=actor('th_run',760,0.34), S=actor('th_sandbags',960,0.36); tl.set(R.pose,{scale:1,opacity:1},t); tl.set(R.shadow,{opacity:1},t);
  tl.fromTo(R.el,{x:-1100},{x:200,duration:D*0.5,ease:'power1.out',immediateRender:false},t); hops(R,t,D*0.5,0.14,-24);
  tl.set(R.pose,{opacity:0},t+D*0.5); popIn(S,t+D*0.5); breathe(S,t+D*0.5+0.4,t+D);""",
 "D17": """var S=actor('th_sandbags',1300,0.36); popIn(S,t+0.05); jitter(S,t+0.6); bubble(LINE,300,190,t+0.3,800);""",
 "D18": """var S=actor('th_worried',1350,0.32); popIn(S,t+0.1); breathe(S,t+0.6,t+D); bubble(LINE,360,200,t+0.5,760);""",
 "D19": """var st=[0,0.7,1.4,2.1,2.8,3.5,4.2]; st.forEach(function(s0){var C=actor('jp_bicycle',960,0.24); tl.set(C.pose,{scale:1,opacity:1},t+s0); tl.set(C.shadow,{opacity:1},t+s0);
   tl.fromTo(C.el,{x:-1300},{x:1400,duration:5.5,ease:'none',immediateRender:false},t+s0); hops(C,t+s0,5.5,0.2,-10);});""",
 "D20": """var C=actor('jp_bicycle',1300,0.32); popIn(C,t+0.05); hops(C,t+0.4,D-0.4,0.16,-8); bubble(LINE,300,170,t+0.3,780);""",
 "D21": """var O=actor('oil_barrel',1250,0.62), K=actor('padlock',1250,0.30,700), H=actor('host_shrug',500,0.30);
  popIn(O,t+0.05); popIn(K,t+0.25); popIn(H,t+0.5); breathe(H,t+0.9,t+D);""",
}
BG = {'D01': 'night_beach', 'D02': 'night_beach', 'D11': 'night_beach', 'D12': 'night_beach', 'D13': 'night_sea', 'D14': 'night_sea', 'D15': 'bridge', 'D17': 'bridge', 'D18': 'bridge', 'D19': 'rubber_road', 'D20': 'rubber'}
LINES = {"D02": "v01", "D11": "v02", "D12": "v02b", "D14": "v03", "D17": "v04", "D18": "v04b", "D20": "v05"}

order = sorted(B)
ins, t = {}, 0.0
blocks = []
for d in order:
    D = dur.get(d, 3.5)
    ins[d] = {"start": round(t, 3), "duration": D}
    body = B[d].replace("LINE", json.dumps(line(LINES[d])) if d in LINES else "''")
    pre = f"bg('{BG[d]}', t); " if d in BG else ""
    blocks.append(f"  (function(){{ var t={t:.3f}, D={D}; {pre}{body} hideAll(t+D); }})();")
    t += D + 0.4   # 0.4 s white gap between inserts (cut points)
TOTAL = round(t, 2)

html = (HERE / "template.tmpl").read_text(encoding="utf-8").replace("__SIZE__", json.dumps(SIZE)).replace("__TOTAL__", str(TOTAL)).replace("__BLOCKS__", "\n".join(blocks))
(HERE / "index.html").write_text(html, encoding="utf-8")
(HERE / "inserts.json").write_text(json.dumps(ins, indent=1), encoding="utf-8")
print("inserts", len(ins), "total", TOTAL, "s; sprites", len(SIZE))
