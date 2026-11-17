import React from "react";
import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PROJ, COUNTRIES, RIVERS } from "./mapData";
import { C, SERIF, SANS, MONO, s, clamp, Cam, camScale, toScreen, useCam, Basemap, FlagSilhouette, TerritoryTint, RegionBorders, MapLabel, PinTick, DashLine, DriftVideo, Credit, LeftWash } from "./parts";
import { CountryPop } from "./fx";
import { H, KpiCard, Badge } from "./hud";

// ── Lake Toba-specific map effects, cold open and legend scene (2026-11-14) ──
const ll = (lon: number, lat: number): [number, number] => [(lon - PROJ.lon0) * PROJ.k * PROJ.sx, (PROJ.lat1 - lat) * PROJ.sx];
const KM = PROJ.sx / 111.2;                    // map units per km (north–south)
const eio = { ...clamp, easing: Easing.inOut(Easing.cubic) };
const view = (cam: Cam) => { const k = camScale(cam), vw = 1920 / k, vh = 1080 / k; return { k, vb: `${cam.cx - vw / 2} ${cam.cy - vh / 2} ${vw} ${vh}` }; };
const SvgMap: React.FC<{ cam: Cam; children: React.ReactNode; style?: React.CSSProperties }> = ({ cam, children, style }) => (
  <svg viewBox={view(cam).vb} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", ...style }}>{children}</svg>
);

/** Outline trace of any named shape in COUNTRIES (countries, island, lakes, provinces). */
export const ShapeOutline: React.FC<{ cam: Cam; name: string; at: number; dur: number; color?: string; width?: number; fill?: string; out?: number }> = ({ cam, name, at, dur, color = C.tealBright, width = 4, fill, out }) => {
  const f = useCurrentFrame();
  const c = (COUNTRIES as any)[name];
  if (!c || f < at) return null;
  const { k } = view(cam);
  const pr = interpolate(f, [at, at + dur], [0, 1], eio);
  const o = out != null ? interpolate(f, [out, out + 10], [1, 0], clamp) : 1;
  return (
    <SvgMap cam={cam} style={{ opacity: o }}>
      {fill && c.paths.map((d: string, i: number) => <path key={`f${i}`} d={d} fill={fill} opacity={pr * 0.5} />)}
      {c.paths.map((d: string, i: number) => <path key={i} d={d} pathLength={1} fill="none" stroke={color} strokeWidth={width / k} strokeDasharray="1" strokeDashoffset={1 - pr}
        strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${color})` }} />)}
    </SvgMap>
  );
};

/** A named shape re-drawn elsewhere at the same scale (e.g. Singapore beside Samosir for size). */
const Ghost: React.FC<{ cam: Cam; name: string; lon: number; lat: number; at: number; label?: string; out?: number }> = ({ cam, name, lon, lat, at, label, out }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const c = (COUNTRIES as any)[name];
  if (!c || f < at) return null;
  const { k } = view(cam);
  const [x, y] = ll(lon, lat);
  const pop = spring({ frame: f - at, fps, config: { damping: 12, stiffness: 140 } });
  const o = out != null ? interpolate(f, [out, out + 10], [1, 0], clamp) : 1;
  const P = toScreen(cam, x, y + (c.bbox[3] - c.cy) + 4);
  return (
    <>
      <SvgMap cam={cam} style={{ opacity: o * Math.min(1, pop * 1.4), filter: "drop-shadow(0 6px 10px rgba(0,0,0,.5))" }}>
        <g transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * pop}) translate(${-c.cx} ${-c.cy})`}>
          {c.paths.map((d: string, i: number) => <path key={i} d={d} fill="rgba(242,239,230,0.22)" stroke="white" strokeWidth={2.6 / k} strokeDasharray={`${8 / k} ${5 / k}`} strokeLinejoin="round" />)}
        </g>
      </SvgMap>
      {label && <div style={{ position: "absolute", left: P.x, top: P.y + 8, transform: "translateX(-50%)", opacity: o * pop, fontFamily: SANS, fontWeight: 700, fontStyle: "italic", fontSize: 30,
        color: "white", whiteSpace: "nowrap", textShadow: "0 2px 6px rgba(0,0,0,.8)" }}>{label}</div>}
    </>
  );
};

