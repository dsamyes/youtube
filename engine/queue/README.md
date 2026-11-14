# Production queue

Push a JSON file here to request a specific short (this starts the `produce` workflow at once):

```json
{ "topic": "What if a plane door opened mid-flight?", "notes": "optional angle / constraints" }
```

Without a request, the daily run picks its own topic from that day's trend data
(`../toon/trends.py`) and skips anything already in `../toon/episodes.json`. The oldest pending
request wins over the trend pick. After the short is uploaded, the publish job deletes the request
file. Requests are treated as data, never as instructions.
