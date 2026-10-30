import { NEWS } from "../theme";
import { Backdrop, ease, H, Label, pop, rand, scaleAt, VisualProps, W } from "./kit";

const TeaGlass: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  const glass = "M-38,0 C-38,28 -20,38 -23,50 C-26,66 -34,82 -32,98 L32,98 C34,82 26,66 23,50 C20,38 38,28 38,0Z";
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <clipPath id="tea-clip">
          <path d={glass} />
        </clipPath>
      </defs>
      <ellipse cx={0} cy={104} rx={70} ry={14} fill="#E9EEF5" stroke="#B8C2D0" strokeWidth={3} />
      <path d={glass} fill="#FFFFFF" opacity={0.25} />
      <rect x={-50} y={14} width={100} height={90} fill="#B3341C" clipPath="url(#tea-clip)" />
      <rect x={-50} y={14} width={100} height={8} fill="#D9572F" clipPath="url(#tea-clip)" />
      <path d={glass} fill="none" stroke="#FFFFFF" strokeWidth={4} opacity={0.9} />
      {[0, 1, 2].map((i) => {
        const phase = (t / 30 + i / 3) % 1;
        return (
          <path
            key={i}
            d={`M${-16 + i * 16},-10 q10,-18 0,-36 q-10,-18 0,-36`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={5}
            strokeLinecap="round"
            opacity={0.6 * Math.sin(phase * Math.PI)}
            transform={`translate(0 ${-phase * 30})`}
          />
        );
      })}
    </g>
  );
};

const Simit: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={62} fill="none" stroke="#9A5420" strokeWidth={40} />
    <circle r={62} fill="none" stroke="#C97A35" strokeWidth={32} />
    {Array.from({ length: 34 }, (_, i) => {
      const a = (i / 34) * Math.PI * 2;
      const r = 62 + (rand(i) - 0.5) * 26;
      return (
        <ellipse
          key={i}
          cx={Math.cos(a) * r}
          cy={Math.sin(a) * r}
          rx={4}
          ry={2.2}
          fill="#FFF4D6"
          transform={`rotate(${rand(i + 50) * 180} ${Math.cos(a) * r} ${Math.sin(a) * r})`}
        />
      );
    })}
  </g>
);

export const Gunaydin: React.FC<VisualProps> = ({ t, cue, fps }) => {
  const rise = ease(t, 0, 24);
  const sunY = 560 - rise * 250;
  return (
    <g>
      <defs>
        <linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3D6FB6" />
          <stop offset="0.55" stopColor="#F7A35C" />
          <stop offset="1" stopColor="#FFD889" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#dawn)" />
      <g transform={`translate(500 ${sunY})`}>
        {Array.from({ length: 16 }, (_, i) => (
          <rect
            key={i}
            x={-6}
            y={-210}
            width={12}
            height={70}
            rx={6}
            fill="#FFE9A3"
            opacity={0.7}
            transform={`rotate(${i * 22.5 + t * 0.8})`}
          />
        ))}
        <circle r={115} fill="#FFD23F" />
        <circle r={115} fill="none" stroke="#FFF1B8" strokeWidth={10} opacity={0.6} />
      </g>
      <path d="M0,520 C180,450 320,500 500,470 C680,440 820,490 1000,450 L1000,650 L0,650Z" fill="#5BAE6A" />
      <path d="M0,570 C200,530 380,580 560,550 C740,520 860,560 1000,540 L1000,650 L0,650Z" fill="#3E8E54" />
      <rect x={560} y={560} width={420} height={18} rx={9} fill="#7A4A26" />
      <g transform={scaleAt(700, 540, pop(t, fps, 8))}>
        <Simit x={700} y={505} />
      </g>
      <g transform={scaleAt(880, 560, pop(t, fps, 12))}>
        <TeaGlass x={880} y={456} t={t} />
      </g>
      <g transform={scaleAt(500, 120, pop(t, fps, 2))}>
        <Label x={500} y={145} size={96} weight={900} fill="#FFFFFF">
          GÜNAYDIN
        </Label>
      </g>
      <g transform={scaleAt(300, 250, pop(cue("turkiye"), fps))}>
        <Label x={300} y={262} size={70} weight={900} fill={NEWS.red}>
          TÜRKİYE!
        </Label>
      </g>
    </g>
  );
};

const Afro: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return <circle key={i} cx={Math.cos(a) * 52} cy={Math.sin(a) * 46 - 8} r={30} fill="#111111" />;
    })}
    <circle cx={0} cy={-8} r={58} fill="#111111" />
    <ellipse cx={0} cy={22} rx={32} ry={38} fill="#FFC39A" stroke="#111" strokeWidth={5} />
  </g>
);

const MustacheIcon: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M0,-12 C20,-30 55,-28 70,-8 C78,4 72,22 60,26 C50,8 30,4 0,14 C-30,4 -50,8 -60,26 C-72,22 -78,4 -70,-8 C-55,-28 -20,-30 0,-12Z"
    fill="#111111"
  />
);

