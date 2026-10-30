import { Easing, interpolate } from "remotion";
import { NEWS } from "./theme";
import { ResolvedScene } from "./timeline";
import { VISUALS } from "./visuals";
import { Backdrop, H, Label, W } from "./visuals/kit";

const TRANSITION = 8;
const MISSING_CUE = -9999;

const slide = (t: number) =>
  interpolate(t, [0, TRANSITION], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

const SceneView: React.FC<{ scene: ResolvedScene; frame: number; fps: number; id: string }> = ({ scene, frame, fps, id }) => {
  const Visual = VISUALS[scene.visual];
  if (!Visual) return null;
  const cue = (name: string) => (name in scene.cues ? frame - scene.cues[name] : MISSING_CUE);
  // Her sahnenin kendi tanım (defs) kimlikleri çakışmasın diye ayrı bir svg içinde.
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} id={id} overflow="hidden">
      <Visual t={frame - scene.start} cue={cue} fps={fps} />
    </svg>
  );
};

const Idle: React.FC<{ program: string }> = ({ program }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Backdrop />
    <Label x={W / 2} y={H / 2 + 20} size={64} weight={900} letterSpacing={4}>
      {program}
    </Label>
  </svg>
);

/** Stüdyodaki büyük ekran: sahneler sağdan kayarak gelir. */
export const Screen: React.FC<{
  scenes: ResolvedScene[];
  frame: number;
  fps: number;
  program: string;
  x: number;
  y: number;
  width: number;
  height: number;
}> = ({ scenes, frame, fps, program, x, y, width, height }) => {
  const index = scenes.findLastIndex((s) => s.start <= frame);
  const current = scenes[index];
  const previous = index > 0 ? scenes[index - 1] : undefined;
  const k = current ? slide(frame - current.start) : 1;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        borderRadius: 24,
        overflow: "hidden",
        border: "6px solid rgba(255,255,255,0.9)",
        boxShadow: `0 0 50px rgba(46,134,222,0.55), 0 20px 50px rgba(0,0,0,0.5)`,
        background: NEWS.navy,
      }}
    >
      <div style={{ position: "absolute", left: (width - W) / 2, top: (height - H) / 2, width: W, height: H }}>
        {k < 1 && (
          <div style={{ position: "absolute", transform: `translateX(${-k * W}px)` }}>
            {previous ? <SceneView scene={previous} frame={frame} fps={fps} id="prev" /> : <Idle program={program} />}
          </div>
        )}
        {current ? (
          <div style={{ position: "absolute", transform: `translateX(${(1 - k) * W}px)` }}>
            <SceneView scene={current} frame={frame} fps={fps} id="current" />
          </div>
        ) : (
          <Idle program={program} />
        )}
      </div>
    </div>
  );
};
