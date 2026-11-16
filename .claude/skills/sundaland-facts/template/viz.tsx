import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FLAGS } from "./mapData";
import { H, DIGI, HUDT, HudBackground, HudHeader, HoloStage, Panel, Digits, Label, Ring, BarChart, LineChart, Legend, DataTable, Badge, VGauge } from "./hud";
import { Zone3D, Scale3D, Tank3D, Notes3D, Coin3D, Dial3D, Basket3D, Vault3D, Hourglass3D, Kip3D, Calendar3D, Seesaw3D } from "./three3d";

// ── Data scenes = one holographic STORY animation (what the point is about) + HUD charts (the numbers).
//    User direction 2026-11-12. Verified figures only; curve shapes between verified endpoints are labelled INDICATIVE.
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = (p: any, i: number, d: number) => (p?.t?.[i] ?? d);
const fadeIO = (f: number, dur: number) => Math.min(interpolate(f, [0, 6], [0, 1], cl), interpolate(f, [dur - 6, dur], [1, 0], cl));

const Scene: React.FC<{ dur: number; title: string; tag?: string; src?: string; children: React.ReactNode; rx?: number; ry?: number }> = ({ dur, title, tag, src, children, rx, ry }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: fadeIO(f, dur) }}>
      <HudBackground dur={dur}>
        <HoloStage rx={rx} ry={ry}>{children}</HoloStage>
        <HudHeader title={title} tag={tag} />
        {src && <div style={{ position: "absolute", left: 64, bottom: 40, fontFamily: HUDT, fontWeight: 500, fontSize: 21, color: H.dim, letterSpacing: 0.5 }}>{src}</div>}
      </HudBackground>
    </AbsoluteFill>
  );
};
const Note: React.FC<{ x: number; y: number; text: string }> = ({ x, y, text }) => (
  <div style={{ position: "absolute", left: x, top: y, fontFamily: HUDT, fontWeight: 600, fontSize: 18, letterSpacing: 2, color: H.dim, border: `1px solid ${H.line}`, padding: "3px 10px" }}>{text}</div>
);
/** Story panel: glass frame with the holographic animation filling its body. */
const Story: React.FC<{ x: number; y: number; w: number; h: number; title: string; at: number; accent?: string; children: (w: number, h: number) => React.ReactNode }> = ({ x, y, w, h, title, at, accent, children }) => (
  <Panel x={x} y={y} w={w} h={h} title={title} at={at} accent={accent}>
    <div style={{ position: "absolute", left: 20, top: 70, width: w - 40, height: h - 90 }}>{children(w - 40, h - 90)}</div>
  </Panel>
);

/** Rating badges for map overlays (S&P / Moody's / Fitch). */
export const Stamps: React.FC<{ at: number; items: string[]; x?: number; y?: number; grade?: string }> = ({ at, items, x = 120, y = 700, grade = "AAA" }) => (
  <>{items.map((it, i) => <Badge key={it} x={x + 110 + i * 230} y={y + 60} text={grade} sub={it} at={at + i * 9} color={H.amber} size={54} />)}</>
);

// ── #15 Singapore · owes vs owns ─────────────────────────────────────────────
export const BalanceScale: React.FC<{ dur: number; p: any }> = ({ dur, p }) => {
  const a1 = s(T(p, 0, 0.5)), a2 = s(T(p, 1, 2.6)), a3 = s(T(p, 2, 1.8));
  return (
    <Scene dur={dur} title="SINGAPORE · BALANCE SHEET" tag="IMF WEO · S&P" src={p.src ?? "Debt ≈170% of GDP (IMF WEO) · liquid assets > US$1 tn ≈ 2× GDP (S&P estimate)"}>
      <Panel x={120} y={170} w={500} h={600} title="What it owes" at={a1} accent={H.red}>
        <Ring cx={250} cy={300} r={140} segs={[{ v: 172, color: H.red }]} at={a1 + 6} dur={36}>
          <Label size={22} color={H.dim} caps>Debt vs GDP</Label>
          <Digits value={170} prefix="≈" suffix="%" at={a1 + 6} dur={36} size={66} />
        </Ring>
      </Panel>
      <Zone3D x={660} y={170} w={600} h={600} title="Borrowed to invest, not to spend" at={a1 + 4}><Scale3D a1={a1 + 8} a2={a2} dur={dur} /></Zone3D>
      <Panel x={1300} y={170} w={500} h={600} title="What it owns" at={a2}>
        <Ring cx={250} cy={300} r={140} segs={[{ v: 200, color: H.cyan }]} at={a2 + 6} dur={36}>
          <Label size={22} color={H.dim} caps>Liquid assets</Label>
          <Digits value={1} prefix="> $" suffix=" tn" at={a2 + 6} dur={20} size={60} />
          <Label size={24} color={H.cyan} style={{ marginTop: 6 }}>≈ 2× GDP</Label>
        </Ring>
      </Panel>
      <Badge x={960} y={850} text="AAA × 3" sub="S&P · Moody's · Fitch" at={a3 + 20} color={H.teal} size={40} />
    </Scene>
  );
};

