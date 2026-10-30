import { AlignedWord, SceneConfig } from "../types";

export type ResolvedScene = {
  visual: string;
  /** ses zaman çizelgesinde başlangıç karesi */
  start: number;
  end: number;
  /** ipucu adı -> kelimenin başladığı kare */
  cues: Record<string, number>;
};

export type ResolvedSection = { title: string; start: number };

const STRIP = /^[.,!?:;"“”'’()…]+|[.,!?:;"“”'’()…]+$/g;

export const normalize = (s: string) =>
  s.replace(/I/g, "ı").replace(/İ/g, "i").toLowerCase().replace(STRIP, "");

/** `from` indeksinden itibaren `keyword` ile başlayan ilk kelimenin indeksi. */
const findWord = (words: AlignedWord[], keyword: string, from: number) => {
  const key = normalize(keyword);
  for (let i = from; i < words.length; i++) {
    if (normalize(words[i].text).startsWith(key)) return i;
  }
  return -1;
};

/** Görsel, kelimeden biraz önce başlasın ki göz ses ile aynı anda yakalasın. */
const VISUAL_LEAD = 4;

export const resolveScenes = (words: AlignedWord[], config: SceneConfig, totalFrames: number) => {
  const scenes: ResolvedScene[] = [];
  let cursor = 0;
  for (const s of config.sahneler) {
    const index = findWord(words, s.kelime, cursor);
    if (index < 0) {
      console.warn(`Sahne kelimesi bulunamadı: ${s.kelime}`);
      continue;
    }
    cursor = index + 1;
    const cues: Record<string, number> = {};
    for (const [name, keyword] of Object.entries(s.ipuclari ?? {})) {
      const ci = findWord(words, keyword, index);
      if (ci >= 0) cues[name] = words[ci].start;
    }
    scenes.push({ visual: s.gorsel, start: Math.max(0, words[index].start - VISUAL_LEAD), end: totalFrames, cues });
  }
  scenes.forEach((s, i) => {
    if (i + 1 < scenes.length) s.end = scenes[i + 1].start;
  });
  return scenes;
};

export const resolveSections = (words: AlignedWord[], config: SceneConfig): ResolvedSection[] => {
  let cursor = 0;
  return config.bolumler.flatMap((b) => {
    const index = findWord(words, b.kelime, cursor);
    if (index < 0) return [];
    cursor = index + 1;
    return [{ title: b.baslik, start: Math.max(0, words[index].start - VISUAL_LEAD) }];
  });
};
