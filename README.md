# Code-Video

Özgün bir karakter tasarlayıp videolarını kod ile üretme projesi.

- [ARASTIRMA.md](ARASTIRMA.md): Gerekli araçların araştırması ve önerilen başlangıç yığını.
- [KURALLAR.md](KURALLAR.md): Ses, senaryo, karakter ve animasyon kuralları.
- [denemeler/](denemeler/): Her deneme bir klasör (ses + notlar + çıktı video).
- [video/](video/): Remotion projesi (karakter, sahne, ses analizi, render betiği).

## Video üretmek

Gereksinimler: Node.js 18+, Python 3 + numpy, FFmpeg.

```bash
cd video && npm install
```

```bash
npm run render -- deneme-1
```

Betik `denemeler/deneme-1/ses.mp3` dosyasını analiz eder ve `denemeler/deneme-1/deneme-1.mp4`
dosyasını üretir. Canlı önizleme için `npm run studio` (önce bir kez render çalıştırılmış olmalı).
