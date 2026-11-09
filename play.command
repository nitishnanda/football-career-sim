#!/bin/bash
# Double-click to play. Serves the game on a fixed address so your saves always come back.
cd "$(dirname "$0")/dist" || exit 1
(sleep 1; open "http://127.0.0.1:8765/") &
python3 -m http.server 8765 --bind 127.0.0.1
