import { NEWS } from "../theme";
import { Backdrop, ease, Label, pop, rand, scaleAt, VisualProps } from "./kit";

const CHART = { left: 80, right: 920, top: 150, bottom: 520 };
const HOLIDAY = [500, 620];

/** Temsili fiyat çizgisi (gerçek endeks verisi değildir). */
const pricePoints = () => {
  const pts: [number, number][] = [];
  for (let x = CHART.left; x <= HOLIDAY[0]; x += 20) {
    pts.push([x, 300 - (x - CHART.left) * 0.12 + (rand(x) - 0.5) * 40]);
  }
  for (let x = HOLIDAY[1], i = 0; x <= CHART.right; x += 20, i++) {
    pts.push([x, 330 + i * 9 + (rand(x + 7) - 0.5) * 22]);
  }
  return pts;
};
const POINTS = pricePoints();
const PRE = POINTS.filter(([x]) => x <= HOLIDAY[0]);
const POST = POINTS.filter(([x]) => x >= HOLIDAY[1]);
const toPath = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y.toFixed(1)}`).join("");

export const Borsa: React.FC<VisualProps> = ({ t, cue, fps }) => {
  const pre = ease(t, 0, 20);
  const holiday = cue("bayram");
  const post = holiday >= 0 ? ease(holiday, 10, 24) : 0;
  const drop = cue("dusus");
  return (
    <g>
      <Backdrop />
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1={CHART.left} x2={CHART.right} y1={CHART.top + i * 92} y2={CHART.top + i * 92} stroke="#FFFFFF" opacity={0.12} strokeWidth={2} />
      ))}
      <Label x={CHART.left} y={95} size={46} weight={900} anchor="start" opacity={ease(t, 0, 8)}>
        BORSA
      </Label>
      {holiday >= 0 && (
        <g opacity={ease(holiday, 0, 8)}>
          <rect x={HOLIDAY[0] + 10} y={CHART.top - 10} width={HOLIDAY[1] - HOLIDAY[0] - 20} height={CHART.bottom - CHART.top + 20} rx={10} fill={NEWS.yellow} opacity={0.18} />
          <Label x={(HOLIDAY[0] + HOLIDAY[1]) / 2} y={CHART.bottom + 45} size={26} weight={800} fill={NEWS.yellow}>
            BAYRAM ARASI
          </Label>
        </g>
      )}
      <path d={toPath(PRE)} fill="none" stroke={NEWS.green} strokeWidth={7} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pre} />
      <path d={toPath(POST)} fill="none" stroke={NEWS.red} strokeWidth={7} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - post} />
      {drop >= 0 && (
        <g transform={scaleAt(760, 120, pop(drop, fps))}>
          <rect x={600} y={60} width={330} height={110} rx={16} fill={NEWS.red} />
          <path d="M640,95 L690,95 L665,135Z" fill="#FFFFFF" />
          <Label x={810} y={137} size={64} weight={900}>
            %0,59
          </Label>
        </g>
      )}
    </g>
  );
};

const GAUGE = { x: 500, y: 470, r: 260 };
const MIN = 30;
const MAX = 55;
const angleOf = (v: number) => Math.PI + ((v - MIN) / (MAX - MIN)) * Math.PI;

const arc = (from: number, to: number, r: number) => {
  const a0 = angleOf(from);
  const a1 = angleOf(to);
  return `M${GAUGE.x + Math.cos(a0) * r},${GAUGE.y + Math.sin(a0) * r} A${r},${r} 0 0 1 ${GAUGE.x + Math.cos(a1) * r},${GAUGE.y + Math.sin(a1) * r}`;
};

export const Dolar: React.FC<VisualProps> = ({ t, cue }) => {
  const sweep = ease(t, 2, 26);
  const at50 = cue("elli");
  // İbre 50'nin hemen altında titrer: "sınırında".
  const wobble = at50 >= 0 ? Math.sin(at50 * 0.9) * 0.35 * Math.exp(-at50 / 25) : 0;
  const value = MIN + (49.6 - MIN) * sweep + wobble;
  const a = angleOf(value);
  return (
    <g>
      <Backdrop />
      <path d={arc(30, 40, GAUGE.r)} fill="none" stroke={NEWS.green} strokeWidth={46} />
      <path d={arc(40, 47, GAUGE.r)} fill="none" stroke={NEWS.yellow} strokeWidth={46} />
      <path d={arc(47, 55, GAUGE.r)} fill="none" stroke={NEWS.red} strokeWidth={46} />
      {/* İbre yazıların altında kalsın ki 50 okunabilsin. */}
      <line x1={GAUGE.x} y1={GAUGE.y} x2={GAUGE.x + Math.cos(a) * 225} y2={GAUGE.y + Math.sin(a) * 225} stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" />
      <circle cx={GAUGE.x} cy={GAUGE.y} r={24} fill="#FFFFFF" />
      {[30, 35, 40, 45, 50, 55].map((v) => {
        const av = angleOf(v);
        return (
          <g key={v}>
            <line x1={GAUGE.x + Math.cos(av) * 210} y1={GAUGE.y + Math.sin(av) * 210} x2={GAUGE.x + Math.cos(av) * 232} y2={GAUGE.y + Math.sin(av) * 232} stroke="#FFFFFF" strokeWidth={5} />
            <Label x={GAUGE.x + Math.cos(av) * 180} y={GAUGE.y + Math.sin(av) * 180 + 12} size={v === 50 ? 40 : 30} weight={v === 50 ? 900 : 700} fill={v === 50 ? NEWS.yellow : "#FFFFFF"}>
              {v}
            </Label>
          </g>
        );
      })}
      <Label x={500} y={90} size={50} weight={900} opacity={ease(t, 0, 8)}>
        DOLAR / TL
      </Label>
      <g opacity={at50 >= 0 ? ease(at50, 0, 8) : 0}>
        <rect x={340} y={520} width={320} height={80} rx={40} fill={NEWS.yellow} />
        <Label x={500} y={574} size={36} weight={900} fill={NEWS.navy}>
          50 SINIRINDA
        </Label>
      </g>
    </g>
  );
};

const Coin: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={30} fill="#E8B923" />
    <circle r={22} fill="none" stroke="#FFE07A" strokeWidth={4} />
    <circle r={30} fill="none" stroke="#B88A10" strokeWidth={3} />
  </g>
);

export const Fon: React.FC<VisualProps> = ({ t, cue, fps }) => {
  const door = ease(t, 6, 14);
  const pay = cue("odeme");
  return (
    <g>
      <Backdrop />
      <Label x={500} y={88} size={44} weight={900} opacity={ease(t, 0, 8)}>
        TASFİYEDEKİ FONLAR
      </Label>
      <g transform={scaleAt(260, 360, pop(t, fps))}>
        <rect x={110} y={200} width={300} height={300} rx={22} fill="#8D99AE" stroke="#FFFFFF" strokeWidth={6} />
        <rect x={135} y={225} width={250} height={250} rx={14} fill="#1A2638" />
        <g transform={`translate(135 0) scale(${1 - door * 0.85} 1) translate(-135 0)`}>
          <rect x={135} y={225} width={250} height={250} rx={14} fill="#AEB8C8" stroke="#6B7689" strokeWidth={4} />
          <circle cx={260} cy={350} r={48} fill="none" stroke="#6B7689" strokeWidth={10} />
          <Label x={260} y={364} size={40} weight={900} fill={NEWS.navy}>
            FON
          </Label>
        </g>
      </g>
      {Array.from({ length: 10 }, (_, i) => {
        const p = ((t - 14 - i * 5) % 40) / 40;
        if (t < 14 + i * 5) return null;
        const x = 300 + p * 420;
        const y = 350 - Math.sin(p * Math.PI) * 190 + p * 40;
        return <Coin key={i} x={x} y={y} s={0.9 + rand(i) * 0.3} />;
      })}
      <g transform={scaleAt(780, 420, pop(t, fps, 10))}>
        <rect x={680} y={360} width={210} height={140} rx={22} fill="#8B5A2B" />
        <rect x={680} y={340} width={210} height={50} rx={18} fill="#A86C35" />
        <rect x={820} y={400} width={70} height={50} rx={12} fill="#6E4520" />
        <circle cx={850} cy={425} r={9} fill={NEWS.yellow} />
      </g>
      {pay >= 0 && (
        <g transform={scaleAt(500, 575, pop(pay, fps))}>
          <rect x={150} y={535} width={700} height={80} rx={40} fill={NEWS.yellow} />
          <Label x={500} y={588} size={36} weight={900} fill={NEWS.navy}>
            İLK ARA ÖDEMELER BUGÜN
          </Label>
        </g>
      )}
    </g>
  );
};
