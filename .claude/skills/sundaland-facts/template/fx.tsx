import React from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PROJ, COUNTRIES } from "./mapData";
import { C, SERIF, SANS, MONO, s, clamp, Cam, camScale, toScreen, DriftVideo, Rise, Credit } from "./parts";

export const ll = (lon: number, lat: number): [number, number] => [(lon - PROJ.lon0) * PROJ.k * PROJ.sx, (PROJ.lat1 - lat) * PROJ.sx];

// ── icons (drawn for this piece) ─────────────────────────────────────────────
export const Durian: React.FC<{ size?: number; spin?: number }> = ({ size = 40, spin = 0 }) => {
  const spikes = Array.from({ length: 22 }).map((_, i) => {
    const a = (i / 22) * Math.PI * 2, rx = 16, ry = 19;
    const x = Math.cos(a) * rx, y = Math.sin(a) * ry, nx = Math.cos(a) * (rx + 6), ny = Math.sin(a) * (ry + 6);
    const px = -Math.sin(a) * 3, py = Math.cos(a) * 3;
    return `M${x + px},${y + py} L${nx},${ny} L${x - px},${y - py} Z`;
  });
  return (
    <svg width={size} height={size} viewBox="-28 -30 56 60" style={{ transform: `rotate(${spin}deg)`, overflow: "visible" }}>
      <defs><radialGradient id="dur" cx="35%" cy="35%" r="75%"><stop offset="0%" stopColor="#c9dc5a" /><stop offset="60%" stopColor="#7f9c2b" /><stop offset="100%" stopColor="#4a6418" /></radialGradient></defs>
      <ellipse cx={3} cy={6} rx={18} ry={20} fill="rgba(0,0,0,0.35)" />
      <path d={spikes.join(" ")} fill="#6f8d25" />
      <ellipse cx={0} cy={0} rx={16} ry={19} fill="url(#dur)" stroke="#3d5214" strokeWidth={1} />
      {Array.from({ length: 14 }).map((_, i) => <circle key={i} cx={-10 + (i % 4) * 7} cy={-12 + Math.floor(i / 4) * 7} r={1.4} fill="#5d7a1c" opacity={0.8} />)}
      <path d="M0,-19 L2,-28" stroke="#6b4a26" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
};

export const Fish: React.FC<{ size?: number; t?: number }> = ({ size = 54, t = 0 }) => {
  const wag = Math.sin(t * 0.6) * 10;
  return (
    <svg width={size} height={size * 0.5} viewBox="-34 -14 68 28" style={{ overflow: "visible" }}>
      <defs><linearGradient id="tuna" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#24456b" /><stop offset="55%" stopColor="#6d8fb3" /><stop offset="100%" stopColor="#e3ebf3" /></linearGradient></defs>
      <g transform={`rotate(${wag} -20 0)`}><path d="M-20,0 L-33,-11 L-29,0 L-33,11 Z" fill="#24456b" /></g>
      <path d="M-22,0 C-12,-11 14,-11 26,-2 C29,0 29,1 26,3 C14,11 -12,11 -22,0 Z" fill="url(#tuna)" stroke="#16304e" strokeWidth={0.8} />
      <path d="M-2,-8 L6,-14 L8,-7 Z" fill="#E9A23B" /><path d="M0,8 L6,13 L8,7 Z" fill="#E9A23B" />
      <circle cx={18} cy={-2} r={2} fill="white" /><circle cx={18.5} cy={-2} r={1} fill="#111" />
    </svg>
  );
};

export const Can: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="-16 -18 32 36" style={{ overflow: "visible" }}>
    <rect x={-13} y={-12} width={26} height={24} rx={2} fill="#c8ced8" />
    <rect x={-13} y={-6} width={26} height={12} fill="#E9A23B" />
    <text x={0} y={3.5} textAnchor="middle" fontSize={7} fontWeight={800} fill="#0B1530" style={{ fontFamily: "sans-serif" }}>TUNA</text>
    <ellipse cx={0} cy={-12} rx={13} ry={4} fill="#eef1f5" stroke="#9aa3b2" strokeWidth={1} />
    <ellipse cx={0} cy={12} rx={13} ry={4} fill="#9aa3b2" />
  </svg>
);

export const Pickup: React.FC<{ size?: number }> = ({ size = 60 }) => (
  <svg width={size} height={size * 0.5} viewBox="-30 -14 60 28" style={{ overflow: "visible" }}>
    <path d="M-27,4 L-27,-2 L-8,-2 L-3,-11 L12,-11 L16,-2 L27,-1 L27,6 L-27,6 Z" fill="#f2efe6" stroke="#0B1530" strokeWidth={1.2} />
    <path d="M-1,-9 L11,-9 L13,-3 L-4,-3 Z" fill="#6d8fb3" />
    <circle cx={-16} cy={7} r={5} fill="#1b1f2a" /><circle cx={16} cy={7} r={5} fill="#1b1f2a" />
    <circle cx={-16} cy={7} r={2} fill="#9aa3b2" /><circle cx={16} cy={7} r={2} fill="#9aa3b2" />
  </svg>
);

export const Box: React.FC<{ size?: number; color?: string }> = ({ size = 34, color = "#E5484D" }) => (
  <svg width={size} height={size} viewBox="-16 -16 32 32" style={{ overflow: "visible" }}>
    <path d="M-12,-6 L4,-6 L12,-12 L-4,-12 Z" fill="white" opacity={0.85} />
    <path d="M4,-6 L12,-12 L12,6 L4,12 Z" fill={color} style={{ filter: "brightness(0.7)" }} />
    <rect x={-12} y={-6} width={16} height={18} fill={color} />
    {[-9, -5, -1].map((x) => <line key={x} x1={x} y1={-4} x2={x} y2={10} stroke="rgba(0,0,0,.25)" />)}
  </svg>
);

