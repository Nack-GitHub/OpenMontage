import React from "react";
import { AbsoluteFill, CalculateMetadataFunction, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { C, FPS, clamp, ColdOpen, Sting, FactTitle, DriveShare, FloodWipe, Watermark } from "./parts";
import { SinkingCity, PilingSection, RubberViz, DurianRace, GlobeOutro } from "./fx";
import { FootageScene, PhotoScene, TitleScene, MainTitle, MapScene, BarsScene, KineticName, GaugeScene, SectionScene, GlobeOutScene, EndCard } from "./scenes";
import { TOTAL, TIMELINE, NARRATION, MUSIC, SFX, STING, ENDCARD } from "./timeline";

// ── The Sundaland · Economy Geography — "20 Facts About Thailand That Sound Fake" (atelier; see art-direction.md) ──

export interface SceneProps { durationSeconds?: number }

const renderScene = (x: any) => {
  const d = x.dur;
  switch (x.kind) {
    case "coldopen": return <ColdOpen dur={d} />;
    case "sting": return <Sting dur={d} />;
    case "title": return <TitleScene dur={d} p={x.p} />;
    case "footage": return <FootageScene dur={d} p={x.p} />;
    case "photo": return <PhotoScene dur={d} p={x.p} />;
    case "map": return <MapScene dur={d} p={x.p} />;
    case "maintitle": return <MainTitle dur={d} p={x.p} />;
    case "bars": return <BarsScene dur={d} p={x.p} />;
    case "kinetic": return <KineticName dur={d} p={x.p} />;
    case "gauge": return <GaugeScene dur={d} p={x.p} />;
    case "section": return <SectionScene dur={d} p={x.p} />;
    case "globeout": return <GlobeOutro dur={d} pillAt={x.p?.pillAt ?? d - 90} />;
    case "sinking": return <SinkingCity dur={d} />;
    case "piling": return <PilingSection dur={d} />;
    case "rubber": return <RubberViz dur={d} p={x.p} />;
    case "durianrace": return <DurianRace dur={d} />;
    case "endcard": return <EndCard dur={d} />;
    case "f09_title": return <FactTitle dur={d} n={9} act="THE MONEY" title="The flood that hit your computer"
      photo="sample/ayutthaya_ground.jpg" credit="Photo: Suriya Thonawanik, Ayutthaya 2011 · FAL 1.3 · Wikimedia Commons" />;
    case "f09_share": return <DriveShare dur={d} />;
    case "f09_wipe": return <FloodWipe dur={d} />;
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
        const base = inSting ? 0.4 : inEnd ? 0.32 : 0.13;
        return base * Math.min(interpolate(fr, [0, FPS], [i === 0 ? 0 : 0, 1], clamp), interpolate(fr, [len - FPS, len], [1, 0], clamp), i === MUSIC.length - 1 ? interpolate(g, [TOTAL - 2 * FPS, TOTAL], [1, 0], clamp) : 1);
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
