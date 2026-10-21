#!/usr/bin/env bash
set -euo pipefail
sdkmanager 'platforms;android-35' 'build-tools;35.0.0' 'ndk;27.1.12297006'
mkdir -p "$HOME/.android" ci-logs
if [[ ! -f "$HOME/.android/debug.keystore" ]]; then
  keytool -genkeypair -keystore "$HOME/.android/debug.keystore" \
    -storepass android -alias androiddebugkey -keypass android \
    -dname 'CN=Android Debug,O=Android,C=US' -keyalg RSA -keysize 2048 \
    -validity 10000 -noprompt
fi
chmod +x android/gradlew
java -version
sdkmanager --version

