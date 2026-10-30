import { Easing, interpolate, spring } from "remotion";
import { NEWS } from "../theme";

/** Ekran çiziminin koordinat alanı */
export const W = 1000;
export const H = 650;

export type VisualProps = {
  /** sahne başından beri geçen kare */
  t: number;
  /** ipucu kelimesinden beri geçen kare; henüz gelmediyse negatif, tanımsızsa -Infinity */
  cue: (name: string) => number;
  fps: number;
};

export const ease = (t: number, start: number, duration: number) =>
  interpolate(t, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

/** Yaylı büyüme: 0'dan 1'e hafif taşmayla. */
export const pop = (t: number, fps: number, delay = 0) =>
  t < delay ? 0 : spring({ frame: t - delay, fps, config: { damping: 10, mass: 0.6 } });

export const Label: React.FC<{
  x: number;
  y: number;
  size: number;
  children: React.ReactNode;
  weight?: number;
  fill?: string;
  anchor?: "start" | "middle" | "end";
  opacity?: number;
  transform?: string;
  letterSpacing?: number;
}> = ({ x, y, size, children, weight = 800, fill = NEWS.white, anchor = "middle", opacity = 1, transform, letterSpacing = 1 }) => (
  <text
    x={x}
    y={y}
    fontSize={size}
    fontWeight={weight}
    fill={fill}
    textAnchor={anchor}
    fontFamily={NEWS.font}
    opacity={opacity}
    transform={transform}
    letterSpacing={letterSpacing}
    style={{ paintOrder: "stroke" }}
  >
    {children}
  </text>
);

/** Bir noktada merkezlenmiş ölçekleme. */
export const scaleAt = (x: number, y: number, s: number) => `translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`;

/** Sahne zemini: koyu lacivert degrade ve hafif ızgara. */
export const Backdrop: React.FC<{ from?: string; to?: string; grid?: boolean }> = ({
  from = NEWS.navyLight,
  to = NEWS.navy,
  grid = true,
}) => (
  <>
    <defs>
      <linearGradient id="backdrop" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={from} />
        <stop offset="1" stopColor={to} />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#backdrop)" />
    {grid &&
      Array.from({ length: 13 }, (_, i) => (
        <line key={i} x1={i * 80} y1={0} x2={i * 80} y2={H} stroke="#FFFFFF" opacity={0.05} strokeWidth={2} />
      ))}
  </>
);

/** Kırmızı bant üzerinde başlık (sahnelerin üst başlığı). */
export const Banner: React.FC<{ t: number; text: string; y?: number }> = ({ t, text, y = 70 }) => {
  const k = ease(t, 0, 10);
  const width = 40 + text.length * 34;
  return (
    <g opacity={k} transform={`translate(${(1 - k) * -60} 0)`}>
      <rect x={W / 2 - width / 2} y={y - 48} width={width} height={66} rx={10} fill={NEWS.red} />
      <Label x={W / 2} y={y} size={42}>
        {text}
      </Label>
    </g>
  );
};

/** Deterministik sözde rastgele sayı (parçacıklar için). */
export const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
