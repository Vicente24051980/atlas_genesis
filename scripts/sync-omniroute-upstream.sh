#!/usr/bin/env bash
set -euo pipefail

UPSTREAM_URL="https://github.com/artzy/OmniRoute.git"
UPSTREAM_COMMIT="45ca8ead4108d36b4f7179cd1606c4cff53d5f5a"
DEST="${1:-.vendor/omniroute}"

if [[ ! -d "$DEST/.git" ]]; then
  git clone "$UPSTREAM_URL" "$DEST"
fi

git -C "$DEST" remote set-url origin "$UPSTREAM_URL"
git -C "$DEST" fetch --tags --prune origin
git -C "$DEST" checkout --detach "$UPSTREAM_COMMIT"

ACTUAL="$(git -C "$DEST" rev-parse HEAD)"
if [[ "$ACTUAL" != "$UPSTREAM_COMMIT" ]]; then
  echo "ERROR: expected $UPSTREAM_COMMIT but checked out $ACTUAL" >&2
  exit 1
fi

printf 'OmniRoute pinned snapshot ready at %s (%s)\n' "$DEST" "$ACTUAL"
