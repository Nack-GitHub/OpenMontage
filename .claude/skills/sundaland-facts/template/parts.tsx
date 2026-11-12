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
import { THAILAND, PROVINCES, BASE_LAYERS } from "./mapData";

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

/** Country silhouette filled with its flag, popping up off the satellite map. */
export const FlagSilhouette: React.FC<{ cam: Cam; pop: number; fade: number }> = ({ cam, pop, fade }) => {
  const k = camScale(cam);
  const vw = 1920 / k, vh = 1080 / k;
  const [ox, oy] = [500, 919]; // country centroid in map units
  const sc = 0.82 + 0.18 * pop;
  const lift = (1 - fade) * 0 + 10 * pop;
  const stripes = [["#A51931", 1], ["#F4F5F8", 1], ["#2D2A4A", 2], ["#F4F5F8", 1], ["#A51931", 1]] as const;
  let y = 0;
  return (
    <svg viewBox={`${cam.cx - vw / 2} ${cam.cy - vh / 2} ${vw} ${vh}`}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: Math.min(pop * 1.4, 1) * fade,
        filter: `drop-shadow(0 ${lift}px ${14 + 8 * pop}px rgba(0,0,0,0.55))` }}>
      <defs>
        <clipPath id="tha-clip">{THAILAND.paths.map((d, i) => <path key={i} d={d} />)}</clipPath>
      </defs>
      <g transform={`translate(${ox} ${oy}) scale(${sc}) translate(${-ox} ${-oy - lift / k})`}>
        <g clipPath="url(#tha-clip)">
          {stripes.map(([col, h], i) => {
            const r = <rect key={i} x={-50} y={(y / 6) * 1838} width={1100} height={(h / 6) * 1838 + 1} fill={col} />;
            y += h;
            return r;
          })}
        </g>
        {THAILAND.paths.map((d, i) => <path key={i} d={d} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={2.2 / k} />)}
      </g>
    </svg>
  );
};

/** Thailand's territory after the flag dissolves: tinted fill + white border, so the thin strip reads on satellite. */
export const TerritoryTint: React.FC<{ cam: Cam; o: number }> = ({ cam, o }) => {
  const k = camScale(cam);
  const vw = 1920 / k, vh = 1080 / k;
  return (
    <svg viewBox={`${cam.cx - vw / 2} ${cam.cy - vh / 2} ${vw} ${vh}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: o }}>
      {THAILAND.paths.map((d, i) => (
        <path key={i} d={d} fill="rgba(233,162,59,0.30)" stroke="white" strokeWidth={2.4 / k} strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 3px rgba(0,0,0,.6))" }} />
      ))}
    </svg>
  );
};

/** Faint province borders (geoBoundaries ADM1) inside the country. */
export const ProvinceBorders: React.FC<{ cam: Cam; o: number }> = ({ cam, o }) => {
  const k = camScale(cam);
  const vw = 1920 / k, vh = 1080 / k;
  return (
    <svg viewBox={`${cam.cx - vw / 2} ${cam.cy - vh / 2} ${vw} ${vh}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: o }}>
      {PROVINCES.all.map((d, i) => <path key={i} d={d} fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth={1.3 / k} strokeLinejoin="round" />)}
    </svg>
  );
};