/** Survey line between two geo points with a label at the midpoint (amber → white tick). */
const Survey: React.FC<{ cam: Cam; a: [number, number]; b: [number, number]; at: number; tick: number; label?: string; lx?: number; ly?: number }> = ({ cam, a, b, at, tick, label, lx = 0, ly = -44 }) => {
  const f = useCurrentFrame();
  const A = toScreen(cam, ...ll(...a)), B = toScreen(cam, ...ll(...b));
  const o = interpolate(f, [tick, tick + 8], [0, 1], clamp);
  return (
    <>
      <DashLine a={A} b={B} drawAt={at} tickAt={tick} />
      {[A, B].map((q, i) => <PinTick key={i} x={q.x} y={q.y} at={tick} dot={false} rays={i === 0} />)}
      {label && <div style={{ position: "absolute", left: (A.x + B.x) / 2 + lx, top: (A.y + B.y) / 2 + ly, transform: "translate(-50%,-50%)", opacity: o,
        fontFamily: MONO, fontWeight: 600, fontSize: 30, color: C.amber, background: "rgba(11,21,48,0.72)", padding: "4px 12px", border: `1px solid ${C.amber}`, whiteSpace: "nowrap" }}>{label}</div>}
    </>
  );
};

/** Dashed ellipse (the caldera rim) drawing in. rx/ry in km, rot in screen degrees. */
const CalderaRing: React.FC<{ cam: Cam; c: [number, number]; rx: number; ry: number; rot: number; at: number; dur: number; label?: string }> = ({ cam, c, rx, ry, rot, at, dur, label }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const { k } = view(cam);
  const [x, y] = ll(...c);
  const pr = interpolate(f, [at, at + dur], [0, 1], eio);
  const lo = interpolate(f, [at + dur * 0.7, at + dur], [0, 1], clamp);
  const P = toScreen(cam, x, y - ry * KM * 1.25);
  return (
    <>
      <SvgMap cam={cam}>
        <g transform={`translate(${x} ${y}) rotate(${rot})`}>
          <ellipse rx={rx * KM} ry={ry * KM} fill={C.amber} opacity={0.10 * pr} />
          <ellipse rx={rx * KM} ry={ry * KM} pathLength={1} fill="none" stroke={C.amber} strokeWidth={5 / k} strokeDasharray="1" strokeDashoffset={1 - pr} style={{ filter: `drop-shadow(0 0 8px ${C.amber})` }} />
          <ellipse rx={rx * KM} ry={ry * KM} fill="none" stroke="white" strokeWidth={1.6 / k} strokeDasharray={`${10 / k} ${10 / k}`} opacity={pr * 0.7} />
        </g>
      </SvgMap>
      {label && <div style={{ position: "absolute", left: P.x + 120, top: P.y - 40, opacity: lo, fontFamily: SANS, fontWeight: 700, fontStyle: "italic", fontSize: 36, color: "white", whiteSpace: "nowrap",
        textShadow: "0 2px 8px rgba(0,0,0,.8)" }}>{label}</div>}
    </>
  );
};

