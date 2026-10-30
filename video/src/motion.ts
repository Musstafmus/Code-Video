import { random } from "remotion";
import { Analysis } from "./types";

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Analiz dizisinden kare değeri; ses dışındaki karelerde 0. */
export const sample = (values: number[], frame: number) => {
  const i = Math.floor(frame);
  if (i < 0 || i >= values.length - 1) return values[Math.min(Math.max(i, 0), values.length - 1)] ?? 0;
  return lerp(values[i], values[i + 1], frame - i);
};

/** Hızlı yükselen, yavaş sönen tek bir vurgu darbesi. */
const pulse = (dt: number, attack = 4, decay = 9) => {
  if (dt < 0) return 0;
  if (dt < attack) return dt / attack;
  return Math.exp(-(dt - attack) / decay);
};

/** Verilen kareye etki eden vurguların toplamı (0..1). */
export const accentEnvelope = (accents: number[], frame: number, filter?: (index: number) => boolean) => {
  let sum = 0;
  accents.forEach((a, i) => {
    if (filter && !filter(i)) return;
    if (frame >= a && frame - a < 60) sum += pulse(frame - a);
  });
  return clamp01(sum);
};

export const isSpeaking = (analysis: Analysis, frame: number) =>
  analysis.speech.some(([s, e]) => frame >= s && frame < e);

const BLINK_SHAPE = [0.35, 0.8, 1, 1, 0.75, 0.4, 0.1];

/**
 * Göz kırpma zamanları: rastgele aralıklarla (2,5-5 sn) ve her konuşma
 * duraklamasının başında. Kırpmalar arası en az 1 sn.
 */
export const blinkSchedule = (analysis: Analysis, totalFrames: number, offset: number) => {
  const candidates: number[] = analysis.speech.map(([, end]) => end + offset + 2);
  for (let f = 25, i = 0; f < totalFrames; i++) {
    candidates.push(f);
    f += Math.round(75 + random(`blink-${i}`) * 75);
  }
  candidates.sort((a, b) => a - b);
  const picked: number[] = [];
  for (const c of candidates) {
    if (!picked.length || c - picked[picked.length - 1] >= 30) picked.push(c);
  }
  return picked;
};

export const blinkAmount = (schedule: number[], frame: number) => {
  for (const start of schedule) {
    const dt = frame - start;
    if (dt >= 0 && dt < BLINK_SHAPE.length) return BLINK_SHAPE[dt];
  }
  return 0;
};
