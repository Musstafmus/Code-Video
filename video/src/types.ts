/** scripts/analiz.py çıktısı */
export type Analysis = {
  fps: number;
  durationInFrames: number;
  durationSeconds: number;
  frames: {
    /** ağız açıklığı 0..1 */
    open: number[];
    /** 0 = geniş (i, e), 1 = yuvarlak (o, u) */
    round: number[];
    /** s, ş, z gibi seslerde dişlerin görünmesi 0..1 */
    teeth: number[];
    /** yumuşatılmış konuşma enerjisi 0..1 (beden hareketi için) */
    energy: number[];
  };
  /** vurgu anlarının kare numaraları */
  accents: number[];
  /** konuşma bölümleri [başlangıç, bitiş) kare */
  speech: [number, number][];
};

export type VideoProps = {
  /** denemeler/ altındaki klasör adı, ör. "deneme-1" */
  deneme: string;
  audioFile: string;
  label: string;
  analysis?: Analysis;
};

export type AlignedWord = { text: string; start: number; end: number };

/** scripts/analiz.py --metin çıktısındaki ek alanlar */
export type AlignedAnalysis = Analysis & {
  words: AlignedWord[];
  /** altyazı satırları: [ilk kelime, son kelime] (dahil) */
  lines: [number, number][];
};

/** denemeler/<deneme>/sahneler.json */
export type SceneConfig = {
  program: string;
  tarih: string;
  etiket: string;
  kayanYazi: string[];
  bolumler: { kelime: string; baslik: string }[];
  sahneler: { kelime: string; gorsel: string; ipuclari?: Record<string, string> }[];
};

/** denemeler/<deneme>/karakter.json */
export type CharacterRig = {
  gorsel: string;
  kaslar: [number, number, number, number][];
  gozler: { merkez: [number, number]; yaricap: [number, number] }[];
  biyik: { kutu: [number, number, number, number]; kesim: { x: [number, number]; y: number } };
  agiz: { merkez: [number, number]; genislik: number };
  altDudak: { cizgi: [number, number][] };
  kirpma: { ust: number; alt: number };
};

export type NewsProps = {
  deneme: string;
  audioFile: string;
  analysis?: AlignedAnalysis;
  scenes?: SceneConfig;
  rig?: CharacterRig;
  imageSize?: [number, number];
};
