# Kod ile Karakter Videoları — Araç Araştırması

> Hedef: Kendimize ait, akılda kalıcı (meşhur olabilecek) bir karakter tasarlamak ve bu karakterin
> videolarını **kod ile**, tekrarlanabilir ve otomatikleştirilebilir şekilde üretmek.
>
> Tarih: Ekim 2026. Sürüm/fiyat bilgileri hızlı değişiyor; karar vermeden önce resmî sayfalardan
> doğrulayın. "Doğrulanmadı" notu olan maddeler web araştırmasında teyit edilemeyen, genel bilgiye
> dayanan maddelerdir.

---

## 1. Üretim hattı (pipeline)

```
 Senaryo ──► Karakter tasarımı ──► Rig + animasyon ──► Ses (TTS) ──► Dudak senkronu
 (metin/JSON)   (çizim / AI)        (Rive / Lottie)     (Türkçe)      (viseme zamanlaması)
                                                                            │
     Yayın ◄── Render (MP4) ◄── Sahne kompozisyonu (kod: Remotion vb.) ◄────┘
```

Her aşama bir araç kategorisine karşılık geliyor. Aşağıda her kategori için seçenekler ve önerimiz var.

## 2. Temel karar: Karakter hangi teknikle hareket edecek?

| Yaklaşım | Nasıl | Artısı | Eksisi |
|---|---|---|---|
| **A. 2D vektör rig + kod** (önerilen) | Karakter bir kez çizilip riglenir (Rive/Lottie), sahneler kodla kurulur | Karakter her videoda **birebir aynı**; ucuz, hızlı render; tamamen otomatikleşir | Başta tasarım/rig emeği gerekir |
| B. 3D (Blender + Python) | Model + rig, sahneler `bpy` ile kurulur | Sinematik görüntü | Öğrenme eğrisi yüksek, render yavaş/pahalı |
| C. Üretken AI video (Veo, Kling, Runway) | Prompt + referans görselle klip üretilir | Çok hızlı başlangıç, gerçekçi görüntü | Karakter tutarlılığı garanti değil, klip başına 5–15 sn sınırı, klip başına ücret |

**Öneri:** Meşhur karakterlerin (maskotların) gücü tutarlılıktan gelir: aynı silüet, aynı renkler,
aynı mimikler. Bu yüzden ana hat olarak **A** seçilmeli; **C** gerekirse ara sahne/arka plan için
yardımcı olarak kullanılabilir.

## 3. Araçlar (kategori bazında)

### 3.1 Video kompozisyonu: kodla video yazma

| Araç | Dil | Lisans | Ne zaman |
|---|---|---|---|
| **Remotion** ⭐ | React / TypeScript | Kaynağı açık ama **ticari lisanslı**: bireyler ve en fazla 3 çalışanlı şirketler ücretsiz, daha büyük şirketler ücretli | Veriyle beslenen, toplu (batch) video; şablon + JSON → MP4. Rive ve Lottie için resmî paketleri var. Lambda/Cloud Run ile sunucusuz render |
| Motion Canvas | TypeScript | MIT (tamamen açık kaynak) | Elle zamanlanmış, anlatım tarzı animasyonlar; tek `<canvas>` üzerinde çalışır |
| Revideo | TypeScript | MIT | Motion Canvas çatalı, API ile render odaklı. Bakım durumu belirsiz; kullanmadan önce GitHub aktivitesine bakın |
| Manim (Community) | Python | MIT | Matematik/bilim anlatımı; karakter animasyonu için uygun değil |
| FFmpeg | CLI | LGPL/GPL | Her yöntemde son aşama: birleştirme, ses miksajı, altyazı gömme, format dönüştürme (ortamda 6.1.1 kurulu) |

**Öneri: Remotion.** Rive/Lottie entegrasyonu (`@remotion/rive`, `@remotion/lottie`), ses ve
altyazı desteği, parametrik şablonlar (aynı şablon + farklı senaryo = yeni video) tam ihtiyacımıza
uyuyor. Remotion'da tüm animasyonlar `useCurrentFrame()` ile kareye bağlı olmalıdır; bu yüzden
üçüncü parti animasyonlar resmî entegrasyon paketleriyle kullanılmalı.
Ekibimiz 3 kişiyi geçerse veya şirket olarak kullanırsak lisans ücreti çıkıyor (Remotion 5.0 ile
lisans şartlarının değişeceği duyurulmuş).

### 3.2 Karakter tasarımı

