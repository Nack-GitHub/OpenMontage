import React from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PROJ, BASE_LAYERS, PROVINCES } from "./mapData";
import { RouteFX, FlowArc, followCam, CountryPop, IconBurst, CountUp } from "./fx";
import {
  C, SERIF, SANS, MONO, s, clamp, Cam, camScale, toScreen, useCam, Basemap, FlagSilhouette, TerritoryTint, ProvinceBorders,
  MapLabel, PinTick, DashLine, DriftVideo, DriftPhoto, Rise, Credit, LeftWash,
} from "./parts";

// ── geo helpers ──────────────────────────────────────────────────────────────
export const ll = (lon: number, lat: number): [number, number] => [(lon - PROJ.lon0) * PROJ.k * PROJ.sx, (PROJ.lat1 - lat) * PROJ.sx];
type CamKey = [number, number, number, number]; // [sec, lon, lat, vh in degrees of latitude]
const useGeoCam = (keys: CamKey[]): Cam => useCam(keys.map(([t, lon, lat, vh]) => { const [x, y] = ll(lon, lat); return [s(t), x, y, vh * PROJ.sx]; }) as [number, number, number, number][]);

// ── small atoms ──────────────────────────────────────────────────────────────
const Tag: React.FC<{ text?: string }> = ({ text = "ILLUSTRATIVE FOOTAGE" }) => (
  <div style={{ position: "absolute", right: 56, top: 44, fontFamily: MONO, fontSize: 17, letterSpacing: 2, color: C.paper, opacity: 0.7,
    padding: "6px 12px", border: "1px solid rgba(242,239,230,0.45)", borderRadius: 3 }}>{text}</div>
);

const Chip: React.FC<{ text: string; at?: number }> = ({ text, at = 8 }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at, at + 10], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 120, bottom: 128, opacity: o, transform: `translateX(${(1 - o) * -24}px)`, display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 6, height: 44, background: `linear-gradient(180deg, ${C.tealBright}, ${C.navy})` }} />
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 38, color: C.paper, textShadow: "0 2px 12px rgba(0,0,0,.7)" }}>{text}</div>
    </div>
  );
};

export type Stat = { big: string; small?: string; src?: string; at?: number };
const StatBlock: React.FC<{ st: Stat; top?: number }> = ({ st, top = 330 }) => (
  <div style={{ position: "absolute", left: 120, top, width: 1000 }}>
    <Rise delay={st.at ?? 10}>
      <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: st.big.length > 9 ? 120 : 160, color: C.amber, lineHeight: 1, textShadow: "0 4px 18px rgba(0,0,0,.5)" }}>{st.big}</div>
    </Rise>
    {st.small && (
      <Rise delay={(st.at ?? 10) + 8}>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 40, color: C.paper, marginTop: 16, width: 860, lineHeight: 1.25, textShadow: "0 2px 10px rgba(0,0,0,.6)" }}>{st.small}</div>
      </Rise>
    )}
    {st.src && (
      <Rise delay={(st.at ?? 10) + 14}>
        <div style={{ fontFamily: MONO, fontSize: 20, color: C.tealBright, marginTop: 18, letterSpacing: 1 }}>{st.src}</div>
      </Rise>
    )}
  </div>
);

const fadeIO = (f: number, dur: number, a = 6, b = 6) => Math.min(interpolate(f, [0, a], [0, 1], clamp), interpolate(f, [dur - b, dur], [1, 0], clamp));

// ── Footage & photo shots ────────────────────────────────────────────────────
export const FootageScene: React.FC<{ dur: number; p: any }> = ({ dur, p }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: fadeIO(f, dur, 4, 4) }}>
      <DriftVideo src={p.src} dur={dur} start={p.start ?? 0} from={p.from ?? 1.0} to={p.to ?? 1.07} origin={p.origin ?? "50% 50%"} />
      {(p.stat || p.chip) && <LeftWash strength={p.stat ? 0.82 : 0.45} />}
      {p.stat && <StatBlock st={p.stat} />}
      {p.chip && <Chip text={p.chip} at={p.chipAt ?? 10} />}
      {p.tag && <Tag />}
      {p.credit && <Credit text={p.credit} />}
    </AbsoluteFill>
  );
};

export const PhotoScene: React.FC<{ dur: number; p: any }> = ({ dur, p }) => {
  const f = useCurrentFrame();
  const contain = p.fit === "contain";
  return (
    <AbsoluteFill style={{ opacity: fadeIO(f, dur, 4, 4), background: C.ink }}>
      {contain ? (
        <>
          <DriftPhoto src={p.src} dur={dur} from={1.15} to={1.2} style={{ filter: "blur(28px) brightness(0.55)" }} />
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <Img src={staticFile(p.src)} style={{ maxWidth: 1760, maxHeight: 900, boxShadow: "0 20px 60px rgba(0,0,0,.6)",
              transform: `scale(${interpolate(f, [0, dur], [1.0, 1.05], clamp)})`, border: "2px solid rgba(255,255,255,0.85)" }} />
          </AbsoluteFill>
        </>
      ) : (
        <DriftPhoto src={p.src} dur={dur} from={p.from ?? 1.02} to={p.to ?? 1.12} origin={p.origin ?? "50% 50%"} />
      )}
      {(p.stat || p.chip) && <LeftWash strength={p.stat ? 0.82 : 0.45} />}
      {p.stat && <StatBlock st={p.stat} />}
      {p.chip && <Chip text={p.chip} at={p.chipAt ?? 10} />}
      {p.tag && <Tag text={p.tag === true ? undefined : p.tag} />}
      {p.credit && <Credit text={p.credit} />}
    </AbsoluteFill>
  );
};

