# Üretim Kuralları

Videoların tutarlı ve kaliteli çıkması için uyulacak kurallar. Kod bu kurallara göre ayarlandı;
bir kuralı değiştirirsek kodu da güncelleriz (kuralın yanında ilgili dosya yazıyor).

## 1. Ses dosyası (ElevenLabs çıktısı)

Dudak senkronu doğrudan sesten hesaplanıyor (`video/scripts/analiz.py`). Sesin temizliği sonucu
doğrudan etkiler.

| Kural | Neden |
|---|---|
| **Tek konuşmacı, müzik ve efekt yok.** Müzik gerekiyorsa ayrı dosya olarak verin | Müzik ve efektler ağız hareketlerini bozar; render'da ayrıca eklenir |
| **Format:** WAV (44,1 veya 48 kHz) tercih edilir, MP3 en az 128 kbps. Mono yeterli | Sıkıştırma kayıpları "s, ş" algısını zayıflatır |
| **Başta ve sonda en fazla 0,5 sn sessizlik** | Giriş/çıkış boşluğunu kod ekliyor (`LEAD_IN`, `TAIL`) |
| **Cümle aralarında doğal duraklamalar (en az 0,3 sn)** | Karakter duraklamalarda göz kırpar ve etrafa bakar; sürekli akan ses "robot" gibi görünür |
| **Seviye normalize, kırpılma (clipping) yok** | Analiz, sesin kendi en yüksek seviyesine göre ölçekler |
| **Bir dosya = bir video**, Shorts/Reels için 15–45 sn | Dikey kısa format için ideal süre |
| **Aynı ses ve aynı ayarlar** | Karakterin sesi kimliğinin parçası. Ses: *Orçun Togan – Engaging and Warm*. Ayarları (stability, similarity, model) değiştirmeyin; değiştirirseniz deneme notuna yazın |

### Metni de verin (önemli)

Her sesle birlikte söylenen metni `metin.txt` olarak ekleyin. Metin olmadan:
- altyazı eklenemez,
- dudak senkronu yalnızca sesten tahmin edilir. Metin varsa Türkçe harf → ağız şekli eşlemesiyle
  daha doğru hale getirilebilir (Türkçe yazıldığı gibi okunduğu için bu yöntem iyi çalışır).

En iyisi: ElevenLabs'ın **zaman damgalı** (with timestamps) çıktısını almak. Bu, her harfin
hangi saniyede söylendiğini verir; hem altyazı hem dudak senkronu kusursuz olur.

## 2. Metin / senaryo yazımı

- **İlk 2 saniyede kanca:** Soru, şaşırtıcı bilgi veya merak uyandıran bir cümle.
- **Kısa cümleler:** En fazla 12–15 kelime. Konuşma dili.
- **Sayıları ve kısaltmaları yazıyla yazın:** "3" → "üç", "Dr." → "doktor", "vb." → "ve benzeri".
  TTS yanlış okuyabilir.
- **Noktalama = duraklama:** Virgül kısa, nokta uzun duraklama üretir. Vurgulamak istediğiniz
  kelimeden önce virgül koymak etkilidir.
- **İmza giriş/kapanış cümlesi:** Her videoda aynı selamlama ve veda, karakterin tanınırlığını artırır.

## 3. Klasör ve adlandırma

```
denemeler/
  deneme-N/
    ses.mp3 | ses.wav   # zorunlu
    metin.txt           # önerilen: söylenen metin
    notlar.md           # ses ayarları, gözlemler, iyileştirmeler
    deneme-N.mp4        # çıktı (render betiği üretir)
```

Üretim komutu (`video/` klasöründe):

```bash
npm run render -- deneme-N
```

## 4. Karakter kimliği (değişmez kurallar)

Meşhur karakterler tutarlılıkla tanınır. Aşağıdakiler her videoda aynı kalır:

- **Palet** `video/src/character/colors.ts` içinde sabit: turuncu gövde, yeşil yaprak, koyu
  mor-lacivert dış çizgi. Yeni renk eklemek = karakterin yeni sürümü.
- **Silüet:** Yumurta biçimli gövde + başta iki yapraklı filiz + kısa kollar ve ayaklar.
  Filiz karakterin imzasıdır, kaldırılmaz.
- **Dış çizgi kalınlığı:** 10 px (1080 genişlikte).
- **Kişilik:** Sıcak, meraklı, samimi. Kaşlar ve göz bebekleri bu kişiliği taşır; kızgın veya
  alaycı ifade yalnızca senaryo açıkça istediğinde kullanılır.
- Karakterin **adı henüz belirlenmedi.**

## 5. Animasyon kuralları (kod)

| Kural | Kod |
|---|---|
| 30 fps, 1080×1920 (9:16) | `Root.tsx` |
| Ağız sesten yaklaşık 1 kare önce şekil alır (öngörü) | `analiz.py` → `LEAD_SECONDS` |
| Ağız açılırken hızlı, kapanırken daha yavaş hareket eder | `analiz.py` → `smooth()` |
| Göz kırpma: 2,5–5 sn aralıkla ve her duraklamanın başında, aralarında en az 1 sn | `motion.ts` → `blinkSchedule()` |
| Vurgularda kaş kalkar, gövde hafifçe ezilir; kollar sırayla jest yapar | `motion.ts`, `Character.tsx` |
| Konuşurken kameraya bakar, duraklamalarda gözleri gezinir | `CharacterVideo.tsx` |
| **Karakter asla tamamen durmaz:** nefes, salınım, yaprak hareketi her zaman sürer | `Character.tsx` |
| Hareketler kare kare elle çizilmez; hepsi ses analizinden ve parametrelerden gelir | — |

## 6. Video düzeni

- **Güvenli alan:** Üst %10 ve alt %20'ye önemli öğe koymayın; platform arayüzü (başlık, butonlar,
  açıklama) bu alanları kapatır.
- **Altyazı** (metin geldiğinde): karakterin üstünde, büyük ve kalın, kelime kelime vurgulu.
  Videoların çoğu sessiz izlenir; altyazı zorunlu hale gelecek.
- **Müzik:** Konuşmanın en az 20 dB altında, ayrı dosyadan.
- Denemelerde sol üstte deneme etiketi bulunur; yayın sürümünde kaldırılır.