| Araç | Amaç | Not |
|---|---|---|
| Figma / Inkscape / Affinity Designer | Vektör çizim (SVG) | Rive/Lottie'ye aktarılacak parçaları (kafa, göz, ağız, kollar) **ayrı katmanlarda** çizin |
| AI görsel üretimi (Flux 2, Nano Banana Pro, Midjourney vb.) | Fikir/konsept keşfi | Konsepti AI ile keşfedip temiz vektörü elle çizmek en iyi sonuç verir |
| Karakter sayfası (turnaround) | Tutarlılık | Önden/yandan/arkadan görünüş + ifade sayfası; tüm üretimlerde referans olarak kullanılır |
| LoRA eğitimi / Flux Kontext | AI ile tutarlı görsel | Seri halinde AI görsel gerekecekse: az görsel için referans görsel, 15+ görsel/devamlı seri için özel LoRA öneriliyor. Kontext daha çok mevcut görseli düzenlemek (kıyafet, aksesuar) için |

### 3.3 Rig ve animasyon

| Araç | Lisans | Neden |
|---|---|---|
| **Rive** ⭐ | Editör freemium, runtime'lar açık kaynak | Kemik (bone) rig + **State Machine**: karakter kodla `idle`, `talking`, `happy` gibi durumlara ve girdilere (Boolean/Number/Trigger) tepki verir. Tek dosya web, iOS, Android, Flutter, Unity, Unreal'da çalışır. Duolingo karakterleri bu yöntemle ağız şekli (viseme) animasyonu yapıyor |
| Lottie (After Effects + Bodymovin) | Açık format | After Effects bilen tasarımcı varsa. Sabit animasyon klipleri için iyi; etkileşim/durum makinesi zayıf |
| Spine | Ücretli | Oyun dünyasında standart 2D iskelet animasyonu; Rhubarb entegrasyonu var |
| Live2D Cubism | Ücretli (küçük ölçek için ücretsiz katman) | VTuber tarzı "canlı" yüz hareketleri (doğrulanmadı: güncel lisans şartları) |
| Blender (Grease Pencil / 3D) + Python `bpy` | GPL | B yolunu seçersek. LipKit eklentisi sesten otomatik dudak animasyonu üretiyor (ortamda kurulu değil) |

**Öneri: Rive.** Karakteri bir kez riglemek; sonra kod tarafında yalnızca "şu karede şu ifade, şu
ağız şekli" demek yeterli. Bu, sınırsız sayıda video üretmeyi mümkün kılar.

### 3.4 Ses: Türkçe metinden konuşmaya (TTS)

| Araç | Tür | Not |
|---|---|---|
| **ElevenLabs** ⭐ | Bulut API | İstanbul ağzı Türkçe sesler, ses tasarımı/klonlama; karakter başına imza bir ses oluşturmak için en güçlü seçenek. Karakter başına ücret, ücretsiz katman ayda 10.000 karakter |
| Pocket TTS Turkish | Açık kaynak, yerel | 2026'da çıktı; tek CPU çekirdeğinde gerçek zamandan hızlı, birkaç saniyelik sesle klonlama, duygu etiketleri |
| Piper (`tr_TR-dfki`) | Açık kaynak (MIT), yerel | Çok hafif ve hızlı ama tek Türkçe sesi var ve doğallığı sınırlı; taslak/test için ideal |
| XTTS-v2 topluluk ince ayarları | Açık ağırlık | Türkçe ince ayarları var ama bazıları **ticari olmayan** lisanslı (CC-BY-NC-SA); lisansı tek tek kontrol edin |
| Karakterin kendi seslendirmeni | İnsan | Ünlü maskotlar çoğunlukla tanınabilir bir sese sahiptir; bütçe varsa en ayırt edici seçenek |

**Öneri:** Geliştirme sırasında Piper (ücretsiz, hızlı), yayın kalitesinde ElevenLabs. Ses
sağlayıcısını kodda soyut bir arayüzün arkasına koyun ki sonradan değiştirilebilsin.

### 3.5 Dudak senkronu (lip-sync)

Amaç: ses dosyasından "hangi milisaniyede hangi ağız şekli" listesini (viseme zaman çizelgesi)
çıkarıp Rive state machine'e beslemek.