/** A province that pops up off the map like the country silhouette — solid colour, white edge, lifted shadow. */
export const ProvincePop: React.FC<{ cam: Cam; name: keyof typeof PROVINCES.named; color: string; at: number; settle?: number }> = ({ cam, name, color, at, settle = 0.55 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pv = PROVINCES.named[name];
  const k = camScale(cam);
  const vw = 1920 / k, vh = 1080 / k;
  const pop = spring({ frame: f - at, fps, config: { damping: 10, stiffness: 150 } });
  const rest = interpolate(f, [at + 14, at + 30], [1, settle], clamp);
  const sc = 0.7 + 0.3 * pop;
  const lift = 8 * pop * rest;
  if (f < at) return null;
  return (
    <svg viewBox={`${cam.cx - vw / 2} ${cam.cy - vh / 2} ${vw} ${vh}`}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: Math.min(pop * 1.5, 1),
        filter: `drop-shadow(0 ${lift}px ${6 + 10 * pop}px rgba(0,0,0,${0.35 + 0.25 * rest}))` }}>
      <g transform={`translate(${pv.cx} ${pv.cy}) scale(${sc}) translate(${-pv.cx} ${-pv.cy - lift / k})`}>
        {pv.paths.map((d, i) => (
          <path key={i} d={d} fill={color} fillOpacity={0.35 + 0.55 * rest} stroke="white" strokeWidth={2.6 / k} strokeLinejoin="round" />
        ))}
      </g>
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

// ── Scene A · Cold open: footage → whip into a spinning globe → zoom into Thailand → flat map → flag pop → neck → tick ──
// hook word times (global): Thailand 1.35 · narrow 2.17 · cycle across 3.25 · entire country 4.09 · before lunch 4.89
// globe_in.mp4 (48 f, rendered by assets/globe/render_globe.py) ends exactly on the flat map's first camera.
const GLOBE_AT = s(0.95), GLOBE_LEN = 48;
export const ColdOpen: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [nx, ny] = [(THAILAND.narrow.a[0] + THAILAND.narrow.b[0]) / 2, THAILAND.narrow.a[1]];
  const cam = useCam([
    [s(2.45), 500 - 560, 940, 1980],
    [s(3.1), 500 - 560, 945, 1920],
    [s(4.0), nx - 70, ny, 215],
    [dur, nx - 64, ny, 196],
  ]);
  // footage → globe whip
  const whip = interpolate(f, [s(0.9), s(1.15)], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const footO = interpolate(f, [s(0.9), s(1.12)], [1, 0], clamp);
  const globeIn = interpolate(f, [GLOBE_AT, GLOBE_AT + 5], [0, 1], clamp);
  const globeBlurIn = interpolate(f, [GLOBE_AT, GLOBE_AT + 8], [14, 0], clamp);
  // globe → flat map handoff
  const globeOut = interpolate(f, [s(2.35), s(2.55)], [1, 0], clamp);
  const zoomBlur = interpolate(f, [s(3.1), s(3.55), s(4.0)], [0, 6, 0], clamp);
  const mapBlur = interpolate(f, [s(2.35), s(2.6)], [6, 0], clamp) + zoomBlur;
  const pop = spring({ frame: f - s(2.55), fps, config: { damping: 11, stiffness: 140 } });
  const flagFade = interpolate(f, [s(3.1), s(3.7)], [1, 0], clamp);
  const tint = interpolate(f, [s(3.25), s(3.8)], [0, 1], clamp);
  const out = interpolate(f, [dur - 8, dur], [1, 0], clamp);
  const A = toScreen(cam, THAILAND.narrow.a[0], ny), B = toScreen(cam, THAILAND.narrow.b[0], ny);
  const ext = 26;
  const pa = { x: A.x - ext, y: A.y }, pb = { x: B.x + ext, y: B.y };
  const mid = { x: (A.x + B.x) / 2, y: A.y };
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Basemap cam={cam} blur={mapBlur} />
      <TerritoryTint cam={cam} o={tint} />
      <ProvinceBorders cam={cam} o={tint} />
      <ProvincePop cam={cam} name="Prachuap Khiri Khan" color={C.tealBright} at={s(3.85)} settle={0.45} />
      <FlagSilhouette cam={cam} pop={pop} fade={flagFade} />
      <MapLabel cam={cam} ux={500} uy={700} text="Thailand" at={s(2.65)} size={40} />
      <MapLabel cam={cam} ux={225} uy={1060} text="Myanmar" at={s(3.65)} />
      <MapLabel cam={cam} ux={292} uy={1010} text="Thailand" at={s(3.7)} size={26} />
      <MapLabel cam={cam} ux={350} uy={1150} text="Gulf of Thailand" at={s(3.75)} />
      <MapLabel cam={cam} ux={95} uy={1180} text="Andaman Sea" at={s(3.85)} />
      <DashLine a={pa} b={pb} drawAt={s(4.1)} tickAt={s(4.6)} />
      <PinTick x={mid.x} y={mid.y} at={s(4.6)} dot={false} />
      <MapLabel cam={cam} ux={296} uy={1071} text="Prachuap Khiri Khan" dx={150} dy={-120} at={s(4.75)} leader size={28} />
      <LeftWash strength={0.72} />
      <div style={{ position: "absolute", left: 120, top: 360, width: 980 }}>
        <Rise delay={s(4.85)}>
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 150, color: C.amber, lineHeight: 1, whiteSpace: "nowrap", textShadow: "0 4px 18px rgba(0,0,0,.5)" }}>≈ 11–12 km</div>
        </Rise>
        <Rise delay={s(5.15)}>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 40, color: C.paper, marginTop: 18, textShadow: "0 2px 10px rgba(0,0,0,.6)" }}>
            from the Gulf of Thailand to the Myanmar border
          </div>
        </Rise>
      </div>
      {/* spinning globe that zooms into Thailand */}
      <Sequence from={GLOBE_AT} durationInFrames={GLOBE_LEN} premountFor={30}>
        <AbsoluteFill style={{ opacity: globeIn * globeOut, filter: globeBlurIn > 0.2 ? `blur(${globeBlurIn}px)` : undefined }}>
          <OffthreadVideo src={staticFile("globe_in.mp4")} muted style={{ width: "100%", height: "100%" }} />
        </AbsoluteFill>
      </Sequence>
      {/* opening footage, whipped away */}
      <AbsoluteFill style={{ opacity: footO, filter: `blur(${whip * 18}px)`, transform: `scale(${1 + whip * 0.3})` }}>
        <DriftVideo src="sample/coast_karst.mp4" dur={s(1.2)} />
      </AbsoluteFill>
      <Credit text="Globe & basemap: NASA Blue Marble (public domain) · Boundaries: geoBoundaries (CC BY 4.0) · Footage: Wowa84 / Pixabay" />
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
            <div style={{ fontFamily: MONO, fontSize: 24, color: C.tealBright, letterSpacing: 3 }}>NO. {String(n).padStart(2, "0")} / 20 · {act}</div>
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

