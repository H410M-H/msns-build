#!/usr/bin/env bash

SDK_DIR="$HOME/android-sdk"
mkdir -p "$SDK_DIR/cmdline-tools"

if [ ! -d "$SDK_DIR/cmdline-tools/latest" ]; then
  echo "📥 Downloading official Android Command Line Tools..."
  curl -sSL "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip" -o "$SDK_DIR/cmdline.zip"
  unzip -q "$SDK_DIR/cmdline.zip" -d "$SDK_DIR/cmdline-tools"
  mv "$SDK_DIR/cmdline-tools/cmdline-tools" "$SDK_DIR/cmdline-tools/latest"
  rm "$SDK_DIR/cmdline.zip"
fi

echo "✅ Android SDK Command Line Tools setup at $SDK_DIR"

# Write local.properties in android project
cat << EOF > android/local.properties
sdk.dir=$SDK_DIR
EOF

echo "✅ Created android/local.properties with sdk.dir=$SDK_DIR"
