#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://nexsolution.cloud}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

pass_count=0
fail_count=0

ok() {
  printf '[OK] %s\n' "$1"
  pass_count=$((pass_count + 1))
}

fail() {
  printf '[FAIL] %s\n' "$1"
  fail_count=$((fail_count + 1))
}

check_http() {
  local path="$1"
  local url="${BASE_URL}${path}"
  local code
  code="$(curl -sS -o /dev/null -w "%{http_code}" "$url" || true)"
  if [[ "$code" =~ ^2|3 ]]; then
    ok "HTTP ${code} ${path}"
  else
    fail "HTTP ${code:-ERR} ${path}"
  fi
}

check_file() {
  local rel="$1"
  local abs="${PROJECT_ROOT}/frontend/public/${rel}"
  if [ -f "$abs" ]; then
    ok "FILE ${rel}"
  else
    fail "MISSING FILE ${rel}"
  fi
}

printf '== NEX Predeploy Critical Check ==\n'
printf 'Base URL: %s\n' "$BASE_URL"

printf '\n-- Route checks --\n'
check_http "/"
check_http "/start"
check_http "/nex-control-your-future-preview"
check_http "/what-is-nex-preview"
check_http "/nex-digital-asset-partner-preview"
check_http "/enterprise-mos-preview"
check_http "/login"
check_http "/forgot-password"
check_http "/reset-password"

printf '\n-- Asset checks (filesystem) --\n'
check_file "nex-control-your-future-preview/1.jpg"
check_file "nex-control-your-future-preview/preview-video.mp4"
check_file "what-is-nex-preview/1.jpg"
check_file "what-is-nex-preview/preview-video-v2.mp4"
check_file "nex-digital-asset-partner-preview/1.jpg"
check_file "nex-digital-asset-partner-preview/preview-video.mp4"
check_file "enterprise-mos-preview/1.jpg"
check_file "enterprise-mos-preview/preview-video.mp4"

printf '\nSummary: %d passed, %d failed\n' "$pass_count" "$fail_count"
if [ "$fail_count" -gt 0 ]; then
  exit 1
fi

