import "./fonts";
import { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { accentEnvelope, blinkAmount, blinkSchedule, isSpeaking, sample } from "../motion";
import { NewsProps } from "../types";
import { Anchor, AnchorPose } from "./Anchor";
import { LowerThird, Ticker, TopBar } from "./Overlays";
import { Screen } from "./Screen";
import { NEWS } from "./theme";
import { resolveScenes, resolveSections } from "./timeline";

export const NEWS_LEAD_IN = 12;
export const NEWS_TAIL = 36;

// Dikey (1080x1920) düzen
const SCREEN = { x: 40, y: 112, width: 1000, height: 624 };
const ANCHOR_SCALE = 0.56;
const ANCHOR_TOP = 784; // saçın üst kenarı
const DESK_TOP = 1420;
const LOWER_THIRD_TOP = 1474;
const TICKER_TOP = 1660;

const Studio: React.FC<{ time: number }> = ({ time }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #071427 0%, ${NEWS.navy} 40%, #10305A 75%, #071427 100%)` }} />
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <defs>
        <radialGradient id="studio-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#2E86DE" stopOpacity={0.55} />
          <stop offset="1" stopColor="#2E86DE" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={540} cy={1150} rx={560} ry={420} fill="url(#studio-glow)" />
      {Array.from({ length: 9 }, (_, i) => {
        const x = 40 + i * 125;
        const height = 120 + ((i * 73) % 160);
        return <rect key={i} x={x} y={1420 - height} width={90} height={height} fill="#0D2A4F" opacity={0.9} />;
      })}
      {Array.from({ length: 30 }, (_, i) => {
        const x = 50 + ((i * 97) % 980);
        const y = 1280 + ((i * 53) % 130);
        return <rect key={i} x={x} y={y} width={10} height={14} fill="#FFD27A" opacity={0.25 + 0.25 * Math.sin(time * 1.5 + i)} />;
      })}
      {[0, 1].map((i) => (
        <rect key={i} x={i ? 1010 : 20} y={780} width={50} height={620} rx={10} fill="#1B4C86" opacity={0.6 + 0.2 * Math.sin(time * 2 + i * 2)} />
      ))}
    </svg>
  </AbsoluteFill>
);

const Desk: React.FC<{ program: string }> = ({ program }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>
    <defs>
      <linearGradient id="desk-front" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#163A6B" />
        <stop offset="1" stopColor="#0A1C36" />
      </linearGradient>
    </defs>
    <path d={`M60,${DESK_TOP} L1020,${DESK_TOP} L1080,${DESK_TOP + 46} L0,${DESK_TOP + 46}Z`} fill="#D9E2EE" />
    <rect x={0} y={DESK_TOP + 46} width={1080} height={1920 - DESK_TOP - 46} fill="url(#desk-front)" />
    <rect x={0} y={DESK_TOP + 46} width={1080} height={8} fill={NEWS.red} />
    <rect x={0} y={1860} width={1080} height={6} fill={NEWS.red} opacity={0.6} />
    <text x={540} y={1812} textAnchor="middle" fontFamily={NEWS.font} fontWeight={900} fontSize={44} letterSpacing={8} fill="#FFFFFF" opacity={0.18}>
      {program}
    </text>
  </svg>
);

export const NewsVideo: React.FC<NewsProps> = ({ deneme, audioFile, analysis, scenes: config, rig, imageSize }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const scenes = useMemo(
    () => (analysis && config ? resolveScenes(analysis.words, config, durationInFrames) : []),
    [analysis, config, durationInFrames],
  );
  const sections = useMemo(() => (analysis && config ? resolveSections(analysis.words, config) : []), [analysis, config]);
  const blinks = useMemo(
    () => (analysis ? blinkSchedule(analysis, durationInFrames, NEWS_LEAD_IN) : []),
    [analysis, durationInFrames],
  );
  if (!analysis || !config || !rig || !imageSize) return null;

  const f = frame - NEWS_LEAD_IN;
  const time = frame / fps;
  const wander = isSpeaking(analysis, f) ? 0.3 : 1;
  const pose: AnchorPose = {
    time,
    open: sample(analysis.frames.open, f),
    round: sample(analysis.frames.round, f),
    energy: sample(analysis.frames.energy, f),
    accent: accentEnvelope(analysis.accents, f),
    blink: blinkAmount(blinks, frame),
    lookX: (Math.sin(time * 0.6) * 3 + Math.sin(time * 1.7) * 1) * wander,
    lookY: Math.sin(time * 0.45 + 1) * 1.5 * wander,
  };
  const anchorX = 540 - (imageSize[0] / 2) * ANCHOR_SCALE;
  const anchorY = ANCHOR_TOP - rig.kirpma.ust * ANCHOR_SCALE;

  return (
    <AbsoluteFill style={{ background: NEWS.navy }}>
      <Studio time={time} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <g transform={`translate(${anchorX} ${anchorY}) scale(${ANCHOR_SCALE})`}>
          <Anchor deneme={deneme} rig={rig} size={imageSize} pose={pose} />
        </g>
      </svg>
      <Desk program={config.program} />
      <Screen scenes={scenes} frame={f} fps={fps} program={config.program} {...SCREEN} />
      <TopBar frame={frame} program={config.program} date={config.tarih} label={config.etiket} />
      <LowerThird frame={f} words={analysis.words} lines={analysis.lines} sections={sections} top={LOWER_THIRD_TOP} />
      <Ticker frame={frame} items={config.kayanYazi} top={TICKER_TOP} />
      <Sequence from={NEWS_LEAD_IN}>
        <Audio src={staticFile(`denemeler/${deneme}/${audioFile}`)} />
      </Sequence>
    </AbsoluteFill>
  );
};
