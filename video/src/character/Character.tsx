import { COLORS } from "./colors";
import { Eye } from "./Eye";
import { Mouth } from "./Mouth";

export type CharacterPose = {
  /** saniye cinsinden zaman: nefes ve salınım döngüleri için */
  time: number;
  open: number;
  round: number;
  teeth: number;
  energy: number;
  /** genel vurgu (kaş, baş) */
  accent: number;
  accentLeftArm: number;
  accentRightArm: number;
  blink: number;
  lookX: number;
  lookY: number;
  /** 0..1+ giriş animasyonu ölçeği */
  entrance: number;
};

const BODY =
  "M0,-330 C190,-330 310,-170 310,30 C310,210 180,300 0,300 C-180,300 -310,210 -310,30 C-310,-170 -190,-330 0,-330Z";
const OUTLINE = { stroke: COLORS.outline, strokeWidth: 10, strokeLinejoin: "round" as const };

const Arm: React.FC<{ side: -1 | 1; raise: number; time: number }> = ({ side, raise, time }) => {
  const sway = Math.sin(time * 1.3 + (side > 0 ? 1.2 : 0)) * 4;
  const angle = side * (25 - sway - raise * 55);
  return (
    <g transform={`translate(${side * 285} 70) rotate(${angle})`}>
      <ellipse cx={side * 45} cy={0} rx={62} ry={32} fill={COLORS.body} {...OUTLINE} />
    </g>
  );
};

const Leaf: React.FC<{ time: number; accent: number }> = ({ time, accent }) => {
  const angle = Math.sin(time * 1.7) * 5 + Math.sin(time * 0.6) * 3 - accent * 9;
  return (
    <g transform={`translate(0 -322) rotate(${angle})`}>
      <path d="M0,0 Q-8,-50 6,-95" fill="none" stroke={COLORS.leafShade} strokeWidth={12} strokeLinecap="round" />
      <path d="M6,-95 C-30,-95 -85,-120 -100,-170 C-45,-175 -5,-140 6,-95Z" fill={COLORS.leaf} {...OUTLINE} strokeWidth={8} />
      <path d="M6,-95 C40,-100 100,-140 112,-200 C55,-200 12,-160 6,-95Z" fill={COLORS.leaf} {...OUTLINE} strokeWidth={8} />
      <path d="M6,-95 C30,-120 60,-150 85,-178" fill="none" stroke={COLORS.leafShade} strokeWidth={5} strokeLinecap="round" />
    </g>
  );
};

/**
 * Karakter: (0,0) noktası gövdenin ortası, ayaklar y≈310'da.
 * Tüm hareket CharacterPose'dan gelir; bileşenin kendi durumu yoktur.
 */
export const Character: React.FC<{ pose: CharacterPose }> = ({ pose }) => {
  const { time, energy, accent } = pose;
  const breath = Math.sin((time * Math.PI * 2) / 3.2);
  // Vurguda hafif aşağı ezilme (squash), konuşurken hafif yukarı esneme (stretch).
  const scaleY = 1 + 0.012 * breath + 0.02 * energy - 0.035 * accent;
  const scaleX = 1 - 0.008 * breath - 0.01 * energy + 0.03 * accent;
  const tilt = Math.sin(time * 0.9) * 2.2 + Math.sin(time * 0.37) * 1.4 + energy * 1.5;
  const lift = -energy * 10 + accent * 8;
  const browLift = accent * 20 + energy * 6;

  return (
    <g transform={`scale(${pose.entrance})`}>
      <ellipse cx={0} cy={318} rx={280 - energy * 10} ry={34} fill="#000000" opacity={0.12} />
      <ellipse cx={-120} cy={302} rx={85} ry={40} fill={COLORS.foot} {...OUTLINE} />
      <ellipse cx={120} cy={302} rx={85} ry={40} fill={COLORS.foot} {...OUTLINE} />

      {/* Gövde alt kenardan ölçeklenir ki ayaklar yerde kalsın. */}
      <g transform={`translate(0 ${290 + lift}) rotate(${tilt}) scale(${scaleX} ${scaleY}) translate(0 -290)`}>
        <Arm side={-1} raise={pose.accentLeftArm} time={time} />
        <Arm side={1} raise={pose.accentRightArm} time={time} />
        <Leaf time={time} accent={accent} />

        <defs>
          <clipPath id="body-clip">
            <path d={BODY} />
          </clipPath>
        </defs>
        <path d={BODY} fill={COLORS.body} />
        <g clipPath="url(#body-clip)">
          <ellipse cx={90} cy={-10} rx={330} ry={380} fill={COLORS.bodyShade} opacity={0.35} transform="translate(260 0)" />
          <ellipse cx={0} cy={215} rx={175} ry={105} fill={COLORS.belly} />
        </g>
        <path d={BODY} fill="none" {...OUTLINE} />

        <ellipse cx={-200} cy={45} rx={50} ry={30} fill={COLORS.cheek} opacity={0.5} />
        <ellipse cx={200} cy={45} rx={50} ry={30} fill={COLORS.cheek} opacity={0.5} />

        <g transform={`translate(0 ${-browLift})`}>
          <path d="M-165,-198 Q-118,-222 -70,-205" fill="none" stroke={COLORS.outline} strokeWidth={16} strokeLinecap="round" />
          <path d="M70,-205 Q118,-222 165,-198" fill="none" stroke={COLORS.outline} strokeWidth={16} strokeLinecap="round" />
        </g>
        <Eye side="left" x={-115} y={-80} blink={pose.blink} lookX={pose.lookX} lookY={pose.lookY} />
        <Eye side="right" x={115} y={-80} blink={pose.blink} lookX={pose.lookX} lookY={pose.lookY} />

        <g transform="translate(0 78) scale(1.25)">
          <Mouth open={pose.open} round={pose.round} teeth={pose.teeth} smile={14} />
        </g>
      </g>
    </g>
  );
};