// ── Fact title card (video or photo background) ──────────────────────────────
export const TitleScene: React.FC<{ dur: number; p: any }> = ({ dur, p }) => {
  const f = useCurrentFrame();
  const rule = interpolate(f, [s(0.4), s(1.1)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const n = p.n as number;
  return (
    <AbsoluteFill style={{ opacity: fadeIO(f, dur, 5, 5) }}>
      {p.bg.type === "video" ? <DriftVideo src={p.bg.src} dur={dur} from={1.04} to={1.12} /> : <DriftPhoto src={p.bg.src} dur={dur} from={1.04} to={1.12} origin="70% 50%" />}
      <AbsoluteFill style={{ background: C.ink, opacity: 0.32 }} />
      <LeftWash strength={0.9} />
      <div style={{ position: "absolute", left: 120, top: 250, display: "flex", alignItems: "center", gap: 56 }}>
        <Rise delay={2} distance={40}>
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: n >= 10 ? 340 : 420, color: C.amber, lineHeight: 0.8 }}>{n}</div>
        </Rise>
        <div style={{ width: 3, height: 360 * rule, background: `linear-gradient(180deg, ${C.teal}, ${C.navy})` }} />
        <div>
          <Rise delay={s(0.5)}>
            <div style={{ fontFamily: MONO, fontSize: 24, color: C.tealBright, letterSpacing: 3 }}>NO. {String(n).padStart(2, "0")} / 20 · {p.act}</div>
          </Rise>
          <Rise delay={s(0.7)}>
            <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 88, color: C.paper, lineHeight: 1.04, width: 880, marginTop: 18 }}>{p.title}</div>
          </Rise>
        </div>
      </div>
      {p.credit && <Credit text={p.credit} />}
    </AbsoluteFill>
  );
};

export const MainTitle: React.FC<{ dur: number; p: any }> = ({ dur, p }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = ["20", "FACTS", "ABOUT", "THAILAND", "THAT", "SOUND", "FAKE"];
  return (
    <AbsoluteFill style={{ opacity: fadeIO(f, dur, 4, 6) }}>
      <DriftVideo src={p.src} dur={dur} from={1.05} to={1.14} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, rgba(11,21,48,0.35), rgba(11,21,48,0.85))" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", width: 1500, gap: "0 30px" }}>
          {words.map((w, i) => {
            const sp = spring({ frame: f - 4 - i * 4, fps, config: { damping: 14, stiffness: 160 } });
            const isFake = w === "FAKE";
            return <div key={i} style={{ fontFamily: SERIF, fontWeight: 600, fontSize: i === 0 ? 210 : 130, lineHeight: 1.05, color: isFake ? C.amber : C.paper,
              opacity: sp, transform: `translateY(${(1 - sp) * 40}px) scale(${0.9 + 0.1 * sp})`, textShadow: "0 6px 26px rgba(0,0,0,.5)" }}>{w}</div>;
          })}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 30, color: C.tealBright, letterSpacing: 8, marginTop: 30, opacity: interpolate(f, [40, 52], [0, 1], clamp) }}>BUT AREN'T</div>
      </AbsoluteFill>
      {p.credit && <Credit text={p.credit} />}
    </AbsoluteFill>
  );
};

// ── Map scene: the channel's map language, data-driven ───────────────────────
const RouteLine: React.FC<{ cam: Cam; pts: [number, number][]; at: number; dur: number; color: string; ship?: boolean }> = ({ cam, pts, at, dur, color, ship }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  if (f < at) return null;
  const sp = pts.map(([lo, la]) => { const [x, y] = ll(lo, la); return toScreen(cam, x, y); });
  const segs = sp.slice(1).map((q, i) => Math.hypot(q.x - sp[i].x, q.y - sp[i].y));
  const L = segs.reduce((a, b) => a + b, 0);
  let rem = L * p, head = sp[0], ang = 0;
  for (let i = 0; i < segs.length; i++) {
    if (rem <= segs[i]) { const t = rem / segs[i]; head = { x: sp[i].x + (sp[i + 1].x - sp[i].x) * t, y: sp[i].y + (sp[i + 1].y - sp[i].y) * t }; ang = Math.atan2(sp[i + 1].y - sp[i].y, sp[i + 1].x - sp[i].x); break; }
    rem -= segs[i]; head = sp[i + 1];
  }
  const d = "M" + sp.map((q) => `${q.x},${q.y}`).join(" L");
  return (
    <svg style={{ position: "absolute", inset: 0, width: 1920, height: 1080, overflow: "visible" }}>
      <path d={d} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={L} strokeDashoffset={L * (1 - p)}
        style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
      {ship && <g transform={`translate(${head.x} ${head.y}) rotate(${(ang * 180) / Math.PI})`}>
        <path d="M-22,-7 L16,-7 L26,0 L16,7 L-22,7 Z" fill="white" stroke="#0B1530" strokeWidth={2} />
        <rect x={-16} y={-4} width={22} height={8} fill="#E5484D" />
      </g>}
    </svg>
  );
};

