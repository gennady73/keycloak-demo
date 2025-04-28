#!/bin/bash
# install_deps.sh
# Purpose: Install Node.js dependencies for all projects
# Location: setup/containers/apps

echo "Installing project dependencies..."

BASE_DIR="../.."

# Remember the original directory (where script started)
ORIGINAL_DIR="$(pwd)"

echo "Installing dependencies..."

cd "$BASE_DIR/kc-back-end/kc-api-gateway" && echo "Installing kc-api-gateway..." && npm install
cd "$BASE_DIR/kc-back-end/kc-protected-m2m-service" && echo "Installing kc-protected-m2m-service..." && npm install
cd "$BASE_DIR/kc-back-end/kc-protected-sa-service" && echo "Installing kc-protected-sa-service..." && npm install
cd "$BASE_DIR/kc-back-end/kc-protected-service" && echo "Installing kc-protected-service..." && npm install
cd "$BASE_DIR/kc-back-end/kc-unprotected-service" && echo "Installing kc-unprotected-service..." && npm install
cd "$BASE_DIR/kc-front-end/kc-react" && echo "Installing kc-react..." && npm install

# Return to the original script directory
cd "$ORIGINAL_DIR"

echo "All dependencies installed."