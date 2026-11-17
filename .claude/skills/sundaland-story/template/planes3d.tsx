import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PROJ } from "./mapData";
import { Cam, toScreen, s } from "./parts";

// ── 3D aircraft flying along map paths (air routes only; sea routes keep the flat ship marker).
//    One ThreeCanvas per map shot; a perspective camera is fitted so z=0 maps 1:1 onto the 1920×1080 frame,
//    so a plane placed at a route point sits exactly on the SVG line. Everything is driven by useCurrentFrame().
//    Plane spec (seconds, scene-local):
//      { pts: [[lon,lat],…] | arc: {a:[lon,lat], b:[lon,lat], bend},  at, dur,
//        side: "jp"|"allied", kind: "fighter"|"twin"|"flyingboat", size (px), alt (px),
//        end: "fly"|"fade"|"strike"|"crash", out (s), trail (bool), ease: "arc"|"cruise" }

const W = 1920, HH = 1080, D = 1500;
const FOV = (2 * Math.atan(HH / 2 / D) * 180) / Math.PI;
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ll = (lon: number, lat: number): [number, number] => [(lon - PROJ.lon0) * PROJ.k * PROJ.sx, (PROJ.lat1 - lat) * PROJ.sx];
type P2 = { x: number; y: number };

const Rig: React.FC = () => {
  const { camera } = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.fov = FOV; c.near = 10; c.far = 5000; c.position.set(W / 2, -HH / 2, D); c.up.set(0, 1, 0); c.lookAt(W / 2, -HH / 2, 0); c.updateProjectionMatrix();
  return null;
};

// Catmull-Rom through screen points → dense polyline with cumulative length
const densify = (pts: P2[], n = 24): P2[] => {
  if (pts.length < 3) { const out: P2[] = []; for (let i = 0; i <= n; i++) out.push({ x: pts[0].x + (pts[1].x - pts[0].x) * i / n, y: pts[0].y + (pts[1].y - pts[0].y) * i / n }); return out; }
  const out: P2[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let j = 0; j < n; j++) {
      const t = j / n, t2 = t * t, t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push({ x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) });
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};
const quad = (A: P2, C: P2, B: P2, n = 60): P2[] => Array.from({ length: n + 1 }, (_, i) => { const t = i / n; return { x: (1 - t) ** 2 * A.x + 2 * (1 - t) * t * C.x + t * t * B.x, y: (1 - t) ** 2 * A.y + 2 * (1 - t) * t * C.y + t * t * B.y }; });
const sample = (poly: P2[], p: number) => {
  const seg = poly.slice(1).map((q, i) => Math.hypot(q.x - poly[i].x, q.y - poly[i].y));
  const L = seg.reduce((a, b) => a + b, 0);
  let rem = Math.max(0, Math.min(1, p)) * L;
  for (let i = 0; i < seg.length; i++) {
    if (rem <= seg[i] || i === seg.length - 1) {
      const t = seg[i] ? Math.min(1, rem / seg[i]) : 0;
      return { x: poly[i].x + (poly[i + 1].x - poly[i].x) * t, y: poly[i].y + (poly[i + 1].y - poly[i].y) * t, ang: Math.atan2(poly[i + 1].y - poly[i].y, poly[i + 1].x - poly[i].x), L, idx: i, t };
    }
    rem -= seg[i];
  }
  const a = poly[poly.length - 2], b = poly[poly.length - 1];
  return { x: b.x, y: b.y, ang: Math.atan2(b.y - a.y, b.x - a.x), L, idx: poly.length - 2, t: 1 };
};
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

const PAL = {
  jp: { body: "#7C8A5E", belly: "#B9B7A3", trim: "#2B2F25", mark: "jp" },
  allied: { body: "#8C7B57", belly: "#9AA6AE", trim: "#2A2A26", mark: "raf" },
  flyingboat: { body: "#A7B2BA", belly: "#D6DCE0", trim: "#33383C", mark: "raf" },
} as const;