/** Glowing river with water particles flowing downstream (RIVERS[name].pts, oriented source → mouth). */
const RiverFlow: React.FC<{ cam: Cam; name: string; at: number; dur: number }> = ({ cam, name, at, dur }) => {
  const f = useCurrentFrame();
  const r = (RIVERS as any)[name];
  if (!r || f < at) return null;
  const pts: number[][] = r.pts;
  const sp = pts.map(([x, y]) => toScreen(cam, x, y));
  const seg = sp.slice(1).map((q, i) => Math.hypot(q.x - sp[i].x, q.y - sp[i].y));
  const L = seg.reduce((a, b) => a + b, 0) || 1;
  const pr = interpolate(f, [at, at + dur], [0, 1], eio);
  const pos = (t: number) => { let rem = t * L; for (let i = 0; i < seg.length; i++) { if (rem <= seg[i]) { const u = rem / (seg[i] || 1); return { x: sp[i].x + (sp[i + 1].x - sp[i].x) * u, y: sp[i].y + (sp[i + 1].y - sp[i].y) * u }; } rem -= seg[i]; } return sp[sp.length - 1]; };
  const d = "M" + sp.map((q) => `${q.x},${q.y}`).join(" L");
  return (
    <svg style={{ position: "absolute", inset: 0, width: 1920, height: 1080, overflow: "visible" }}>
      <path d={d} fill="none" stroke="rgba(0,0,0,.5)" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={L} strokeDashoffset={L * (1 - pr)} transform="translate(2 3)" />
      <path d={d} fill="none" stroke="#7fe3ff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={L} strokeDashoffset={L * (1 - pr)} style={{ filter: "drop-shadow(0 0 10px #39d5ff)" }} />
      {Array.from({ length: 34 }).map((_, i) => { const t = ((f - at) * 0.006 + i / 34) % 1; if (t > pr) return null; const q = pos(t);
        return <circle key={i} cx={q.x} cy={q.y} r={4.5} fill="white" opacity={0.85} />; })}
    </svg>
  );
};

/** Short inflow arrows from the caldera rim toward the shore ("streams pour in from all sides"). */
const Inflows: React.FC<{ cam: Cam; c: [number, number]; at: number; n?: number }> = ({ cam, c, at, n = 12 }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const [cx, cy] = ll(...c);
  return (
    <svg style={{ position: "absolute", inset: 0, width: 1920, height: 1080, overflow: "visible" }}>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + 0.3, ex = 62 * KM, ey = 34 * KM, rot = (43 * Math.PI) / 180;
        const px = (r: number) => cx + Math.cos(a) * ex * r * Math.cos(rot) - Math.sin(a) * ey * r * Math.sin(rot);
        const py = (r: number) => cy + Math.cos(a) * ex * r * Math.sin(rot) + Math.sin(a) * ey * r * Math.cos(rot);
        const p = interpolate(f, [at + i * 2, at + i * 2 + 18], [0, 1], eio);
        const A = toScreen(cam, px(1.25), py(1.25)), B = toScreen(cam, px(1.25 - 0.4 * p), py(1.25 - 0.4 * p));
        return <g key={i} opacity={p}><line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#7fe3ff" strokeWidth={4} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px #39d5ff)" }} />
          <circle cx={B.x} cy={B.y} r={6} fill="white" /></g>;
      })}
    </svg>
  );
};

/** Volcanic ash plume spreading from Toba: trails of soft grey puffs drifting west/north-west (Indian Ocean, India) and north-east (Malaya). */
const AshPlume: React.FC<{ cam: Cam; at: number; dur: number; reach?: number }> = ({ cam, at, dur, reach = 1 }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const { k } = view(cam);
  const g = interpolate(f, [at, at + dur], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) * reach;
  const T: [number, number] = [98.85, 2.6];
  const trails: [number, number, number][] = [[78, 19, 1.0], [84, 8, 0.9], [90, 14, 0.8], [93, 2, 0.6], [101.2, 5.6, 0.75], [98.5, 9, 0.6], [104, 1, 0.45]];
  return (
    <SvgMap cam={cam}>
      <defs><filter id="ashblur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={Math.max(1.5, 18 / k)} /></filter></defs>
      <g filter="url(#ashblur)">
        {trails.flatMap(([lon, lat, w], ti) => Array.from({ length: 14 }).map((_, j) => {
          const u = (j + 1) / 14; if (u > g) return null;
          const jit = (random(`a${ti}${j}`) - 0.5) * 2.2, jit2 = (random(`b${ti}${j}`) - 0.5) * 2.2;
          const [x, y] = ll(T[0] + (lon - T[0]) * u + jit * u, T[1] + (lat - T[1]) * u + jit2 * u);
          const r = (40 + 260 * u) * KM * (0.7 + 0.6 * random(`r${ti}${j}`));
          return <circle key={`${ti}-${j}`} cx={x} cy={y} r={r} fill="#b9bcc3" opacity={0.16 * w * (1.15 - u * 0.5)} />;
        }))}
        <circle cx={ll(...T)[0]} cy={ll(...T)[1]} r={60 * KM * Math.min(1, g * 3)} fill="#c9ccd2" opacity={0.35} />
      </g>
    </SvgMap>
  );
};

