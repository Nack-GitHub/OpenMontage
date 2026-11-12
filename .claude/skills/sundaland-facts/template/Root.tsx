import { Composition } from "remotion";
import { Scene, calculateMetadata, SceneProps } from "./Composition";
import { Thumb, ThumbProps } from "./Thumb";

export const Root: React.FC = () => (
  <>
    <Composition
      id="ThailandFacts"
      component={Scene}
      durationInFrames={30 * 30}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={ { /* fill from artifacts/props.json at render time */ } as SceneProps }
      calculateMetadata={calculateMetadata}
    />
    <Composition id="Thumb" component={Thumb} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{ variant: "narrow" } as ThumbProps} />
  </>
);
