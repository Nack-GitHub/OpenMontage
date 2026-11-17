import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";
import { loadFont as loadPlexMono } from "@remotion/google-fonts/IBMPlexMono";
import { COUNTRIES, LAO_PROVINCES, BASE_LAYERS, FLAGS, PROJ } from "./mapData";
import { CountryPop } from "./fx";
import { KpiCard, Badge, H } from "./hud";

// ── The Sundaland · Economy Geography — atelier composition (see art-direction.md) ──

export const { fontFamily: SERIF } = loadFraunces("normal", { weights: ["600"], subsets: ["latin"] });
export const { fontFamily: SANS } = loadManrope("normal", { weights: ["500", "700"], subsets: ["latin"] });
export const { fontFamily: MONO } = loadPlexMono("normal", { weights: ["400"], subsets: ["latin"] });

export const C = {
  ink: "#0B1530",
  navy: "#1F2A6B",
  teal: "#21807F",
  tealBright: "#3FB7B0",
  paper: "#F2EFE6",
  amber: "#E9A23B",
};

export const FPS = 30;
export const s = (sec: number) => Math.round(sec * FPS);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export interface SceneProps {
  durationSeconds?: number;
}

// ── shared atoms (written for this piece) ─────────────────────────────────────

/** Footage that always drifts — nothing is ever perfectly still. */
export const DriftVideo: React.FC<{ src: string; from?: number; to?: number; start?: number; dur: number; origin?: string }> = ({
  src, from = 1.0, to = 1.06, start = 0, dur, origin = "50% 50%",
}) => {
  const f = useCurrentFrame();
  const sc = interpolate(f, [0, dur], [from, to], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile(src)}
        startFrom={s(start)}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${sc})`, transformOrigin: origin }}
      />
    </AbsoluteFill>
  );
};

export const DriftPhoto: React.FC<{ src: string; dur: number; from?: number; to?: number; origin?: string; style?: React.CSSProperties }> = ({
  src, dur, from = 1.02, to = 1.1, origin = "50% 50%", style,
}) => {
  const f = useCurrentFrame();
  const sc = interpolate(f, [0, dur], [from, to], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden", ...style }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${sc})`, transformOrigin: origin }} />
    </AbsoluteFill>
  );
};

/** Type that rises 24px and settles. */
export const Rise: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties; distance?: number }> = ({
  delay = 0, children, style, distance = 24,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - delay, fps, config: { damping: 200 }, durationInFrames: 22 });
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * distance}px)`, ...style }}>{children}</div>
  );
};

/** Numbers count up like a ledger settling. */
export const Count: React.FC<{ to: number; startFrame: number; dur?: number; suffix?: string; style?: React.CSSProperties }> = ({
  to, startFrame, dur = 20, suffix = "", style,
}) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [startFrame, startFrame + dur], [0, to], { ...clamp, easing: Easing.out(Easing.exp) });
  return <span style={style}>{Math.round(v)}{suffix}</span>;
};

export const Credit: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", left: 64, bottom: 44, fontFamily: MONO, fontSize: 18, color: C.paper, opacity: 0.62, letterSpacing: 0.3 }}>
    {text}
  </div>
);

/** Left-to-right legibility wash for text over footage. */
export const LeftWash: React.FC<{ strength?: number }> = ({ strength = 0.78 }) => (
  <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(11,21,48,${strength}) 0%, rgba(11,21,48,${strength * 0.55}) 38%, rgba(11,21,48,0) 70%)` }} />
);

// ── Map stage: satellite basemap + camera in map units (style direction: user's Malacca piece) ──
export type Cam = { cx: number; cy: number; vh: number };
export const camScale = (c: Cam) => 1080 / c.vh;
export const toScreen = (c: Cam, ux: number, uy: number) => {
  const k = camScale(c);
  return { x: (ux - c.cx) * k + 960, y: (uy - c.cy) * k + 540 };
};
/** keyframed camera: [frame, cx, cy, vh][] with cubic in-out between keys */
export const useCam = (keys: [number, number, number, number][]): Cam => {
  const f = useCurrentFrame();
  const fr = keys.map((k) => k[0]);
  const ease = { ...clamp, easing: Easing.inOut(Easing.cubic) };
  // interpolate vh in log space so zooms feel linear to the eye
  const lvh = interpolate(f, fr, keys.map((k) => Math.log(k[3])), ease);
  return { cx: interpolate(f, fr, keys.map((k) => k[1]), ease), cy: interpolate(f, fr, keys.map((k) => k[2]), ease), vh: Math.exp(lvh) };
};