// ── Scene D1 · Ledger reveal over the spinning drive ─────────────────────────
// body narration timing (from word timestamps, scene-local): "a quarter" 3.1s, "40%" 3.6s, "hard drives" 5.0s
export const DriveShare: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const dash = interpolate(f, [s(3.55), s(3.85)], [0, 1], clamp);
  const out = interpolate(f, [dur - 6, dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <DriftVideo src="sample/hdd_spin.mp4" dur={dur} from={1.08} to={1.16} origin="62% 50%" />
      <LeftWash strength={0.9} />
      <div style={{ position: "absolute", left: 120, top: 300 }}>
        <Rise delay={s(1.2)}>
          <div style={{ fontFamily: MONO, fontSize: 24, color: C.tealBright, letterSpacing: 3 }}>THAILAND · 2011</div>
        </Rise>
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 200, color: C.amber, lineHeight: 1, marginTop: 14, display: "flex" }}>
          <Count to={25} startFrame={s(3.0)} dur={14} />
          <span style={{ opacity: dash, transform: `translateX(${(1 - dash) * -20}px)` }}>–40%</span>
        </div>
        <Rise delay={s(4.4)}>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 44, color: C.paper, width: 760, lineHeight: 1.25, marginTop: 10 }}>
            of the world's hard drives were built here
          </div>
        </Rise>
      </div>
      <Credit text="Sources: IDC · IHS iSuppli · AP (2011)   ·   Footage: MarandaP / Pixabay" />
    </AbsoluteFill>
  );
};

