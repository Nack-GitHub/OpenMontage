import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadOrbitron } from "@remotion/google-fonts/Orbitron";
import { loadFont as loadRajdhani } from "@remotion/google-fonts/Rajdhani";

// ── HUD dashboard language (user direction 2026-11-12: "smart park monitoring" style) ──
// Glass panels with cut corners + glowing cyan edges, skewed digital numerals, multi-segment glow rings,
// gradient glow bars with line overlays, translucent data tables, holographic icon pedestals, circuit-grid floor.

export const { fontFamily: DIGI } = loadOrbitron("normal", { weights: ["500", "700", "900"], subsets: ["latin"] });
export const { fontFamily: HUDT } = loadRajdhani("normal", { weights: ["500", "600", "700"], subsets: ["latin"] });

export const H = {
  bg0: "#020b1f", bg1: "#04173a", line: "#0d3b78",
  cyan: "#39d5ff", blue: "#1e8bff", ice: "#e8f6ff", dim: "#7fa8d6",
  amber: "#ffb347", red: "#ff4d6a", teal: "#2ee6c5", violet: "#8f7bff", green: "#7be08a",
};
const FPS = 30;
const S = (sec: number) => Math.round(sec * FPS);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const eio = { ...cl, easing: Easing.inOut(Easing.cubic) };
const eout = { ...cl, easing: Easing.out(Easing.cubic) };
export const glow = (c: string, r = 10) => `drop-shadow(0 0 ${r}px ${c})`;

