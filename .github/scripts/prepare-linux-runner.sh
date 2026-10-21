#!/usr/bin/env bash
set -euo pipefail
if [[ "${GITHUB_ACTIONS:-}" != true || "${RUNNER_OS:-}" != Linux || "${RUNNER_ENVIRONMENT:-}" != github-hosted ]]; then
  echo 'Disk preparation is restricted to disposable GitHub-hosted Linux runners' >&2
  exit 1
fi
mkdir -p ci-logs
exec > >(tee ci-logs/runner-disk.log) 2>&1
df -h /
# These preinstalled toolchains are not used by the Android jobs.
sudo rm -rf -- /usr/share/dotnet /usr/share/swift /usr/local/share/boost \
  /usr/local/.ghcup /opt/ghc /opt/hostedtoolcache/CodeQL
df -h /
