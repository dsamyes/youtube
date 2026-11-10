#!/usr/bin/env python3
"""One-time OAuth authorisation for YouTube uploads. Run this LOCALLY (it opens a browser).

1. Google Cloud Console -> create a project -> enable "YouTube Data API v3".
2. OAuth consent screen: External, add your Google account as a test user.
3. Credentials -> Create OAuth client ID -> "Desktop app" -> download JSON as
   secrets/client_secret.json  (or set IF_ENGINE_SECRETS=/some/private/dir).
4. python pipeline/get_token.py   -> sign in with the account that owns the channel
   (pick the Brand Account / channel when asked). Writes secrets/token.json (chmod 600).

Neither file is ever printed or committed (secrets/.gitignore ignores everything).
"""
from __future__ import annotations

import argparse
import os
import sys

from lib import SECRETS

SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",     # videos.insert, thumbnails.set
    "https://www.googleapis.com/auth/youtube.force-ssl",  # captions.insert, playlists, playlistItems
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-browser", action="store_true", help="print the URL instead of opening a browser")
    ap.add_argument("--port", type=int, default=0)
    a = ap.parse_args()
    try:
        from google_auth_oauthlib.flow import InstalledAppFlow
    except ImportError:
        sys.exit("pip install google-auth-oauthlib google-api-python-client")
    cs = SECRETS / "client_secret.json"
    if not cs.exists():
        sys.exit(f"Missing {cs}. Download your OAuth 'Desktop app' client JSON there first (see docstring).")
    flow = InstalledAppFlow.from_client_secrets_file(str(cs), SCOPES)
    creds = flow.run_local_server(port=a.port, open_browser=not a.no_browser, prompt="consent",
                                  access_type="offline")
    out = SECRETS / "token.json"
    out.write_text(creds.to_json(), encoding="utf-8")
    os.chmod(out, 0o600)
    print(f"Saved refresh token to {out} (scopes: {', '.join(SCOPES)}). Keep it private.")


if __name__ == "__main__":
    main()