/** Deep-navy stage: perspective circuit floor, drifting particles, scanlines, slow light sweep. */
export const HudBackground: React.FC<{ dur: number; children?: React.ReactNode; tint?: number }> = ({ dur, children, tint = 1 }) => {
  const f = useCurrentFrame();
  const sweep = ((f % 150) / 150) * 2400 - 400;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 35%, ${H.bg1} 0%, ${H.bg0} 72%)`, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -400, right: -400, top: 560, height: 900, transform: "perspective(900px) rotateX(64deg)", transformOrigin: "50% 0%", opacity: 0.55 * tint,
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 35%, black 80%, transparent 100%)", maskImage: "linear-gradient(to bottom, transparent 0%, black 35%, black 80%, transparent 100%)" }}>
        <svg width="100%" height="100%" viewBox="0 0 2720 900" preserveAspectRatio="none">
          {Array.from({ length: 35 }).map((_, i) => <line key={`v${i}`} x1={i * 80} y1={0} x2={i * 80} y2={900} stroke={H.line} strokeWidth={2} />)}
          {Array.from({ length: 12 }).map((_, i) => <line key={`h${i}`} x1={0} y1={i * 80} x2={2720} y2={i * 80} stroke={H.line} strokeWidth={2} />)}
          {Array.from({ length: 22 }).map((_, i) => {
            const x = 60 + random(`cx${i}`) * 2600, y = random(`cy${i}`) * 860, w = 80 + random(`cw${i}`) * 260;
            return <path key={`c${i}`} d={`M${x},${y} h${w} l40,40 h${w * 0.5}`} fill="none" stroke={H.cyan} strokeWidth={2} opacity={0.35 + 0.35 * Math.sin(f * 0.08 + i)} />;
          })}
        </svg>
      </div>
      {Array.from({ length: 40 }).map((_, i) => {
        const x = random(`px${i}`) * 1920, y = (random(`py${i}`) * 1080 - f * (0.3 + random(`ps${i}`) * 0.6) + 1080 * 4) % 1080;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 3, height: 3, borderRadius: 2, background: H.cyan, opacity: 0.25 + 0.3 * random(`po${i}`), boxShadow: `0 0 6px ${H.cyan}` }} />;
      })}
      <div style={{ position: "absolute", top: 0, bottom: 0, left: sweep, width: 260, background: "linear-gradient(90deg, rgba(57,213,255,0) 0%, rgba(57,213,255,0.06) 50%, rgba(57,213,255,0) 100%)" }} />
      <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 4px)" }} />
      <AbsoluteFill style={{ boxShadow: "inset 0 0 220px rgba(0,0,0,0.75)" }} />
      {children}
    </AbsoluteFill>
  );
};

/** Top bar like the reference header: title in spaced tech type + angled underline + live clock-style tag. */
export const HudHeader: React.FC<{ title: string; tag?: string; at?: number }> = ({ title, tag, at = 0 }) => {
  const f = useCurrentFrame();
  const w = interpolate(f, [at, at + 18], [0, 1], eio);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 110 }}>
      <svg width={1920} height={110} style={{ position: "absolute" }}>
        <path d={`M40,78 L${40 + 820 * w},78 L${80 + 820 * w},44 L${1880},44`} fill="none" stroke={H.blue} strokeWidth={2} opacity={0.8} style={{ filter: glow(H.blue, 6) }} />
        <path d={`M40,86 L${40 + 300 * w},86`} stroke={H.cyan} strokeWidth={5} style={{ filter: glow(H.cyan, 8) }} />
      </svg>
      <div style={{ position: "absolute", left: 56, top: 22, fontFamily: DIGI, fontWeight: 700, fontSize: 34, letterSpacing: 7, color: H.ice, opacity: w,
        transform: "skewX(-10deg)", textShadow: `0 0 14px ${H.blue}` }}>{title}</div>
      {tag && <div style={{ position: "absolute", right: 60, top: 10, fontFamily: DIGI, fontWeight: 500, fontSize: 26, color: H.cyan, letterSpacing: 3, opacity: w,
        textShadow: `0 0 10px ${H.cyan}` }}>{tag}</div>}
    </div>
  );
};

/** Glass panel: cut corners, glowing edge, header strip with title, corner brackets; unfolds at `at`. */
export const Panel: React.FC<{ x: number; y: number; w: number; h: number; title?: string; at?: number; accent?: string; children?: React.ReactNode }> = ({ x, y, w, h, title, at = 0, accent = H.cyan, children }) => {
  const f = useCurrentFrame();
  const open = interpolate(f, [at, at + 14], [0, 1], eio);
  const fade = interpolate(f, [at + 6, at + 16], [0, 1], cl);
  const c = 22;
  const poly = `0,0 ${w - c},0 ${w},${c} ${w},${h} ${c},${h} 0,${h - c}`;
  if (f < at) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: open < 1 ? `scaleY(${0.04 + 0.96 * open})` : undefined, transformOrigin: "50% 0%" }}>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id={`pg${x}${y}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0c2a5a" stopOpacity={0.78} /><stop offset="100%" stopColor="#051634" stopOpacity={0.62} /></linearGradient>
          <linearGradient id={`hg${x}${y}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={H.blue} stopOpacity={0.55} /><stop offset="70%" stopColor={H.blue} stopOpacity={0.12} /><stop offset="100%" stopColor={H.blue} stopOpacity={0} /></linearGradient>
        </defs>
        <polygon points={poly} fill={`url(#pg${x}${y})`} stroke={accent} strokeOpacity={0.35} strokeWidth={1} />
        {title && <rect x={2} y={2} width={w * 0.45} height={52} fill={`url(#hg${x}${y})`} opacity={0.6} />}
        {title && <path d={`M14,54 L${w * 0.42},54 L${w * 0.42 + 18},40 L${w - 40},40`} fill="none" stroke={accent} strokeOpacity={0.7} strokeWidth={1.2} />}
        {title && <line x1={w - 56} y1={22} x2={w - 36} y2={22} stroke={H.ice} strokeWidth={2} />}
        <rect x={-6} y={-6} width={5} height={5} fill={accent} />
        {[[0, 0, 1, 1], [w, h, -1, -1]].map(([px, py, sx, sy], i) => (
          <path key={i} d={`M${px},${py + sy * 26} L${px},${py} L${px + sx * 26},${py}`} fill="none" stroke={accent} strokeWidth={2.5} style={{ filter: glow(accent, 5) }} />
        ))}
        <path d={`M${w - c - 70},2 L${w - c - 10},2`} stroke={accent} strokeWidth={4} style={{ filter: glow(accent, 6) }} />
      </svg>
      {title && <div style={{ position: "absolute", left: 22, top: 10, fontFamily: HUDT, fontWeight: 500, fontSize: 30, color: H.ice, letterSpacing: 1.5, opacity: fade }}>{title}</div>}
      <div style={{ position: "absolute", inset: 0, opacity: fade }}>{children}</div>
    </div>
  );
};

