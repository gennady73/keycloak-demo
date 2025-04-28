#!/bin/bash
# check_env.sh
# Purpose: Check existence of .env files
# Location: setup/containers/apps

echo "Checking .env files..."

BASE_DIR="../../"

PROJECTS=(
  "kc-back-end/kc-api-gateway"
  "kc-back-end/kc-protected-m2m-service"
  "kc-back-end/kc-protected-sa-service"
  "kc-back-end/kc-protected-service"
  "kc-back-end/kc-unprotected-service"
  "kc-front-end/kc-react"
)

echo
echo "====================================="
echo "Checking .env files in the project..."
echo "====================================="
echo

for proj in "${PROJECTS[@]}"; do
  if [[ -f "${BASE_DIR}${proj}/.env" ]]; then
    echo "[OK]     Found: ${proj}/.env"
  else
    echo "[MISSING] Missing: ${proj}/.env"
  fi
done

echo
echo "Check completed."
