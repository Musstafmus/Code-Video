import { COLORS } from "./colors";

type Props = {
  x: number;
  y: number;
  /** 0 açık .. 1 kapalı */
  blink: number;
  lookX: number;
  lookY: number;
  side: "left" | "right";
};

const RX = 78;
const RY = 92;

export const Eye: React.FC<Props> = ({ x, y, blink, lookX, lookY, side }) => {
  const clipId = `eye-clip-${side}`;
  const closed = blink > 0.9;
  return (
    <g transform={`translate(${x} ${y})`}>
      {closed ? (
        <path
          d={`M${-RX * 0.8},0 Q0,${RY * 0.45} ${RX * 0.8},0`}
          fill="none"
          stroke={COLORS.outline}
          strokeWidth={10}
          strokeLinecap="round"
        />
      ) : (
        <g transform={`scale(1 ${1 - 0.92 * blink})`}>
          <defs>
            <clipPath id={clipId}>
              <ellipse rx={RX} ry={RY} />
            </clipPath>
          </defs>
          <ellipse rx={RX} ry={RY} fill={COLORS.eyeWhite} />
          <g clipPath={`url(#${clipId})`} transform={`translate(${lookX} ${lookY + 8})`}>
            <circle r={40} fill={COLORS.pupil} />
            <circle cx={13} cy={-15} r={13} fill="#FFFFFF" />
            <circle cx={-12} cy={14} r={5} fill="#FFFFFF" opacity={0.8} />
          </g>
          <ellipse rx={RX} ry={RY} fill="none" stroke={COLORS.outline} strokeWidth={10} />
        </g>
      )}
    </g>
  );
};
