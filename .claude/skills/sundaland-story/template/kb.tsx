import React from "react";
import { AbsoluteFill, Easing, Freeze, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PROJ } from "./mapData";
import { C, SERIF, SANS, MONO, s, clamp, Cam, toScreen, useCam, Basemap, RegionBorders, MapLabel, PinTick, DriftVideo, Credit, LeftWash } from "./parts";
import { CountryPop } from "./fx";
import { H, KpiCard, HudBackground, HudHeader, Panel, Ring, Digits, Label, VGauge, BarChart, Badge, DIGI, HUDT } from "./hud";

// ── Kota Bharu 1941 episode components (cold open, doodle inserts, stickers, dual clock, HUD data beats) ──
const ll = (lon: number, lat: number): [number, number] => [(lon - PROJ.lon0) * PROJ.k * PROJ.sx, (PROJ.lat1 - lat) * PROJ.sx];
const eio = { ...clamp, easing: Easing.inOut(Easing.cubic) };
const fadeIO = (f: number, dur: number, a = 6, b = 6) => Math.min(interpolate(f, [0, a], [0, 1], clamp), interpolate(f, [dur - b, dur], [1, 0], clamp));
const pad = (n: number) => String(n).padStart(2, "0");
const hhmm = (m: number) => { const x = ((Math.round(m) % 1440) + 1440) % 1440; return `${pad(Math.floor(x / 60))}:${pad(x % 60)}`; };

// ── C · doodle sprites as white-outlined stickers standing on the satellite map ─────────────────────────
export const Stickers: React.FC<{ cam: Cam; items: any[] }> = ({ cam, items }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {items.map((q, i) => {
        const at = s(q.at ?? 0), d = s(q.dur ?? 2.5);
        if (f < at || (q.out != null && f > s(q.out) + 8)) return null;
        const p = q.toLon != null ? interpolate(f, [at, at + d], [0, 1], eio) : 0;
        const lon = q.lon + (q.toLon != null ? (q.toLon - q.lon) * p : 0), lat = q.lat + (q.toLat != null ? (q.toLat - q.lat) * p : 0);
        const P = toScreen(cam, ...ll(lon, lat));
        const pop = spring({ frame: f - at, fps, config: { damping: 12, stiffness: 160 } });
        const moving = q.toLon != null && p > 0 && p < 1;
        const hop = moving && q.hop !== false ? -Math.abs(Math.sin((f - at) * 0.5)) * 16 : 0;
        const o = q.out != null ? interpolate(f, [s(q.out), s(q.out) + 8], [1, 0], clamp) : 1;
        const h = q.h ?? 230;
        const w = 4;   // outline thickness
        const outline = [`${w}px 0 0 #fff`, `-${w}px 0 0 #fff`, `0 ${w}px 0 #fff`, `0 -${w}px 0 #fff`].map((x) => `drop-shadow(${x})`).join(" ") + " drop-shadow(0 8px 10px rgba(0,0,0,.55))";
        return (
          <div key={i} style={{ position: "absolute", left: P.x, top: P.y, transform: `translate(-50%, -100%) translateY(${hop}px) scale(${pop})`, transformOrigin: "50% 100%", opacity: o }}>
            <Img src={staticFile(`sprites/${q.src}.png`)} style={{ height: h, filter: outline, transform: q.flip ? "scaleX(-1)" : undefined }} />
          </div>
        );
      })}
    </>
  );
};

