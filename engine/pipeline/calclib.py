"""Helpers for per-video calc modules (videos/<id>/calc_video.py).

A calc module defines:
    def compute(c: Calc) -> None          # required: put() every number, check() sanity, card() Math Cards
    def comparisons(val, facts) -> list   # optional: [(beat_id, phrase_in_text, bool), ...] for factcheck
    WHITELIST = {"5": "why this bare number is safe"}   # optional: label-like numbers (e.g. "Category 5")
"""
from __future__ import annotations

import math


class CheckFailed(Exception):
    pass


def sig(x: float, n: int = 3) -> float:
    if x == 0:
        return 0.0
    return round(x, -int(math.floor(math.log10(abs(x)))) + (n - 1))


def fmt(x: float, n: int = 3, dec: int | None = None) -> str:
    """Round to n significant figures (or fixed decimals) and add thousands separators."""
    if dec is not None:
        return f"{x:,.{dec}f}"
    v = sig(x, n)
    if abs(v) >= 100 or v == int(v):
        return f"{int(round(v)):,}"
    d = max(0, n - 1 - int(math.floor(math.log10(abs(v)))))
    return f"{v:,.{d}f}"


class Calc:
    def __init__(self, research: dict):
        self.research = research
        self.F = {k: v["value"] for k, v in research["facts"].items()}
        self.cities = research.get("cities", {})
        self.values: dict[str, dict] = {}
        self.cards: dict[str, dict] = {}
        self.checks: list[dict] = []
        self.extra: dict = {}  # free-form data for scenes (e.g. chart series); exposed as data.extra

    def put(self, key, value, unit, display, derivation, facts=()):
        for f in facts:
            if f not in self.F:
                raise CheckFailed(f"{key}: unknown fact {f}")
        self.values[key] = {"value": value, "unit": unit, "display": display,
                            "derivation": derivation, "facts": list(facts)}
        return value

    def check(self, name, cond):
        self.checks.append({"check": name, "pass": bool(cond)})
        if not cond:
            raise CheckFailed(name)

    def card(self, cid, title, formula, sub, result, note="", src=""):
        self.cards[cid] = {"title": title, "formula": formula, "sub": sub, "result": result, "note": note, "src": src}

    @property
    def V(self) -> dict[str, str]:
        return {k: v["display"] for k, v in self.values.items()}