/** Skewed digital numerals that count up and glow. */
export const Digits: React.FC<{ value: number; at?: number; dur?: number; decimals?: number; prefix?: string; suffix?: string; size?: number; color?: string; from?: number; style?: React.CSSProperties; fixed?: string }> = ({
  value, at = 0, dur = 24, decimals = 0, prefix = "", suffix = "", size = 72, color = H.ice, from = 0, style, fixed,
}) => {
  const year = decimals === 0 && value >= 1900 && value <= 2100 && from >= 1900;
  const f = useCurrentFrame();
  const v = interpolate(f, [at, at + dur], [from, value], eout);
  const o = interpolate(f, [at - 4, at + 4], [0, 1], cl);
  const txt = fixed ?? `${prefix}${year ? String(Math.round(v)) : v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
  // fixed-width digit cells: counting numbers never shift sideways (no jitter)
  const cells = Array.from(txt).map((ch, i) => {
    const w = /[0-9]/.test(ch) ? "0.8em" : /[.,]/.test(ch) ? "0.34em" : ch === " " ? "0.32em" : undefined;
    return <span key={i} style={{ display: "inline-block", width: w, textAlign: "center" }}>{ch === " " ? " " : ch}</span>;
  });
  return <span style={{ display: "inline-block", fontFamily: DIGI, fontWeight: 500, fontSize: size, color, opacity: o, transform: "skewX(-9deg)",
    textShadow: `0 0 ${size * 0.18}px ${color}, 0 0 ${size * 0.45}px rgba(30,139,255,0.55)`, whiteSpace: "nowrap", lineHeight: 1, ...style }}>{cells}</span>;
};

export const Label: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties; caps?: boolean }> = ({ children, size = 28, color = H.ice, style, caps }) => (
  <div style={{ fontFamily: HUDT, fontWeight: 600, fontSize: size, color, letterSpacing: caps ? 3 : 0.5, textTransform: caps ? "uppercase" : undefined, lineHeight: 1.15, ...style }}>{children}</div>
);

const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${x0},${y0} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1},${y1}`;
};

/** Multi-segment glow ring (donut) with rotating tick halo; values in % of a full turn (laps > 100 wrap). */
export const Ring: React.FC<{ cx: number; cy: number; r: number; segs: { v: number; color: string }[]; at?: number; dur?: number; width?: number; children?: React.ReactNode; track?: boolean; gap?: number }> = ({
  cx, cy, r, segs, at = 0, dur = 30, width = 14, children, track = true, gap = 0.014,
}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [0, 1], eio);
  const o = interpolate(f, [at - 2, at + 8], [0, 1], cl);
  let acc = 0;
  const total = segs.reduce((a, s) => a + s.v, 0);
  return (
    <div style={{ position: "absolute", left: cx - r - 60, top: cy - r - 60, width: 2 * r + 120, height: 2 * r + 120, opacity: o }}>
      <svg width={2 * r + 120} height={2 * r + 120} style={{ overflow: "visible" }}>
        <g transform={`translate(${r + 60} ${r + 60})`}>
          <circle r={r + 34} fill="none" stroke={H.cyan} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="3 9" transform={`rotate(${f * 0.6})`} />
          <circle r={r + 22} fill="none" stroke={H.blue} strokeOpacity={0.5} strokeWidth={1.5} />
          <circle r={r - width / 2 - 14} fill="none" stroke={H.blue} strokeOpacity={0.6} strokeWidth={3} />
          <circle r={r - width / 2 - 24} fill="rgba(30,139,255,0.08)" />
          {track && <circle r={r} fill="none" stroke="rgba(57,213,255,0.10)" strokeWidth={width} />}
          {segs.map((s, i) => {
            const frac = (s.v / 100) * p;
            const a0 = -Math.PI / 2 + acc * 2 * Math.PI + (i ? gap * Math.PI : 0);
            const a1 = -Math.PI / 2 + (acc + frac) * 2 * Math.PI - gap * Math.PI;
            acc += frac;
            if (a1 - a0 <= 0.001) return null;
            const laps: React.ReactNode[] = [];
            let s0 = a0;
            while (a1 - s0 > 1e-3) { const e = Math.min(a1, s0 + Math.PI * 1.98); laps.push(<path key={s0} d={arc(0, 0, r, s0, e)} fill="none" stroke={s.color} strokeWidth={width} strokeLinecap="butt" />); s0 = e; }
            return <g key={i} style={{ filter: glow(s.color, 9) }}>{laps}</g>;
          })}
          {total > 100 && <circle r={r - width / 2 - 6} fill="none" stroke={segs[segs.length - 1].color} strokeWidth={6} strokeOpacity={0.8 * p} strokeDasharray={`${2 * Math.PI * (r - width / 2 - 6) * ((total - 100) / 100) * p} 9999`} transform="rotate(-90)" />}
        </g>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </div>
  );
};

