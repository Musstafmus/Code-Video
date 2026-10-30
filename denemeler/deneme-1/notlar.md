# Deneme 1

- **Ses:** ElevenLabs, *Orçun Togan – Engaging and Warm* (PVC). Orijinal dosya adı:
  `ElevenLabs_2026-10-30T14_19_58_Orcun_Togan_-_Engaging_and_Warm_pvc_s50_m2.mp3`
- **Süre:** 33,6 sn, MP3 128 kbps, 44,1 kHz mono
- **Çıktı:** `deneme-1.mp4` (1080×1920, 30 fps, 34,8 sn)
- **Analiz:** 9 konuşma bölümü, 26 vurgu anı

## Yapılanlar

- Karakter SVG olarak kodla çizildi (`video/src/character/`). Rive dosyası olmadığı için bu
  aşamada Rive yerine kod tabanlı çizim kullanıldı; aynı parametreler ileride bir Rive rig'ine
  bağlanabilir.
- Dudak senkronu sesten çıkarıldı: enerji → ağız açıklığı, frekans dağılımı → yuvarlak/geniş ağız,
  yüksek frekans → dişler ("s, ş, z").
- Göz kırpma, kaş kaldırma, gövde ezilip esnemesi, kol jestleri, nefes ve yaprak salınımı eklendi.

## Sınırlamalar

- Metin olmadığı için **altyazı yok**.
- Konuşma tanıma kullanılamadı (bulut ortamında model indirme engelli). Bu yüzden "m, b, p"
  gibi dudakların kapandığı sesler bazen kaçabilir.

## Sonraki deneme için

- Söylenen metni `metin.txt` olarak ekleyin → altyazı + metne dayalı dudak senkronu.
- Cümle aralarındaki duraklamalar biraz daha uzun olabilir (bkz. KURALLAR.md §1).