// ── #14 Brunei · tiny debt, draining savings ────────────────────────────────
export const SavingsTank: React.FC<{ dur: number; p: any }> = ({ dur, p }) => {
  const a1 = s(T(p, 0, 0.3)), a2 = s(T(p, 1, 2.8));
  return (
    <Scene dur={dur} title="BRUNEI · FISCAL MONITOR" tag="IMF · 2024" src={p.src ?? "Government debt ≈2% of GDP, 2024 (IMF via Trading Economics) · savings tank illustrative"}>
      <Panel x={120} y={170} w={560} h={620} title="Government debt" at={a1}>
        <Ring cx={280} cy={300} r={150} segs={[{ v: 2.3, color: H.amber }]} at={a1 + 6} dur={24}>
          <Digits value={2} prefix="≈" suffix="%" at={a1 + 6} dur={24} size={84} />
          <Label size={22} color={H.dim} caps>of GDP</Label>
        </Ring>
        <div style={{ position: "absolute", left: 0, width: 560, top: 520, textAlign: "center" }}><Label size={26} color={H.teal}>among the lowest anywhere</Label></div>
      </Panel>
      <Zone3D x={740} y={170} w={1060} h={620} title="Oil money in · deficit out" at={a1 + 8}><Tank3D a1={a1 + 14} a2={a2} dur={dur} /></Zone3D>
    </Scene>
  );
};

// ── #13 Cambodia · composition of the money supply ──────────────────────────
export const BanknoteGrid: React.FC<{ dur: number; p: any }> = ({ dur, p }) => {
  const a1 = s(T(p, 0, 0.2)), a2 = s(T(p, 1, 0.9));
  return (
    <Scene dur={dur} title="CAMBODIA · MONEY SUPPLY" tag="AMRO · END-2025" src={p.src ?? "83.4% of broad money (M2) in US dollars, end-2025 (AMRO)"}>
      <Panel x={120} y={170} w={640} h={640} title="Currency composition" at={a1}>
        <Ring cx={320} cy={280} r={150} segs={[{ v: 83.4, color: H.green }, { v: 16.6, color: H.violet }]} at={a2} dur={40}>
          <Label size={22} color={H.dim} caps>US dollar</Label>
          <Digits value={83} suffix="%" at={a2} dur={40} size={84} />
        </Ring>
        <Legend x={60} y={490} w={520} at={a2 + 20} rows={[{ color: H.green, label: "US dollar", value: "83.4%" }, { color: H.violet, label: "Riel", value: "16.6%" }]} />
      </Panel>
      <Zone3D x={820} y={170} w={980} h={640} title="Riel notes turning into dollars" at={a1 + 8}><Notes3D a1={a2 + 4} dur={dur} /></Zone3D>
    </Scene>
  );
};

