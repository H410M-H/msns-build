#!/usr/bin/env bash
set -e

SRC_ICON="public/app-icon.png"
RES_DIR="android/app/src/main/res"

if [ ! -f "$SRC_ICON" ]; then
  echo "❌ Source icon $SRC_ICON not found!"
  exit 1
fi

echo "🎨 Generating Android app icons from $SRC_ICON..."

# Function to generate icons for a density
gen_density() {
  DENSITY=$1
  ICON_SIZE=$2
  FG_CANVAS=$3
  FG_LOGO=$4

  TARGET_DIR="$RES_DIR/$DENSITY"
  mkdir -p "$TARGET_DIR"

  # 1. Standard square ic_launcher.png
  magick "$SRC_ICON" -resize "${ICON_SIZE}x${ICON_SIZE}" "$TARGET_DIR/ic_launcher.png"

  # 2. Round ic_launcher_round.png using circular mask
  magick "$SRC_ICON" -resize "${ICON_SIZE}x${ICON_SIZE}" \
    \( -size "${ICON_SIZE}x${ICON_SIZE}" xc:none -fill white -draw "circle $((ICON_SIZE/2)),$((ICON_SIZE/2)) $((ICON_SIZE/2)),0" \) \
    -compose copy_opacity -composite "$TARGET_DIR/ic_launcher_round.png"

  # 3. Adaptive ic_launcher_foreground.png (logo inside transparent canvas)
  magick -size "${FG_CANVAS}x${FG_CANVAS}" xc:none \
    \( "$SRC_ICON" -resize "${FG_LOGO}x${FG_LOGO}" \) \
    -gravity center -composite "$TARGET_DIR/ic_launcher_foreground.png"

  echo "  ✅ Generated $DENSITY icons (${ICON_SIZE}x${ICON_SIZE}, fg: ${FG_CANVAS}x${FG_CANVAS})"
}

gen_density "mipmap-mdpi" 48 108 72
gen_density "mipmap-hdpi" 72 162 108
gen_density "mipmap-xhdpi" 96 216 144
gen_density "mipmap-xxhdpi" 144 324 216
gen_density "mipmap-xxxhdpi" 192 432 288

echo "🎉 All Android icons generated successfully!"