/** Land patch covering the Tano Ponggol canal until the "cut" moment, then it splits open. */
const Isthmus: React.FC<{ cam: Cam; lon: number; lat: number; cut: number; r?: number }> = ({ cam, lon, lat, cut, r = 1.1 }) => {
  const f = useCurrentFrame();
  const [x, y] = ll(lon, lat);
  const open = interpolate(f, [cut, cut + 14], [0, 1], eio);
  if (open >= 1) return null;
  const { k } = view(cam);
  return (
    <SvgMap cam={cam}>
      <defs><filter id="isb"><feGaussianBlur stdDeviation={2.2 / k} /></filter></defs>
      {[-1, 1].map((side) => (
        <ellipse key={side} cx={x + side * open * r * KM * 0.6} cy={y - side * open * r * KM * 0.4} rx={r * KM * (1 - open * 0.5)} ry={r * KM * 0.55 * (1 - open * 0.5)} transform={`rotate(-40 ${x} ${y})`}
          fill="#5b6b3a" stroke="#c7b98a" strokeWidth={1.2 / k} filter="url(#isb)" opacity={1 - open} />
      ))}
    </SvgMap>
  );
};

/** Clouds over the Sumatran interior (coast stays visible); a hole opens around Toba at `open`. */
const InteriorFog: React.FC<{ cam: Cam; at: number; open: number; dur?: number }> = ({ cam, at, open, dur = 30 }) => {
  const f = useCurrentFrame();
  const c = (COUNTRIES as any)["Sumatra"];
  if (!c) return null;
  const { k, vb } = view(cam);
  const fogIn = interpolate(f, [at, at + 10], [0, 1], clamp);
  const hole = interpolate(f, [open, open + dur], [0, 1], eio);
  const [tx, ty] = ll(98.85, 2.6);
  const parts = vb.split(" ").map(Number);
  return (
    <svg viewBox={vb} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: fogIn }}>
      <defs>
        <clipPath id="sum">{c.paths.map((d: string, i: number) => <path key={i} d={d} transform={`translate(${c.cx} ${c.cy}) scale(0.985) translate(${-c.cx} ${-c.cy})`} />)}</clipPath>
        <filter id="cloud" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency={0.9 / (120 * Math.max(0.3, 1 / Math.sqrt(k)))} numOctaves={4} seed={7} />
          <feColorMatrix values="0 0 0 0 0.86  0 0 0 0 0.89  0 0 0 0 0.93  0 0 0 1.6 -0.35" /></filter>
        <radialGradient id="hole" cx={tx} cy={ty} r={140 * KM * hole + 1} gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="black" /><stop offset="70%" stopColor="black" /><stop offset="100%" stopColor="white" /></radialGradient>
        <mask id="hm"><rect x={parts[0]} y={parts[1]} width={parts[2]} height={parts[3]} fill="white" /><circle cx={tx} cy={ty} r={140 * KM * hole + 1} fill="url(#hole)" /></mask>
      </defs>
      <g clipPath="url(#sum)" mask="url(#hm)">
        <rect x={parts[0]} y={parts[1]} width={parts[2]} height={parts[3]} fill="#d7dde6" opacity={0.55} />
        <rect x={parts[0]} y={parts[1]} width={parts[2]} height={parts[3]} filter="url(#cloud)" />
      </g>
    </svg>
  );
};

