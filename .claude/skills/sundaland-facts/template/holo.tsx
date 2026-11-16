import React from "react";
import { Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { H, DIGI, HUDT, glow } from "./hud";

// ── Holographic story animations: each data scene gets one object that ACTS OUT the point
//    (user direction 2026-11-12: "not just numbers — show what the point is about").
//    Drawn as glowing wireframes + translucent fills so they sit inside HUD panels. All sizes in a local viewBox.
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const eio = { ...cl, easing: Easing.inOut(Easing.cubic) };
const fillA = (c: string, a: number) => {
  const n = parseInt(c.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
const Box: React.FC<{ w: number; h: number; vb: [number, number]; children: React.ReactNode }> = ({ w, h, vb, children }) => (
  <svg width={w} height={h} viewBox={`0 0 ${vb[0]} ${vb[1]}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>{children}</svg>
);
const T = (x: number, y: number, t: string, size: number, col: string, anchor: "start" | "middle" | "end" = "middle", font = HUDT, weight = 600) =>
  <text x={x} y={y} textAnchor={anchor} fill={col} style={{ fontFamily: font, fontWeight: weight, fontSize: size }}>{t}</text>;

/** #15 Balance beam: DEBT pan drops first, then ASSETS lands heavier and tips the beam. */
export const HoloScale: React.FC<{ w: number; h: number; a1: number; a2: number }> = ({ w, h, a1, a2 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const d = spring({ frame: f - a1, fps, config: { damping: 12, stiffness: 100 } });
  const a = spring({ frame: f - a2, fps, config: { damping: 12, stiffness: 100 } });
  const tilt = (-11 * d + 21 * a) * Math.PI / 180;
  const cx = 300, cy = 150, arm = 210;
  const L = { x: cx - arm * Math.cos(tilt), y: cy - arm * Math.sin(tilt) }, R = { x: cx + arm * Math.cos(tilt), y: cy + arm * Math.sin(tilt) };
  const pan = (P: any, k: number, bh: number, col: string, lab: string) => (
    <g>
      <path d={`M${P.x - 70},${P.y + 120} L${P.x},${P.y} L${P.x + 70},${P.y + 120}`} fill="none" stroke={H.cyan} strokeOpacity={0.6} strokeWidth={1.5} />
      <path d={`M${P.x - 85},${P.y + 120} Q${P.x},${P.y + 155} ${P.x + 85},${P.y + 120} Z`} fill={fillA(H.cyan, 0.12)} stroke={H.cyan} strokeWidth={2} style={{ filter: glow(H.cyan, 6) }} />
      <g opacity={k} transform={`translate(0 ${(1 - k) * -160})`}>
        <rect x={P.x - 55} y={P.y + 118 - bh} width={110} height={bh} fill={fillA(col, 0.25)} stroke={col} strokeWidth={2} style={{ filter: glow(col, 8) }} />
        {Array.from({ length: Math.round(bh / 18) }).map((_, i) => <line key={i} x1={P.x - 55} x2={P.x + 55} y1={P.y + 118 - i * 18} y2={P.y + 118 - i * 18} stroke={col} strokeOpacity={0.5} />)}
        {T(P.x, P.y + 106 - bh, lab, 26, col, "middle", DIGI, 700)}
      </g>
    </g>
  );
  return (
    <Box w={w} h={h} vb={[600, 440]}>
      <path d={`M${cx - 50},420 L${cx},${cy} L${cx + 50},420 Z`} fill={fillA(H.blue, 0.15)} stroke={H.cyan} strokeWidth={2} />
      <ellipse cx={cx} cy={420} rx={110} ry={16} fill="none" stroke={H.cyan} strokeWidth={2} style={{ filter: glow(H.cyan, 8) }} />
      <line x1={L.x} y1={L.y} x2={R.x} y2={R.y} stroke={H.ice} strokeWidth={6} strokeLinecap="round" style={{ filter: glow(H.cyan, 8) }} />
      <circle cx={cx} cy={cy} r={10} fill={H.amber} />
      {pan(L, d, 70, H.red, "DEBT")}
      {pan(R, a, 110, H.cyan, "ASSETS")}
    </Box>
  );
};

/** #14 Oil drops feed a savings tank that drains through a DEFICIT tap; the drops thin out over time. */
export const HoloTank: React.FC<{ w: number; h: number; a1: number; a2: number; dur: number }> = ({ w, h, a1, a2, dur }) => {
  const f = useCurrentFrame();
  const level = interpolate(f, [a2, dur - 6], [0.86, 0.5], cl);
  const tx = 230, ty = 70, tw = 260, th = 300;
  const drops = Array.from({ length: 10 }).map((_, i) => {
    const st = a1 + i * 12, age = f - st, alive = i < 10 - Math.floor(interpolate(f, [a1, dur], [0, 9], cl));
    if (age < 0 || age > 22 || !alive) return null;
    return <path key={i} d={`M${tx + 60 + (i % 4) * 45},${ty - 70 + age * 5} c8,12 10,18 0,24 c-10,-6 -8,-12 0,-24 Z`} fill={fillA(H.amber, 0.6)} stroke={H.amber} strokeWidth={1.5} opacity={1 - age / 24} />;
  });
  const flow = f > a2 ? (f - a2) * 5 : 0;
  return (
    <Box w={w} h={h} vb={[700, 440]}>
      <g transform="translate(70 120)" style={{ filter: glow(H.amber, 6) }}>
        <path d="M0,200 L40,0 L80,200 M10,150 L70,150 M20,100 L60,100 M30,50 L50,50" fill="none" stroke={H.amber} strokeWidth={2.5} />
        <circle cx={40} cy={-8} r={8} fill={H.amber} opacity={0.5 + 0.5 * Math.sin(f * 0.3)} />
      </g>
      {T(110, 350, "OIL & GAS", 22, H.amber)}
      {drops}
      <rect x={tx} y={ty} width={tw} height={th} rx={10} fill={fillA(H.blue, 0.08)} stroke={H.cyan} strokeWidth={2} style={{ filter: glow(H.cyan, 6) }} />
      <rect x={tx + 6} y={ty + th * (1 - level)} width={tw - 12} height={th * level - 6} rx={6} fill={fillA(H.cyan, 0.35)} />
      {Array.from({ length: 6 }).map((_, i) => <line key={i} x1={tx + 6} x2={tx + tw - 6} y1={ty + th * (1 - level) + 10 + i * 40} y2={ty + th * (1 - level) + 10 + i * 40} stroke={H.ice} strokeOpacity={0.15} />)}
      {T(tx + tw / 2, ty + th * (1 - level) + 46, "SAVINGS", 30, H.ice, "middle", DIGI, 700)}
      <rect x={tx + tw} y={ty + th - 60} width={70} height={24} fill={fillA(H.red, 0.3)} stroke={H.red} strokeWidth={2} />
      {f > a2 && <path d={`M${tx + tw + 70},${ty + th - 48} q24,0 24,30 L${tx + tw + 94},${ty + th + 60}`} fill="none" stroke={H.cyan} strokeWidth={10} strokeDasharray="14 9" strokeDashoffset={-flow} style={{ filter: glow(H.cyan, 6) }} />}
      {f > a2 && T(tx + tw + 110, ty + th - 70, "DEFICIT", 26, H.red, "start", DIGI, 700)}
    </Box>
  );
};

/** #13 Banknotes flip one by one from riel to US dollar (3D card flip). */
export const HoloNotes: React.FC<{ w: number; h: number; a1: number; n?: number; usd?: number }> = ({ w, h, a1, n = 30, usd = 25 }) => {
  const f = useCurrentFrame();
  const order = Array.from({ length: n }).map((_, i) => i).sort((a, b) => random(`o${a}`) - random(`o${b}`));
  const rank = new Map(order.map((v, i) => [v, i]));
  const cols = 6;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12, padding: 10, perspective: 800 }}>
      {Array.from({ length: n }).map((_, i) => {
        const r = rank.get(i) ?? 0, st = a1 + r * 2.2;
        const flipTo = r < usd;
        const ang = flipTo ? interpolate(f, [st, st + 10], [0, 180], eio) : 0;
        const showUsd = ang > 90;
        const col = showUsd ? H.green : H.violet;
        return <div key={i} style={{ height: (h - 20 - 12 * 4) / 5, transform: `rotateY(${showUsd ? ang - 180 : ang}deg)`, border: `2px solid ${col}`, background: fillA(col, 0.18), borderRadius: 6,
          boxShadow: `0 0 10px ${col}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DIGI, fontWeight: 700, fontSize: 30, color: showUsd ? "#dfffe3" : "#e4dcff" }}>
          {showUsd ? "$ 1" : "៛ 4000"}</div>;
      })}
    </div>
  );
};

