#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"

if [ "$#" -gt 0 ]; then
  SERVICES=("$@")
else
  SERVICES=("api" "web")
fi

printf '[redeploy] Rebuilding services: %s\n' "${SERVICES[*]}"
docker compose -f "$COMPOSE_FILE" up -d --build --no-deps "${SERVICES[@]}"

printf '[redeploy] Running safe post-deploy cleanup\n'
IMAGE_PRUNE_UNTIL="${IMAGE_PRUNE_UNTIL:-24h}" \
BUILDER_PRUNE_UNTIL="${BUILDER_PRUNE_UNTIL:-24h}" \
CONTAINER_PRUNE_UNTIL="${CONTAINER_PRUNE_UNTIL:-24h}" \
"$PROJECT_ROOT/scripts/cleanup.sh"

printf '[redeploy] Current container status\n'
docker compose -f "$COMPOSE_FILE" ps