/** Glow bars on a grid with optional line overlay (the reference's "Daily Park Flow"). */
export const BarChart: React.FC<{ x: number; y: number; w: number; h: number; data: { label: string; v: number; color?: string; tag?: string }[]; max: number; at?: number; ticks?: number[]; unit?: string; line?: number[]; lineColor?: string; barW?: number }> = ({
  x, y, w, h, data, max, at = 0, ticks = [], unit = "", line, lineColor = H.cyan, barW = 16,
}) => {
  const f = useCurrentFrame();
  const n = data.length, step = w / n;
  const lp = interpolate(f, [at + 10, at + 40], [0, 1], eio);
  const pts = line?.map((v, i) => [step * (i + 0.5), h - (v / max) * h]) ?? [];
  const d = pts.map((q, i) => `${i ? "L" : "M"}${q[0]},${q[1]}`).join(" ");
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h + 50 }}>
      <svg width={w} height={h + 50} style={{ overflow: "visible" }}>
        <defs><linearGradient id={`bg${x}${y}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#bfe9ff" /><stop offset="35%" stopColor={H.cyan} stopOpacity={0.85} /><stop offset="100%" stopColor={H.blue} stopOpacity={0.05} /></linearGradient></defs>
        {ticks.map((t) => <g key={t}><line x1={0} x2={w} y1={h - (t / max) * h} y2={h - (t / max) * h} stroke={H.line} strokeWidth={1.2} />
          <text x={-14} y={h - (t / max) * h + 8} textAnchor="end" fill={H.dim} style={{ fontFamily: HUDT, fontWeight: 600, fontSize: 22 }}>{t}{unit}</text></g>)}
        {data.map((b, i) => {
          const k = interpolate(f, [at + i * 3, at + i * 3 + 22], [0, 1], eout);
          const bh = (b.v / max) * h * k, bx = step * (i + 0.5) - barW / 2;
          const col = b.color;
          return <g key={i}>
            <rect x={bx} y={h - bh} width={barW} height={bh} fill={col ? col : `url(#bg${x}${y})`} opacity={col ? 0.85 : 1} rx={3} style={{ filter: glow(col ?? H.cyan, 6) }} />
            <rect x={bx} y={h - bh - 3} width={barW} height={5} fill="#ffffff" opacity={0.9 * k} />
            <rect x={bx} y={h + 4} width={barW} height={bh * 0.25} fill={col ?? H.cyan} opacity={0.12} />
            <text x={step * (i + 0.5)} y={h + 38} textAnchor="middle" fill={H.dim} style={{ fontFamily: HUDT, fontWeight: 600, fontSize: 22 }}>{b.label}</text>
            {b.tag && <text x={step * (i + 0.5)} y={h - bh - 16} textAnchor="middle" fill={col ?? H.ice} opacity={k} style={{ fontFamily: DIGI, fontWeight: 700, fontSize: 24 }}>{b.tag}</text>}
          </g>;
        })}
        {line && <path d={d} fill="none" stroke={lineColor} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - lp} style={{ filter: glow(lineColor, 6) }} />}
      </svg>
    </div>
  );
};

