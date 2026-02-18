#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 || $# -gt 3 ]]; then
  echo "Usage: $0 <image_name> <context_dir> [dockerfile]" >&2
  exit 1
fi

IMAGE_NAME="$1"
CONTEXT_DIR="$2"
DOCKERFILE="${3:-}"

has_cmd() {
  command -v "$1" >/dev/null 2>&1
}

build_args=()
if [[ -n "$DOCKERFILE" ]]; then
  build_args=(-f "$DOCKERFILE")
fi

import_to_k3s() {
  local archive="$1"

  if ! has_cmd k3s; then
    return 0
  fi

  echo "Importing $IMAGE_NAME into k3s containerd..."
  if k3s ctr images import "$archive" >/dev/null 2>&1; then
    return 0
  fi

  if has_cmd sudo; then
    sudo k3s ctr images import "$archive"
    return 0
  fi

  echo "Unable to import image into k3s containerd; run as a user with access or use sudo." >&2
  return 1
}

build_with_docker() {
  local archive

  docker build "${build_args[@]}" -t "$IMAGE_NAME" "$CONTEXT_DIR"
  archive="$(mktemp "/tmp/${IMAGE_NAME//[\/:]/_}.XXXXXX.tar")"
  trap 'rm -f "$archive"' RETURN
  docker save -o "$archive" "$IMAGE_NAME"
  import_to_k3s "$archive"
}

build_with_podman() {
  local archive

  podman build "${build_args[@]}" -t "$IMAGE_NAME" "$CONTEXT_DIR"
  archive="$(mktemp "/tmp/${IMAGE_NAME//[\/:]/_}.XXXXXX.tar")"
  trap 'rm -f "$archive"' RETURN
  podman save -o "$archive" "$IMAGE_NAME"
  import_to_k3s "$archive"
}

build_with_nerdctl() {
  nerdctl --namespace k8s.io build "${build_args[@]}" -t "$IMAGE_NAME" "$CONTEXT_DIR"
}

if has_cmd nerdctl; then
  build_with_nerdctl
elif has_cmd docker; then
  build_with_docker
elif has_cmd podman; then
  build_with_podman
else
  echo "No supported container builder found (tried: nerdctl, docker, podman)." >&2
  echo "Install one of them, then rerun this script." >&2
  exit 127
fi

echo "Built $IMAGE_NAME"
