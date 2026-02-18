#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/neptune-backend"

IMAGE_NAME="neptune-backend:latest"

"$ROOT_DIR/scripts/build_image.sh" "$IMAGE_NAME" "$BACKEND_DIR"
