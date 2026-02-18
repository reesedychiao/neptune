#!/usr/bin/env bash
set -euo pipefail

echo "Installing k3s..."
curl -sfL https://get.k3s.io | sh -

echo "Waiting for node to register with the API..."
for _ in {1..60}; do
  if sudo k3s kubectl get nodes --no-headers 2>/dev/null | grep -q .; then
    break
  fi
  sleep 2
done

if ! sudo k3s kubectl get nodes --no-headers 2>/dev/null | grep -q .; then
  echo "Timed out waiting for a node to register." >&2
  exit 1
fi

echo "Waiting for node to be Ready..."
sudo k3s kubectl wait --for=condition=Ready node --all --timeout=180s

echo "Enabling kubeconfig for current user..."
mkdir -p "$HOME/.kube"
sudo k3s kubectl config view --raw > "$HOME/.kube/config"
chmod 600 "$HOME/.kube/config"

echo "k3s install complete."
