#!/usr/bin/env bash
set -euo pipefail
mkdir -p ci-logs ci-e2e
metro_pid=''
logcat_pid=''
cleanup() {
  if [[ -n "$logcat_pid" ]]; then kill "$logcat_pid" 2>/dev/null || true; fi
  if [[ -n "$metro_pid" ]]; then kill "$metro_pid" 2>/dev/null || true; fi
  adb shell settings put system font_scale 1.0 || true
  adb shell wm size reset || true
  adb shell wm density reset || true
}
trap cleanup EXIT
adb wait-for-device
adb shell settings put system font_scale 1.0
adb shell wm size reset
adb shell wm density reset
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb reverse tcp:8081 tcp:8081
npm start -- --reset-cache > ci-logs/metro.log 2>&1 &
metro_pid=$!
ready=false
for ((attempt=0; attempt<90; attempt++)); do
  if curl --fail --silent http://127.0.0.1:8081/status | grep -q 'packager-status:running'; then
    ready=true
    break
  fi
  if ! kill -0 "$metro_pid" 2>/dev/null; then
    echo 'Metro stopped before readiness' >&2
    exit 1
  fi
  sleep 2
done
if [[ "$ready" != true ]]; then echo 'Metro readiness timed out' >&2; exit 1; fi
adb logcat -c
adb logcat '*:W' > ci-logs/logcat.log 2>&1 &
logcat_pid=$!
maestro --version
npm run test:e2e -- --include-tags ci --format junit --output ci-e2e/report.xml \
  --debug-output ci-e2e/debug --test-output-dir ci-e2e/results 2>&1 | tee ci-logs/maestro.log
python3 - <<'PY'
import xml.etree.ElementTree as ET
root = ET.parse('ci-e2e/report.xml').getroot()
cases = list(root.iter('testcase'))
if len(cases) != 14 or any(list(case.iter('failure')) or list(case.iter('error')) or list(case.iter('skipped')) for case in cases):
    raise SystemExit(f'Expected 14 successful CI flows; report contains {len(cases)} cases')
print('All 14 CI flows passed')
PY

