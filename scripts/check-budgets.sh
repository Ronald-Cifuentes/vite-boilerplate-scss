#!/usr/bin/env bash
# Budget enforcement script (rev.10)
# This script enforces performance budgets as defined in docs/performance/budgets.md
# It must be run AFTER `vite build` produces dist/assets/*.js files
#
# Exit codes:
#   0 = all budgets pass
#   1 = budget violation or missing dist artifacts
#   2 = invalid usage

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DIST_DIR="$REPO_ROOT/dist/assets"

# Rev.10 budgets (docs/performance/budgets.md)
MAIN_RAW_LIMIT=244000      # 244 KB (rev. 11)
MAIN_GZIP_LIMIT=76000      # 76 KB
CHUNK_RAW_LIMIT=3072       # 3 KB (3,072 bytes)
CHUNK_GZIP_LIMIT=1536      # 1.5 KB (geo chunk); ja/zh can be 1 KB but using uniform cap

# Warning thresholds (90% of limit)
MAIN_RAW_WARNING=$((MAIN_RAW_LIMIT * 9 / 10))
MAIN_GZIP_WARNING=$((MAIN_GZIP_LIMIT * 9 / 10))

EXIT_CODE=0
VIOLATIONS=()

# Check dist exists
if [ ! -d "$DIST_DIR" ]; then
  echo "ERROR: dist/assets/ directory not found. Run 'pnpm exec vite build' first."
  exit 2
fi

# Find main bundle (largest .js file that is not a lazy chunk)
# Convention: main is index-*.js or the largest chunk
MAIN_BUNDLE=$(find "$DIST_DIR" -name 'index-*.js' -type f | head -1)

if [ -z "$MAIN_BUNDLE" ]; then
  echo "ERROR: Could not find main bundle (index-*.js) in dist/assets/"
  exit 2
fi

# Get raw size
MAIN_RAW=$(stat -f%z "$MAIN_BUNDLE" 2>/dev/null || stat -c%s "$MAIN_BUNDLE" 2>/dev/null)

# Get gzip size (gzip -6 to match nginx gzip_comp_level 6)
MAIN_GZIP=$(gzip -6 -c "$MAIN_BUNDLE" | wc -c | tr -d ' ')

echo "=== Main Bundle Budget Check ==="
echo "File: $(basename "$MAIN_BUNDLE")"
echo "Raw size:  $MAIN_RAW bytes (limit: $MAIN_RAW_LIMIT, warning: $MAIN_RAW_WARNING)"
echo "Gzip size: $MAIN_GZIP bytes (limit: $MAIN_GZIP_LIMIT, warning: $MAIN_GZIP_WARNING)"

if [ "$MAIN_RAW" -gt "$MAIN_RAW_LIMIT" ]; then
  VIOLATIONS+=("Main bundle raw size exceeds limit: $MAIN_RAW > $MAIN_RAW_LIMIT")
  EXIT_CODE=1
elif [ "$MAIN_RAW" -gt "$MAIN_RAW_WARNING" ]; then
  echo "WARNING: Main bundle raw size approaching limit ($MAIN_RAW > $MAIN_RAW_WARNING)"
fi

if [ "$MAIN_GZIP" -gt "$MAIN_GZIP_LIMIT" ]; then
  VIOLATIONS+=("Main bundle gzip size exceeds limit: $MAIN_GZIP > $MAIN_GZIP_LIMIT")
  EXIT_CODE=1
elif [ "$MAIN_GZIP" -gt "$MAIN_GZIP_WARNING" ]; then
  echo "WARNING: Main bundle gzip size approaching limit ($MAIN_GZIP > $MAIN_GZIP_WARNING)"
fi

if [ "$EXIT_CODE" -eq 0 ]; then
  echo "✓ Main bundle PASS"
else
  echo "✗ Main bundle FAIL"
fi

echo ""
echo "=== Lazy Chunk Budget Check ==="

# Find all lazy chunks (exclude main bundle)
LAZY_CHUNKS=$(find "$DIST_DIR" -name '*.js' -type f ! -name "$(basename "$MAIN_BUNDLE")")

if [ -z "$LAZY_CHUNKS" ]; then
  echo "No lazy chunks found (this is OK for single-bundle builds)"
else
  CHUNK_COUNT=0
  for CHUNK in $LAZY_CHUNKS; do
    CHUNK_NAME=$(basename "$CHUNK")
    CHUNK_RAW=$(stat -f%z "$CHUNK" 2>/dev/null || stat -c%s "$CHUNK" 2>/dev/null)
    CHUNK_GZIP=$(gzip -6 -c "$CHUNK" | wc -c | tr -d ' ')

    echo "Chunk: $CHUNK_NAME"
    echo "  Raw:  $CHUNK_RAW bytes (limit: $CHUNK_RAW_LIMIT)"
    echo "  Gzip: $CHUNK_GZIP bytes"

    if [ "$CHUNK_RAW" -gt "$CHUNK_RAW_LIMIT" ]; then
      VIOLATIONS+=("Chunk $CHUNK_NAME raw size exceeds limit: $CHUNK_RAW > $CHUNK_RAW_LIMIT")
      EXIT_CODE=1
      echo "  ✗ FAIL"
    else
      echo "  ✓ PASS"
    fi

    CHUNK_COUNT=$((CHUNK_COUNT + 1))
  done

  echo ""
  echo "Checked $CHUNK_COUNT lazy chunk(s)"
fi

echo ""
echo "=== Budget Summary ==="
if [ "$EXIT_CODE" -eq 0 ]; then
  echo "✓ All budgets PASS"
else
  echo "✗ Budget violations found:"
  for VIOLATION in "${VIOLATIONS[@]}"; do
    echo "  - $VIOLATION"
  done
fi

exit $EXIT_CODE
