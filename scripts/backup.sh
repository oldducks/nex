#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"
TIMESTAMP="$(date +"%Y-%m-%d_%H%M%S")"
BACKUP_DIR="$PROJECT_ROOT/backups"
DB_BACKUP_DIR="$BACKUP_DIR/db"
UPLOADS_BACKUP_DIR="$BACKUP_DIR/uploads"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

mkdir -p "$DB_BACKUP_DIR" "$UPLOADS_BACKUP_DIR"

DB_FILE="$DB_BACKUP_DIR/namecard_platform_${TIMESTAMP}.sql"
UPLOADS_FILE="$UPLOADS_BACKUP_DIR/uploads_${TIMESTAMP}.tar.gz"

echo "[backup] Starting backup at $TIMESTAMP"

echo "[backup] Dumping PostgreSQL to $DB_FILE"
docker compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U admin namecard_platform > "$DB_FILE"

echo "[backup] Archiving uploads to $UPLOADS_FILE"
tar -czf "$UPLOADS_FILE" -C "$PROJECT_ROOT" uploads

echo "[backup] Applying retention policy ($RETENTION_DAYS days)"
find "$DB_BACKUP_DIR" -type f -name "*.sql" -mtime +"$RETENTION_DAYS" -delete
find "$UPLOADS_BACKUP_DIR" -type f -name "*.tar.gz" -mtime +"$RETENTION_DAYS" -delete

echo "[backup] Completed successfully"
echo "[backup] DB: $DB_FILE"
echo "[backup] Uploads: $UPLOADS_FILE"
