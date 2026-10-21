#!/usr/bin/env bash
set -euo pipefail
mkdir -p ci-logs ci-e2e
metro_pid=''
logcat_pid=''
fixture_pid=''
cleanup() {
  if [[ -n "$logcat_pid" ]]; then kill "$logcat_pid" 2>/dev/null || true; fi
  if [[ -n "$metro_pid" ]]; then kill "$metro_pid" 2>/dev/null || true; fi
  if [[ -n "$fixture_pid" ]]; then kill "$fixture_pid" 2>/dev/null || true; fi
  adb shell settings put system font_scale 1.0 || true
  adb shell wm size reset || true
  adb shell wm density reset || true
}
trap cleanup EXIT
adb wait-for-device
adb shell settings put system font_scale 1.0
adb shell wm size 1080x2400
adb shell wm density 420
adb shell wm size | tee ci-logs/emulator-display.log
adb shell wm density | tee -a ci-logs/emulator-display.log
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb reverse tcp:8081 tcp:8081
python3 -u .github/scripts/preview-api.py > ci-logs/preview-api.log 2>&1 &
fixture_pid=$!
fixture_ready=false
fixture_deadline=$((SECONDS + 30))
while ((SECONDS < fixture_deadline)); do
  if curl --fail --silent --connect-timeout 1 --max-time 1 http://127.0.0.1:7777/__ci/health > /dev/null; then
    fixture_ready=true
    break
  fi
  if ! kill -0 "$fixture_pid" 2>/dev/null; then
    echo 'Guest bootstrap fixture stopped before readiness' >&2
    exit 1
  fi
  sleep 1
done
if [[ "$fixture_ready" != true ]]; then echo 'Guest bootstrap fixture readiness timed out' >&2; exit 1; fi
node node_modules/react-native/cli.js start --reset-cache > ci-logs/metro.log 2>&1 &
metro_pid=$!
ready=false
metro_deadline=$((SECONDS + 180))
while ((SECONDS < metro_deadline)); do
  if curl --fail --silent --connect-timeout 1 --max-time 2 http://127.0.0.1:8081/status | grep -q 'packager-status:running'; then
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
echo 'Prebuild the Android development bundle before starting UI assertions'
curl --fail --silent --show-error --connect-timeout 5 --max-time 300 \
  'http://127.0.0.1:8081/index.bundle?platform=android&dev=true&lazy=true&minify=false&app=com.mindymobile&modulesOnly=false&runModule=true&excludeSource=true&sourcePaths=url-server' \
  --output /dev/null --write-out 'Bundle ready: %{size_download} bytes in %{time_total}s\n'
adb logcat -c
adb logcat '*:W' > ci-logs/logcat.log 2>&1 &
logcat_pid=$!
maestro --version
npm run test:e2e -- --include-tags ci --format junit --output ci-e2e/report.xml \
  --debug-output ci-e2e/debug --test-output-dir ci-e2e/results 2>&1 | tee ci-logs/maestro.log
python3 - <<'PY'
import xml.etree.ElementTree as ET
import json
from pathlib import Path
root = ET.parse('ci-e2e/report.xml').getroot()
cases = list(root.iter('testcase'))
if len(cases) != 14 or any(list(case.iter('failure')) or list(case.iter('error')) or list(case.iter('skipped')) for case in cases):
    raise SystemExit(f'Expected 14 successful CI flows; report contains {len(cases)} cases')
print('All 14 CI flows passed')
requests = [json.loads(line) for line in Path('ci-e2e/preview-api.jsonl').read_text().splitlines()]
if not requests or any(request['unexpected'] for request in requests):
    raise SystemExit('Expected only guest bootstrap requests; inspect preview-api.jsonl')
print(f'Guest bootstrap requests: {len(requests)}; no business API requests')
PY
