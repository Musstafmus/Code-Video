import { CalculateMetadataFunction, Composition, staticFile } from "remotion";
import { CharacterVideo, LEAD_IN, TAIL } from "./CharacterVideo";
import { NEWS_LEAD_IN, NEWS_TAIL, NewsVideo } from "./news/NewsVideo";
import { AlignedAnalysis, Analysis, CharacterRig, NewsProps, SceneConfig, VideoProps } from "./types";

const FPS = 30;

const loadJson = async <T,>(deneme: string, file: string): Promise<T> => {
  const res = await fetch(staticFile(`denemeler/${deneme}/${file}`));
  return res.json();
};

const loadImageSize = (src: string) =>
  new Promise<[number, number]>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve([img.naturalWidth, img.naturalHeight]);
    img.onerror = reject;
    img.src = src;
  });

const calculateMetadata: CalculateMetadataFunction<VideoProps> = async ({ props }) => {
  const analysis = await loadJson<Analysis>(props.deneme, "analiz.json");
  return {
    durationInFrames: LEAD_IN + analysis.durationInFrames + TAIL,
    props: { ...props, analysis },
  };
};

const calculateNewsMetadata: CalculateMetadataFunction<NewsProps> = async ({ props }) => {
  const [analysis, scenes, rig] = await Promise.all([
    loadJson<AlignedAnalysis>(props.deneme, "analiz.json"),
    loadJson<SceneConfig>(props.deneme, "sahneler.json"),
    loadJson<CharacterRig>(props.deneme, "karakter.json"),
  ]);
  const imageSize = await loadImageSize(staticFile(`denemeler/${props.deneme}/karakter/govde.png`));
  return {
    durationInFrames: NEWS_LEAD_IN + analysis.durationInFrames + NEWS_TAIL,
    props: { ...props, analysis, scenes, rig, imageSize },
  };
};

export const Root: React.FC = () => (
  <>
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
    <Composition
      id="HaberVideo"
      component={NewsVideo}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={FPS * 10}
      defaultProps={{ deneme: "deneme-2", audioFile: "ses.mp3" }}
      calculateMetadata={calculateNewsMetadata}
    />
  </>
);
