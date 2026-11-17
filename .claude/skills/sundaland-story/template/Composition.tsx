import React from "react";
import { AbsoluteFill, CalculateMetadataFunction, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { C, FPS, clamp, Sting, Watermark } from "./parts";
import { GlobeOutro } from "./fx";
import { FootageScene, PhotoScene, MainTitle, MapScene, EndCard } from "./scenes";
import { KBColdOpen, DoodleScene, KBHud, QuoteCard } from "./kb";
import { TOTAL, TIMELINE, NARRATION, MUSIC, SFX, STING, ENDCARD } from "./timeline";

// ── The Sundaland · Economy Geography — "The Pacific War Started Here, Not Pearl Harbor" (atelier) ──

export interface SceneProps { durationSeconds?: number }

const renderScene = (x: any) => {
  const d = x.dur, p = x.p;
  switch (x.kind) {
    case "coldopen": return <KBColdOpen dur={d} p={p} />;
    case "sting": return <Sting dur={d} />;
    case "footage": return <FootageScene dur={d} p={p} />;
    case "photo": return <PhotoScene dur={d} p={p} />;
    case "map": return <MapScene dur={d} p={p} />;
    case "maintitle": return <MainTitle dur={d} p={p} />;
    case "doodle": return <DoodleScene dur={d} p={p} />;
    case "hud": return <KBHud dur={d} p={p} />;
    case "quote": return <QuoteCard dur={d} p={p} />;
    case "globeout": return <GlobeOutro dur={d} pillAt={p?.pillAt ?? d - 90} />;
    case "endcard": return <EndCard dur={d} />;
    default: return null;
  }
};

const MusicBed: React.FC<{ m: any; i: number }> = ({ m, i }) => {
  const len = m.to - m.from + FPS; // 1 s overlap for crossfade
  return (
    <Sequence from={m.from} durationInFrames={len}>
      <Audio src={staticFile(m.src)} loop volume={(fr) => {
        const g = fr + m.from;
        const inSting = g >= STING.from - 6 && g < STING.from + STING.dur + 6;
        const inEnd = g >= ENDCARD.from - 15;
        const base = (inSting ? 0.4 : inEnd ? 0.32 : 0.13) * (m.gain ?? 1);
        return base * Math.min(interpolate(fr, [0, FPS], [0, 1], clamp), interpolate(fr, [len - FPS, len], [1, 0], clamp),
          i === MUSIC.length - 1 ? interpolate(g, [TOTAL - 2 * FPS, TOTAL], [1, 0], clamp) : 1);
      }} />
    </Sequence>
  );
};

export const Scene: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  const hideMark = (f >= STING.from - 4 && f < STING.from + STING.dur + 4) || f >= ENDCARD.from - 4;
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {TIMELINE.map((x, i) => (
        <Sequence key={i} from={x.from} durationInFrames={x.dur} premountFor={45}>{renderScene(x)}</Sequence>
      ))}
      {!hideMark && <Watermark />}
      {NARRATION.map((n, i) => <Sequence key={`n${i}`} from={n.from}><Audio src={staticFile(n.src)} /></Sequence>)}
      {MUSIC.map((m, i) => <MusicBed key={`m${i}`} m={m} i={i} />)}
      {SFX.map((x, i) => <Sequence key={`s${i}`} from={x.from} durationInFrames={x.n === "bell" ? 54 : 24}><Audio src={staticFile(`sfx/${x.n}.wav`)} volume={x.v} /></Sequence>)}
    </AbsoluteFill>
  );
};

export const calculateMetadata: CalculateMetadataFunction<SceneProps> = async () => ({
  durationInFrames: TOTAL, fps: FPS, width: 1920, height: 1080,
});