const ICON: Record<string, (t: number, i: number) => React.ReactNode> = {
  durian: (t, i) => <Durian size={68} spin={t * 4 + i * 40} />,
  fish: (t) => <Fish size={92} t={t} />,
  can: () => <Can size={58} />,
  pickup: () => <Pickup size={84} />,
  box: (_t, i) => <Box size={44} color={["#E5484D", "#3FB7B0", "#E9A23B"][i % 3]} />,
};

// ── Container ship, oblique 3D (tilted camera: deck plane foreshortened, height extruded screen-up) ──
const BOX_COLS = ["#c8402f", "#21807F", "#E9A23B", "#2f5d9e", "#e7ebf1", "#3FB7B0", "#8a3b8f", "#d9822b"];
const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${c((n >> 16) & 255)},${c((n >> 8) & 255)},${c(n & 255)})`;
};
export const SHIP_LEN = 150; // px at scale 1 (bow to stern)
const TILT = 0.62;            // ground-plane squash (camera pitch)
export const Ship3D: React.FC<{ x: number; y: number; ang: number; scale?: number; t: number }> = ({ x, y, ang, scale = 1, t }) => {
  const deg = (ang * 180) / Math.PI;
  // place a ground-plane layer at elevation z (screen px, already scaled)
  const at = (z: number) => `translate(${x} ${y - z * scale}) scale(${scale} ${scale * TILT}) rotate(${deg})`;
  const hull = "M-75,-11 Q-75,-14 -71,-14 L46,-14 C62,-14 72,-6 77,0 C72,6 62,14 46,14 L-71,14 Q-75,14 -75,11 Z";
  const deck = "M-71,-11 L44,-11 C57,-11 66,-5 70,0 C66,5 57,11 44,11 L-71,11 Z";
  const HULL_H = 11, BOX_H = 4.2, TOWER_H = 22;
  const bays = Array.from({ length: 11 }).map((_, b) => -40 + b * 8.6);
  const rows = [-9.2, -3.1, 3.0];
  const stackH = (b: number, r: number) => 1 + ((b * 7 + r * 3) % 3); // 1–3 tiers
  const foam = (k: number) => ((t * 1.6 + k) % 182);
  return (
    <svg style={{ position: "absolute", inset: 0, width: 1920, height: 1080, overflow: "visible" }}>
      <defs><filter id="shipsh" x="-50%" y="-80%" width="200%" height="260%"><feGaussianBlur stdDeviation="4" /></filter></defs>
      {/* water level: shadow cast down-right, foam wake, bow wave */}
      <g transform={`translate(${14 * scale} ${10 * scale})`}><g transform={at(0)}><path d={hull} fill="rgba(0,0,0,0.5)" filter="url(#shipsh)" /></g></g>
      <g transform={at(0)}>
        {Array.from({ length: 7 }).map((_, i) => {
          const d = foam(i * 26), o = 0.45 * (1 - d / 182), sp = 12 + d * 0.32;
          return <g key={i} opacity={o}>
            <path d={`M${-80 - d},${-sp} q-8,${sp * 0.25} -16,${sp * 0.35}`} stroke="white" strokeWidth={2.4} fill="none" strokeLinecap="round" />
            <path d={`M${-80 - d},${sp} q-8,${-sp * 0.25} -16,${-sp * 0.35}`} stroke="white" strokeWidth={2.4} fill="none" strokeLinecap="round" />
          </g>;
        })}
        {Array.from({ length: 9 }).map((_, i) => { const d = ((t * 2.2 + i * 13) % 110);
          return <ellipse key={`f${i}`} cx={-80 - d} cy={Math.sin(i * 1.7 + t * 0.2) * (3 + d * 0.06)} rx={7 + d * 0.05} ry={4.5 + d * 0.04} fill="white" opacity={0.5 * (1 - d / 110)} />; })}
        <path d="M68,-15 Q90,0 68,15" fill="none" stroke="white" strokeWidth={3} opacity={0.6} />
      </g>
      {/* hull walls: stacked slices = visible side of the hull; red boot-top at the waterline */}
      {Array.from({ length: HULL_H }).map((_, z) => (
        <g key={`h${z}`} transform={at(z)}><path d={hull} fill={z < 3 ? "#8f2a22" : z === HULL_H - 1 ? "#2a3f66" : "#1b2c4c"} /></g>
      ))}
      <g transform={at(HULL_H)}><path d={hull} fill="#24395e" /><path d={deck} fill="#a7afbd" /></g>
      {/* container stacks as boxes: side slices + lit top */}
      {bays.map((bx, b) => rows.map((by, r) => {
        const col = BOX_COLS[(b * 3 + r * 5) % BOX_COLS.length], tiers = stackH(b, r), top = HULL_H + tiers * BOX_H;
        return <React.Fragment key={`${b}-${r}`}>
          {Array.from({ length: Math.ceil(tiers * BOX_H) }).map((_, z) => (
            <g key={z} transform={at(HULL_H + z)}><rect x={bx} y={by} width={7.8} height={5.6} fill={shade(col, z % 4 === 3 ? 0.45 : 0.62)} /></g>
          ))}
          <g transform={at(top)}><rect x={bx} y={by} width={7.8} height={5.6} fill={col} stroke={shade(col, 0.5)} strokeWidth={0.5} /></g>
        </React.Fragment>;
      }))}
      {/* superstructure tower near the stern */}
      {Array.from({ length: TOWER_H }).map((_, z) => (
        <g key={`t${z}`} transform={at(HULL_H + z)}><rect x={-63} y={-11} width={14} height={22} fill={z % 6 === 4 ? "#7c8aa3" : "#c9d1de"} /></g>
      ))}
      <g transform={at(HULL_H + TOWER_H)}>
        <rect x={-65} y={-16} width={6} height={32} fill="#e6eaf1" />
        <rect x={-63} y={-11} width={14} height={22} fill="#ffffff" />
        <rect x={-60} y={-4} width={6} height={8} rx={1} fill="#c8402f" />
      </g>
    </svg>
  );
};

// ── route geometry in map units ─────────────────────────────────────────────
export const routeGeom = (pts: [number, number][]) => {
  const u = pts.map(([lo, la]) => ll(lo, la));
  const seg = u.slice(1).map((q, i) => Math.hypot(q[0] - u[i][0], q[1] - u[i][1]));
  const L = seg.reduce((a, b) => a + b, 0);
  const at = (p: number) => {
    let rem = Math.max(0, Math.min(1, p)) * L;
    for (let i = 0; i < seg.length; i++) {
      if (rem <= seg[i] || i === seg.length - 1) {
        const t = seg[i] ? Math.min(1, rem / seg[i]) : 0;
        return { x: u[i][0] + (u[i + 1][0] - u[i][0]) * t, y: u[i][1] + (u[i + 1][1] - u[i][1]) * t };
      }
      rem -= seg[i];
    }
    return { x: u[u.length - 1][0], y: u[u.length - 1][1] };
  };
  return { u, L, at };
};
export const routeProgress = (f: number, r: any) => interpolate(f, [s(r.at), s(r.at + r.dur)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });

/** Route drawn in map units with optional 3D ship riding the head. */
export const RouteFX: React.FC<{ cam: Cam; r: any }> = ({ cam, r }) => {
  const f = useCurrentFrame();
  if (f < s(r.at)) return null;
  const g = routeGeom(r.pts);
  const p = routeProgress(f, r);
  const k = camScale(cam);
  const sp = g.u.map(([x, y]) => toScreen(cam, x, y));
  const d = "M" + sp.map((q) => `${q.x},${q.y}`).join(" L");
  const Ls = g.L * k;
  const head = g.at(p), ahead = g.at(Math.min(1, p + 0.01)), behind = g.at(Math.max(0, p - 0.01));
  const H = toScreen(cam, head.x, head.y);
  const ang = Math.atan2(ahead.y - behind.y, ahead.x - behind.x);
  const col = r.color ?? "#F2A33A";
  const shipScale = r.shipScale ?? 1.5;
  const sternGap = r.ship && p < 1 ? Math.min(p, ((SHIP_LEN * 0.5 + 150) * shipScale) / Ls) : 0;
  const pl = Math.max(0, p - sternGap);
  return (
    <>
      <svg style={{ position: "absolute", inset: 0, width: 1920, height: 1080, overflow: "visible" }}>
        <path d={d} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={Ls} strokeDashoffset={Ls * (1 - pl)} transform="translate(2 3)" opacity={0.6} />
        <path d={d} fill="none" stroke={col} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={Ls} strokeDashoffset={Ls * (1 - pl)} opacity={0.9} />
      </svg>
      {r.ship && <Ship3D x={H.x} y={H.y} ang={ang} t={f} scale={shipScale} />}
    </>
  );
};

/** Camera that rides a route head (Malacca 0:10–0:13): returns cam + speed for motion blur. */
export const followCam = (f: number, fol: any, routes: any[], base: Cam): { cam: Cam; speed: number } => {
  const r = routes[fol.route ?? 0];
  const g = routeGeom(r.pts);
  const vhAt = (fr: number) => interpolate(fr, fol.vh.map((v: number[]) => s(v[0])), fol.vh.map((v: number[]) => v[1] * PROJ.sx), { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const lead = fol.lead ?? 0.04;
  const camAt = (fr: number): Cam => {
    const p = routeProgress(fr, r);
    const h = g.at(Math.min(1, p + lead));
    return { cx: h.x, cy: h.y, vh: vhAt(fr) };
  };
  const on = interpolate(f, [s(fol.from), s(fol.from) + 10], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const off = fol.release != null ? interpolate(f, [s(fol.release), s(fol.release) + 22], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) }) : 0;
  const w = on * (1 - off);
  const fc = camAt(f), fp = camAt(f - 1);
  const mix = (a: number, b: number) => a + (b - a) * w;
  const cam = { cx: mix(base.cx, fc.cx), cy: mix(base.cy, fc.cy), vh: Math.exp(mix(Math.log(base.vh), Math.log(fc.vh))) };
  const speed = Math.hypot(fc.cx - fp.cx, fc.cy - fp.cy) * camScale(fc) * w;
  return { cam, speed };
};

// ── Country silhouette pop (Japan-style in the Malacca piece) ───────────────
export const CountryPop: React.FC<{ cam: Cam; name: string; color: string; at: number; settle?: number; stroke?: string }> = ({ cam, name, color, at, settle = 0.85, stroke = "white" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = (COUNTRIES as any)[name];
  if (!c || f < at) return null;
  const k = camScale(cam), vw = 1920 / k, vh = 1080 / k;
  const pop = spring({ frame: f - at, fps, config: { damping: 11, stiffness: 140 } });
  const rest = interpolate(f, [at + 16, at + 34], [1, settle], clamp);
  const lift = 12 * pop;
  return (
    <svg viewBox={`${cam.cx - vw / 2} ${cam.cy - vh / 2} ${vw} ${vh}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: Math.min(1, pop * 1.4),
      filter: `drop-shadow(0 ${lift}px ${10 + 10 * pop}px rgba(0,0,0,0.55))` }}>
      <g transform={`translate(${c.cx} ${c.cy}) scale(${0.8 + 0.2 * pop}) translate(${-c.cx} ${-c.cy - lift / k})`}>
        {c.paths.map((d: string, i: number) => <path key={i} d={d} fill={color} fillOpacity={rest} stroke={stroke} strokeWidth={2.4 / k} strokeLinejoin="round" />)}
      </g>
    </svg>
  );
};

