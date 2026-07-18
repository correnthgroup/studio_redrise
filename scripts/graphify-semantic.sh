#!/usr/bin/env bash
# scripts/graphify-semantic.sh
#
# Run a graphify semantic pass on ./docs using the OpenRouter OpenAI-compatible
# backend. The API key is read from .env.local and exported only into the
# child process environment - it is never echoed, never written to a log file,
# and never appears on the command line (so it is not visible in `ps`/`wmic`).
#
# Usage:
#   ./scripts/graphify-semantic.sh            # extract ./docs
#   ./scripts/graphify-semantic.sh ./some/dir # extract a different folder
#   ./scripts/graphify-semantic.sh --force    # overwrite existing graph

set -euo pipefail

# --- Locate .env.local without printing its contents -----------------------
ENV_FILE=".env.local"
if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: $ENV_FILE not found. Add OPENAI_API_KEY (or OPENROUTER_API_KEY) to .env.local." >&2
  exit 1
fi

# Pull OPENAI_API_KEY / OPENAI_BASE_URL / OPENAI_MODEL from .env.local
# without sourcing the whole file (keeps unrelated vars out of the env).
get_env() {
  local key="$1"
  # strip optional "export ", allow optional quotes, ignore comments
  awk -F= -v k="$key" '
    $0 ~ "^[[:space:]]*#"? { next }
    tolower($1) == tolower(k) {
      val = substr($0, index($0, "=") + 1)
      sub(/^[[:space:]]+/, "", val)
      sub(/[[:space:]]+$/, "", val)
      gsub(/^["'\'']|["'\'']$/, "", val)
      print val
      exit
    }
  ' "$ENV_FILE"
}

OPENAI_API_KEY_VAL="$(get_env OPENAI_API_KEY)"
[ -z "$OPENAI_API_KEY_VAL" ] && OPENAI_API_KEY_VAL="$(get_env OPENROUTER_API_KEY)"
OPENAI_BASE_URL_VAL="$(get_env OPENAI_BASE_URL)"
[ -z "$OPENAI_BASE_URL_VAL" ] && OPENAI_BASE_URL_VAL="https://openrouter.ai/api/v1"
OPENAI_MODEL_VAL="$(get_env OPENAI_MODEL)"
[ -z "$OPENAI_MODEL_VAL" ] && OPENAI_MODEL_VAL="openai/gpt-4.1-mini"

if [ -z "$OPENAI_API_KEY_VAL" ]; then
  echo "ERROR: OPENAI_API_KEY (or OPENROUTER_API_KEY) is empty in $ENV_FILE." >&2
  exit 1
fi

# --- Build args -------------------------------------------------------------
TARGET="./docs"
EXTRA_ARGS=()
for arg in "$@"; do
  case "$arg" in
    -h|--help)
      echo "Usage: $0 [target-dir] [--force]"
      exit 0
      ;;
    --force) EXTRA_ARGS+=("--force") ;;
    -*)      EXTRA_ARGS+=("$arg") ;;
    *)       TARGET="$arg" ;;
  esac
done

# --- Run graphify with the key in the child env only ------------------------
# Unset any inherited values first so we don't accidentally use a stale key.
unset OPENAI_API_KEY OPENAI_BASE_URL OPENAI_MODEL OPENROUTER_API_KEY 2>/dev/null || true

echo "Running semantic pass on $TARGET via $OPENAI_BASE_URL_VAL (model: $OPENAI_MODEL_VAL)"

OPENAI_API_KEY="$OPENAI_API_KEY_VAL" \
OPENAI_BASE_URL="$OPENAI_BASE_URL_VAL" \
OPENAI_MODEL="$OPENAI_MODEL_VAL" \
  python -m graphify extract "$TARGET" --backend openai "${EXTRA_ARGS[@]}"

# Wipe the local variable after use.
unset OPENAI_API_KEY_VAL OPENAI_BASE_URL_VAL OPENAI_MODEL_VAL

echo "Done. See graphify-out/GRAPH_REPORT.md for the updated report."
