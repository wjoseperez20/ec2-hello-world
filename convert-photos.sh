#!/usr/bin/env bash
# Usage: ./convert-photos.sh /path/to/heic/folder
# Converts all .heic/.HEIC files to .jpg and copies them to public/photos/
# as photo1.jpg, photo2.jpg, ...
set -euo pipefail

SOURCE_DIR="${1:-.}"
OUT_DIR="$(dirname "$0")/public/photos"
mkdir -p "$OUT_DIR"

# Collect all .heic files (case-insensitive), sorted by name
FILES=()
while IFS= read -r -d '' f; do
  FILES+=("$f")
done < <(find "$SOURCE_DIR" -maxdepth 1 -iname "*.heic" -print0 | sort -z)

if [[ ${#FILES[@]} -eq 0 ]]; then
  echo "No .heic files found in: $SOURCE_DIR"
  exit 1
fi

echo "Found ${#FILES[@]} .heic file(s). Converting..."

COUNT=1
for FILE in "${FILES[@]}"; do
  OUT="$OUT_DIR/photo${COUNT}.jpg"
  echo "  [${COUNT}/${#FILES[@]}] $(basename "$FILE") -> photo${COUNT}.jpg"
  sips -s format jpeg "$FILE" --out "$OUT" --setProperty formatOptions 90 &>/dev/null
  (( COUNT++ ))
done

echo "Done. ${#FILES[@]} photos saved to $OUT_DIR"
echo "Update the PHOTOS array in app/page.tsx if you added more than 6."