// ── Flow arc: comet line + travelling cargo icons + arrival burst ───────────
const qb = (A: any, Cc: any, B: any, t: number) => ({ x: (1 - t) ** 2 * A.x + 2 * (1 - t) * t * Cc.x + t * t * B.x, y: (1 - t) ** 2 * A.y + 2 * (1 - t) * t * Cc.y + t * t * B.y });
export const FlowArc: React.FC<{ cam: Cam; a: [number, number]; b: [number, number]; at: number; dur?: number; color?: string; label?: string; bend?: number; icon?: string; count?: number; gap?: number; travel?: number; burst?: boolean; out?: number }> = ({
  cam, a, b, at, dur = 22, color = C.amber, label, bend = 0.22, icon, count = 0, gap = 7, travel = 34, burst = true, out,
}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const fade = out != null ? interpolate(f, [out, out + 12], [1, 0], clamp) : 1;
  if (fade <= 0) return null;
  const A = toScreen(cam, ...ll(...a)), B = toScreen(cam, ...ll(...b));
  const dx = B.x - A.x, dy = B.y - A.y;
  const Cc = { x: (A.x + B.x) / 2 - dy * bend, y: (A.y + B.y) / 2 + dx * bend };
  const p = interpolate(f, [at, at + dur], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const d = `M${A.x},${A.y} Q${Cc.x},${Cc.y} ${B.x},${B.y}`;
  const L = Math.hypot(dx, dy) * 1.15;
  const H = qb(A, Cc, B, p);
  const flow = (f - at) * 3;
  const arrive = at + dur;
  const bo = interpolate(f, [arrive, arrive + 3, arrive + 16], [0, 1, 0], clamp);
  const br = interpolate(f, [arrive, arrive + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const lo = interpolate(f, [at + dur * 0.6, at + dur], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fade }}>
      <svg style={{ position: "absolute", inset: 0, width: 1920, height: 1080, overflow: "visible" }}>
        <path d={d} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth={8} strokeDasharray={L} strokeDashoffset={L * (1 - p)} strokeLinecap="round" transform="translate(3 5)" />
        <path d={d} fill="none" stroke={color} strokeWidth={6} strokeDasharray={L} strokeDashoffset={L * (1 - p)} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
        {p >= 1 && <path d={d} fill="none" stroke="white" strokeWidth={3} strokeDasharray="4 22" strokeDashoffset={-flow} opacity={0.75} strokeLinecap="round" />}
        {p < 1 && <><circle cx={H.x} cy={H.y} r={16} fill={color} opacity={0.35} /><circle cx={H.x} cy={H.y} r={8} fill="white" /></>}
        {burst && f >= arrive && Array.from({ length: 12 }).map((_, i) => {
          const an = (i / 12) * Math.PI * 2 + 0.2, r0 = 14 + 24 * br, r1 = 26 + 64 * br;
          return <line key={i} x1={B.x + Math.cos(an) * r0} y1={B.y + Math.sin(an) * r0} x2={B.x + Math.cos(an) * r1} y2={B.y + Math.sin(an) * r1} stroke="white" strokeWidth={3} strokeLinecap="round" opacity={bo} />;
        })}
        {burst && f >= arrive && <circle cx={B.x} cy={B.y} r={10} fill={color} stroke="white" strokeWidth={3} />}
        {label && <text x={Cc.x} y={Cc.y - 18} textAnchor="middle" fill="white" opacity={lo} style={{ fontFamily: SANS, fontWeight: 700, fontStyle: "italic", fontSize: 34, paintOrder: "stroke", stroke: "rgba(0,0,0,.65)", strokeWidth: 7 }}>{label}</text>}
      </svg>
      {icon && Array.from({ length: count }).map((_, i) => {
        const st = at + dur * 0.35 + i * gap;
        const t = interpolate(f, [st, st + travel], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
        if (f < st || t >= 1) return null;
        const q = qb(A, Cc, B, t), q2 = qb(A, Cc, B, Math.min(1, t + 0.02));
        const ang = (Math.atan2(q2.y - q.y, q2.x - q.x) * 180) / Math.PI;
        const pop = interpolate(f, [st, st + 6], [0, 1], clamp) * interpolate(t, [0.88, 1], [1, 0], clamp);
        const rot = icon === "fish" || icon === "pickup" ? (Math.abs(ang) > 90 ? `scaleX(-1) rotate(${180 - ang}deg)` : `rotate(${ang}deg)`) : "";
        return (
          <div key={i} style={{ position: "absolute", left: q.x, top: q.y, transform: `translate(-50%,-50%) scale(${pop}) ${rot}`, filter: "drop-shadow(0 6px 6px rgba(0,0,0,.45))" }}>
            {ICON[icon](f - st, i)}
          </div>
        );
      })}
    </div>
  );
};

/** Little icons popping onto a point (e.g. durians on Chanthaburi). */
export const IconBurst: React.FC<{ cam: Cam; lon: number; lat: number; at: number; icon: string; n?: number; radius?: number }> = ({ cam, lon, lat, at, icon, n = 6, radius = 70 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < at) return null;
  const P = toScreen(cam, ...ll(lon, lat));
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + 0.4, rr = radius * (0.55 + 0.45 * random(`r${i}`));
        const sp = spring({ frame: f - at - i * 3, fps, config: { damping: 9, stiffness: 160 } });
        return <div key={i} style={{ position: "absolute", left: P.x + Math.cos(a) * rr * sp, top: P.y + Math.sin(a) * rr * sp, transform: `translate(-50%,-50%) scale(${sp})`, filter: "drop-shadow(0 6px 6px rgba(0,0,0,.45))" }}>{ICON[icon](f - at, i)}</div>;
      })}
    </>
  );
};

