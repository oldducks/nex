#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <path_to_db_backup.sql>"
  exit 1
fi

BACKUP_FILE="$1"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "[restore] Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "[restore] Restoring database from $BACKUP_FILE"

docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U admin -d namecard_platform < "$BACKUP_FILE"

echo "[restore] Completed successfully"