/** #11 Baht coin cracks as the rate climbs. */
export const HoloCoinCrack: React.FC<{ w: number; h: number; a1: number }> = ({ w, h, a1 }) => {
  const f = useCurrentFrame();
  const crack = interpolate(f, [a1 + 15, a1 + 60], [0, 1], cl);
  const shake = crack > 0 && crack < 1 ? Math.sin(f * 2.1) * 3 : 0;
  const halves = interpolate(f, [a1 + 60, a1 + 75], [0, 1], eio);
  const coin = (dx: number, clip: string) => (
    <g transform={`translate(${200 + dx * 40 * halves + shake} 210) rotate(${dx * 8 * halves})`} clipPath={clip}>
      <circle r={140} fill={fillA(H.amber, 0.14)} stroke={H.amber} strokeWidth={3} style={{ filter: glow(H.amber, 10) }} />
      <circle r={110} fill="none" stroke={H.amber} strokeOpacity={0.5} strokeWidth={1.5} strokeDasharray="4 6" />
      {T(0, 45, "฿", 130, H.amber, "middle", DIGI, 700)}
    </g>
  );
  return (
    <Box w={w} h={h} vb={[400, 420]}>
      <defs>
        <clipPath id="cL"><path d="M-200,-200 L-5,-200 L25,-80 L-15,10 L20,90 L-10,200 L-200,200 Z" /></clipPath>
        <clipPath id="cR"><path d="M200,-200 L-5,-200 L25,-80 L-15,10 L20,90 L-10,200 L200,200 Z" /></clipPath>
      </defs>
      {coin(-1, "url(#cL)")}{coin(1, "url(#cR)")}
      <path d={`M195,70 L225,${70 + 120 * crack} L185,${70 + 210 * crack} L220,${70 + 290 * crack}`} fill="none" stroke="#fff" strokeWidth={4} opacity={crack * (1 - halves)} style={{ filter: glow("#ffffff", 8) }} />
      {T(200, 400, "THE BAHT FLOATS", 24, H.dim)}
    </Box>
  );
};

