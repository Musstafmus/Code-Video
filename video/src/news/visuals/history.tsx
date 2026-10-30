import { NEWS } from "../theme";
import { Backdrop, ease, H, Label, pop, rand, scaleAt, VisualProps, W } from "./kit";

export const Takvim: React.FC<VisualProps> = ({ t, cue, fps }) => {
  const year = cue("yil");
  // Sayfa çevrilirken dikeyde kapanıp açılır; yarıda içerik 1973'e geçer.
  const flip = year >= 0 ? ease(year, 0, 10) : 0;
  const squash = Math.abs(Math.cos(flip * Math.PI));
  const showYear = flip >= 0.5;
  const sepia = showYear ? ease(year, 5, 10) : 0;
  return (
    <g>
      <Backdrop />
      <rect width={W} height={H} fill="#7A5A2E" opacity={sepia * 0.55} />
      <g transform={scaleAt(500, 330, pop(t, fps))}>
        {[3, 2, 1].map((i) => (
          <rect key={i} x={300 + i * 6} y={110 + i * 6} width={400} height={440} rx={26} fill="#E8E0D0" opacity={0.5} />
        ))}
        <g transform={`translate(0 330) scale(1 ${squash}) translate(0 -330)`}>
          <rect x={300} y={110} width={400} height={440} rx={26} fill={showYear ? "#F3E6C8" : "#FFFFFF"} />
          <rect x={300} y={110} width={400} height={110} rx={26} fill={NEWS.red} />
          <rect x={300} y={190} width={400} height={30} fill={NEWS.red} />
          <Label x={500} y={185} size={40} weight={900}>
            {showYear ? "EKİM" : "TARİHTE BUGÜN"}
          </Label>
          <Label x={500} y={420} size={showYear ? 150 : 190} weight={900} fill={NEWS.navy}>
            {showYear ? "1973" : "30"}
          </Label>
          <Label x={500} y={505} size={42} weight={800} fill={NEWS.red}>
            {showYear ? "30 EKİM" : "EKİM"}
          </Label>
        </g>
        {[360, 640].map((x) => (
          <rect key={x} x={x - 10} y={88} width={20} height={50} rx={10} fill="#C9CED6" />
        ))}
      </g>
      {cue("sehir") >= 0 && (
        <g transform={`${scaleAt(770, 520, 2.2 - 1.2 * ease(cue("sehir"), 0, 6))} rotate(-12 770 520)`} opacity={ease(cue("sehir"), 0, 4)}>
          <rect x={590} y={470} width={360} height={100} rx={12} fill="none" stroke={NEWS.red} strokeWidth={10} />
          <Label x={770} y={540} size={56} weight={900} fill={NEWS.red}>
            İSTANBUL
          </Label>
        </g>
      )}
    </g>
  );
};

export const Yil50: React.FC<VisualProps> = ({ t, fps }) => {
  const k = pop(t, fps);
  const points = Array.from({ length: 48 }, (_, i) => {
    const a = (i / 48) * Math.PI * 2;
    const r = i % 2 ? 165 : 190;
    return `${500 + Math.cos(a) * r},${320 + Math.sin(a) * r}`;
  }).join(" ");
  return (
    <g>
      <Backdrop />
      {Array.from({ length: 40 }, (_, i) => {
        const x = rand(i) * W;
        const y = ((t * (4 + rand(i + 9) * 5) + rand(i + 3) * H) % (H + 40)) - 20;
        return (
          <rect key={i} x={x} y={y} width={14} height={8} fill={i % 2 ? NEWS.red : "#FFFFFF"} transform={`rotate(${t * 6 + i * 40} ${x} ${y})`} />
        );
      })}
      <g transform={scaleAt(500, 320, k)}>
        <path d="M430,440 L390,620 L445,590 L470,640 L500,470Z" fill={NEWS.redDark} />
        <path d="M570,440 L610,620 L555,590 L530,640 L500,470Z" fill={NEWS.redDark} />
        <polygon points={points} fill={NEWS.red} />
        <circle cx={500} cy={320} r={140} fill="#FFFFFF" />
        <circle cx={500} cy={320} r={126} fill="none" stroke={NEWS.red} strokeWidth={4} />
        <Label x={500} y={360} size={130} weight={900} fill={NEWS.red}>
          50.
        </Label>
        <Label x={500} y={410} size={38} weight={900} fill={NEWS.navy} letterSpacing={6}>
          YIL
        </Label>
      </g>
      <Label x={500} y={78} size={44} weight={900} opacity={ease(t, 4, 8)}>
        CUMHURİYET'İN 50. YILI
      </Label>
    </g>
  );
};

const DECK_Y = 395;
const TOWERS = [255, 745];
const TOWER_TOP = 140;
const MID_SAG = 335;

/** Ana kablonun x konumundaki yüksekliği (ikinci derece Bezier). */
const cableY = (x: number) => {
  const u = (x - TOWERS[0]) / (TOWERS[1] - TOWERS[0]);
  const control = 2 * MID_SAG - TOWER_TOP;
  return (1 - u) ** 2 * TOWER_TOP + 2 * u * (1 - u) * control + u ** 2 * TOWER_TOP;
};