export const CountUp: React.FC<{ at: number; dur: number; to: number; prefix?: string; suffix?: string; label: string; x?: number; y?: number; decimals?: number }> = ({ at, dur, to, prefix = "", suffix = "", label, x = 120, y = 150, decimals = 0 }) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [at, at + dur], [0, to], { ...clamp, easing: Easing.out(Easing.cubic) });
  const o = interpolate(f, [at - 6, at + 4], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: o }}>
      <div style={{ fontFamily: MONO, fontSize: 24, color: C.tealBright, letterSpacing: 3, textShadow: "0 2px 8px rgba(0,0,0,.8)" }}>{label}</div>
      <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 130, color: C.amber, lineHeight: 1, textShadow: "0 6px 22px rgba(0,0,0,.6)" }}>{prefix}{v.toFixed(decimals)}{suffix}</div>
    </div>
  );
};

// ── Viz 1 · The sinking city (No. 13) ───────────────────────────────────────
export const SinkingCity: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const T = interpolate(f, [s(0.6), dur - 20], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const year = Math.round(1980 + 45 * T);
  const landDrop = 150 * T, seaRise = 34 * T;              // exaggerated vertical scale
  const G = 560 + landDrop, SEA = 600 - seaRise;
  const wave = (x: number) => SEA + Math.sin(x / 60 + f / 6) * 6;
  const seaPath = `M0,${wave(0)} ` + Array.from({ length: 21 }).map((_, i) => `L${i * 40},${wave(i * 40)}`).join(" ") + ` L800,1080 L0,1080 Z`;
  const bld = [[880, 140], [960, 220], [1050, 170], [1130, 300], [1220, 190], [1300, 250], [1390, 160], [1470, 210], [1560, 130], [1650, 180]];
  const drops = Array.from({ length: 10 }).map((_, i) => ((f * 6 + i * 42) % 420));
  const o = Math.min(interpolate(f, [0, 8], [0, 1], clamp), interpolate(f, [dur - 8, dur], [1, 0], clamp));
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #23365f 0%, #6a7fa6 55%, #c9b79a 100%)", opacity: o }}>
      <svg style={{ position: "absolute", inset: 0, width: 1920, height: 1080 }}>
        {/* ground */}
        <rect x={760} y={G} width={1160} height={1080} fill="#6E5A43" />
        <rect x={760} y={G + 150} width={1160} height={1080} fill="#4b6b8a" opacity={0.65} />
        <text x={1840} y={G + 200} textAnchor="end" fill="white" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28 }}>groundwater</text>
        {/* city */}
        {bld.map(([x, h], i) => <g key={i}><rect x={x} y={G - h} width={66} height={h} fill={i % 2 ? "#1d2b4f" : "#273a66"} />
          {Array.from({ length: Math.floor(h / 28) }).map((_, j) => <rect key={j} x={x + 10} y={G - h + 12 + j * 28} width={46} height={8} fill="#f5d27a" opacity={0.55} />)}</g>)}
        {/* pump + pipe + droplets */}
        <rect x={1720} y={G - 70} width={40} height={70} fill="#c8ced8" /><rect x={1734} y={G} width={12} height={170} fill="#9aa3b2" />
        {drops.map((d, i) => <circle key={i} cx={1740} cy={G + 165 - (d % 170)} r={6} fill="#7cc4ff" opacity={0.85} />)}
        <path d={`M1760,${G - 50} q40,-30 80,0`} fill="none" stroke="#7cc4ff" strokeWidth={6} strokeDasharray="10 8" strokeDashoffset={-f * 2} />
        {/* sea */}
        <path d={seaPath} fill="#1f6fb2" opacity={0.92} />
        <path d={seaPath} fill="none" stroke="#bfe6ff" strokeWidth={3} />
        {/* reference line: 1980 ground */}
        <line x1={760} y1={560} x2={1920} y2={560} stroke="white" strokeWidth={2} strokeDasharray="8 10" opacity={0.6} />
        <text x={1900} y={548} textAnchor="end" fill="white" opacity={0.8} style={{ fontFamily: MONO, fontSize: 22 }}>ground level, 1980</text>
      </svg>
      {/* tags riding the surfaces */}
      <div style={{ position: "absolute", left: 790, top: G + 18, fontFamily: SANS, fontWeight: 700, fontSize: 34, color: C.ink, background: C.amber, padding: "6px 14px", borderRadius: 6 }}>LAND ↓ 1–2 cm / yr <span style={{ fontWeight: 500, fontSize: 24 }}>(past peaks 3)</span></div>
      <div style={{ position: "absolute", left: 60, top: SEA - 70, fontFamily: SANS, fontWeight: 700, fontSize: 34, color: C.ink, background: C.tealBright, padding: "6px 14px", borderRadius: 6 }}>SEA ↑ ~4 mm / yr</div>
      <div style={{ position: "absolute", left: 60, top: 70 }}>
        <div style={{ fontFamily: MONO, fontSize: 26, color: C.tealBright, letterSpacing: 4 }}>BANGKOK · SINKING FASTER THAN THE SEA RISES</div>
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 150, color: C.paper, lineHeight: 1 }}>{year}</div>
      </div>
      <div style={{ position: "absolute", right: 56, top: 44, fontFamily: MONO, fontSize: 17, letterSpacing: 2, color: C.paper, opacity: 0.75, padding: "6px 12px", border: "1px solid rgba(242,239,230,0.45)", borderRadius: 3 }}>VERTICAL SCALE EXAGGERATED</div>
      <Credit text="Sources: Bangkok Post · The World (PRI) · BMA — schematic" />
    </AbsoluteFill>
  );
};