/** Low-poly WWII aircraft. Nose +X, span ±Y, up +Z; overall length ≈ 1. */
const Aircraft: React.FC<{ kind: string; side: string; f: number }> = ({ kind, side, f }) => {
  const pal = kind === "flyingboat" ? PAL.flyingboat : side === "jp" ? PAL.jp : PAL.allied;
  const mat = (c: string, r = 0.55) => <meshStandardMaterial color={c} metalness={0.35} roughness={r} />;
  const span = kind === "flyingboat" ? 1.45 : kind === "twin" ? 1.15 : 1.0;
  const wingZ = kind === "flyingboat" ? 0.13 : 0.0;
  const prop = (x: number, y: number, z: number, r: number, key: string) => (
    <group key={key} position={[x, y, z]} rotation={[f * 1.9, 0, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.03, 0.03, 0.04, 10]} />{mat("#222")}</mesh>
      <mesh><boxGeometry args={[0.012, r * 2, 0.035]} />{mat("#1b1b1b", 0.8)}</mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><boxGeometry args={[0.012, r * 2, 0.035]} />{mat("#1b1b1b", 0.8)}</mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}><circleGeometry args={[r, 28]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.16} side={THREE.DoubleSide} depthWrite={false} /></mesh>
    </group>
  );
  const roundel = (y: number, key: string) => pal.mark === "jp"
    ? <mesh key={key} position={[0.06, y, wingZ + 0.015]}><circleGeometry args={[0.075, 28]} /><meshBasicMaterial color="#D7262E" /></mesh>
    : <group key={key} position={[0.06, y, wingZ + 0.015]}>
        <mesh><circleGeometry args={[0.075, 28]} /><meshBasicMaterial color="#27407E" /></mesh>
        <mesh position={[0, 0, 0.002]}><circleGeometry args={[0.05, 28]} /><meshBasicMaterial color="#F2F2F2" /></mesh>
        <mesh position={[0, 0, 0.004]}><circleGeometry args={[0.026, 28]} /><meshBasicMaterial color="#C8262E" /></mesh>
      </group>;
  return (
    <group>
      {/* fuselage (hull for the flying boat) */}
      <mesh rotation={[0, 0, -Math.PI / 2]}><cylinderGeometry args={[kind === "flyingboat" ? 0.085 : 0.07, 0.028, 0.86, 18]} />{mat(pal.body)}</mesh>
      <mesh position={[0.43, 0, 0]} scale={[1.2, 1, 1]}><sphereGeometry args={[kind === "flyingboat" ? 0.085 : 0.07, 18, 12]} />{mat(kind === "twin" ? "#9FB4C4" : pal.body, 0.4)}</mesh>
      {kind === "flyingboat" && <mesh position={[0.05, 0, -0.06]} rotation={[0, 0, -Math.PI / 2]}><cylinderGeometry args={[0.05, 0.02, 0.78, 12]} />{mat(pal.belly)}</mesh>}
      {/* canopy */}
      <mesh position={[kind === "twin" ? 0.28 : 0.1, 0, 0.06]} scale={[1.7, 0.8, 0.75]}><sphereGeometry args={[0.05, 16, 10]} /><meshStandardMaterial color="#BFE3FF" metalness={0.6} roughness={0.15} emissive="#5B8DB8" emissiveIntensity={0.25} /></mesh>
      {/* wings + struts */}
      <mesh position={[0.06, 0, wingZ]}><boxGeometry args={[0.2, span, 0.024]} />{mat(pal.body)}</mesh>
      <mesh position={[0.06, 0, wingZ - 0.014]}><boxGeometry args={[0.19, span * 0.98, 0.006]} />{mat(pal.belly)}</mesh>
      {kind === "flyingboat" && <mesh position={[0.06, 0, 0.07]}><boxGeometry args={[0.09, 0.05, 0.12]} />{mat(pal.body)}</mesh>}
      {kind === "flyingboat" && [-1, 1].map((sg) => <mesh key={`fl${sg}`} position={[0.06, sg * span * 0.46, 0.04]}><boxGeometry args={[0.1, 0.03, 0.05]} />{mat(pal.belly)}</mesh>)}
      {/* tail */}
      <mesh position={[-0.39, 0, 0.0]}><boxGeometry args={[0.12, 0.38, 0.018]} />{mat(pal.body)}</mesh>
      <mesh position={[-0.4, 0, 0.09]}><boxGeometry args={[0.15, 0.018, 0.18]} />{mat(pal.body)}</mesh>
      {pal.mark === "raf" && <mesh position={[-0.4, 0.011, 0.11]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[0.06, 0.09]} /><meshBasicMaterial color="#C8262E" side={THREE.DoubleSide} /></mesh>}
      {/* engines / props */}
      {kind === "fighter" && prop(0.52, 0, 0, 0.17, "p0")}
      {kind !== "fighter" && [-1, 1].map((sg) => (
        <group key={`e${sg}`}>
          <mesh position={[0.17, sg * 0.26, wingZ]} rotation={[0, 0, -Math.PI / 2]}><cylinderGeometry args={[0.045, 0.035, 0.26, 14]} />{mat(pal.trim, 0.5)}</mesh>
          {prop(0.31, sg * 0.26, wingZ, 0.14, `pp${sg}`)}
        </group>
      ))}
      {[-1, 1].map((sg) => roundel(sg * span * 0.34, `r${sg}`))}
    </group>
  );
};

