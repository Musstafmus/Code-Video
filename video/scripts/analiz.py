"""Ses dosyasından kare bazında dudak senkronu verisi üretir.

Konuşma tanıma modeli kullanmaz: sesin enerjisinden ağız açıklığını, frekans
dağılımından ağzın yuvarlak/geniş olmasını ve "s, ş, z" gibi sürtünmeli
seslerde dişlerin görünmesini tahmin eder. Ayrıca vurgu anlarını (kaş kaldırma,
baş sallama için) ve konuşma bölümlerini (göz kırpma için) çıkarır.

Kullanım: python3 analiz.py <ses dosyası> <çıktı.json> [--fps 30]
Gereksinimler: numpy, ffmpeg
"""

import argparse
import json
import subprocess

import numpy as np

SAMPLE_RATE = 22050
N_FFT = 1024
RMS_WINDOW = 640
# Ağız, sesten biraz önce şekil almalı (animasyondaki "öngörü" kuralı).
LEAD_SECONDS = 0.035


def load_audio(path):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SAMPLE_RATE), "-f", "f32le", "-"],
        check=True,
        capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32)


def frame_spectra(samples, fps):
    hop = SAMPLE_RATE / fps
    n_frames = int(np.ceil(len(samples) / hop))
    padded = np.pad(samples, (N_FFT, N_FFT))
    window = np.hanning(N_FFT)
    rms = np.zeros(n_frames)
    spectra = np.zeros((n_frames, N_FFT // 2 + 1))
    for i in range(n_frames):
        center = int(i * hop) + N_FFT
        chunk = padded[center - N_FFT // 2 : center + N_FFT // 2]
        # Enerji için daha kısa pencere: heceler arası kapanmaları kaçırmamak için.
        short = chunk[N_FFT // 2 - RMS_WINDOW // 2 : N_FFT // 2 + RMS_WINDOW // 2]
        rms[i] = np.sqrt(np.mean(short**2))
        spectra[i] = np.abs(np.fft.rfft(chunk * window)) ** 2
    return rms, spectra


def band(spectra, freqs, lo, hi):
    mask = (freqs >= lo) & (freqs < hi)
    return spectra[:, mask].sum(axis=1)


def normalize(values, lo, hi):
    return np.clip((values - lo) / max(hi - lo, 1e-9), 0.0, 1.0)


def smooth(values, attack, release):
    """Tek kutuplu yumuşatma: açılırken hızlı, kapanırken daha yavaş."""
    out = np.zeros_like(values)
    prev = 0.0
    for i, v in enumerate(values):
        alpha = attack if v > prev else release
        prev = prev + alpha * (v - prev)
        out[i] = prev
    return out


def speech_segments(is_speech, fps, min_gap=0.25, min_len=0.12):
    segments = []
    start = None
    for i, s in enumerate(is_speech):
        if s and start is None:
            start = i
        elif not s and start is not None:
            segments.append([start, i])
            start = None
    if start is not None:
        segments.append([start, len(is_speech)])

    merged = []
    for seg in segments:
        if merged and seg[0] - merged[-1][1] < min_gap * fps:
            merged[-1][1] = seg[1]
        else:
            merged.append(seg)
    return [s for s in merged if s[1] - s[0] >= min_len * fps]


def accents(db, is_speech, fps, min_distance=0.7):
    """Enerjinin hızlı yükseldiği anlar: hece/kelime vurguları."""
    rise = np.diff(smooth(db, 0.5, 0.5), prepend=db[0])
    candidates = np.where(is_speech & (rise > np.percentile(rise[is_speech], 92)))[0]
    picked = []
    for i in candidates:
        if not picked or i - picked[-1] >= min_distance * fps:
            picked.append(int(i))
    return picked


def analyze(path, fps):
    samples = load_audio(path)
    rms, spectra = frame_spectra(samples, fps)
    freqs = np.fft.rfftfreq(N_FFT, 1 / SAMPLE_RATE)

    db = 20 * np.log10(rms + 1e-7)
    # Eşikler en yüksek seviyeye göre: TTS çıktısında sessizlik neredeyse dijital sıfır
    # olduğundan gürültü tabanı güvenilir bir referans değil.
    peak = np.percentile(db, 98)
    is_speech = db > peak - 30

    low = band(spectra, freqs, 150, 900)
    mid = band(spectra, freqs, 900, 2800)
    high = band(spectra, freqs, 3500, 10000)
    total = low + mid + high + 1e-12

    voiced = freqs[(freqs >= 200) & (freqs < 4000)]
    voiced_spec = spectra[:, (freqs >= 200) & (freqs < 4000)]
    centroid = (voiced_spec * voiced).sum(axis=1) / (voiced_spec.sum(axis=1) + 1e-12)

    speech_centroid = centroid[is_speech]
    roundness = 1 - normalize(centroid, *np.percentile(speech_centroid, [10, 90]))
    sibilance = normalize(high / total, 0.15, 0.6)

    loudness = normalize(db, *np.percentile(db[is_speech], [15, 97]))
    openness = loudness**1.4 * (1 - 0.6 * sibilance)
    openness[~is_speech] = 0

    open_s = smooth(openness, 0.7, 0.5)
    round_s = smooth(np.where(is_speech, roundness, 0.3), 0.35, 0.35)
    teeth_s = smooth(np.where(is_speech, sibilance, 0), 0.5, 0.35)
    energy_s = smooth(loudness * is_speech, 0.15, 0.06)

    lead = int(round(LEAD_SECONDS * fps))
    shift = lambda a: np.concatenate([a[lead:], np.repeat(a[-1:], lead)]) if lead else a

    r = lambda a: [round(float(x), 3) for x in a]
    return {
        "fps": fps,
        "durationInFrames": len(rms),
        "durationSeconds": round(len(samples) / SAMPLE_RATE, 3),
        "frames": {
            "open": r(shift(open_s)),
            "round": r(shift(round_s)),
            "teeth": r(shift(teeth_s)),
            "energy": r(energy_s),
        },
        "accents": accents(db, is_speech, fps),
        "speech": speech_segments(is_speech, fps),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("audio")
    parser.add_argument("output")
    parser.add_argument("--fps", type=int, default=30)
    args = parser.parse_args()

    result = analyze(args.audio, args.fps)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(result, f, separators=(",", ":"))

    speech_frames = sum(e - s for s, e in result["speech"])
    print(
        f"{result['durationSeconds']} sn, {result['durationInFrames']} kare, "
        f"{len(result['speech'])} konuşma bölümü ({speech_frames / args.fps:.1f} sn), "
        f"{len(result['accents'])} vurgu"
    )


if __name__ == "__main__":
    main()