// ── #11 Thailand · 1997 vs today ─────────────────────────────────────────────
export const BahtCrack: React.FC<{ dur: number; p: any }> = ({ dur, p }) => {
  const f = useCurrentFrame();
  const a1 = s(T(p, 0, 0.3)), a2 = s(T(p, 1, 2.6)), a3 = s(T(p, 2, 4.6));
  return (
    <Scene dur={dur} title="THAILAND · 1997 → TODAY" tag="IMF · BANK OF THAILAND" src={p.src ?? "Baht ≈25 → ≈56 per US$ (1997–98) · IMF-led package ≈US$17.2 bn · reserves ≈US$300 bn (2025–26)"}>
      <Zone3D x={120} y={170} w={460} h={620} title="2 July 1997" at={a1}><Coin3D a1={a1 + 6} dur={dur} /></Zone3D>
      <Panel x={620} y={170} w={660} h={620} title="Baht per US dollar" at={a1 + 6}>
        <LineChart x={80} y={110} w={540} h={380} pts={[25, 25.8, 30, 32, 36, 39, 41, 46, 54, 56]} min={20} max={60} ticks={[20, 40, 60]} at={a1 + 12} dur={60}
          xlabels={["JUN 97", "", "", "", "", "", "", "", "", "JAN 98"]} markers={[{ i: 0, text: "25", color: H.cyan }, { i: 9, text: "56", color: H.red }]} color={H.amber} />
        <Note x={330} y={70} text="INDICATIVE PATH" />
      </Panel>
      <Panel x={1320} y={170} w={480} h={620} title="Rescue vs reserves · US$ bn" at={a2}>
        <BarChart x={90} y={120} w={340} h={360} max={320} ticks={[0, 100, 200, 300]} at={a2 + 6} barW={64}
          data={[{ label: "IMF 1997", v: 17.2, color: H.red, tag: "17" }, { label: "Today", v: f >= a3 ? 300 : 0.01, color: H.cyan, tag: f >= a3 ? "≈300" : "" }]} />
        <Badge x={240} y={95} text="15×+" sub="the rescue" at={a3 + 20} color={H.teal} size={40} />
      </Panel>
    </Scene>
  );
};

// ── #10 Malaysia · the peg ───────────────────────────────────────────────────
export const PegNeedle: React.FC<{ dur: number; p: any }> = ({ dur, p }) => {
  const f = useCurrentFrame();
  const a1 = s(T(p, 0, 0.3)), lock = s(T(p, 1, 2.4)), a3 = s(T(p, 2, 4.4));
  const year = Math.round(interpolate(f, [a3, a3 + 60], [1998, 2005], cl));
  const pts = [2.5, 2.8, 3.4, 3.2, 4.1, 3.6, 4.9, 4.2, 3.9, 4.1, 3.8, 3.8, 3.8, 3.8, 3.8, 3.8];
  return (
    <Scene dur={dur} title="MALAYSIA · RINGGIT CONTROL" tag="BANK NEGARA MALAYSIA" src={p.src ?? "Ringgit fixed at 3.80 per US$, 1 Sep 1998 – Jul 2005 (Bank Negara Malaysia · NBER)"}>
      <Zone3D x={120} y={170} w={560} h={620} title="Ringgit per US dollar" at={a1}><Dial3D lock={lock} dur={dur} /></Zone3D>
      <Panel x={720} y={170} w={1080} h={620} title="1997 → 2005" at={a1 + 8}>
        <LineChart x={100} y={110} w={900} h={360} pts={pts} min={2} max={5} ticks={[2, 3, 4, 5]} at={a1 + 12} dur={Math.max(30, lock - a1 + 20)} color={H.cyan}
          xlabels={["1997", "", "", "", "", "", "", "", "", "SEP 98", "", "", "", "", "", "2005"]} markers={[{ i: 10, text: "3.80", color: H.amber }]} />
        <Note x={740} y={70} text="1997–98 SWINGS INDICATIVE" />
        {f >= a3 && <div style={{ position: "absolute", right: 60, top: 500 }}><Digits value={year} at={a3} dur={60} from={1998} size={60} color={H.amber} /></div>}
      </Panel>
    </Scene>
  );
};

