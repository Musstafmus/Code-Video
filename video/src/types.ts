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
