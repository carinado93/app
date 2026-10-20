#!/usr/bin/env bash
# Run before every test build: nothing goes to Carina unless all of this passes.
# Audio: tools/audio/check_audio.py must also have passed for the recordings that were cleaned (see docs/AUDIO.md).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "1/3 typecheck"; npx tsc --noEmit
echo "2/3 lint"; npm run lint --silent
echo "3/3 Android bundle (every screen and every recording must resolve)"
out="$(mktemp -d)"
EXPO_PUBLIC_TEST_MODE=1 npx expo export --platform android --output-dir "$out" > "$out.log" 2>&1 || { cat "$out.log"; exit 1; }
want=$(ls assets/audio/en/*.m4a assets/audio/music/*.m4a | wc -l)
got=$(grep -c "assets/audio/" "$out.log" || true)
echo "   recordings bundled: $got of $want"
[ "$got" -ge "$want" ] || { echo "Some recordings are missing from the bundle."; exit 1; }
rm -rf "$out" "$out.log"
echo "All checks passed."
