import { CalculateMetadataFunction, Composition, staticFile } from "remotion";
import { CharacterVideo, LEAD_IN, TAIL } from "./CharacterVideo";
import { Analysis, VideoProps } from "./types";

const FPS = 30;

const calculateMetadata: CalculateMetadataFunction<VideoProps> = async ({ props }) => {
  const res = await fetch(staticFile(`denemeler/${props.deneme}/analiz.json`));
  const analysis: Analysis = await res.json();
  return {
    durationInFrames: LEAD_IN + analysis.durationInFrames + TAIL,
    props: { ...props, analysis },
  };
};

export const Root: React.FC = () => (
  <Composition
    id="KarakterVideo"
    component={CharacterVideo}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={FPS * 10}
    defaultProps={{ deneme: "deneme-1", audioFile: "ses.mp3", label: "Deneme 1" }}
    calculateMetadata={calculateMetadata}
  />
);
