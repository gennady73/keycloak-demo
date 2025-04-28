#!/bin/bash
# Script to setup environment, check environment, and install dependencies
# Located at: setup/containers/apps/install_all.sh

echo "Starting full setup process..."

# Switch to the script directory
cd "$(dirname "$0")"

echo "Running install_env.sh..."
bash install_env.sh

echo "Running check_env.sh..."
bash check_env.sh

echo "Running install_deps.sh..."
bash install_deps.sh

echo
echo "Full setup completed."