/** #10 Dial needle swings, then a padlock snaps it at 3.80. */
export const HoloPegDial: React.FC<{ w: number; h: number; lock: number }> = ({ w, h, lock }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const wild = 3.4 + Math.sin(f * 0.12) * 0.9 + Math.sin(f * 0.31) * 0.35;
  const v = f < lock ? wild : interpolate(f, [lock, lock + 6], [wild, 3.8], cl);
  const ang = interpolate(v, [2, 5], [-120, 120], cl);
  const pad = spring({ frame: f - lock, fps, config: { damping: 9, stiffness: 200 } });
  const cx = 250, cy = 230, r = 170;
  return (
    <Box w={w} h={h} vb={[500, 440]}>
      <path d={`M${cx - r * 0.866},${cy + r * 0.5} A${r},${r} 0 1 1 ${cx + r * 0.866},${cy + r * 0.5}`} fill="none" stroke={fillA(H.cyan, 0.25)} strokeWidth={16} />
      <path d={`M${cx - r * 0.866},${cy + r * 0.5} A${r},${r} 0 1 1 ${cx + r * 0.866},${cy + r * 0.5}`} fill="none" stroke={H.cyan} strokeWidth={2} style={{ filter: glow(H.cyan, 8) }} />
      {[2, 2.5, 3, 3.5, 4, 4.5, 5].map((t) => { const a = (interpolate(t, [2, 5], [-120, 120]) - 90) * Math.PI / 180;
        return <g key={t}><line x1={cx + Math.cos(a) * (r - 26)} y1={cy + Math.sin(a) * (r - 26)} x2={cx + Math.cos(a) * (r - 6)} y2={cy + Math.sin(a) * (r - 6)} stroke={H.ice} strokeWidth={2} />
          {T(cx + Math.cos(a) * (r - 52), cy + Math.sin(a) * (r - 52) + 8, t.toFixed(1), 20, H.dim, "middle", DIGI, 500)}</g>; })}
      <g transform={`translate(${cx} ${cy}) rotate(${ang})`} style={{ filter: glow(f >= lock ? H.amber : H.red, 8) }}>
        <path d={`M-7,0 L0,${-r + 22} L7,0 Z`} fill={f >= lock ? H.amber : H.red} /><circle r={14} fill={H.ice} />
      </g>
      <g transform={`translate(${cx} ${cy + 120}) scale(${pad})`} opacity={pad} style={{ filter: glow(H.amber, 10) }}>
        <rect x={-36} y={-12} width={72} height={56} rx={8} fill={fillA(H.amber, 0.3)} stroke={H.amber} strokeWidth={3} />
        <path d="M-22,-12 L-22,-34 A22,22 0 0 1 22,-34 L22,-12" fill="none" stroke={H.amber} strokeWidth={8} />
      </g>
      {T(cx, 60, f >= lock ? "3.80 · FIXED" : v.toFixed(2), 34, f >= lock ? H.amber : H.ice, "middle", DIGI, 700)}
    </Box>
  );
};