// ── Dual clock (Kota Bharu vs Hawaii) — HUD panels over a map ───────────────────────────────────────────
export const DualClock: React.FC<{ q: any }> = ({ q }) => {
  const f = useCurrentFrame();
  const at = s(q.at ?? 0);
  if (f < at) return null;
  const m = interpolate(f, [at, at + s(q.dur ?? 3)], [q.from, q.to], eio);
  const hit = m >= 107.99;
  const left = 108 - m;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Panel x={470} y={600} w={470} h={220} title="KOTA BHARU · MON 8 DEC 1941" at={at} accent={H.amber}>
        <div style={{ position: "absolute", left: 34, top: 78, fontFamily: DIGI, fontWeight: 700, fontSize: 100, color: H.amber, transform: "skewX(-9deg)", textShadow: `0 0 18px ${H.amber}` }}>{hhmm(m)}</div>
      </Panel>
      <Panel x={980} y={600} w={470} h={220} title="HAWAII · SUN 7 DEC 1941" at={at + 6} accent={H.cyan}>
        <div style={{ position: "absolute", left: 34, top: 78, fontFamily: DIGI, fontWeight: 700, fontSize: 100, color: H.ice, transform: "skewX(-9deg)", textShadow: `0 0 18px ${H.cyan}` }}>{hhmm(m - 1080)}</div>
      </Panel>
      <div style={{ position: "absolute", left: 0, width: 1920, textAlign: "center", top: 845, fontFamily: HUDT, fontWeight: 700, fontSize: 40, letterSpacing: 2, color: hit ? H.red : H.ice,
        opacity: interpolate(f, [at + 10, at + 18], [0, 1], clamp), textShadow: "0 2px 10px rgba(0,0,0,.8)" }}>
        {hit ? (q.hitText ?? "PEARL HARBOR ATTACKED · KOTA BHARU UNDER FIRE FOR 78 MIN") : `T − ${Math.max(0, Math.round(left))} MIN TO PEARL HARBOR`}
      </div>
      <div style={{ position: "absolute", left: 0, width: 1920, textAlign: "center", top: 900, fontFamily: MONO, fontSize: 18, color: H.dim, opacity: 0.85 }}>
        TIMES VARY BY SOURCE (40–90 MIN) · Wikipedia / Australian War Memorial
      </div>
    </div>
  );
};

// ── Doodle inserts: B full frame (crayon background baked in) or A paper card over a dimmed map ───────────
const TORN = "polygon(0% 2%, 6% 0%, 14% 1.5%, 23% 0.3%, 31% 1.8%, 42% 0.5%, 50% 1.6%, 61% 0.2%, 70% 1.7%, 79% 0.4%, 88% 1.9%, 95% 0.3%, 100% 1.5%, 99.2% 12%, 100% 25%, 99.3% 38%, 100% 52%, 99.4% 66%, 100% 80%, 99.2% 92%, 100% 98.5%, 93% 100%, 84% 98.6%, 75% 100%, 66% 98.4%, 55% 99.8%, 46% 98.5%, 37% 100%, 27% 98.6%, 17% 99.9%, 8% 98.4%, 0% 99.6%, 0.6% 88%, 0% 74%, 0.7% 60%, 0% 46%, 0.8% 32%, 0% 18%)";
export const DoodleScene: React.FC<{ dur: number; p: any }> = ({ dur, p }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = fadeIO(f, dur, 5, 5);
  const cf = Math.max(1, Math.floor((p.clip ?? 999) * 30) - 3);   // freeze on the last frame if the shot outlasts the clip
  const Vid = <Freeze frame={cf} active={f >= cf}><OffthreadVideo src={staticFile(p.src)} muted style={{ width: "100%", height: "100%" }} /></Freeze>;
  if (p.mode !== "card") {
    return (
      <AbsoluteFill style={{ opacity: o, background: "#fff" }}>{Vid}</AbsoluteFill>
    );
  }
  const [x, y] = ll(p.map?.lon ?? 102.0, p.map?.lat ?? 6.0);
  const vh = (p.map?.vh ?? 12) * PROJ.sx;
  const cam = useCam([[0, x, y, vh], [dur, x + vh * 0.04, y, vh * 0.96]]);
  const pop = spring({ frame: f, fps, config: { damping: 14, stiffness: 120 } });
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Basemap cam={cam} blur={3} />
      <AbsoluteFill style={{ background: C.ink, opacity: 0.5 }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 1500, height: 844, transform: `translateY(${(1 - pop) * 60}px) rotate(${p.rot ?? -1.6}deg) scale(${0.94 + 0.06 * pop})`,
          filter: "drop-shadow(0 22px 34px rgba(0,0,0,.6))" }}>
          <div style={{ width: "100%", height: "100%", clipPath: TORN, background: "#fff" }}>{Vid}</div>
        </div>
      </AbsoluteFill>
      {p.credit && <Credit text={p.credit} />}
    </AbsoluteFill>
  );
};

