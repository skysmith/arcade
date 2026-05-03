#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
HELPER="${ROOT_DIR}/tools/controller-bridge/controller-mouse.sh"

exec "${HELPER}" \
  --keyboard \
  --name "8BitDo" \
  --left-key 123 \
  --right-key 124 \
  --primary-key 49 \
  --secondary-key 56 \
  --pause-key 35 \
  --restart-key 15