export const Basemap: React.FC<{ cam: Cam; blur?: number }> = ({ cam, blur = 0 }) => {
  const k = camScale(cam);
  const vw = 1920 / k, vh = 1080 / k;
  const view = { x0: cam.cx - vw / 2, y0: cam.cy - vh / 2, x1: cam.cx + vw / 2, y1: cam.cy + vh / 2 };
  const L = BASE_LAYERS; // coarse → fine
  const contains = (l: typeof L[number]) => l.x <= view.x0 && l.y <= view.y0 && l.x + l.w >= view.x1 && l.y + l.h >= view.y1;
  const hits = (l: typeof L[number]) => !(l.x > view.x1 || l.y > view.y1 || l.x + l.w < view.x0 || l.y + l.h < view.y0);
  let base = 0;
  for (let i = L.length - 1; i >= 0; i--) { if (contains(L[i])) { base = i; break; } }
  const draw = L.map((l, i) => i >= base && hits(l) && (i === base || l.w * k < 26000));
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#0d2a5c" }}>
      {L.map((l, i) => {
        if (!draw[i]) return null;
        const p = toScreen(cam, l.x, l.y);
        return <Img key={i} src={staticFile(l.src)} style={{ position: "absolute", left: p.x, top: p.y, width: l.w * k, height: l.h * k, maxWidth: "none",
          filter: blur > 0.2 ? `blur(${blur}px)` : undefined }} />;
      })}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 55% 50%, rgba(0,0,0,0) 55%, rgba(5,12,30,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};

/** Country silhouette filled with its flag, popping up off the satellite map (any country in COUNTRIES with a flag in FLAGS). */
export const FlagSilhouette: React.FC<{ cam: Cam; country: string; pop: number; fade: number; boost?: number }> = ({ cam, country, pop, fade, boost = 1 }) => {
  const c = COUNTRIES[country];
  const flag = FLAGS[country];
  if (!c || !flag) return null;
  const k = camScale(cam);
  const vw = 1920 / k, vh = 1080 / k;
  const [x0, y0, x1, y1] = c.bbox;
  const sc = (0.82 + 0.18 * pop) * boost;
  const lift = 10 * pop;
  const id = `flag-${country.replace(/\W/g, "")}`;
  return (
    <svg viewBox={`${cam.cx - vw / 2} ${cam.cy - vh / 2} ${vw} ${vh}`}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: Math.min(pop * 1.4, 1) * fade,
        filter: `drop-shadow(0 ${lift}px ${14 + 8 * pop}px rgba(0,0,0,0.55))` }}>
      <defs><clipPath id={id}>{c.paths.map((d, i) => <path key={i} d={d} />)}</clipPath></defs>
      <g transform={`translate(${c.cx} ${c.cy}) scale(${sc}) translate(${-c.cx} ${-c.cy - lift / k})`}>
        <g clipPath={`url(#${id})`}>
          <image href={staticFile(flag)} x={x0} y={y0} width={x1 - x0} height={y1 - y0} preserveAspectRatio="xMidYMid slice" />
        </g>
        {c.paths.map((d, i) => <path key={i} d={d} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={2.2 / (k * sc)} />)}
      </g>
    </svg>
  );
};