export const Kopru: React.FC<VisualProps> = ({ t, cue, fps }) => {
  const towers = ease(t, 0, 14);
  const cable = ease(t, 10, 22);
  const deck = ease(t, 18, 20);
  const kita = cue("kita");
  const asphalt = cue("asfalt");
  // Asfalt iki yakadan başlayıp ortada buluşur.
  const pave = asphalt >= 0 ? ease(asphalt, 0, 16) : 0;
  const joined = asphalt >= 0 && pave >= 1;
  const car = asphalt >= 0 ? ease(asphalt, 14, 34) : 0;
  const control = 2 * MID_SAG - TOWER_TOP;
  const hangers = [];
  for (let x = TOWERS[0] + 24; x < TOWERS[1]; x += 24) hangers.push(x);

  return (
    <g>
      <defs>
        <linearGradient id="bosphorus-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2C5C9E" />
          <stop offset="1" stopColor="#F2B279" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#bosphorus-sky)" />
      <rect y={440} width={W} height={210} fill="#1F6FA8" />
      {Array.from({ length: 7 }, (_, i) => (
        <path
          key={i}
          d={`M${((t * 2 + i * 150) % 1150) - 150},${470 + (i % 3) * 50} q25,-10 50,0 t50,0`}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={4}
          opacity={0.35}
        />
      ))}
      <path d="M0,330 C60,320 110,360 150,400 L190,440 L190,650 L0,650Z" fill="#4C8B4F" />
      <path d="M1000,320 C940,315 890,360 850,400 L810,440 L810,650 L1000,650Z" fill="#4C8B4F" />

      {TOWERS.map((x) => (
        <g key={x} transform={`translate(0 ${DECK_Y + 50}) scale(1 ${towers}) translate(0 ${-(DECK_Y + 50)})`}>
          <rect x={x - 22} y={TOWER_TOP} width={12} height={DECK_Y + 50 - TOWER_TOP} fill="#D7DCE3" />
          <rect x={x + 10} y={TOWER_TOP} width={12} height={DECK_Y + 50 - TOWER_TOP} fill="#D7DCE3" />
          {[TOWER_TOP + 10, 250, 340].map((y) => (
            <rect key={y} x={x - 22} y={y} width={44} height={10} fill="#C3C9D2" />
          ))}
        </g>
      ))}

      <path
        d={`M${TOWERS[0]},${TOWER_TOP} Q500,${control} ${TOWERS[1]},${TOWER_TOP}`}
        fill="none"
        stroke="#F2F4F7"
        strokeWidth={7}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - cable}
      />
      <path d={`M${TOWERS[0]},${TOWER_TOP} Q160,330 110,${DECK_Y}`} fill="none" stroke="#F2F4F7" strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - cable} />
      <path d={`M${TOWERS[1]},${TOWER_TOP} Q840,330 890,${DECK_Y}`} fill="none" stroke="#F2F4F7" strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - cable} />
      {hangers.map((x, i) => (
        <line key={x} x1={x} x2={x} y1={cableY(x)} y2={DECK_Y} stroke="#F2F4F7" strokeWidth={2.5} opacity={ease(t, 24 + i * 0.6, 6)} />
      ))}

      <rect x={110} y={DECK_Y} width={390 * deck} height={18} fill="#C3C9D2" />
      <rect x={890 - 390 * deck} y={DECK_Y} width={390 * deck} height={18} fill="#C3C9D2" />
      <rect x={110} y={DECK_Y - 4} width={390 * pave} height={14} fill="#2F3338" />
      <rect x={890 - 390 * pave} y={DECK_Y - 4} width={390 * pave} height={14} fill="#2F3338" />
      {pave > 0 &&
        Array.from({ length: 19 }, (_, i) => {
          const x = 125 + i * 40;
          const visible = x < 110 + 390 * pave || x > 890 - 390 * pave;
          return visible ? <rect key={i} x={x} y={DECK_Y + 1} width={20} height={3} fill="#FFFFFF" /> : null;
        })}
      {joined && (
        <g transform={scaleAt(500, DECK_Y, pop(asphalt - 16, fps))}>
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2;
            return <line key={i} x1={500 + Math.cos(a) * 30} y1={DECK_Y + Math.sin(a) * 30} x2={500 + Math.cos(a) * 60} y2={DECK_Y + Math.sin(a) * 60} stroke={NEWS.yellow} strokeWidth={6} strokeLinecap="round" />;
          })}
        </g>
      )}
      {car > 0 && car < 1 && (
        <g transform={`translate(${130 + car * 740} ${DECK_Y - 22})`}>
          <rect x={-22} y={0} width={44} height={16} rx={5} fill={NEWS.red} />
          <rect x={-12} y={-9} width={24} height={11} rx={4} fill={NEWS.red} />
          <circle cx={-12} cy={17} r={5} fill="#111" />
          <circle cx={12} cy={17} r={5} fill="#111" />
        </g>
      )}

      {kita >= 0 && (
        <>
          <g transform={scaleAt(110, 560, pop(kita, fps))}>
            <rect x={20} y={525} width={190} height={60} rx={12} fill={NEWS.navy} />
            <Label x={115} y={567} size={34}>
              AVRUPA
            </Label>
          </g>
          <g transform={scaleAt(890, 560, pop(kita, fps, 5))}>
            <rect x={800} y={525} width={170} height={60} rx={12} fill={NEWS.navy} />
            <Label x={885} y={567} size={34}>
              ASYA
            </Label>
          </g>
        </>
      )}
      <Label x={500} y={70} size={46} weight={900} opacity={ease(t, 6, 10)}>
        BOĞAZİÇİ KÖPRÜSÜ
      </Label>
      {joined && (
        <g transform={scaleAt(500, 545, pop(asphalt - 18, fps))}>
          <rect x={385} y={505} width={230} height={66} rx={14} fill={NEWS.red} />
          <Label x={500} y={552} size={40} weight={900}>
            1973
          </Label>
        </g>
      )}
    </g>
  );
};
