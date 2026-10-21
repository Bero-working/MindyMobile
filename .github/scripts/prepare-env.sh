#!/usr/bin/env bash
set -euo pipefail
mode="${1:?Expected development or production}"
case "$mode" in development|production) ;; *) exit 2 ;; esac
export APP_ENV="$mode"
export API_URL="${CI_API_URL:-https://example.invalid/api/v1}"
export APP_ORIGIN="${CI_APP_ORIGIN:-}"
if [[ "$mode" == development ]]; then
  export API_URL=https://example.invalid/api/v1
  export APP_ORIGIN=''
fi
python3 - <<'PY'
import os
from pathlib import Path
values = {key: os.environ[key] for key in ('APP_ENV', 'API_URL', 'APP_ORIGIN')}
values['DEBUG_MODE'] = 'false'
if any(any(c in value for c in '\r\n\x00') for value in values.values()):
    raise SystemExit('CI environment values must be single-line')
if not values['API_URL'].startswith(('https://', 'http://')):
    raise SystemExit('CI_API_URL must be an absolute HTTP(S) URL')
Path('.env.ci').write_text(''.join(f'{key}={value}\n' for key, value in values.items()))
PY
printf 'ENVFILE=%s/.env.ci\n' "$GITHUB_WORKSPACE" >> "$GITHUB_ENV"