/** A country's territory after the flag dissolves: tinted fill + white border, so it reads on satellite. */
export const TerritoryTint: React.FC<{ cam: Cam; country: string; o: number; fill?: string }> = ({ cam, country, o, fill = "rgba(233,162,59,0.30)" }) => {
  const c = COUNTRIES[country];
  if (!c) return null;
  const k = camScale(cam);
  const vw = 1920 / k, vh = 1080 / k;
  return (
    <svg viewBox={`${cam.cx - vw / 2} ${cam.cy - vh / 2} ${vw} ${vh}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: o }}>
      {c.paths.map((d, i) => (
        <path key={i} d={d} fill={fill} stroke="white" strokeWidth={2.4 / k} strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 3px rgba(0,0,0,.6))" }} />
      ))}
    </svg>
  );
};

/** Faint province borders (geoBoundaries ADM1, Laos) inside the country. */
export const ProvinceBorders: React.FC<{ cam: Cam; o: number }> = ({ cam, o }) => {
  const k = camScale(cam);
  const vw = 1920 / k, vh = 1080 / k;
  return (
    <svg viewBox={`${cam.cx - vw / 2} ${cam.cy - vh / 2} ${vw} ${vh}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: o }}>
      {Object.values(LAO_PROVINCES).flatMap((pv, j) => pv.paths.map((d, i) => <path key={`${j}-${i}`} d={d} fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth={1.3 / k} strokeLinejoin="round" />))}
    </svg>
  );
};