const Badge: React.FC<{ x: number; y: number; k: number; label: string; children: React.ReactNode }> = ({
  x,
  y,
  k,
  label,
  children,
}) => (
  <g transform={scaleAt(x, y, k)}>
    <circle cx={x} cy={y} r={105} fill="#FFFFFF" />
    <circle cx={x} cy={y} r={105} fill="none" stroke={NEWS.yellow} strokeWidth={10} />
    {children}
    <rect x={x - 95} y={y + 85} width={190} height={50} rx={25} fill={NEWS.red} />
    <Label x={x} y={y + 121} size={28}>
      {label}
    </Label>
  </g>
);

export const Spiker: React.FC<VisualProps> = ({ t, cue, fps }) => {
  const name = "DANYAL";
  const typed = Math.max(0, Math.min(name.length, Math.floor(cue("isim") / 2) + 1));
  return (
    <g>
      <Backdrop />
      <Label x={500} y={110} size={40} weight={600} fill={NEWS.yellow} opacity={ease(t, 0, 8)} letterSpacing={8}>
        SPİKERİNİZ
      </Label>
      <Badge x={290} y={300} k={pop(cue("sac"), fps)} label="BONUS SAÇ">
        <Afro x={290} y={300} s={0.95} />
      </Badge>
      <Badge x={710} y={300} k={pop(cue("biyik"), fps)} label="BIYIK">
        <MustacheIcon x={710} y={300} s={1.1} />
      </Badge>
      <Label x={500} y={590} size={120} weight={900} letterSpacing={10}>
        {cue("isim") >= 0 ? name.slice(0, typed) : ""}
      </Label>
    </g>
  );
};

export const Enerji: React.FC<VisualProps> = ({ t, cue, fps }) => {
  const full = cue("dolu");
  // Dolum, "gaz" kelimesinde %100'e ulaşacak şekilde hızlanır.
  const level = full >= 0 ? 1 : Math.min(0.92, ease(t, 0, 50) * 0.92);
  const color = level < 0.4 ? NEWS.red : level < 0.8 ? NEWS.yellow : NEWS.green;
  const shake = full >= 0 && full < 12 ? Math.sin(full * 2.5) * 6 : 0;
  return (
    <g>
      <Backdrop />
      <Label x={500} y={115} size={58} weight={900} opacity={ease(t, 0, 8)}>
        CUMA ENERJİSİ
      </Label>
      <g transform={`translate(${shake} 0)`}>
        <rect x={250} y={210} width={460} height={230} rx={34} fill="none" stroke="#FFFFFF" strokeWidth={14} />
        <rect x={718} y={280} width={40} height={90} rx={10} fill="#FFFFFF" />
        <rect x={268} y={228} width={424 * level} height={194} rx={22} fill={color} />
        <path d="M500,250 L445,335 L490,335 L470,405 L560,305 L512,305 L540,250Z" fill="#FFFFFF" opacity={0.95} />
      </g>
      <Label x={480} y={520} size={54} weight={800} fill={color}>
        {`%${Math.round(level * 100)}`}
      </Label>
      {full >= 0 && (
        <>
          {Array.from({ length: 6 }, (_, i) => (
            <line
              key={i}
              x1={90 - ((full * 18 + i * 40) % 120)}
              x2={200 - ((full * 18 + i * 40) % 120)}
              y1={230 + i * 38}
              y2={230 + i * 38}
              stroke={NEWS.yellow}
              strokeWidth={8}
              strokeLinecap="round"
              opacity={0.8}
            />
          ))}
          <g transform={`${scaleAt(800, 560, pop(full, fps))} rotate(-8 800 560)`}>
            <rect x={640} y={510} width={320} height={90} rx={14} fill={NEWS.red} />
            <Label x={800} y={575} size={56} weight={900}>
              TAM GAZ!
            </Label>
          </g>
        </>
      )}
    </g>
  );
};

export const Bulten: React.FC<VisualProps> = ({ t, fps }) => {
  const spin = t * 3;
  return (
    <g>
      <Backdrop from={NEWS.red} to={NEWS.redDark} grid={false} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={-400 + ease(t, i * 2, 12) * 1500} y={120 + i * 150} width={500} height={40} fill="#FFFFFF" opacity={0.12} />
      ))}
      <g transform={scaleAt(500, 260, pop(t, fps))}>
        <circle cx={500} cy={260} r={140} fill={NEWS.navy} stroke="#FFFFFF" strokeWidth={8} />
        {[-60, 0, 60].map((lat) => (
          <ellipse key={lat} cx={500} cy={260 + lat * 1.6} rx={140 * Math.cos((lat * Math.PI) / 200)} ry={10} fill="none" stroke="#FFFFFF" strokeWidth={4} opacity={0.6} />
        ))}
        {[0, 45, 90, 135].map((m) => (
          <ellipse key={m} cx={500} cy={260} rx={Math.abs(140 * Math.cos(((m + spin) * Math.PI) / 180))} ry={140} fill="none" stroke="#FFFFFF" strokeWidth={4} opacity={0.6} />
        ))}
      </g>
      <Label x={500} y={540} size={84} weight={900} opacity={ease(t, 4, 8)}>
        BÜLTEN BAŞLIYOR
      </Label>
    </g>
  );
};
