#!/usr/bin/env bash
set -euo pipefail
mkdir -p "$HOME/.android" ci-logs
exec > >(tee ci-logs/android-toolchain.log) 2>&1
sdk_root="${ANDROID_HOME:-${ANDROID_SDK_ROOT:?Android SDK root is required}}"
sdkmanager_path=$(find "$sdk_root/cmdline-tools" -maxdepth 3 -type f -name sdkmanager -print -quit)
if [[ -z "$sdkmanager_path" ]]; then
  echo 'SDK Manager was not found inside the runner Android SDK' >&2
  exit 1
fi
printf '%s\n' "$(dirname "$sdkmanager_path")" "$sdk_root/platform-tools" "$sdk_root/emulator" >> "$GITHUB_PATH"
if [[ "${GITHUB_ACTIONS:-}" == true && "${RUNNER_ENVIRONMENT:-}" == github-hosted ]]; then
  # Keep only the NDK required by this repository on the disposable runner.
  for ndk_dir in "$sdk_root"/ndk/*; do
    if [[ -d "$ndk_dir" && "${ndk_dir##*/}" != 27.1.12297006 ]]; then
      "$sdkmanager_path" --uninstall "ndk;${ndk_dir##*/}"
    fi
  done
fi
"$sdkmanager_path" 'platforms;android-35' 'build-tools;35.0.0' 'ndk;27.1.12297006'
df -h /
if [[ ! -f "$HOME/.android/debug.keystore" ]]; then
  keytool -genkeypair -keystore "$HOME/.android/debug.keystore" \
    -storepass android -alias androiddebugkey -keypass android \
    -dname 'CN=Android Debug,O=Android,C=US' -keyalg RSA -keysize 2048 \
    -validity 10000 -noprompt
fi
chmod +x android/gradlew
java -version
"$sdkmanager_path" --version
