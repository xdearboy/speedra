#!/usr/bin/env bash
set -euo pipefail

REPO="xdearboy/speedra"
BINARY_URL="https://github.com/${REPO}/releases/latest/download/speedra-linux-x64"
TMP_BIN="$(mktemp /tmp/speedra.XXXXXX)"
trap 'rm -f "$TMP_BIN"' EXIT

if [[ "${OSTYPE:-}" != linux* ]]; then
  echo "This runner supports Linux only."
  exit 1
fi

if [[ "$(uname -m)" != "x86_64" ]]; then
  echo "This runner supports Linux x64 (x86_64) only."
  exit 1
fi

curl -fsSL "$BINARY_URL" -o "$TMP_BIN"
chmod +x "$TMP_BIN"
exec "$TMP_BIN"
