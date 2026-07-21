#!/usr/bin/env bash
# Compatibility entrypoint. Semantic extraction must use the central wrapper.

set -euo pipefail

TARGET="."
for arg in "$@"; do
  case "$arg" in
    --force) ;;
    -h|--help)
      echo "Usage: $0 [--force]"
      exit 0
      ;;
    *) TARGET="$arg" ;;
  esac
done

powershell.exe -ExecutionPolicy Bypass -File D:/Invoke-CorrenthGraphify.ps1 -Path "$TARGET" -Mode semantic
