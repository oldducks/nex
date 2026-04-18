#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups"
UPLOADS_DIR="$PROJECT_ROOT/uploads"

BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
TEMP_RETENTION_DAYS="${TEMP_RETENTION_DAYS:-2}"
IMAGE_PRUNE_UNTIL="${IMAGE_PRUNE_UNTIL:-168h}"
BUILDER_PRUNE_UNTIL="${BUILDER_PRUNE_UNTIL:-168h}"
CONTAINER_PRUNE_UNTIL="${CONTAINER_PRUNE_UNTIL:-168h}"

log() {
  printf '[cleanup] %s\n' "$1"
}

run_if_command_exists() {
  local command_name="$1"
  shift

  if command -v "$command_name" >/dev/null 2>&1; then
    "$@"
  else
    log "Skipping missing command: $command_name"
  fi
}

log "Starting safe cleanup"
log "Project root: $PROJECT_ROOT"
log "Policies: backups>${BACKUP_RETENTION_DAYS}d temp>${TEMP_RETENTION_DAYS}d image_until=${IMAGE_PRUNE_UNTIL} builder_until=${BUILDER_PRUNE_UNTIL} container_until=${CONTAINER_PRUNE_UNTIL}"

if [ -d "$BACKUP_DIR" ]; then
  log "Removing expired SQL and uploads backups"
  find "$BACKUP_DIR" -type f \( -name "*.sql" -o -name "*.tar.gz" \) -mtime +"$BACKUP_RETENTION_DAYS" -print -delete
else
  log "Backups directory not found, skipping"
fi

if [ -d "$UPLOADS_DIR/temp" ]; then
  log "Removing expired temp upload files"
  find "$UPLOADS_DIR/temp" -mindepth 1 -mtime +"$TEMP_RETENTION_DAYS" -print -delete
  find "$UPLOADS_DIR/temp" -type d -empty -delete
else
  log "Temp uploads directory not found, skipping"
fi

if command -v docker >/dev/null 2>&1; then
  log "Docker disk usage before cleanup"
  docker system df || true

  # Safe: removes stopped containers only, and only when they have been unused long enough.
  log "Pruning stopped Docker containers older than $CONTAINER_PRUNE_UNTIL"
  docker container prune -f --filter "until=$CONTAINER_PRUNE_UNTIL" || true

  # Safe: removes only dangling images that are not referenced by running containers.
  log "Pruning dangling Docker images older than $IMAGE_PRUNE_UNTIL"
  docker image prune -f --filter "until=$IMAGE_PRUNE_UNTIL" || true

  # Safe for running apps: removes older unused build cache only, not running containers or volumes.
  log "Pruning unused Docker build cache older than $BUILDER_PRUNE_UNTIL"
  timeout 15m docker builder prune -f --filter "until=$BUILDER_PRUNE_UNTIL" || true

  log "Docker disk usage after cleanup"
  docker system df || true
else
  log "Docker is not installed, skipping Docker cleanup"
fi

log "Safe cleanup completed"
