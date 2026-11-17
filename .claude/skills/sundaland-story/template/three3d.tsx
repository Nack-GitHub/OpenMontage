import React, { useMemo } from "react";
import { Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { H, HUDT, glow } from "./hud";

// ── 3D story objects with a moving camera (user direction 2026-11-12: "metaphors as 3D with fun camera moves").
//    Holographic look: translucent emissive solids + glowing edges, cyan grid floor, glowing pedestal ring.
//    Everything is driven by useCurrentFrame() → deterministic renders. Render with chromiumOptions.gl = "angle".

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const eio = { ...cl, easing: Easing.inOut(Easing.cubic) };
const lerp = (f: number, a: number, b: number, x: number, y: number, e: Record<string, any> = eio) => interpolate(f, [a, b], [x, y], e as any);
type V3 = [number, number, number];

// ── materials / helpers ──────────────────────────────────────────────────────
const texCache = new Map<string, THREE.CanvasTexture>();
export const textTex = (key: string, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void, w = 512, h = 256) => {
  if (texCache.has(key)) return texCache.get(key)!;
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const c = cv.getContext("2d")!; draw(c, w, h);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  texCache.set(key, t); return t;
};
const noteTex = (key: string, label: string, fg: string, bg: string) => textTex(key, (c, w, h) => {
  c.fillStyle = bg; c.fillRect(0, 0, w, h);
  c.strokeStyle = fg; c.lineWidth = 10; c.strokeRect(14, 14, w - 28, h - 28);
  c.lineWidth = 3; c.strokeRect(34, 34, w - 68, h - 68);
  c.beginPath(); c.arc(w * 0.78, h / 2, 62, 0, Math.PI * 2); c.stroke();
  c.fillStyle = fg; c.font = "bold 92px sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(label, w * 0.4, h / 2 + 4);
});
const labelTex = (key: string, label: string, fg: string, bg = "rgba(4,23,58,0.85)", w = 512, h = 160, size = 86) => textTex(key, (c) => {
  c.fillStyle = bg; c.fillRect(0, 0, w, h); c.strokeStyle = fg; c.lineWidth = 8; c.strokeRect(6, 6, w - 12, h - 12);
  c.fillStyle = fg; c.font = `bold ${size}px sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(label, w / 2, h / 2 + 4);
}, w, h);

const Holo: React.FC<{ geo: THREE.BufferGeometry; color: string; opacity?: number; edge?: string; emissive?: number; position?: V3; rotation?: V3; scale?: number | V3; map?: THREE.Texture; edges?: boolean }> = ({
  geo, color, opacity = 0.42, edge, emissive = 0.55, position, rotation, scale, map, edges = true,
}) => {
  const eg = useMemo(() => new THREE.EdgesGeometry(geo, 25), [geo]);
  return (
    <group position={position} rotation={rotation} scale={scale as any}>
      <mesh geometry={geo}>
        <meshStandardMaterial color={map ? "#ffffff" : color} map={map} emissive={color} emissiveIntensity={map ? 0.15 : emissive} transparent opacity={map ? 0.95 : opacity}
          metalness={0.25} roughness={0.35} depthWrite={!!map} side={THREE.DoubleSide} />
      </mesh>
      {edges && <lineSegments geometry={eg}><lineBasicMaterial color={edge ?? color} transparent opacity={0.95} /></lineSegments>}
    </group>
  );
};

/** Camera keyframes: [frame, position, target]; eased, with a faint handheld drift. */
const CameraRig: React.FC<{ keys: [number, V3, V3][]; drift?: number; fov?: number }> = ({ keys, drift = 0, fov = 34 }) => {
  const f = useCurrentFrame();
  const { camera } = useThree();
  const ks = keys.map((k, i) => [Math.max(k[0], i ? keys[i - 1][0] + 1 + i * 0.001 : k[0]), k[1], k[2]] as [number, V3, V3]);
  const fr = ks.map((k) => k[0]);
  const ip = (sel: (k: [number, V3, V3]) => number) => ks.length === 1 ? sel(ks[0]) : interpolate(f, fr, ks.map(sel), eio);
  camera.position.set(ip((k) => k[1][0]) + Math.sin(f * 0.07) * drift, ip((k) => k[1][1]) + Math.cos(f * 0.053) * drift, ip((k) => k[1][2]));
  camera.lookAt(ip((k) => k[2][0]), ip((k) => k[2][1]), ip((k) => k[2][2]));
  (camera as THREE.PerspectiveCamera).fov = fov; camera.updateProjectionMatrix();
  return null;
};
const orbit = (deg: number, r: number, y: number, c: V3 = [0, 0, 0]): V3 => [c[0] + Math.sin(deg * Math.PI / 180) * r, y, c[2] + Math.cos(deg * Math.PI / 180) * r];

/** Floor grid + pedestal ring + lights shared by every 3D stage. */
const Floor: React.FC<{ r?: number; color?: string }> = ({ r = 2.6, color = H.cyan }) => {
  const f = useCurrentFrame();
  return (
    <group>
      <gridHelper args={[14, 28, color, "#0d3b78"]} position={[0, 0, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}><ringGeometry args={[r - 0.06, r, 96]} /><meshBasicMaterial color={color} transparent opacity={0.9} side={THREE.DoubleSide} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, f * 0.01]} position={[0, 0.006, 0]}><ringGeometry args={[r + 0.15, r + 0.22, 96, 1, 0, Math.PI * 1.4]} /><meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}><circleGeometry args={[r - 0.06, 96]} /><meshBasicMaterial color={color} transparent opacity={0.08} /></mesh>
      <ambientLight intensity={0.55} />
      <pointLight position={[3, 5, 4]} intensity={60} color={H.ice} />
      <pointLight position={[-4, 3, -2]} intensity={40} color={H.blue} />
      <pointLight position={[0, 1.5, 3]} intensity={18} color={H.amber} />
    </group>
  );
};

/** A floating 3D zone (no panel frame) placed on the HUD scene; transparent canvas. */
export const Zone3D: React.FC<{ x: number; y: number; w: number; h: number; title?: string; children: React.ReactNode; at?: number; overlay?: React.ReactNode }> = ({ x, y, w, h, title, children, at = 0, overlay }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at, at + 12], [0, 1], cl);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, opacity: o }}>
      <div style={{ position: "absolute", inset: 0, WebkitMaskImage: "radial-gradient(ellipse 62% 66% at 50% 48%, black 58%, transparent 100%)", maskImage: "radial-gradient(ellipse 62% 66% at 50% 48%, black 58%, transparent 100%)" }}>
      <ThreeCanvas width={w} height={h} style={{ position: "absolute", inset: 0 }} gl={{ antialias: true, alpha: true }} camera={{ fov: 34, position: [0, 3, 9], near: 0.1, far: 100 }}>
        <fog attach="fog" args={[H.bg0, 7, 15]} />
        <Floor />
        {children}
      </ThreeCanvas>
      </div>
      {overlay}
      {title && <div style={{ position: "absolute", left: 30, top: 18, fontFamily: HUDT, fontWeight: 600, fontSize: 30, color: H.ice, letterSpacing: 1,
        borderLeft: `4px solid ${H.cyan}`, paddingLeft: 14, textShadow: `0 0 12px ${H.blue}` }}>{title}</div>}
      {[[0, 0, 1, 1], [w, h, -1, -1]].map(([px, py, sx, sy], i) => (
        <svg key={i} width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
          <path d={`M${px},${py + sy * 40} L${px},${py} L${px + sx * 40},${py}`} fill="none" stroke={H.cyan} strokeWidth={3} style={{ filter: glow(H.cyan, 6) }} />
        </svg>
      ))}
    </div>
  );
};

// ── geometries (module scope, reused) ────────────────────────────────────────
const G = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 48),
  coin: new THREE.CylinderGeometry(1.2, 1.2, 0.22, 64),
  halfL: new THREE.CylinderGeometry(1.2, 1.2, 0.22, 48, 1, false, 0, Math.PI),
  halfR: new THREE.CylinderGeometry(1.2, 1.2, 0.22, 48, 1, false, Math.PI, Math.PI),
  pan: new THREE.CylinderGeometry(0.75, 0.55, 0.12, 48),
  cone: new THREE.ConeGeometry(0.9, 1.4, 48, 1, true),
  sphere: new THREE.SphereGeometry(0.2, 24, 16),
  drop: new THREE.SphereGeometry(0.09, 16, 12),
  torus: new THREE.TorusGeometry(0.7, 0.06, 16, 64),
  arc: new THREE.TorusGeometry(1.4, 0.06, 12, 96, Math.PI * 1.35),
  shackle: new THREE.TorusGeometry(0.28, 0.07, 12, 32, Math.PI),
  plane: new THREE.PlaneGeometry(1, 0.5),
  tri: new THREE.CylinderGeometry(0.01, 0.5, 0.9, 3),
  kettle: new THREE.CylinderGeometry(0.55, 0.75, 0.9, 6),
  basket: new THREE.CylinderGeometry(0.8, 0.55, 0.7, 24, 1, true),
};
const EG = { halfL: new THREE.EdgesGeometry(G.halfL, 30), halfR: new THREE.EdgesGeometry(G.halfR, 30) };
const plane = (w: number, h: number) => { const k = `${w}x${h}`; return (planes[k] ??= new THREE.PlaneGeometry(w, h)); };
const planes: Record<string, THREE.PlaneGeometry> = {};

/** Simple lattice tower (oil derrick) from thin boxes. */
const Derrick: React.FC<{ position: V3; on: number; scale?: number }> = ({ position, on, scale = 1 }) => {
  const legs: [V3, V3][] = [[[-0.5, 0, -0.5], [0, 2.4, 0]], [[0.5, 0, -0.5], [0, 2.4, 0]], [[-0.5, 0, 0.5], [0, 2.4, 0]], [[0.5, 0, 0.5], [0, 2.4, 0]]];
  return (
    <group position={position} scale={scale}>
      {legs.map(([a, b], i) => { const mid: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]; const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
        const dir = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize(); const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); const e = new THREE.Euler().setFromQuaternion(q);
        return <Holo key={i} geo={G.box} color={H.amber} position={mid} rotation={[e.x, e.y, e.z]} scale={[0.05, len, 0.05]} opacity={0.6} />; })}
      {[0.6, 1.2, 1.8].map((y) => <Holo key={y} geo={G.box} color={H.amber} position={[0, y, 0]} scale={[1 - y / 2.6, 0.04, 1 - y / 2.6]} opacity={0.5} />)}
      <mesh position={[0, 2.5, 0]} geometry={G.sphere}><meshBasicMaterial color={H.amber} transparent opacity={on} /></mesh>
      <pointLight position={[0, 2.5, 0]} intensity={8 * on} color={H.amber} />
    </group>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Story objects (each includes its own CameraRig). Props are scene-local frames.
// ═══════════════════════════════════════════════════════════════════════════

/** #15 Balance: DEBT crate drops, then a tall stack of ASSETS lands and tips the beam. Camera orbits and pushes in. */
export const Scale3D: React.FC<{ a1: number; a2: number; dur: number }> = ({ a1, a2, dur }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const d = spring({ frame: f - a1, fps, config: { damping: 11, stiffness: 90 } });
  const a = spring({ frame: f - a2, fps, config: { damping: 11, stiffness: 90 } });
  const tilt = (-0.17 * d + 0.32 * a);
  const arm = 1.9, cy = 2.4;
  const L: V3 = [-arm * Math.cos(tilt), cy - arm * Math.sin(tilt), 0], R: V3 = [arm * Math.cos(tilt), cy + arm * Math.sin(tilt), 0];
  const panAt = (P: V3): V3 => [P[0], P[1] - 1.1, P[2]];
  return (
    <group>
      <CameraRig keys={[[0, orbit(-35, 8.2, 3.4), [0, 1.9, 0]], [a2, orbit(-10, 8.6, 3.2), [0, 2.0, 0]], [dur, orbit(22, 9.4, 3.4), [0.2, 2.1, 0]]]} />
      <Holo geo={G.cyl} color={H.blue} position={[0, 0.1, 0]} scale={[0.9, 0.2, 0.9]} />
      <Holo geo={G.box} color={H.cyan} position={[0, 1.2, 0]} scale={[0.12, 2.4, 0.12]} />
      <Holo geo={G.box} color={H.ice} position={[0, cy, 0]} rotation={[0, 0, tilt]} scale={[arm * 2, 0.1, 0.18]} opacity={0.7} />
      {[L, R].map((P, i) => (
        <group key={i}>
          <Holo geo={G.box} color={H.cyan} position={[P[0], P[1] - 0.55, 0]} scale={[0.02, 1.1, 0.02]} opacity={0.8} />
          <Holo geo={G.pan} color={H.cyan} position={panAt(P)} />
        </group>
      ))}
      <Holo geo={G.box} color={H.red} position={[panAt(L)[0], panAt(L)[1] + 0.36 + (1 - d) * 4, 0]} scale={0.6} opacity={0.55} />
      <mesh position={[panAt(L)[0], panAt(L)[1] + 0.36 + (1 - d) * 4, 0.31]}><planeGeometry args={[0.56, 0.18]} /><meshBasicMaterial map={labelTex("debt", "DEBT", H.red)} transparent /></mesh>
      {[0, 1, 2].map((k) => <Holo key={k} geo={G.coin} color={H.amber} position={[panAt(R)[0], panAt(R)[1] + 0.17 + k * 0.24 + (1 - a) * (5 + k), 0]} scale={[0.55, 1, 0.55]} opacity={0.6} />)}
      <Holo geo={G.box} color={H.cyan} position={[panAt(R)[0], panAt(R)[1] + 1.15 + (1 - a) * 8, 0]} scale={[0.75, 0.75, 0.75]} opacity={0.4} />
      <mesh position={[panAt(R)[0], panAt(R)[1] + 1.15 + (1 - a) * 8, 0.39]}><planeGeometry args={[0.7, 0.22]} /><meshBasicMaterial map={labelTex("assets", "ASSETS", H.cyan)} transparent /></mesh>
    </group>
  );
};

/** #14 Oil drops from a derrick fill a glass tank; then a pipe drains it (DEFICIT). Low orbit camera. */
export const Tank3D: React.FC<{ a1: number; a2: number; dur: number }> = ({ a1, a2, dur }) => {
  const f = useCurrentFrame();
  const level = lerp(f, a2, dur - 6, 0.9, 0.45, cl);
  const drops = Array.from({ length: 12 }).map((_, i) => {
    const st = a1 + i * 9, age = f - st, alive = i < 12 - Math.floor(lerp(f, a1, dur, 0, 11, cl));
    if (age < 0 || age > 26 || !alive) return null;
    const t = age / 26;
    return <mesh key={i} geometry={G.drop} position={[-2.2 + t * 2.0, 2.9 + t * 0.4 - t * t * 2.2, 0.0]}><meshBasicMaterial color={H.amber} transparent opacity={1 - t * 0.4} /></mesh>;
  });
  const flow = Array.from({ length: 10 }).map((_, i) => {
    if (f < a2) return null; const t = ((f - a2) * 0.04 + i / 10) % 1;
    return <mesh key={i} geometry={G.drop} position={[1.25 + t * 1.6, 0.35 - t * 0.2, 0]} scale={0.8}><meshBasicMaterial color={H.cyan} /></mesh>;
  });
  return (
    <group>
      <CameraRig keys={[[0, orbit(-30, 9.5, 2.6), [0, 1.3, 0]], [a2, orbit(5, 8.5, 2.2), [0.3, 1.2, 0]], [dur, orbit(35, 7.6, 1.6), [0.6, 1.1, 0]]]} />
      <Derrick position={[-2.8, 0, 0]} on={1} scale={1.15} />
      {drops}
      <Holo geo={G.cyl} color={H.cyan} position={[0, 1.4, 0]} scale={[1.1, 2.8, 1.1]} opacity={0.12} />
      <mesh position={[0, 0.05 + 1.4 * level, 0]} geometry={G.cyl} scale={[1.05, 2.8 * level, 1.05]}><meshStandardMaterial color={H.cyan} emissive={H.cyan} emissiveIntensity={0.6} transparent opacity={0.45} /></mesh>
      <mesh position={[0, 0.05 + 2.8 * level + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[1.05, 48]} /><meshBasicMaterial color={H.ice} transparent opacity={0.35} /></mesh>
      <mesh position={[0, 1.3, 1.12]}><planeGeometry args={[1.5, 0.42]} /><meshBasicMaterial map={labelTex("sav", "SAVINGS", H.ice, "rgba(4,23,58,0.6)")} transparent /></mesh>
      <Holo geo={G.cyl} color={H.red} position={[1.6, 0.35, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.12, 1.0, 0.12]} opacity={0.6} />
      {flow}
      {f > a2 && <mesh position={[2.7, 1.0, 0]}><planeGeometry args={[1.4, 0.4]} /><meshBasicMaterial map={labelTex("def", "DEFICIT", H.red)} transparent /></mesh>}
    </group>
  );
};

/** #13 A field of banknotes flips riel → dollar in a wave; camera sweeps low over it. */
export const Notes3D: React.FC<{ a1: number; dur: number }> = ({ a1, dur }) => {
  const f = useCurrentFrame();
  const riel = noteTex("riel", "៛ 4000", "#e4dcff", "#3a2a6e"), usd = noteTex("usd", "$ 1", "#dfffe3", "#1f5a33");
  const cols = 6, rows = 5;
  return (
    <group>
      <CameraRig keys={[[0, [-5.5, 4.2, 6.5], [0, 0.4, 0]], [a1 + 30, [-1.5, 3.4, 6.2], [0, 0.4, 0]], [dur, [4.8, 2.6, 5.4], [0.5, 0.4, -0.3]]]} />
      {Array.from({ length: cols * rows }).map((_, i) => {
        const cx = (i % cols) - (cols - 1) / 2, cz = Math.floor(i / cols) - (rows - 1) / 2;
        const usdNote = random(`n${i}`) < 0.834;
        const st = a1 + (cx + cols / 2) * 6 + random(`d${i}`) * 8;
        const ang = usdNote ? lerp(f, st, st + 14, 0, Math.PI) : 0;
        const lift = Math.sin(Math.min(Math.PI, Math.max(0, ang))) * 0.5;
        return (
          <group key={i} position={[cx * 1.15, 0.15 + lift + i * 0.002, cz * 0.75]} rotation={[-Math.PI / 2 + 0.05, 0, 0]}>
            <group rotation={[0, ang, 0]}>
              <mesh position={[0, 0, 0.002]}><planeGeometry args={[1.0, 0.5]} /><meshStandardMaterial map={riel} emissive="#8f7bff" emissiveIntensity={0.25} side={THREE.FrontSide} /></mesh>
              <mesh position={[0, 0, -0.002]} rotation={[0, Math.PI, 0]}><planeGeometry args={[1.0, 0.5]} /><meshStandardMaterial map={usd} emissive="#7be08a" emissiveIntensity={0.25} side={THREE.FrontSide} /></mesh>
            </group>
          </group>
        );
      })}
    </group>
  );
};

/** #11 A spinning baht coin cracks and splits into two halves; camera dives in and circles. */
export const Coin3D: React.FC<{ a1: number; dur: number }> = ({ a1, dur }) => {
  const f = useCurrentFrame();
  const face = textTex("baht", (c, w, h) => { c.fillStyle = "#6b4a10"; c.fillRect(0, 0, w, h); c.strokeStyle = "#ffd77a"; c.lineWidth = 14; c.beginPath(); c.arc(w / 2, h / 2, w * 0.44, 0, Math.PI * 2); c.stroke();
    c.fillStyle = "#ffd77a"; c.font = "bold 300px sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("฿", w / 2, h / 2 + 10); }, 512, 512);
  const crackAt = a1 + 30, split = lerp(f, crackAt + 10, crackAt + 40, 0, 1);
  const spin = f < crackAt ? f * 0.08 : crackAt * 0.08 + (f - crackAt) * 0.01;
  const shake = f > crackAt - 12 && f < crackAt + 8 ? Math.sin(f * 2.3) * 0.05 : 0; // intentional pre-crack tremor (user wants it)
  const tension = interpolate(f, [crackAt - 24, crackAt], [0.45, 1.1], cl);
  const coinFace = (geo: THREE.BufferGeometry, side: number) => (
    <group position={[side * split * 1.1 + shake, 1.6 + split * side * 0.15, 0]} rotation={[Math.PI / 2, spin, side * split * 0.5]}>
      <mesh geometry={geo}><meshStandardMaterial color="#e9a23b" emissive="#e9a23b" emissiveIntensity={0.45} metalness={0.7} roughness={0.25} transparent opacity={0.9} /></mesh>
      <lineSegments geometry={geo === G.halfL ? EG.halfL : EG.halfR}><lineBasicMaterial color="#ffe1a0" /></lineSegments>
    </group>
  );
  return (
    <group>
      <CameraRig keys={[[0, [0, 2.6, 11], [0, 1.6, 0]], [crackAt, [0.8, 2.3, 8.2], [0, 1.6, 0]], [crackAt + 40, [5.0, 3.0, 7.0], [0, 1.6, 0]], [dur, [7.2, 3.6, 2.0], [0, 1.5, 0]]]} />
      {split < 0.02 ? (
        <group position={[shake, 1.6, 0]} rotation={[Math.PI / 2, spin, 0]}>
          <mesh geometry={G.coin}><meshStandardMaterial color="#e9a23b" emissive="#e9a23b" emissiveIntensity={tension} metalness={0.7} roughness={0.25} /></mesh>
          <mesh position={[0, 0.112, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[1.18, 64]} /><meshStandardMaterial map={face} emissive="#e9a23b" emissiveIntensity={0.2} /></mesh>
        </group>
      ) : (<>{coinFace(G.halfL, -1)}{coinFace(G.halfR, 1)}</>)}
      {f > crackAt && f < crackAt + 20 && Array.from({ length: 14 }).map((_, i) => { const t = (f - crackAt) / 20, a = (i / 14) * Math.PI * 2;
        return <mesh key={i} geometry={G.drop} position={[Math.cos(a) * t * 2.2, 1.6 + Math.sin(a) * t * 2.2, 0]}><meshBasicMaterial color="#ffffff" transparent opacity={1 - t} /></mesh>; })}
    </group>
  );
};

/** #10 A 3D dial: needle swings wildly, then a padlock drops and locks it at 3.80. Camera tilts down onto the lock. */
export const Dial3D: React.FC<{ lock: number; dur: number }> = ({ lock, dur }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const wild = 3.4 + Math.sin(f * 0.12) * 0.9 + Math.sin(f * 0.31) * 0.35; // slow, readable swings (no jitter)
  const v = f < lock ? wild : interpolate(f, [lock, lock + 6], [wild, 3.8], cl);
  const ang = interpolate(v, [2, 5], [Math.PI * 0.675, -Math.PI * 0.675], cl);
  const pad = spring({ frame: f - lock, fps, config: { damping: 9, stiffness: 160 } });
  return (
    <group>
      <CameraRig keys={[[0, [-3.5, 3.0, 7.5], [0, 2.0, 0]], [lock, [-0.6, 2.4, 6.2], [0, 1.8, 0]], [lock + 30, [1.6, 3.6, 5.0], [0, 1.2, 0]], [dur, [3.2, 2.8, 5.2], [0, 1.5, 0]]]} />
      <group position={[0, 2.1, 0]}>
        <Holo geo={G.arc} color={H.cyan} rotation={[0, 0, -Math.PI * 0.175 + Math.PI * 0.5 - Math.PI * 0.5]} opacity={0.6} />
        {Array.from({ length: 7 }).map((_, i) => { const a = Math.PI * 0.675 - i * (Math.PI * 1.35 / 6) + Math.PI / 2;
          return <Holo key={i} geo={G.box} color={H.ice} position={[Math.cos(a) * 1.25, Math.sin(a) * 1.25, 0]} rotation={[0, 0, a]} scale={[0.22, 0.04, 0.04]} opacity={0.8} />; })}
        <group rotation={[0, 0, ang]}>
          <Holo geo={G.box} color={f >= lock ? H.amber : H.red} position={[0, 0.6, 0.05]} scale={[0.07, 1.2, 0.05]} opacity={0.85} />
        </group>
        <Holo geo={G.cyl} color={H.ice} rotation={[Math.PI / 2, 0, 0]} scale={[0.14, 0.12, 0.14]} opacity={0.9} />
      </group>
      <group position={[0, 0.9 + (1 - pad) * 1.6, 0.3]} scale={0.9 + 0.1 * pad} visible={f >= lock - 1}>
        <Holo geo={G.box} color={H.amber} scale={[0.7, 0.55, 0.3]} opacity={0.55} />
        <Holo geo={G.shackle} color={H.amber} position={[0, 0.27, 0]} opacity={0.9} />
      </group>
      {f >= lock && <mesh position={[0, 3.9, 0]}><planeGeometry args={[1.8, 0.5]} /><meshBasicMaterial map={labelTex("peg", "3.80 FIXED", H.amber)} transparent /></mesh>}
    </group>
  );
};

/** #9 Two shopping baskets: the 1998 price tag shoots up, the 2025 tag barely moves. Camera dollies left→right. */
export const Basket3D: React.FC<{ a1: number; dur: number }> = ({ a1, dur }) => {
  const f = useCurrentFrame();
  const basket = (x: number, pct: number, col: string, at: number, key: string) => {
    const k = lerp(f, at, at + 40, 0, 1);
    const price = Math.round(100 * (1 + (pct / 100) * k));
    return (
      <group position={[x, 0, 0]}>
        <Holo geo={G.basket} color={H.cyan} position={[0, 0.4, 0]} opacity={0.25} />
        {[[-0.3, 0.75, 0.1, H.amber], [0.25, 0.8, -0.1, H.green], [0, 0.85, 0.25, H.red], [0.1, 0.78, -0.3, H.violet]].map(([px, py, pz, c], i) =>
          <mesh key={i} geometry={G.sphere} position={[px as number, py as number, pz as number]} scale={1.4}><meshStandardMaterial color={c as string} emissive={c as string} emissiveIntensity={0.5} /></mesh>)}
        <Holo geo={G.box} color={col} position={[0, 1.2 + 1.4 * k * (pct / 58) / 2, 0]} scale={[0.04, 0.8 + 1.4 * k * (pct / 58), 0.04]} opacity={0.8} />
        <mesh position={[0, 1.7 + 1.4 * k * (pct / 58), 0]}><planeGeometry args={[1.2, 0.42]} /><meshBasicMaterial map={labelTex(`${key}${price}`, `${price}`, col)} transparent /></mesh>
        <mesh position={[0, 0.02, 1.1]} rotation={[-Math.PI / 2.4, 0, 0]}><planeGeometry args={[1.4, 0.45]} /><meshBasicMaterial map={labelTex(`${key}y`, key === "a" ? "1998 +58%" : "2025 +2.6%", col, "rgba(4,23,58,0.6)", 512, 160, 64)} transparent /></mesh>
      </group>
    );
  };
  return (
    <group>
      <CameraRig keys={[[0, [-3.4, 3.2, 7.6], [-1.0, 1.5, 0]], [a1 + 40, [-0.4, 3.4, 8.4], [0, 1.6, 0]], [dur, [2.8, 3.0, 7.6], [0.8, 1.5, 0]]]} />
      {basket(-1.5, 58, H.red, a1, "a")}
      {basket(1.5, 2.6, H.teal, a1 + 12, "b")}
    </group>
  );
};

/** #8 Coins pour into a vault; the door wheel spins shut; then dust settles. Camera circles, ends close on the door. */
export const Vault3D: React.FC<{ a1: number; a2: number; dur: number }> = ({ a1, a2, dur }) => {
  const f = useCurrentFrame();
  const fill = lerp(f, a1, a2, 0, 1, cl);
  const spin = lerp(f, a1, a2, 0, Math.PI * 1.6, cl);
  const dust = lerp(f, a2, dur, 0, 0.7, cl);
  return (
    <group>
      <CameraRig keys={[[0, orbit(-50, 9, 4.5, [0, 0, 0]), [0, 1.6, 0]], [a2, orbit(-15, 7.5, 3.0), [0, 1.6, 0]], [dur, [0.6, 2.2, 7.2], [0, 1.7, 0]]]} />
      <Holo geo={G.box} color={H.cyan} position={[0, 1.6, 0]} scale={[3, 3, 2.2]} opacity={0.1} />
      <mesh position={[0, 0.12 + 1.45 * fill, -0.2]} scale={[2.8, 2.9 * fill, 1.6]} geometry={G.box}><meshStandardMaterial color={H.amber} emissive={H.amber} emissiveIntensity={0.5} transparent opacity={0.45} /></mesh>
      {f < a2 && Array.from({ length: 14 }).map((_, i) => { const st = a1 + i * 5, t = ((f - st) % 26) / 26; if (f < st) return null;
        return <group key={i} position={[-1.1 + (i * 0.37) % 2.2, 5 - t * (5 - 0.3 - 2.9 * fill), -0.4 + (i % 3) * 0.3]} rotation={[t * 6, i, t * 3]}>
          <Holo geo={G.coin} color={H.amber} scale={[0.2, 0.8, 0.2]} opacity={0.8} edges={false} /></group>; })}
      <group position={[0, 1.6, 1.12]} rotation={[Math.PI / 2, 0, 0]}>
        <Holo geo={G.cyl} color={H.ice} scale={[1.1, 0.12, 1.1]} opacity={0.25} />
        <group rotation={[0, spin, 0]} position={[0, 0.12, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} geometry={G.torus}><meshStandardMaterial color={H.ice} emissive={H.ice} emissiveIntensity={0.6} /></mesh>
          {[0, 1, 2].map((k) => <Holo key={k} geo={G.box} color={H.ice} rotation={[0, (k * Math.PI) / 3, 0]} scale={[1.4, 0.06, 0.06]} opacity={0.9} />)}
        </group>
      </group>
      {Array.from({ length: 60 }).map((_, i) => <mesh key={i} geometry={G.drop} scale={0.35} position={[-1.5 + random(`x${i}`) * 3, 0.2 + random(`y${i}`) * 3, 1.2 + random(`z${i}`) * 0.4]}><meshBasicMaterial color="#d8cdb4" transparent opacity={dust} /></mesh>)}
    </group>
  );
};

/** #7 Hourglass of gold sand drains; the offshore rig's light dies. Camera makes a slow orbit. */
export const Hourglass3D: React.FC<{ a1: number; a2: number; dur: number }> = ({ a1, a2, dur }) => {
  const f = useCurrentFrame();
  const drain = lerp(f, a2, dur - 6, 0, 0.85, cl);
  const rigOn = lerp(f, a1 + 15, a1 + 30, 1, 0.08, cl);
  return (
    <group>
      <CameraRig keys={[[0, orbit(-60, 10.5, 3.8), [0, 1.8, 0]], [dur, orbit(50, 9.6, 3.0), [0.2, 1.8, 0]]]} />
      <group position={[0.6, 0, 0]}>
        <Holo geo={G.cone} color={H.cyan} position={[0, 2.7, 0]} rotation={[Math.PI, 0, 0]} opacity={0.12} />
        <Holo geo={G.cone} color={H.cyan} position={[0, 0.95, 0]} opacity={0.12} />
        {/* top sand: inverted cone shrinking toward the neck */}
        <mesh position={[0, 2.7 - 0.7 * drain * 0.0, 0]} rotation={[Math.PI, 0, 0]} scale={[1 - drain, 1 - drain, 1 - drain]} geometry={G.cone}><meshStandardMaterial color={H.amber} emissive={H.amber} emissiveIntensity={0.55} transparent opacity={0.6} /></mesh>
        <mesh position={[0, 0.25 + 0.7 * drain * 0.5, 0]} scale={[drain, drain, drain]} geometry={G.cone}><meshStandardMaterial color={H.amber} emissive={H.amber} emissiveIntensity={0.55} transparent opacity={0.6} /></mesh>
        {drain > 0 && drain < 0.85 && <Holo geo={G.cyl} color={H.amber} position={[0, 1.5, 0]} scale={[0.03, 1.2, 0.03]} opacity={0.9} edges={false} />}
        <Holo geo={G.cyl} color="#6b4a26" position={[0, 3.45, 0]} scale={[1.05, 0.1, 1.05]} opacity={0.7} />
        <Holo geo={G.cyl} color="#6b4a26" position={[0, 0.2, 0]} scale={[1.05, 0.1, 1.05]} opacity={0.7} />
      </group>
      <Derrick position={[-2.3, 0, -0.6]} on={rigOn} scale={0.9} />
    </group>
  );
};

/** #4 The kip note shrinks while a foreign-currency debt weight grows and presses its platform down. */
export const Kip3D: React.FC<{ a1: number; a2: number; dur: number }> = ({ a1, a2, dur }) => {
  const f = useCurrentFrame();
  const sh = lerp(f, a1, a1 + 60, 1, 0.5);
  const heavy = lerp(f, a2, a2 + 50, 1, 1.5);
  const kip = noteTex("kip", "₭ 50,000", "#f1e6ff", "#4b2c6e");
  return (
    <group>
      <CameraRig keys={[[0, [-4.0, 3.0, 7.4], [-1.2, 1.4, 0]], [a2, [-1.0, 3.2, 8.4], [0, 1.4, 0]], [dur, [2.6, 3.0, 8.0], [0.9, 1.3, 0]]]} />
      <group position={[-1.7, 1.5 + Math.sin(f * 0.06) * 0.08, 0]} rotation={[0, 0.35, 0]} scale={sh}>
        <mesh><planeGeometry args={[2.4, 1.2]} /><meshStandardMaterial map={kip} emissive="#8f7bff" emissiveIntensity={0.35} side={THREE.DoubleSide} /></mesh>
        <lineSegments geometry={KIP_EDGE}><lineBasicMaterial color="#c9b8ff" /></lineSegments>
      </group>
      <group position={[1.6, 0, 0]}>
        <Holo geo={G.box} color={H.blue} position={[0, 0.15 - 0.12 * (heavy - 1), 0]} scale={[1.8, 0.1, 1.4]} opacity={0.4} />
        <group position={[0, 0.2 - 0.12 * (heavy - 1) + 0.45 * heavy, 0]} scale={heavy}>
          <Holo geo={G.kettle} color={H.red} opacity={0.5} />
          <mesh position={[0, 0.62, 0]} geometry={G.torus} scale={0.35}><meshStandardMaterial color={H.red} emissive={H.red} emissiveIntensity={0.6} /></mesh>
          <mesh position={[0, 0, 0.62]}><planeGeometry args={[0.9, 0.3]} /><meshBasicMaterial map={labelTex("debtfx", "$ / ¥ DEBT", "#ffd7de", "rgba(60,8,20,0.6)")} transparent /></mesh>
        </group>
      </group>
    </group>
  );
};

const KIP_EDGE = new THREE.EdgesGeometry(new THREE.PlaneGeometry(2.4, 1.2));

/** #3 Calendar blocks in a row; a red DUE stamp hops forward, again and again. Camera tracks sideways with it. */
export const Calendar3D: React.FC<{ a1: number; dur: number }> = ({ a1, dur }) => {
  const f = useCurrentFrame();
  const years = ["2023", "2024", "2025", "2026", "2027", "2028"];
  const pushes = 4, every = Math.max(22, Math.floor((dur - a1 - 30) / pushes));
  const k = Math.min(pushes, Math.max(0, Math.floor((f - a1) / every)));
  const local = (f - a1) - k * every;
  const hop = k < pushes ? lerp(local, every - 14, every, 0, 1) : 0;
  const pos = Math.min(years.length - 1, k + hop);
  const X = (i: number) => -3.1 + i * 1.25;
  const sx = X(pos), sy = 1.75 + Math.sin(hop * Math.PI) * 0.9;
  return (
    <group>
      <CameraRig keys={[[0, [X(0) - 1.5, 3.0, 6.0], [X(1), 1.0, 0]], [dur, [X(4) + 0.8, 2.6, 5.6], [X(4), 1.0, 0]]]} />
      {years.map((y, i) => (
        <group key={y} position={[X(i), 0.75, 0]}>
          <Holo geo={G.box} color={H.cyan} scale={[1.0, 1.3, 0.3]} opacity={0.18} />
          <mesh position={[0, 0.5, 0.16]}><planeGeometry args={[0.95, 0.28]} /><meshBasicMaterial map={labelTex(`y${y}`, y, H.ice, "rgba(30,139,255,0.5)")} transparent /></mesh>
          {Array.from({ length: 9 }).map((_, j) => <mesh key={j} position={[-0.3 + (j % 3) * 0.3, 0.1 - Math.floor(j / 3) * 0.25, 0.16]}><planeGeometry args={[0.2, 0.17]} /><meshBasicMaterial color={H.dim} transparent opacity={0.25} /></mesh>)}
        </group>
      ))}
      <group position={[sx, sy, 0.3]} rotation={[0, 0, -0.25 + hop * Math.PI * 2]}>
        <Holo geo={G.box} color={H.red} scale={[0.9, 0.38, 0.12]} opacity={0.5} />
        <mesh position={[0, 0, 0.07]}><planeGeometry args={[0.85, 0.33]} /><meshBasicMaterial map={labelTex("due", "DUE", H.red)} transparent /></mesh>
      </group>
    </group>
  );
};

/** #2 Seesaw: big SINGAPORE block rises, smaller LAOS block sinks. Low dramatic orbit. */
export const Seesaw3D: React.FC<{ a1: number; a2: number; dur: number }> = ({ a1, a2, dur }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const tip = spring({ frame: f - a2, fps, config: { damping: 14, stiffness: 55 } });
  const ang = interpolate(tip, [0, 1], [0.16, -0.24]);
  return (
    <group>
      <CameraRig keys={[[0, orbit(-40, 9, 1.6), [0, 1.0, 0]], [a2, orbit(-15, 8, 1.2), [0, 1.0, 0]], [dur, orbit(20, 9.4, 2.8), [0, 1.0, 0]]]} />
      <Holo geo={G.tri} color={H.blue} position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.2, 1.2, 1.2]} opacity={0.35} />
      <group position={[0, 0.95, 0]} rotation={[0, 0, ang]}>
        <Holo geo={G.box} color={H.ice} scale={[5.6, 0.1, 0.7]} opacity={0.6} />
        <group position={[-2.1, 0.55, 0]}>
          <Holo geo={G.box} color={H.cyan} scale={[1.2, 1.0, 0.7]} opacity={0.35} />
          <mesh position={[0, 0, 0.36]}><planeGeometry args={[1.1, 0.5]} /><meshBasicMaterial map={labelTex("sg", "SG 170%", H.cyan)} transparent /></mesh>
        </group>
        <group position={[2.2, 0.4, 0]}>
          <Holo geo={G.box} color={H.amber} scale={[0.85, 0.7, 0.6]} opacity={0.45} />
          <mesh position={[0, 0, 0.31]}><planeGeometry args={[0.8, 0.32]} /><meshBasicMaterial map={labelTex("la", "LAOS 83%", H.amber)} transparent /></mesh>
        </group>
      </group>
    </group>
  );
};