/** Glowing line chart with area fill, drawn left→right; optional value markers. */
export const LineChart: React.FC<{ x: number; y: number; w: number; h: number; pts: number[]; min: number; max: number; at?: number; dur?: number; color?: string; xlabels?: string[]; ticks?: number[]; unit?: string; markers?: { i: number; text: string; color?: string }[] }> = ({
  x, y, w, h, pts, min, max, at = 0, dur = 40, color = H.cyan, xlabels = [], ticks = [], unit = "", markers = [],
}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [0, 1], eio);
  const X = (i: number) => (i / (pts.length - 1)) * w, Y = (v: number) => h - ((v - min) / (max - min)) * h;
  const n = Math.max(1, Math.floor(p * (pts.length - 1)) + 1);
  const frac = p * (pts.length - 1) - (n - 1);
  const shown = pts.slice(0, n).map((v, i) => [X(i), Y(v)]);
  if (n < pts.length) shown.push([X(n - 1) + (X(n) - X(n - 1)) * frac, Y(pts[n - 1] + (pts[n] - pts[n - 1]) * frac)]);
  const d = shown.map((q, i) => `${i ? "L" : "M"}${q[0]},${q[1]}`).join(" ");
  const head = shown[shown.length - 1];
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h + 50 }}>
      <svg width={w} height={h + 50} style={{ overflow: "visible" }}>
        <defs><linearGradient id={`lg${x}${y}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.35} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
        {ticks.map((t) => <g key={t}><line x1={0} x2={w} y1={Y(t)} y2={Y(t)} stroke={H.line} strokeWidth={1.2} />
          <text x={-14} y={Y(t) + 8} textAnchor="end" fill={H.dim} style={{ fontFamily: HUDT, fontWeight: 600, fontSize: 22 }}>{t}{unit}</text></g>)}
        {xlabels.map((l, i) => <text key={i} x={(i / Math.max(1, xlabels.length - 1)) * w} y={h + 38} textAnchor="middle" fill={H.dim} style={{ fontFamily: HUDT, fontWeight: 600, fontSize: 22 }}>{l}</text>)}
        {shown.length > 1 && <path d={`${d} L${head[0]},${h} L0,${h} Z`} fill={`url(#lg${x}${y})`} />}
        {shown.length > 1 && <path d={d} fill="none" stroke={color} strokeWidth={4} strokeLinejoin="round" style={{ filter: glow(color, 8) }} />}
        {head && p > 0 && <><circle cx={head[0]} cy={head[1]} r={14} fill={color} opacity={0.3} /><circle cx={head[0]} cy={head[1]} r={6} fill="white" /></>}
        {markers.map((m, k) => {
          if (p * (pts.length - 1) < m.i) return null;
          const mx = X(m.i), my = Y(pts[m.i]);
          return <g key={k}><circle cx={mx} cy={my} r={8} fill={m.color ?? H.amber} style={{ filter: glow(m.color ?? H.amber, 8) }} />
            <text x={mx} y={my - 22} textAnchor="middle" fill={m.color ?? H.amber} style={{ fontFamily: DIGI, fontWeight: 700, fontSize: 26 }}>{m.text}</text></g>;
        })}
      </svg>
    </div>
  );
};

/** Holographic icon pedestal (stacked glowing discs) — the reference's KPI icon bases. */
export const Pedestal: React.FC<{ x: number; y: number; icon: React.ReactNode; at?: number; color?: string; size?: number }> = ({ x, y, icon, at = 0, color = H.cyan, size = 1 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const sp = spring({ frame: f - at, fps, config: { damping: 12 } });
  const bob = Math.sin((f - at) * 0.08) * 5;
  return (
    <div style={{ position: "absolute", left: x - 70 * size, top: y - 90 * size, width: 140 * size, height: 150 * size, opacity: sp, transform: `scale(${size * (0.7 + 0.3 * sp)})`, transformOrigin: "50% 100%" }}>
      <svg width={140} height={150} style={{ overflow: "visible" }}>
        {[0, 1, 2].map((i) => <ellipse key={i} cx={70} cy={128 - i * 9} rx={58 - i * 8} ry={14 - i * 2} fill={i === 2 ? color : "none"} fillOpacity={0.35} stroke={color} strokeWidth={2} opacity={0.9 - i * 0.2} style={{ filter: glow(color, 8) }} />)}
        <path d="M30,118 L45,40 L95,40 L110,118 Z" fill={`url(#beam${x})`} opacity={0.35} />
        <defs><linearGradient id={`beam${x}`} x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor={color} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
        <g transform={`translate(70 ${58 + bob})`}><circle r={30} fill="rgba(4,23,58,0.85)" stroke={color} strokeWidth={2.5} style={{ filter: glow(color, 8) }} /><g>{icon}</g></g>
      </svg>
    </div>
  );
};

/** Legend list like the reference's "Park Size" panel: bullet · label · value · %. */
export const Legend: React.FC<{ x: number; y: number; rows: { color: string; label: string; value: string; pct?: string }[]; at?: number; w?: number }> = ({ x, y, rows, at = 0, w = 560 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w }}>
      {rows.map((r, i) => {
        const o = interpolate(f, [at + i * 5, at + i * 5 + 8], [0, 1], cl);
        return <div key={i} style={{ display: "flex", alignItems: "center", height: 58, opacity: o, transform: `translateX(${(1 - o) * 20}px)`, borderBottom: "1px solid rgba(57,213,255,0.15)" }}>
          <div style={{ width: 14, height: 14, background: r.color, boxShadow: `0 0 10px ${r.color}`, marginRight: 18, transform: "rotate(45deg)" }} />
          <div style={{ flex: 1, fontFamily: HUDT, fontWeight: 600, fontSize: 30, color: H.ice }}>{r.label}</div>
          <div style={{ width: 150, textAlign: "right", fontFamily: DIGI, fontWeight: 700, fontSize: 28, color: H.ice }}>{r.value}</div>
          {r.pct && <div style={{ width: 110, textAlign: "right", fontFamily: DIGI, fontWeight: 700, fontSize: 26, color: r.color }}>{r.pct}</div>}
        </div>;
      })}
    </div>
  );
};

