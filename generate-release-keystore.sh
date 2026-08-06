#!/usr/bin/env bash

KEYSTORE_PATH="android/app/msns-release-key.keystore"
ALIAS_NAME="msns-key-alias"
PASSWORD="msns-lms-secure-key-pass"

if [ -f "$KEYSTORE_PATH" ]; then
  echo "🔑 Release keystore already exists at $KEYSTORE_PATH"
  exit 0
fi

echo "🔐 Generating Android Release Keystore for MSNS LMS..."

keytool -genkeypair -v \
  -keystore "$KEYSTORE_PATH" \
  -alias "$ALIAS_NAME" \
  -storepass "$PASSWORD" \
  -keypass "$PASSWORD" \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -dname "CN=M.S. Naz High School, OU=LMS Division, O=MSNS, L=Lahore, ST=Punjab, C=PK"

echo "✅ Keystore created at $KEYSTORE_PATH with alias '$ALIAS_NAME'"
