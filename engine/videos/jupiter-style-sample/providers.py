#!/usr/bin/env python3
"""Footage providers for the sample (prototype of a shared `pipeline/footage.py`).

One small interface, three free sources. Every download is recorded with its provenance (provider,
id, landing page, creator credit, licence note) so the video description and the credits file can be
generated, and every file is validated (ffprobe: real video/image, expected size) before use.

  NasaImages   images-api.nasa.gov search / asset manifests (no key). Public domain unless the item's
               metadata says otherwise; items whose text mentions a copyright or a non-NASA owner
               are refused.
  NasaSvs      svs.gsfc.nasa.gov API (no key): exact files of a visualization page. SVS media is
               NASA-produced (public domain) but produced videos can carry licensed MUSIC, so audio
               is always dropped (we only ever take picture).
  Pixabay      pixabay.com/api/videos (key in env PIXABAY_API_KEY, query parameter `key`). Pixabay
               Content License: free for commercial use, no attribution required (we credit anyway).
               SECURITY: the key is only read from the environment, only sent to pixabay.com, and
               no URL that carries it is ever logged or written; download URLs of the files (on
               cdn.pixabay.com) do not carry the key.

The interface (what would move to shared code):

    class Provider(Protocol):
        name: str
        def available(self) -> bool
        def search(self, query: str, **filters) -> list[Candidate]
        def fetch(self, cand: Candidate, dest: Path) -> Asset

Usage from build.py: `resolve_clip(spec, dest_dir)` for exact items (NASA), `pick_stock(slot, ...)`
for searched items (Pixabay), then `validate_media(path)`.
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import asdict, dataclass, field
from pathlib import Path

UA = "IfEngine-footage/1.0"


@dataclass
class Candidate:
    provider: str
    id: str
    page: str                    # human landing page
    url: str                     # direct file URL (never contains an API key)
    kind: str                    # video | image
    width: int = 0
    height: int = 0
    duration: float = 0.0
    credit: str = ""
    license: str = ""
    title: str = ""
    tags: str = ""
    extra: dict = field(default_factory=dict)


@dataclass
class Asset:
    path: str
    provider: str
    id: str
    page: str
    credit: str
    license: str
    title: str
    width: int
    height: int
    duration: float
    sha1: str = ""


# ------------------------------------------------------------------ http helpers (no secrets in logs)
def _get(url: str, timeout: int = 60, tries: int = 4) -> bytes:
    for k in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except (urllib.error.URLError, TimeoutError) as e:
            code = getattr(e, "code", None)
            if code in (400, 401, 403, 404) or k == tries - 1:
                # never echo the URL: it may carry a key (Pixabay)
                raise RuntimeError(f"HTTP request failed ({code or type(e).__name__}) for host "
                                   f"{urllib.parse.urlsplit(url).hostname}") from None
            time.sleep(2 * (k + 1))
    raise RuntimeError("unreachable")


def _json(url: str) -> dict:
    return json.loads(_get(url))


def _download(url: str, dest: Path, max_mb: int = 600) -> Path:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 0:
        return dest
    tmp = dest.with_suffix(dest.suffix + ".part")
    for k in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=120) as r, open(tmp, "wb") as f:
                n = 0
                while True:
                    b = r.read(1 << 20)
                    if not b:
                        break
                    n += len(b)
                    if n > max_mb * 1e6:
                        raise RuntimeError(f"file larger than {max_mb} MB")
                    f.write(b)
            tmp.replace(dest)
            return dest
        except (urllib.error.URLError, TimeoutError, ConnectionError):
            if k == 3:
                raise RuntimeError(f"download failed from host {urllib.parse.urlsplit(url).hostname}") from None
            time.sleep(3 * (k + 1))
    return dest


def probe(path: Path) -> dict:
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration,format_name:stream=codec_type,codec_name,width,height",
                          "-of", "json", str(path)], capture_output=True, text=True)
    if out.returncode:
        raise RuntimeError(f"ffprobe could not read {path.name}")
    return json.loads(out.stdout)


def validate_media(path: Path, kind: str, min_w: int = 1200, min_dur: float = 0.0) -> dict:
    """the file must be what we think it is: an MP4/MOV (ISO-BMFF) video with a video stream, or an image"""
    head = path.read_bytes()[:16]
    info = probe(path)
    vs = [s for s in info.get("streams", []) if s.get("codec_type") == "video"]
    if not vs:
        raise RuntimeError(f"{path.name}: no picture stream")
    w, h = int(vs[0].get("width") or 0), int(vs[0].get("height") or 0)
    if kind == "video":
        if head[4:8] != b"ftyp":
            raise RuntimeError(f"{path.name}: not an MP4/MOV container")
        dur = float(info["format"].get("duration") or 0)
        if dur < min_dur:
            raise RuntimeError(f"{path.name}: {dur:.1f}s shorter than {min_dur}s")
    else:
        dur = 0.0
    if w < min_w:
        raise RuntimeError(f"{path.name}: {w}x{h} below {min_w}px wide")
    return {"width": w, "height": h, "duration": dur}


def _sha1(path: Path) -> str:
    import hashlib
    h = hashlib.sha1()
    with open(path, "rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""):
            h.update(b)
    return h.hexdigest()[:16]


BAD_RIGHTS = re.compile(r"(?i)\b(copyright|©|all rights reserved|courtesy of (?!nasa)|used with permission|not (a )?nasa)\b")


# ------------------------------------------------------------------ NASA Image and Video Library
class NasaImages:
    name = "nasa_images"
    API = "https://images-api.nasa.gov"

    def available(self) -> bool:
        return True

    def item(self, nasa_id: str) -> dict:
        d = _json(f"{self.API}/search?nasa_id={urllib.parse.quote(nasa_id)}")
        items = d["collection"]["items"]
        if not items:
            raise RuntimeError(f"NASA item {nasa_id} not found")
        return items[0]["data"][0]

    def search(self, query: str, media_type: str = "video", page_size: int = 50, **_) -> list[Candidate]:
        d = _json(f"{self.API}/search?q={urllib.parse.quote(query)}&media_type={media_type}&page_size={page_size}")
        out = []
        for it in d["collection"]["items"]:
            m = it["data"][0]
            out.append(Candidate(self.name, m["nasa_id"], f"https://images.nasa.gov/details/{m['nasa_id']}", "", media_type,
                                 credit=self._credit(m), license=self._license(m), title=m.get("title", ""),
                                 tags=" ".join(m.get("keywords") or [])))
        return out

    @staticmethod
    def _credit(m: dict) -> str:
        who = m.get("secondary_creator") or m.get("photographer") or ""
        return f"NASA {m.get('center', '')}".strip() + (f" / {who}" if who else "")

    @staticmethod
    def _license(m: dict) -> str:
        txt = " ".join(str(m.get(k) or "") for k in ("description", "description_508", "title", "secondary_creator", "photographer"))
        if BAD_RIGHTS.search(txt):
            return "REFUSED: usage note mentions third-party rights"
        return "NASA media, public domain (images.nasa.gov usage guidelines; no NASA endorsement implied)"

    def fetch(self, nasa_id: str, dest_dir: Path, rendition: str = "large") -> Asset:
        m = self.item(nasa_id)
        lic = self._license(m)
        if lic.startswith("REFUSED"):
            raise RuntimeError(f"{nasa_id}: {lic}")
        files = [i["href"] for i in _json(f"{self.API}/asset/{urllib.parse.quote(nasa_id)}")["collection"]["items"]]
        pick = [f for f in files if f.endswith(f"~{rendition}.mp4")] or [f for f in files if f.endswith("~orig.mp4")]
        if not pick:
            raise RuntimeError(f"{nasa_id}: no {rendition} mp4 rendition")
        url = pick[0].replace("http://", "https://").replace(" ", "%20")
        dest = dest_dir / f"nasa_{re.sub(r'[^A-Za-z0-9._-]', '_', nasa_id)}~{rendition}.mp4"
        _download(url, dest)
        v = validate_media(dest, "video", min_w=1280)
        return Asset(str(dest), self.name, nasa_id, f"https://images.nasa.gov/details/{nasa_id}", self._credit(m), lic,
                     m.get("title", ""), v["width"], v["height"], v["duration"], _sha1(dest))


# ------------------------------------------------------------------ NASA Scientific Visualization Studio
class NasaSvs:
    name = "nasa_svs"
    API = "https://svs.gsfc.nasa.gov/api"

    def available(self) -> bool:
        return True

    def page(self, svs_id: int) -> dict:
        return _json(f"{self.API}/{int(svs_id)}")

    def search(self, query: str, limit: int = 50, **_) -> list[Candidate]:
        d = _json(f"{self.API}/search/?search={urllib.parse.quote(query)}&limit={limit}")
        return [Candidate(self.name, str(x["id"]), f"https://svs.gsfc.nasa.gov/{x['id']}", "", "video", title=x.get("title", ""))
                for x in d.get("results", [])]

    @staticmethod
    def _credit(d: dict) -> str:
        studio = {"svs": "NASA's Scientific Visualization Studio", "gms": "NASA's Goddard Space Flight Center",
                  "cil": "NASA's Goddard Space Flight Center Conceptual Image Lab", "hw": "NASA Hyperwall"}.get(d.get("studio"), "NASA")
        names = []
        for role, people in (d.get("main_credits") or {}).items():
            for p in people:
                if p.get("name") and p["name"] not in names:
                    names.append(p["name"])
        return studio + (f" ({', '.join(names[:3])})" if names else "")

    @staticmethod
    def _license(d: dict, filename: str) -> str:
        desc = re.sub("<[^>]+>", " ", d.get("description") or "")
        note = "NASA-produced, public domain (SVS media usage); picture only"
        if re.search(r"(?i)music", desc):
            note += "; page lists licensed MUSIC -> audio dropped"
        if re.search(r"(?i)\bPIA\d{5}", filename):
            note += "; JPL photojournal image (NASA/JPL-Caltech/SwRI/MSSS); keep the credit line"
        if re.search(r"(?i)(©|all rights reserved|not (a )?nasa)", desc):
            note = "REFUSED: page mentions third-party rights"
        return note

    def fetch(self, svs_id: int, filename: str, dest_dir: Path, kind: str = "video") -> Asset:
        d = self.page(svs_id)
        url = None
        for g in d.get("media_groups", []):
            for it in g.get("items", []):
                ins = it.get("instance", it)
                u = ins.get("url") or ""
                if u.rsplit("/", 1)[-1] == filename:
                    url = u.replace("http://", "https://")
        if not url:
            raise RuntimeError(f"SVS {svs_id}: file {filename} not on the page")
        lic = self._license(d, filename)
        if lic.startswith("REFUSED"):
            raise RuntimeError(f"SVS {svs_id}: {lic}")
        dest = dest_dir / f"svs{svs_id}_{filename}"
        _download(url, dest, max_mb=400)
        v = validate_media(dest, kind, min_w=1000)
        return Asset(str(dest), self.name, f"{svs_id}/{filename}", f"https://svs.gsfc.nasa.gov/{svs_id}", self._credit(d), lic,
                     d.get("title", ""), v["width"], v["height"], v["duration"], _sha1(dest))


# ------------------------------------------------------------------ Pixabay (videos)
class Pixabay:
    """https://pixabay.com/api/docs/#api_search_videos  (key: env PIXABAY_API_KEY, never logged)"""
    name = "pixabay"
    API = "https://pixabay.com/api/videos/"

    def available(self) -> bool:
        return bool(os.environ.get("PIXABAY_API_KEY", "").strip())

    def search(self, query: str, min_duration: float = 0, orientation: str = "horizontal", per_page: int = 30,
               video_type: str = "film", **_) -> list[Candidate]:
        key = os.environ.get("PIXABAY_API_KEY", "").strip()
        if not key:
            return []
        params = {"key": key, "q": query[:100], "video_type": video_type, "safesearch": "true", "per_page": per_page,
                  "order": "popular"}
        url = self.API + "?" + urllib.parse.urlencode(params)
        try:
            d = json.loads(_get(url, timeout=30))
        finally:
            del url, params, key  # keep the key out of tracebacks / locals dumps
        out = []
        for h in d.get("hits", []):
            vids = h.get("videos") or {}
            # best rendition >= 1920 wide, else the largest
            rends = sorted((v for v in vids.values() if v.get("url")), key=lambda v: v.get("width", 0))
            hd = [v for v in rends if v.get("width", 0) >= 1920]
            r = (hd[0] if hd else (rends[-1] if rends else None))
            if not r:
                continue
            w, hh = int(r.get("width", 0)), int(r.get("height", 0))
            if orientation == "horizontal" and w < hh:
                continue
            if float(h.get("duration") or 0) < min_duration:
                continue
            host = urllib.parse.urlsplit(r["url"]).hostname or ""
            if not host.endswith("pixabay.com") or "key=" in r["url"]:
                continue
            out.append(Candidate(self.name, str(h["id"]), h.get("pageURL", f"https://pixabay.com/videos/id-{h['id']}/"), r["url"], "video",
                                 w, hh, float(h.get("duration") or 0), credit=f"{h.get('user', 'unknown')} on Pixabay",
                                 license="Pixabay Content License (free commercial use, no attribution required)",
                                 title=h.get("tags", ""), tags=h.get("tags", ""),
                                 extra={"views": h.get("views", 0), "downloads": h.get("downloads", 0), "likes": h.get("likes", 0)}))
        return out

    def fetch(self, c: Candidate, dest_dir: Path) -> Asset:
        dest = dest_dir / f"pixabay_{c.id}_{c.width}.mp4"
        _download(c.url, dest, max_mb=300)
        v = validate_media(dest, "video", min_w=1280, min_dur=1.0)
        return Asset(str(dest), self.name, c.id, c.page, c.credit, c.license, c.title, v["width"], v["height"], v["duration"], _sha1(dest))