| Araç | Not |
|---|---|
| **Rhubarb Lip Sync** ⭐ | CLI; ses → JSON/TSV ağız şekli listesi (A–H + X şekilleri). Varsayılan tanıyıcısı (PocketSphinx) yalnızca İngilizce; Türkçe için dilden bağımsız `phonetic` tanıyıcısı kullanılmalı (doğrulanmadı: sürüm 1.10+ gerektirir). Son güncelleme Ekim 2025, bakımı yavaş |
| Whisper / faster-whisper / WhisperX | Türkçe konuşmayı kelime düzeyinde zaman damgasıyla metne döker. **Türkçe yazımı büyük ölçüde fonetik** olduğu için harf → viseme eşlemesi basit bir tabloyla yapılabilir; TTS'e verdiğimiz metni zaten bildiğimiz için bu yöntem güvenilir |
| Montreal Forced Aligner | Bilinen metni sese fonem düzeyinde hizalar; Türkçe modeli mevcut (doğrulanmadı: güncel model sürümü) |
| ElevenLabs zaman damgaları | ElevenLabs'ın zaman damgalı TTS uç noktası karakter düzeyinde zamanlama döndürür; ayrı hizalama adımına gerek kalmayabilir (doğrulanmadı: güncel API adı) |

**Öneri:** Önce Rhubarb (`phonetic`) ile başlayın; Türkçe sonuç zayıfsa
"TTS zaman damgası veya WhisperX + Türkçe harf→viseme tablosu" yaklaşımına geçin.

### 3.6 Üretken AI video (yardımcı, opsiyonel)

| Araç | Not |
|---|---|
| Google Veo 3.1 | Gemini API / Vertex AI üzerinden; dahili ses ve dudak senkronu, referans görselle üretimde 8 sn sınırı |
| Kling (3.0 / Avatar) | Diyalog ve dudak senkronunda güçlü, saniye başına ücret |
| Runway Act-Two | Bir oyuncunun performansını karaktere aktarır (mimik/hareket yakalama) |

Bu araçlar arka plan, geçiş sahnesi veya "karakter gerçek dünyada" gibi özel bölümler için
kullanılabilir. Ayrı üretimler arasında karakter sürekliliği garanti değildir.

### 3.7 Otomasyon ve yayın

| Araç | Not |
|---|---|
| Senaryo üretimi için LLM (ör. Claude API) | Konu → senaryo → yapılandırılmış JSON (sahne, replik, ifade, süre). Remotion şablonu bu JSON'u okur |
| Node.js 22 / Python 3.13 | Ortamda kurulu; orkestrasyon betikleri için yeterli |
| YouTube Data API v3, TikTok Content Posting API, Instagram Graph API | Otomatik yükleme (doğrulanmadı: güncel kota ve onay süreçleri) |
| GitHub Actions | Senaryo dosyası push edildiğinde otomatik render |

## 4. Önerilen başlangıç yığını (MVP)

| Katman | Seçim |
|---|---|
| Karakter çizimi | Figma veya Inkscape (vektör, katmanlı) |
| Rig + ifadeler | Rive (state machine: `mood`, `talking`, `viseme` girdileri) |
| Video kompozisyonu | Remotion + `@remotion/rive` |
| Ses | Piper (geliştirme) → ElevenLabs (yayın) |
| Dudak senkronu | Rhubarb Lip Sync (`phonetic`) |
| Son işlem | FFmpeg |
| Senaryo | JSON şeması + isteğe bağlı LLM ile üretim |
| Format | Dikey 1080×1920 (Shorts/Reels/TikTok) + yatay 1920×1080 |

Örnek senaryo dosyası (taslak):

```json
{
  "title": "Bölüm 1",
  "format": "vertical",
  "scenes": [
    { "background": "oda", "mood": "happy",   "line": "Merhaba! Bugün sana bir sır vereceğim." },
    { "background": "oda", "mood": "curious", "line": "Biliyor muydun, ahtapotların üç kalbi var?" }
  ]
}
```

Akış: `senaryo.json` → TTS ile her replik için `.wav` → Rhubarb ile `.json` viseme listesi →
Remotion sahneleri (Rive karakter + arka plan + altyazı) → `npx remotion render` → MP4.

## 5. Karakteri "meşhur" yapacak unsurlar (kısa not)

Araçlardan bağımsız ama tasarım kararlarını etkiliyor:

- **Silüet testi:** Siyaha boyandığında bile tanınabilmeli. Basit, net şekiller.
- **Sınırlı renk paleti:** 2–3 ana renk; küçük ekranda (telefon) okunabilir.
- **Abartılı, okunaklı ifadeler:** Rig'de 6–8 temel ifade (mutlu, şaşkın, kızgın, üzgün, düşünceli…).
- **İmza ses ve söz:** Tanınır bir ses tonu, tekrar eden bir giriş/kapanış cümlesi.
- **Düzenli seri formatı:** Aynı süre, aynı yapı, düzenli yayın. Kod tabanlı üretimin asıl avantajı burada.