/** #9 Same basket of groceries: price tag jumps in 1998, barely moves in 2025. */
export const HoloBasket: React.FC<{ w: number; h: number; a1: number }> = ({ w, h, a1 }) => {
  const f = useCurrentFrame();
  const basket = (x: number, year: string, pct: number, col: string, at: number) => {
    const k = interpolate(f, [at, at + 40], [0, 1], eio);
    const price = 100 * (1 + (pct / 100) * k);
    return (
      <g transform={`translate(${x} 0)`}>
        <path d="M20,200 L180,200 L160,320 L40,320 Z" fill={fillA(H.cyan, 0.12)} stroke={H.cyan} strokeWidth={2.5} style={{ filter: glow(H.cyan, 6) }} />
        <path d="M50,200 Q100,130 150,200" fill="none" stroke={H.cyan} strokeWidth={2.5} />
        {[[60, 190, H.amber], [100, 180, H.green], [140, 190, H.red]].map(([cx, cy, c], i) => <circle key={i} cx={cx as number} cy={cy as number} r={20} fill={fillA(c as string, 0.3)} stroke={c as string} strokeWidth={2} />)}
        <g transform={`translate(100 ${110 - 30 * k})`}>
          <rect x={-70} y={-30} width={140} height={52} rx={6} fill={fillA(col, 0.2)} stroke={col} strokeWidth={2.5} style={{ filter: glow(col, 8) }} />
          {T(0, 6, `${Math.round(price)}`, 30, col, "middle", DIGI, 700)}
        </g>
        {T(100, 360, year, 26, H.ice, "middle", DIGI, 700)}
        {T(100, 392, `+${pct}%`, 24, col, "middle", DIGI, 700)}
      </g>
    );
  };
  return (
    <Box w={w} h={h} vb={[500, 420]}>
      {basket(20, "1998", 58, H.red, a1)}
      {basket(280, "2025", 2.6, H.teal, a1 + 12)}
      {T(250, 30, "SAME BASKET · ONE YEAR LATER", 22, H.dim)}
    </Box>
  );
};

