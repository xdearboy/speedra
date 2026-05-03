#!/usr/bin/env bash
set -euo pipefail

REPO="xdearboy/speedra"
BINARY_NAME="speedra-linux-x64"
INSTALL_PATH="${INSTALL_PATH:-/usr/local/bin/speedra}"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

if [[ "${OSTYPE:-}" != linux* ]]; then
  echo "This installer currently supports Linux only."
  exit 1
fi

if [[ "$(uname -m)" != "x86_64" ]]; then
  echo "This installer currently supports Linux x64 (x86_64) only."
  exit 1
fi

URL="https://github.com/${REPO}/releases/latest/download/${BINARY_NAME}"
echo "Downloading ${URL}"
curl -fsSL "$URL" -o "${TMP_DIR}/speedra"
chmod +x "${TMP_DIR}/speedra"

if [[ -w "$(dirname "$INSTALL_PATH")" ]]; then
  mv "${TMP_DIR}/speedra" "$INSTALL_PATH"
else
  sudo mv "${TMP_DIR}/speedra" "$INSTALL_PATH"
fi

echo "Installed: ${INSTALL_PATH}"
echo "Run: speedra --version"
