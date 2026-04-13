#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
HELPER="${ROOT_DIR}/tools/controller-bridge/controller-mouse.sh"

exec "${HELPER}" --tetris --name "8BitDo"
