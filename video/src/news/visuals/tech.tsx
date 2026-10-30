import { NEWS } from "../theme";
import { Backdrop, ease, Label, pop, rand, scaleAt, VisualProps, W } from "./kit";

const CircuitLines: React.FC<{ t: number }> = ({ t }) => (
  <>
    {Array.from({ length: 10 }, (_, i) => {
      const y = 60 + i * 60;
      const bend = 200 + rand(i) * 600;
      return (
        <g key={i} opacity={0.35}>
          <path
            d={`M0,${y} L${bend},${y} L${bend + 40},${y + 30} L${W},${y + 30}`}
            fill="none"
            stroke={NEWS.sky}
            strokeWidth={3}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - ease(t, i * 1.5, 18)}
          />
          <circle cx={bend + 40} cy={y + 30} r={6} fill={NEWS.sky} opacity={ease(t, 10 + i * 1.5, 6)} />
        </g>
      );
    })}
  </>
);

export const Teknoloji: React.FC<VisualProps> = ({ t, cue, fps }) => (
  <g>
    <Backdrop />
    <CircuitLines t={t} />
    <g transform={scaleAt(500, 230, pop(t, fps))}>
      <Label x={500} y={260} size={96} weight={900} letterSpacing={6}>
        TEKNOLOJİ
      </Label>
    </g>
    {cue("alphabet") >= 0 && (
      <g transform={scaleAt(500, 440, pop(cue("alphabet"), fps))}>
        <rect x={250} y={385} width={500} height={110} rx={20} fill="#FFFFFF" />
        <Label x={500} y={462} size={70} weight={900} fill={NEWS.navy} letterSpacing={4}>
          ALPHABET
        </Label>
      </g>
    )}
  </g>
);

const Chip: React.FC<{ x: number; y: number; glow: number }> = ({ x, y, glow }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: 6 }, (_, i) => (
      <g key={i}>
        <rect x={-75 + i * 28} y={-120} width={10} height={30} fill="#9FB3C8" />
        <rect x={-75 + i * 28} y={90} width={10} height={30} fill="#9FB3C8" />
        <rect x={-120} y={-75 + i * 28} width={30} height={10} fill="#9FB3C8" />
        <rect x={90} y={-75 + i * 28} width={30} height={10} fill="#9FB3C8" />
      </g>
    ))}
    <rect x={-95} y={-95} width={190} height={190} rx={18} fill="#22344F" stroke={NEWS.sky} strokeWidth={6} />
    <rect x={-95} y={-95} width={190} height={190} rx={18} fill={NEWS.sky} opacity={0.25 * glow} />
    <Label x={0} y={24} size={72} weight={900}>
      YZ
    </Label>
  </g>
);

const Bill: React.FC<{ x: number; y: number; r: number; s: number }> = ({ x, y, r, s }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-45} y={-24} width={90} height={48} rx={6} fill="#3FAF6A" stroke="#1E7A44" strokeWidth={3} />
    <circle r={15} fill="none" stroke="#1E7A44" strokeWidth={3} />
    <Label x={0} y={9} size={24} weight={900} fill="#1E7A44">
      $
    </Label>
  </g>
);

export const YapayZeka: React.FC<VisualProps> = ({ t, cue, fps }) => {
  const worry = cue("endise");
  return (
    <g>
      <Backdrop />
      <g transform={scaleAt(500, 330, pop(t, fps))}>
        <Chip x={500} y={330} glow={0.5 + 0.5 * Math.sin(t / 4)} />
      </g>
      {Array.from({ length: 12 }, (_, i) => {
        // Para chip'e doğru çekilir: yapay zekâ harcaması.
        const p = ((t * 1.2 + i * 9) % 50) / 50;
        const angle = (i / 12) * Math.PI * 2 + 0.3;
        const dist = 430 * (1 - p) + 60;
        return (
          <Bill
            key={i}
            x={500 + Math.cos(angle) * dist}
            y={330 + Math.sin(angle) * dist * 0.6}
            r={angle * 57 + t * 3}
            s={0.5 + 0.6 * (1 - p)}
          />
        );
      })}
      <Label x={500} y={88} size={46} weight={900} opacity={ease(t, 0, 8)}>
        YAPAY ZEKÂ HARCAMASI
      </Label>
      {worry >= 0 &&
        [180, 820].map((x, i) => (
          <g key={x} transform={scaleAt(x, 540, pop(worry, fps, i * 3))}>
            <path d={`M${x},470 L${x + 70},595 L${x - 70},595Z`} fill={NEWS.yellow} stroke={NEWS.navy} strokeWidth={6} strokeLinejoin="round" />
            <Label x={x} y={580} size={70} weight={900} fill={NEWS.navy}>
              !
            </Label>
          </g>
        ))}
    </g>
  );
};

export const Kayip: React.FC<VisualProps> = ({ t, cue, fps }) => {
  const count = Math.round(500 * ease(t, 2, 22));
  const crash = ease(t, 0, 26);
  const pts = Array.from({ length: 30 }, (_, i) => {
    const x = 40 + i * 32;
    const y = 160 + (i < 8 ? 0 : (i - 8) * 18) + (rand(i) - 0.5) * 30;
    return `${i ? "L" : "M"}${x},${y.toFixed(1)}`;
  }).join("");
  const lost = cue("kayip");
  return (
    <g>
      <Backdrop from="#3A0D12" to="#1A0508" />
      <path d={pts} fill="none" stroke={NEWS.red} strokeWidth={8} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - crash} opacity={0.8} />
      <Label x={500} y={110} size={40} weight={800} fill="#FFFFFF" opacity={ease(t, 0, 8)} letterSpacing={4}>
        ALPHABET · BİR GÜNDE
      </Label>
      <g transform={scaleAt(500, 330, pop(t, fps))}>
        <Label x={500} y={370} size={150} weight={900} fill={NEWS.red}>
          {`−${count}`}
        </Label>
      </g>
      <Label x={500} y={460} size={58} weight={900}>
        MİLYAR DOLAR
      </Label>
      {lost >= 0 && (
        <g transform={scaleAt(500, 565, pop(lost, fps))}>
          <rect x={300} y={525} width={400} height={80} rx={40} fill={NEWS.red} />
          <Label x={500} y={580} size={38} weight={900}>
            DEĞER KAYBI
          </Label>
        </g>
      )}
    </g>
  );
};