/** Data table like the reference's "System Monitoring" panel. */
export const DataTable: React.FC<{ x: number; y: number; w: number; cols: string[]; widths: number[]; rows: { cells: string[]; colors?: (string | undefined)[] }[]; at?: number; rowH?: number }> = ({ x, y, w, cols, widths, rows, at = 0, rowH = 70 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w }}>
      <div style={{ display: "flex", height: 64, alignItems: "center", fontFamily: HUDT, fontWeight: 600, fontSize: 28, color: H.dim, letterSpacing: 1 }}>
        {cols.map((c, i) => <div key={i} style={{ width: widths[i], textAlign: i ? "center" : "left", paddingLeft: i ? 0 : 20 }}>{c}</div>)}
      </div>
      {rows.map((r, ri) => {
        const o = interpolate(f, [at + ri * 7, at + ri * 7 + 10], [0, 1], cl);
        return <div key={ri} style={{ display: "flex", height: rowH, alignItems: "center", opacity: o, transform: `translateY(${(1 - o) * 12}px)`,
          background: ri % 2 === 0 ? "rgba(30,139,255,0.16)" : "rgba(30,139,255,0.05)", borderLeft: `3px solid ${ri % 2 === 0 ? H.cyan : "transparent"}` }}>
          {r.cells.map((c, i) => <div key={i} style={{ width: widths[i], textAlign: i ? "center" : "left", paddingLeft: i ? 0 : 20,
            fontFamily: i ? DIGI : HUDT, fontWeight: i ? 700 : 600, fontSize: i ? 28 : 30, color: r.colors?.[i] ?? (i ? H.ice : H.cyan),
            textShadow: i ? `0 0 10px ${r.colors?.[i] ?? H.blue}` : undefined }}>{c}</div>)}
        </div>;
      })}
    </div>
  );
};

