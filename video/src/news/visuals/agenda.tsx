import { NEWS } from "../theme";
import { Backdrop, ease, Label, pop, scaleAt, VisualProps } from "./kit";

export const Gundem: React.FC<VisualProps> = ({ t, fps }) => (
  <g>
    <Backdrop from={NEWS.red} to={NEWS.redDark} grid={false} />
    {Array.from({ length: 8 }, (_, i) => (
      <rect key={i} x={-300 + i * 180 + t * 12} y={-50} width={60} height={800} fill="#FFFFFF" opacity={0.07} transform={`skewX(-20)`} />
    ))}
    <g transform={scaleAt(500, 330, pop(t, fps))}>
      <Label x={500} y={370} size={150} weight={900} letterSpacing={12}>
        GÜNDEM
      </Label>
    </g>
  </g>
);

const Leader: React.FC<{ x: number; k: number; suit: string }> = ({ x, k, suit }) => (
  <g transform={scaleAt(x, 400, k)} opacity={Math.min(1, k)}>
    <path d={`M${x - 52},400 C${x - 52},330 ${x + 52},330 ${x + 52},400Z`} fill={suit} />
    <path d={`M${x - 10},336 L${x},380 L${x + 10},336Z`} fill="#FFFFFF" />
    <circle cx={x} cy={300} r={34} fill="#E9B48C" />
  </g>
);

const SUITS = ["#2B3A55", "#3B3F4A", "#1E2B44", "#4A3F35", "#26354F", "#383D47"];

export const Zirve: React.FC<VisualProps> = ({ t, cue, fps }) => {
  const leaders = cue("liderler");
  const seats = [190, 314, 438, 562, 686, 810];
  return (
    <g>
      <Backdrop />
      <rect x={130} y={110} width={740} height={110} rx={12} fill={NEWS.navy} stroke={NEWS.yellow} strokeWidth={4} opacity={ease(t, 0, 8)} />
      <Label x={500} y={155} size={34} weight={900} opacity={ease(t, 0, 8)}>
        TÜRK DEVLETLERİ TEŞKİLATI
      </Label>
      <Label x={500} y={200} size={34} weight={900} fill={NEWS.yellow} opacity={ease(t, 3, 8)}>
        ZİRVESİ
      </Label>
      {seats.map((x, i) => (
        <Leader key={x} x={x} k={leaders >= 0 ? pop(leaders, fps, i * 3) : 0} suit={SUITS[i]} />
      ))}
      <path d="M80,400 L920,400 L960,470 L40,470Z" fill="#6B4A2E" />
      <rect x={40} y={470} width={920} height={90} fill="#553A24" />
      {seats.map((x, i) => (
        <g key={x} opacity={ease(t, 6 + i, 6)}>
          <line x1={x} y1={430} x2={x + 18} y2={385} stroke="#222" strokeWidth={5} />
          <ellipse cx={x + 20} cy={380} rx={8} ry={12} fill="#222" />
          <rect x={x - 40} y={430} width={80} height={26} rx={4} fill="#FFFFFF" opacity={0.9} />
        </g>
      ))}
      <g transform={scaleAt(145, 600, pop(t, fps, 6))}>
        <path d="M110,560 C110,520 180,520 180,560 C180,590 145,620 145,630 C145,620 110,590 110,560Z" fill={NEWS.red} />
        <circle cx={145} cy={560} r={13} fill="#FFFFFF" />
        <Label x={200} y={612} size={44} weight={900} anchor="start">
          ANKARA
        </Label>
      </g>
      {leaders >= 0 && (
        <g opacity={ease(leaders, 10, 8)}>
          <rect x={520} y={572} width={440} height={60} rx={30} fill={NEWS.yellow} />
          <Label x={740} y={613} size={30} weight={900} fill={NEWS.navy}>
            LİDERLER ANKARA'DA
          </Label>
        </g>
      )}
    </g>
  );
};