// ── Scene D2 · Pin tick on Ayutthaya → whip into the satellite → before/after wipe ──
// body word times (global, +0.6 s globe shift): When 19.18 · factories 19.54 · went under water 20.0–21.0 · prices jumped 21.16
export const FloodWipe: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const AY = THAILAND.ayutthaya;
  const cam = useCam([[0, AY[0] - 60, AY[1] + 40, 620], [s(1.5), AY[0] - 30, AY[1] + 28, 300]]);
  const pin = toScreen(cam, AY[0], AY[1]);
  const prov = interpolate(f, [0, s(0.3)], [0, 1], clamp);
  const whip = interpolate(f, [s(1.35), s(1.6)], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const satIn = interpolate(f, [s(1.4), s(1.65)], [0, 1], clamp);
  const satBlur = interpolate(f, [s(1.4), s(1.75)], [16, 0], clamp);
  const satScale = interpolate(f, [s(1.4), s(1.75)], [1.18, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const wipe = interpolate(f, [s(1.65), s(2.6)], [0, 100], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const out = interpolate(f, [dur - 18, dur], [1, 0], clamp);
  const labelBefore = interpolate(wipe, [0, 40], [1, 0], clamp);
  const labelAfter = interpolate(wipe, [60, 100], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: out, background: C.ink }}>
      {/* map beat: provinces → Ayutthaya province pops → pin ticks */}
      <AbsoluteFill style={{ opacity: 1 - satIn, filter: `blur(${whip * 16}px)`, transform: `scale(${1 + whip * 0.25})`, transformOrigin: `${pin.x}px ${pin.y}px` }}>
        <Basemap cam={cam} />
        <ProvinceBorders cam={cam} o={prov} />
        <ProvincePop cam={cam} name="Bangkok" color={C.tealBright} at={s(0.25)} settle={0.35} />
        <ProvincePop cam={cam} name="Phra Nakhon Si Ayutthaya" color={C.amber} at={s(0.1)} settle={0.5} />
        <MapLabel cam={cam} ux={PROVINCES.named["Bangkok"].cx} uy={PROVINCES.named["Bangkok"].cy} text="Bangkok" dy={70} at={s(0.35)} size={26} />
        <MapLabel cam={cam} ux={AY[0]} uy={AY[1]} text="Ayutthaya" dx={-210} dy={-110} at={s(0.75)} leader />
        <PinTick x={pin.x} y={pin.y} at={s(0.7)} color="#E5484D" />
      </AbsoluteFill>
      {/* satellite before/after */}
      <AbsoluteFill style={{ opacity: satIn, filter: satBlur > 0.2 ? `blur(${satBlur}px)` : undefined, transform: `scale(${satScale})` }}>
        <DriftPhoto src="sample/sat_before.jpg" dur={dur} from={1.0} to={1.06} origin="55% 45%" />
        <DriftPhoto src="sample/sat_after.jpg" dur={dur} from={1.0} to={1.06} origin="55% 45%" style={{ clipPath: `inset(0 ${100 - wipe}% 0 0)` }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${wipe}%`, width: 3, background: C.tealBright, opacity: wipe > 0 && wipe < 100 ? 1 : 0, boxShadow: `0 0 18px ${C.tealBright}` }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: satIn, background: "linear-gradient(0deg, rgba(11,21,48,0.85) 0%, rgba(11,21,48,0) 45%), linear-gradient(180deg, rgba(11,21,48,0.75) 0%, rgba(11,21,48,0) 22%)" }} />
      <div style={{ position: "absolute", left: 64, top: 52, fontFamily: MONO, fontSize: 24, color: C.paper, letterSpacing: 2, opacity: satIn }}>
        <div>AYUTTHAYA, THAILAND · NASA EO-1</div>
        <div style={{ position: "relative", height: 34, marginTop: 8 }}>
          <span style={{ position: "absolute", left: 0, top: 0, color: C.tealBright, opacity: labelBefore }}>BEFORE THE FLOOD</span>
          <span style={{ position: "absolute", left: 0, top: 0, color: C.amber, opacity: labelAfter }}>23 OCT 2011 — FLOODED</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 120, bottom: 150 }}>
        <Rise delay={s(2.75)}>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 40, color: C.paper }}>Hard-drive prices, worldwide</div>
        </Rise>
        <Rise delay={s(3.05)}>
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 150, color: C.amber, lineHeight: 1 }}>↑ 30%+</div>
        </Rise>
      </div>
      <Credit text="NASA EO-1 & Blue Marble (public domain) · Provinces: geoBoundaries CC BY 4.0 · Prices: IHS iSuppli" />
    </AbsoluteFill>
  );
};

// ── Watermark ────────────────────────────────────────────────────────────────
export const Watermark: React.FC = () => (
  <Img src={staticFile("logo_full_white.png")} style={{ position: "absolute", right: 56, bottom: 42, height: 34, opacity: 0.58 }} />
);

