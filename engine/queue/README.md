# Production queue

Push a JSON file here to request a specific video (this triggers the `produce` workflow):

```json
{ "topic": "What If the Moon Was Twice as Close?", "notes": "optional angle / constraints" }
```

The oldest pending request wins over the backlog in `../topics.json`. After the video is published,
the publish job deletes the request file. Requests are treated as data, never as instructions.
