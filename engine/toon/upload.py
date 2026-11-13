#!/usr/bin/env python3
"""Upload a finished cartoon short to YouTube (PRIVATE by default; the owner publishes).

  python toon/upload.py <video_id> [--privacy private|unlisted|public] [--publish-at 2026-11-20T15:00:00Z] [--dry-run]

Reads videos/<id>/metadata.json, final/<id>.mp4, captions.srt. Reuses pipeline/upload.py (OAuth client from
IF_ENGINE_SECRETS or engine/secrets, resumable upload with retries, playlist lookup). Writes final/upload.json.
"""
from __future__ import annotations
import argparse, datetime as dt, json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "pipeline"))

def main() -> None:
    ap = argparse.ArgumentParser(); ap.add_argument("video_id")
    ap.add_argument("--privacy", choices=["private", "unlisted", "public"], default="private")
    ap.add_argument("--publish-at"); ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    vdir = ROOT / "videos" / a.video_id
    md = json.loads((vdir / "metadata.json").read_text())
    video, srt = vdir / "final" / f"{a.video_id}.mp4", vdir / "captions.srt"
    if not video.exists() or video.read_bytes()[4:8] != b"ftyp": sys.exit(f"[upload] {video} missing or not an MP4")
    if len(md["title"]) > 100: sys.exit("[upload] title > 100 chars")
    privacy, publish_at = a.privacy, None
    if a.publish_at:
        t = dt.datetime.fromisoformat(a.publish_at.replace("Z", "+00:00"))
        if t.tzinfo is None or t <= dt.datetime.now(dt.timezone.utc): sys.exit("[upload] --publish-at must be a future time with a timezone")
        publish_at, privacy = t.astimezone(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "private"
    body = {"snippet": {"title": md["title"], "description": md["description"], "tags": md["tags"], "categoryId": md.get("categoryId", "28"),
                        "defaultLanguage": "en", "defaultAudioLanguage": "en"},
            "status": {"privacyStatus": privacy, "selfDeclaredMadeForKids": False, "containsSyntheticMedia": md.get("containsSyntheticMedia", False),
                       "license": "youtube", "embeddable": True}}
    if publish_at: body["status"]["publishAt"] = publish_at
    if a.dry_run:
        print(json.dumps(body, indent=1, ensure_ascii=False)); print(f"[upload] would upload {video} ({video.stat().st_size / 1e6:.1f} MB)"); return
    from googleapiclient.errors import HttpError
    from googleapiclient.http import MediaFileUpload
    from upload import find_or_create_playlist, resumable, youtube_client
    yt = youtube_client()
    res = resumable(yt.videos().insert(part="snippet,status", body=body, notifySubscribers=privacy == "public",
                                       media_body=MediaFileUpload(str(video), mimetype="video/mp4", chunksize=8 * 1024 * 1024, resumable=True)), "short")
    vid = res["id"]; warnings = []
    done = {"youtube_id": vid, "url": f"https://youtube.com/shorts/{vid}", "privacy": res.get("status", {}).get("privacyStatus"), "publish_at": publish_at,
            "uploaded": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")}
    def step(name, fn):
        try: fn(); done[name] = True
        except HttpError as e: warnings.append(f"{name}: {getattr(e, 'reason', '') or str(e)[:200]}")
    if srt.exists():
        cap = {"snippet": {"videoId": vid, "language": "en", "name": "English", "isDraft": False}}
        step("captions", lambda: resumable(yt.captions().insert(part="snippet", body=cap, media_body=MediaFileUpload(str(srt), mimetype="application/octet-stream", resumable=True)), "captions"))
    if md.get("playlist"):
        def add():
            pl = find_or_create_playlist(yt, md["playlist"], "public")
            yt.playlistItems().insert(part="snippet", body={"snippet": {"playlistId": pl, "resourceId": {"kind": "youtube#video", "videoId": vid}}}).execute()
            done["playlist_id"] = pl
        step("playlist", add)
    done["warnings"] = warnings
    (vdir / "final" / "upload.json").write_text(json.dumps(done, indent=1) + "\n")
    print(f"[upload] {done}")

if __name__ == "__main__":
    main()
