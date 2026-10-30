"""Metni sese hizalar: her kelimenin hangi karede başlayıp bittiğini tahmin eder.

Konuşma tanıma modeli kullanmaz. Türkçede hece sayısı ünlü sayısına eşit olduğu
için kelimelerin süresi hece sayısından iyi tahmin edilir. Yöntem:
  1. Metin noktalama işaretlerinden parçalara bölünür.
  2. Parçalar, sesteki konuşma bölümlerine (duraklamalarla ayrılmış) dinamik
     programlama ile eşlenir: süreler hece sayısına en iyi uyacak şekilde.
  3. Her bölümün içinde kelimeler, konuşma olan karelere hece sayısına göre dağıtılır.
"""

import math
import re

VOWELS = set("aeıioöuüâîû")
ONES = ["", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz"]
TENS = ["", "on", "yirmi", "otuz", "kırk", "elli", "altmış", "yetmiş", "seksen", "doksan"]
STRIP = ".,!?:;\"“”'’()…"

# Parçaları aynı konuşma bölümüne koymanın cezası (virgül, cümle sonu) ve bir
# parçanın duraklamayla bölünmesinin cezası.
MERGE_PENALTY = {1: 0.1, 2: 0.8}
SPLIT_PENALTY = 2.5
MAX_LINE_WORDS = 6
MAX_LINE_CHARS = 34


def tr_lower(s):
    return s.replace("I", "ı").replace("İ", "i").lower()


def number_words(n):
    if n == 0:
        return "sıfır"
    parts = []
    for value, name in [(10**9, "milyar"), (10**6, "milyon"), (1000, "bin")]:
        if n >= value:
            q, n = divmod(n, value)
            if not (value == 1000 and q == 1):
                parts.append(number_words(q))
            parts.append(name)
    if n >= 100:
        q, n = divmod(n, 100)
        if q > 1:
            parts.append(ONES[q])
        parts.append("yüz")
    if n >= 10:
        parts.append(TENS[n // 10])
        n %= 10
    if n:
        parts.append(ONES[n])
    return " ".join(parts)


def spoken(core, ordinal):
    """Hece sayımı için kelimenin okunuşu (sayılar yazıya çevrilir)."""
    m = re.fullmatch(r"(\d+),(\d+)", core)
    if m:
        return f"{number_words(int(m[1]))} virgül {number_words(int(m[2]))}"
    m = re.fullmatch(r"(\d+)(['’](\w+))?", core)
    if m:
        return number_words(int(m[1])) + ("inci" if ordinal else "") + (m[3] or "")
    return core


def syllables(text):
    return max(1, sum(ch in VOWELS for ch in tr_lower(text)))


def tokenize(text):
    raw = text.split()
    tokens = []
    for i, tok in enumerate(raw):
        nxt = raw[i + 1] if i + 1 < len(raw) else ""
        ordinal = bool(re.fullmatch(r"\d+\.", tok)) and nxt[:1].islower()
        core = tok.strip(STRIP)
        if ordinal:
            brk = 0
        elif tok[-1] in ".!?:…":
            brk = 2
        elif tok[-1] in ",;":
            brk = 1
        else:
            brk = 0
        tokens.append({"text": tok, "syl": syllables(spoken(core, ordinal)), "break": brk})
    if tokens:
        tokens[-1]["break"] = 2
    return tokens


def units_of(tokens):
    units, start = [], 0
    for i, t in enumerate(tokens):
        if t["break"]:
            units.append({"words": list(range(start, i + 1)), "break": t["break"]})
            start = i + 1
    for u in units:
        u["syl"] = sum(tokens[w]["syl"] + 0.4 for w in u["words"])
    return units


def match_units(units, segments):
    """Parçaları konuşma bölümlerine eşler; [(parça aralığı, bölüm aralığı)] döner."""
    n, m = len(units), len(segments)
    seg_len = [e - s for s, e in segments]
    rate = sum(seg_len) / sum(u["syl"] for u in units)
    inf = float("inf")
    best = [[inf] * (m + 1) for _ in range(n + 1)]
    back = [[None] * (m + 1) for _ in range(n + 1)]
    best[0][0] = 0.0
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            for i0 in range(i):
                merge = sum(MERGE_PENALTY[units[k]["break"]] for k in range(i0, i - 1))
                syl = sum(u["syl"] for u in units[i0:i])
                for j0 in range(j):
                    if best[i0][j0] == inf:
                        continue
                    dur = sum(seg_len[j0:j])
                    cost = math.log(dur / (syl * rate)) ** 2 * syl + merge + SPLIT_PENALTY * (j - j0 - 1)
                    if best[i0][j0] + cost < best[i][j]:
                        best[i][j] = best[i0][j0] + cost
                        back[i][j] = (i0, j0)
    groups, i, j = [], n, m
    while i > 0:
        i0, j0 = back[i][j]
        groups.append(((i0, i), (j0, j)))
        i, j = i0, j0
    return groups[::-1]


def subtitle_lines(tokens):
    lines, current = [], []
    for i, t in enumerate(tokens):
        current.append(i)
        chars = sum(len(tokens[k]["text"]) + 1 for k in current)
        nxt = tokens[i + 1]["text"] if i + 1 < len(tokens) else ""
        too_long = len(current) >= MAX_LINE_WORDS or chars + len(nxt) > MAX_LINE_CHARS
        # Virgülde tek kelimelik satır bırakma ("1973, İstanbul." birlikte kalsın).
        ends_line = t["break"] == 2 or (t["break"] == 1 and len(current) >= 2)
        if ends_line or too_long:
            lines.append([current[0], current[-1]])
            current = []
    return lines


def align(text, is_speech, segments):
    tokens = tokenize(text)
    units = units_of(tokens)
    words = [None] * len(tokens)
    for (u0, u1), (s0, s1) in match_units(units, segments):
        frames = [f for f in range(segments[s0][0], segments[s1 - 1][1]) if is_speech[f]]
        ids = [w for u in units[u0:u1] for w in u["words"]]
        weights = [tokens[w]["syl"] + 0.4 for w in ids]
        total, acc = sum(weights), 0.0
        for w, weight in zip(ids, weights):
            a = int(acc / total * len(frames))
            acc += weight
            b = max(a + 1, int(math.ceil(acc / total * len(frames))))
            words[w] = {"text": tokens[w]["text"], "start": frames[a], "end": frames[b - 1] + 1}
    return {"words": words, "lines": subtitle_lines(tokens)}