def score_stock(c: Candidate, slot: dict) -> float:
    """rank: tag overlap with the slot's must/any words, resolution, popularity; reject banned tags"""
    tags = set(re.findall(r"[a-z]+", c.tags.lower()))
    if tags & set(slot.get("avoid", [])):
        return -1
    must = set(slot.get("must", []))
    if must and not (tags & must):
        return -1
    s = 2.0 * len(tags & set(slot.get("any", []))) + 3.0 * len(tags & must)
    s += 1.5 if c.width >= 1920 else 0
    s += min(2.0, (c.extra.get("downloads", 0) or 0) / 20000)
    s += 0.5 if c.duration >= slot.get("min_duration", 0) + 2 else 0
    return s


def pick_stock(slot: dict, dest_dir: Path, used: set[str], log=print) -> Asset | None:
    """search each query of the slot until a clip scores > 0; returns the downloaded asset or None"""
    px = Pixabay()
    if not px.available():
        return None
    for q in slot["queries"]:
        try:
            cands = px.search(q, min_duration=slot.get("min_duration", 4), orientation=slot.get("orientation", "horizontal"))
        except RuntimeError as e:
            log(f"[pixabay] search failed for slot {slot['id']}: {e}")
            continue
        ranked = sorted((c for c in cands if c.id not in used), key=lambda c: -score_stock(c, slot))
        for c in ranked[:3]:
            if score_stock(c, slot) <= 0:
                break
            try:
                a = px.fetch(c, dest_dir)
                used.add(c.id)
                log(f"[pixabay] slot {slot['id']}: picked #{c.id} ({c.width}x{c.height}, {c.duration:.0f}s) for query '{q}'")
                return a
            except RuntimeError as e:
                log(f"[pixabay] slot {slot['id']}: #{c.id} rejected ({e})")
    log(f"[pixabay] slot {slot['id']}: no acceptable clip, using the fallback shot")
    return None


def asset_dict(a: Asset) -> dict:
    return asdict(a)
