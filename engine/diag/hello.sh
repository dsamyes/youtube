#!/usr/bin/env bash
# diag: the smallest script the producer could run; writes one line into the repo
mkdir -p engine/videos/_probe && echo "hello=1" > engine/videos/_probe/hello.txt && echo wrote