const resolvePath = (cam: Cam, q: any): P2[] => {
  if (q.arc) {
    const A = toScreen(cam, ...ll(q.arc.a[0], q.arc.a[1])), B = toScreen(cam, ...ll(q.arc.b[0], q.arc.b[1]));
    const bend = q.arc.bend ?? 0.22, dx = B.x - A.x, dy = B.y - A.y;
    return quad(A, { x: (A.x + B.x) / 2 - dy * bend, y: (A.y + B.y) / 2 + dx * bend }, B);
  }
  return densify((q.pts as [number, number][]).map(([lo, la]) => toScreen(cam, ...ll(lo, la))));
};

interface PlaneState { key: number; x: number; y: number; heading: number; roll: number; pitch: number; size: number; alt: number; o: number; kind: string; side: string; flash: number; fx: number; fy: number; trail?: string; trailO: number }

const planeState = (f: number, cam: Cam, q: any, key: number): PlaneState | null => {
  const at = s(q.at ?? 0), dur = Math.max(1, s(q.dur ?? 2));
  if (f < at) return null;
  const endKind = q.end ?? "fly";
  const crashLen = s(1.3), fadeLen = s(0.45);
  const tail = endKind === "crash" ? crashLen : endKind === "fade" || endKind === "strike" ? fadeLen : 0;
  if (endKind !== "fly" && f > at + dur + tail + s(0.6)) return null;
  const poly = resolvePath(cam, q);
  const ease = q.ease === "arc" ? Easing.inOut(Easing.cubic) : Easing.inOut(Easing.sin);
  const p = interpolate(f, [at, at + dur], [0, 1], { ...cl, easing: ease });
  const h = sample(poly, p), h2 = sample(poly, Math.min(1, p + 0.015)), h0 = sample(poly, Math.max(0, p - 0.015));
  let x = h.x, y = h.y;
  let heading = -Math.atan2(h2.y - h0.y, h2.x - h0.x || 1e-6);
  const turn = wrap(Math.atan2(h2.y - h.y, h2.x - h.x) - Math.atan2(h.y - h0.y, h.x - h0.x));
  let roll = Math.max(-1.0, Math.min(1.0, -turn * 9)) + Math.sin(f * 0.11 + key) * 0.05;
  let pitch = -0.12;
  let size = q.size ?? 90, alt = q.alt ?? 70, o = interpolate(f, [at, at + 6], [0, 1], cl);
  let flash = 0, fx = x, fy = y;
  const t = f - (at + dur);
  if (t > 0 && endKind === "crash") {
    const k = Math.min(1, t / crashLen);
    const fwd = 70 * Math.sqrt(k);
    x += Math.cos(-heading) * fwd; y += Math.sin(-heading) * fwd + 40 * k * k;
    roll += k * 9; pitch = 0.2 + 0.9 * k; heading += k * 1.6;
    size *= 1 - 0.45 * k; alt *= 1 - k;
    o = interpolate(t, [crashLen * 0.75, crashLen + 4], [1, 0], cl);
    flash = interpolate(t, [crashLen * 0.8, crashLen + 3, crashLen + 16], [0, 1, 0], cl); fx = x; fy = y;
  } else if (t > 0 && (endKind === "fade" || endKind === "strike")) {
    o = interpolate(t, [0, fadeLen], [1, 0], cl); size *= 1 - 0.35 * Math.min(1, t / fadeLen); alt *= 1 - Math.min(1, t / fadeLen);
    if (endKind === "strike") { flash = interpolate(t, [0, 3, 16], [0, 1, 0], cl); fx = h.x; fy = h.y; }
  }
  if (q.out != null) o *= interpolate(f, [s(q.out), s(q.out) + 8], [1, 0], cl);
  // dashed contrail behind the plane (air routes are dashed white; sea routes stay solid amber)
  let trail: string | undefined;
  if (q.trail !== false && !q.arc) {
    const cut = poly.slice(0, h.idx + 1).concat([{ x: h.x, y: h.y }]);
    trail = "M" + cut.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" L");
  }
  const trailO = q.out != null ? interpolate(f, [s(q.out), s(q.out) + 8], [1, 0], cl) : interpolate(f, [at + dur + tail, at + dur + tail + s(0.8)], [1, endKind === "fly" ? 1 : 0.0], cl);
  return { key, x, y, heading, roll, pitch, size, alt, o, kind: q.kind ?? "fighter", side: q.side ?? "jp", flash, fx, fy, trail, trailO };
};

