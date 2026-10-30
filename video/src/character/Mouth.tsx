import { lerp } from "../motion";
import { COLORS } from "./colors";

type Props = {
  /** 0 kapalı .. 1 tam açık */
  open: number;
  /** 0 geniş .. 1 yuvarlak */
  round: number;
  /** 0..1 üst dişlerin görünürlüğü */
  teeth: number;
  /** köşelerin yukarı kalkma miktarı (gülümseme) */
  smile: number;
};

const POINTS = 64;
const TOP_SHARE = 0.22;

/**
 * Parametrik ağız: hazır çizimler yerine açıklık / yuvarlaklık / diş
 * parametrelerinden her karede yeniden hesaplanır, böylece ağız şekilleri
 * arasında geçişler kendiliğinden yumuşak olur.
 */
export const Mouth: React.FC<Props> = ({ open, round, teeth, smile }) => {
  const width = lerp(175, 95, round) * (0.9 + 0.2 * open) + teeth * 20;
  const height = 7 + open * 120;
  // Geniş ağızda köşeler sivri, yuvarlak ağızda elips.
  const cornerSharpness = lerp(1.7, 1.0, round);
  const lift = smile * (1 - round) * (1 - 0.5 * open);

  const points: string[] = [];
  for (let i = 0; i < POINTS; i++) {
    const a = (i / POINTS) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const x = (width / 2) * c;
    const reach = s >= 0 ? height * (1 - TOP_SHARE) : height * TOP_SHARE;
    const y = Math.sign(s) * reach * Math.pow(Math.abs(s), cornerSharpness) - lift * c * c;
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const d = `M${points.join("L")}Z`;
  const bottom = height * (1 - TOP_SHARE);
  const top = -height * TOP_SHARE;
  const teethHeight = (10 + teeth * 14) * Math.min(1, open * 3 + teeth);

  return (
    <g>
      <defs>
        <clipPath id="mouth-clip">
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill={COLORS.mouth} />
      <g clipPath="url(#mouth-clip)">
        <ellipse cx={0} cy={bottom * 0.95} rx={width * 0.32} ry={Math.max(4, bottom * 0.45)} fill={COLORS.tongue} />
        <rect x={-width * 0.32} y={top - 12} width={width * 0.64} height={teethHeight + 12} rx={8} fill="#FFFFFF" />
      </g>
      <path d={d} fill="none" stroke={COLORS.outline} strokeWidth={9} strokeLinejoin="round" />
    </g>
  );
};