/** National borders of the region drawn thin, so countries read on the satellite at wide zooms. */
export const RegionBorders: React.FC<{ cam: Cam; o: number; names?: string[] }> = ({ cam, o, names }) => {
  const k = camScale(cam);
  const vw = 1920 / k, vh = 1080 / k;
  const list = names ?? ["Singapore", "Brunei", "Cambodia", "Philippines", "Thailand", "Malaysia", "Indonesia", "Timor-Leste", "Laos", "Vietnam", "Myanmar"];
  return (
    <svg viewBox={`${cam.cx - vw / 2} ${cam.cy - vh / 2} ${vw} ${vh}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: o }}>
      {list.flatMap((n) => (COUNTRIES[n]?.paths ?? []).map((d, i) => <path key={`${n}-${i}`} d={d} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={1.4 / k} strokeLinejoin="round" />))}
    </svg>
  );
};

/** Small italic place label with a thin leader line to its point. */
export const MapLabel: React.FC<{ cam: Cam; ux: number; uy: number; text: string; dx?: number; dy?: number; at: number; size?: number; leader?: boolean }> = ({
  cam, ux, uy, text, dx = 0, dy = 0, at, size = 30, leader = false,
}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at, at + 8], [0, 1], clamp);
  const draw = interpolate(f, [at, at + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const p = toScreen(cam, ux, uy);
  const lx = p.x + dx, ly = p.y + dy;
  return (
    <>
      {leader && (
        <svg style={{ position: "absolute", inset: 0, width: 1920, height: 1080, overflow: "visible", opacity: o }}>
          <line x1={lx} y1={ly + 6} x2={lx + (p.x - lx) * draw} y2={ly + 6 + (p.y - ly - 6) * draw} stroke="white" strokeWidth={2} style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,.7))" }} />
        </svg>
      )}
      <div style={{ position: "absolute", left: lx, top: ly, transform: `translate(-50%, -100%) translateY(${(1 - o) * 8}px)`, opacity: o,
        fontFamily: SANS, fontWeight: 700, fontStyle: "italic", fontSize: size, color: "white", whiteSpace: "nowrap",
        textShadow: "0 2px 6px rgba(0,0,0,0.75)" }}>{text}</div>
    </>
  );
};

/** The pin tick: a dot that lands, then white rays burst out (sync with tick/impact SFX). */
export const PinTick: React.FC<{ x: number; y: number; at: number; color?: string; rays?: boolean; dot?: boolean }> = ({ x, y, at, color = C.amber, rays = true, dot = true }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const land = spring({ frame: f - at, fps, config: { damping: 9, stiffness: 180 } });
  const burst = interpolate(f, [at, at + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const burstO = interpolate(f, [at, at + 3, at + 14], [0, 1, 0], clamp);
  const ring = interpolate(f, [at + 2, at + 22], [0, 1], clamp);
  const N = 12;
  if (f < at - 1) return null;
  return (
    <svg style={{ position: "absolute", inset: 0, width: 1920, height: 1080, overflow: "visible" }}>
      {rays && Array.from({ length: N }).map((_, i) => {
        const a = (i / N) * Math.PI * 2 + 0.26;
        const r0 = 16 + 30 * burst, r1 = 34 + 74 * burst;
        return <line key={i} x1={x + Math.cos(a) * r0} y1={y + Math.sin(a) * r0} x2={x + Math.cos(a) * r1} y2={y + Math.sin(a) * r1}
          stroke="white" strokeWidth={3} strokeLinecap="round" opacity={burstO} />;
      })}
      <circle cx={x} cy={y} r={14 + 46 * ring} fill="none" stroke="white" strokeWidth={2} opacity={(1 - ring) * 0.8} />
      {dot && <circle cx={x} cy={y} r={11 * land} fill={color} stroke="white" strokeWidth={3} style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,.6))" }} />}
    </svg>
  );
};

/** Dashed survey line drawn across the map; flips amber → white when it "ticks". */
export const DashLine: React.FC<{ a: { x: number; y: number }; b: { x: number; y: number }; drawAt: number; tickAt: number }> = ({ a, b, drawAt, tickAt }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [drawAt, drawAt + 14], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const white = interpolate(f, [tickAt, tickAt + 3], [0, 1], clamp);
  const x2 = a.x + (b.x - a.x) * p, y2 = a.y + (b.y - a.y) * p;
  const col = white > 0.5 ? "white" : C.amber;
  return (
    <svg style={{ position: "absolute", inset: 0, width: 1920, height: 1080, overflow: "visible" }}>
      <line x1={a.x} y1={a.y} x2={x2} y2={y2} stroke={col} strokeWidth={6} strokeDasharray="14 9" strokeLinecap="round"
        style={{ filter: "drop-shadow(0 0 6px rgba(0,0,0,.6))" }} />
    </svg>
  );
};

// ── Scene A · Cold open: Singapore footage → whip into the cloudy globe → zoom to Singapore → flag pop + AAA stamps
//    → whip north: a dark mystery silhouette (Laos, unnamed) pops, dashed line ticks white, "≈ ½ the debt".
// globe_in.mp4 (48 f, assets/globe/render_globe.py with globe_cfg.json "in") ends on the flat map's first camera (Singapore, 14° tall).
// t = scene-local seconds for: [sentence-2 start ("And all three…"), sentence-3 start ("The Southeast Asian country…"), "half as much" ≈ end]
const GLOBE_AT = s(0.95), GLOBE_LEN = 48;
const llp = (lon: number, lat: number): [number, number] => [(lon - PROJ.lon0) * PROJ.k * PROJ.sx, (PROJ.lat1 - lat) * PROJ.sx];
export const ColdOpen: React.FC<{ dur: number; p?: any }> = ({ dur, p = {} }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [t2, t3, tEnd] = (p.t ?? [5.2, 8.6, 11.6]) as number[];
  const SG = llp(103.82, 1.35), LA = [COUNTRIES["Laos"].cx, COUNTRIES["Laos"].cy];
  const mid = [SG[0] * 0.4 + LA[0] * 0.6 + 60, SG[1] * 0.4 + LA[1] * 0.6];
  const cam = useCam([
    [s(2.45), SG[0], SG[1], 14 * PROJ.sx],
    [s(3.3), SG[0] - 20, SG[1] - 10, 5.2 * PROJ.sx],
    [s(t3), SG[0] - 20, SG[1] - 10, 4.8 * PROJ.sx],
    [s(t3 + 0.9), mid[0], mid[1], 22 * PROJ.sx],
    [dur, mid[0], mid[1], 21 * PROJ.sx],
  ]);
  const whip = interpolate(f, [s(0.9), s(1.15)], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const footO = interpolate(f, [s(0.9), s(1.12)], [1, 0], clamp);
  const globeIn = interpolate(f, [GLOBE_AT, GLOBE_AT + 5], [0, 1], clamp);
  const globeBlurIn = interpolate(f, [GLOBE_AT, GLOBE_AT + 8], [14, 0], clamp);
  const globeOut = interpolate(f, [s(2.35), s(2.55)], [1, 0], clamp);
  const whipN = interpolate(f, [s(t3), s(t3 + 0.45), s(t3 + 0.9)], [0, 9, 0], clamp);
  const mapBlur = interpolate(f, [s(2.35), s(2.6)], [6, 0], clamp) + interpolate(f, [s(2.6), s(3.0), s(3.3)], [0, 4, 0], clamp) + whipN;
  const pop = spring({ frame: f - s(3.0), fps, config: { damping: 11, stiffness: 140 } });
  const flagFade = interpolate(f, [s(t3 + 0.6), s(t3 + 1.0)], [1, 0.0], clamp);
  const tint = interpolate(f, [s(t3 + 0.5), s(t3 + 1.0)], [0, 1], clamp);
  const statO = interpolate(f, [s(t3 - 0.1), s(t3 + 0.3)], [1, 0], clamp);
  const out = interpolate(f, [dur - 8, dur], [1, 0], clamp);
  const S = toScreen(cam, SG[0], SG[1]), L = toScreen(cam, LA[0], LA[1]);
  const stamps = ["S&P", "MOODY'S", "FITCH"];
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Basemap cam={cam} blur={mapBlur} />
      <RegionBorders cam={cam} o={interpolate(f, [s(2.6), s(3.2)], [0, 0.8], clamp)} />
      <TerritoryTint cam={cam} country="Singapore" o={tint} />
      <FlagSilhouette cam={cam} country="Singapore" pop={pop} fade={flagFade} boost={1.6} />
      <MapLabel cam={cam} ux={SG[0]} uy={SG[1]} text="Singapore" dx={150} dy={-90} at={s(3.25)} leader size={36} />
      {/* the mystery borrower: Laos, unnamed until the finale */}
      <CountryPop cam={cam} name="Laos" color="#0B1530" at={s(t3 + 1.0)} settle={0.92} solid />
      {f >= s(t3 + 1.15) && (
        <div style={{ position: "absolute", left: L.x, top: L.y, transform: `translate(-50%,-50%) scale(${spring({ frame: f - s(t3 + 1.15), fps, config: { damping: 9, stiffness: 160 } })})`,
          fontFamily: SERIF, fontWeight: 600, fontSize: 130, color: C.amber, textShadow: "0 4px 18px rgba(0,0,0,.6)" }}>?</div>
      )}
      <DashLine a={S} b={L} drawAt={s(t3 + 1.3)} tickAt={s(t3 + 1.9)} />
      <PinTick x={L.x} y={L.y + 70} at={s(t3 + 1.9)} dot={false} />
      <LeftWash strength={0.72} />
      <div style={{ position: "absolute", inset: 0, opacity: statO }}>
        <KpiCard x={120} y={230} w={800} label="Singapore · government debt" value={170} prefix="≈" suffix="%" sub="of GDP — more than Italy or the United States" at={s(3.6)} big={110} />
        {stamps.map((st, i) => <Badge key={st} x={230 + i * 240} y={760} text="AAA" sub={st} at={s(t2 + 0.9 + i * 0.35)} color={H.amber} size={56} />)}
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - statO }}>
        <KpiCard x={120} y={330} w={720} label="First in line to go broke" text="≈ ½" sub="the debt ratio" at={s(tEnd - 1.4)} color={H.amber} big={120} />
      </div>
      <Sequence from={GLOBE_AT} durationInFrames={GLOBE_LEN} premountFor={30}>
        <AbsoluteFill style={{ opacity: globeIn * globeOut, filter: globeBlurIn > 0.2 ? `blur(${globeBlurIn}px)` : undefined }}>
          <OffthreadVideo src={staticFile("globe_in.mp4")} muted style={{ width: "100%", height: "100%" }} />
        </AbsoluteFill>
      </Sequence>
      <AbsoluteFill style={{ opacity: footO, filter: `blur(${whip * 18}px)`, transform: `scale(${1 + whip * 0.3})` }}>
        <DriftVideo src="footage/s00_sg.mp4" dur={s(1.2)} />
      </AbsoluteFill>
      <Credit text={p.credit ?? "Globe & basemap: NASA Blue Marble (public domain) · Boundaries: geoBoundaries (CC BY 4.0)"} />
    </AbsoluteFill>
  );
};

// ── Scene B · Logo sting ─────────────────────────────────────────────────────
export const Sting: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeIn = interpolate(f, [0, 6], [0, 1], clamp);
  const fadeOut = interpolate(f, [dur - 8, dur], [1, 0], clamp);
  const mark = spring({ frame: f - 3, fps, config: { damping: 18, stiffness: 120 } });
  const wipe = interpolate(f, [s(0.35), s(1.0)], [0, 100], { ...clamp, easing: Easing.out(Easing.cubic) });
  const rule = interpolate(f, [s(0.9), s(1.5)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const track = interpolate(f, [s(1.0), s(1.8)], [18, 6], { ...clamp, easing: Easing.out(Easing.quad) });
  const tagOp = interpolate(f, [s(1.0), s(1.5)], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, ${C.navy} 0%, ${C.ink} 62%)`, opacity: fadeIn * fadeOut, alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
        <Img src={staticFile("logo_mark_white.png")} style={{ height: 118, transform: `rotate(${(1 - mark) * -18}deg) scale(${0.7 + 0.3 * mark})`, opacity: mark }} />
        <div style={{ clipPath: `inset(0 ${100 - wipe}% 0 0)` }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 118, color: C.paper, letterSpacing: -2, lineHeight: 1 }}>The Sundaland</div>
        </div>
      </div>
      <div style={{ width: 640 * rule, height: 3, background: `linear-gradient(90deg, ${C.navy}, ${C.teal})`, marginTop: 34 }} />
      <div style={{ fontFamily: MONO, fontSize: 30, color: C.tealBright, letterSpacing: track, marginTop: 24, opacity: tagOp }}>ECONOMY GEOGRAPHY</div>
    </AbsoluteFill>
  );
};

