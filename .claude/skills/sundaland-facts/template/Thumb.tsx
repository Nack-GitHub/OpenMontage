import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { PROJ } from "./mapData";
import { C, SERIF, SANS, MONO, Cam, toScreen, Basemap, FlagSilhouette, DashLine } from "./parts";
import { CountryPop, Durian, ll } from "./fx";
import { ShelfOverlay } from "./scenes";

// YouTube thumbnails (rendered 1920×1080 → exported 1280×720). Few words, huge type, one focal subject.
export interface ThumbProps { variant?: "narrow" | "durian" | "sundaland" }

const geoCam = (lon: number, lat: number, vhDeg: number): Cam => { const [x, y] = ll(lon, lat); return { cx: x, cy: y, vh: vhDeg * PROJ.sx }; };

const Outline: React.FC<{ children: React.ReactNode; size: number; color?: string; style?: React.CSSProperties }> = ({ children, size, color = "white", style }) => (
  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: size, lineHeight: 0.92, letterSpacing: -2, color, textTransform: "uppercase",
    WebkitTextStroke: `${Math.round(size / 26)}px #0B1530`, paintOrder: "stroke fill", textShadow: "0 10px 30px rgba(0,0,0,.65)", ...style }}>{children}</div>
);

const LeftShade: React.FC<{ w?: number }> = ({ w = 62 }) => (
  <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(8,14,32,0.92) 0%, rgba(8,14,32,0.7) ${w * 0.6}%, rgba(8,14,32,0) ${w}%)` }} />
);

const Brand: React.FC = () => (
  <div style={{ position: "absolute", left: 70, top: 56, display: "flex", alignItems: "center", gap: 14, opacity: 0.95 }}>
    <Img src={staticFile("logo_mark_white.png")} style={{ height: 52 }} />
    <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, color: C.paper }}>The Sundaland</div>
  </div>
);

const Narrow: React.FC = () => {
  const cam = geoCam(95.3, 12.6, 16.5);
  const a = toScreen(cam, ...ll(99.45, 11.66)), b = toScreen(cam, ...ll(99.86, 11.66));
  return (
    <AbsoluteFill>
      <Basemap cam={cam} />
      <FlagSilhouette cam={cam} pop={1} fade={1} />
      <svg style={{ position: "absolute", inset: 0, width: 1920, height: 1080, overflow: "visible" }}>
        <circle cx={(a.x + b.x) / 2} cy={a.y} r={70} fill="none" stroke={C.amber} strokeWidth={10} style={{ filter: `drop-shadow(0 0 16px ${C.amber})` }} />
        <path d={`M${(a.x + b.x) / 2 + 60},${a.y - 40} L${(a.x + b.x) / 2 + 250},${a.y - 190}`} stroke={C.amber} strokeWidth={10} strokeLinecap="round" />
      </svg>
      <DashLine a={{ x: a.x - 20, y: a.y }} b={{ x: b.x + 20, y: b.y }} drawAt={-30} tickAt={-10} />
      <div style={{ position: "absolute", left: (a.x + b.x) / 2 + 230, top: a.y - 330, padding: "12px 30px", background: C.amber, borderRadius: 18, transform: "rotate(-4deg)",
        fontFamily: SANS, fontWeight: 700, fontSize: 110, color: C.ink, boxShadow: "0 14px 36px rgba(0,0,0,.5)" }}>11 KM</div>
      <LeftShade w={58} />
      <div style={{ position: "absolute", left: 70, top: 250 }}>
        <Outline size={210}>Sounds</Outline>
        <Outline size={250} color={C.amber}>Fake</Outline>
        <div style={{ marginTop: 34, display: "inline-block", padding: "12px 28px", background: C.tealBright, borderRadius: 12, fontFamily: SANS, fontWeight: 700, fontSize: 58, color: C.ink }}>BUT IT'S TRUE</div>
      </div>
      <Brand />
    </AbsoluteFill>
  );
};

const DurianThumb: React.FC = () => {
  const cam = geoCam(105, 17.5, 26);
  const A = toScreen(cam, ...ll(102.1, 12.6)), B = toScreen(cam, ...ll(113.3, 23.1));
  const Cc = { x: (A.x + B.x) / 2 - (B.y - A.y) * 0.22, y: (A.y + B.y) / 2 + (B.x - A.x) * 0.22 };
  return (
    <AbsoluteFill>
      <Basemap cam={cam} />
      <CountryPop cam={cam} name="China" color="#D7262E" at={-60} settle={0.9} />
      <FlagSilhouette cam={cam} pop={1} fade={1} />
      <svg style={{ position: "absolute", inset: 0, width: 1920, height: 1080, overflow: "visible" }}>
        <path d={`M${A.x},${A.y} Q${Cc.x},${Cc.y} ${B.x},${B.y}`} fill="none" stroke={C.amber} strokeWidth={12} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 12px ${C.amber})` }} />
        <circle cx={B.x} cy={B.y} r={18} fill={C.amber} stroke="white" strokeWidth={6} />
      </svg>
      {[0.3, 0.55, 0.8].map((t, i) => {
        const x = (1 - t) ** 2 * A.x + 2 * (1 - t) * t * Cc.x + t * t * B.x, y = (1 - t) ** 2 * A.y + 2 * (1 - t) * t * Cc.y + t * t * B.y;
        return <div key={i} style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)", filter: "drop-shadow(0 8px 10px rgba(0,0,0,.5))" }}><Durian size={110} spin={i * 25} /></div>;
      })}
      <LeftShade w={55} />
      <div style={{ position: "absolute", left: 30, bottom: -30, filter: "drop-shadow(0 20px 30px rgba(0,0,0,.6))" }}><Durian size={520} spin={-12} /></div>
      <div style={{ position: "absolute", left: 70, top: 170 }}>
        <Outline size={230} color={C.amber}>$4 BN</Outline>
        <Outline size={150}>Fruit?!</Outline>
      </div>
      <Brand />
    </AbsoluteFill>
  );
};