// ── Viz 2 · Piling through an old seabed (No. 12) ────────────────────────────
export const PilingSection: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const G = 330, mPx = 12, y = (m: number) => G + m * mPx;
  const seaO = interpolate(f, [0, s(4.5), s(6.0)], [1, 1, 0], clamp);
  const clayFill = interpolate(f, [s(4.5), s(7.0)], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const strikes = 7, strikeLen = 7, pStart = s(10.4);
  const k = Math.max(0, Math.min(strikes, (f - pStart) / strikeLen));
  const depth = (Math.floor(k) + Math.min(1, (k % 1) * 3)) / strikes * 46;   // metres
  const phase = (k % 1);
  const hammerY = G - 150 - (phase < 0.33 ? 0 : 60 * Math.sin(((phase - 0.33) / 0.67) * Math.PI));
  const piled = f > pStart + strikes * strikeLen;
  const floors = piled ? Math.min(8, Math.floor((f - (pStart + strikes * strikeLen)) / 4)) : 0;
  const o = Math.min(interpolate(f, [0, 8], [0, 1], clamp), interpolate(f, [dur - 8, dur], [1, 0], clamp));
  const fossils = [[260, 6], [520, 11], [760, 4], [980, 14], [1340, 9], [1600, 12]];
  return (
    <AbsoluteFill style={{ background: "#0E1A36", opacity: o }}>
      <svg style={{ position: "absolute", inset: 0, width: 1920, height: 1080 }}>
        <rect x={0} y={0} width={1920} height={G} fill="#16264a" />
        <rect x={0} y={y(18)} width={1920} height={10 * mPx} fill="#8A7550" />
        <rect x={0} y={y(28)} width={1920} height={27 * mPx} fill="#B79A5E" />
        <rect x={0} y={G + (1 - clayFill) * 18 * mPx} width={1920} height={18 * mPx * clayFill} fill="#6E5A43" />
        {fossils.map(([x, m], i) => <g key={i} opacity={clayFill} transform={`translate(${x} ${y(m)})`}>
          <path d="M-14,6 Q0,-16 14,6 Z" fill="#c9b48a" opacity={0.8} />{[-8, -3, 2, 7].map((xx) => <line key={xx} x1={0} y1={-8} x2={xx} y2={6} stroke="#8a744d" strokeWidth={1} />)}</g>)}
        {/* ancient sea */}
        <g opacity={seaO}><rect x={0} y={G - 120} width={1920} height={120 + 18 * mPx} fill="#1f6fb2" opacity={0.75} />
          <path d={`M0,${G - 120} ` + Array.from({ length: 33 }).map((_, i) => `L${i * 60},${G - 120 + Math.sin(i + f / 5) * 8}`).join(" ")} stroke="#bfe6ff" strokeWidth={3} fill="none" /></g>
        {/* piles */}
        {[1200, 1260, 1340, 1400].map((x, i) => <rect key={i} x={x} y={G} width={14} height={depth * mPx} fill="white" />)}
        {/* rig */}
        {!piled && f > pStart - 10 && <g><rect x={1288} y={G - 260} width={14} height={260} fill="#E9A23B" /><rect x={1258} y={hammerY} width={74} height={46} fill="#cfd6e4" stroke="#0B1530" strokeWidth={2} /></g>}
        {/* tower rising */}
        {Array.from({ length: floors }).map((_, i) => <rect key={i} x={1180} y={G - 28 * (i + 1)} width={240} height={26} fill={i % 2 ? "#cfd6e4" : "#b8c3d8"} />)}
        {[0, 10, 20, 30, 40, 50].map((m) => <g key={m}><line x1={1760} y1={y(m)} x2={1790} y2={y(m)} stroke="white" /><text x={1800} y={y(m) + 8} fill="white" style={{ fontFamily: MONO, fontSize: 22 }}>{m} m</text></g>)}
      </svg>
      <div style={{ position: "absolute", left: 80, top: 70, fontFamily: MONO, fontSize: 24, color: C.tealBright, letterSpacing: 3 }}>BANGKOK · SIMPLIFIED SOIL SECTION</div>
      <div style={{ position: "absolute", left: 80, top: G - 110, fontFamily: SERIF, fontWeight: 600, fontSize: 56, color: C.paper, opacity: seaO }}>Thousands of years ago: sea</div>
      <div style={{ position: "absolute", left: 80, top: y(5), fontFamily: SANS, fontWeight: 700, fontSize: 34, color: "white", opacity: clayFill }}>Soft Bangkok clay — old marine mud</div>
      <div style={{ position: "absolute", left: 80, top: y(20), fontFamily: SANS, fontWeight: 700, fontSize: 30, color: "white" }}>Stiff clay</div>
      <div style={{ position: "absolute", left: 80, top: y(34), fontFamily: SANS, fontWeight: 700, fontSize: 30, color: C.ink }}>Sand — firm bearing layer</div>
      <div style={{ position: "absolute", left: 1460, top: y(30), opacity: interpolate(depth, [30, 46], [0, 1], clamp) }}>
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 70, color: C.amber }}>20–50 m</div>
        <div style={{ fontFamily: SANS, fontSize: 28, color: C.ink, fontWeight: 700 }}>piles reach firmer sand</div>
      </div>
      <Credit text="After geotechnical studies of Bangkok subsoil (SEAGS/AGSSEA, Lowland Technology International) · schematic, not to scale" />
    </AbsoluteFill>
  );
};

