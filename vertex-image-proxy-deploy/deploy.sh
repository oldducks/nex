#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-nexsolution}"
SERVICE_NAME="${SERVICE_NAME:-vertex-image-proxy}"
REGION="${REGION:-asia-southeast1}"
IMAGE_REGION="${IMAGE_REGION:-global}"
IMAGE_MODEL="${IMAGE_MODEL:-imagen-3.0-generate-002}"
IMAGE_EDIT_MODEL="${IMAGE_EDIT_MODEL:-gemini-2.5-flash-image}"
IMAGE_EDIT_REGION="${IMAGE_EDIT_REGION:-asia-southeast1}"
VIDEO_REGION="${VIDEO_REGION:-us-central1}"
VIDEO_MODEL="${VIDEO_MODEL:-veo-3.1-fast-generate-001}"
ALLOW_UNAUTHENTICATED="${ALLOW_UNAUTHENTICATED:-true}"
MEMORY="${MEMORY:-1Gi}"
CPU="${CPU:-1}"
TIMEOUT="${TIMEOUT:-300}"
MAX_INSTANCES="${MAX_INSTANCES:-5}"
PROXY_SECRET="${PROXY_SECRET:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if ! command -v gcloud >/dev/null 2>&1; then
  echo "gcloud is required but not installed." >&2
  exit 1
fi

if [[ -z "$PROXY_SECRET" ]]; then
  echo "PROXY_SECRET is required. Example:" >&2
  echo "PROXY_SECRET='your-secret' ./deploy.sh" >&2
  exit 1
fi

GCLOUD_ARGS=(
  run deploy "$SERVICE_NAME"
  --source .
  --project "$PROJECT_ID"
  --region "$REGION"
  --platform managed
  --clear-base-image
  --memory "$MEMORY"
  --cpu "$CPU"
  --timeout "$TIMEOUT"
  --max-instances "$MAX_INSTANCES"
  --set-env-vars "GOOGLE_CLOUD_PROJECT=$PROJECT_ID"
  --set-env-vars "VERTEX_REGION=$IMAGE_REGION"
  --set-env-vars "VERTEX_IMAGE_MODEL=$IMAGE_MODEL"
  --set-env-vars "VERTEX_IMAGE_EDIT_MODEL=$IMAGE_EDIT_MODEL"
  --set-env-vars "VERTEX_IMAGE_EDIT_REGION=$IMAGE_EDIT_REGION"
  --set-env-vars "VERTEX_VIDEO_REGION=$VIDEO_REGION"
  --set-env-vars "VERTEX_VIDEO_MODEL=$VIDEO_MODEL"
  --set-env-vars "NEX_VERTEX_PROXY_SECRET=$PROXY_SECRET"
)

if [[ "$ALLOW_UNAUTHENTICATED" == "true" ]]; then
  GCLOUD_ARGS+=(--allow-unauthenticated)
else
  GCLOUD_ARGS+=(--no-allow-unauthenticated)
fi

echo "Deploying Cloud Run service..."
printf '  %q' gcloud "${GCLOUD_ARGS[@]}"
printf '\n'

gcloud "${GCLOUD_ARGS[@]}"

echo
echo "Deployment completed."
echo "Suggested backend/admin settings:"
echo "  Provider URL   : https://${SERVICE_NAME}-$(gcloud run services describe "$SERVICE_NAME" --project "$PROJECT_ID" --region "$REGION" --format='value(status.url)' | sed 's#https://##')"
echo "  Image region   : $IMAGE_REGION"
echo "  Image model    : $IMAGE_MODEL"
echo "  Image edit model fallback in proxy : $IMAGE_EDIT_MODEL"
echo "  Image edit region : $IMAGE_EDIT_REGION"
echo "  Video region   : $VIDEO_REGION"
echo "  Video model    : $VIDEO_MODEL"