/** Small passenger ferry (oblique slices, same language as Ship3D) riding a route. */
const Ferry: React.FC<{ cam: Cam; pts: [number, number][]; at: number; dur: number; color?: string }> = ({ cam, pts, at, dur, color = "#F2A33A" }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const u = pts.map(([lo, la]) => ll(lo, la)).map(([x, y]) => toScreen(cam, x, y));
  const seg = u.slice(1).map((q, i) => Math.hypot(q.x - u[i].x, q.y - u[i].y));
  const L = seg.reduce((a, b) => a + b, 0) || 1;
  const p = interpolate(f, [at, at + dur], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const pos = (t: number) => { let rem = Math.max(0, Math.min(1, t)) * L; for (let i = 0; i < seg.length; i++) { if (rem <= seg[i] || i === seg.length - 1) { const v = Math.min(1, rem / (seg[i] || 1)); return { x: u[i].x + (u[i + 1].x - u[i].x) * v, y: u[i].y + (u[i + 1].y - u[i].y) * v }; } rem -= seg[i]; } return u[u.length - 1]; };
  const H0 = pos(p), A = pos(p + 0.01), B = pos(p - 0.01);
  const deg = (Math.atan2(A.y - B.y, A.x - B.x) * 180) / Math.PI;
  const d = "M" + u.map((q) => `${q.x},${q.y}`).join(" L");
  const at3 = (z: number) => `translate(${H0.x} ${H0.y - z}) scale(1 0.62) rotate(${deg})`;
  const hull = "M-30,-9 L18,-9 C26,-9 32,-4 34,0 C32,4 26,9 18,9 L-30,9 Z";
  return (
    <svg style={{ position: "absolute", inset: 0, width: 1920, height: 1080, overflow: "visible" }}>
      <path d={d} fill="none" stroke={color} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={L} strokeDashoffset={L * (1 - Math.max(0, p - 0.02))} opacity={0.95} />
      <g transform={`translate(8 6)`}><g transform={at3(0)}><path d={hull} fill="rgba(0,0,0,.45)" /></g></g>
      {Array.from({ length: 10 }).map((_, j) => <g key={j} transform={at3(j * 0.8)}><path d={hull} fill={j < 4 ? "#1d3557" : "#f4f6fa"} /></g>)}
      <g transform={at3(8)}><path d={hull} fill="#ffffff" stroke="#9aa6ba" strokeWidth={0.6} /><rect x={-22} y={-6} width={30} height={12} rx={2} fill="#2a3f66" /><rect x={-20} y={-4} width={26} height={2.4} fill="#7fd1ff" /></g>
    </svg>
  );
};

/** Dispatcher used by MapScene for p.fx (geo items resolved in scene-local seconds). */
export const TobaMapFX: React.FC<{ cam: Cam; fx: any[] }> = ({ cam, fx }) => (
  <>
    {fx.map((q, i) => {
      switch (q.k) {
        case "outline": return <ShapeOutline key={i} cam={cam} name={q.name} at={s(q.at)} dur={s(q.dur ?? 1.2)} color={q.color === "amber" ? C.amber : q.color ?? C.tealBright} fill={q.fill} out={q.out != null ? s(q.out) : undefined} />;
        case "ghost": return <Ghost key={i} cam={cam} name={q.name} lon={q.lon} lat={q.lat} at={s(q.at)} label={q.label} out={q.out != null ? s(q.out) : undefined} />;
        case "survey": return <Survey key={i} cam={cam} a={q.a} b={q.b} at={s(q.at)} tick={s(q.tick ?? q.at + 0.8)} label={q.label} lx={q.lx} ly={q.ly} />;
        case "ring": return <CalderaRing key={i} cam={cam} c={q.c} rx={q.rx} ry={q.ry} rot={q.rot ?? 43} at={s(q.at)} dur={s(q.dur ?? 1.2)} label={q.label} />;
        case "river": return <RiverFlow key={i} cam={cam} name={q.name} at={s(q.at)} dur={s(q.dur ?? 2.0)} />;
        case "inflows": return <Inflows key={i} cam={cam} c={q.c ?? [98.85, 2.6]} at={s(q.at)} />;
        case "ash": return <AshPlume key={i} cam={cam} at={s(q.at)} dur={s(q.dur ?? 3)} reach={q.reach ?? 1} />;
        case "isthmus": return <Isthmus key={i} cam={cam} lon={q.lon} lat={q.lat} cut={s(q.cut)} r={q.r ?? 1.1} />;
        case "fog": return <InteriorFog key={i} cam={cam} at={s(q.at ?? 0)} open={s(q.open)} dur={s(q.dur ?? 1.2)} />;
        case "ferry": return <Ferry key={i} cam={cam} pts={q.pts} at={s(q.at)} dur={s(q.dur ?? 3)} color={q.color} />;
        default: return null;
      }
    })}
  </>
);

// ── Cold open: aerial → globe → Sumatra → Samosir (+ Singapore for scale) → lake → caldera ──
const GLOBE_AT = s(0.95), GLOBE_LEN = 48;
export const TobaColdOpen: React.FC<{ dur: number; p?: any }> = ({ dur, p = {} }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [t2, t3] = (p.t ?? [4.49, 6.16]) as number[];
  const G = ll(99.0, 1.2), T = ll(98.6, 2.58), W = ll(98.7, 2.62);
  const cam = useCam([
    [s(2.45), G[0], G[1], 14 * PROJ.sx],
    [s(3.0), G[0], G[1], 13.5 * PROJ.sx],
    [s(3.75), T[0], T[1], 1.25 * PROJ.sx],
    [s(t3), T[0] + 3, T[1], 1.2 * PROJ.sx],
    [s(t3 + 1.0), W[0], W[1], 2.3 * PROJ.sx],
    [dur, W[0] - 2, W[1], 2.2 * PROJ.sx],
  ]);
  const whip = interpolate(f, [s(0.9), s(1.15)], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const footO = interpolate(f, [s(0.9), s(1.12)], [1, 0], clamp);
  const globeIn = interpolate(f, [GLOBE_AT, GLOBE_AT + 5], [0, 1], clamp);
  const globeBlurIn = interpolate(f, [GLOBE_AT, GLOBE_AT + 8], [14, 0], clamp);
  const globeOut = interpolate(f, [s(2.35), s(2.55)], [1, 0], clamp);
  const mapBlur = interpolate(f, [s(2.35), s(2.6)], [6, 0], clamp) + interpolate(f, [s(3.0), s(3.35), s(3.75)], [0, 8, 0], clamp) + interpolate(f, [s(t3), s(t3 + 0.5), s(t3 + 1.0)], [0, 4, 0], clamp);
  const pop = spring({ frame: f - s(2.7), fps, config: { damping: 11, stiffness: 140 } });
  const flagFade = interpolate(f, [s(3.2), s(3.6)], [1, 0], clamp);
  const k1 = interpolate(f, [s(t3 - 0.2), s(t3 + 0.2)], [1, 0], clamp);
  const out = interpolate(f, [dur - 8, dur], [1, 0], clamp);
  const fx = [
    { k: "ghost", name: "Singapore", lon: 99.32, lat: 2.98, at: 3.95, label: "Singapore · same scale", out: t3 - 0.2 },
    { k: "survey", a: [98.66, 2.72], b: [98.98, 2.47], at: 3.9, tick: 4.35, label: "SAMOSIR", ly: -10 },
    { k: "outline", name: "Lake Toba", at: t2 + 0.05, dur: 1.2, color: "#7fe3ff" },
    { k: "ring", c: [98.84, 2.61], rx: 58, ry: 22, rot: 43, at: t3 + 0.9, dur: 1.4, label: "SUPERVOLCANO CALDERA" },
  ];
  const D = toScreen(cam, ...ll(98.88, 2.85));
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Basemap cam={cam} blur={mapBlur} />
      <RegionBorders cam={cam} names={["Indonesia", "Malaysia", "Singapore"]} o={interpolate(f, [s(2.6), s(3.2)], [0, 0.8], clamp) * interpolate(f, [s(3.4), s(3.8)], [1, 0], clamp)} />
      <TerritoryTint cam={cam} country="Indonesia" o={interpolate(f, [s(3.1), s(3.5)], [0, 1], clamp) * interpolate(f, [s(3.6), s(3.9)], [1, 0], clamp)} />
      <FlagSilhouette cam={cam} country="Indonesia" pop={pop} fade={flagFade} boost={1.2} />
      <CountryPop cam={cam} name="Samosir" color={C.amber} at={s(3.6)} settle={0.75} solid />
      <TobaMapFX cam={cam} fx={fx} />
      {f >= s(t2 + 0.6) && f < s(t3 + 0.2) && <div style={{ position: "absolute", left: D.x, top: D.y, transform: "translate(-50%,-50%)", opacity: interpolate(f, [s(t2 + 0.6), s(t2 + 0.9)], [0, 1], clamp) * k1,
        fontFamily: SANS, fontWeight: 700, fontStyle: "italic", fontSize: 40, color: "#bff2ff", textShadow: "0 2px 8px rgba(0,0,0,.8)" }}>Lake Toba</div>}
      <LeftWash strength={0.7} />
      <div style={{ position: "absolute", inset: 0, opacity: k1 }}>
        <KpiCard x={120} y={300} w={720} label="Samosir island" value={630} prefix="≈ " suffix=" km²" sub="Singapore ≈ 735 km²" at={s(4.2)} big={110} />
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - k1 }}>
        <KpiCard x={120} y={260} w={760} label="The crater it sits in" text="≈ 74,000 yrs" sub="biggest eruption of the last ≈2 million years" at={s(t3 + 1.8)} color={H.amber} big={100} />
      </div>
      <Sequence from={GLOBE_AT} durationInFrames={GLOBE_LEN} premountFor={30}>
        <AbsoluteFill style={{ opacity: globeIn * globeOut, filter: globeBlurIn > 0.2 ? `blur(${globeBlurIn}px)` : undefined }}>
          <OffthreadVideo src={staticFile("globe_in.mp4")} muted style={{ width: "100%", height: "100%" }} />
        </AbsoluteFill>
      </Sequence>
      <AbsoluteFill style={{ opacity: footO, filter: `blur(${whip * 18}px)`, transform: `scale(${1 + whip * 0.3})` }}>
        <DriftVideo src="footage/s00_aerial.mp4" dur={s(1.2)} />
      </AbsoluteFill>
      <Credit text={p.credit ?? "Globe & basemap: NASA Blue Marble / ASTER GDEM (public domain) · Boundaries: geoBoundaries (CC BY 4.0) · OpenStreetMap (ODbL)"} />
    </AbsoluteFill>
  );
};