## 6. Hukuki ve lisans notları

- **Mevcut ünlü karakterler** (Disney, anime vb.) telif ve marka korumalıdır; onları ya da
  "isim değiştirilmiş kopyalarını" kullanmak ihlal riski taşır. Karakter **özgün** olmalı.
- AI ile konsept üretirken başka bir karaktere aşırı benzeyen çıktıları elemeyi unutmayın.
- **Remotion:** 3 çalışanı aşan şirketler için ücretli lisans gerekir.
- **Ses klonlama:** Gerçek bir kişinin sesini yalnızca yazılı izniyle klonlayın.
- **TTS/model lisansları:** Açık modellerin bir kısmı ticari kullanıma kapalıdır (ör. CC-BY-NC).
- **Platform kuralları:** YouTube ve diğer platformlar gerçekçi sentetik/AI içerik için etiketleme
  istiyor; animasyon karakterler genelde kapsam dışı ama gerçekçi AI video kullanılırsa bildirin.

## 7. Sonraki adımlar

1. Karakter konseptini netleştirmek (isim, kişilik, hedef kitle, ses) ve karakter sayfasını çizmek.
2. Remotion projesi iskeletini bu depoya kurmak (`npx create-video@latest`).
3. Basit bir Rive rig'i (göz kırpma + 9 ağız şekli) ile uçtan uca ilk 15 saniyelik test videosunu üretmek.
4. Türkçe dudak senkronu kalitesini test edip Rhubarb ile alternatif yöntemi karşılaştırmak.
5. Senaryo JSON → MP4 akışını tek komuta indirmek; ardından toplu üretim ve otomatik yayın.

---

## Kaynaklar

- Remotion lisans: [remotion.dev/docs/license](https://remotion.dev/docs/license), [fiyatlandırma](https://www.remotion.dev/docs/license/pricing), [LICENSE.md](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md), [şartlar](https://www.remotion.dev/terms)
- Remotion üçüncü parti entegrasyonlar: [remotion.dev/docs/third-party](https://www.remotion.dev/docs/third-party), [Rive paketi](https://remotion.dev/rive)
- Remotion ve Motion Canvas karşılaştırması: [remotion.dev/docs/compare/motion-canvas](https://www.remotion.dev/docs/compare/motion-canvas), [beginnersinai.org](https://beginnersinai.org/remotion-vs-motion-canvas-vs-manim/), [pkgpulse](https://www.pkgpulse.com/guides/remotion-vs-motion-canvas-vs-revideo-programmatic-video-2026)
- Revideo: [docs.re.video](https://docs.re.video/)
- Rive: [rive.app/use-cases/character-animation](https://rive.app/use-cases/character-animation), [Duolingo viseme yazısı](https://blog.duolingo.com/world-character-visemes), [Rive Lottie içe aktarma](https://rive.app/docs/editor/assets/lottie.md)
- Rhubarb Lip Sync: [GitHub](https://gittrend.io/repo/DanielSWolf/rhubarb-lip-sync), [Godot entegrasyonu](https://www.github.com/AniMesuro/rhubarb-lipsync-tp-integration-godot); LipKit: [dev.to](https://dev.to/codeideal/auto-lip-sync-inside-blender-5-2026-for-3d-2d-287g)
- Türkçe TTS: [ElevenLabs Türkçe](https://elevenlabs.io/text-to-speech/turkish), [Pocket TTS Turkish](https://huggingface.co/wite-tech/pocket-tts-turkish), [Açık kaynak Türkçe TTS araştırması](https://danielquillanroxas.github.io/turkish-tts-survey)
- Tutarlı karakter üretimi: [rangy.ai](https://rangy.ai/blog/ai-character-consistency), [oakgen.ai](https://oakgen.ai/blog/ai-character-consistency-guide), [martini.art](https://martini.art/en/blog/how-to-build-consistent-ai-character)
- Üretken AI video: [atlascloud.ai](https://www.atlascloud.ai/blog/guides/best-ai-video-api-photorealistic-digital-human-faces), [longstories.ai](https://longstories.ai/blog/best-ai-video-generators-for-consistent-characters), [youngju.dev karşılaştırma](https://www.youngju.dev/blog/culture/2026-05-14-ai-video-generation-2026-sora-veo-runway-pika-kling-luma-hailuo-comparison-deep-dive.en)