/** #8 Vault door with coins pouring in from four flags; then dust settles and the door stays shut. */
export const HoloVault: React.FC<{ w: number; h: number; a1: number; a2: number; dur: number }> = ({ w, h, a1, a2, dur }) => {
  const f = useCurrentFrame();
  const fill = interpolate(f, [a1, a2], [0, 1], cl);
  const dust = interpolate(f, [a2, dur], [0, 0.6], cl);
  const spin = interpolate(f, [a1, a2], [0, 220], cl);
  return (
    <Box w={w} h={h} vb={[420, 460]}>
      <rect x={40} y={60} width={340} height={340} rx={18} fill={fillA(H.blue, 0.1)} stroke={H.cyan} strokeWidth={3} style={{ filter: glow(H.cyan, 8) }} />
      <rect x={52} y={388 - 320 * fill} width={316} height={320 * fill} rx={10} fill={fillA(H.amber, 0.3)} />
      {f < a2 && Array.from({ length: 10 }).map((_, i) => { const st = a1 + i * 6, age = (f - st) % 30;
        return f > st ? <circle key={i} cx={80 + (i * 37) % 260} cy={20 + age * 10} r={9} fill={fillA(H.amber, 0.7)} stroke={H.amber} /> : null; })}
      <g transform={`translate(210 230) rotate(${spin})`} style={{ filter: glow(H.ice, 6) }}>
        <circle r={78} fill="none" stroke={H.ice} strokeWidth={4} />
        {[0, 60, 120].map((a) => <line key={a} x1={0} y1={0} x2={Math.cos(a * Math.PI / 180) * 78} y2={Math.sin(a * Math.PI / 180) * 78} stroke={H.ice} strokeWidth={5} />)}
        <circle r={14} fill={H.ice} />
      </g>
      {Array.from({ length: 50 }).map((_, i) => <circle key={`d${i}`} cx={40 + random(`x${i}`) * 340} cy={60 + random(`y${i}`) * 340} r={1.5 + random(`r${i}`) * 2} fill="#d8cdb4" opacity={dust} />)}
      <rect x={40} y={60} width={340} height={340} rx={18} fill="#b8a98a" opacity={dust * 0.25} />
      {f >= a2 && T(210, 445, "UNOPENED SINCE 2000", 24, H.amber, "middle", DIGI, 700)}
    </Box>
  );
};

/** #7 Hourglass of dollars draining beside an offshore rig whose light goes out. */
export const HoloHourglass: React.FC<{ w: number; h: number; a1: number; a2: number; dur: number }> = ({ w, h, a1, a2, dur }) => {
  const f = useCurrentFrame();
  const drain = interpolate(f, [a2, dur - 6], [0, 0.85], cl);
  const rigOn = interpolate(f, [a1 + 20, a1 + 35], [1, 0.15], cl);
  const cx = 300, top = 70, mid = 245, bot = 420, w2 = 115;
  return (
    <Box w={w} h={h} vb={[460, 460]}>
      <defs><clipPath id="hT"><path d={`M${cx - w2},${top} L${cx + w2},${top} L${cx + 10},${mid} L${cx - 10},${mid} Z`} /></clipPath>
        <clipPath id="hB"><path d={`M${cx - 10},${mid} L${cx + 10},${mid} L${cx + w2},${bot} L${cx - w2},${bot} Z`} /></clipPath></defs>
      <rect x={cx - w2} y={mid - (mid - top) * (1 - drain)} width={2 * w2} height={(mid - top) * (1 - drain)} fill={fillA(H.amber, 0.45)} clipPath="url(#hT)" />
      <rect x={cx - w2} y={bot - (bot - mid) * drain} width={2 * w2} height={(bot - mid) * drain} fill={fillA(H.amber, 0.25)} clipPath="url(#hB)" />
      {drain > 0 && drain < 0.85 && <line x1={cx} y1={mid} x2={cx} y2={bot - (bot - mid) * drain} stroke={H.amber} strokeWidth={4} strokeDasharray="8 6" strokeDashoffset={-f * 3} />}
      <path d={`M${cx - w2},${top} L${cx + w2},${top} L${cx + 10},${mid} L${cx + w2},${bot} L${cx - w2},${bot} L${cx - 10},${mid} Z`} fill="none" stroke={H.cyan} strokeWidth={3} style={{ filter: glow(H.cyan, 8) }} />
      <g transform="translate(0 250) scale(0.9)" opacity={0.4 + 0.6 * rigOn}>
        <path d="M0,140 L100,140 M10,140 L30,40 L70,40 L90,140 M30,40 L50,0 L70,40 M20,90 L80,90" fill="none" stroke={H.amber} strokeWidth={2.5} style={{ filter: glow(H.amber, 6 * rigOn) }} />
        <circle cx={50} cy={-8} r={8} fill={H.amber} opacity={rigOn} />
        {T(50, 175, rigOn > 0.5 ? "RIG ON" : "OIL ENDED", 20, rigOn > 0.5 ? H.amber : H.red, "middle", DIGI, 700)}
      </g>
    </Box>
  );
};

