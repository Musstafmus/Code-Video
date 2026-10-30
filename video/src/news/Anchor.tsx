import { staticFile } from "remotion";
import { lerp } from "../motion";
import { CharacterRig } from "../types";

export type AnchorPose = {
  time: number;
  open: number;
  round: number;
  energy: number;
  accent: number;
  blink: number;
  lookX: number;
  lookY: number;
};

const INK = "#0A0A0A";

/**
 * Görselden üretilen sunucu. Koordinatlar görselin pikselleri; yüz parçalarının
 * yerleri karakter.json'dan gelir. Katmanlar: gövde (yüz parçaları silinmiş),
 * kodla çizilen ağız ve gözler, görselden kesilen bıyık ve kaşlar.
 */
export const Anchor: React.FC<{ deneme: string; rig: CharacterRig; size: [number, number]; pose: AnchorPose }> = ({
  deneme,
  rig,
  size,
  pose,
}) => {
  const layer = (name: string) => staticFile(`denemeler/${deneme}/karakter/${name}.png`);
  const [w, h] = size;
  const { time, open, round, energy, accent } = pose;

  const [mx, my] = rig.agiz.merkez;
  const halfWidth = (rig.agiz.genislik / 2) * lerp(1, 0.72, round) * (0.88 + 0.12 * open);
  const bottom = rig.biyik.kesim.y + 3 + open * 46;
  const mid = my + (bottom - my) * 0.55;
  const mouth = `M${mx - halfWidth},${my} L${mx + halfWidth},${my} C${mx + halfWidth},${mid} ${mx + halfWidth * 0.55},${bottom} ${mx},${bottom} C${mx - halfWidth * 0.55},${bottom} ${mx - halfWidth},${mid} ${mx - halfWidth},${my}Z`;
  const [p0, p1, p2] = rig.altDudak.cizgi;
  const lipDrop = Math.max(0, bottom - 846);

  const breath = Math.sin((time * Math.PI * 2) / 3.6);
  const tilt = Math.sin(time * 0.8) * 0.8 + Math.sin(time * 0.33) * 0.5 + energy * 0.4;
  // Vurguda hafif öne eğilip başla onaylama hissi.
  const nod = accent * 6 - energy * 3;
  const pivotX = w / 2;
  const pivotY = rig.kirpma.alt;
  const browLift = accent * 9 + energy * 2;

  return (
    <g transform={`translate(${pivotX} ${pivotY + nod}) rotate(${tilt}) scale(1 ${1 + breath * 0.005}) translate(${-pivotX} ${-pivotY})`}>
      <defs>
        <clipPath id="anchor-crop">
          <rect x={0} y={0} width={w} height={rig.kirpma.alt} />
        </clipPath>
        <clipPath id="anchor-mouth">
          <path d={mouth} />
        </clipPath>
      </defs>
      <g clipPath="url(#anchor-crop)">
        <image href={layer("govde")} width={w} height={h} />
      </g>

      <path d={mouth} fill="#1B0B0B" />
      <ellipse cx={mx - 6} cy={bottom - 4} rx={halfWidth * 0.6} ry={4 + open * 10} fill="#E37B7E" clipPath="url(#anchor-mouth)" />
      <path
        d={`M${p0[0]},${p0[1] + lipDrop} Q${p1[0]},${p1[1] + lipDrop} ${p2[0]},${p2[1] + lipDrop}`}
        fill="none"
        stroke={INK}
        strokeWidth={6.5}
        strokeLinecap="round"
      />
      <image href={layer("biyik")} width={w} height={h} transform={`translate(0 ${-open * 1.5})`} />

      {rig.gozler.map(({ merkez: [cx, cy], yaricap: [rx, ry] }, i) =>
        pose.blink > 0.85 ? (
          <path key={i} d={`M${cx - rx},${cy} Q${cx},${cy + 7} ${cx + rx},${cy}`} fill="none" stroke={INK} strokeWidth={5.5} strokeLinecap="round" />
        ) : (
          <ellipse key={i} cx={cx + pose.lookX} cy={cy + pose.lookY} rx={rx} ry={ry * (1 - pose.blink)} fill={INK} />
        ),
      )}
      {rig.kaslar.map((_, i) => (
        <image key={i} href={layer(`kas-${i}`)} width={w} height={h} transform={`translate(0 ${-browLift})`} />
      ))}
    </g>
  );
};
