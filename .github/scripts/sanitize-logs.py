"""Redact credential-shaped values before uploading native/test diagnostics."""
from pathlib import Path
import re

for folder in ('ci-logs', 'ci-e2e'):
    for path in Path(folder).rglob('*'):
        if not path.is_file() or path.suffix not in ('.log', '.txt', '.json', '.xml', '.html'):
            continue
        text = path.read_text(errors='replace')
        text = re.sub(r'(?im)((?:authorization|cookie|set-cookie)\s*[:=]\s*)[^\r\n]+', r'\1[REDACTED]', text)
        text = re.sub(r'(?i)(bearer\s+)[a-z0-9._~+/=-]+', r'\1[REDACTED]', text)
        text = re.sub(r'(?i)((?:password|access_token|refresh_token|api_key)\s*["\s]*[:=]\s*)[^\s,;}]+', r'\1[REDACTED]', text)
        path.write_text(text)
