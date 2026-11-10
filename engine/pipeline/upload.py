#!/usr/bin/env python3
"""Stage 10 - upload to YouTube (Data API v3, OAuth).

Reads secrets/client_secret.json + secrets/token.json (create the token once with get_token.py).
Uploads the long-form render with metadata.json, then sets the thumbnail, uploads captions.srt and
adds the video to the series playlist (created if missing).

  python pipeline/upload.py earth-stops-1s --dry-run                    # validate, no network
  python pipeline/upload.py earth-stops-1s                              # private (default)
  python pipeline/upload.py earth-stops-1s --privacy unlisted --confirm-reviewed
  python pipeline/upload.py earth-stops-1s --publish-at 2026-11-17T15:00:00Z --confirm-reviewed

Safety: anything other than a private upload requires --confirm-reviewed (a human has watched the
render), because metadata.json carries human_review_required=true. --publish-at uploads as private
and lets YouTube flip it public at that time (API requirement).
Note: API projects that have not passed Google's API audit can only upload as private
("locked") - request the audit in Google Cloud if uploads stay private.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import random
import sys
import time

from lib import SECRETS, fail, log, read_json, set_stage, video_dir

STAGE = "upload"
SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.force-ssl"]
RETRY_STATUS = {500, 502, 503, 504}


def youtube_client():
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build

    tok = SECRETS / "token.json"
    if not (SECRETS / "client_secret.json").exists() or not tok.exists():
        sys.exit(f"[upload] missing {SECRETS}/client_secret.json or token.json - run pipeline/get_token.py first")
    creds = Credentials.from_authorized_user_file(str(tok), SCOPES)
    if not creds.valid:
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
            tok.write_text(creds.to_json(), encoding="utf-8")
        else:
            sys.exit("[upload] token invalid - re-run get_token.py")
    return build("youtube", "v3", credentials=creds, cache_discovery=False)


def resumable(request, label):
    from googleapiclient.errors import HttpError
    response, attempt = None, 0
    while response is None:
        try:
            status, response = request.next_chunk()
            if status:
                log(STAGE, f"{label}: {int(status.progress() * 100)}%")
        except HttpError as e:
            if e.resp.status not in RETRY_STATUS or attempt >= 8:
                raise
            attempt += 1
            wait = min(64, 2 ** attempt) + random.random()
            log(STAGE, f"{label}: HTTP {e.resp.status}, retry {attempt} in {wait:.0f}s")
            time.sleep(wait)
    return response


def get_stage_safe(vdir):
    from lib import get_stage
    return get_stage(vdir, STAGE)


def find_or_create_playlist(yt, title, privacy):
    req = yt.playlists().list(part="snippet", mine=True, maxResults=50)
    while req:
        res = req.execute()
        for p in res.get("items", []):
            if p["snippet"]["title"].strip().lower() == title.strip().lower():
                return p["id"]
        req = yt.playlists().list_next(req, res)
    body = {"snippet": {"title": title, "description": f"The If Engine series: {title}"},
            "status": {"privacyStatus": privacy}}
    return yt.playlists().insert(part="snippet,status", body=body).execute()["id"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video_id", nargs="?", default="earth-stops-1s")
    ap.add_argument("--file", help="video file (default: 1080p render, else 540p)")
    ap.add_argument("--privacy", choices=["private", "unlisted", "public"], default="private")
    ap.add_argument("--publish-at", help="RFC3339 UTC time, e.g. 2026-11-17T15:00:00Z (uploads private, scheduled)")
    ap.add_argument("--title-variant", type=int, choices=[0, 1, 2], default=0, help="0 = main title, 1/2 = A/B alternatives")
    ap.add_argument("--playlist-privacy", choices=["private", "unlisted", "public"], default="public")
    ap.add_argument("--confirm-reviewed", action="store_true", help="a human watched the render and approves it")
    ap.add_argument("--no-captions", action="store_true")
    ap.add_argument("--no-thumbnail", action="store_true")
    ap.add_argument("--no-playlist", action="store_true")
    ap.add_argument("--existing-id", help="skip the video upload; only apply thumbnail/captions/playlist to this YouTube id")
    ap.add_argument("--short", type=int, choices=[1, 2, 3], help="upload Short N (shorts/<id>_shortN.mp4) instead of the long-form")
    ap.add_argument("--related-id", help="YouTube id of the long-form; linked from a Short's description")
    ap.add_argument("--dry-run", action="store_true", help="validate and print the request; no network, no credentials")
    a = ap.parse_args()

    vdir = video_dir(a.video_id)
    md = read_json(vdir / "metadata.json")
    if a.file:
        video = vdir / a.file if not a.file.startswith("/") else __import__("pathlib").Path(a.file)
    else:
        cands = [vdir / "renders" / f"{a.video_id}_1080p.mp4", vdir / "renders" / f"{a.video_id}_540p.mp4"]
        video = next((c for c in cands if c.exists()), cands[0])
    thumb, srt = vdir / "thumbnail.png", vdir / "captions.srt"

    privacy = a.privacy
    publish_at = None
    if a.publish_at:
        t = dt.datetime.fromisoformat(a.publish_at.replace("Z", "+00:00"))
        if t.tzinfo is None or t <= dt.datetime.now(dt.timezone.utc):
            sys.exit("[upload] --publish-at must be a future time with a timezone (e.g. ...Z)")
        publish_at = t.astimezone(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        privacy = "private"  # required by the API for scheduled publishing
    if (privacy != "private" or publish_at) and not a.confirm_reviewed and md.get("human_review_required"):
        sys.exit("[upload] refusing non-private/scheduled upload without --confirm-reviewed (watch the render first)")

    title = [md["title"], *md["alt_titles"]][a.title_variant]
    description, tags, playlist = md["description"], md["tags"], md["playlist"]
    if a.short:
        sm = next((x for x in md.get("shorts", []) if x["id"] == f"short{a.short}"), None)
        if not sm:
            sys.exit(f"[upload] metadata.json has no entry for short{a.short}")
        video = vdir / sm["file"]
        title, tags, playlist = sm["title"], sm["tags"], md.get("shorts_playlist", "Shorts")
        link = f"https://youtu.be/{a.related_id}" if a.related_id else ""
        description = sm["description"].replace("{{LONG_URL}}", link) if link else \
            "\n".join(l for l in sm["description"].splitlines() if "{{LONG_URL}}" not in l)
        a.no_captions = True    # captions.srt is timed for the long-form
        a.no_thumbnail = True   # Shorts use a frame, custom thumbnails are ignored
        thumb = vdir / "thumbnail.png"
    body = {
        "snippet": {"title": title, "description": description, "tags": tags,
                    "categoryId": md["categoryId"], "defaultLanguage": md["defaultLanguage"],
                    "defaultAudioLanguage": md["defaultAudioLanguage"]},
        "status": {"privacyStatus": privacy, "selfDeclaredMadeForKids": md["madeForKids"],
                   "containsSyntheticMedia": md["containsSyntheticMedia"], "license": md["license"],
                   "embeddable": md["embeddable"]},
    }
    if publish_at:
        body["status"]["publishAt"] = publish_at

    problems = [f"missing {p.name}" for p in (video, thumb, srt) if not p.exists()]
    if len(title) > 100:
        problems.append("title > 100 chars")
    if thumb.exists() and thumb.stat().st_size > 2_000_000:
        problems.append("thumbnail > 2 MB")
    if problems:
        if a.short:  # never overwrite the long-form upload record in manifest.json
            sys.exit(f"[upload] short{a.short}: " + "; ".join(problems))
        fail(vdir, STAGE, "; ".join(problems))

    if a.dry_run:
        printable = json.loads(json.dumps(body))
        printable["snippet"]["description"] = printable["snippet"]["description"][:160] + " ..."
        log(STAGE, "DRY RUN request body:\n" + json.dumps(printable, indent=2, ensure_ascii=False))
        log(STAGE, f"would upload {video} ({video.stat().st_size / 1e6:.1f} MB), thumbnail {thumb.name}, "
                   f"captions {'no' if a.no_captions else srt.name}, playlist '{playlist}'")
        if not a.short:
            set_stage(vdir, STAGE, "ready", note="dry run passed; needs secrets/client_secret.json + token.json",
                      file=str(video.relative_to(vdir)), privacy=privacy, publish_at=publish_at)
        return

    from googleapiclient.errors import HttpError
    from googleapiclient.http import MediaFileUpload
    yt = youtube_client()
    if a.existing_id:
        vid = a.existing_id
    else:
        media = MediaFileUpload(str(video), mimetype="video/mp4", chunksize=8 * 1024 * 1024, resumable=True)
        res = resumable(yt.videos().insert(part="snippet,status", body=body, media_body=media, notifySubscribers=True), "video")
        vid = res["id"]
        log(STAGE, f"uploaded: https://youtu.be/{vid} ({privacy}{', publishAt ' + publish_at if publish_at else ''})")
    done = {"youtube_id": vid, "url": f"https://youtu.be/{vid}", "privacy": privacy, "publish_at": publish_at,
            "title_variant": a.title_variant}
    warnings = []

    def step(name, fn):
        # extras must never lose an already-uploaded video: record and continue
        try:
            fn()
            done[name] = True
        except HttpError as e:
            reason = getattr(e, "reason", "") or str(e)[:200]
            warnings.append(f"{name}: {reason}")
            log(STAGE, f"WARNING {name} failed: {reason}")

    if not a.no_thumbnail:
        step("thumbnail", lambda: yt.thumbnails().set(
            videoId=vid, media_body=MediaFileUpload(str(thumb), mimetype="image/png")).execute())
    if not a.no_captions:
        cap = {"snippet": {"videoId": vid, "language": "en", "name": "English", "isDraft": False}}
        step("captions", lambda: resumable(yt.captions().insert(part="snippet", body=cap, media_body=MediaFileUpload(
            str(srt), mimetype="application/octet-stream", resumable=True)), "captions"))
    if not a.no_playlist:
        def add_pl():
            import time
            pl = find_or_create_playlist(yt, playlist, a.playlist_privacy)
            for attempt in range(4):  # a just-created playlist can reject inserts for a few seconds
                try:
                    yt.playlistItems().insert(part="snippet", body={"snippet": {"playlistId": pl, "resourceId": {
                        "kind": "youtube#video", "videoId": vid}}}).execute()
                    break
                except HttpError:
                    if attempt == 3:
                        raise
                    time.sleep(10 * (attempt + 1))
            done["playlist_id"] = pl
        step("playlist", add_pl)
    done["warnings"] = warnings
    if a.short:
        from lib import get_stage
        prev = get_stage(vdir, STAGE)
        shorts = dict(prev.get("shorts", {}))
        shorts[f"short{a.short}"] = done
        prev = {k: v for k, v in prev.items() if k not in ("status", "updated")}
        prev["shorts"] = shorts
        set_stage(vdir, STAGE, prev.get("long_status", "done") if "youtube_id" in prev else "partial", **prev)
    else:
        prev = get_stage_safe(vdir)
        set_stage(vdir, STAGE, "done", **done, **({"shorts": prev["shorts"]} if "shorts" in prev else {}))
    log(STAGE, f"OK: {done}")


if __name__ == "__main__":
    main()