// ── #9 Indonesia · same rate, different country ─────────────────────────────
export const TwinBoards: React.FC<{ dur: number; p: any }> = ({ dur, p }) => {
  const a1 = s(T(p, 0, 0.3)), a2 = s(T(p, 1, 1.8)), a3 = s(T(p, 2, 3.6));
  const board = (x: number, title: string, v: number, at: number, infl: number, col: string, ia: number) => (
    <Panel x={x} y={170} w={540} h={640} title={title} at={at}>
      <div style={{ position: "absolute", left: 30, top: 80 }}><Label size={22} color={H.dim} caps>Rupiah per US dollar</Label></div>
      <div style={{ position: "absolute", left: 30, top: 118, padding: "12px 20px", border: `1px solid ${H.line}`, background: "rgba(2,11,31,0.7)" }}>
        <Digits value={v} at={at + 6} dur={30} from={9000} prefix="Rp " size={62} color="#ffd34d" />
      </div>
      <div style={{ position: "absolute", left: 30, top: 270 }}><Label size={22} color={H.dim} caps>Inflation</Label></div>
      <VGauge x={50} y={310} h={250} w={100} level={infl / 60} color={col} at={ia} />
      <div style={{ position: "absolute", left: 200, top: 400 }}><Digits value={infl} decimals={infl < 10 ? 1 : 0} suffix="%" at={ia} dur={30} size={88} color={col} /></div>
    </Panel>
  );
  return (
    <Scene dur={dur} title="INDONESIA · SAME NUMBER, DIFFERENT COUNTRY" tag="BLOOMBERG · JAKARTA POST" src={p.src ?? "Rupiah ≈16,800 (Jun 1998) · 18,000 (Jun 2026) · inflation ≈58% (1998) vs 2.6% (2025) · basket illustrative"}>
      {board(120, "June 1998", 16800, a1, 58, H.red, a3)}
      <Zone3D x={690} y={170} w={540} h={640} title="Same basket, different bill" at={a3 - 10}><Basket3D a1={a3} dur={dur} /></Zone3D>
      {board(1260, "2026", 18000, a2, 2.6, H.teal, a3 + 8)}
    </Scene>
  );
};

// ── #8 CMIM · the $240 bn pool ───────────────────────────────────────────────
export const VaultPool: React.FC<{ dur: number; p: any }> = ({ dur, p }) => {
  const f = useCurrentFrame();
  const a1 = s(T(p, 0, 0.3)), a2 = s(T(p, 1, 3.6));
  const rows: any[] = [{ n: "Japan", v: 76.8, c: H.cyan }, { n: "China", v: 76.8, c: H.red }, { n: "South Korea", v: 38.4, c: H.violet, short: "Korea" }, { n: "ASEAN", v: 48, c: H.amber }];
  return (
    <Scene dur={dur} title="CHIANG MAI INITIATIVE · RESERVE POOL" tag="ASEAN+3 · AMRO" src={p.src ?? "CMIM US$240 bn (Japan & China 76.8 each, Korea 38.4, ASEAN 48) · never used for a real rescue (Reuters via The Nation)"}>
      <Panel x={120} y={170} w={760} h={640} title="Contributions · US$ bn" at={a1}>
        <Ring cx={200} cy={300} r={130} segs={rows.map((r) => ({ v: (r.v / 240) * 100, color: r.c }))} at={a1 + 8} dur={45}>
          <Label size={22} color={H.dim} caps>Total</Label>
          <Digits value={240} prefix="$" suffix=" bn" at={a1 + 8} dur={45} size={48} />
        </Ring>
        <div style={{ position: "absolute", left: 420, top: 160 }}>
          {rows.map((r, i) => FLAGS[r.n] ? <Img key={r.n} src={staticFile(FLAGS[r.n])} style={{ position: "absolute", left: -66, top: i * 58 + 13, width: 46, height: 31, objectFit: "cover", border: "1px solid white",
            opacity: interpolate(f, [a1 + 20 + i * 5, a1 + 28 + i * 5], [0, 1], cl) }} /> : null)}
          <Legend x={0} y={0} w={310} at={a1 + 20} rows={rows.map((r) => ({ color: r.c, label: r.short ?? r.n, value: `${r.v}` }))} />
        </div>
        <div style={{ position: "absolute", left: 0, width: 760, top: 520, textAlign: "center" }}>
          <Label size={22} color={H.dim} caps>Real rescues</Label>
          <Digits value={0} fixed="0" at={a2} size={70} color={H.amber} />
        </div>
      </Panel>
      <Zone3D x={940} y={170} w={860} h={640} title="The vault nobody has opened" at={a1 + 6}><Vault3D a1={a1 + 10} a2={a2} dur={dur} /></Zone3D>
    </Scene>
  );
};

