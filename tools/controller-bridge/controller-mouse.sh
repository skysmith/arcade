#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE="${SCRIPT_DIR}/controller-mouse.m"
BUILD_SCRIPT="${SCRIPT_DIR}/build-controller-mouse.sh"
BINARY="${SCRIPT_DIR}/controller-mouse.bin"

if [[ ! -x "${BINARY}" || "${BINARY}" -ot "${SOURCE}" || "${BINARY}" -ot "${BUILD_SCRIPT}" ]]; then
  "${BUILD_SCRIPT}" --output "${BINARY}"
fi

exec "${BINARY}" "$@"