// ── Cold open: night sea → whip → globe → flat map → British Malaya → Sabak beach ─────────────────────────
const GLOBE_AT = s(1.0), GLOBE_LEN = 48;
export const KBColdOpen: React.FC<{ dur: number; p?: any }> = ({ dur, p = {} }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const G = ll(102.0, 6.6), K = ll(102.3, 6.17), S = ll(102.36, 6.2);
  const cam = useCam([
    [s(2.45), G[0], G[1], 14 * PROJ.sx], [s(3.2), G[0], G[1], 13 * PROJ.sx],
    [s(4.6), K[0], K[1], 1.4 * PROJ.sx], [s(6.4), S[0], S[1], 0.42 * PROJ.sx], [dur, S[0] + 2, S[1], 0.38 * PROJ.sx],
  ]);
  const whip = interpolate(f, [s(0.9), s(1.15)], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const footO = interpolate(f, [s(0.9), s(1.12)], [1, 0], clamp);
  const globeIn = interpolate(f, [GLOBE_AT, GLOBE_AT + 5], [0, 1], clamp);
  const globeOut = interpolate(f, [s(2.35), s(2.55)], [1, 0], clamp);
  const mapBlur = interpolate(f, [s(2.35), s(2.6)], [6, 0], clamp) + interpolate(f, [s(3.2), s(3.9), s(4.6)], [0, 8, 0], clamp) + interpolate(f, [s(4.8), s(5.6), s(6.4)], [0, 4, 0], clamp);
  const out = interpolate(f, [dur - 8, dur], [1, 0], clamp);
  const ships = [[102.355, 6.235], [102.375, 6.228], [102.395, 6.221]];
  const shipO = interpolate(f, [s(6.6), s(7.2)], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: out, background: C.ink }}>
      <Basemap cam={cam} blur={mapBlur} />
      <AbsoluteFill style={{ background: "#03102a", opacity: 0.32 }} />
      <RegionBorders cam={cam} names={["Thailand", "British Malaya"]} o={interpolate(f, [s(2.6), s(3.2)], [0, 0.8], clamp) * interpolate(f, [s(4.2), s(4.6)], [1, 0], clamp)} />
      <div style={{ position: "absolute", inset: 0, opacity: interpolate(f, [s(4.2), s(5.0)], [1, 0], clamp) }}><CountryPop cam={cam} name="British Malaya" color={C.amber} at={s(2.75)} settle={0.35} solid /></div>
      {f > s(2.9) && f < s(4.4) && <MapLabel cam={cam} ux={ll(101.6, 4.2)[0]} uy={ll(101.6, 4.2)[1]} text="BRITISH MALAYA · 1941" at={s(2.95)} size={42} />}
      <PinTick {...toScreen(cam, ...S)} at={s(5.6)} color="#E5484D" />
      {f > s(5.7) && <MapLabel cam={cam} ux={ll(102.33, 6.176)[0]} uy={ll(102.33, 6.176)[1]} text="Sabak Beach · Kelantan" dx={-260} dy={140} leader at={s(5.75)} size={34} />}
      {ships.map(([lo, la], i) => { const P = toScreen(cam, ...ll(lo, la)); return f > s(6.6) + i * 6 ? (
        <div key={i} style={{ position: "absolute", left: P.x, top: P.y, transform: "translate(-50%,-50%)", opacity: shipO, width: 46, height: 16, borderRadius: "40% 40% 8px 8px",
          background: "#1b1f2a", border: "2px solid #e8f6ff", boxShadow: "0 0 14px rgba(232,246,255,.6)" }} />) : null; })}
      <div style={{ position: "absolute", right: 90, top: 110, fontFamily: DIGI, fontWeight: 700, fontSize: 54, color: H.amber, transform: "skewX(-9deg)", textShadow: `0 0 14px ${H.amber}`,
        opacity: interpolate(f, [s(3.4), s(3.8)], [0, 1], clamp) }}>8 DEC 1941 · {hhmm(interpolate(f, [s(3.4), dur], [2, 9], clamp))}</div>
      <Sequence from={GLOBE_AT} durationInFrames={GLOBE_LEN} premountFor={30}>
        <AbsoluteFill style={{ opacity: globeIn * globeOut }}><OffthreadVideo src={staticFile("globe_in.mp4")} muted style={{ width: "100%", height: "100%" }} /></AbsoluteFill>
      </Sequence>
      <AbsoluteFill style={{ opacity: footO, filter: `blur(${whip * 18}px)`, transform: `scale(${1 + whip * 0.3})` }}>
        <DriftVideo src="footage/night_sea_1.mp4" dur={s(1.2)} />
      </AbsoluteFill>
      <Credit text={p.credit ?? "Globe & basemap: NASA Blue Marble / ASTER GDEM (public domain) · geoBoundaries (CC BY 4.0) · Natural Earth"} />
    </AbsoluteFill>
  );
};

