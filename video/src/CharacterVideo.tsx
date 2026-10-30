import { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Character, CharacterPose } from "./character/Character";
import { accentEnvelope, blinkAmount, blinkSchedule, isSpeaking, sample } from "./motion";
import { VideoProps } from "./types";

/** Ses başlamadan önceki ve bittikten sonraki boşluk (kare). */
export const LEAD_IN = 12;
export const TAIL = 24;

const BUBBLES = Array.from({ length: 9 }, (_, i) => ({
  x: (i * 137) % 1080,
  r: 18 + ((i * 53) % 46),
  speed: 0.25 + ((i * 29) % 10) / 20,
  phase: i * 1.7,
}));

const Background: React.FC<{ time: number }> = ({ time }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #BFE6F2 0%, #E4F5F4 55%, #F4FBF6 100%)" }} />
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      {BUBBLES.map((b, i) => {
        const y = 1920 - ((time * b.speed * 60 + i * 260) % 2100);
        return (
          <circle key={i} cx={b.x + Math.sin(time * 0.8 + b.phase) * 25} cy={y} r={b.r} fill="#FFFFFF" opacity={0.35} />
        );
      })}
      <ellipse cx={540} cy={1980} rx={900} ry={480} fill="#BCE3CF" />
      <ellipse cx={540} cy={2010} rx={820} ry={430} fill="#A9DBC1" />
    </svg>
  </AbsoluteFill>
);

const Label: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      position: "absolute",
      top: 90,
      left: 70,
      padding: "14px 30px",
      borderRadius: 999,
      background: "rgba(45, 42, 62, 0.85)",
      color: "#FFFFFF",
      fontFamily: "sans-serif",
      fontSize: 38,
      fontWeight: 700,
      letterSpacing: 2,
    }}
  >
    {text}
  </div>
);

export const CharacterVideo: React.FC<VideoProps> = ({ deneme, audioFile, label, analysis }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const blinks = useMemo(
    () => (analysis ? blinkSchedule(analysis, durationInFrames, LEAD_IN) : []),
    [analysis, durationInFrames],
  );
  if (!analysis) return null;

  const f = frame - LEAD_IN;
  const time = frame / fps;
  const speaking = isSpeaking(analysis, f);
  // Konuşurken kameraya bakar; duraklamalarda gözleri hafifçe gezinir.
  const wander = speaking ? 0.25 : 1;

  const pose: CharacterPose = {
    time,
    open: sample(analysis.frames.open, f),
    round: sample(analysis.frames.round, f),
    teeth: sample(analysis.frames.teeth, f),
    energy: sample(analysis.frames.energy, f),
    accent: accentEnvelope(analysis.accents, f),
    accentLeftArm: accentEnvelope(analysis.accents, f, (i) => i % 4 === 1) * 0.8,
    accentRightArm: accentEnvelope(analysis.accents, f, (i) => i % 4 === 3) * 0.8,
    blink: blinkAmount(blinks, frame),
    lookX: (Math.sin(time * 0.7) * 14 + Math.sin(time * 1.9) * 5) * wander,
    lookY: Math.sin(time * 0.5 + 1) * 6 * wander,
    entrance: spring({ frame, fps, config: { damping: 11, mass: 0.7 } }),
  };

  return (
    <AbsoluteFill>
      <Background time={time} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <g transform="translate(540 1170) scale(1.15)">
          <Character pose={pose} />
        </g>
      </svg>
      <Label text={label} />
      <Sequence from={LEAD_IN}>
        <Audio src={staticFile(`denemeler/${deneme}/${audioFile}`)} />
      </Sequence>
    </AbsoluteFill>
  );
};