const SundaThumb: React.FC = () => {
  const cam = geoCam(100.8, 5.5, 25);
  const A = toScreen(cam, ...ll(100.6, 13.6)), B = toScreen(cam, ...ll(110.8, 1.4));
  return (
    <AbsoluteFill>
      <Basemap cam={cam} />
      <ShelfOverlay cam={cam} o={1} />
      <svg style={{ position: "absolute", inset: 0, width: 1920, height: 1080, overflow: "visible" }}>
        <path d={`M${A.x},${A.y} L${B.x},${B.y}`} stroke="white" strokeWidth={12} strokeDasharray="28 18" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,.8))" }} />
        <circle cx={A.x} cy={A.y} r={20} fill={C.amber} stroke="white" strokeWidth={6} />
        <circle cx={B.x} cy={B.y} r={20} fill={C.tealBright} stroke="white" strokeWidth={6} />
      </svg>
      <div style={{ position: "absolute", left: A.x + 34, top: A.y - 64, fontFamily: SANS, fontWeight: 700, fontStyle: "italic", fontSize: 54, color: "white", textShadow: "0 3px 10px rgba(0,0,0,.9)" }}>Thailand</div>
      <div style={{ position: "absolute", left: B.x + 30, top: B.y - 20, fontFamily: SANS, fontWeight: 700, fontStyle: "italic", fontSize: 54, color: "white", textShadow: "0 3px 10px rgba(0,0,0,.9)" }}>Borneo</div>
      <LeftShade w={50} />
      <div style={{ position: "absolute", left: 70, top: 230 }}>
        <Outline size={190}>Walk to</Outline>
        <Outline size={230} color={C.amber}>Borneo?</Outline>
        <div style={{ marginTop: 30, fontFamily: MONO, fontSize: 44, color: C.tealBright, letterSpacing: 4, textShadow: "0 3px 10px rgba(0,0,0,.9)" }}>20,000 YEARS AGO</div>
      </div>
      <Brand />
    </AbsoluteFill>
  );
};

export const Thumb: React.FC<ThumbProps> = ({ variant = "narrow" }) => (
  <AbsoluteFill style={{ background: C.ink }}>
    {variant === "narrow" ? <Narrow /> : variant === "durian" ? <DurianThumb /> : <SundaThumb />}
  </AbsoluteFill>
);