// ── Viz 3 · Rubber: world share ring + latex beaker (No. 8) ──────────────────
export const RubberViz: React.FC<{ dur: number; p: any }> = ({ dur, p }) => {
  const f = useCurrentFrame();
  const ring = interpolate(f, [s(3.3), s(5.0)], [0, 0.335], { ...clamp, easing: Easing.out(Easing.cubic) });
  const fill = interpolate(f, [s(5.4), s(7.6)], [0, 0.532], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const R = 210, cx = 520, cy = 590, circ = 2 * Math.PI * R;
  const o = Math.min(interpolate(f, [0, 8], [0, 1], clamp), interpolate(f, [dur - 8, dur], [1, 0], clamp));
  const bx = 1250, by = 330, bw = 300, bh = 460;
  return (
    <AbsoluteFill style={{ background: C.ink, opacity: o }}>
      <AbsoluteFill style={{ opacity: 0.28 }}><DriftVideo src={p.bg} dur={dur} from={1.1} to={1.16} /></AbsoluteFill>
      <svg style={{ position: "absolute", inset: 0, width: 1920, height: 1080 }}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(242,239,230,0.18)" strokeWidth={70} />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.amber} strokeWidth={70} strokeDasharray={`${circ * ring} ${circ}`} transform={`rotate(-90 ${cx} ${cy})`} style={{ filter: `drop-shadow(0 0 18px ${C.amber}88)` }} />
        <g transform={`translate(${cx} ${cy}) rotate(${f * 4})`}>
          <circle r={110} fill="#1b1f2a" /><circle r={64} fill="#0B1530" /><circle r={30} fill="#9aa3b2" />
          {Array.from({ length: 16 }).map((_, i) => <rect key={i} x={-8} y={-118} width={16} height={18} fill="#2c3242" transform={`rotate(${i * 22.5})`} />)}
        </g>
        {/* tree + drip + beaker */}
        <rect x={bx + 90} y={70} width={120} height={230} fill="#7a5a3a" /><path d={`M${bx + 90},170 L${bx + 210},230`} stroke="#f2efe6" strokeWidth={6} />
        {Array.from({ length: 4 }).map((_, i) => { const d = ((f * 5 + i * 40) % 160); return <ellipse key={i} cx={bx + 150} cy={240 + d} rx={7} ry={10} fill="#f6f1e1" opacity={f > s(5.2) && fill < 0.53 ? 1 : 0} />; })}
        <rect x={bx} y={by} width={bw} height={bh} rx={18} fill="rgba(255,255,255,0.08)" stroke="white" strokeWidth={4} />
        <rect x={bx + 4} y={by + bh - bh * fill} width={bw - 8} height={bh * fill - 4} rx={14} fill="#f6f1e1" />
        {[0.25, 0.5, 0.75].map((q) => <line key={q} x1={bx} y1={by + bh * (1 - q)} x2={bx + 30} y2={by + bh * (1 - q)} stroke="white" strokeWidth={3} />)}
      </svg>
      <div style={{ position: "absolute", left: cx - 200, top: 150, width: 400, textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontSize: 24, color: C.tealBright, letterSpacing: 3 }}>WORLD NATURAL RUBBER</div>
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 110, color: C.amber, lineHeight: 1 }}>{Math.round(ring * 100)}%</div>
      </div>
      <div style={{ position: "absolute", left: bx - 40, top: by + bh + 30, width: bw + 80, textAlign: "center" }}>
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 100, color: C.paper, lineHeight: 1 }}>{Math.round(fill * 100)}%</div>
        <div style={{ fontFamily: MONO, fontSize: 24, color: C.tealBright, letterSpacing: 3 }}>OF WORLD LATEX EXPORTS</div>
      </div>
      <div style={{ position: "absolute", left: 120, top: 80, fontFamily: MONO, fontSize: 26, color: C.tealBright, letterSpacing: 4 }}>THAILAND · 2024</div>
      <Credit text="Sources: Krungsri Research; trade data via SEAsia (2024)" />
    </AbsoluteFill>
  );
};