/** #4 Kip note shrinks to half while the foreign-currency debt weight grows heavier. */
export const HoloKip: React.FC<{ w: number; h: number; a1: number; a2: number }> = ({ w, h, a1, a2 }) => {
  const f = useCurrentFrame();
  const sh = interpolate(f, [a1, a1 + 60], [1, 0.5], eio);
  const heavy = interpolate(f, [a2, a2 + 50], [1, 1.8], eio);
  return (
    <Box w={w} h={h} vb={[600, 440]}>
      <g transform={`translate(160 170) scale(${sh})`} style={{ filter: glow(H.violet, 10) }}>
        <rect x={-140} y={-70} width={280} height={140} rx={10} fill={fillA(H.violet, 0.22)} stroke={H.violet} strokeWidth={3 / sh} />
        <rect x={-120} y={-52} width={240} height={104} rx={6} fill="none" stroke={H.violet} strokeOpacity={0.6} strokeWidth={1.5 / sh} />
        {T(0, 14, "₭ 50,000", 40, "#e4dcff", "middle", DIGI, 700)}
      </g>
      {T(160, 300, `BUYS ${Math.round(sh * 100)}% IN $`, 24, H.violet, "middle", DIGI, 700)}
      <g transform={`translate(440 ${300 - 30 * (heavy - 1)})`} style={{ filter: glow(H.red, 8) }}>
        <path d={`M${-70 * heavy},60 L${70 * heavy},60 L${50 * heavy},${-60 * heavy} L${-50 * heavy},${-60 * heavy} Z`} fill={fillA(H.red, 0.2)} stroke={H.red} strokeWidth={3} />
        <circle cy={-60 * heavy - 16} r={14} fill="none" stroke={H.red} strokeWidth={5} />
        {T(0, 6, "$ / ¥ DEBT", 18 * heavy, "#ffd7de", "middle", DIGI, 700)}
      </g>
      <line x1={330} x2={560} y1={362 + 16 * (heavy - 1)} y2={362 + 16 * (heavy - 1)} stroke={H.ice} strokeOpacity={0.5} strokeWidth={3} />
      {f >= a2 && T(440, 420, "HEAVIER IN KIP", 24, H.red, "middle", DIGI, 700)}
    </Box>
  );
};