// ── Scene C · Fact title card ────────────────────────────────────────────────
export const FactTitle: React.FC<{ dur: number; n: number; title: string; act: string; photo: string; credit: string }> = ({ dur, n, title, act, photo, credit }) => {
  const f = useCurrentFrame();
  const rule = interpolate(f, [s(0.4), s(1.1)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const out = interpolate(f, [dur - 6, dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <DriftPhoto src={photo} dur={dur} from={1.04} to={1.12} origin="70% 50%" />
      <AbsoluteFill style={{ background: C.ink, opacity: 0.3 }} />
      <LeftWash strength={0.9} />
      <div style={{ position: "absolute", left: 120, top: 250, display: "flex", alignItems: "center", gap: 56 }}>
        <Rise delay={2} distance={40}>
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 420, color: C.amber, lineHeight: 0.8 }}>{n}</div>
        </Rise>
        <div style={{ width: 3, height: 360 * rule, background: `linear-gradient(180deg, ${C.teal}, ${C.navy})` }} />
        <div>
          <Rise delay={s(0.5)}>
            <div style={{ fontFamily: MONO, fontSize: 24, color: C.tealBright, letterSpacing: 3 }}>NO. {String(n).padStart(2, "0")} / 15 · {act}</div>
          </Rise>
          <Rise delay={s(0.7)}>
            <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 92, color: C.paper, lineHeight: 1.04, width: 900, marginTop: 18 }}>{title}</div>
          </Rise>
        </div>
      </div>
      <Credit text={credit} />
    </AbsoluteFill>
  );
};

// ── Watermark ────────────────────────────────────────────────────────────────
export const Watermark: React.FC = () => (
  <Img src={staticFile("logo_full_white.png")} style={{ position: "absolute", right: 56, bottom: 42, height: 34, opacity: 0.58 }} />
);