// ── Viz 4 · The durian race (No. 7) ─────────────────────────────────────────
export const DurianRace: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const X0 = 360, W = 1300, pos = (pct: number) => X0 + (pct / 100) * W;
  const th = interpolate(f, [s(0.5), s(1.8)], [0, 68], { ...clamp, easing: Easing.out(Easing.cubic) });
  const vn23 = interpolate(f, [s(0.7), s(2.0)], [0, 33], { ...clamp, easing: Easing.out(Easing.cubic) });
  const sprint = interpolate(f, [s(3.0), s(4.6)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const vn = vn23 + (42.1 - 33) * sprint;
  const year = sprint > 0.02 ? "2024" : "2023";
  const lanes = [{ name: "Thailand", v: th, y: 430, col: C.amber, note: year === "2024" ? "still #1" : "" }, { name: "Vietnam", v: vn, y: 680, col: C.tealBright, note: "" }];
  const o = Math.min(interpolate(f, [0, 8], [0, 1], clamp), interpolate(f, [dur - 8, dur], [1, 0], clamp));
  const flip = spring({ frame: f - s(3.0), fps, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #0B1530, #14244a)", opacity: o }}>
      <div style={{ position: "absolute", left: 120, top: 90 }}>
        <div style={{ fontFamily: MONO, fontSize: 26, color: C.tealBright, letterSpacing: 4 }}>CHINA'S DURIAN IMPORTS · MARKET SHARE</div>
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 78, color: C.paper, marginTop: 8 }}>Vietnam is catching up</div>
      </div>
      <div style={{ position: "absolute", right: 120, top: 100, fontFamily: SERIF, fontWeight: 600, fontSize: 120, color: C.amber, transform: `rotateX(${(1 - Math.min(1, flip)) * 90}deg)` }}>{year}</div>
      <svg style={{ position: "absolute", inset: 0, width: 1920, height: 1080 }}>
        {lanes.map((l, i) => <g key={i}>
          <rect x={X0} y={l.y - 60} width={W} height={120} rx={60} fill="rgba(242,239,230,0.07)" />
          {[25, 50, 75].map((q) => <line key={q} x1={pos(q)} y1={l.y - 60} x2={pos(q)} y2={l.y + 60} stroke="rgba(242,239,230,0.15)" strokeDasharray="6 8" />)}
          <rect x={X0} y={l.y - 60} width={Math.max(0, pos(l.v) - X0)} height={120} rx={60} fill={l.col} opacity={0.32} />
          {i === 1 && sprint > 0 && sprint < 1 && [0, 1, 2].map((j) => <line key={j} x1={pos(l.v) - 120 - j * 30} y1={l.y - 30 + j * 30} x2={pos(l.v) - 60 - j * 30} y2={l.y - 30 + j * 30} stroke="white" strokeWidth={4} opacity={0.7} strokeLinecap="round" />)}
        </g>)}
        <line x1={pos(100)} y1={340} x2={pos(100)} y2={770} stroke="white" strokeWidth={4} strokeDasharray="14 10" />
      </svg>
      {lanes.map((l, i) => (
        <React.Fragment key={i}>
          <div style={{ position: "absolute", left: 120, top: l.y - 26, fontFamily: SANS, fontWeight: 700, fontSize: 44, color: C.paper }}>{l.name}</div>
          <div style={{ position: "absolute", left: pos(l.v), top: l.y + Math.sin(f / 3 + i) * 6, transform: "translate(-50%,-50%)" }}><Durian size={110} spin={Math.sin(f / 4 + i) * 12} /></div>
          <div style={{ position: "absolute", left: pos(l.v) + 70, top: l.y - 44, fontFamily: SERIF, fontWeight: 600, fontSize: 72, color: l.col }}>{Math.round(l.v)}%<span style={{ fontFamily: SANS, fontSize: 30, color: C.paper, marginLeft: 14 }}>{l.note}</span></div>
        </React.Fragment>
      ))}
      <Credit text="Sources: Bangkok Post · Tridge (China customs data) — Vietnam 33% (2023) → 42% (2024)" />
    </AbsoluteFill>
  );
};

