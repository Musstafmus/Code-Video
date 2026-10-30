# Code-Video

Özgün bir karakter tasarlayıp videolarını kod ile üretme projesi.

- [ARASTIRMA.md](ARASTIRMA.md): Gerekli araçların araştırması ve önerilen başlangıç yığını.
- [KURALLAR.md](KURALLAR.md): Ses, senaryo, karakter ve animasyon kuralları.
- [denemeler/](denemeler/): Her deneme bir klasör (ses + notlar + çıktı video).
  - `deneme-1`: Kodla çizilmiş turuncu karakter, sesten dudak senkronu.
  - `deneme-2`: Haber sunucusu Danyal; metinle eş zamanlı çizimler, alt bant ve kayan yazı.
- [video/](video/): Remotion projesi (karakter, sahne, ses analizi, render betiği).

## Video üretmek

Gereksinimler: Node.js 18+, Python 3 (numpy, pillow, scipy), FFmpeg.

```bash
cd video && npm install
```

```bash
npm run render -- deneme-1
```

Betik `denemeler/deneme-1/ses.mp3` dosyasını analiz eder ve `denemeler/deneme-1/deneme-1.mp4`
dosyasını üretir. Klasörde `sahneler.json` varsa haber formatı üretilir (bkz. KURALLAR.md §6). Canlı önizleme için `npm run studio` (önce bir kez render çalıştırılmış olmalı).
