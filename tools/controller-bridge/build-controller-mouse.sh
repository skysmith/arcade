#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE="${SCRIPT_DIR}/controller-mouse.m"
OUTPUT="${SCRIPT_DIR}/controller-mouse.bin"
MIN_OS="${MACOSX_DEPLOYMENT_TARGET:-10.11}"

ARCHES=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --output|-o)
      OUTPUT="$2"
      shift 2
      ;;
    --arch)
      ARCHES+=("$2")
      shift 2
      ;;
    *)
      echo "Unknown option: $1" >&2
      echo "Usage: $0 [--output /path/to/controller-mouse.bin] [--arch x86_64] [--arch arm64]" >&2
      exit 2
      ;;
  esac
done

if [[ ! -f "${SOURCE}" ]]; then
  echo "Missing source: ${SOURCE}" >&2
  exit 1
fi

CMD=(
  clang
  -fobjc-arc
  -Wall
  -Wextra
  -mmacosx-version-min="${MIN_OS}"
)

if [[ ${#ARCHES[@]} -gt 0 ]]; then
  for arch in "${ARCHES[@]}"; do
    CMD+=(-arch "${arch}")
  done
fi

CMD+=(
  -framework Foundation
  -framework AppKit
  -framework ApplicationServices
  -framework IOKit
  "${SOURCE}"
  -o "${OUTPUT}"
)

printf 'Building controller-mouse -> %s\n' "${OUTPUT}"
"${CMD[@]}"
