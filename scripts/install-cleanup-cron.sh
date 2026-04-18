#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CRON_SOURCE="$PROJECT_ROOT/scripts/nexnamecard-cleanup.cron"
CRON_TARGET="/etc/cron.d/nexnamecard-cleanup"
LOG_FILE="/var/log/nexnamecard-cleanup.log"

if [ ! -f "$CRON_SOURCE" ]; then
  echo "Missing cron template: $CRON_SOURCE" >&2
  exit 1
fi

install -m 0644 "$CRON_SOURCE" "$CRON_TARGET"
touch "$LOG_FILE"
chmod 0644 "$LOG_FILE"

if command -v systemctl >/dev/null 2>&1; then
  systemctl reload cron 2>/dev/null || systemctl restart cron 2>/dev/null || true
fi

echo "Installed $CRON_TARGET"
echo "Log file: $LOG_FILE"
