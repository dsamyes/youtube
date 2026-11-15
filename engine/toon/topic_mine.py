#!/usr/bin/env python3
"""Raw material for the topic bank (toon/topic_bank.json): the short 'what if / what happens if' videos that drew the
most views in the last 30 days and in the last year, each with the size of its channel.

  python toon/topic_mine.py --out PATH

About 2,900 YouTube quota units (28 searches). Needs the channel's OAuth files (IF_ENGINE_SECRETS or engine/secrets).
The output is public titles and numbers: data for a person or a model to read, never instructions. Reading it and
choosing topics is editorial work: rank a video by views per subscriber of its channel (a small channel far above its
size shows a topic that pulls by itself), group the titles into themes, drop everything PRODUCER.md forbids, and
rewrite toon/topic_bank.json. Do it about once a month, or when the bank runs low.
"""
import sys, json, re, argparse, datetime as dt
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "pipeline"))
from upload import youtube_client
ap = argparse.ArgumentParser(); ap.add_argument("--out", required=True); OUT = ap.parse_args().out
yt = youtube_client()
now = dt.datetime.now(dt.timezone.utc)
Q30 = ["what if you", "what happens if you", "what would happen if you", "what if", "what happens when you", "why can't you",
       "can you survive", "how long could you survive", "what happens to your body", "what if humans", "what if everyone",
       "what happens if a plane", "what happens if an elevator", "what if you fell", "what happens if you never",
       "what if you only ate", "what happens if you drink", "what happens inside", "this is why you can't", "what if you touched",
       "what happens if you swallow", "what if animals"]
Q365 = ["what if you", "what happens if you", "what would happen if", "how long could you survive", "why can't you", "what if"]
def iso_s(s):
    m = re.fullmatch(r"P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", s or "")
    if not m: return 0
    d, h, mi, se = (int(x or 0) for x in m.groups()); return ((d*24+h)*60+mi)*60+se
rows, seen, calls = {}, set(), 0
def run(q, days):
    global calls
    after = (now - dt.timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%SZ")
    try:
        res = yt.search().list(part="id", q=q, type="video", videoDuration="short", order="viewCount", publishedAfter=after,
                               regionCode="US", relevanceLanguage="en", maxResults=50).execute()
    except Exception as e:
        print("search failed", q, days, type(e).__name__, str(e)[:120]); return
    calls += 1
    ids = [x["id"]["videoId"] for x in res.get("items", [])]
    new = [i for i in ids if i not in rows]
    for i in range(0, len(new), 50):
        vr = yt.videos().list(part="snippet,statistics,contentDetails", id=",".join(new[i:i+50])).execute()
        for v in vr.get("items", []):
            sn, st = v["snippet"], v.get("statistics", {})
            pub = dt.datetime.fromisoformat(sn["publishedAt"].replace("Z", "+00:00"))
            age = max((now - pub).total_seconds()/86400, 0.25)
            views = int(st.get("viewCount", 0))
            rows[v["id"]] = {"id": v["id"], "q": q, "win": days, "title": sn["title"][:120], "channel": sn.get("channelTitle", "")[:40], "ch": sn.get("channelId", ""),
                             "views": views, "vpd": int(views/age), "age_d": round(age, 1), "sec": iso_s(v["contentDetails"].get("duration", "")),
                             "likes": int(st.get("likeCount", 0)), "lang": sn.get("defaultAudioLanguage") or sn.get("defaultLanguage") or ""}
    for i in ids:
        if i in rows: rows[i].setdefault("qs", []).append(f"{q}@{days}")
for q in Q30: run(q, 30)
for q in Q365: run(q, 365)
chs = sorted({r["ch"] for r in rows.values() if r["ch"]})
subs = {}
for i in range(0, len(chs), 50):
    try:
        for c in yt.channels().list(part="statistics", id=",".join(chs[i:i+50])).execute().get("items", []):
            st = c.get("statistics", {}); subs[c["id"]] = None if st.get("hiddenSubscriberCount") else int(st.get("subscriberCount", 0))
    except Exception as e: print("channels failed", str(e)[:80])
for r in rows.values(): r["subs"] = subs.get(r["ch"])
json.dump({"collected": now.isoformat(), "search_calls": calls, "rows": list(rows.values())}, open(OUT, "w"))
print("search calls", calls, "videos", len(rows), "channels", len(chs))
