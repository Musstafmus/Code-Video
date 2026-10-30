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
    metin.txt           # söylenen metin (haber formatında zorunlu)
    karakter.jpg|png    # haber formatı: sunucu görseli
    karakter.json       # haber formatı: görseldeki yüz parçalarının konumları
    sahneler.json       # haber formatı: hangi kelimede hangi çizim
    notlar.md           # ses ayarları, gözlemler, iyileştirmeler
    deneme-N.mp4        # çıktı (render betiği üretir)
```

Üretim komutu (`video/` klasöründe). Klasörde `sahneler.json` varsa haber formatı, yoksa basit
karakter videosu üretilir:

```bash
npm run render -- deneme-N
```

## 4. Karakter

### Danyal (haber sunucusu, ana karakter)

- Görsel: `denemeler/deneme-2/karakter.jpg`. Bonus (afro) saç, kalın bıyık, koyu takım elbise,
  pembe-gri çizgili kravat. **Bu görünüm değişmez**; her videoda aynı görsel kullanılır.
- Kişilik: Enerjik, samimi, esprili sabah sunucusu. Açılış cümlesi: "Günaydın Türkiye!"
- Ses: *Orçun Togan – Engaging and Warm* (ElevenLabs).

### Yeni bir karakter görseli hazırlarken

Görsel, kodla hareket ettirilecek parçalara ayrılıyor (`video/scripts/karakter_hazirla.py`).
Bunun sorunsuz çalışması için:

| Kural | Neden |
|---|---|
| **Düz renkli çizim, kalın siyah dış çizgiler** | Kaş, bıyık ve gözler koyu renkten ayırt edilerek kesiliyor |
| **Düz beyaz arka plan** | Arka plan otomatik siliniyor |
| **Yüz tam önden, gözler ve kaşlar birbirinden ve saçtan ayrı** | Parçalar birbirine değerse birlikte kesilir |
| **Göz basit siyah nokta veya oval** | Göz kırpma ve bakış kodla yeniden çiziliyor |
| **Ağız bıyığın altında veya açıkça görünür, tek parça** | Ağız silinip yerine kodla açılıp kapanan ağız çiziliyor |
| **En az 1000 px genişlik, dikey kadraj, bel hizasına kadar** | Sunucu masanın arkasında göğüsten yukarısı görünüyor |

Yeni görselde `karakter.json` içindeki kutuları (kaşlar, gözler, bıyık, ağız, alt dudak)
görsele göre güncelleyin.

### Turuncu filiz karakter (deneme 1)

Kodla çizilmiş ilk deneme karakteri. Paleti `video/src/character/colors.ts` içinde.

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
| Haber sunucusu: kaşlar vurguda kalkar, başla hafifçe onaylar, gözler konuşurken kameraya bakar | `news/Anchor.tsx` |

## 6. Haber formatı: metinle eş zamanlı çizimler

- Her konu için ekranda bir çizim olur; çizim, konunun **ilk kelimesi söylendiği anda** (4 kare
  önce) gelir. Sahne içindeki ek animasyonlar da kendi kelimelerine bağlanır (ör. "asfaltla"
  denince köprünün yolu döşenir). Bunlar `sahneler.json` içinde tanımlanır.
- Yeni bir konu için yeni bir çizim bileşeni yazılır (`video/src/news/visuals/`) ve
  `visuals/index.ts`'e eklenir.
- `metin.txt`, ElevenLabs'a verilen metnin **birebir aynısı** olmalı. Rakamlar sorun değil
  (hizalama "1973"ü "bin dokuz yüz yetmiş üç" diye sayar), ama metin sesle uyuşmazsa çizimler kayar.
- **Gerçek kişileri çizmeyin** (karikatür dahil). Haberde geçen kişiler yazıyla belirtilir.
- **Şirket logoları ve bayraklar kullanılmaz;** şirket adı düz yazıyla yazılır. Bayrak gerekiyorsa
  resmî ölçülerine göre çizilmeli ve kontrol edilmelidir.
- Grafikler temsili ise (ör. borsa çizgisi) gerçek değer gibi sayı eklemeyin.
- Kayan yazı (son dakika bandı) haberlerin kısa özetidir; metinde olmayan bilgi eklemeyin.

## 7. Video düzeni

- **Güvenli alan:** Üst %10 ve alt %20'ye önemli öğe koymayın; platform arayüzü (başlık, butonlar,
  açıklama) bu alanları kapatır.
- **Altyazı:** Alt bantta, büyük ve kalın; söylenen kelime sarı vurgulu. Satır başına en fazla
  6 kelime / 34 karakter (`hizala.py`). Videoların çoğu sessiz izlenir, altyazı zorunludur.
- **Müzik:** Konuşmanın en az 20 dB altında, ayrı dosyadan.
- Denemelerde deneme etiketi bulunur (haber formatında üst barın sağında); yayın sürümünde kaldırılır.
