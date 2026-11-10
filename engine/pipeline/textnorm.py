"""Turn on-screen narration text into TTS-friendly spoken English (numbers -> words)."""
from __future__ import annotations

import re

from num2words import num2words

SUP = str.maketrans("⁰¹²³⁴⁵⁶⁷⁸⁹⁻", "0123456789-")


def _ordinal_exp(n: int) -> str:
    return num2words(n, to="ordinal")


def _num(tok: str) -> str:
    clean = tok.replace(",", "")
    if re.fullmatch(r"(19|20)\d\d", tok):  # bare 4-digit years (no comma) -> "nineteen seventy-two"
        return num2words(int(tok), to="year")
    if "." in clean:
        whole, frac = clean.split(".")
        w = num2words(int(whole)) if whole else "zero"
        return f"{w} point " + " ".join(num2words(int(d)) for d in frac)
    return num2words(int(clean))


def spoken(text: str) -> str:
    t = text
    # scientific notation "3.7 × 10²³" -> "3.7 times ten to the twenty-third"
    t = re.sub(r"(\d[\d.,]*)\s*×\s*10([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)",
               lambda m: f"{m.group(1)} times ten to the {_ordinal_exp(int(m.group(2).translate(SUP)))}", t)
    t = t.replace("≈", "about ").replace("×", " times ").replace("%", " percent")
    t = re.sub(r"(\d)-hour", lambda m: m.group(1) + " hour", t)
    t = re.sub(r"(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?", lambda m: _num(m.group(0)).replace(",", ""), t)
    t = t.replace(" - ", ", ").replace("—", ", ")
    t = re.sub(r"\s+", " ", t).strip()
    return t


def spoken_word_count(text: str) -> int:
    return len(spoken(text).split())


if __name__ == "__main__":
    for s in ["about 3.7 × 10²³ joules", "since 1972, 27 leap seconds", "Mach 1.37 and 1,670 km",
              "the 24-hour day", "5,000 kilometers in 7.3 hours"]:
        print(s, "->", spoken(s))
