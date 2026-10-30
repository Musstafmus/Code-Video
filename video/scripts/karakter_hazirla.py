"""Karakter görselini hareket ettirilebilir katmanlara ayırır.

Girdi: deneme klasöründeki karakter.json (yüz parçalarının konumları) ve görsel.
Çıktı (hepsi görselle aynı boyutta, şeffaf PNG):
  govde.png  arka planı silinmiş; kaşlar, gözler, bıyık+ağız ve alt dudak ten rengiyle boyanmış
  kas-0.png, kas-1.png  kaşlar
  biyik.png  ağız açıklığı kesilmiş bıyık

Kullanım: python3 karakter_hazirla.py <deneme klasörü> <çıktı klasörü>
Gereksinimler: numpy, pillow, scipy
"""

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

DARK = 150


def luminance(rgb):
    return rgb @ np.array([0.299, 0.587, 0.114])


def box_mask(shape, box):
    x0, y0, x1, y1 = box
    m = np.zeros(shape, dtype=bool)
    m[y0:y1, x0:x1] = True
    return m


def dark_layer(lum, mask, skin_lum):
    """Ten üzerindeki koyu çizimi, kenarları yumuşak siyah bir katmana çevirir."""
    alpha = np.clip((skin_lum - lum) / (skin_lum - 10), 0, 1) * mask
    out = np.zeros(lum.shape + (4,), dtype=np.uint8)
    out[..., 3] = (alpha * 255).astype(np.uint8)
    return out


def components_in_box(mask, box, keep):
    labels, n = ndimage.label(mask & box_mask(mask.shape, box))
    out = np.zeros_like(mask)
    for i in range(1, n + 1):
        comp = labels == i
        if keep(comp):
            out |= comp
    return out


def main():
    deneme, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
    rig = json.loads((deneme / "karakter.json").read_text(encoding="utf-8"))
    out_dir.mkdir(parents=True, exist_ok=True)

    rgb = np.asarray(Image.open(deneme / rig["gorsel"]).convert("RGB")).astype(float)
    h, w, _ = rgb.shape
    lum = luminance(rgb)
    skin = np.array(rig["ten"], dtype=float)
    skin_lum = luminance(skin)
    dark = lum < DARK

    # Arka plan: kenarlara bağlı beyaz bölgeler.
    whiteish = rgb.min(axis=2) >= 246
    labels, _ = ndimage.label(whiteish)
    border = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    background = np.isin(labels, border[border > 0])
    alpha = np.where(background, 0.0, 1.0)
    fringe = ndimage.binary_dilation(background, iterations=2) & ~background
    alpha[fringe] = np.clip(1 - lum[fringe] / 255, 0, 1)
    rgb[fringe] = 0

    paint = np.zeros((h, w), dtype=bool)

    for i, box in enumerate(rig["kaslar"]):
        brow = components_in_box(dark, box, lambda c: c.sum() > 300)
        brow = ndimage.binary_dilation(brow, iterations=2)
        Image.fromarray(dark_layer(lum, brow, skin_lum)).save(out_dir / f"kas-{i}.png")
        paint |= ndimage.binary_dilation(brow, iterations=1)

    yy, xx = np.mgrid[0:h, 0:w]
    for eye in rig["gozler"]:
        (cx, cy), (rx, ry) = eye["merkez"], eye["yaricap"]
        paint |= ((xx - cx) / (rx + 5)) ** 2 + ((yy - cy) / (ry + 5)) ** 2 <= 1

    m = rig["biyik"]
    tongue = (rgb[..., 0] > 180) & (rgb[..., 1] < 160) & box_mask((h, w), m["kutu"])
    blob = components_in_box(dark | tongue, m["kutu"], lambda c: c.sum() > 200 and np.argwhere(c)[:, 0].min() < 790)
    blob = ndimage.binary_dilation(blob, iterations=2)
    x0, x1 = m["kesim"]["x"]
    mouth_cut = (xx >= x0) & (xx <= x1) & (yy > m["kesim"]["y"])
    mustache = blob & ~mouth_cut & ~tongue
    Image.fromarray(dark_layer(lum, mustache, skin_lum)).save(out_dir / "biyik.png")
    # Bıyığın üst kısmı burunla birleşik; orayı tabanda bırakıyoruz ki burun silinmesin.
    paint |= ndimage.binary_dilation(blob, iterations=2) & (yy >= m["boyaBaslangicY"])

    lip = components_in_box(dark, rig["altDudak"]["kutu"], lambda c: c.sum() > 50)
    paint |= ndimage.binary_dilation(lip, iterations=3)

    paint &= ~background
    rgb[paint] = skin
    base = np.dstack([rgb, alpha * 255]).astype(np.uint8)
    Image.fromarray(base).save(out_dir / "govde.png", optimize=True)
    print(f"Katmanlar hazır: {out_dir}")


if __name__ == "__main__":
    main()
