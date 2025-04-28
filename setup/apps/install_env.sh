#!/bin/bash
# install_env.sh
# Purpose: Generate .env files for all projects
# Location: setup/containers/apps

echo "Generating .env files..."
set -e

# Base path from the script location
BASE_DIR="../.."

# Definitions for all projects and their .env contents
declare -A ENV_CONTENTS=(
  ["kc-back-end/kc-api-gateway"]="NODE_HOST=localhost\nNODE_PORT=3001\nNODE_ENV=development"
  ["kc-back-end/kc-protected-m2m-service"]="NODE_HOST=localhost\nNODE_PORT=3004\nNODE_ENV=development"
  ["kc-back-end/kc-protected-sa-service"]="NODE_HOST=localhost\nNODE_PORT=3005\nNODE_ENV=development"
  ["kc-back-end/kc-protected-service"]="NODE_HOST=localhost\nNODE_PORT=3002\nNODE_ENV=development"
  ["kc-back-end/kc-unprotected-service"]="NODE_HOST=localhost\nNODE_PORT=3003\nNODE_ENV=development"
  ["kc-front-end/kc-react"]="PORT=5000\nHOST=localhost"
)

echo "Generating .env files (overwriting if exists)..."

for PROJECT_PATH in "${!ENV_CONTENTS[@]}"; do
  TARGET_DIR="${BASE_DIR}/${PROJECT_PATH}"
  TARGET_FILE="${TARGET_DIR}/.env"

  mkdir -p "$TARGET_DIR"  # Ensure directory exists
  echo -e "${ENV_CONTENTS[$PROJECT_PATH]}" > "$TARGET_FILE"
  echo "Created/Updated: $TARGET_FILE"
done

echo "All .env files created successfully."
