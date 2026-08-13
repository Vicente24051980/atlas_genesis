#!/usr/bin/env bash
set -euo pipefail

KRONOS_REPO="https://github.com/shiyu-coder/Kronos.git"
KRONOS_COMMIT="67b630e67f6a18c9e9be918d9b4337c960db1e9a"
KRONOS_DIR="${KRONOS_SOURCE_PATH:-/opt/kronos}"

if [[ -d "${KRONOS_DIR}/.git" ]]; then
  git -C "${KRONOS_DIR}" fetch --depth 1 origin "${KRONOS_COMMIT}"
else
  mkdir -p "$(dirname "${KRONOS_DIR}")"
  git clone --no-checkout "${KRONOS_REPO}" "${KRONOS_DIR}"
fi

git -C "${KRONOS_DIR}" checkout --detach "${KRONOS_COMMIT}"

echo "Kronos source pinned at ${KRONOS_COMMIT} in ${KRONOS_DIR}"
echo "Install optional runtime with: pip install -r api/requirements-kronos.txt"
echo "Enable only after validation with: ATLAS_KRONOS_ENABLED=true"