// ── HUD data beats ──────────────────────────────────────────────────────────────────────────────────────
const Note: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", right: 60, bottom: 52, fontFamily: MONO, fontSize: 18, color: H.dim, letterSpacing: 1 }}>{text}</div>
);
export const KBHud: React.FC<{ dur: number; p: any }> = ({ dur, p }) => {
  const f = useCurrentFrame();
  const o = fadeIO(f, dur, 6, 6);
  const v = p.v;
  let body: React.ReactNode = null;
  if (v === "oil80") {
    body = <>
      <HudHeader title="JAPAN · WHERE THE OIL CAME FROM · 1940" tag="IMPORTS" at={0} />
      <Ring cx={620} cy={560} r={230} segs={[{ v: 80, color: H.amber }, { v: 20, color: H.dim }]} at={s(0.4)} dur={s(1.4)} width={22}>
        <div style={{ textAlign: "center" }}><Digits value={80} at={s(0.5)} dur={s(1.4)} prefix="≈" suffix="%" size={110} color={H.amber} /><Label size={30}>from the United States</Label></div>
      </Ring>
      <KpiCard x={1080} y={300} w={700} label="Japan's own oil production" text="ALMOST NONE" at={s(1.2)} big={90} color={H.red} />
      <KpiCard x={1080} y={600} w={700} label="Oil imports from the US" text="≈ 75–85%" sub="estimates vary by year and source" at={s(2.0)} big={90} color={H.amber} />
      <Note text="SOURCES: Honolulu Star-Advertiser; National WWII Museum" />
    </>;
  } else if (v === "gauge" || v === "callback") {
    const lvl = interpolate(f, [s(0.6), dur - s(0.6)], v === "gauge" ? [0.95, 0.25] : [0.6, 0.05], eio);
    body = <>
      <HudHeader title={v === "gauge" ? "JAPAN · OIL STOCKPILE AFTER THE FREEZE" : "SUNDALAND OIL REACHING JAPAN · 1942 → 1945"} tag={v === "gauge" ? "JULY 1941" : "INDICATIVE"} at={0} />
      <VGauge x={430} y={230} w={180} h={600} level={lvl} color={lvl < 0.3 ? H.red : H.amber} label={v === "gauge" ? "RESERVES" : "SHIPMENTS"} at={s(0.2)} />
      {v === "gauge" ? <>
        <KpiCard x={900} y={260} w={820} label="Stockpile" value={54} prefix="≈ " suffix=" M bbl" sub="29 M reserved for the navy" at={s(0.8)} big={110} color={H.amber} />
        <KpiCard x={900} y={600} w={820} label="How long it lasts" text="1 – 2 YEARS" sub="estimates vary" at={s(1.8)} big={90} color={H.red} />
      </> : <>
        <KpiCard x={900} y={300} w={820} label="Tankers to Japan" text="SUNK, ONE BY ONE" sub="US submarine campaign" at={s(0.8)} big={80} color={H.red} />
        <KpiCard x={900} y={620} w={820} label="By 1945" text="ONLY A TRICKLE" at={s(1.8)} big={80} color={H.amber} />
      </>}
      <Note text={v === "gauge" ? "SOURCES: CIMSEC; FRUS 1941 vol. IV · INDICATIVE DRAIN" : "INDICATIVE · USSBS / JANAC summaries"} />
    </>;
  } else if (v === "calendar") {
    const months = ["SEP", "OCT", "NOV"];
    body = <>
      <HudHeader title="1941 · THE CLOCK RUNS" tag="TOKYO" at={0} />
      {months.map((m, i) => {
        const a = s(0.5 + i * 1.3);
        const on = interpolate(f, [a, a + 8], [0, 1], clamp);
        return <div key={m} style={{ position: "absolute", left: 260 + i * 330, top: 330, width: 280, height: 300, opacity: on, border: `2px solid ${i === 2 ? H.red : H.cyan}`,
          background: "rgba(30,139,255,0.08)", boxShadow: `0 0 24px ${i === 2 ? H.red : H.cyan}55`, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: DIGI, fontWeight: 700, fontSize: 88, color: i === 2 ? H.red : H.ice, transform: "skewX(-6deg)" }}>{m}</div>;
      })}
      <VGauge x={1400} y={260} w={150} h={520} level={interpolate(f, [0, dur], [0.5, 0.3], clamp)} color={H.amber} label="OIL" at={s(0.2)} />
      <Label size={34} style={{ position: "absolute", left: 260, top: 690, width: 960 }}>6 Sep · Imperial Conference: war if talks fail</Label>
    </>;
  } else if (v === "prize") {
    body = <>
      <HudHeader title="SUNDALAND · THE PRIZE" tag="1939–1940" at={0} />
      <Ring cx={430} cy={560} r={190} segs={[{ v: 39, color: H.green }, { v: 61, color: H.dim }]} at={s(0.4)} dur={s(1.3)} width={20}>
        <div style={{ textAlign: "center" }}><Digits value={39} at={s(0.5)} dur={s(1.3)} prefix="≈" suffix="%" size={96} color={H.green} /><Label size={26}>of world rubber · Malaya 1940</Label></div>
      </Ring>
      <BarChart x={820} y={300} w={560} h={420} data={[{ label: "MALAYA", v: 55945, color: H.amber, tag: "55,945 t" }, { label: "NEI", v: 31281, color: H.cyan, tag: "31,281 t" }]} max={60000} at={s(1.4)} unit="TIN EXPORTS 1939" />
      <Badge x={1480} y={420} text="#4" sub="OIL EXPORTER · NEI" at={s(2.4)} color={H.amber} size={92} />
      <Note text="SOURCES: Dunlop Bulletin 1940 (via Papers Past); TIME 1941; Wikipedia" />
    </>;
  } else if (v === "casualties") {
    body = <>
      <HudHeader title="KOTA BHARU · 8–9 DECEMBER 1941" tag="TOLL" at={0} />
      <KpiCard x={180} y={320} w={720} label="Allied killed" value={68} prefix="≈ " sub="+ 360 wounded · 37 missing" at={s(0.4)} big={130} color={H.cyan} />
      <KpiCard x={1020} y={320} w={720} label="Japanese killed" value={320} prefix="≈ " sub="+ 538 wounded" at={s(1.0)} big={130} color={H.amber} />
      <Note text="SOURCE: Wikipedia — Battle of Kota Bharu (figures approximate)" />
    </>;
  } else if (v === "day70") {
    body = <>
      <HudHeader title="KOTA BHARU → SINGAPORE" tag="15 FEB 1942" at={0} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center" }}>
        <Label size={44}>DAY</Label>
        <Digits value={70} from={0} at={s(0.3)} dur={s(2.2)} size={300} color={H.amber} />
        <Label size={36} style={{ marginTop: 20 }}>Singapore surrenders · largest surrender in British military history</Label>
      </div>
      <Note text="SOURCE: Imperial War Museums" />
    </>;
  }
  return <AbsoluteFill style={{ opacity: o }}><HudBackground dur={dur}>{body}</HudBackground></AbsoluteFill>;
};

// ── Quote card (sourced quote over a doodle/photo moment) ───────────────────────────────────────────────
export const QuoteCard: React.FC<{ dur: number; p: any }> = ({ dur, p }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: fadeIO(f, dur, 6, 6), background: C.ink, alignItems: "center", justifyContent: "center" }}>
      {p.src && <AbsoluteFill style={{ opacity: 0.35 }}><DriftVideo src={p.src} dur={dur} /></AbsoluteFill>}
      <div style={{ width: 1300, textAlign: "left" }}>
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 76, color: C.paper, lineHeight: 1.15, opacity: interpolate(f, [6, 18], [0, 1], clamp) }}>“{p.text}”</div>
        <div style={{ fontFamily: MONO, fontSize: 26, color: C.tealBright, marginTop: 30, letterSpacing: 2, opacity: interpolate(f, [16, 28], [0, 1], clamp) }}>{p.who}</div>
      </div>
      {p.credit && <Credit text={p.credit} />}
    </AbsoluteFill>
  );
};