const Arc: React.FC<{ cam: Cam; a: [number, number]; b: [number, number]; at: number; dur?: number; color?: string; label?: string; bend?: number }> = ({ cam, a, b, at, dur = 20, color = C.amber, label, bend = 0.25 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  if (f < at) return null;
  const A = toScreen(cam, ...ll(...a)), B = toScreen(cam, ...ll(...b));
  const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2, dx = B.x - A.x, dy = B.y - A.y;
  const cx = mx - dy * bend, cy = my + dx * bend;
  const d = `M${A.x},${A.y} Q${cx},${cy} ${B.x},${B.y}`;
  const L = Math.hypot(dx, dy) * 1.15;
  const t = p, hx = (1 - t) ** 2 * A.x + 2 * (1 - t) * t * cx + t * t * B.x, hy = (1 - t) ** 2 * A.y + 2 * (1 - t) * t * cy + t * t * B.y;
  const lo = interpolate(f, [at + dur * 0.7, at + dur], [0, 1], clamp);
  return (
    <svg style={{ position: "absolute", inset: 0, width: 1920, height: 1080, overflow: "visible" }}>
      <path d={d} fill="none" stroke={color} strokeWidth={5} strokeDasharray={L} strokeDashoffset={L * (1 - p)} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
      <circle cx={hx} cy={hy} r={9} fill="white" opacity={p < 1 ? 1 : 0} />
      {label && <text x={cx} y={cy - 16} textAnchor="middle" fill="white" opacity={lo} style={{ fontFamily: SANS, fontWeight: 700, fontStyle: "italic", fontSize: 34, paintOrder: "stroke", stroke: "rgba(0,0,0,.6)", strokeWidth: 6 }}>{label}</text>}
    </svg>
  );
};

const ProvincePopN: React.FC<{ cam: Cam; name: string; color: string; at: number; settle?: number }> = ({ cam, name, color, at, settle = 0.5 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pv = (PROVINCES.named as any)[name];
  if (!pv || f < at) return null;
  const k = camScale(cam), vw = 1920 / k, vh = 1080 / k;
  const pop = spring({ frame: f - at, fps, config: { damping: 10, stiffness: 150 } });
  const rest = interpolate(f, [at + 14, at + 30], [1, settle], clamp);
  const sc = 0.7 + 0.3 * pop, lift = 8 * pop * rest;
  return (
    <svg viewBox={`${cam.cx - vw / 2} ${cam.cy - vh / 2} ${vw} ${vh}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: Math.min(pop * 1.5, 1),
      filter: `drop-shadow(0 ${lift}px ${6 + 10 * pop}px rgba(0,0,0,${0.35 + 0.25 * rest}))` }}>
      <g transform={`translate(${pv.cx} ${pv.cy}) scale(${sc}) translate(${-pv.cx} ${-pv.cy - lift / k})`}>
        {pv.paths.map((d: string, i: number) => <path key={i} d={d} fill={color} fillOpacity={0.35 + 0.55 * rest} stroke="white" strokeWidth={2.4 / k} strokeLinejoin="round" />)}
      </g>
    </svg>
  );
};

export const ShelfOverlay: React.FC<{ cam: Cam; o: number }> = ({ cam, o }) => {
  const k = camScale(cam);
  const reg = BASE_LAYERS[1];
  const p = toScreen(cam, reg.x, reg.y);
  return <Img src={staticFile("sunda_shelf.png")} style={{ position: "absolute", left: p.x, top: p.y, width: reg.w * k, height: reg.h * k, maxWidth: "none", opacity: o * 0.92 }} />;
};

const Months: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const M = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const rows = [{ name: "Andaman coast · Phuket, Krabi", wet: [4, 5, 6, 7, 8, 9], col: C.tealBright }, { name: "Gulf islands · Koh Samui", wet: [9, 10, 11], col: C.amber }];
  return (
    <div style={{ position: "absolute", left: 120, top: 640 }}>
      {rows.map((r, ri) => (
        <div key={ri} style={{ marginBottom: 26, opacity: interpolate(f, [at + ri * 12, at + ri * 12 + 10], [0, 1], clamp) }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, color: C.paper, marginBottom: 8, textShadow: "0 2px 8px rgba(0,0,0,.7)" }}>{r.name} — wettest months</div>
          <div style={{ display: "flex", gap: 6 }}>
            {M.map((m, i) => {
              const on = r.wet.includes(i);
              const pop = interpolate(f, [at + ri * 12 + i * 1.5, at + ri * 12 + i * 1.5 + 6], [0, 1], clamp);
              return <div key={i} style={{ width: 52, height: 46, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
                background: on ? r.col : "rgba(11,21,48,0.65)", opacity: 0.3 + 0.7 * pop, fontFamily: MONO, fontSize: 20, color: on ? C.ink : C.paper }}>{m}</div>;
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export const MapScene: React.FC<{ dur: number; p: any }> = ({ dur, p }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const baseCam = useGeoCam(p.cam);
  const fol = p.follow ? followCam(f, p.follow, p.routes, baseCam) : null;
  const cam = fol ? fol.cam : baseCam;
  const blur = interpolate(f, [0, 8], [12, 0], clamp) + (fol ? Math.min(5, fol.speed * 0.45) : 0) + (p.whips ?? []).reduce((acc: number, w: number[]) => acc + interpolate(f, [s(w[0]), s((w[0] + w[1]) / 2), s(w[1])], [0, 9, 0], clamp), 0);
  const tint = p.tint ? interpolate(f, [s(p.tint.at), s(p.tint.at) + 12], [0, 1], clamp) : 0;
  const shelf = p.shelf ? interpolate(f, [s(p.shelf.at), s(p.shelf.at + p.shelf.dur)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) }) : 0;
  const flagPop = p.flag ? spring({ frame: f - s(p.flag.at), fps, config: { damping: 11, stiffness: 140 } }) : 0;
  const flagFade = p.flag ? interpolate(f, [s(p.flag.out ?? 99), s(p.flag.out ?? 99) + 15], [1, 0], clamp) : 0;
  return (
    <AbsoluteFill style={{ opacity: interpolate(f, [dur - 5, dur], [1, 0], clamp) }}>
      <Basemap cam={cam} blur={blur} />
      {p.shelf && <ShelfOverlay cam={cam} o={shelf} />}
      {p.tint && <TerritoryTint cam={cam} o={tint} />}
      {(p.tint || p.borders) && <ProvinceBorders cam={cam} o={p.borders ? interpolate(f, [s(p.borders.at ?? 0), s(p.borders.at ?? 0) + 10], [0, 1], clamp) : tint} />}
      {p.flag && <FlagSilhouette cam={cam} pop={flagPop} fade={flagFade} />}
      {(p.provinces ?? []).map((q: any, i: number) => <ProvincePopN key={i} cam={cam} name={q.name} color={q.color === "teal" ? C.tealBright : q.color === "amber" ? C.amber : q.color} at={s(q.at)} settle={q.settle ?? 0.5} />)}
      {(p.countries ?? []).map((q: any, i: number) => <CountryPop key={i} cam={cam} name={q.name} color={q.color === "teal" ? C.tealBright : q.color === "amber" ? C.amber : q.color} at={s(q.at)} settle={q.settle ?? 0.85} />)}
      {(p.routes ?? []).map((r: any, i: number) => <RouteFX key={i} cam={cam} r={r} />)}
      {(p.arcs ?? []).map((a: any, i: number) => <FlowArc key={i} cam={cam} a={a.a} b={a.b} at={s(a.at)} dur={s(a.dur ?? 0.8)} color={a.color === "teal" ? C.tealBright : a.color ?? C.amber} label={a.label} bend={a.bend ?? 0.22}
        icon={a.icon} count={a.count ?? 0} gap={a.gap ?? 7} travel={s(a.travel ?? 1.2)} burst={a.burst ?? true} out={a.out != null ? s(a.out) : undefined} />)}
      {(p.bursts ?? []).map((q: any, i: number) => <IconBurst key={i} cam={cam} lon={q.lon} lat={q.lat} at={s(q.at)} icon={q.icon} n={q.n ?? 6} radius={q.radius ?? 70} />)}
      {(p.dashes ?? []).map((d: any, i: number) => {
        const A = toScreen(cam, ...ll(...(d.a as [number, number]))), B = toScreen(cam, ...ll(...(d.b as [number, number])));
        return <React.Fragment key={i}><DashLine a={A} b={B} drawAt={s(d.at)} tickAt={s(d.tick)} /><PinTick x={(A.x + B.x) / 2} y={(A.y + B.y) / 2} at={s(d.tick)} dot={false} /></React.Fragment>;
      })}
      {(p.pins ?? []).map((q: any, i: number) => {
        const [x, y] = ll(q.lon, q.lat); const P = toScreen(cam, x, y);
        return <React.Fragment key={i}>
          <PinTick x={P.x} y={P.y} at={s(q.at)} color={q.color ?? "#E5484D"} />
          {q.label && <MapLabel cam={cam} ux={x} uy={y} text={q.label} dx={q.dx ?? -150} dy={q.dy ?? -100} at={s(q.at + 0.15)} leader size={q.size ?? 30} />}
        </React.Fragment>;
      })}
      {(p.labels ?? []).map((q: any, i: number) => { const [x, y] = ll(q.lon, q.lat); const lo = q.out != null ? interpolate(f, [s(q.out), s(q.out) + 8], [1, 0], clamp) : 1; return lo > 0 ? <div key={i} style={{ position: "absolute", inset: 0, opacity: lo }}><MapLabel cam={cam} ux={x} uy={y} text={q.text} at={s(q.at)} size={q.size ?? 30} /></div> : null; })}
      {p.counter && (
        <div style={{ position: "absolute", right: 90, top: 130, textAlign: "right", opacity: interpolate(f, [s(p.counter.at), s(p.counter.at) + 8], [0, 1], clamp) }}>
          <div style={{ fontFamily: MONO, fontSize: 24, color: C.tealBright, letterSpacing: 3 }}>{p.counter.label}</div>
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 120, color: C.amber, lineHeight: 1, textShadow: "0 4px 18px rgba(0,0,0,.6)" }}>
            {Math.round(interpolate(f, [s(p.counter.at), s(p.counter.at + p.counter.dur)], [p.counter.from, p.counter.to], { ...clamp, easing: Easing.inOut(Easing.cubic) }))}{p.counter.unit}
          </div>
        </div>
      )}
      {(p.stat || p.act || p.months) && <LeftWash strength={0.7} />}
      {p.stat && <StatBlock st={{ ...p.stat, at: s(p.stat.at ?? 0.6) }} />}
      {p.months && <Months at={s(p.months.at)} />}
      {p.act && (
        <div style={{ position: "absolute", left: 120, top: 380 }}>
          <Rise delay={6}><div style={{ fontFamily: MONO, fontSize: 28, color: C.tealBright, letterSpacing: 6 }}>{p.act.kicker}</div></Rise>
          <Rise delay={12}><div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 190, color: C.paper, lineHeight: 1, textShadow: "0 6px 26px rgba(0,0,0,.5)" }}>{p.act.title}</div></Rise>
        </div>
      )}
      {(p.counts ?? []).map((q: any, i: number) => <CountUp key={i} at={s(q.at)} dur={s(q.dur ?? 1.5)} to={q.to} prefix={q.prefix} suffix={q.suffix} label={q.label} x={q.x} y={q.y} decimals={q.decimals ?? 0} />)}
      {p.note && <div style={{ position: "absolute", right: 56, top: 44, fontFamily: MONO, fontSize: 17, letterSpacing: 2, color: C.paper, opacity: 0.75,
        padding: "6px 12px", border: "1px solid rgba(242,239,230,0.45)", borderRadius: 3 }}>{p.note}</div>}
      <Credit text={p.credit ?? "Map: NASA Blue Marble (public domain) · Boundaries: geoBoundaries (CC BY 4.0)"} />
    </AbsoluteFill>
  );
};

// ── Data bars ────────────────────────────────────────────────────────────────
export const BarsScene: React.FC<{ dur: number; p: any }> = ({ dur, p }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const max = p.max ?? Math.max(...p.rows.map((r: any) => r.value));
  return (
    <AbsoluteFill style={{ opacity: fadeIO(f, dur, 5, 5), background: C.ink }}>
      {p.bg && <AbsoluteFill style={{ opacity: 0.35 }}><DriftVideo src={p.bg} dur={dur} from={1.1} to={1.16} /></AbsoluteFill>}
      <AbsoluteFill style={{ background: `linear-gradient(90deg, ${C.ink} 0%, rgba(11,21,48,0.86) 60%, rgba(11,21,48,0.6) 100%)` }} />
      <div style={{ position: "absolute", left: 120, top: 150 }}>
        <Rise delay={4}><div style={{ fontFamily: MONO, fontSize: 26, color: C.tealBright, letterSpacing: 4 }}>{p.kicker}</div></Rise>
        <Rise delay={8}><div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 76, color: C.paper, marginTop: 10, width: 1600 }}>{p.title}</div></Rise>
      </div>
      <div style={{ position: "absolute", left: 120, top: 400, width: 1500 }}>
        {p.rows.map((r: any, i: number) => {
          const g = spring({ frame: f - 16 - i * 8, fps, config: { damping: 200 }, durationInFrames: 28 });
          const w = (r.value / max) * 1100 * g;
          const col = r.color === "teal" ? C.tealBright : r.color === "muted" ? "rgba(242,239,230,0.35)" : C.amber;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 42 }}>
              <div style={{ width: 330, fontFamily: SANS, fontWeight: 700, fontSize: 36, color: C.paper }}>{r.label}</div>
              <div style={{ width: w, height: 64, background: col, borderRadius: 4, boxShadow: `0 0 24px ${col}55` }} />
              <div style={{ marginLeft: 24, fontFamily: SERIF, fontWeight: 600, fontSize: 56, color: col, opacity: g }}>{r.display}</div>
            </div>
          );
        })}
      </div>
      {p.source && <Credit text={p.source} />}
    </AbsoluteFill>
  );
};

// ── Kinetic: Bangkok's full name ─────────────────────────────────────────────
const FULL_NAME = "Krung Thep Mahanakhon Amon Rattanakosin Mahinthara Ayuthaya Mahadilok Phop Noppharat Ratchathani Burirom Udomratchaniwet Mahasathan Amon Piman Awatan Sathit Sakkathattiya Witsanukam Prasit";
export const KineticName: React.FC<{ dur: number; p: any }> = ({ dur, p }) => {
  const f = useCurrentFrame();
  const x = interpolate(f, [s(0.6), dur - 8], [1920, -5200], clamp);
  const count = Math.round(interpolate(f, [s(0.6), dur - 18], [0, 168], { ...clamp, easing: Easing.out(Easing.quad) }));
  return (
    <AbsoluteFill style={{ opacity: fadeIO(f, dur, 5, 6) }}>
      <DriftVideo src={p.bg} dur={dur} from={1.04} to={1.12} />
      <AbsoluteFill style={{ background: "rgba(11,21,48,0.55)" }} />
      <div style={{ position: "absolute", top: 430, left: x, whiteSpace: "nowrap", fontFamily: SERIF, fontWeight: 600, fontSize: 130, color: C.paper, textShadow: "0 6px 26px rgba(0,0,0,.6)" }}>
        <span style={{ color: C.amber }}>Krung Thep</span>{FULL_NAME.slice(10)}
      </div>
      <div style={{ position: "absolute", left: 120, top: 160 }}>
        <div style={{ fontFamily: MONO, fontSize: 26, color: C.tealBright, letterSpacing: 4 }}>BANGKOK'S CEREMONIAL NAME</div>
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 150, color: C.amber, lineHeight: 1 }}>{count}<span style={{ fontSize: 60, color: C.paper }}> letters</span></div>
      </div>
      <div style={{ position: "absolute", left: 120, bottom: 120, fontFamily: MONO, fontSize: 20, color: C.paper, opacity: 0.7 }}>168 letters counted in Thai script (Guinness World Records). Romanised above.</div>
      {p.credit && <Credit text={p.credit} />}
    </AbsoluteFill>
  );
};

// ── Sea-level gauge over the city ────────────────────────────────────────────
export const GaugeScene: React.FC<{ dur: number; p: any }> = ({ dur, p }) => {
  const f = useCurrentFrame();
  const rise = interpolate(f, [s(0.5), s(2.0)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const X = 1520, H = 640, top = 230, mPx = H / 4; // ruler 0..4 m
  const y = (m: number) => top + H - m * mPx;
  return (
    <AbsoluteFill style={{ opacity: fadeIO(f, dur, 5, 5) }}>
      <DriftVideo src={p.bg} dur={dur} from={1.04} to={1.1} />
      <LeftWash strength={0.8} />
      <AbsoluteFill style={{ background: "linear-gradient(270deg, rgba(11,21,48,0.75) 0%, rgba(11,21,48,0) 35%)" }} />
      <svg style={{ position: "absolute", inset: 0, width: 1920, height: 1080 }}>
        <rect x={X} y={y(2)} width={220} height={1.5 * mPx} fill={C.amber} opacity={0.3 * rise} />
        <rect x={X} y={y(2)} width={220} height={1.5 * mPx} fill="none" stroke={C.amber} strokeWidth={3} strokeDasharray="10 8" opacity={rise} />
        <text x={X + 110} y={y(1.25) + 12} textAnchor="middle" fill={C.amber} opacity={rise} style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 40 }}>Bangkok</text>
        <line x1={X} y1={y(4)} x2={X} y2={y(0)} stroke="white" strokeWidth={2} />
        {[0, 1, 2, 3, 4].map((m) => <g key={m}><line x1={X - 18} y1={y(m)} x2={X} y2={y(m)} stroke="white" strokeWidth={2} />
          <text x={X - 28} y={y(m) + 8} fill="white" textAnchor="end" style={{ fontFamily: MONO, fontSize: 22 }}>{m} m</text></g>)}
        <line x1={X - 30} y1={y(0)} x2={X + 260} y2={y(0)} stroke={C.tealBright} strokeWidth={5} />
        <text x={X + 120} y={y(0) + 40} textAnchor="middle" fill={C.tealBright} style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 2 }}>SEA LEVEL</text>
      </svg>
      <StatBlock st={{ big: "0.5–2 m", small: "Much of Bangkok, above the sea", src: "Bangkok Post / BMA", at: s(1.2) }} />
      {p.credit && <Credit text={p.credit} />}
    </AbsoluteFill>
  );
};

// ── Soil cross-section: tower on piles through Bangkok clay ──────────────────
export const SectionScene: React.FC<{ dur: number; p: any }> = ({ dur, p }) => {
  const f = useCurrentFrame();
  const reveal = (a: number, b: number) => interpolate(f, [s(a), s(b)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const G = 300, mPx = 13; // ground y, px per metre
  const y = (m: number) => G + m * mPx;
  const layers = [
    { from: 0, to: 18, name: "Soft Bangkok clay — old marine mud", col: "#6E5A43" },
    { from: 18, to: 28, name: "Stiff clay", col: "#8A7550" },
    { from: 28, to: 55, name: "Sand — firm bearing layer", col: "#B79A5E" },
  ];
  const piles = reveal(1.6, 3.2);
  return (
    <AbsoluteFill style={{ opacity: fadeIO(f, dur, 5, 5), background: "#0E1A36" }}>
      <svg style={{ position: "absolute", inset: 0, width: 1920, height: 1080 }}>
        <rect x={0} y={0} width={1920} height={G} fill="#16264a" />
        {layers.map((l, i) => (
          <g key={i} opacity={reveal(0.2 + i * 0.3, 0.7 + i * 0.3)}>
            <rect x={0} y={y(l.from)} width={1920} height={(l.to - l.from) * mPx} fill={l.col} />
            <text x={80} y={y(l.from) + 44} fill="white" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34 }}>{l.name}</text>
          </g>
        ))}
        {/* tower */}
        <g opacity={reveal(0.9, 1.4)}>
          <rect x={1180} y={G - 230} width={240} height={230} fill="#cfd6e4" />
          {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={1196} y={G - 214 + i * 36} width={208} height={18} fill="#8ea0c0" />)}
        </g>
        {[1200, 1260, 1340, 1400].map((x, i) => (
          <rect key={i} x={x} y={G} width={14} height={(42 + (i % 2) * 6) * mPx * piles} fill="white" />
        ))}
        {[0, 10, 20, 30, 40, 50].map((m) => <g key={m}><line x1={1760} y1={y(m)} x2={1790} y2={y(m)} stroke="white" /><text x={1800} y={y(m) + 8} fill="white" style={{ fontFamily: MONO, fontSize: 22 }}>{m} m</text></g>)}
        <g opacity={reveal(3.0, 3.5)}>
          <line x1={1450} y1={y(20)} x2={1450} y2={y(50)} stroke={C.amber} strokeWidth={4} />
          <text x={1470} y={y(35)} fill={C.amber} style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 64 }}>20–50 m</text>
          <text x={1470} y={y(35) + 40} fill="white" style={{ fontFamily: SANS, fontSize: 28 }}>piles reach firmer sand</text>
        </g>
      </svg>
      <div style={{ position: "absolute", left: 80, top: 70, fontFamily: MONO, fontSize: 24, color: C.tealBright, letterSpacing: 3 }}>BANGKOK · SIMPLIFIED SOIL SECTION</div>
      <Credit text="After geotechnical studies of Bangkok subsoil (SEAGS/AGSSEA, Lowland Technology International) · schematic, not to scale" />
    </AbsoluteFill>
  );
};

// ── Globe pull-out + end card ────────────────────────────────────────────────
export const GlobeOutScene: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: fadeIO(f, dur, 6, 10), background: C.ink }}>
      <OffthreadVideo src={staticFile("globe_out.mp4")} muted style={{ width: "100%", height: "100%" }} />
    </AbsoluteFill>
  );
};

export const EndCard: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const CLICK_SUB = 62, CLICK_BELL = 100;
  const intro = spring({ frame: f - 2, fps, config: { damping: 200 }, durationInFrames: 24 });
  const card = spring({ frame: f - 10, fps, config: { damping: 16, stiffness: 120 } });
  const next = spring({ frame: f - 18, fps, config: { damping: 16, stiffness: 120 } });
  // subscribe widget geometry (screen px)
  const CX = 150, CY = 470, BTN = { x: CX + 190, y: CY + 186, w: 300, h: 76 }, BELL = { x: CX + 540, y: CY + 224 };
  // cursor path: enter → subscribe → bell → drift away
  const cx = interpolate(f, [26, 56, 70, 94, 150], [1180, BTN.x + 150, BTN.x + 150, BELL.x + 6, BELL.x + 120], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const cy = interpolate(f, [26, 56, 70, 94, 150], [1000, BTN.y + 44, BTN.y + 44, BELL.y + 10, BELL.y + 140], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const press = (at: number) => interpolate(f, [at - 3, at, at + 4], [1, 0.82, 1], clamp);
  const cursorScale = Math.min(press(CLICK_SUB), press(CLICK_BELL));
  const cursorO = interpolate(f, [24, 32, 140, 158], [0, 1, 1, 0], clamp);
  const subbed = f >= CLICK_SUB;
  const btnPop = spring({ frame: f - CLICK_SUB, fps, config: { damping: 9, stiffness: 220 } });
  const ripple = interpolate(f, [CLICK_SUB, CLICK_SUB + 18], [0, 1], clamp);
  const belled = f >= CLICK_BELL;
  const ring = belled ? Math.sin((f - CLICK_BELL) * 0.9) * 22 * Math.exp(-(f - CLICK_BELL) / 14) : 0;
  const waves = interpolate(f, [CLICK_BELL, CLICK_BELL + 24], [0, 1], clamp);
  const dot = spring({ frame: f - CLICK_BELL - 4, fps, config: { damping: 8, stiffness: 200 } });
  const fadeOut = interpolate(f, [dur - 12, dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 30%, ${C.navy} 0%, ${C.ink} 70%)`, opacity: Math.min(intro, fadeOut) }}>
      {/* brand */}
      <div style={{ position: "absolute", top: 120, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", transform: `translateY(${(1 - intro) * 20}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <Img src={staticFile("logo_mark_white.png")} style={{ height: 104 }} />
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 112, color: C.paper, letterSpacing: -2 }}>The Sundaland</div>
        </div>
        <div style={{ width: 620 * intro, height: 3, background: `linear-gradient(90deg, ${C.navy}, ${C.teal})`, marginTop: 26 }} />
        <div style={{ fontFamily: MONO, fontSize: 30, color: C.tealBright, letterSpacing: 8, marginTop: 18 }}>ECONOMY GEOGRAPHY</div>
      </div>
      {/* subscribe widget */}
      <div style={{ position: "absolute", left: CX, top: CY, width: 820, height: 300, borderRadius: 24, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(242,239,230,0.18)",
        opacity: card, transform: `translateY(${(1 - card) * 40}px)` }}>
        <div style={{ position: "absolute", left: 40, top: 40, width: 120, height: 120, borderRadius: 60, background: "white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(0,0,0,.35)" }}>
          <Img src={staticFile("logo_mark.png")} style={{ height: 62 }} />
        </div>
        <div style={{ position: "absolute", left: 190, top: 52, fontFamily: SANS, fontWeight: 700, fontSize: 54, color: C.paper }}>The Sundaland</div>
        <div style={{ position: "absolute", left: 192, top: 120, fontFamily: SANS, fontSize: 28, color: "rgba(242,239,230,0.7)" }}>Asia's economy, explained on the map</div>
      </div>
      {/* button */}
      <div style={{ position: "absolute", left: BTN.x, top: BTN.y, width: BTN.w, height: BTN.h, opacity: card }}>
        <div style={{ position: "absolute", left: BTN.w / 2 - 160 * ripple, top: BTN.h / 2 - 160 * ripple, width: 320 * ripple, height: 320 * ripple, borderRadius: "50%",
          background: "rgba(255,255,255,0.35)", opacity: 1 - ripple }} />
        <div style={{ width: "100%", height: "100%", borderRadius: 40, display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
          background: subbed ? "#3a3f4b" : "#E5302A", transform: `scale(${subbed ? 0.92 + 0.08 * btnPop : 1})`, boxShadow: subbed ? "none" : "0 8px 26px rgba(229,48,42,0.45)",
          fontFamily: SANS, fontWeight: 700, fontSize: 32, letterSpacing: 2, color: subbed ? "rgba(242,239,230,0.85)" : "white" }}>
          {subbed && <span style={{ fontSize: 30 }}>✓</span>}{subbed ? "SUBSCRIBED" : "SUBSCRIBE"}
        </div>
      </div>
      {/* bell */}
      <svg style={{ position: "absolute", left: BELL.x - 40, top: BELL.y - 40, width: 80, height: 80, overflow: "visible", opacity: card }} viewBox="-40 -40 80 80">
        {belled && [1, 2].map((k) => <g key={k} opacity={(1 - waves) * 0.9}>
          <path d={`M${-26 - k * 10 * waves},-12 q${-8 - k * 4},12 0,26`} stroke={C.amber} strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d={`M${26 + k * 10 * waves},-12 q${8 + k * 4},12 0,26`} stroke={C.amber} strokeWidth={3} fill="none" strokeLinecap="round" />
        </g>)}
        <g transform={`rotate(${ring} 0 -24)`}>
          <path d="M-18,12 L-18,-4 C-18,-18 -9,-24 0,-24 C9,-24 18,-18 18,-4 L18,12 L24,18 L-24,18 Z" fill={belled ? C.paper : "none"} stroke={C.paper} strokeWidth={3.5} strokeLinejoin="round" />
          <circle cx={0} cy={24} r={5} fill={C.paper} />
        </g>
        <circle cx={18} cy={-20} r={9 * dot} fill="#E5302A" />
      </svg>
      {/* watch-next slot for YouTube end-screen element */}
      <div style={{ position: "absolute", right: 150, top: 470, width: 560, height: 315, borderRadius: 16, border: `2px dashed rgba(63,183,176,${0.35 + 0.25 * Math.sin(f / 10)})`,
        display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 26, letterSpacing: 4, color: "rgba(242,239,230,0.55)", opacity: next, transform: `translateY(${(1 - next) * 40}px)` }}>WATCH NEXT ▶</div>
      {/* cursor */}
      <svg style={{ position: "absolute", left: cx, top: cy, width: 60, height: 60, overflow: "visible", opacity: cursorO, transform: `scale(${cursorScale})`, transformOrigin: "0 0",
        filter: "drop-shadow(0 4px 6px rgba(0,0,0,.5))" }} viewBox="0 0 30 30">
        <path d="M2,2 L2,24 L8,18 L12,28 L16,26 L12,17 L21,17 Z" fill="white" stroke="#0B1530" strokeWidth={1.6} strokeLinejoin="round" />
      </svg>
    </AbsoluteFill>
  );
};
