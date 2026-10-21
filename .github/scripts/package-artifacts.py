"""Validate CI products and attach revision/checksums; never package env or keys."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import sys
import tarfile

platform = sys.argv[1]
target = Path('ci-artifacts')
target.mkdir(exist_ok=True)
if platform == 'android':
    for source in (
        Path('android/app/build/outputs/apk/release/app-release.apk'),
        Path('android/app/build/outputs/bundle/release/app-release.aab'),
    ):
        if not source.is_file() or source.stat().st_size == 0:
            raise SystemExit(f'Missing or empty product: {source}')
        shutil.copy2(source, target / source.name)
elif platform == 'ios':
    app = Path('build/ios/Build/Products/Release-iphonesimulator/MindyMobile.app')
    if not (app / 'MindyMobile').is_file() or (app / 'MindyMobile').stat().st_size == 0:
        raise SystemExit('Missing or empty iOS Simulator executable')
    with tarfile.open(target / 'MindyMobile-Simulator.tar.gz', 'w:gz') as archive:
        archive.add(app, arcname=app.name)
else:
    raise SystemExit('Expected android or ios')
products = sorted(target.iterdir())
(target / 'SHA256SUMS').write_text(''.join(
    f'{hashlib.sha256(product.read_bytes()).hexdigest()}  {product.name}\n'
    for product in products
))
(target / 'revision.json').write_text(json.dumps({
    'revision': os.environ['GITHUB_SHA'],
    'run': os.environ['GITHUB_RUN_ID'],
    'attempt': os.environ['GITHUB_RUN_ATTEMPT'],
    'platform': platform,
    'purpose': 'CI debug signing' if platform == 'android' else 'unsigned iOS Simulator',
}, indent=2) + '\n')