/** #3 Calendar pages stamped DUE get pushed to the next year, again and again. */
export const HoloCalendar: React.FC<{ w: number; h: number; a1: number; dur: number }> = ({ w, h, a1, dur }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const years = ["2023", "2024", "2025", "2026", "2027", "2028"];
  const pushes = 4, every = Math.max(22, Math.floor((dur - a1 - 30) / pushes));
  const k = Math.min(pushes, Math.max(0, Math.floor((f - a1) / every)));
  const local = (f - a1) - k * every;
  const slide = k < pushes ? interpolate(local, [every - 12, every], [0, 1], eio) : 0;
  const due = Math.min(years.length - 1, k + slide);
  const pw = 150, gap = 22;
  return (
    <Box w={w} h={h} vb={[1040, 440]}>
      {years.map((y, i) => (
        <g key={y} transform={`translate(${30 + i * (pw + gap)} 90)`}>
          <rect width={pw} height={190} rx={10} fill={fillA(H.blue, 0.12)} stroke={H.cyan} strokeWidth={2} style={{ filter: glow(H.cyan, 5) }} />
          <rect width={pw} height={44} rx={10} fill={fillA(H.cyan, 0.3)} />
          {T(pw / 2, 31, y, 26, H.ice, "middle", DIGI, 700)}
          {Array.from({ length: 12 }).map((_, j) => <rect key={j} x={14 + (j % 4) * 32} y={60 + Math.floor(j / 4) * 38} width={24} height={26} fill="none" stroke={H.dim} strokeOpacity={0.5} />)}
        </g>
      ))}
      <g transform={`translate(${30 + due * (pw + gap) + pw / 2} 185) rotate(-14) scale(${spring({ frame: local < every - 12 ? local : 0, fps, config: { damping: 9 } })})`} style={{ filter: glow(H.red, 10) }}>
        <rect x={-62} y={-30} width={124} height={60} rx={6} fill={fillA(H.red, 0.25)} stroke={H.red} strokeWidth={4} />
        {T(0, 14, "DUE", 38, H.red, "middle", DIGI, 900)}
      </g>
      {k < pushes && <g transform={`translate(${30 + due * (pw + gap) + pw - 10} 340)`} style={{ filter: glow(H.amber, 8) }}>
        <path d="M0,0 L90,0 M68,-18 L92,0 L68,18" stroke={H.amber} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>}
      {T(520, 420, `DEFERRED × ${k}`, 30, H.amber, "middle", DIGI, 700)}
    </Box>
  );
};

/** #2 Seesaw: the bigger Singapore block rises, the smaller Laos block sinks. */
export const HoloSeesaw: React.FC<{ w: number; h: number; a1: number; a2: number }> = ({ w, h, a1, a2 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const tip = spring({ frame: f - a2, fps, config: { damping: 14, stiffness: 60 } });
  const ang = interpolate(tip, [0, 1], [-9, 13]);
  const cx = 360, cy = 300, arm = 300;
  const rad = ang * Math.PI / 180;
  const at = (d: number) => ({ x: cx + d * Math.cos(rad), y: cy + d * Math.sin(rad) });
  const block = (d: number, bw: number, bh: number, col: string, a: string, b: string) => {
    const P = at(d);
    return <g transform={`translate(${P.x} ${P.y}) rotate(${ang})`} style={{ filter: glow(col, 8) }}>
      <rect x={-bw / 2} y={-bh} width={bw} height={bh} rx={6} fill={fillA(col, 0.22)} stroke={col} strokeWidth={2.5} />
      {T(0, -bh / 2, a, 34, col, "middle", DIGI, 700)}{T(0, -bh / 2 + 32, b, 18, H.ice)}
    </g>;
  };
  return (
    <Box w={w} h={h} vb={[720, 440]}>
      <path d={`M${cx - 40},420 L${cx},${cy} L${cx + 40},420 Z`} fill={fillA(H.blue, 0.15)} stroke={H.cyan} strokeWidth={2} />
      <line x1={at(-arm).x} y1={at(-arm).y} x2={at(arm).x} y2={at(arm).y} stroke={H.ice} strokeWidth={8} strokeLinecap="round" style={{ filter: glow(H.cyan, 8) }} />
      {block(-arm + 90, 160, 150, H.cyan, "≈170%", "SINGAPORE")}
      {block(arm - 80, 120, 105, H.amber, "≈83%", "LAOS")}
      {f >= a2 && T(at(arm - 80).x, Math.min(430, at(arm - 80).y + 50), "SINKS", 24, H.red, "middle", DIGI, 700)}
    </Box>
  );
};
