import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { PROJ, COUNTRIES } from "./mapData";
import { C, SANS, MONO, Cam, toScreen, Basemap, FlagSilhouette, RegionBorders } from "./parts";
import { ll } from "./fx";
import { H, DIGI, HUDT, HudBackground, Ring, Badge, glow } from "./hud";

// YouTube thumbnails (rendered 1920×1080 → exported 1280×720). ≤4 huge words, one focal subject, small brand mark.
// Proven channel style first: big words + flag-filled country on the satellite map + number bubble.
export interface ThumbProps { variant?: "broke" | "versus" | "hud" }

const geoCam = (lon: number, lat: number, vhDeg: number): Cam => { const [x, y] = ll(lon, lat); return { cx: x, cy: y, vh: vhDeg * PROJ.sx }; };
const cxy = (cam: Cam, name: string) => { const c = COUNTRIES[name]; return toScreen(cam, c.cx, c.cy); };

const Outline: React.FC<{ children: React.ReactNode; size: number; color?: string; style?: React.CSSProperties }> = ({ children, size, color = "white", style }) => (
  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: size, lineHeight: 0.92, letterSpacing: -2, color, textTransform: "uppercase",
    WebkitTextStroke: `${Math.round(size / 26)}px #0B1530`, paintOrder: "stroke fill", textShadow: "0 10px 30px rgba(0,0,0,.65)", whiteSpace: "nowrap", ...style }}>{children}</div>
);
const LeftShade: React.FC<{ w?: number }> = ({ w = 62 }) => (
  <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(8,14,32,0.94) 0%, rgba(8,14,32,0.72) ${w * 0.6}%, rgba(8,14,32,0) ${w}%)` }} />
);
const Brand: React.FC = () => (
  <div style={{ position: "absolute", left: 70, top: 56, display: "flex", alignItems: "center", gap: 14, opacity: 0.95 }}>
    <Img src={staticFile("logo_mark_white.png")} style={{ height: 52 }} />
    <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, color: C.paper }}>The Sundaland</div>
  </div>
);
const Bubble: React.FC<{ x: number; y: number; text: string; bg?: string; fg?: string; size?: number; rot?: number }> = ({ x, y, text, bg = C.amber, fg = C.ink, size = 96, rot = -4 }) => (
  <div style={{ position: "absolute", left: x, top: y, padding: "10px 28px", background: bg, borderRadius: 18, transform: `rotate(${rot}deg)`,
    fontFamily: SANS, fontWeight: 700, fontSize: size, color: fg, boxShadow: "0 14px 36px rgba(0,0,0,.5)", whiteSpace: "nowrap" }}>{text}</div>
);

/** A — proven style: "FIRST TO GO BROKE?" + big Laos flag silhouette on the satellite map + "½ THE DEBT" bubble. */
const Broke: React.FC = () => {
  const cam = geoCam(96.6, 17.6, 15);
  const L = cxy(cam, "Laos");
  return (
    <AbsoluteFill>
      <Basemap cam={cam} />
      <RegionBorders cam={cam} o={0.6} />
      <FlagSilhouette cam={cam} country="Laos" pop={1} fade={1} boost={1.12} />
      <svg style={{ position: "absolute", inset: 0, width: 1920, height: 1080, overflow: "visible" }}>
        <circle cx={L.x + 10} cy={L.y + 10} r={330} fill="none" stroke="#e5484d" strokeWidth={14} style={{ filter: "drop-shadow(0 0 18px #e5484d)" }} />
      </svg>
      <LeftShade w={52} />
      <div style={{ position: "absolute", left: 70, top: 250 }}>
        <Outline size={200}>First to</Outline>
        <Outline size={230} color={C.amber}>Go broke?</Outline>
      </div>
      <Bubble x={L.x - 360} y={L.y + 300} text="½ THE DEBT" />
      <Brand />
    </AbsoluteFill>
  );
};

/** B — the twist: Singapore flag (≈170% · AAA) vs Laos flag (≈83% · danger). "MORE DEBT, SAFER?" */
const Versus: React.FC = () => {
  const cam = geoCam(96.8, 11.2, 29);
  const S = cxy(cam, "Singapore"), L = cxy(cam, "Laos");
  return (
    <AbsoluteFill>
      <Basemap cam={cam} />
      <RegionBorders cam={cam} o={0.5} />
      <FlagSilhouette cam={cam} country="Laos" pop={1} fade={1} boost={1.1} />
      <FlagSilhouette cam={cam} country="Singapore" pop={1} fade={1} boost={9} />
      <LeftShade w={46} />
      <div style={{ position: "absolute", left: 70, top: 260 }}>
        <Outline size={190}>More debt</Outline>
        <Outline size={250} color={C.amber}>Safer?</Outline>
      </div>
      <Bubble x={L.x + 150} y={L.y - 150} text="83% ⚠" bg="#e5484d" fg="white" size={100} rot={-3} />
      <Bubble x={S.x + 120} y={S.y - 110} text="170% AAA" bg={C.tealBright} size={100} rot={3} />
      <Brand />
    </AbsoluteFill>
  );
};

/** C — HUD dashboard look: Laos flag silhouette on a glowing pedestal, red risk gauge, "BROKE NEXT?". */
const Hud: React.FC = () => {
  const cam: Cam = (() => { const c = COUNTRIES["Laos"]; const h = (c.bbox[3] - c.bbox[1]) * 1.25; return { cx: c.cx - (c.bbox[2] - c.bbox[0]) * 0.55, cy: c.cy, vh: h }; })();
  return (
    <AbsoluteFill>
      <HudBackground dur={1} />
      <svg style={{ position: "absolute", inset: 0, width: 1920, height: 1080 }}>
        <ellipse cx={1290} cy={930} rx={420} ry={70} fill="none" stroke={H.cyan} strokeWidth={5} style={{ filter: glow(H.cyan, 14) }} />
        <ellipse cx={1290} cy={930} rx={330} ry={52} fill="rgba(57,213,255,0.15)" stroke={H.cyan} strokeWidth={2} />
      </svg>
      <div style={{ position: "absolute", inset: 0, filter: `drop-shadow(0 0 30px ${H.cyan})` }}>
        <FlagSilhouette cam={cam} country="Laos" pop={1} fade={1} />
      </div>
      <Ring cx={1640} cy={260} r={130} segs={[{ v: 83, color: H.red }]} at={-60} dur={1} width={18}>
        <div style={{ fontFamily: DIGI, fontWeight: 700, fontSize: 64, color: H.ice, transform: "skewX(-9deg)", textShadow: `0 0 16px ${H.red}` }}>83%</div>
        <div style={{ fontFamily: HUDT, fontWeight: 600, fontSize: 26, color: H.dim, letterSpacing: 3 }}>DEBT · GDP</div>
      </Ring>
      <Badge x={1300} y={140} text="FIRST IN LINE" at={-60} color={H.red} size={60} rot={-3} />
      <div style={{ position: "absolute", left: 70, top: 300 }}>
        <div style={{ fontFamily: DIGI, fontWeight: 900, fontSize: 210, lineHeight: 0.95, color: H.ice, transform: "skewX(-9deg)", textShadow: `0 0 26px ${H.blue}` }}>BROKE</div>
        <div style={{ fontFamily: DIGI, fontWeight: 900, fontSize: 230, lineHeight: 0.95, color: H.amber, transform: "skewX(-9deg)", textShadow: `0 0 30px ${H.amber}` }}>NEXT?</div>
        <div style={{ marginTop: 26, fontFamily: MONO, fontSize: 40, color: H.cyan, letterSpacing: 4 }}>SOUTHEAST ASIA · 15 FACTS</div>
      </div>
      <Brand />
    </AbsoluteFill>
  );
};

export const Thumb: React.FC<ThumbProps> = ({ variant = "broke" }) => (
  <AbsoluteFill style={{ background: C.ink }}>
    {variant === "broke" ? <Broke /> : variant === "versus" ? <Versus /> : <Hud />}
  </AbsoluteFill>
);