// ── Outro: globe with clouds + logo pill (Malacca ending) ────────────────────
export const GlobeOutro: React.FC<{ dur: number; pillAt: number }> = ({ dur, pillAt }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - pillAt, fps, config: { damping: 13, stiffness: 140 } });
  const type = interpolate(f, [pillAt + 6, pillAt + 26], [0, 100], { ...clamp, easing: Easing.out(Easing.cubic) });
  const o = Math.min(interpolate(f, [0, 6], [0, 1], clamp), interpolate(f, [dur - 10, dur], [1, 0], clamp));
  return (
    <AbsoluteFill style={{ background: C.ink, opacity: o }}>
      <OffthreadVideo src={staticFile("globe_out.mp4")} muted style={{ width: "100%", height: "100%" }} />
      {f >= pillAt && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ marginTop: 160, display: "flex", alignItems: "center", gap: 22, background: "rgba(255,255,255,0.96)", borderRadius: 26, padding: "22px 44px",
            transform: `scale(${0.6 + 0.4 * pop})`, opacity: Math.min(1, pop * 1.5), boxShadow: "0 18px 50px rgba(0,0,0,.45)" }}>
            <Img src={staticFile("logo_mark.png")} style={{ height: 64 }} />
            <div style={{ overflow: "hidden", width: `${(type / 100) * 470}px`, whiteSpace: "nowrap" }}>
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 64, letterSpacing: -1, background: `linear-gradient(90deg, ${C.navy}, ${C.teal})`, WebkitBackgroundClip: "text", color: "transparent" }}>The Sundaland</span>
            </div>
          </div>
        </AbsoluteFill>
      )}
      <Credit text="Globe: NASA Blue Marble (public domain) · Clouds: Solar System Scope (CC BY 4.0)" />
    </AbsoluteFill>
  );
};
