import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { PROJ, COUNTRIES } from "./mapData";
import { C, SANS, Cam, camScale, toScreen, Basemap } from "./parts";
import { H, DIGI, HUDT, HudBackground } from "./hud";

// YouTube thumbnails — "The Pacific War Started Here, Not Pearl Harbor" (1920×1080 → 1280×720).
// ≤4 huge words, one focal subject, a number bubble, small brand mark.
export interface ThumbProps { variant?: "map" | "clock" | "doodle" }

const ll = (lon: number, lat: number): [number, number] => [(lon - PROJ.lon0) * PROJ.k * PROJ.sx, (PROJ.lat1 - lat) * PROJ.sx];
const geoCam = (lon: number, lat: number, vhDeg: number): Cam => { const [x, y] = ll(lon, lat); return { cx: x, cy: y, vh: vhDeg * PROJ.sx }; };
const Outline: React.FC<{ children: React.ReactNode; size: number; color?: string; style?: React.CSSProperties }> = ({ children, size, color = "white", style }) => (
  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: size, lineHeight: 0.92, letterSpacing: -2, color, textTransform: "uppercase",
    WebkitTextStroke: `${Math.round(size / 26)}px #0B1530`, paintOrder: "stroke fill", textShadow: "0 10px 30px rgba(0,0,0,.65)", whiteSpace: "nowrap", ...style }}>{children}</div>
);
const Brand: React.FC = () => (
  <div style={{ position: "absolute", left: 70, top: 56, display: "flex", alignItems: "center", gap: 14, opacity: 0.95 }}>
    <Img src={staticFile("logo_mark_white.png")} style={{ height: 52 }} />
    <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, color: C.paper, textShadow: "0 2px 10px rgba(0,0,0,.7)" }}>The Sundaland</div>
  </div>
);
const Bubble: React.FC<{ x: number; y: number; text: string; bg?: string; fg?: string; size?: number; rot?: number }> = ({ x, y, text, bg = C.amber, fg = C.ink, size = 96, rot = -4 }) => (
  <div style={{ position: "absolute", left: x, top: y, padding: "10px 28px", background: bg, borderRadius: 18, transform: `rotate(${rot}deg)`,
    fontFamily: SANS, fontWeight: 700, fontSize: size, color: fg, boxShadow: "0 14px 36px rgba(0,0,0,.5)", whiteSpace: "nowrap" }}>{text}</div>
);
const Shape: React.FC<{ cam: Cam; name: string; fill: string }> = ({ cam, name, fill }) => {
  const c = (COUNTRIES as any)[name]; if (!c) return null;
  const k = camScale(cam), vw = 1920 / k, vh = 1080 / k;
  return (
    <svg viewBox={`${cam.cx - vw / 2} ${cam.cy - vh / 2} ${vw} ${vh}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "drop-shadow(0 14px 22px rgba(0,0,0,.6))" }}>
      {c.paths.map((d: string, i: number) => <path key={i} d={d} fill={fill} stroke="white" strokeWidth={3 / k} strokeLinejoin="round" />)}
    </svg>
  );
};
const Pin: React.FC<{ cam: Cam; lon: number; lat: number }> = ({ cam, lon, lat }) => {
  const P = toScreen(cam, ...ll(lon, lat));
  return <div style={{ position: "absolute", left: P.x - 26, top: P.y - 26, width: 52, height: 52, borderRadius: 26, background: "#E5484D", border: "6px solid white", boxShadow: "0 0 30px #E5484D" }} />;
};

export const Thumb: React.FC<ThumbProps> = ({ variant = "map" }) => {
  if (variant === "clock") {
    return (
      <AbsoluteFill>
        <HudBackground dur={1}>
          <div style={{ position: "absolute", left: 980, top: 220, fontFamily: HUDT, fontWeight: 700, fontSize: 40, color: H.amber, letterSpacing: 4 }}>KOTA BHARU</div>
          <div style={{ position: "absolute", left: 970, top: 260, fontFamily: DIGI, fontWeight: 700, fontSize: 230, color: H.amber, transform: "skewX(-9deg)", textShadow: `0 0 30px ${H.amber}` }}>00:30</div>
          <div style={{ position: "absolute", left: 980, top: 560, fontFamily: HUDT, fontWeight: 700, fontSize: 40, color: H.cyan, letterSpacing: 4 }}>PEARL HARBOR</div>
          <div style={{ position: "absolute", left: 970, top: 600, fontFamily: DIGI, fontWeight: 700, fontSize: 230, color: H.ice, transform: "skewX(-9deg)", textShadow: `0 0 30px ${H.cyan}`, opacity: 0.55 }}>01:48</div>
        </HudBackground>
        <div style={{ position: "absolute", left: 70, top: 300 }}>
          <Outline size={170}>IT</Outline><Outline size={170}>STARTED</Outline><Outline size={170} color={C.amber}>HERE</Outline>
        </div>
        <Bubble x={90} y={860} text="78 MIN EARLIER" size={70} rot={-3} />
        <Brand />
      </AbsoluteFill>
    );
  }
  if (variant === "doodle") {
    return (
      <AbsoluteFill>
        <Img src={staticFile("bg/night_beach.jpg")} style={{ width: 1920, height: 1080 }} />
        {[640, 900, 1160].map((x, i) => <Img key={i} src={staticFile("sprites/transport_ship.png")} style={{ position: "absolute", left: x - 120, top: 470, height: 170 }} />)}
        <Img src={staticFile("sprites/df_lookout.png")} style={{ position: "absolute", left: 1400, top: 360, height: 680 }} />
        <div style={{ position: "absolute", left: 70, top: 640 }}>
          <Outline size={150}>NOT PEARL</Outline><Outline size={150} color={C.amber}>HARBOR</Outline>
        </div>
        <Bubble x={1180} y={180} text="8 DEC 1941" size={74} rot={4} />
        <Brand />
      </AbsoluteFill>
    );
  }
  const cam = geoCam(98.6, 4.2, 11);
  return (
    <AbsoluteFill>
      <Basemap cam={cam} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(8,14,32,0.92) 0%, rgba(8,14,32,0.6) 38%, rgba(8,14,32,0) 60%)" }} />
      <Shape cam={cam} name="British Malaya" fill="rgba(233,162,59,0.92)" />
      <Pin cam={cam} lon={102.24} lat={6.13} />
      <div style={{ position: "absolute", left: 70, top: 250 }}>
        <Outline size={160}>BEFORE</Outline><Outline size={160}>PEARL</Outline><Outline size={160} color={C.amber}>HARBOR</Outline>
      </div>
      <Bubble x={1400} y={760} text="78 MIN" size={110} rot={-4} />
      <Brand />
    </AbsoluteFill>
  );
};