// ── #7 Timor-Leste · fund runway ─────────────────────────────────────────────
export const Hourglass: React.FC<{ dur: number; p: any }> = ({ dur, p }) => {
  const f = useCurrentFrame();
  const a1 = s(T(p, 0, 0.2)), a2 = s(T(p, 1, 0.9));
  const year = Math.round(interpolate(f, [a2 + 10, dur - 6], [2025, 2035], cl));
  return (
    <Scene dur={dur} title="TIMOR-LESTE · PETROLEUM FUND RUNWAY" tag="BCTL · IMF · BUDGET FY2026" src={p.src ?? "US$18.61 bn end-2025 (BCTL) · IMF projection US$12.8 bn in 2030 · depletion warning by 2035 if excess withdrawals persist (Budget Strategy FY2026)"}>
      <Zone3D x={120} y={170} w={620} h={640} title="Oil stopped · the fund drains" at={a1} overlay={<><div style={{ position: "absolute", right: 24, bottom: 20, textAlign: "right" }}>
          <Label size={20} color={H.dim} caps>Could run dry by</Label>
          <Digits value={year} from={2025} at={a2 + 10} dur={Math.max(10, dur - a2 - 16)} size={52} color={year >= 2035 ? H.red : H.ice} />
        </div></>}><Hourglass3D a1={a1} a2={a2} dur={dur} /></Zone3D>
      <Panel x={780} y={170} w={1020} h={640} title="Fund balance · US$ bn" at={a2}>
        <div style={{ position: "absolute", left: 40, top: 76 }}><Digits value={18.6} decimals={1} prefix="$" suffix=" bn" at={a2 + 4} dur={30} size={52} /><Label size={22} color={H.dim}>≈ 8× the non-oil economy</Label></div>
        <LineChart x={100} y={200} w={840} h={300} pts={[18.6, 16.1, 12.8, 6.4, 0]} min={0} max={20} ticks={[0, 10, 20]} at={a2 + 10} dur={70} color={H.amber}
          xlabels={["2025", "", "2030", "", "2035"]} markers={[{ i: 2, text: "12.8", color: H.amber }, { i: 4, text: "0", color: H.red }]} />
        <Note x={600} y={90} text="2030 IMF · 2035 WARNING SCENARIO" />
      </Panel>
    </Scene>
  );
};

// ── #4 Laos · kip vs foreign-currency debt ──────────────────────────────────
export const KipShrink: React.FC<{ dur: number; p: any }> = ({ dur, p }) => {
  const a1 = s(T(p, 0, 0.6)), a2 = s(T(p, 1, 3.0)), a3 = s(T(p, 2, 5.4));
  return (
    <Scene dur={dur} title="LAOS · CURRENCY MONITOR" tag="AMRO · BANK OF THE LAO PDR" src={p.src ?? "Kip lost about half its value since 2022 (AMRO) · inflation 31% (2023), 23% (2024), single digits (2025)"}>
      <Zone3D x={120} y={170} w={620} h={640} title="The kip shrinks · the debt grows" at={4}><Kip3D a1={a1 + 4} a2={a2} dur={dur} /></Zone3D>
      <Panel x={780} y={170} w={560} h={640} title="Kip value vs US$ · index" at={12}>
        <LineChart x={80} y={120} w={440} h={380} pts={[100, 98, 80, 64, 55, 51, 50]} min={0} max={110} ticks={[0, 50, 100]} at={Math.min(a1 + 12, 20)} dur={60} color={H.violet}
          xlabels={["2021", "", "", "2023", "", "", "2025"]} markers={[{ i: 6, text: "≈ ½", color: H.red }]} />
        <Note x={300} y={76} text="INDICATIVE PATH" />
      </Panel>
      <Panel x={1380} y={170} w={420} h={640} title="Inflation" at={a2 + 10} accent={H.amber}>
        <BarChart x={70} y={130} w={300} h={380} max={35} ticks={[0, 10, 20, 30]} unit="%" at={Math.min(a3, a2 + 40)} barW={44}
          data={[{ label: "2023", v: 31, color: H.red, tag: "31%" }, { label: "2024", v: 23, color: H.amber, tag: "23%" }, { label: "2025", v: 8, color: H.teal, tag: "<10%" }]} />
      </Panel>
    </Scene>
  );
};