export const Planes3D: React.FC<{ cam: Cam; items: any[] }> = ({ cam, items }) => {
  const f = useCurrentFrame();
  const st = items.map((q, i) => planeState(f, cam, q, i)).filter(Boolean) as PlaneState[];
  if (!st.length) return null;
  return (
    <>
      <svg style={{ position: "absolute", inset: 0, width: W, height: HH, overflow: "visible" }}>
        {st.map((p) => p.trail && <path key={`t${p.key}`} d={p.trail} fill="none" stroke="white" strokeWidth={3.5} strokeDasharray="10 12" strokeLinecap="round" opacity={0.85 * p.trailO}
          style={{ filter: "drop-shadow(0 0 5px rgba(255,255,255,.7))" }} />)}
        {/* soft ground shadow, offset down-right by altitude */}
        {st.map((p) => p.o > 0 && <ellipse key={`s${p.key}`} cx={p.x + p.alt * 0.35} cy={p.y + p.alt * 0.55} rx={p.size * 0.5} ry={p.size * 0.16}
          transform={`rotate(${(-p.heading * 180) / Math.PI} ${p.x + p.alt * 0.35} ${p.y + p.alt * 0.55})`} fill="rgba(0,0,0,0.38)" opacity={p.o} style={{ filter: "blur(5px)" }} />)}
        {st.map((p) => p.flash > 0 && <g key={`f${p.key}`} opacity={p.flash}>
          <circle cx={p.fx} cy={p.fy} r={20 + 50 * p.flash} fill="rgba(255,170,60,0.55)" style={{ filter: "blur(6px)" }} />
          <circle cx={p.fx} cy={p.fy} r={10 + 18 * p.flash} fill="#FFE2A0" />
        </g>)}
      </svg>
      <ThreeCanvas width={W} height={HH} style={{ position: "absolute", inset: 0 }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
        <Rig />
        <ambientLight intensity={0.9} />
        <directionalLight position={[-600, 900, 1400]} intensity={2.4} color="#FFF4E0" />
        <directionalLight position={[900, -500, 600]} intensity={0.6} color="#9CC7FF" />
        {st.map((p) => {
          // keep the plane's projection on the route point despite its altitude
          const k = (D - p.alt) / D;
          const wx = W / 2 + (p.x - W / 2) * k, wy = -(HH / 2 + (p.y - HH / 2) * k);
          return (
            <group key={p.key} position={[wx, wy, p.alt]} rotation={[0, 0, p.heading]} scale={p.size * k} visible={p.o > 0.02}>
              <group rotation={[p.roll, p.pitch, 0]}>
                <Fade o={p.o}><Aircraft kind={p.kind} side={p.side} f={f} /></Fade>
              </group>
            </group>
          );
        })}
      </ThreeCanvas>
    </>
  );
};

/** Multiplies opacity of every material below (used for fade-in / crash fade). */
const Fade: React.FC<{ o: number; children: React.ReactNode }> = ({ o, children }) => {
  const ref = React.useRef<THREE.Group>(null);
  React.useLayoutEffect(() => {
    ref.current?.traverse((m: any) => {
      if (!m.material) return;
      const mt = m.material as THREE.Material & { userData: any };
      if (mt.userData.o0 == null) mt.userData.o0 = mt.opacity;
      mt.transparent = true; mt.opacity = mt.userData.o0 * o; mt.needsUpdate = true;
    });
  });
  return <group ref={ref}>{children}</group>;
};