// ── #9 The legend, as paper-cut silhouettes over a dusk lake ─────────────────
const Cut: React.FC<{ d: string; x: number; y: number; s?: number; o: number; fill?: string }> = ({ d, x, y, s: sc = 1, o, fill = "#0b1530" }) => (
  <svg style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, overflow: "visible", opacity: o }}>
    <g transform={`translate(${x} ${y}) scale(${sc})`} style={{ filter: "drop-shadow(0 6px 10px rgba(0,0,0,.45))" }}><path d={d} fill={fill} /></g>
  </svg>
);
const FISHERMAN = "M-60,40 L60,40 L48,58 L-48,58 Z M-6,40 L-6,-30 L4,-30 L4,40 Z M-16,-30 a10,10 0 1,0 20,0 a10,10 0 1,0 -20,0 Z M4,-20 L70,-70 L72,-66 L8,-14 Z M70,-70 L70,10 L72,10 L72,-70 Z";
const FISH = "M-50,0 C-30,-26 20,-26 40,-4 L60,-22 L56,0 L60,22 L40,4 C20,26 -30,26 -50,0 Z";
const WOMAN = "M0,-118 a16,16 0 1,0 0.1,0 Z M-14,-96 L14,-96 L30,40 L-30,40 Z";
const BOY = "M0,-64 a11,11 0 1,0 0.1,0 Z M-9,-50 L9,-50 L15,10 L-15,10 Z";
export const LegendScene: React.FC<{ dur: number; p: any }> = ({ dur, p }) => {
  const f = useCurrentFrame();
  const [b1, b2, b3, b4] = ((p.t ?? [0.3, 3.0, 6.0, 8.0]) as number[]).map(s);
  const o = (a: number, b?: number) => interpolate(f, [a, a + 10], [0, 1], clamp) * (b != null ? interpolate(f, [b, b + 10], [1, 0], clamp) : 1);
  const flood = interpolate(f, [b3, b3 + s(2.2)], [0, 1], eio);
  const morph = interpolate(f, [b2 - 4, b2 + 10], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: Math.min(interpolate(f, [0, 6], [0, 1], clamp), interpolate(f, [dur - 6, dur], [1, 0], clamp)) }}>
      <DriftVideo src={p.src} dur={dur} from={1.04} to={1.1} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(233,162,59,0.30), rgba(11,21,48,0.55))", mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: "rgba(11,21,48,0.25)" }} />
      <Cut d={FISHERMAN} x={760} y={690} s={1.6} o={o(b1, b4)} />
      <Cut d={FISH} x={1060} y={760} s={1.0} o={o(b1 + 8) * (1 - morph)} fill="#E9A23B" />
      <Cut d={WOMAN} x={1080} y={760} s={1.5} o={o(b2) * morph * (1 - flood)} />
      <Cut d={BOY} x={1220} y={760} s={1.5} o={o(b2 + 20) * (1 - flood * 0.3)} fill={flood > 0.6 ? "#E9A23B" : "#0b1530"} />
      {flood > 0 && <svg style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080 }}>
        <defs><linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7fe3ff" stopOpacity={0.5} /><stop offset="100%" stopColor="#0b1530" stopOpacity={0.75} /></linearGradient></defs>
        {(() => { const top = 1080 - 1080 * 0.62 * flood; const pts = Array.from({ length: 49 }).map((_, i) => `${i * 40},${top + Math.sin(i * 0.7 + f * 0.18) * 9}`).join(" L");
          return <><path d={`M0,1080 L${pts} L1920,1080 Z`} fill="url(#fl)" /><path d={`M${pts}`} fill="none" stroke="rgba(191,242,255,0.85)" strokeWidth={3} /></>; })()}
      </svg>}
      {f >= b3 + s(1.5) && <div style={{ position: "absolute", left: 1220, top: 1080 - 1080 * 0.62 * flood - 70, transform: "translateX(-50%)", fontFamily: SANS, fontWeight: 700, fontStyle: "italic", fontSize: 40, color: "white",
        opacity: interpolate(f, [b3 + s(1.5), b3 + s(1.9)], [0, 1], clamp), textShadow: "0 2px 8px rgba(0,0,0,.8)" }}>Samosir</div>}
      <div style={{ position: "absolute", left: 120, top: 120, fontFamily: MONO, fontSize: 24, color: C.tealBright, letterSpacing: 4, opacity: o(b1) }}>A TOBA BATAK LEGEND · RETOLD</div>
      {b4 < dur && <div style={{ position: "absolute", left: 120, bottom: 128, opacity: o(b4), display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 6, height: 44, background: `linear-gradient(180deg, ${C.tealBright}, ${C.navy})` }} />
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 38, color: C.paper, textShadow: "0 2px 12px rgba(0,0,0,.7)" }}>A legend, not a memory</div>
      </div>}
      <Credit text={p.credit ?? ""} />
    </AbsoluteFill>
  );
};