/** Glowing status badge (AAA, LOCKED, DEFERRED…) that slams in. */
export const Badge: React.FC<{ x: number; y: number; text: string; sub?: string; at?: number; color?: string; size?: number; rot?: number }> = ({ x, y, text, sub, at = 0, color = H.amber, size = 56, rot = 0 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const sp = spring({ frame: f - at, fps, config: { damping: 10, stiffness: 170 } });
  if (f < at) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${1.5 - 0.5 * sp})`, opacity: sp, textAlign: "center",
      padding: "10px 22px", border: `3px solid ${color}`, background: "rgba(4,23,58,0.75)", clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
      boxShadow: `0 0 24px ${color}66, inset 0 0 18px ${color}33` }}>
      <div style={{ fontFamily: DIGI, fontWeight: 900, fontSize: size, color, lineHeight: 1, transform: "skewX(-8deg)", textShadow: `0 0 12px ${color}` }}>{text}</div>
      {sub && <div style={{ fontFamily: HUDT, fontWeight: 600, fontSize: size * 0.36, color: H.ice, letterSpacing: 2, marginTop: 6 }}>{sub}</div>}
    </div>
  );
};

/** Vertical holographic gauge (tank / thermometer replacement). */
export const VGauge: React.FC<{ x: number; y: number; w?: number; h: number; level: number; color?: string; label?: string; at?: number }> = ({ x, y, w = 90, h, level, color = H.cyan, label, at = 0 }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at, at + 8], [0, 1], cl);
  const segs = 24;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h + 50, opacity: o }}>
      <svg width={w} height={h} style={{ overflow: "visible" }}>
        <rect x={0} y={0} width={w} height={h} fill="rgba(30,139,255,0.06)" stroke={H.blue} strokeOpacity={0.7} strokeWidth={2} />
        {Array.from({ length: segs }).map((_, i) => {
          const on = (i + 1) / segs <= level + 1e-6;
          const sy = h - (i + 1) * (h / segs) + 3;
          return <rect key={i} x={8} y={sy} width={w - 16} height={h / segs - 6} fill={on ? color : "rgba(57,213,255,0.07)"} opacity={on ? 0.55 + 0.45 * ((i + 1) / segs) : 1} style={on ? { filter: glow(color, 6) } : undefined} />;
        })}
      </svg>
      {label && <div style={{ fontFamily: HUDT, fontWeight: 600, fontSize: 24, color: H.dim, textAlign: "center", marginTop: 12, width: w + 80, marginLeft: -40 }}>{label}</div>}
    </div>
  );
};

// ── small line icons for pedestals ───────────────────────────────────────────
export const Ico = {
  coin: <g stroke="#bfe9ff" strokeWidth={2.5} fill="none"><circle r={13} /><text y={6} textAnchor="middle" fill="#bfe9ff" stroke="none" style={{ fontFamily: "sans-serif", fontWeight: 800, fontSize: 16 }}>$</text></g>,
  bank: <g stroke="#bfe9ff" strokeWidth={2.5} fill="none"><path d="M-15,-4 L0,-14 L15,-4 Z" /><path d="M-11,-2 v13 M-4,-2 v13 M4,-2 v13 M11,-2 v13 M-15,13 h30" /></g>,
  oil: <g stroke="#bfe9ff" strokeWidth={2.5} fill="none"><path d="M0,-15 C8,-4 11,2 11,6 A11,11 0 0 1 -11,6 C-11,2 -8,-4 0,-15 Z" /></g>,
  shield: <g stroke="#bfe9ff" strokeWidth={2.5} fill="none"><path d="M0,-15 L13,-9 L13,2 C13,9 6,14 0,16 C-6,14 -13,9 -13,2 L-13,-9 Z" /><path d="M-6,1 L-1,6 L7,-4" /></g>,
  clock: <g stroke="#bfe9ff" strokeWidth={2.5} fill="none"><circle r={14} /><path d="M0,-8 V0 L7,5" /></g>,
  people: <g stroke="#bfe9ff" strokeWidth={2.5} fill="none"><circle cx={-6} cy={-6} r={5} /><circle cx={7} cy={-6} r={5} /><path d="M-15,12 C-14,2 2,2 3,12 M-2,12 C-1,3 15,3 16,12" /></g>,
  bolt: <g stroke="#bfe9ff" strokeWidth={2.5} fill="none"><path d="M3,-15 L-8,2 L0,2 L-3,15 L9,-3 L1,-3 Z" /></g>,
  lock: <g stroke="#bfe9ff" strokeWidth={2.5} fill="none"><rect x={-11} y={-2} width={22} height={16} rx={2} /><path d="M-6,-2 V-8 A6,6 0 0 1 6,-8 V-2" /></g>,
  chart: <g stroke="#bfe9ff" strokeWidth={2.5} fill="none"><path d="M-14,12 H14 M-10,8 V0 M-3,8 V-6 M4,8 V-2 M11,8 V-11" /></g>,
  warn: <g stroke="#bfe9ff" strokeWidth={2.5} fill="none"><path d="M0,-14 L14,12 H-14 Z" /><path d="M0,-4 V4 M0,8 V9" /></g>,
};

/** Map overlay KPI: compact glass card with header + skewed digits (replaces the serif stat/count blocks). */
export const KpiCard: React.FC<{ x: number; y: number; label: string; value?: number; text?: string; prefix?: string; suffix?: string; decimals?: number; sub?: string; src?: string; at?: number; dur?: number; w?: number; color?: string; big?: number }> = ({
  x, y, label, value, text, prefix, suffix, decimals = 0, sub, src, at = 0, dur = 30, w = 760, color = H.cyan, big = 110,
}) => {
  const h = 120 + big + (sub ? 46 : 0) + (src ? 34 : 0);
  return (
    <Panel x={x} y={y} w={w} h={h} title={label} at={at} accent={color}>
      <div style={{ position: "absolute", left: 30, top: 80 }}>
        {value != null ? <Digits value={value} at={at + 8} dur={dur} prefix={prefix} suffix={suffix} decimals={decimals} size={big} color={color === H.cyan ? H.ice : color} />
          : <Digits value={0} at={at + 8} fixed={text} size={big * 0.8} color={color === H.cyan ? H.ice : color} />}
        {sub && <Label size={32} style={{ marginTop: 16, width: w - 60 }}>{sub}</Label>}
        {src && <Label size={22} color={H.dim} style={{ marginTop: 10 }}>{src}</Label>}
      </div>
    </Panel>
  );
};

/** Holographic stage (tablet reference): content floats on a fixed tilted plane above a soft glowing floor.
 *  No continuous wobble (text on a moving 3D plane shimmers) and no hard-edged plate (everything fades out inside frame). */
export const HoloStage: React.FC<{ children: React.ReactNode; rx?: number; ry?: number; plate?: boolean; at?: number }> = ({ children, rx = 8, ry = -10, plate = true, at = 0 }) => {
  const f = useCurrentFrame();
  const rise = interpolate(f, [at, at + 22], [0, 1], eio);
  return (
    <AbsoluteFill>
      {plate && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 640, height: 440, opacity: rise,
          WebkitMaskImage: "radial-gradient(ellipse 52% 70% at 50% 30%, black 35%, transparent 100%)", maskImage: "radial-gradient(ellipse 52% 70% at 50% 30%, black 35%, transparent 100%)" }}>
          <svg width={1920} height={440} viewBox="0 0 1920 440">
            <defs>
              <radialGradient id="poolG" cx="50%" cy="25%" r="60%"><stop offset="0%" stopColor={H.cyan} stopOpacity={0.28} /><stop offset="100%" stopColor={H.blue} stopOpacity={0} /></radialGradient>
              <linearGradient id="edgeG" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={H.cyan} stopOpacity={0} /><stop offset="20%" stopColor={H.cyan} stopOpacity={0.9} />
                <stop offset="80%" stopColor={H.cyan} stopOpacity={0.9} /><stop offset="100%" stopColor={H.cyan} stopOpacity={0} /></linearGradient>
            </defs>
            <ellipse cx={960} cy={150} rx={900} ry={190} fill="url(#poolG)" />
            {Array.from({ length: 25 }).map((_, i) => { const x = -240 + i * 100; return <line key={`r${i}`} x1={960 + (x - 960) * 0.35} y1={40} x2={x} y2={440} stroke={H.cyan} strokeOpacity={0.16} strokeWidth={1.2} />; })}
            {[60, 100, 150, 215, 300, 410].map((y, i) => <line key={`h${i}`} x1={0} y1={y} x2={1920} y2={y} stroke={H.cyan} strokeOpacity={0.12 + i * 0.02} strokeWidth={1.2} />)}
            <path d="M200,175 Q960,265 1720,175" fill="none" stroke="url(#edgeG)" strokeWidth={3} style={{ filter: glow(H.cyan, 10) }} />
          </svg>
        </div>
      )}
      {[120, 1790].map((x, i) => <div key={i} style={{ position: "absolute", left: x, top: 0, width: 6, height: 1080, background: `linear-gradient(180deg, transparent, ${H.cyan}, transparent)`, opacity: 0.3 * rise, boxShadow: `0 0 18px ${H.cyan}` }} />)}
      {/* flat panels: CSS 3D tilt made small SVG axis text re-rasterize and jitter every frame (user feedback) — depth comes from the WebGL objects + floor */}
      <AbsoluteFill style={{ transform: rise < 1 ? `translateY(${Math.round((1 - rise) * 60)}px)` : undefined, opacity: rise }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