// ── #3 Laos · deferred payments ──────────────────────────────────────────────
export const CalendarPush: React.FC<{ dur: number; p: any }> = ({ dur, p }) => {
  const a1 = s(T(p, 0, 0.3));
  return (
    <Scene dur={dur} title="LAOS · DEBT SERVICE SCHEDULE" tag="LOWY INSTITUTE" src={p.src ?? "No formal default only due to repeated deferrals from China, which holds nearly half of Laos's external public debt (Lowy Institute)"}>
      <Panel x={120} y={170} w={480} h={640} title="External public debt" at={a1}>
        <Ring cx={240} cy={280} r={140} segs={[{ v: 48, color: H.red }, { v: 52, color: H.blue }]} at={a1 + 6} dur={36}>
          <Label size={22} color={H.dim} caps>China</Label>
          <Digits value={0} fixed="≈ ½" at={a1 + 6} size={74} />
        </Ring>
        <Legend x={40} y={490} w={400} at={a1 + 20} rows={[{ color: H.red, label: "Chinese creditors", value: "≈ ½" }, { color: H.blue, label: "Others", value: "" }]} />
      </Panel>
      <Zone3D x={640} y={170} w={1160} h={640} title="Due dates keep moving" at={a1 + 6}><Calendar3D a1={a1 + 10} dur={dur} /></Zone3D>
    </Scene>
  );
};

// ── #2 Singapore vs Laos · the seesaw + comparison console ──────────────────
export const Seesaw: React.FC<{ dur: number; p: any }> = ({ dur, p }) => {
  const a1 = s(T(p, 0, 0.3)), a2 = s(T(p, 1, 1.2)), a3 = s(T(p, 2, 5.0));
  return (
    <Scene dur={dur} title="RISK CONSOLE · SINGAPORE vs LAOS" tag="IMF · WORLD BANK" src={p.src ?? "IMF 2025 Article IV (Laos debt unsustainable) · World Bank: reserves US$4.2 bn (Mar 2026), debt service ≈13% of GDP (2026)"}>
      <Zone3D x={120} y={170} w={760} h={640} title="Smaller debt, bigger danger" at={a1} overlay={<><Badge x={600} y={575} text="UNSUSTAINABLE" sub="IMF 2025 · Laos" at={a2 + 12} color={H.red} size={26} />
        <Badge x={150} y={575} text="AAA" sub="Singapore" at={a1 + 16} color={H.teal} size={40} /></>}><Seesaw3D a1={a1} a2={a2} dur={dur} /></Zone3D>
      <Panel x={920} y={170} w={880} h={640} title="Why" at={a3 - 10}>
        <DataTable x={20} y={70} w={840} at={a3} widths={[320, 260, 260]} cols={["", "Singapore", "Laos"]}
          rows={[
            { cells: ["Debt vs GDP", "≈170%", "≈83%"] },
            { cells: ["Owed to", "mostly itself", "foreigners"], colors: [undefined, H.teal, H.red] },
            { cells: ["Currency of debt", "its own", "can't print"], colors: [undefined, H.teal, H.red] },
            { cells: ["Assets vs debt", "owns more", "—"], colors: [undefined, H.teal, H.dim] },
            { cells: ["Debt service 2026", "—", "≈13% GDP"], colors: [undefined, H.dim, H.amber] },
            { cells: ["Reserves", "—", "$4.2 bn"], colors: [undefined, H.dim, H.ice] },
          ]} />
      </Panel>
    </Scene>
  );
};

export const VIZ = { BalanceScale, SavingsTank, BanknoteGrid, BahtCrack, PegNeedle, TwinBoards, VaultPool, Hourglass, KipShrink, CalendarPush, Seesaw };
